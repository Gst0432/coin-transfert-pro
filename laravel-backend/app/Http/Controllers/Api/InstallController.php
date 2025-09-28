<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use App\Models\Profile;
use App\Mail\TestEmail;
use Exception;

class InstallController extends Controller
{
    private function isInstalled()
    {
        return file_exists(base_path('.installed'));
    }

    private function markAsInstalled()
    {
        file_put_contents(base_path('.installed'), date('Y-m-d H:i:s'));
    }

    public function checkRequirements(Request $request)
    {
        if ($this->isInstalled()) {
            return response()->json(['error' => 'Application déjà installée'], 400);
        }

        $requirements = [
            'php_version' => version_compare(PHP_VERSION, '8.1.0', '>='),
            'php_extensions' => [
                'pdo' => extension_loaded('pdo'),
                'pdo_mysql' => extension_loaded('pdo_mysql'),
                'openssl' => extension_loaded('openssl'),
                'mbstring' => extension_loaded('mbstring'),
                'tokenizer' => extension_loaded('tokenizer'),
                'xml' => extension_loaded('xml'),
                'ctype' => extension_loaded('ctype'),
                'json' => extension_loaded('json'),
            ],
            'directories_writable' => [
                'storage' => is_writable(storage_path()),
                'bootstrap_cache' => is_writable(base_path('bootstrap/cache')),
            ],
        ];

        $allPassed = $requirements['php_version'] && 
                    !in_array(false, $requirements['php_extensions']) && 
                    !in_array(false, $requirements['directories_writable']);

        if (!$allPassed) {
            return response()->json([
                'error' => 'Certains prérequis ne sont pas satisfaits',
                'requirements' => $requirements
            ], 400);
        }

        return response()->json([
            'message' => 'Tous les prérequis sont satisfaits',
            'requirements' => $requirements
        ]);
    }

