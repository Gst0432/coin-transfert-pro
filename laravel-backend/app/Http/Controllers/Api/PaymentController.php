<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function processMoneroo(Request $request)
    {
        $request->validate([
            'transaction_id' => 'required|uuid|exists:transactions,id'
        ]);

        try {
            $transaction = Transaction::findOrFail($request->transaction_id);
            
            if ($transaction->user_id !== $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $result = $this->paymentService->processPayment($transaction, 'moneroo');

            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            Log::error('Moneroo payment processing failed', [
                'transaction_id' => $request->transaction_id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function processNowPayments(Request $request)
    {
        $request->validate([
            'transaction_id' => 'required|uuid|exists:transactions,id'
        ]);

        try {
            $transaction = Transaction::findOrFail($request->transaction_id);
            
            if ($transaction->user_id !== $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $result = $this->paymentService->processPayment($transaction, 'nowpayments');

            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            Log::error('NOWPayments payment processing failed', [
                'transaction_id' => $request->transaction_id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function retryPayment(Request $request, Transaction $transaction)
    {
        $request->validate([
            'payment_method' => 'required|in:moneroo,nowpayments'
        ]);

        try {
            if ($transaction->user_id !== $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            if ($transaction->status !== 'failed' && $transaction->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaction cannot be retried'
                ], 400);
            }

            // Reset transaction status
            $transaction->update(['status' => 'pending']);

            $result = $this->paymentService->processPayment($transaction, $request->payment_method);

            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            Log::error('Payment retry failed', [
                'transaction_id' => $transaction->id,
                'payment_method' => $request->payment_method,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function monerooWebhook(Request $request)
    {
        try {
            $payload = $request->all();
            $signature = $request->header('X-Moneroo-Signature');

            if (!$this->paymentService->verifyMonerooWebhook($payload, $signature)) {
                return response()->json(['error' => 'Invalid signature'], 401);
            }

            $transaction = $this->paymentService->handleMonerooWebhook($payload);

            Log::info('Moneroo webhook processed successfully', [
                'transaction_id' => $transaction->id,
                'status' => $transaction->status
            ]);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Moneroo webhook processing failed', [
                'error' => $e->getMessage(),
                'payload' => $request->all()
            ]);

            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }

    public function nowpaymentsWebhook(Request $request)
    {
        try {
            $payload = $request->all();

            if (!$this->paymentService->verifyNowPaymentsWebhook($payload)) {
                return response()->json(['error' => 'Invalid webhook'], 401);
            }

            $transaction = $this->paymentService->handleNowPaymentsWebhook($payload);

            Log::info('NOWPayments webhook processed successfully', [
                'transaction_id' => $transaction->id,
                'status' => $transaction->status
            ]);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('NOWPayments webhook processing failed', [
                'error' => $e->getMessage(),
                'payload' => $request->all()
            ]);

            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }
}