-- Create app_settings table for storing configuration
CREATE TABLE public.app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admins only
CREATE POLICY "Only admins can manage app settings" 
ON public.app_settings 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default settings
INSERT INTO public.app_settings (setting_key, setting_value, description) VALUES
('exchange_rate', '{"rate": 595.23}', 'Taux de change USD vers FCFA'),
('minimum_amounts', '{"min_fcfa": 3000, "min_usd": 2}', 'Montants minimums pour les transactions'),
('fees', '{"usdt_withdrawal_fee": 1, "mobile_money_fee_percentage": 1.5}', 'Frais de transaction'),
('moneroo_config', '{"mode": "sandbox", "sandbox_api_key": "", "live_api_key": "", "webhook_secret": ""}', 'Configuration Moneroo');

-- Create trigger for updated_at
CREATE TRIGGER update_app_settings_updated_at
    BEFORE UPDATE ON public.app_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();