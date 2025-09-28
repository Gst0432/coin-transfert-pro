<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;
use App\Mail\WelcomeEmail;
use App\Mail\PasswordResetEmail;
use App\Mail\TransactionNotificationEmail;
use App\Models\User;
use App\Models\Transaction;
use Exception;
use Illuminate\Support\Facades\Log;

class EmailService
{
    /**
     * Send welcome email to new user
     */
    public function sendWelcomeEmail(User $user)
    {
        try {
            Mail::to($user->email)->send(new WelcomeEmail($user));
            
            Log::info('Welcome email sent successfully', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);
            
            return true;
        } catch (Exception $e) {
            Log::error('Failed to send welcome email', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage()
            ]);
            
            return false;
        }
    }

    /**
     * Send password reset email
     */
    public function sendPasswordResetEmail($email, $token)
    {
        try {
            Mail::to($email)->send(new PasswordResetEmail($email, $token));
            
            Log::info('Password reset email sent successfully', [
                'email' => $email
            ]);
            
            return true;
        } catch (Exception $e) {
            Log::error('Failed to send password reset email', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);
            
            return false;
        }
    }

    /**
     * Send transaction notification email
     */
    public function sendTransactionNotification(Transaction $transaction)
    {
        try {
            $user = $transaction->user;
            
            if (!$user) {
                Log::warning('Cannot send transaction notification: user not found', [
                    'transaction_id' => $transaction->id
                ]);
                return false;
            }

            Mail::to($user->email)->send(new TransactionNotificationEmail($transaction));
            
            Log::info('Transaction notification email sent successfully', [
                'transaction_id' => $transaction->id,
                'user_id' => $user->id,
                'status' => $transaction->status
            ]);
            
            return true;
        } catch (Exception $e) {
            Log::error('Failed to send transaction notification email', [
                'transaction_id' => $transaction->id,
                'error' => $e->getMessage()
            ]);
            
            return false;
        }
    }

    /**
     * Send admin alert email
     */
    public function sendAdminAlert($type, $data, $subject = null)
    {
        try {
            // Get admin users
            $adminUsers = User::whereHas('roles', function ($query) {
                $query->where('role', 'admin');
            })->get();

            if ($adminUsers->isEmpty()) {
                Log::warning('No admin users found for alert email');
                return false;
            }

            $subject = $subject ?? "Alerte Admin - " . config('app.name');
            
            foreach ($adminUsers as $admin) {
                Mail::raw($this->formatAdminAlert($type, $data), function ($message) use ($admin, $subject) {
                    $message->to($admin->email)->subject($subject);
                });
            }
            
            Log::info('Admin alert email sent successfully', [
                'type' => $type,
                'admin_count' => $adminUsers->count()
            ]);
            
            return true;
        } catch (Exception $e) {
            Log::error('Failed to send admin alert email', [
                'type' => $type,
                'error' => $e->getMessage()
            ]);
            
            return false;
        }
    }

    /**
     * Format admin alert message
     */
    private function formatAdminAlert($type, $data)
    {
        $message = "ALERTE ADMIN - " . strtoupper($type) . "\n\n";
        $message .= "Timestamp: " . now()->format('Y-m-d H:i:s') . "\n\n";
        
        if (is_array($data)) {
            foreach ($data as $key => $value) {
                $message .= ucfirst($key) . ": " . (is_array($value) ? json_encode($value) : $value) . "\n";
            }
        } else {
            $message .= "Détails: " . $data . "\n";
        }
        
        $message .= "\n---\n";
        $message .= "Cet email a été généré automatiquement par " . config('app.name');
        
        return $message;
    }

    /**
     * Test SMTP configuration
     */
    public function testSmtpConfiguration($email)
    {
        try {
            Mail::raw('Test de configuration SMTP - ' . config('app.name'), function ($message) use ($email) {
                $message->to($email)
                        ->subject('Test SMTP - ' . config('app.name'));
            });
            
            return true;
        } catch (Exception $e) {
            Log::error('SMTP test failed', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }

    /**
     * Get email sending statistics
     */
    public function getEmailStats()
    {
        // This would typically query a logs table or use Laravel Horizon
        // For now, return mock data
        return [
            'sent_today' => 0,
            'sent_this_week' => 0,
            'sent_this_month' => 0,
            'failed_today' => 0,
            'queue_pending' => 0,
        ];
    }
}