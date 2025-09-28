<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Transaction extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'transaction_type',
        'amount_fcfa',
        'amount_usdt',
        'exchange_rate',
        'fees_fcfa',
        'fees_usdt',
        'final_amount_fcfa',
        'final_amount_usdt',
        'source_wallet',
        'destination_wallet',
        'status',
        'moneroo_payment_id',
        'moneroo_checkout_url',
        'nowpayments_payment_id',
        'nowpayments_checkout_url',
        'processed_by',
        'processed_at',
        'admin_notes'
    ];

    protected $casts = [
        'source_wallet' => 'json',
        'destination_wallet' => 'json',
        'processed_at' => 'datetime',
        'amount_fcfa' => 'decimal:2',
        'amount_usdt' => 'decimal:8',
        'exchange_rate' => 'decimal:2',
        'fees_fcfa' => 'decimal:2',
        'fees_usdt' => 'decimal:8',
        'final_amount_fcfa' => 'decimal:2',
        'final_amount_usdt' => 'decimal:8'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function getFormattedAmountFcfaAttribute()
    {
        return number_format($this->amount_fcfa, 0, ',', ' ') . ' FCFA';
    }

    public function getFormattedAmountUsdtAttribute()
    {
        return number_format($this->amount_usdt, 2, '.', ',') . ' USDT';
    }

    public function getStatusBadgeAttribute()
    {
        $badges = [
            'pending' => ['text' => 'En attente', 'class' => 'warning'],
            'processing' => ['text' => 'En cours', 'class' => 'info'],
            'completed' => ['text' => 'Terminé', 'class' => 'success'],
            'failed' => ['text' => 'Échoué', 'class' => 'destructive'],
            'cancelled' => ['text' => 'Annulé', 'class' => 'secondary']
        ];

        return $badges[$this->status] ?? ['text' => $this->status, 'class' => 'default'];
    }
}