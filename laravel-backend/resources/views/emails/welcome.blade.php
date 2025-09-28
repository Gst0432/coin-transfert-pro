<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue sur {{ config('app.name') }}</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Bienvenue sur {{ config('app.name') }}</h1>
    </div>
    
    <div class="content">
        <h2>Bonjour {{ $user->profile->display_name ?? $user->email }} !</h2>
        
        <p>Nous sommes ravis de vous accueillir sur notre plateforme d'échange de cryptomonnaies.</p>
        
        <p>Votre compte a été créé avec succès. Vous pouvez maintenant :</p>
        
        <ul>
            <li>✅ Échanger vos cryptomonnaies en toute sécurité</li>
            <li>✅ Suivre vos transactions en temps réel</li>
            <li>✅ Bénéficier des meilleurs taux du marché</li>
            <li>✅ Accéder à un support client 24/7</li>
        </ul>
        
        <div style="text-align: center;">
            <a href="{{ config('app.url') }}" class="button">
                Accéder à votre compte
            </a>
        </div>
        
        <p>Si vous avez des questions, notre équipe de support est là pour vous aider.</p>
        
        <p>Bon trading !</p>
        
        <p><strong>L'équipe {{ config('app.name') }}</strong></p>
    </div>
    
    <div class="footer">
        <p>© {{ date('Y') }} {{ config('app.name') }}. Tous droits réservés.</p>
        <p>Cet email a été envoyé à {{ $user->email }}</p>
    </div>
</body>
</html>