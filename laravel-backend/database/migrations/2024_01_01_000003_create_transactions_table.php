<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->nullable();
            $table->enum('transaction_type', ['fcfa_to_usdt', 'usdt_to_fcfa']);
            $table->decimal('amount_fcfa', 15, 2);
            $table->decimal('amount_usdt', 15, 8);
            $table->decimal('exchange_rate', 10, 2);
            $table->decimal('fees_fcfa', 15, 2)->default(0);
            $table->decimal('fees_usdt', 15, 8)->default(0);
            $table->decimal('final_amount_fcfa', 15, 2)->nullable();
            $table->decimal('final_amount_usdt', 15, 8)->nullable();
            $table->json('source_wallet')->nullable();
            $table->json('destination_wallet')->nullable();
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->string('moneroo_payment_id')->nullable();
            $table->text('moneroo_checkout_url')->nullable();
            $table->string('nowpayments_payment_id')->nullable();
            $table->text('nowpayments_checkout_url')->nullable();
            $table->uuid('processed_by')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('processed_by')->references('id')->on('users')->onDelete('set null');
            $table->index(['user_id', 'status']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};