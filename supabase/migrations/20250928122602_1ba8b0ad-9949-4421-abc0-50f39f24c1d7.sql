-- Add Resend configuration settings
INSERT INTO public.app_settings (setting_key, setting_value, description) VALUES 
('resend_api_key', '"RESEND_API_KEY"', 'Clé API Resend pour l''envoi d''emails'),
('resend_from_email', '"onboarding@resend.dev"', 'Adresse email d''expéditeur Resend'),
('password_reset_enabled', 'true', 'Activer la réinitialisation de mot de passe par email')
ON CONFLICT (setting_key) DO NOTHING;