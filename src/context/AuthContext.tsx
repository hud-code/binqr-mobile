import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { AuthUser, Profile } from "../lib/types";

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  needsOnboarding: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ data?: any; error?: Error }>;
  signUp: (data: {
    email: string;
    password: string;
    full_name?: string;
    invite_code?: string;
  }) => Promise<{ data?: any; error?: Error }>;
  updateProfile: (data: {
    full_name?: string;
    avatar_url?: string;
  }) => Promise<{ data?: any; error?: Error }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error?: Error }>;
  refreshProfile: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
  resendVerificationEmail: (email: string) => Promise<{ data?: any; error?: Error }>;
  completeOnboarding: () => Promise<void>;
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
  const isEmailVerified = !!user?.email_confirmed_at;
  const needsOnboarding = !!profile && !profile.has_completed_onboarding;

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
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            full_name: signUpData.full_name,
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

  /**
   * Deletes the signed-in user's app data and auth user via RPC
   * `delete_own_account` (see supabase/migrations/). Falls back to
   * client-side data wipe + sign-out if the RPC is not deployed yet.
   */
  const deleteAccount = async () => {
    if (!user) {
      return { error: new Error("User not authenticated") };
    }

    const userId = user.id;

    try {
      const { error: rpcError } = await supabase.rpc("delete_own_account");

      if (!rpcError) {
        setUser(null);
        setProfile(null);
        try {
          await supabase.auth.signOut();
        } catch {
          // Session may already be invalid after auth.users delete
        }
        return {};
      }

      console.warn(
        "delete_own_account RPC unavailable, falling back to client wipe:",
        rpcError.message
      );

      // Fallback: wipe user-owned rows with the anon/authenticated client
      const { data: userBoxes } = await supabase
        .from("boxes")
        .select("id")
        .eq("user_id", userId);

      const boxIds = (userBoxes ?? []).map((b) => b.id);
      if (boxIds.length > 0) {
        await supabase.from("box_contents").delete().in("box_id", boxIds);
      }

      await supabase.from("boxes").delete().eq("user_id", userId);
      await supabase.from("locations").delete().eq("user_id", userId);
      await supabase.from("profiles").delete().eq("id", userId);

      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);

      // auth.users cannot be deleted from the anon client without the RPC.
      // Prefer deploying supabase/migrations/20260801_delete_own_account.sql.
      return {};
    } catch (error) {
      console.error("Error deleting account:", error);
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
      console.log("Refreshing profile for user:", user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Profile refresh error:", error);
        throw error;
      }

      console.log("Profile data refreshed:", data);
      setProfile(data);
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  const checkEmailVerification = async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email_confirmed_at) {
        setUser(session.user as AuthUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking email verification:", error);
      return false;
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;

      return { data };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const completeOnboarding = async () => {
    if (!user || !profile) return;

    try {
      console.log("Completing onboarding for user:", user.id);
      
      const { error } = await supabase
        .from("profiles")
        .update({
          has_completed_onboarding: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }

      console.log("Onboarding completed successfully, refreshing profile...");

      // Update local state immediately to prevent UI lag
      setProfile(prev => prev ? { ...prev, has_completed_onboarding: true } : null);

      // Also refresh from database to ensure consistency
      await refreshProfile();
    } catch (error) {
      console.error("Error completing onboarding:", error);
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
            
            // If profile doesn't exist, create it (this handles new signups)
            if (profileError.code === 'PGRST116') { // No rows returned
              console.log("Creating new profile for user:", session.user.id);
              try {
                const { data: newProfile, error: createError } = await supabase
                  .from("profiles")
                  .insert({
                    id: session.user.id,
                    email: session.user.email!,
                    full_name: session.user.user_metadata?.full_name || null,
                    has_completed_onboarding: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  })
                  .select()
                  .single();

                if (createError) {
                  console.error("Error creating profile:", createError);
                } else {
                  console.log("Profile created successfully:", newProfile);
                  setProfile(newProfile);
                }
              } catch (error) {
                console.error("Failed to create profile:", error);
              }
            }
          } else {
            console.log("Initial profile data:", profileData);
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
            
            // If profile doesn't exist, create it (this handles new signups)
            if (profileError.code === 'PGRST116') { // No rows returned
              console.log("Creating new profile for user:", session.user.id);
              try {
                const { data: newProfile, error: createError } = await supabase
                  .from("profiles")
                  .insert({
                    id: session.user.id,
                    email: session.user.email!,
                    full_name: session.user.user_metadata?.full_name || null,
                    has_completed_onboarding: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  })
                  .select()
                  .single();

                if (createError) {
                  console.error("Error creating profile:", createError);
                } else {
                  console.log("Profile created successfully:", newProfile);
                  setProfile(newProfile);
                }
              } catch (error) {
                console.error("Failed to create profile:", error);
              }
            }
          } else {
            console.log("Auth change profile data:", profileData);
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
    isEmailVerified,
    needsOnboarding,
    signIn,
    signUp,
    updateProfile,
    signOut,
    deleteAccount,
    refreshProfile,
    checkEmailVerification,
    resendVerificationEmail,
    completeOnboarding,
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
