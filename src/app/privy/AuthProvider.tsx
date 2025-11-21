"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { Providers } from "@/redux/Providers";
import { ReactNode } from "react";
import PrivySync from "@/components/auth/PrivySync";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const clientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID;

  if (!appId) {
    throw new Error(
      "NEXT_PUBLIC_PRIVY_APP_ID is not set in environment variables"
    );
  }

  return (
    <Providers>
      <PrivyProvider
        appId={appId}
        clientId={clientId}
        config={{
          // Create embedded wallets for users who don't have a wallet
          embeddedWallets: {
            createOnLogin: "users-without-wallets",
          },
          appearance: {
            // theme: 'light',
            // accentColor: '#FF6600',
            logo: "/assets/images/logo.svg",
          },
          // Enable external JWT authentication
          externalWallets: {
            coinbaseWallet: {
              connectionOptions: "smartWalletOnly",
            },
          },
        }}
      >
        {/* Sync component must be below PrivyProvider */}
        <PrivySync />
        {children}
      </PrivyProvider>
    </Providers>
  );
}
