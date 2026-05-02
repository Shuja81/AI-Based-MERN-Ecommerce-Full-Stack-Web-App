# Authentication Refactor Guide

This document outlines the changes made to remove OAuth authentication and implement email/password-only authentication with admin-managed merchant accounts.

## Changes Summary

### 1. Removed OAuth Implementation

#### Removed from Frontend:

- **SignupProvider Component** (`client/app/components/Common/SignupProvider/index.js`)
    - Removed Google Sign-In buttons
    - Removed Facebook Login buttons
    - Component now returns null

#### Removed from Backend:

- **Passport Configuration** (`server/config/passport.js`)
    - Removed GoogleStrategy
    - Removed FacebookStrategy
    - Kept only JWT Strategy for token-based authentication

- **Auth Routes** (`server/routes/api/auth.js`)
    - Removed `/auth/google` route
    - Removed `/auth/google/callback` route
    - Removed `/auth/facebook` route
    - Removed `/auth/facebook/callback` route
    - Removed `passport` import

- **Config Keys** (`server/config/keys.js`)
    - Removed google object (clientID, clientSecret, callbackURL)
    - Removed facebook object (clientID, clientSecret, callbackURL)

- **User Model** (`server/models/user.js`)
    - Removed `googleId` field
    - Removed `facebookId` field
    - Made `email` required (no longer conditional)
    - Made `password` required (no longer optional)

### 2. Enhanced Email & Password Authentication

#### Login Endpoint (`POST /api/auth/login`)

- ✅ Email format validation (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- ✅ Password required validation
- ✅ Secure bcrypt password comparison
- ✅ JWT token generation on successful login

#### Register Endpoint (`POST /api/auth/register`)

- ✅ Email format validation
- ✅ Password strength requirement (minimum 6 characters)
- ✅ Full name validation
- ✅ Existing user check
- ✅ Bcrypt password hashing
- ✅ Welcome email via Mailgun
- ✅ Optional newsletter subscription

### 3. Merchant Account Management

#### Merchant Model (`server/models/merchant.js`)

- Added `password` field (string, for storing hashed password)
- Made `email` unique and sparse indexed

#### Add Merchant Endpoint (`POST /api/merchant/add`)

- ✅ Admin-only access (requires authentication and Admin role)
- ✅ Password field is now required
- ✅ Password is hashed using bcrypt (salt rounds: 10)
- ✅ Validates email format
- ✅ Checks for existing merchant with same email
- ✅ Checks for existing user with same email
- ✅ Merchant login email notification

#### New Merchant Login Endpoint (`POST /api/auth/merchant/login`)

- ✅ Email format validation
- ✅ Password required validation
- ✅ Secure bcrypt password comparison
- ✅ JWT token generation with merchant flag (`isMerchant: true`)
- ✅ Returns merchant details (id, name, email, brandName)

### 4. Environment Variables to Remove

The following environment variables are no longer needed and can be removed from `.env`:

```env
# REMOVE THESE:
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
FACEBOOK_CALLBACK_URL=
```

**Note:** Keep all other variables for email (Mailgun/Mailchimp), JWT, Database, and AWS functionality.

## Authentication Flow

### User Registration & Login

1. User signs up with email, name, and password
2. Email is validated for correct format
3. Password is validated (minimum 6 characters)
4. Password is hashed with bcrypt
5. User logs in with email and password
6. JWT token is returned for authenticated requests

### Merchant Account Creation & Login

1. Admin creates merchant account from Admin Dashboard
2. Admin provides: name, email, password, phone, business description
3. Password is hashed with bcrypt
4. Merchant account is created in pending/waiting approval status
5. Merchant logs in using `/api/auth/merchant/login`
6. Merchant provides email and password
7. JWT token is returned with `isMerchant: true` flag

## Security Improvements

- ✅ All passwords hashed with bcrypt (10 salt rounds)
- ✅ Email format validation on registration and login
- ✅ Password strength requirements (minimum 6 characters)
- ✅ JWT tokens for stateless authentication
- ✅ Admin-only merchant creation endpoint
- ✅ Removed dependency on external OAuth providers

## Package Dependencies Status

The following OAuth packages can be safely removed from `package.json` if no longer used elsewhere:

- `passport-google-oauth2`
- `passport-facebook`

Currently, the following are still required:

- `passport` (for JWT strategy)
- `passport-jwt`
- `bcryptjs` (password hashing)
- `jsonwebtoken` (JWT token generation)

## Testing Recommendations

### Test Cases

1. **User Registration**
    - Valid email and password
    - Invalid email format
    - Password too short (<6 characters)
    - Existing email

2. **User Login**
    - Valid credentials
    - Invalid password
    - Non-existent email

3. **Merchant Creation**
    - Admin can create merchant with password
    - Non-admin cannot create merchant
    - Merchant email must be unique

4. **Merchant Login**
    - Valid merchant credentials
    - Invalid password
    - Non-existent merchant

## API Endpoints Summary

| Endpoint                   | Method | Purpose                     | Auth Required |
| -------------------------- | ------ | --------------------------- | ------------- |
| `/api/auth/login`          | POST   | User login                  | No            |
| `/api/auth/register`       | POST   | User registration           | No            |
| `/api/auth/merchant/login` | POST   | Merchant login              | No            |
| `/api/merchant/add`        | POST   | Create merchant account     | Yes (Admin)   |
| `/api/auth/forgot`         | POST   | Request password reset      | No            |
| `/api/auth/reset/:token`   | POST   | Reset password via token    | No            |
| `/api/auth/reset`          | POST   | Change password (logged in) | Yes           |

## Notes

- All OAuth-related imports have been removed
- Frontend SignupProvider component no longer renders OAuth buttons
- Backend Passport configuration has been simplified
- Database migrations may be needed to update existing user records with OAuth fields
