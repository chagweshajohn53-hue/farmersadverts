
import { Product, PaymentRecord, GraduateProfile, PlatformConfig, User, AuthResponse, Dispute, AuditLog } from './types';

// Use environment port or default to 5000 for local dev
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : '/api';

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server Error: ${res.status}`);
  }
  return res.json();
};

export const api = {
  async checkConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
      const data = await res.json();
      return data.database === 'connected';
    } catch (e) { return false; }
  },

  async login(credentials: any): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return await handleResponse(res);
  },

  async signup(userData: any): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return await handleResponse(res);
  },

  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/users`);
    return await handleResponse(res);
  },

  async deleteUser(id: string, adminId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId }),
    });
    await handleResponse(res);
  },

  async getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/products`);
    return await handleResponse(res);
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await handleResponse(res);
  },

  async deleteProduct(productId: string, sellerId: string, role: string = 'seller'): Promise<void> {
    const res = await fetch(`${API_BASE}/products/${productId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId, role }),
    });
    await handleResponse(res);
  },

  async getPayments(): Promise<PaymentRecord[]> {
    const res = await fetch(`${API_BASE}/payments`);
    return await handleResponse(res);
  },

  async submitPayment(data: Partial<PaymentRecord>): Promise<PaymentRecord> {
    const res = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await handleResponse(res);
  },

  async verifyPayment(id: string, status: 'confirmed' | 'rejected', adminId: string): Promise<PaymentRecord> {
    const res = await fetch(`${API_BASE}/payments/${id}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminId }),
    });
    return await handleResponse(res);
  },

  async getDisputes(): Promise<Dispute[]> {
    const res = await fetch(`${API_BASE}/disputes`);
    return await handleResponse(res);
  },

  async createDispute(data: Partial<Dispute>): Promise<Dispute> {
    const res = await fetch(`${API_BASE}/disputes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await handleResponse(res);
  },

  async updateDispute(id: string, data: Partial<Dispute> & { adminId: string }): Promise<Dispute> {
    const res = await fetch(`${API_BASE}/disputes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await handleResponse(res);
  },

  async getGraduates(): Promise<GraduateProfile[]> {
    const res = await fetch(`${API_BASE}/graduates`);
    return await handleResponse(res);
  },

  async createGraduateProfile(data: Partial<GraduateProfile>): Promise<GraduateProfile> {
    const res = await fetch(`${API_BASE}/graduates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await handleResponse(res);
  },

  async getConfig(): Promise<PlatformConfig> {
    const res = await fetch(`${API_BASE}/config`);
    return await handleResponse(res);
  },

  async updateConfig(data: Partial<PlatformConfig>, adminId: string): Promise<PlatformConfig> {
    const res = await fetch(`${API_BASE}/config`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, adminId }),
    });
    return await handleResponse(res);
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/audit-logs`);
    return await handleResponse(res);
  }
};
