// Shared types for BinQR mobile app
// Based on web app types

export interface AuthUser {
  id: string;
  email: string;
  email_confirmed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  invite_code?: string;
  invited_by?: string;
  has_completed_onboarding?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Box {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  location_id?: string;
  qr_code: string;
  qr_code_url?: string;
  photo_urls: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
  // Joined data
  location?: Location;
}

export interface Location {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  // Computed
  box_count?: number;
}

export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
}

export interface CreateBoxFormData {
  name: string;
  description?: string;
  location_id?: string;
  tags: string[];
  photos: string[];
}

export interface CreateLocationFormData {
  name: string;
  description?: string;
}

export interface InviteValidationResult {
  valid: boolean;
  message?: string;
  invite?: {
    id: string;
    code: string;
    created_by: string;
    is_used: boolean;
    expires_at: string;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: Error;
}

// Search types
export interface SearchFilters {
  query?: string;
  location_id?: string;
  tags?: string[];
  has_photos?: boolean;
}

export interface SearchResult {
  boxes: Box[];
  locations: Location[];
  total_count: number;
}

// Mobile-specific types
export interface CameraPermissions {
  granted: boolean;
  canAskAgain: boolean;
}

export interface ScannedQRCode {
  data: string;
  type: string;
}

export interface AppState {
  isOnline: boolean;
  hasNetworkError: boolean;
  lastSyncTime?: Date;
} 