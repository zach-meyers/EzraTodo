import { User } from './models';

// ==================== Auth Context ====================

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
