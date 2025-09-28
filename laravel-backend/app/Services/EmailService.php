<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
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
     * Send welcome email to new user using custom templates
     */
    public function sendWelcomeEmail(User $user)
    {
        try {
            // Get custom template
            $template = $this->getEmailTemplate('welcome');
            $variables = [
                'site_name' => config('app.name'),
                'user_name' => $user->profile->display_name ?? $user->email,
                'app_url' => config('app.url'),
                'primary_color' => $this->getBrandingColor(),
            ];

            $subject = $this->replaceVariables($template['subject'], $variables);
            $content = $this->replaceVariables($template['content'], $variables);

            Mail::html($content, function ($message) use ($user, $subject) {
                $message->to($user->email)->subject($subject);
            });
            
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
     * Send password reset email using custom templates
     */
    public function sendPasswordResetEmail($email, $token)
    {
        try {
            // Get custom template
            $template = $this->getEmailTemplate('password_reset');
            $variables = [
                'site_name' => config('app.name'),
                'app_url' => config('app.url'),
                'primary_color' => $this->getBrandingColor(),
                'reset_url' => config('app.url') . '/reset-password-confirm?token=' . $token . '&email=' . urlencode($email),
            ];

            $subject = $this->replaceVariables($template['subject'], $variables);
            $content = $this->replaceVariables($template['content'], $variables);

            Mail::html($content, function ($message) use ($email, $subject) {
                $message->to($email)->subject($subject);
            });
            
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
     * Send transaction notification email using custom templates
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

            // Get custom template
            $template = $this->getEmailTemplate('transaction_notification');
            $variables = [
                'site_name' => config('app.name'),
                'user_name' => $user->profile->display_name ?? $user->email,
                'app_url' => config('app.url'),
                'primary_color' => $this->getBrandingColor(),
                'transaction_id' => $transaction->id,
                'transaction_status' => ucfirst($transaction->status),
                'transaction_amount' => number_format($transaction->amount_usdt, 2) . ' USDT',
                'transaction_date' => $transaction->created_at->format('d/m/Y à H:i'),
            ];

            $subject = $this->replaceVariables($template['subject'], $variables);
            $content = $this->replaceVariables($template['content'], $variables);

            Mail::html($content, function ($message) use ($user, $subject) {
                $message->to($user->email)->subject($subject);
            });
            
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
     * Get email template from database or fallback to default
     */
    private function getEmailTemplate($type)
    {
        try {
            $templateData = DB::table('admin_settings')
                ->where('setting_key', 'email_templates')
                ->first();

            if ($templateData) {
                $templates = json_decode($templateData->setting_value, true);
                if (isset($templates[$type])) {
                    return $templates[$type];
                }
            }
        } catch (Exception $e) {
            Log::warning('Failed to load custom email template, using default', [
                'type' => $type,
                'error' => $e->getMessage()
            ]);
        }

        // Fallback to default templates
        return $this->getDefaultTemplate($type);
    }

    /**
     * Get default email templates
     */
    private function getDefaultTemplate($type)
    {
        $defaults = [
            'welcome' => [
                'subject' => 'Bienvenue sur {{site_name}}',
                'content' => '<h1>Bienvenue sur {{site_name}} !</h1><p>Nous sommes ravis de vous accueillir, {{user_name}} !</p><p>Votre compte a été créé avec succès.</p><a href="{{app_url}}" style="background: {{primary_color}}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Accéder à votre compte</a><p>L\'équipe {{site_name}}</p>',
            ],
            'password_reset' => [
                'subject' => 'Réinitialisation de mot de passe - {{site_name}}',
                'content' => '<h1>Réinitialisation de mot de passe</h1><p>Vous avez demandé la réinitialisation de votre mot de passe pour {{site_name}}.</p><a href="{{reset_url}}" style="background: {{primary_color}}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Réinitialiser mon mot de passe</a><p><strong>Ce lien expirera dans 60 minutes.</strong></p><p>L\'équipe {{site_name}}</p>',
            ],
            'transaction_notification' => [
                'subject' => 'Mise à jour de votre transaction - {{site_name}}',
                'content' => '<h1>Mise à jour de transaction</h1><p>Votre transaction {{transaction_id}} a été mise à jour.</p><p><strong>Statut :</strong> {{transaction_status}}</p><p><strong>Montant :</strong> {{transaction_amount}}</p><a href="{{app_url}}/history" style="background: {{primary_color}}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Voir mes transactions</a><p>L\'équipe {{site_name}}</p>',
            ],
        ];

        return $defaults[$type] ?? ['subject' => 'Email', 'content' => 'Contenu par défaut'];
    }

    /**
     * Replace template variables
     */
    private function replaceVariables($template, $variables)
    {
        foreach ($variables as $key => $value) {
            $template = str_replace('{{' . $key . '}}', $value, $template);
        }
        return $template;
    }

    /**
     * Get branding primary color
     */
    private function getBrandingColor()
    {
        try {
            $brandingData = DB::table('admin_settings')
                ->where('setting_key', 'site_branding')
                ->first();

            if ($brandingData) {
                $branding = json_decode($brandingData->setting_value, true);
                return $branding['primary_color'] ?? '#3b82f6';
            }
        } catch (Exception $e) {
            // Fallback to default color
        }

        return '#3b82f6';
    }
}