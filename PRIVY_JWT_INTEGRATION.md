# Privy JWT-Based Authentication Integration Guide

## Overview

This project now uses **JWT-based authentication** to sync your Django backend authentication with Privy's SDK. This means:

- ✅ **Single source of truth**: Backend JWT tokens control authentication state
- ✅ **Automatic sync**: Privy SDK automatically syncs with backend auth state
- ✅ **Better UX**: Seamless authentication across frontend and backend
- ✅ **Token management**: Backend handles JWT creation, Privy SDK reflects that state

## Architecture

```
┌─────────────────┐
│   User Login    │
│   (Privy UI)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Backend API     │
│ /auth/privy/    │ ◄── Creates user & issues JWT
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Redux Store    │
│  (token saved)  │ ◄── Stores JWT token
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PrivySync     │
│   Component     │ ◄── Syncs JWT with Privy SDK
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Privy SDK     │
│  (authenticated)│ ◄── Reflects backend auth state
└─────────────────┘
```

## Key Components

### 1. **PrivySync Component** (`src/components/auth/PrivySync.tsx`)

This component bridges your backend JWT authentication with Privy's SDK:

```typescript
useSubscribeToJwtAuthWithFlag({
  enabled: true,
  isAuthenticated: isAuthenticated, // From Redux
  isLoading: false,
  getExternalJwt: () => token, // Your backend JWT
});
```

**What it does:**

- Monitors Redux auth state
- Provides backend JWT to Privy SDK
- Keeps Privy SDK in sync with backend authentication
- Must remain mounted throughout app lifetime

### 2. **Updated AuthProvider** (`src/app/privy/AuthProvider.tsx`)

Provider hierarchy is critical:

```tsx
<Providers>
  {" "}
  {/* Redux Provider */}
  <PrivyProvider>
    {" "}
    {/* Privy SDK */}
    <PrivySync /> {/* Sync component - MUST be below both */}
    {children}
  </PrivyProvider>
</Providers>
```

### 3. **Updated AuthButton** (`src/components/auth/PrivyButton.jsx`)

Simplified authentication flow:

- Uses Privy's login UI
- Syncs with backend after Privy authentication
- Backend issues JWT, which PrivySync automatically syncs
- Logout clears both Redux state and Privy state

## Authentication Flow

### Login Flow

1. **User clicks "Sign In"**

   ```javascript
   handleLogin() → Privy login modal opens
   ```

2. **User authenticates with Privy**

   - Email, wallet, or social login
   - Privy handles the authentication

3. **Backend sync triggered**

   ```javascript
   useEffect detects authenticated === true
   → POST /auth/privy/ with user data
   → Backend creates/finds user
   → Backend issues JWT tokens
   ```

4. **JWT stored in Redux**

   ```javascript
   dispatch(
     authSuccess({
       user: response.data.user,
       token: response.data.tokens.access,
     })
   );
   ```

5. **PrivySync syncs JWT with Privy**
   ```javascript
   useSubscribeToJwtAuthWithFlag detects token change
   → Provides JWT to Privy SDK
   → Privy SDK updates authenticated state
   ```

### Logout Flow

1. **User clicks "Logout"**
2. **Clear Redux state**
   ```javascript
   dispatch(signOut());
   ```
3. **PrivySync detects unauthenticated state**
   - Automatically syncs with Privy SDK
4. **Privy logout called**
   ```javascript
   await logout();
   ```

## Configuration

### Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_PRIVY_CLIENT_ID=your_privy_client_id
```

### Backend Configuration

Your Django backend at `/auth/privy/` should:

1. Accept `email` and `id` (Privy ID)
2. Create or fetch user
3. Return JWT tokens:

```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "user",
    "privy_id": "abc123"
  },
  "tokens": {
    "access": "eyJ...",
    "refresh": "eyJ..."
  },
  "message": "Login successful"
}
```

## Benefits of This Approach

### ✅ Single Source of Truth

- Backend JWT controls authentication
- No dual-state management confusion
- Clear separation of concerns

### ✅ Better Security

- Backend validates and issues tokens
- JWT stored securely in Redux (with persist)
- Privy SDK syncs automatically

### ✅ Simpler Code

- No manual state synchronization
- `PrivySync` handles everything
- Less error-prone

### ✅ Wallet Features Still Work

- Users can still connect wallets
- Privy's embedded wallets still function
- All Privy features available

## Usage Examples

### Checking Auth Status

```typescript
import { usePrivy } from "@privy-io/react-auth";
import { useSelector } from "react-redux";

