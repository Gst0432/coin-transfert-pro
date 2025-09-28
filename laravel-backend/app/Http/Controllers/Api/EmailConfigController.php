<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Config;
use App\Services\EmailService;
use Exception;

class EmailConfigController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('admin');
    }

    public function getEmailConfig()
    {
        try {
            // Get SMTP configuration
            $smtpConfig = DB::table('admin_settings')
                ->where('setting_key', 'smtp_config')
                ->first();

            // Get email templates
            $emailTemplates = DB::table('admin_settings')
                ->where('setting_key', 'email_templates')
                ->first();

            return response()->json([
                'smtp_config' => $smtpConfig ? json_decode($smtpConfig->setting_value, true) : $this->getDefaultSMTPConfig(),
                'email_templates' => $emailTemplates ? json_decode($emailTemplates->setting_value, true) : $this->getDefaultEmailTemplates(),
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Erreur lors du chargement de la configuration email',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function saveEmailConfig(Request $request)
    {
        $request->validate([
            'smtp_config' => 'required|array',
            'smtp_config.host' => 'required|string',
            'smtp_config.port' => 'required|string',
            'smtp_config.username' => 'required|email',
            'smtp_config.password' => 'required|string',
            'smtp_config.encryption' => 'required|in:tls,ssl',
            'smtp_config.from_email' => 'required|email',
            'smtp_config.from_name' => 'required|string',
            'email_templates' => 'required|array',
        ]);

        try {
            DB::beginTransaction();

            // Save SMTP configuration
            DB::table('admin_settings')->updateOrInsert(
                ['setting_key' => 'smtp_config'],
                [
                    'setting_value' => json_encode($request->smtp_config),
                    'updated_at' => now(),
                    'description' => 'Configuration SMTP pour l\'envoi d\'emails'
                ]
            );

            // Save email templates
            DB::table('admin_settings')->updateOrInsert(
                ['setting_key' => 'email_templates'],
                [
                    'setting_value' => json_encode($request->email_templates),
                    'updated_at' => now(),
                    'description' => 'Templates HTML pour les emails automatiques'
                ]
            );

            DB::commit();

            return response()->json([
                'message' => 'Configuration email sauvegardée avec succès'
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'error' => 'Erreur lors de la sauvegarde',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function testSMTP(Request $request)
    {
        $request->validate([
            'smtp_config' => 'required|array',
            'test_email' => 'required|email',
        ]);

        try {
            $smtpConfig = $request->smtp_config;

            // Temporarily configure mail settings
            Config::set('mail.mailers.smtp.host', $smtpConfig['host']);
            Config::set('mail.mailers.smtp.port', $smtpConfig['port']);
            Config::set('mail.mailers.smtp.username', $smtpConfig['username']);
            Config::set('mail.mailers.smtp.password', $smtpConfig['password']);
            Config::set('mail.mailers.smtp.encryption', $smtpConfig['encryption']);
            Config::set('mail.from.address', $smtpConfig['from_email']);
            Config::set('mail.from.name', $smtpConfig['from_name']);

            // Send test email
            Mail::raw('Test de configuration SMTP - ' . config('app.name'), function ($message) use ($request) {
                $message->to($request->test_email)
                        ->subject('Test SMTP - ' . config('app.name'));
            });

            return response()->json([
                'message' => 'Email de test envoyé avec succès'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Erreur lors du test SMTP',
                'details' => $e->getMessage()
            ], 400);
        }
    }

    public function sendTemplatePreview(Request $request)
    {
        $request->validate([
            'template_type' => 'required|in:welcome,password_reset,transaction_notification',
            'test_email' => 'required|email',
        ]);

        try {
            // Get current email templates
            $templatesData = DB::table('admin_settings')
                ->where('setting_key', 'email_templates')
                ->first();

            $templates = $templatesData ? 
                json_decode($templatesData->setting_value, true) : 
                $this->getDefaultEmailTemplates();

            $template = $templates[$request->template_type];

            // Replace variables with sample data
            $variables = $this->getSampleVariables();
            $subject = $this->replaceVariables($template['subject'], $variables);
            $content = $this->replaceVariables($template['content'], $variables);

            // Send preview email
            Mail::html($content, function ($message) use ($request, $subject) {
                $message->to($request->test_email)
                        ->subject('[APERÇU] ' . $subject);
            });

            return response()->json([
                'message' => 'Aperçu de template envoyé avec succès'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de l\'envoi de l\'aperçu',
                'details' => $e->getMessage()
            ], 400);
        }
    }

    private function getDefaultSMTPConfig()
    {
        return [
            'host' => '',
            'port' => '587',
            'username' => '',
            'password' => '',
            'encryption' => 'tls',
            'from_email' => '',
            'from_name' => config('app.name', 'Exchange Pro'),
            'is_active' => false,
        ];
    }

    private function getDefaultEmailTemplates()
    {
        return [
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
    }

    private function getSampleVariables()
    {
        return [
            'site_name' => config('app.name', 'Exchange Pro'),
            'user_name' => 'John Doe',
            'app_url' => config('app.url'),
            'primary_color' => '#3b82f6',
            'reset_url' => config('app.url') . '/reset-password-confirm?token=example',
            'transaction_id' => 'TXN-12345',
            'transaction_status' => 'Terminée',
            'transaction_amount' => '100 USDT',
            'transaction_date' => now()->format('d/m/Y à H:i'),
        ];
    }

    private function replaceVariables($template, $variables)
    {
        foreach ($variables as $key => $value) {
            $template = str_replace('{{' . $key . '}}', $value, $template);
        }
        return $template;
    }
}