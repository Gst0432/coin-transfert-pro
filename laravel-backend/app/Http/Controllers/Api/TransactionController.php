<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\PaymentService;
use App\Services\ExchangeRateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TransactionController extends Controller
{
    protected $paymentService;
    protected $exchangeRateService;

    public function __construct(PaymentService $paymentService, ExchangeRateService $exchangeRateService)
    {
        $this->paymentService = $paymentService;
        $this->exchangeRateService = $exchangeRateService;
    }

    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $status = $request->get('status');
        $type = $request->get('type');

        $query = Transaction::query();

        if (!$request->user()->hasRole('admin')) {
            $query->where('user_id', $request->user()->id);
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($type) {
            $query->where('transaction_type', $type);
        }

        $transactions = $query->with(['user.profile'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $transactions->items(),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total()
            ]
        ]);
    }

    public function show(Request $request, $id)
    {
        $query = Transaction::query();

        if (!$request->user()->hasRole('admin')) {
            $query->where('user_id', $request->user()->id);
        }

        $transaction = $query->with(['user.profile'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $transaction
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'transaction_type' => 'required|in:fcfa_to_usdt,usdt_to_fcfa',
            'amount_fcfa' => 'required|numeric|min:1000',
            'amount_usdt' => 'required|numeric|min:1',
            'exchange_rate' => 'required|numeric',
            'source_wallet' => 'required|array',
            'destination_wallet' => 'required|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Calculate fees
        $fees = $this->calculateFees($request->transaction_type, $request->amount_fcfa, $request->amount_usdt);

        $transaction = Transaction::create([
            'user_id' => $request->user()->id,
            'transaction_type' => $request->transaction_type,
            'amount_fcfa' => $request->amount_fcfa,
            'amount_usdt' => $request->amount_usdt,
            'exchange_rate' => $request->exchange_rate,
            'fees_fcfa' => $fees['fcfa'],
            'fees_usdt' => $fees['usdt'],
            'final_amount_fcfa' => $request->amount_fcfa + $fees['fcfa'],
            'final_amount_usdt' => $request->amount_usdt - $fees['usdt'],
            'source_wallet' => $request->source_wallet,
            'destination_wallet' => $request->destination_wallet,
            'status' => 'pending'
        ]);

        return response()->json([
            'success' => true,
            'data' => $transaction
        ]);
    }

    public function update(Request $request, $id)
    {
        if (!$request->user()->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $transaction = Transaction::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|in:pending,processing,completed,failed,cancelled',
            'admin_notes' => 'sometimes|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $transaction->update(array_merge(
            $request->only(['status', 'admin_notes']),
            ['processed_by' => $request->user()->id, 'processed_at' => now()]
        ));

        return response()->json([
            'success' => true,
            'data' => $transaction
        ]);
    }

    public function processPayment(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);

        if ($transaction->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        if ($transaction->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Transaction cannot be processed'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'payment_method' => 'required|in:moneroo,nowpayments'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $result = $this->paymentService->processPayment($transaction, $request->payment_method);
            
            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function calculateFees($transactionType, $amountFcfa, $amountUsdt)
    {
        $feeRate = 0.02; // 2% fee
        
        if ($transactionType === 'fcfa_to_usdt') {
            return [
                'fcfa' => $amountFcfa * $feeRate,
                'usdt' => 0
            ];
        } else {
            return [
                'fcfa' => 0,
                'usdt' => $amountUsdt * $feeRate
            ];
        }
    }
}