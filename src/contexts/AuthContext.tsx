import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  loginUser,
  signupUser,
  logoutUser,
  getCurrentUser,
  updateCurrentUser,
} from "../api/auth.api";
import { User, AuthContextType, LoginCredentials, SignupData } from "../types";

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("Token");
        if (token) {
          const userData = await getCurrentUser();
          setUser(userData);
        }
      } catch {
        localStorage.removeItem("Token");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async ({ username, password }: LoginCredentials) => {
    try {
      await loginUser(username, password);
      const userData = await getCurrentUser();
      setUser(userData);
      toast.success("Welcome back!");
    } catch (error: unknown) {
      toast.error("Login failed. Please check your credentials.");
      throw error;
    }
  };

  const signup = async (data: SignupData) => {
    try {
      await signupUser(data);
      await login({
        username: data.email || data.phone_number || "",
        password: data.password,
      });
      toast.success("Account created successfully!");
    } catch (error: unknown) {
      toast.error("Signup failed. Please try again.");
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      toast.success("Logged out successfully.");
    }
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      const updated = await updateCurrentUser(data);
      setUser(updated);
      toast.success("Profile updated!");
    } catch (error: unknown) {
      toast.error("Update failed. Please try again.");
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