function MyComponent() {
  // Both reflect the same state now
  const { authenticated, user } = usePrivy();
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  // They should be in sync!
  console.log(authenticated === isAuthenticated); // true
}
```

### Making Authenticated API Calls

```typescript
import axiosInstance from "@/utils/axios";

// Token is automatically included by axios interceptor
const response = await axiosInstance.get("/api/events/");
```

### Protecting Routes

```typescript
import { usePrivy } from "@privy-io/react-auth";

function ProtectedPage() {
  const { authenticated, ready } = usePrivy();

  if (!ready) return <div>Loading...</div>;
  if (!authenticated) return <div>Please log in</div>;

  return <div>Protected content</div>;
}
```

## Troubleshooting

### Issue: "User not syncing with backend"

**Check:**

1. PrivySync component is mounted
2. Redux state is updating correctly
3. Backend `/auth/privy/` endpoint is working
4. Network requests are succeeding

**Debug:**

```javascript
// In PrivySync.tsx, add logging:
console.log("Auth state:", { isAuthenticated, token });
```

### Issue: "Privy and Redux states don't match"

**Likely cause:** PrivySync not mounted or not receiving updates

**Fix:**

1. Ensure PrivySync is in AuthProvider
2. Check Redux Persist is working
3. Clear localStorage and retry

### Issue: "Token not being sent to API"

**Check:**

1. Axios interceptor is configured
2. Token is in Redux state
3. API endpoint is correct

## Advanced: Custom Backend Login

If you want to login through backend first (not Privy UI), modify `PrivyButton.jsx`:

```javascript
const handleCustomLogin = async (email, password) => {
  // 1. Login to your backend
  const response = await axiosInstance.post("/auth/login/", {
    email,
    password,
  });

  // 2. Store JWT in Redux
  dispatch(
    authSuccess({
      user: response.data.user,
      token: response.data.tokens.access,
    })
  );

  // 3. PrivySync will automatically sync with Privy SDK!
};
```

## Alternative: Advanced State Sync (Not Recommended)

For auth providers outside React or without `isAuthenticated` flag, use `useSyncJwtBasedAuthState`:

```typescript
import { useSyncJwtBasedAuthState } from "@privy-io/react-auth";

useSyncJwtBasedAuthState({
  subscribe: (onAuthStateChange) => {
    // Subscribe to your auth store
    const unsubscribe = store.subscribe(() => {
      onAuthStateChange();
    });
    return unsubscribe;
  },
  getExternalJwt: () => {
    const state = store.getState();
    return state.auth.token;
  },
});
```

**Why not recommended:** More complex, harder to debug, unnecessary for most cases.

## Next Steps

1. ✅ **Test the integration**: Try logging in and out
2. ✅ **Check network tab**: Verify JWT is being sent
3. ✅ **Monitor console**: Check for any sync errors
4. ✅ **Test protected routes**: Ensure auth is working
5. ✅ **Test wallet features**: Verify Privy features still work

## Resources

- [Privy JWT Auth Docs](https://docs.privy.io/authentication/user-authentication/jwt-based-auth/usage)
- [useSubscribeToJwtAuthWithFlag Hook](https://docs.privy.io/authentication/user-authentication/jwt-based-auth/usage#subscribing-to-the-auth-providers-state)
- [Django REST Framework JWT](https://django-rest-framework-simplejwt.readthedocs.io/)

## Questions?

If you have questions about this integration:

1. Check console logs for sync errors
2. Verify Redux state with Redux DevTools
3. Test backend endpoint with Postman
4. Review Privy SDK authenticated state

The key is that **PrivySync** automatically keeps everything in sync - you just manage your Redux auth state as normal!
