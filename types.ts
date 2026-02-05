
export type Role = 'admin' | 'seller' | 'buyer' | 'graduate';

export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  whatsapp?: string;
  location?: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  status: 'active' | 'sold' | 'disabled';
  createdAt: string;
}

export interface PaymentRecord {
  _id: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'rejected';
  reference?: string;
  createdAt: string;
}

export interface Dispute {
  _id: string;
  paymentId: string;
  creatorId: string;
  reason: string;
  status: 'open' | 'under_review' | 'resolved' | 'rejected';
  resolutionNotes?: string;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  adminId: string;
  action: string;
  entityId: string;
  details: string;
  createdAt: string;
}

export interface GraduateProfile {
  _id: string;
  userId: string;
  userName: string;
  degree: string;
  institution: string;
  year: number;
  bio: string;
  skills: string[];
  certificateUrl?: string;
  approved: boolean;
  contactEmail: string;
  contactWhatsApp?: string;
  createdAt: string;
}

export interface PlatformConfig {
  paymentNumber: string;
  methods: string[];
  contactEmail: string;
  contactWhatsApp: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
}
