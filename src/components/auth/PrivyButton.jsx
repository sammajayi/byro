"use client";

import { usePrivy, useIdentityToken, useLogin } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "../../services/api";
import SignupButton from "../SignupButton";
import axiosInstance from "@/utils/axios";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { authSuccess, signOut } from "@/redux/auth/authSlice";

export default function AuthButton() {
  const { ready, authenticated, user, getAccessToken, logout, getIdToken } =
    usePrivy();
  // const { identityToken } = useIdentityToken();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const router = useRouter();

  const { login } = useLogin({
    onComplete: async ({ user }) => {
      if (!user?.email?.address || !user?.id) {
        toast.error("Missing user data");
        return;
      }

      try {
        setLoading(true);

        console.log("Sending user data:", {
          email: user.email.address,
          id: user.id,
        });

        const response = await axiosInstance.post(
          "/auth/privy/",
          {
            email: user.email.address,
            id: user.id,
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
          console.log("User data saved successfully:", response);
          dispatch(
            authSuccess({
              user: response.data.user,
              token: response.data.tokens,
            })
          );
          toast.success(response.data.message || "Successfully signed in!");

          // router.push("/events");
        } else {
          toast.error(response.data.message || response.data.error || "Failed to save user data");
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
        if (error.response?.status === 500) {
          toast.error("Server error. Please try again later.");
        } else if (error.response?.status === 400) {
          toast.error(error.response.data?.message || "Invalid user data");
        } else {
          toast.error(error.response.data?.message || "Failed to complete sign in. Please try again.");
        }

        setError(error.message);
      } finally {
        setLoading(false);
      }
    },
  });

  // useEffect(() => {
  //   const handleTokenExchange = async () => {
  //     if (!authenticated || !user) return;

  //     try {
  //       console.log("Starting token exchange...");
  //       setLoading(true);
  //       setError(null);

  //       // Get access token from Privy
  //       console.log("Getting access token from Privy...");
  //       const accessToken = await getAccessToken();

  //       if (!accessToken) {
  //         throw new Error("Failed to get access token from Privy");
  //       }
  //       if (!identityToken) {
  //         throw new Error("Failed to get identity token from Privy");
  //       }
  //       console.log("Got access and identity tokens from Privy", { accessToken, identityToken });

  //       // Send both tokens to backend
  //       const accessTokenResponse = await API.getPrivyToken(accessToken);
  //       const identityTokenResponse = await API.getIdToken(identityToken);

  //       console.log("Backend access token response:", accessTokenResponse);
  //       console.log("Backend identity token response:", identityTokenResponse);

  //       // Use the identity token's backend response for auth
  //       if (identityTokenResponse?.token) {
  //         localStorage.setItem("accessToken", identityTokenResponse.token); // Use identity token's backend response as main token
  //         API.setAuthToken(identityTokenResponse.token);
  //         // Optionally, store the access token response separately if you want
  //         localStorage.setItem("privyAccessToken", accessTokenResponse.token);
  //         console.log("Token exchange successful, redirecting to events...");
  //         router.push("/events");
  //       } else {
  //         throw new Error("Invalid token response from backend");
  //       }
  //     } catch (err) {
  //       console.error("Authentication error:", err);
  //       setError(err.message || "Authentication failed");
  //       // Don't logout on token exchange failure
  //       // Just clean up the local storage
  //       localStorage.removeItem("accessToken");
  //       localStorage.removeItem("identityToken");
  //       API.setAuthToken(null);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   // Only run token exchange if we have a user and are authenticated
  //   if (authenticated && user) {
  //     handleTokenExchange();
  //   }
  // }, [authenticated, user, getAccessToken, router]);

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
      // Clear local storage and API token
      localStorage.removeItem(user);
      API.setAuthToken(null);
      // Call Privy logout
      await logout();
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
