<?php

namespace App\Services;

use App\Models\Transaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    private $monerooApiKey;
    private $monerooSecretKey;
    private $nowpaymentsApiKey;

    public function __construct()
    {
        $this->monerooApiKey = config('services.moneroo.api_key');
        $this->monerooSecretKey = config('services.moneroo.secret_key');
        $this->nowpaymentsApiKey = config('services.nowpayments.api_key');
    }

    public function processPayment(Transaction $transaction, string $paymentMethod)
    {
        switch ($paymentMethod) {
            case 'moneroo':
                return $this->processMonerooPayment($transaction);
            case 'nowpayments':
                return $this->processNowPaymentsPayment($transaction);
            default:
                throw new \InvalidArgumentException('Unsupported payment method');
        }
    }

    private function processMonerooPayment(Transaction $transaction)
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->monerooApiKey,
                'Content-Type' => 'application/json'
            ])->post('https://api.moneroo.io/v1/payments', [
                'amount' => $transaction->final_amount_fcfa,
                'currency' => 'XOF',
                'description' => "Exchange transaction {$transaction->id}",
                'customer' => [
                    'email' => $transaction->user->email,
                    'phone' => $transaction->source_wallet['phone'] ?? null
                ],
                'return_url' => config('app.url') . '/payment/success',
                'cancel_url' => config('app.url') . '/payment/cancel',
                'webhook_url' => config('app.url') . '/api/webhooks/moneroo',
                'metadata' => [
                    'transaction_id' => $transaction->id,
                    'user_id' => $transaction->user_id
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                $transaction->update([
                    'moneroo_payment_id' => $data['payment']['id'],
                    'moneroo_checkout_url' => $data['payment']['checkout_url'],
                    'status' => 'processing'
                ]);

                return [
                    'success' => true,
                    'checkoutUrl' => $data['payment']['checkout_url'],
                    'paymentId' => $data['payment']['id']
                ];
            }

            throw new \Exception('Moneroo API error: ' . $response->body());
        } catch (\Exception $e) {
            Log::error('Moneroo payment processing failed', [
                'transaction_id' => $transaction->id,
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    private function processNowPaymentsPayment(Transaction $transaction)
    {
        try {
            // First, get available currencies
            $currenciesResponse = Http::withHeaders([
                'x-api-key' => $this->nowpaymentsApiKey
            ])->get('https://api.nowpayments.io/v1/currencies');

            if (!$currenciesResponse->successful()) {
                throw new \Exception('Failed to fetch available currencies');
            }

            $currencies = $currenciesResponse->json()['currencies'];
            
            // Use USDT as default crypto currency
            $cryptoCurrency = 'usdt';
            if (!in_array($cryptoCurrency, $currencies)) {
                $cryptoCurrency = $currencies[0]; // Fallback to first available
            }

            // Create payment
            $response = Http::withHeaders([
                'x-api-key' => $this->nowpaymentsApiKey,
                'Content-Type' => 'application/json'
            ])->post('https://api.nowpayments.io/v1/payment', [
                'price_amount' => $transaction->final_amount_usdt,
                'price_currency' => 'usd', // Base currency
                'pay_currency' => $cryptoCurrency,
                'order_id' => $transaction->id,
                'order_description' => "Crypto exchange transaction {$transaction->id}",
                'ipn_callback_url' => config('app.url') . '/api/webhooks/nowpayments',
                'success_url' => config('app.url') . '/payment/success',
                'cancel_url' => config('app.url') . '/payment/cancel'
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                $transaction->update([
                    'nowpayments_payment_id' => $data['payment_id'],
                    'nowpayments_checkout_url' => $data['invoice_url'] ?? null,
                    'status' => 'processing'
                ]);

                return [
                    'success' => true,
                    'checkoutUrl' => $data['invoice_url'] ?? null,
                    'paymentId' => $data['payment_id'],
                    'payAmount' => $data['pay_amount'],
                    'payCurrency' => $data['pay_currency'],
                    'payAddress' => $data['pay_address'] ?? null
                ];
            }

            throw new \Exception('NOWPayments API error: ' . $response->body());
        } catch (\Exception $e) {
            Log::error('NOWPayments payment processing failed', [
                'transaction_id' => $transaction->id,
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    public function verifyMonerooWebhook(array $payload, string $signature)
    {
        $computedSignature = hash_hmac('sha256', json_encode($payload), $this->monerooSecretKey);
        
        return hash_equals($signature, $computedSignature);
    }

    public function verifyNowPaymentsWebhook(array $payload)
    {
        // NOWPayments webhook verification logic
        // This depends on their specific implementation
        return true; // Implement according to NOWPayments documentation
    }

    public function handleMonerooWebhook(array $payload)
    {
        $paymentId = $payload['payment']['id'];
        $status = $payload['payment']['status'];
        $transactionId = $payload['payment']['metadata']['transaction_id'];

        $transaction = Transaction::find($transactionId);
        if (!$transaction) {
            throw new \Exception('Transaction not found');
        }

        switch ($status) {
            case 'successful':
                $transaction->update([
                    'status' => 'completed',
                    'processed_at' => now()
                ]);
                break;
            case 'failed':
            case 'cancelled':
                $transaction->update([
                    'status' => 'failed'
                ]);
                break;
        }

        return $transaction;
    }

    public function handleNowPaymentsWebhook(array $payload)
    {
        $paymentId = $payload['payment_id'];
        $status = $payload['payment_status'];
        $orderId = $payload['order_id'];

        $transaction = Transaction::find($orderId);
        if (!$transaction) {
            throw new \Exception('Transaction not found');
        }

        switch ($status) {
            case 'finished':
                $transaction->update([
                    'status' => 'completed',
                    'processed_at' => now()
                ]);
                break;
            case 'failed':
            case 'expired':
                $transaction->update([
                    'status' => 'failed'
                ]);
                break;
        }

        return $transaction;
    }
}