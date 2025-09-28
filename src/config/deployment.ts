// Deployment configuration for dual backend support

export type DeploymentMode = 'netlify-supabase' | 'hostinger-laravel';

export interface DeploymentConfig {
  mode: DeploymentMode;
  backendType: 'supabase' | 'laravel';
  apiBaseUrl?: string;
  supabaseConfig?: {
    url: string;
    anonKey: string;
  };
  laravelConfig?: {
    apiUrl: string;
    authTokenKey: string;
  };
}

// Determine deployment configuration based on environment
const getDeploymentConfig = (): DeploymentConfig => {
  const backendType = import.meta.env.VITE_BACKEND_TYPE as 'supabase' | 'laravel';
  
  if (backendType === 'laravel') {
    return {
      mode: 'hostinger-laravel',
      backendType: 'laravel',
      laravelConfig: {
        apiUrl: import.meta.env.VITE_LARAVEL_API_URL || 'https://your-domain.com/api',
        authTokenKey: 'auth_token'
      }
    };
  }

  // Default to Supabase (Netlify deployment)
  return {
    mode: 'netlify-supabase',
    backendType: 'supabase',
    supabaseConfig: {
      url: import.meta.env.VITE_SUPABASE_URL || 'https://bvleffevnnugjdwygqyz.supabase.co',
      anonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    }
  };
};

export const deploymentConfig = getDeploymentConfig();

// Helper functions
export const isSupabaseMode = (): boolean => deploymentConfig.backendType === 'supabase';
export const isLaravelMode = (): boolean => deploymentConfig.backendType === 'laravel';

export const getApiBaseUrl = (): string => {
  if (isLaravelMode()) {
    return deploymentConfig.laravelConfig?.apiUrl || '';
  }
  return deploymentConfig.supabaseConfig?.url || '';
};

// Feature flags based on deployment mode
export const features = {
  // Supabase-specific features
  realtimeSubscriptions: isSupabaseMode(),
  edgeFunctions: isSupabaseMode(),
  supabaseAuth: isSupabaseMode(),
  
  // Laravel-specific features
  laravelAuth: isLaravelMode(),
  sanctumTokens: isLaravelMode(),
  laravelQueues: isLaravelMode(),
  
  // Common features available in both modes
  paymentProcessing: true,
  transactionManagement: true,
  adminInterface: true,
  notifications: true,
  userProfiles: true
};

// Environment-specific configurations
export const environment = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // API endpoints
  api: {
    auth: isLaravelMode() ? '/auth' : '/auth/v1',
    transactions: isLaravelMode() ? '/transactions' : '/rest/v1/transactions',
    notifications: isLaravelMode() ? '/notifications' : '/rest/v1/notifications',
    payments: isLaravelMode() ? '/payments' : '/functions/v1'
  },
  
  // Storage configurations
  storage: {
    authToken: isLaravelMode() ? 'auth_token' : 'sb-access-token',
    refreshToken: isLaravelMode() ? 'refresh_token' : 'sb-refresh-token',
    userSession: 'user_session'
  }
};

// Validation
if (isLaravelMode() && !deploymentConfig.laravelConfig?.apiUrl) {
  console.warn('Laravel mode enabled but VITE_LARAVEL_API_URL not configured');
}

if (isSupabaseMode() && (!deploymentConfig.supabaseConfig?.url || !deploymentConfig.supabaseConfig?.anonKey)) {
  console.warn('Supabase mode enabled but Supabase configuration incomplete');
}