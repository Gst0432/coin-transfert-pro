import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFavicon, updatePageMetadata } from './useFavicon';

interface BrandingSettings {
  site_name: string;
  main_logo_url: string;
  dashboard_logo_url: string;
  favicon_url: string;
  site_title: string;
  site_description: string;
}

const defaultSettings: BrandingSettings = {
  site_name: 'Exchange Pro',
  main_logo_url: '/src/assets/logo-exchange.png',
  dashboard_logo_url: '/src/assets/logo-exchange.png',
  favicon_url: '/favicon.png',
  site_title: 'Exchange Pro - Plateforme d\'échange crypto sécurisée',
  site_description: 'Échangez vos cryptomonnaies en toute sécurité avec Exchange Pro. Frais réduits, transactions rapides, sécurité maximale.'
};

export const useBrandingSettings = () => {
  const [settings, setSettings] = useState<BrandingSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Appliquer le favicon et les métadonnées
  useFavicon(settings.favicon_url);
  
  useEffect(() => {
    updatePageMetadata({
      meta_title: settings.site_title,
      meta_description: settings.site_description,
      meta_image: settings.main_logo_url
    });
  }, [settings.site_title, settings.site_description, settings.main_logo_url]);

  const fetchSettings = async () => {
    try {
      const settingsKeys = ['site_name', 'main_logo_url', 'dashboard_logo_url', 'favicon_url', 'site_title', 'site_description'];
      
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')
        .in('setting_key', settingsKeys);

      if (error) throw error;

      const fetchedSettings = { ...defaultSettings };
      
      data?.forEach((item) => {
        const key = item.setting_key as keyof BrandingSettings;
        try {
          // Convertir la valeur JSON en string
          const value = typeof item.setting_value === 'string' 
            ? JSON.parse(item.setting_value)
            : item.setting_value;
          fetchedSettings[key] = String(value);
        } catch {
          // Si le parsing JSON échoue, convertir en string
          fetchedSettings[key] = String(item.setting_value);
        }
      });

      setSettings(fetchedSettings);
    } catch (error) {
      console.error('Error fetching branding settings:', error);
      // Utiliser les paramètres par défaut en cas d'erreur
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof BrandingSettings, value: string) => {
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: key,
          setting_value: JSON.stringify(value),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Mettre à jour l'état local
      setSettings(prev => ({ ...prev, [key]: value }));
      
      return { success: true };
    } catch (error) {
      console.error(`Error updating ${key}:`, error);
      return { success: false, error };
    }
  };

  const updateMultipleSettings = async (newSettings: Partial<BrandingSettings>) => {
    try {
      const updates = Object.entries(newSettings).map(([key, value]) => ({
        setting_key: key,
        setting_value: JSON.stringify(value),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('admin_settings')
        .upsert(updates);

      if (error) throw error;

      // Mettre à jour l'état local
      setSettings(prev => ({ ...prev, ...newSettings }));
      
      return { success: true };
    } catch (error) {
      console.error('Error updating multiple settings:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    updateSetting,
    updateMultipleSettings,
    refreshSettings: fetchSettings
  };
};