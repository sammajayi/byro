"use client";

import { usePrivy, useLogin } from "@privy-io/react-auth";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import API from "../../services/api";
import SignupButton from "../SignupButton";
import axiosInstance from "@/utils/axios";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { authSuccess, signOut } from "@/redux/auth/authSlice";

export default function AuthButton() {
  const {
    user: reduxUser,
    token,
    isAuthenticated,
  } = useSelector((state) => state.auth);

  // Privy state - now synced with backend via PrivySync
  const { ready, authenticated, user, logout } = usePrivy();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const router = useRouter();

  // Log Privy state changes separately to debug
  useEffect(() => {
    console.log("👤 Privy user state updated:", {
      authenticated,
      userId: user?.id,
      email: user?.email?.address,
    });
  }, [authenticated, user]);

  // Log Redux state changes separately
  useEffect(() => {
    console.log("🏪 Redux auth state:", { isAuthenticated, hasToken: !!token });
  }, [isAuthenticated, token]);

  // Backend sync function
  const syncWithBackend = useCallback(
    async (privyUser) => {
      console.log("🔄 syncWithBackend called with:", {
        privyUser,
        isAuthenticated,
      });

      if (!privyUser?.email?.address || !privyUser?.id) {
        console.error("❌ Missing user data from Privy:", privyUser);
        return;
      }

      // Don't sync if already authenticated with backend
      if (isAuthenticated) {
        console.log("✅ Already authenticated with backend, skipping sync");
        return;
      }

      try {
        console.log("📡 Syncing with backend...", privyUser.email.address);

        const response = await axiosInstance.post(
          "/auth/privy/",
          {
            email: privyUser.email.address,
            id: privyUser.id,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            timeout: 10000,
          }
        );

        if (response.status === 200 && response.data) {
          // Store backend JWT in Redux
          dispatch(
            authSuccess({
              user: response.data.user,
              token: response.data.tokens.access,
            })
          );
          toast.success(response.data.message || "Successfully signed in!");
          console.log("✅ Backend sync successful");
        } else {
          toast.error(
            response.data.message ||
              response.data.error ||
              "Failed to save user data"
          );
          console.error("❌ Unexpected response:", response);
        }
      } catch (error) {
        console.error("❌ Backend sync error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });

        if (error.response?.status === 500) {
          toast.error("Server error. Please try again later.");
        } else if (error.response?.status === 400) {
          toast.error(error.response.data?.message || "Invalid user data");
        } else {
          toast.error(
            error.response?.data?.message ||
              "Failed to complete sign in. Please try again."
          );
        }

        setError(error.message);
      }
    },
    [dispatch, isAuthenticated]
  );

  // Use useLogin hook
  const { login } = useLogin({
    onComplete: (user, isNewUser, wasAlreadyAuthenticated) => {
      console.log("🎉 useLogin onComplete fired!", {
        user,
        isNewUser,
        wasAlreadyAuthenticated,
      });
      // Sync with backend immediately after Privy authentication
      syncWithBackend(user);
    },
    onError: (error) => {
      console.error("❌ Privy login error:", error);
      toast.error("Login failed. Please try again.");
    },
  });

  // Monitor authenticated state changes - this is the main sync trigger
  useEffect(() => {
    console.log("🔍 Auth state changed:", {
      authenticated,
      hasUser: !!user,
      userEmail: user?.email?.address,
      isAuthenticated,
    });

    // Sync when Privy auth completes
    if (authenticated && user && !isAuthenticated) {
      console.log("🔄 Triggering backend sync from useEffect");
      syncWithBackend(user);
    }
  }, [authenticated, user, isAuthenticated, syncWithBackend]);

  // Login handler - uses Privy's login flow
  const handleLogin = useCallback(async () => {
    if (!ready) {
      console.log("⏳ Privy not ready yet");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("🚀 Initiating Privy login...");
      console.log("Current state before login:", {
        authenticated,
        user: !!user,
      });

      // Call Privy's login - this will open the modal
      await login();

      console.log("✅ login() promise resolved");
      console.log("State after login:", { authenticated, user: !!user });
    } catch (err) {
      console.error("❌ Login error:", err);
      setError(err.message || "Login failed");
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [ready, login, authenticated, user]);

  const handleLogout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Clear local storage and API token
      localStorage.clear();
      API.setAuthToken(null);

      // Clear Redux state first
      dispatch(signOut());

      // Then logout from Privy
      // PrivySync will automatically sync the logged-out state
      await logout();

      router.push("/");
      toast.success("Logged out successfully");
    } catch (err) {
      console.error("Logout error:", err);
      setError(err.message || "Logout failed");
      toast.error("Logout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while syncing
  if (authenticated && !isAuthenticated) {
    return (
      <SignupButton onClick={() => {}} text={"Syncing..."} disabled={true} />
    );
  }

  // Only show logout if authenticated (Privy state will be synced with backend)
  if (authenticated && isAuthenticated) {
    return (
      <SignupButton
        onClick={handleLogout}
        className="!bg-red-600 !text-white hover:!bg-red-700"
        avatarClassName="!w-8 !h-8"
        textClassName="!text-sm !font-medium"
        showAvatar={true}
        showAddress={true}
        showEmail={true}
        truncateAddress={true}
        text={"Logout"}
      />
    );
  }

  return (
    <SignupButton
      onClick={handleLogin}
      text={loading ? "Signing In..." : "Sign In"}
      disabled={loading || !ready}
    />
  );
}
