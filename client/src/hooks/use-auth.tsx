import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

interface User {
  id: string;
  name: string;
  email: string;
  isLawyer: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (userId: string, code: string) => Promise<void>;
  verify2FA: (userId: string, code: string, method: string) => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isLawyer?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const { data: user, error } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setIsLoading(false);
  }, [user, error]);

  const login = async (email: string, password: string) => {
    const response = await apiRequest("POST", "/api/auth/login", {
      email,
      password,
    });
    
    if (response.ok) {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    }
  };

  const register = async (userData: RegisterData) => {
    const response = await apiRequest("POST", "/api/auth/register", userData);
    
    if (response.ok) {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    }
  };

  const logout = async () => {
    await apiRequest("POST", "/api/auth/logout", {});
    queryClient.setQueryData(["/api/auth/me"], null);
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  };

  const verifyEmail = async (userId: string, code: string) => {
    const response = await apiRequest("POST", "/api/auth/verify-email", {
      userId,
      code,
    });
    
    if (response.ok) {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    }
  };

  const verify2FA = async (userId: string, code: string, method: string) => {
    const response = await apiRequest("POST", "/api/auth/verify-2fa", {
      userId,
      code,
      method,
    });
    
    if (response.ok) {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    }
  };

  const value: AuthContextType = {
    user: (user as User) || null,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    verifyEmail,
    verify2FA,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}