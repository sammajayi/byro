"use client";

import { useEffect } from "react";
import { useSubscribeToJwtAuthWithFlag } from "@privy-io/react-auth";
import { useSelector } from "react-redux";
import axiosInstance from "@/utils/axios";

/**
 * This component syncs your backend JWT authentication with Privy
 * It should be mounted throughout your app's lifetime
 */
export default function PrivySync() {
  const { token, isAuthenticated, user } = useSelector(
    (state: any) => state.auth
  );

  // Get fresh token from your backend
  const getBackendJwt = async () => {
    if (isAuthenticated && token) {
      // You can refresh the token here if needed
      return token;
    }
    return null;
  };

  // Subscribe Privy to your backend's authentication state
  useSubscribeToJwtAuthWithFlag({
    enabled: true, // Set to false to disable sync
    isAuthenticated: isAuthenticated,
    isLoading: false, // Set based on your loading state if needed
    getExternalJwt: getBackendJwt,
  });

  return null; // This component doesn't render anything
}
