export enum AspectRatio {
  SQUARE = "1:1",
  PORTRAIT = "9:16",
  LANDSCAPE = "16:9",
}

export enum ImageStyle {
  AESTHETIC = "Aesthetic",
  CARTOON = "Cartoon",
  PORTRAIT = "Portrait",
  ANIMATED = "Animated",
  THREE_D = "3D Render",
  REALISTIC = "Realistic",
}

export enum ImageQuality {
  STANDARD = "Standard",
  HDR = "HDR",
  FOUR_K = "4K",
  EIGHT_K = "8K",
  SIXTEEN_K = "16K",
}

export enum IssueType {
  BILLING = "Billing & Payments",
  TECHNICAL = "Technical Issue",
  ACCOUNT = "Account Access",
  GENERAL = "General Inquiry",
  FEEDBACK = "Feedback & Suggestions",
}

export interface Favorite {
  id: number;
  userId: number;
  imageUrl: string;
  prompt: string;
  createdAt: string;
}

export interface GenerationHistoryItem {
  id: number;
  userId: number;
  name: string;
  prompt: string;
  style: ImageStyle;
  quality: ImageQuality;
  date: string;
}

export interface CreditPackage {
  credits: number;
  price: number;
  description: string;
}

export interface CreditRequest {
  id: number;
  userId: number;
  name: string;
  email: string;
  transactionId: string;
  amountPaid: number;
  creditPackage: CreditPackage;
  paymentDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminNote?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface Transaction {
  id: number;
  userId: number;
  name: string;
  creditsPurchased: number;
  amountPaid: number;
  date: string;
  status: 'Completed';
}

export interface User {
  id: number;
  name:string;
  email: string;
  password: string;
  credits: number;
  role: 'user' | 'admin';
  createdAt: string;
  avatar?: string;
  favorites: Favorite[];
}

export type ToastMessage = {
  id: number;
  message: string;
  type: 'success' | 'error';
};

export interface SystemSettings {
  maintenanceMode: boolean;
  disabledFeatures: {
    styles: ImageStyle[];
    qualities: ImageQuality[];
  };
}

export interface AdminActivityLog {
  id: number;
  adminId: number;
  adminName: string;
  action: 'add_credits' | 'remove_credits' | 'delete_user' | 'reset_password' | 'update_settings' | 'add_gallery_image' | 'remove_gallery_image' | 'delete_review' | 'resolve_support_ticket' | 'approve_credit_request' | 'reject_credit_request';
  targetUserId?: number;
  targetName?: string;
  details: string;
  timestamp: string;
}

export interface PublicGalleryImage {
  id: string;
  imageUrl: string;
  title: string;
  style: ImageStyle;
  createdAt: string;
  addedBy: number; // Admin user ID
}

export interface SupportMessage {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  issueType: IssueType;
  createdAt: string;
  status: 'Pending' | 'Resolved';
  userId?: number; // Optional: link to user if logged in
}

export interface Review {
  id: number;
  userId: number;
  name: string;
  avatar?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  user: {
      name: string;
      avatar?: string;
  }
}


export interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  toggleFavorite: (favoriteData: Omit<Favorite, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  submitCreditRequest: (requestData: Omit<CreditRequest, 'id' | 'userId' | 'name' | 'email' | 'status' | 'createdAt' | 'resolvedAt' | 'adminNote'>) => Promise<boolean>;
  updateUserProfile: (userId: number, updates: Partial<User>) => Promise<void>;
  deleteMyAccount: () => Promise<void>;
  addReview: (reviewData: { rating: number; comment: string }) => Promise<void>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}