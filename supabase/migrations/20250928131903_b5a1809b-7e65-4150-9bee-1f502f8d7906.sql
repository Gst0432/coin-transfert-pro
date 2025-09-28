-- Create admin_settings table for storing admin configuration
CREATE TABLE public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_settings
CREATE POLICY "Only admins can manage admin settings" 
ON public.admin_settings 
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for admin_settings timestamps
CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default admin settings
INSERT INTO public.admin_settings (setting_key, setting_value, description) VALUES
('default_admin_email', '"admin@exchange.com"', 'Email de l''administrateur par défaut'),
('default_admin_password', '"Admin123!"', 'Mot de passe par défaut (à changer)'),
('admin_password_last_changed', 'null', 'Date de dernière modification du mot de passe admin'),
('admin_setup_completed', 'false', 'Indique si la configuration admin initiale est terminée');