import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import API from "../../services/api";

export default function AuthButton() {
  const { ready, authenticated, user, login, getAccessToken, logout } = usePrivy();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Effect to handle token exchange after authentication
  useEffect(() => {
    const handleTokenExchange = async () => {
      if (!authenticated || !user) return;

      try {
        setLoading(true);
        setError(null);
        
        // Get access token from Privy
        const accessToken = await getAccessToken();
        if (!accessToken) {
          throw new Error("Failed to get access token from Privy");
        }


        // Exchange Privy access token for our backend token
        const response = await API.getPrivyToken(accessToken);
        console.log("Backend token response:", response);
        
        if (response?.token) {
          // Store the token
          localStorage.setItem("accessToken", response.token);
          // Set auth token for future requests
          API.setAuthToken(response.token);
          setSuccess(true);
        } else {
          throw new Error("Invalid token response from backend");
        }
      } catch (err) {
        console.error("Authentication error:", err);
        setError(err.message || "Authentication failed");
        // Don't logout on token exchange failure
        // Just clean up the local storage
        localStorage.removeItem("accessToken");
        API.setAuthToken(null);
      } finally {
        setLoading(false);
      }
    };

    // Only run token exchange if we have a user and are authenticated
    if (authenticated && user) {
      handleTokenExchange();
    }
  }, [authenticated, user, getAccessToken]);

  const handleSignup = async () => {
    if (!ready) return;
    
    try {
      setLoading(true);
      setError(null);
      await login();
      // The useEffect will handle the token exchange after authentication
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
      setLoading(false);
    }
  };

  // Check if we already have a token
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      API.setAuthToken(token);
      setSuccess(true);
    }
  }, []);

  if (success) {
    return (
      <div className="p-4 bg-green-100 text-green-800 rounded">
        Signup successful! Welcome aboard.
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleSignup}
        disabled={loading || !ready}
        className="w-full bg-[linear-gradient(126.34deg,_#0057FF_0%,_#4F8BFF_86.18%)] hover:bg-blue-00 text-white font-medium py-2 px-4 rounded disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Processing..." : "Sign Up"}
      </button>
{/* 
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )} */}

      {/* {authenticated && !success && !error && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p>Completing your signup...</p>
        </div>
      )} */}
    </>
  );
}