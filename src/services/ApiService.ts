import { supabase } from '@/integrations/supabase/client';

export type BackendType = 'supabase' | 'laravel';

export interface ApiConfig {
  backendType: BackendType;
  laravelBaseUrl?: string;
}

class ApiService {
  private config: ApiConfig;
  private token: string | null = null;

  constructor() {
    // Determine backend type from environment variable
    this.config = {
      backendType: (import.meta.env.VITE_BACKEND_TYPE as BackendType) || 'supabase',
      laravelBaseUrl: import.meta.env.VITE_LARAVEL_API_URL || 'https://your-domain.com/api'
    };

    // Load token from localStorage for Laravel backend
    if (this.config.backendType === 'laravel') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  // Authentication methods
  async signUp(email: string, password: string, userData: any = {}) {
    if (this.config.backendType === 'supabase') {
      return await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
    } else {
      return await this.laravelRequest('POST', '/auth/register', {
        email,
        password,
        password_confirmation: password,
        ...userData
      });
    }
  }

  async signIn(email: string, password: string) {
    if (this.config.backendType === 'supabase') {
      return await supabase.auth.signInWithPassword({ email, password });
    } else {
      const response = await this.laravelRequest('POST', '/auth/login', {
        email,
        password
      });
      
      if (response.success && response.token) {
        this.token = response.token;
        localStorage.setItem('auth_token', response.token);
      }
      
      return response;
    }
  }

  async signOut() {
    if (this.config.backendType === 'supabase') {
      return await supabase.auth.signOut();
    } else {
      const response = await this.laravelRequest('POST', '/auth/logout');
      this.token = null;
      localStorage.removeItem('auth_token');
      return response;
    }
  }

  async getCurrentUser() {
    if (this.config.backendType === 'supabase') {
      return await supabase.auth.getUser();
    } else {
      return await this.laravelRequest('GET', '/auth/user');
    }
  }

  // Transaction methods
  async getTransactions(params: any = {}) {
    if (this.config.backendType === 'supabase') {
      let query = supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (params.status) {
        query = query.eq('status', params.status);
      }

      if (params.limit) {
        query = query.limit(params.limit);
      }

      return await query;
    } else {
      return await this.laravelRequest('GET', '/transactions', params);
    }
  }

  async createTransaction(transactionData: any) {
    if (this.config.backendType === 'supabase') {
      return await supabase
        .from('transactions')
        .insert([transactionData])
        .select()
        .single();
    } else {
      return await this.laravelRequest('POST', '/transactions', transactionData);
    }
  }

  async updateTransaction(id: string, updates: any) {
    if (this.config.backendType === 'supabase') {
      return await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    } else {
      return await this.laravelRequest('PUT', `/transactions/${id}`, updates);
    }
  }

  // Payment processing
  async processPayment(paymentData: any) {
    if (this.config.backendType === 'supabase') {
      if (paymentData.paymentMethod === 'moneroo') {
        return await supabase.functions.invoke('process-moneroo-payment', {
          body: paymentData
        });
      } else {
        return await supabase.functions.invoke('process-nowpayments-payment', {
          body: paymentData
        });
      }
    } else {
      return await this.laravelRequest('POST', `/transactions/${paymentData.transactionId}/payment`, {
        payment_method: paymentData.paymentMethod
      });
    }
  }

  // Notifications
  async getNotifications(params: any = {}) {
    if (this.config.backendType === 'supabase') {
      return await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(params.limit || 50);
    } else {
      return await this.laravelRequest('GET', '/notifications', params);
    }
  }

  async markNotificationAsRead(id: string) {
    if (this.config.backendType === 'supabase') {
      return await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
    } else {
      return await this.laravelRequest('PUT', `/notifications/${id}/read`);
    }
  }

  // Private helper methods
  private async laravelRequest(method: string, endpoint: string, data?: any) {
    const url = `${this.config.laravelBaseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      method,
      headers
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(data);
    } else if (data && method === 'GET') {
      const params = new URLSearchParams(data).toString();
      return fetch(`${url}?${params}`, config).then(this.handleLaravelResponse);
    }

    const response = await fetch(url, config);
    return this.handleLaravelResponse(response);
  }

  private async handleLaravelResponse(response: Response) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
  }

  // Utility methods
  getBackendType(): BackendType {
    return this.config.backendType;
  }

  isSupabase(): boolean {
    return this.config.backendType === 'supabase';
  }

  isLaravel(): boolean {
    return this.config.backendType === 'laravel';
  }
}

export const apiService = new ApiService();