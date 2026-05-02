# Authentication System Refactor - Changelog

## Summary

Complete refactoring of the MERN E-Commerce application's authentication system to:

- Remove all OAuth implementations (Google & Facebook)
- Implement email & password-only authentication
- Add admin-managed merchant account creation with passwords
- Add merchant login capability
- Improve email format and password strength validation

---

## Files Modified

### Backend - Server

#### 1. **`server/routes/api/auth.js`**

**Changes:**

- ❌ Removed `passport` import
- ✅ Added `Merchant` model import for merchant authentication
- ✅ Enhanced `/login` endpoint:
    - Added email format validation (regex)
    - Improved error messages
- ✅ Enhanced `/register` endpoint:
    - Added email format validation
    - Added password strength validation (minimum 6 characters)
    - Improved validation error messages
- ❌ Removed `/google` route
- ❌ Removed `/google/callback` route
- ❌ Removed `/facebook` route
- ❌ Removed `/facebook/callback` route
- ✅ **NEW:** Added `/merchant/login` endpoint
    - Email format validation
    - Password validation
    - Returns merchant data with JWT token

---

#### 2. **`server/config/passport.js`**

**Changes:**

- ❌ Removed `GoogleStrategy` import
- ❌ Removed `FacebookStrategy` import
- ❌ Removed `googleAuth()` function
- ❌ Removed `facebookAuth()` function
- ❌ Removed passport initialization for OAuth strategies
- ✅ Kept JWT strategy for token-based authentication

---

#### 3. **`server/config/keys.js`**

**Changes:**

- ❌ Removed `google` object (clientID, clientSecret, callbackURL)
- ❌ Removed `facebook` object (clientID, clientSecret, callbackURL)

---

#### 4. **`server/models/user.js`**

**Changes:**

- ❌ Removed `googleId` field
- ❌ Removed `facebookId` field
- ✅ Made `email` field required (changed from conditional)
- ✅ Made `password` field required (changed from optional)
- ✅ Email is now unique and sparse indexed

---

#### 5. **`server/models/merchant.js`**

**Changes:**

- ✅ **NEW:** Added `password` field (String, for hashed passwords)
- ✅ Made `email` field unique and sparse indexed

---

#### 6. **`server/routes/api/merchant.js`**

**Changes:**

- ✅ Enhanced `/add` POST endpoint (Create Merchant):
    - ✅ Added authentication requirement (admin only)
    - ✅ Added password field requirement
    - ✅ Added password hashing with bcrypt (10 salt rounds)
    - ✅ Added email existence checks for both merchants and users
    - ✅ Improved validation and error messages
    - ✅ Improved response message

---

### Frontend - Client

#### 1. **`client/app/components/Common/SignupProvider/index.js`**

**Changes:**

- ❌ Removed Google Sign-In button and link
- ❌ Removed Facebook Login button and link
- ❌ Removed GoogleIcon and FacebookIcon imports
- ✅ Component now returns `null` (no-op component)

---

#### 2. **`client/app/components/Common/Icon/index.js`**

**Changes:**

- ❌ Removed `GoogleIcon` function definition
- ❌ Removed `FacebookIcon` function definition
- ❌ Removed GoogleIcon and FacebookIcon from exports

---

### Documentation

#### 1. **`AUTH_REFACTOR_GUIDE.md`** (NEW)

Complete guide documenting:

- All changes made to remove OAuth
- Enhanced email/password authentication flow
- Merchant account management workflow
- Environment variables to remove
- Security improvements
- API endpoint reference

#### 2. **`TEST_AUTHENTICATION.sh`** (NEW)

Bash script with curl examples for testing:

- User registration
- User login
- Email validation
- Password strength validation
- Merchant creation (admin only)
- Merchant login

---

## API Endpoints Reference

### User Authentication

| Method | Endpoint                 | Purpose         | Auth | Validation                                    |
| ------ | ------------------------ | --------------- | ---- | --------------------------------------------- |
| POST   | `/api/auth/login`        | User login      | No   | Email format, password required               |
| POST   | `/api/auth/register`     | User signup     | No   | Email format, password ≥6 chars, unique email |
| POST   | `/api/auth/forgot`       | Forgot password | No   | Valid email                                   |
| POST   | `/api/auth/reset/:token` | Reset password  | No   | Valid token                                   |
| POST   | `/api/auth/reset`        | Change password | Yes  | Valid current password                        |

