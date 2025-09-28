<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation de mot de passe</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .button {
            display: inline-block;
            background: #ff6b6b;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .token-box {
            background: #e9ecef;
            padding: 15px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 18px;
            letter-spacing: 2px;
            text-align: center;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
        }
        .warning {
            background: #fff3cd;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Réinitialisation de mot de passe</h1>
    </div>
    
    <div class="content">
        <h2>Demande de réinitialisation</h2>
        
        <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte {{ config('app.name') }}.</p>
        
        <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
        
        <div style="text-align: center;">
            <a href="{{ config('app.url') }}/reset-password-confirm?token={{ $token }}&email={{ urlencode($email) }}" class="button">
                Réinitialiser mon mot de passe
            </a>
        </div>
        
        <p>Ou copiez ce lien dans votre navigateur :</p>
        <div class="token-box">
            {{ config('app.url') }}/reset-password-confirm?token={{ $token }}&email={{ urlencode($email) }}
        </div>
        
        <div class="warning">
            <strong>⚠️ Important :</strong>
            <ul>
                <li>Ce lien expirera dans 60 minutes</li>
                <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                <li>Ne partagez jamais ce lien avec quelqu'un d'autre</li>
            </ul>
        </div>
        
        <p>Si vous avez des difficultés, contactez notre support client.</p>
        
        <p><strong>L'équipe {{ config('app.name') }}</strong></p>
    </div>
    
    <div class="footer">
        <p>© {{ date('Y') }} {{ config('app.name') }}. Tous droits réservés.</p>
        <p>Cet email a été envoyé à {{ $email }}</p>
    </div>
</body>
</html>