'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

interface User {
  id: number;
  phone: string;
  email?: string;
  roles: Array<{
    module: string;
    permissions: Record<string, boolean>;
  }>;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = async () => {
    try {
      setIsLoading(true);

      // Skip auth check entirely while on the login page – nothing to redirect
      if (pathname === '/login') {
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_USER_API_URL}/auth/me`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok || response.status === 401) {
        setUser(null);
        setIsAuthenticated(false);
        // Edge middleware already redirects; nothing more to do
        return;
      }

      const data = await response.json();
      /*
       * Backend returns user object directly (id, phone, email, roles).
       * Older code expected { user: { ... } }. Handle both.
       */
      const receivedUser = (data && data.user) ? data.user : data;

      if (receivedUser && receivedUser.id) {
        setUser(receivedUser as User);
        setIsAuthenticated(true);

        // If we're on the login page while already authenticated, navigate home
        if (pathname === '/login') {
          router.push('/');
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      // Middleware handles redirect
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtp = async (phone: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_USER_API_URL}/auth/signin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone }),
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      toast.success('OTP sent successfully!', {
        description: 'Please check your phone for the OTP.',
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to send OTP';
      toast.error('Failed to send OTP', {
        description: message,
      });
      throw error;
    }
  };

  const verifyOtp = async (phone: string, code: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_USER_API_URL}/auth/verify/otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone, code }),
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      toast.success('Login successful!', {
        description: 'Welcome back!',
      });

      // Refresh auth state after successful login
      await checkAuth();

      // Redirect to home page
      router.push('/');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'OTP verification failed';
      toast.error('Verification failed', {
        description: message,
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_USER_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      setUser(null);
      setIsAuthenticated(false);

      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');

      // Even if logout request fails, clear local state and redirect
      setUser(null);
      setIsAuthenticated(false);
      router.push('/login');
    }
  };

  useEffect(() => {
    checkAuth();
  }, [pathname]); // Re-check auth when route changes

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    sendOtp,
    verifyOtp,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
