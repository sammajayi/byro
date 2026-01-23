# Privy Authentication Implementation

## Overview
This application uses **Privy-only authentication**. All user authentication is handled by Privy on the frontend, and the backend verifies Privy tokens to authenticate users.

## Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│  1. User clicks login/signup button                     │
│     (Frontend: PrivyButton component)                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  2. Privy modal opens                                    │
│     - User authenticates via email/wallet/social         │
│     - Privy handles all authentication                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  3. Privy returns user data and tokens                   │
│     - user.id: did:privy:xxx                            │
│     - privy_access_token: JWT signed by Privy           │
│     - identity_token: JWT signed by Privy               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  4. Frontend sends Privy token to backend                │
│     POST /api/auth/privy/                               │
│     Body: { privy_access_token: "..." }                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  5. Backend verifies Privy token                         │
│     - Uses PRIVY_VERIFICATION_KEY to verify JWT         │
│     - Checks signature, expiration, audience            │
│     - Extracts user ID from token payload               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  6. Backend fetches user details from Privy API          │
│     - Calls Privy API with app credentials              │
│     - Gets email, wallet, and other linked accounts     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  7. Backend creates/updates user in database             │
│     - Find user by privy_id or email                    │
│     - Create new user if doesn't exist                  │
│     - Update existing user if found                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  8. Backend generates JWT tokens                         │
│     - Creates access and refresh tokens                 │
│     - Returns user data and tokens to frontend          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  9. Frontend stores tokens and updates state             │
│     - Saves access token to localStorage                │
│     - Updates Redux state with user data               │
│     - Sets Authorization header for API calls           │
└─────────────────────────────────────────────────────────┘
```

## Implementation Details

### Frontend Components

#### 1. PrivyButton Component
**Location:** `src/components/auth/PrivyButton.jsx`

**Key Features:**
- Uses `useLogin` hook from Privy
- Handles `onComplete` callback after Privy authentication
- Gets Privy access token using `getAccessToken()`
- Sends token to backend for verification
- Updates Redux store on success

**Flow:**
```javascript
const { login, getAccessToken } = usePrivy();

const handleLoginComplete = async ({ user, isNewUser }) => {
  // 1. Get Privy access token
  const privyAccessToken = await getAccessToken();
  
  // 2. Send to backend
  const response = await axiosInstance.post("/auth/privy/", {
    privy_access_token: privyAccessToken,
  });
  
  // 3. Store backend tokens
  API.setAuthToken(response.data.tokens.access);
  dispatch(authSuccess({ user: response.data.user, token: response.data.tokens }));
};

const { login } = useLogin({ onComplete: handleLoginComplete });
```

#### 2. API Service
**Location:** `src/services/api.js`

**Method:** `authenticateWithPrivy(privyAccessToken)`

```javascript
authenticateWithPrivy: async (privyAccessToken) => { 
  const response = await axiosInstance.post("/auth/privy/", { 
    privy_access_token: privyAccessToken,
    token: privyAccessToken, // Fallback field name
  });
  return response.data;
}
```

### Backend Implementation

#### 1. Authentication View
**Location:** `Backend/bryo/views.py`

**Endpoint:** `POST /api/auth/privy/`

**Request Body:**
```json
{
  "privy_access_token": "eyJhbGciOiJFUzI1NiIs...",
  // or
  "token": "eyJhbGciOiJFUzI1NiIs...",
  // or
  "identity_token": "eyJhbGciOiJFUzI1NiIs..."
}
```

**Process:**
1. Extract token from request (supports multiple field names)
2. Verify token using `PrivyAuthService.verify_token()`
3. Extract user ID from verified token
4. Fetch full user data from Privy API
5. Extract email from linked accounts
6. Create or update user in database
7. Generate JWT tokens
8. Return user data and tokens

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 123,
    "email": "user@example.com",
    "username": "user@example.com",
    "privy_id": "cma3yzpqn00ckl70l747lljzk"
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIs...",
    "refresh": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Login successful"
}
```

#### 2. Privy Auth Service
**Location:** `Backend/bryo/services/privy_auth.py`

**Methods:**

**`verify_token(token)`**
- Verifies JWT signature using `PRIVY_VERIFICATION_KEY`
- Checks token expiration
- Validates audience matches `PRIVY_APP_ID`
- Returns decoded token payload or None

**`get_user_data(user_id)`**
- Fetches full user data from Privy API
- Uses Basic Auth with app credentials
- Returns user data including linked accounts

#### 3. Environment Variables
**Location:** `Backend/.env`

Required variables:
```env
PRIVY_APP_ID=""
PRIVY_VERIFICATION_KEY="-----BEGIN PUBLIC KEY-----\nMFkw...g==\n-----END PUBLIC KEY-----"
PRIVY_APP_SECRET="MFkw...g=="
```

### URL Configuration
**Location:** `Backend/bryo/urls.py`

```python
urlpatterns = [
    path('api/auth/privy/', views.privy_login, name='privy_login'),
    # ... other urls
]
```

## Key Differences from Previous Implementation

### Before (Client-side only):
- Frontend sent user email and ID directly to backend
- Backend trusted frontend data without verification
- No token verification
- Security risk: anyone could impersonate users

### After (Backend verification):
- Frontend sends Privy-signed JWT token
- Backend verifies token signature using Privy's public key
- Backend fetches user data from Privy API
- Ensures user data is authentic and not tampered with

## Security Features

1. **Token Verification**: Backend verifies JWT signature using Privy's public key
2. **Expiration Check**: Tokens expire after 1 hour
3. **Audience Validation**: Token must be issued for this specific app
4. **API Verification**: Backend fetches user data from Privy API to ensure authenticity
5. **Database Integrity**: Users linked by both privy_id and email

## Error Handling

### Frontend Errors:
- 400: Invalid token format
- 401: Token verification failed (expired or invalid)
- 500: Server error

All errors show user-friendly toast messages.

### Backend Errors:
- Missing token: 400 Bad Request
- Invalid token: 401 Unauthorized
- Missing email: 400 Bad Request
- Server error: 500 Internal Server Error

## Testing the Flow

### 1. Start Backend:
```bash
cd Backend
python3 manage.py runserver
```

### 2. Start Frontend:
```bash
npm run dev
```

### 3. Test Login:
1. Navigate to the app
2. Click login/signup button
3. Complete Privy authentication
4. Check browser console for logs
5. Verify backend logs show token verification
6. Check database for user record

### 4. Verify Token Storage:
```javascript
// Check localStorage
console.log(localStorage.getItem('authToken'));

// Check Redux state
console.log(store.getState().auth);
```

## Troubleshooting

### Token Verification Fails:
- Check `PRIVY_VERIFICATION_KEY` is correct in `.env`
- Ensure token is not expired (tokens expire after 1 hour)
- Verify `PRIVY_APP_ID` matches the app

### No Email Found:
- User must have an email linked in Privy account
- Check Privy dashboard for user's linked accounts

### Backend Cannot Fetch User Data:
- Check `PRIVY_APP_SECRET` is correct
- Verify network connection to Privy API
- Check backend logs for detailed error messages

## Future Enhancements

1. **Token Refresh**: Implement automatic token refresh using refresh tokens
2. **Logout**: Implement proper logout with token invalidation
3. **Session Management**: Track active sessions
4. **Rate Limiting**: Add rate limiting to auth endpoint
5. **Multi-factor Authentication**: Support Privy MFA methods