### Merchant Authentication

| Method | Endpoint                   | Purpose         | Auth        | Validation                           |
| ------ | -------------------------- | --------------- | ----------- | ------------------------------------ |
| POST   | `/api/auth/merchant/login` | Merchant login  | No          | Email format, password required      |
| POST   | `/api/merchant/add`        | Create merchant | Yes (Admin) | All fields required, password hashed |

---

## Security Improvements

### Password Security

- ✅ All passwords hashed with bcrypt (10 salt rounds)
- ✅ Password strength requirement: minimum 6 characters
- ✅ Secure password comparison using bcrypt
- ✅ Passwords are never returned in API responses

### Email Security

- ✅ Email format validation on registration
- ✅ Email format validation on login
- ✅ Email format validation on merchant login
- ✅ Unique email constraints at database level

### Authentication

- ✅ JWT tokens for stateless authentication
- ✅ Token expiration (7 days default)
- ✅ Removed dependency on external OAuth providers
- ✅ Admin-only merchant creation endpoint

### Data Integrity

- ✅ Removed OAuth-specific fields from user model
- ✅ Required password field eliminates null password accounts
- ✅ Merchant email unique constraint prevents duplicates

---

## Environment Variables

### Variables to Remove from `.env`

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
FACEBOOK_CALLBACK_URL=
```

### Keep All Other Variables

- JWT configuration (JWT_SECRET)
- Database (MONGO_URI)
- Email services (MAILGUN*\*, MAILCHIMP*\*)
- AWS configuration
- Client URL and API URL

---

## Breaking Changes

⚠️ **Important:** These are breaking changes that may affect existing functionality:

1. **OAuth Removed:** Users who logged in via Google/Facebook can no longer use those methods
2. **Merchant Creation:** Merchants are now created by admins with passwords, not via self-signup
3. **User Model:** Existing users with OAuth providers will have `provider` field but no password

### Migration Notes

If you have existing users with OAuth providers:

1. Existing users can use password reset feature to create a password
2. Admins should manually create merchant accounts with passwords
3. Consider notifying users about the authentication changes

---

## Package Dependencies

### Can be Removed

These OAuth packages are no longer used and can be removed:

- `passport-google-oauth2`
- `passport-facebook`

### Still Required

These packages are still needed:

- `passport` (JWT strategy)
- `passport-jwt`
- `bcryptjs` (password hashing)
- `jsonwebtoken` (JWT generation)

### Update package.json

```bash
npm uninstall passport-google-oauth2 passport-facebook
npm install  # Update node_modules
```

---

## Testing Checklist

### User Registration

- [ ] Valid registration succeeds
- [ ] Invalid email format rejected
- [ ] Password < 6 characters rejected
- [ ] Duplicate email rejected
- [ ] Verification email sent

### User Login

- [ ] Valid login succeeds
- [ ] Invalid password rejected
- [ ] Non-existent user rejected
- [ ] JWT token returned

### Merchant Management

- [ ] Admin can create merchant with password
- [ ] Non-admin cannot create merchant
- [ ] Merchant with duplicate email rejected
- [ ] Merchant password hashed securely

### Merchant Login

- [ ] Merchant login succeeds with correct credentials
- [ ] Merchant login fails with wrong password
- [ ] JWT token returned on success
- [ ] Merchant data included in response

---

## Deployment Considerations

1. **Database:** No migration needed, but existing OAuth fields will be unused
2. **Environment:** Remove OAuth variables from deployment configs
3. **Frontend:** Recompile React app to remove unused OAuth imports
4. **Notifications:** Inform users about authentication changes
5. **Testing:** Run full authentication test suite before deploying

---

## Rollback Plan (if needed)

To rollback to OAuth-based authentication:

1. Restore original `passport.js` configuration
2. Restore original auth routes with OAuth endpoints
3. Restore GoogleIcon and FacebookIcon components
4. Reinstall OAuth packages: `npm install passport-google-oauth2 passport-facebook`
5. Update environment variables with OAuth credentials

---

## Support

For issues with the new authentication system:

1. Check `AUTH_REFACTOR_GUIDE.md` for detailed documentation
2. Run `TEST_AUTHENTICATION.sh` to verify endpoints
3. Check server logs for validation errors
4. Ensure all required fields are provided in requests
