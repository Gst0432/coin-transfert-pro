<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mise à jour de votre transaction</title>
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
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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
        .transaction-details {
            background: white;
            padding: 20px;
            border-radius: 5px;
            border: 1px solid #dee2e6;
            margin: 20px 0;
        }
        .status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status.completed { background: #d4edda; color: #155724; }
        .status.pending { background: #fff3cd; color: #856404; }
        .status.failed { background: #f8d7da; color: #721c24; }
        .button {
            display: inline-block;
            background: #28a745;
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
        <h1>Mise à jour de transaction</h1>
    </div>
    
    <div class="content">
        <h2>Votre transaction a été mise à jour</h2>
        
        <div class="transaction-details">
            <h3>Détails de la transaction</h3>
            
            <p><strong>ID Transaction :</strong> {{ $transaction->id }}</p>
            <p><strong>Type :</strong> {{ ucfirst($transaction->type) }}</p>
            <p><strong>Montant :</strong> {{ number_format($transaction->amount, 2) }} {{ strtoupper($transaction->from_currency) }}</p>
            <p><strong>Vers :</strong> {{ number_format($transaction->to_amount, 2) }} {{ strtoupper($transaction->to_currency) }}</p>
            <p><strong>Statut :</strong> 
                <span class="status {{ $transaction->status }}">
                    {{ $transaction->status }}
                </span>
            </p>
            <p><strong>Date :</strong> {{ $transaction->created_at->format('d/m/Y à H:i') }}</p>
            
            @if($transaction->provider_transaction_id)
                <p><strong>Référence :</strong> {{ $transaction->provider_transaction_id }}</p>
            @endif
        </div>
        
        @if($transaction->status === 'completed')
            <p>🎉 <strong>Félicitations !</strong> Votre transaction a été complétée avec succès.</p>
        @elseif($transaction->status === 'pending')
            <p>⏳ Votre transaction est en cours de traitement. Nous vous tiendrons informé de son évolution.</p>
        @elseif($transaction->status === 'failed')
            <p>❌ Malheureusement, votre transaction a échoué. Notre équipe a été notifiée et vous contactera bientôt.</p>
        @endif
        
        <div style="text-align: center;">
            <a href="{{ config('app.url') }}/history" class="button">
                Voir mes transactions
            </a>
        </div>
        
        <p>Si vous avez des questions concernant cette transaction, n'hésitez pas à contacter notre support client.</p>
        
        <p><strong>L'équipe {{ config('app.name') }}</strong></p>
    </div>
    
    <div class="footer">
        <p>© {{ date('Y') }} {{ config('app.name') }}. Tous droits réservés.</p>
        <p>Transaction ID: {{ $transaction->id }}</p>
    </div>
</body>
</html>