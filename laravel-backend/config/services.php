<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'moneroo' => [
        'api_key' => env('MONEROO_API_KEY'),
        'secret_key' => env('MONEROO_SECRET_KEY'),
        'base_url' => env('MONEROO_BASE_URL', 'https://api.moneroo.io'),
    ],

    'nowpayments' => [
        'api_key' => env('NOWPAYMENTS_API_KEY'),
        'secret_key' => env('NOWPAYMENTS_SECRET_KEY'),
        'base_url' => env('NOWPAYMENTS_BASE_URL', 'https://api.nowpayments.io'),
    ],

    'exchange_rates' => [
        'provider' => env('EXCHANGE_RATE_PROVIDER', 'coinbase'),
        'coinbase_api' => 'https://api.coinbase.com/v2/exchange-rates',
        'binance_api' => 'https://api.binance.com/api/v3/ticker/price',
    ],

];