    public function testDatabase(Request $request)
    {
        if ($this->isInstalled()) {
            return response()->json(['error' => 'Application déjà installée'], 400);
        }

        $request->validate([
            'host' => 'required|string',
            'port' => 'required|numeric',
            'name' => 'required|string',
            'username' => 'required|string',
            'password' => 'nullable|string',
        ]);

        try {
            $connection = new \PDO(
                "mysql:host={$request->host};port={$request->port};dbname={$request->name}",
                $request->username,
                $request->password,
                [
                    \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                    \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                ]
            );

            // Test basic query
            $connection->query('SELECT 1');

            return response()->json(['message' => 'Connexion à la base de données réussie']);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Impossible de se connecter à la base de données',
                'details' => $e->getMessage()
            ], 400);
        }
    }

    public function runMigrations(Request $request)
    {
        if ($this->isInstalled()) {
            return response()->json(['error' => 'Application déjà installée'], 400);
        }

        $request->validate([
            'host' => 'required|string',
            'port' => 'required|numeric',
            'name' => 'required|string',
            'username' => 'required|string',
            'password' => 'nullable|string',
        ]);

        try {
            // Update database configuration
            Config::set('database.connections.mysql.host', $request->host);
            Config::set('database.connections.mysql.port', $request->port);
            Config::set('database.connections.mysql.database', $request->name);
            Config::set('database.connections.mysql.username', $request->username);
            Config::set('database.connections.mysql.password', $request->password);

            // Clear and refresh database connection
            DB::purge('mysql');
            DB::reconnect('mysql');

            // Run migrations
            Artisan::call('migrate', ['--force' => true]);

            return response()->json([
                'message' => 'Migrations exécutées avec succès',
                'output' => Artisan::output()
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de l\'exécution des migrations',
                'details' => $e->getMessage()
            ], 400);
        }
    }

    public function configureApp(Request $request)
    {
        if ($this->isInstalled()) {
            return response()->json(['error' => 'Application déjà installée'], 400);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'required|url',
            'timezone' => 'required|string',
        ]);

        try {
            $envPath = base_path('.env');
            $envContent = file_exists($envPath) ? file_get_contents($envPath) : '';

            // Update or add environment variables
            $envUpdates = [
                'APP_NAME' => '"' . $request->name . '"',
                'APP_URL' => $request->url,
                'APP_TIMEZONE' => $request->timezone,
                'APP_ENV' => 'production',
                'APP_DEBUG' => 'false',
            ];

            foreach ($envUpdates as $key => $value) {
                if (strpos($envContent, $key . '=') !== false) {
                    $envContent = preg_replace("/^{$key}=.*/m", "{$key}={$value}", $envContent);
                } else {
                    $envContent .= "\n{$key}={$value}";
                }
            }

            file_put_contents($envPath, $envContent);

            // Clear config cache
            Artisan::call('config:clear');

            return response()->json(['message' => 'Configuration de l\'application mise à jour']);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la configuration de l\'application',
                'details' => $e->getMessage()
            ], 400);
        }
    }

    public function configureSmtp(Request $request)
    {
        if ($this->isInstalled()) {
            return response()->json(['error' => 'Application déjà installée'], 400);
        }

        $request->validate([
            'host' => 'required|string',
            'port' => 'required|numeric',
            'username' => 'required|email',
            'password' => 'required|string',
            'encryption' => 'required|in:tls,ssl',
            'from_email' => 'required|email',
            'from_name' => 'required|string',
        ]);

        try {
            $envPath = base_path('.env');
            $envContent = file_exists($envPath) ? file_get_contents($envPath) : '';

            // Update or add SMTP environment variables
            $envUpdates = [
                'MAIL_MAILER' => 'smtp',
                'MAIL_HOST' => $request->host,
                'MAIL_PORT' => $request->port,
                'MAIL_USERNAME' => $request->username,
                'MAIL_PASSWORD' => '"' . $request->password . '"',
                'MAIL_ENCRYPTION' => $request->encryption,
                'MAIL_FROM_ADDRESS' => $request->from_email,
                'MAIL_FROM_NAME' => '"' . $request->from_name . '"',
            ];

            foreach ($envUpdates as $key => $value) {
                if (strpos($envContent, $key . '=') !== false) {
                    $envContent = preg_replace("/^{$key}=.*/m", "{$key}={$value}", $envContent);
                } else {
                    $envContent .= "\n{$key}={$value}";
                }
            }

            file_put_contents($envPath, $envContent);

            // Clear config cache
            Artisan::call('config:clear');

            // Test SMTP configuration
            Config::set('mail.mailers.smtp.host', $request->host);
            Config::set('mail.mailers.smtp.port', $request->port);
            Config::set('mail.mailers.smtp.username', $request->username);
            Config::set('mail.mailers.smtp.password', $request->password);
            Config::set('mail.mailers.smtp.encryption', $request->encryption);
            Config::set('mail.from.address', $request->from_email);
            Config::set('mail.from.name', $request->from_name);

            // Send test email
            Mail::raw('Test de configuration SMTP - Exchange Pro', function ($message) use ($request) {
                $message->to($request->username)
                        ->subject('Test SMTP - Exchange Pro');
            });

            return response()->json(['message' => 'Configuration SMTP mise à jour et testée avec succès']);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la configuration SMTP',
                'details' => $e->getMessage()
            ], 400);
        }
    }

    public function configurePayments(Request $request)
    {
        if ($this->isInstalled()) {
            return response()->json(['error' => 'Application déjà installée'], 400);
        }

        $request->validate([
            'moneroo_api_key' => 'nullable|string',
            'moneroo_secret_key' => 'nullable|string',
            'nowpayments_api_key' => 'nullable|string',
            'nowpayments_secret_key' => 'nullable|string',
        ]);

        try {
            $envPath = base_path('.env');
            $envContent = file_exists($envPath) ? file_get_contents($envPath) : '';

            // Update or add payment environment variables
            $envUpdates = [
                'MONEROO_API_KEY' => $request->moneroo_api_key ? '"' . $request->moneroo_api_key . '"' : '""',
                'MONEROO_SECRET_KEY' => $request->moneroo_secret_key ? '"' . $request->moneroo_secret_key . '"' : '""',
                'NOWPAYMENTS_API_KEY' => $request->nowpayments_api_key ? '"' . $request->nowpayments_api_key . '"' : '""',
                'NOWPAYMENTS_SECRET_KEY' => $request->nowpayments_secret_key ? '"' . $request->nowpayments_secret_key . '"' : '""',
            ];

            foreach ($envUpdates as $key => $value) {
                if (strpos($envContent, $key . '=') !== false) {
                    $envContent = preg_replace("/^{$key}=.*/m", "{$key}={$value}", $envContent);
                } else {
                    $envContent .= "\n{$key}={$value}";
                }
            }

            file_put_contents($envPath, $envContent);

            // Clear config cache
            Artisan::call('config:clear');

            return response()->json(['message' => 'Configuration des paiements mise à jour']);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la configuration des paiements',
                'details' => $e->getMessage()
            ], 400);
        }
    }

    public function createAdmin(Request $request)
    {
        if ($this->isInstalled()) {
            return response()->json(['error' => 'Application déjà installée'], 400);
        }

        $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'display_name' => 'required|string|max:255',
        ]);

        try {
            // Create admin user
            $user = User::create([
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'email_verified_at' => now(),
            ]);

            // Create profile
            Profile::create([
                'user_id' => $user->id,
                'display_name' => $request->display_name,
            ]);

            // Create admin role (assuming you have a roles system)
            DB::table('user_roles')->insert([
                'user_id' => $user->id,
                'role' => 'admin',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'message' => 'Compte administrateur créé avec succès',
                'admin_id' => $user->id
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la création du compte administrateur',
                'details' => $e->getMessage()
            ], 400);
        }
    }

    public function finalize(Request $request)
    {
        if ($this->isInstalled()) {
            return response()->json(['error' => 'Application déjà installée'], 400);
        }

        try {
            // Clear all caches
            Artisan::call('config:clear');
            Artisan::call('cache:clear');
            Artisan::call('route:clear');
            Artisan::call('view:clear');

            // Optimize for production
            Artisan::call('config:cache');
            Artisan::call('route:cache');

            // Mark as installed
            $this->markAsInstalled();

            // Send welcome email to admin if SMTP is configured
            try {
                $adminUser = User::whereHas('roles', function ($query) {
                    $query->where('role', 'admin');
                })->first();

                if ($adminUser && config('mail.mailers.smtp.host')) {
                    Mail::raw('Bienvenue sur Exchange Pro ! Votre installation est terminée avec succès.', function ($message) use ($adminUser) {
                        $message->to($adminUser->email)
                                ->subject('Installation terminée - Exchange Pro');
                    });
                }
            } catch (Exception $e) {
                // Silent fail on email - installation should complete
            }

            return response()->json([
                'message' => 'Installation terminée avec succès',
                'redirect_url' => '/admin'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la finalisation',
                'details' => $e->getMessage()
            ], 400);
        }
    }
}