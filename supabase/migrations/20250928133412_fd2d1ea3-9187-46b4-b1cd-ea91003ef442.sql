-- Add branding settings to admin_settings table
INSERT INTO admin_settings (setting_key, setting_value, description) VALUES
('site_name', '"Exchange Pro"', 'Nom du site affiche partout sur la plateforme'),
('main_logo_url', '"/src/assets/logo-exchange.png"', 'URL du logo principal (landing page, header)'),
('dashboard_logo_url', '"/src/assets/logo-exchange.png"', 'URL du logo du dashboard (sidebar, admin)'),
('favicon_url', '"/favicon.png"', 'URL du favicon du site'),
('site_title', '"Exchange Pro - Plateforme d''echange crypto securisee"', 'Titre de la page HTML'),
('site_description', '"Echangez vos cryptomonnaies en toute securite avec Exchange Pro. Frais reduits, transactions rapides, securite maximale."', 'Description meta de la page HTML')
ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = now();