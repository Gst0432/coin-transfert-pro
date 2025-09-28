-- Add missing column for NOWPayments checkout URL
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS nowpayments_checkout_url text;