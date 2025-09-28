import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AppSettings {
  // Taux de conversion
  usdt_to_xof_rate: number;
  
  // Frais de transaction
  moneroo_gateway_fee_percentage: number;
  moneroo_fixed_fee: number;
  nowpayments_fee_usdt: number;
  mobile_money_fee_percentage: number;
  usdt_withdrawal_fee: number;
  
  // Montants minimum
  min_usdt: number;
  min_fcfa: number;
  
  // Configuration des webhooks
  webhook_moneroo_url: string;
  webhook_nowpayments_url: string;
  
  // URLs de retour
  success_url: string;
  cancel_url: string;
  
  // Statut de la plateforme
  platform_active: boolean;
  maintenance_message: string;
  
  // Configuration Resend pour emails
  resend_api_key: string;
  resend_from_email: string;
  password_reset_enabled: boolean;
}

const defaultSettings: AppSettings = {
  usdt_to_xof_rate: 660,
  moneroo_gateway_fee_percentage: 3,
  moneroo_fixed_fee: 100,
  nowpayments_fee_usdt: 3,
  mobile_money_fee_percentage: 1.5,
  usdt_withdrawal_fee: 1,
  min_usdt: 15,
  min_fcfa: 3000,
  webhook_moneroo_url: 'https://bvleffevnnugjdwygqyz.supabase.co/functions/v1/moneroo-webhook',
  webhook_nowpayments_url: 'https://bvleffevnnugjdwygqyz.supabase.co/functions/v1/nowpayments-webhook',
  success_url: 'https://coin-transfert-pro.lovable.app/wallet?status=success',
  cancel_url: 'https://coin-transfert-pro.lovable.app/trading',
  platform_active: true,
  maintenance_message: '',
  resend_api_key: 'RESEND_API_KEY',
  resend_from_email: 'onboarding@resend.dev',
  password_reset_enabled: true
};

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        // Convert array of settings to object
        const settingsObj: any = {};
        data.forEach(setting => {
          const key = setting.setting_key;
          settingsObj[key] = setting.setting_value;
        });
        
        setSettings({...defaultSettings, ...settingsObj});
      } else {
        // Initialize default settings if none exist
        await initializeDefaultSettings();
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la configuration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeDefaultSettings = async () => {
    try {
      const settingsArray = Object.entries(defaultSettings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
        description: getSettingDescription(key)
      }));

      const { error } = await supabase
        .from('app_settings')
        .insert(settingsArray);

      if (error) throw error;
      
      setSettings(defaultSettings);
    } catch (error) {
      console.error('Error initializing settings:', error);
    }
  };

  const updateSetting = async (key: keyof AppSettings, value: any) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
          description: getSettingDescription(key)
        });

      if (error) throw error;

      setSettings(prev => ({ ...prev, [key]: value }));
      
      toast({
        title: "Configuration mise à jour",
        description: `${key} a été mis à jour avec succès`,
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la configuration",
        variant: "destructive",
      });
    }
  };

  const updateMultipleSettings = async (updates: Partial<AppSettings>) => {
    try {
      const settingsArray = Object.entries(updates).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
        description: getSettingDescription(key)
      }));

      const { error } = await supabase
        .from('app_settings')
        .upsert(settingsArray);

      if (error) throw error;

      setSettings(prev => ({ ...prev, ...updates }));
      
      toast({
        title: "Configuration mise à jour",
        description: "Les paramètres ont été mis à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la configuration",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    updateSetting,
    updateMultipleSettings,
    refreshSettings: fetchSettings
  };
};

const getSettingDescription = (key: string): string => {
  const descriptions: Record<string, string> = {
    usdt_to_xof_rate: 'Taux de conversion USDT vers XOF/FCFA',
    moneroo_gateway_fee_percentage: 'Frais de passerelle Moneroo en pourcentage',
    moneroo_fixed_fee: 'Frais fixe Moneroo en FCFA',
    nowpayments_fee_usdt: 'Frais NOWPayments en USDT',
    mobile_money_fee_percentage: 'Frais Mobile Money en pourcentage',
    usdt_withdrawal_fee: 'Frais de retrait USDT',
    min_usdt: 'Montant minimum USDT',
    min_fcfa: 'Montant minimum FCFA',
    webhook_moneroo_url: 'URL webhook Moneroo',
    webhook_nowpayments_url: 'URL webhook NOWPayments',
    success_url: 'URL de redirection succès',
    cancel_url: 'URL de redirection annulation',
    platform_active: 'Statut actif de la plateforme',
    maintenance_message: 'Message de maintenance',
    resend_api_key: 'Clé API Resend pour l\'envoi d\'emails',
    resend_from_email: 'Adresse email d\'expéditeur Resend',
    password_reset_enabled: 'Activer la réinitialisation de mot de passe par email'
  };
  
  return descriptions[key] || '';
};