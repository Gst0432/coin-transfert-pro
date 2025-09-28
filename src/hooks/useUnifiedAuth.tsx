import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { apiService } from '@/services/ApiService';
import { useAuth as useSupabaseAuth } from '@/hooks/useAuth';

interface UnifiedUser {
  id: string;
  email: string;
  display_name?: string;
  phone_number?: string;
  avatar_url?: string;
  roles?: string[];
}

interface UnifiedAuthContextType {
  user: UnifiedUser | null;
  session: Session | null;
  signOut: () => Promise<void>;
  isLoading: boolean;
  backendType: 'supabase' | 'laravel';
}

export const useUnifiedAuth = (): UnifiedAuthContextType => {
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabaseAuth = useSupabaseAuth();

  const backendType = apiService.getBackendType();

  useEffect(() => {
    if (backendType === 'supabase') {
      // Use Supabase authentication
      setUser(supabaseAuth.user ? transformSupabaseUser(supabaseAuth.user) : null);
      setSession(supabaseAuth.session);
      setIsLoading(supabaseAuth.isLoading);
    } else {
      // Use Laravel authentication
      initializeLaravelAuth();
    }
  }, [backendType, supabaseAuth.user, supabaseAuth.session, supabaseAuth.isLoading]);

  const initializeLaravelAuth = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setUser(null);
        setSession(null);
        setIsLoading(false);
        return;
      }

      const response = await apiService.getCurrentUser();
      
      if (response.success && response.user) {
        setUser(transformLaravelUser(response.user));
        // Create a session-like object for compatibility
        setSession({
          user: response.user,
          access_token: token
        } as any);
      } else {
        localStorage.removeItem('auth_token');
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      console.error('Laravel auth initialization error:', error);
      localStorage.removeItem('auth_token');
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    if (backendType === 'supabase') {
      await supabaseAuth.signOut();
    } else {
      try {
        await apiService.signOut();
        setUser(null);
        setSession(null);
      } catch (error) {
        console.error('Laravel signout error:', error);
        // Force local logout even if API call fails
        localStorage.removeItem('auth_token');
        setUser(null);
        setSession(null);
      }
    }
  };

  const transformSupabaseUser = (supabaseUser: User): UnifiedUser => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      display_name: supabaseUser.user_metadata?.display_name,
      phone_number: supabaseUser.user_metadata?.phone_number,
      avatar_url: supabaseUser.user_metadata?.avatar_url,
      roles: supabaseUser.app_metadata?.roles || []
    };
  };

  const transformLaravelUser = (laravelUser: any): UnifiedUser => {
    return {
      id: laravelUser.id,
      email: laravelUser.email,
      display_name: laravelUser.profile?.display_name,
      phone_number: laravelUser.profile?.phone_number,
      avatar_url: laravelUser.profile?.avatar_url,
      roles: laravelUser.roles?.map((role: any) => role.role) || []
    };
  };

  return {
    user,
    session,
    signOut,
    isLoading,
    backendType
  };
};