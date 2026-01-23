"use client";

import { usePrivy, useLogin, getAccessToken } from "@privy-io/react-auth";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import API from "../../services/api";
import SignupButton from "../SignupButton";
import axiosInstance from "@/utils/axios";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { authSuccess, signOut } from "@/redux/auth/authSlice";
import { clearSupabaseSession } from "@/utils/supabaseAuth";

export default function AuthButton() {
  const { user: reduxUser, token, isAuthenticated } = useSelector((state) => state.auth);
  const { ready, authenticated, user, logout, getAccessToken } = usePrivy();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const router = useRouter();


  const handleLoginComplete = useCallback(
    async ({ user, isNewUser }) => {
      // Check if already authenticated in Redux
      if (isAuthenticated && token) {
        console.log("Already authenticated in Redux, skipping backend call");
        return;
      }

      if (!user?.id) {
        toast.error("Missing user data");
        return;
      }

      // Check if already authenticated in Redux
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        console.log("Already authenticated, skipping backend call");
        return;
      }

      try {
        setLoading(true);
        
        // Get Privy access token (this is the token backend will verify)
        console.log("Getting Privy access token...");
        const privyAccessToken = await getAccessToken();
        
        if (!privyAccessToken) {
          toast.error("Failed to get authentication token");
          console.error("No Privy access token received");
          return;
        }

        console.log("Sending Privy token to backend for verification...");
        
        // Send Privy token to backend for verification
        const response = await axiosInstance.post(
          "/auth/privy/",
          {
            privy_access_token: privyAccessToken,
            token: privyAccessToken, // Fallback field name
            email: user?.email?.address, // Send email if available to avoid API call
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
          console.log("Backend authentication successful");
          
          // Extract access token from tokens object
          const tokens = response.data.tokens;
          const accessToken = tokens?.access || tokens?.access_token || tokens;
          
          // Set token in API immediately
          API.setAuthToken(accessToken);
          
          dispatch(
            authSuccess({
              user: response.data.user,
              token: tokens, // Store full tokens object for refresh token if needed
            })
          );
          
          toast.success(response.data.message || "Successfully signed in!");

          // Navigate based on whether it's a new user
          if (isNewUser) {
            setTimeout(() => router.push("/profile"), 1000);
          } else {
            setTimeout(() => router.push("/events"), 1000);
          }
        } else {
          toast.error("Failed to authenticate");
          console.error("Unexpected response:", response);
          return;
        }
      } catch (error) {
        console.error("Login error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });

        // Handle specific error cases
        if (error.response?.status === 401) {
          toast.error(error.response.data?.error || "Authentication failed. Please try again.");
        } else if (error.response?.status === 500) {
          toast.error("Server error. Please try again later.");
        } else if (error.response?.status === 400) {
          toast.error(error.response.data?.error || "Invalid authentication data");
        } else {
          toast.error("Failed to complete sign in. Please try again.");
        }

        setError(error.message);
      } finally {
        setLoading(false);
      }
    },
    [dispatch, isAuthenticated, token, getAccessToken, router]
  );

  const { login } = useLogin({
    onComplete: handleLoginComplete,
  });

  const handleSignup = async () => {
    if (!ready) {
      console.log("Privy not ready yet");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await login();
      console.log("Privy login completed");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear Supabase session
      await clearSupabaseSession();
      
      // Clear local storage and API token
      if (user?.id) {
        localStorage.removeItem(user.id);
      }
      API.setAuthToken(null);
      
      // Call Privy logout
      await logout();
      
      // Clear Redux state (this will also clear Supabase user ID via signOut)
      dispatch(signOut());

      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
      setError(err.message || "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  // Check if we already have a token

  if (authenticated) {
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

  return <SignupButton onClick={handleSignup} text={"Sign In"} />;
}
