-- Table pour stocker les paramètres de la landing page
CREATE TABLE public.landing_page_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  setting_type text NOT NULL DEFAULT 'text',
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.landing_page_settings ENABLE ROW LEVEL SECURITY;

-- Politique pour les admins seulement
CREATE POLICY "Only admins can manage landing page settings" 
ON public.landing_page_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger pour updated_at
CREATE TRIGGER update_landing_page_settings_updated_at
BEFORE UPDATE ON public.landing_page_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();