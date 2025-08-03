import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../lib/supabase";
import type { AuthUser, Profile } from "../lib/types";

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ data?: any; error?: Error }>;
  signUp: (data: {
    email: string;
    password: string;
    full_name?: string;
    invite_code: string;
  }) => Promise<{ data?: any; error?: Error }>;
  signInWithApple: () => Promise<{ data?: any; error?: Error }>;
  signInWithGoogle: () => Promise<{ data?: any; error?: Error }>;
  updateProfile: (data: {
    full_name?: string;
    avatar_url?: string;
  }) => Promise<{ data?: any; error?: Error }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { data };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (signUpData: {
    email: string;
    password: string;
    full_name?: string;
    invite_code: string;
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            full_name: signUpData.full_name,
            invite_code: signUpData.invite_code,
          },
        },
      });

      if (error) throw error;

      return { data };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const signInWithApple = async () => {
    try {
      // This would be implemented with expo-apple-authentication
      // For now, return placeholder
      Alert.alert(
        "Coming Soon",
        "Apple Sign In will be available in the next update"
      );
      return { error: new Error("Apple Sign In not implemented yet") };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      // This would be implemented with @react-native-google-signin/google-signin
      // For now, return placeholder
      Alert.alert(
        "Coming Soon",
        "Google Sign In will be available in the next update"
      );
      return { error: new Error("Google Sign In not implemented yet") };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updateProfile = async (data: {
    full_name?: string;
    avatar_url?: string;
  }) => {
    if (!user) return { error: new Error("User not authenticated") };

    try {
      console.log("Updating profile for user:", user.id, "with data:", data);

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          avatar_url: data.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        throw profileError;
      }

      // Refresh profile data
      await refreshProfile();

      return { data: "Profile updated successfully" };
    } catch (error) {
      console.error("Update profile failed:", error);
      return { error: error as Error };
    }
  };

  const refreshProfile = async () => {
    if (!user) return;

    try {
      console.log("Fetching profile for user:", user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        throw error;
      }

      console.log("Profile data fetched:", data);
      setProfile(data);
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user as AuthUser);

          // Get profile
          console.log("Fetching initial profile for user:", session.user.id);
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profileError) {
            console.error("Initial profile fetch error:", profileError);
          } else {
            console.log("Initial profile data:", profileData);
          }

          if (profileData) {
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user as AuthUser);

        // Get profile for new user
        console.log("Fetching profile for auth change, user:", session.user.id);
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("Auth change profile fetch error:", profileError);
        } else {
          console.log("Auth change profile data:", profileData);
        }

        if (profileData) {
          setProfile(profileData);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const contextValue: AuthContextType = {
    user,
    profile,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signInWithApple,
    signInWithGoogle,
    updateProfile,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
