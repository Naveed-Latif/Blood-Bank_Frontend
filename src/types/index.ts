export interface User {
  blood_type: any
  id: string
  name: string
  last_name: string
  email: string
  phone_number?: string
  blood_group?: string
  last_donation_date?: string
  city?: string
  country?: string
  is_available?: boolean
  totalDonations?: number
}

export interface Donor {
  id: string
  name: string
  blood_group: string
  city: string
  phone_number?: string
  is_available: boolean
  last_donation_date?: string
  totalDonations?: number
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupData {
  name: string
  last_name: string
  email: string
  phone_number: string
  blood_group: string
  last_donation_date?: string
  city: string
  country: string
  password: string
  [key: string]: string | undefined
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}
