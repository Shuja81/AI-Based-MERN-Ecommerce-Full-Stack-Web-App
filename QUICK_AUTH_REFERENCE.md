# Authentication Refactor - Quick Implementation Guide

## What Was Changed?

### ❌ Removed (OAuth)

- Google Sign-In integration
- Facebook Login integration
- OAuth routes and callbacks
- Passport Google & Facebook strategies
- GoogleIcon and FacebookIcon components

### ✅ Added/Enhanced

- Email format validation on register & login
- Password strength validation (minimum 6 characters)
- Merchant account creation by admin (with password)
- Merchant login endpoint
- Password hashing with bcrypt for all auth methods

---

## Frontend Changes Summary

### Login & Signup Pages

**What happened:** The `SignupProvider` component still exists but renders nothing (no OAuth buttons)
**User Impact:** Users see only email/password fields (no "Login with Google" or "Login with Facebook" buttons)

### Icons Removed

- `GoogleIcon` - No longer exported/used
- `FacebookIcon` - No longer exported/used

**Files changed:**

- `client/app/components/Common/SignupProvider/index.js`
- `client/app/components/Common/Icon/index.js`

---

## Backend Changes Summary

### Authentication Endpoints

#### User Login

```
POST /api/auth/login
Body: { email, password }
Validation: Email format check, password required
Returns: JWT token + user details
```

#### User Registration

```
POST /api/auth/register
Body: { email, firstName, lastName, password, isSubscribed? }
Validation: Email format, password ≥6 chars, unique email
Returns: JWT token + user details
```

#### Merchant Login

```
POST /api/auth/merchant/login
Body: { email, password }
Validation: Email format check, password required
Returns: JWT token + merchant details
```

#### Merchant Creation (Admin Only)

```
POST /api/merchant/add
Headers: Authorization: Bearer <admin_token>
Body: { name, email, password, phoneNumber, business, brandName }
Validation: All fields required, admin role required
Returns: Success message + merchant details
```

### Models Changed

#### User Model (`server/models/user.js`)

- ❌ Removed `googleId` field
- ❌ Removed `facebookId` field
- ✅ `email` is now required
- ✅ `password` is now required

#### Merchant Model (`server/models/merchant.js`)

- ✅ Added `password` field (hashed)
- ✅ Made `email` unique

---

## Configuration Changes

### Passport (`server/config/passport.js`)

- Only JWT strategy remains (for token validation)
- Google and Facebook strategies removed
- Much simpler, cleaner file

### Config Keys (`server/config/keys.js`)

- Google config object removed
- Facebook config object removed

---

## Step-by-Step Testing

### Test 1: User Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "MyPassword123"
  }'
```

**Expected:** Success with JWT token

### Test 2: User Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "MyPassword123"
  }'
```

**Expected:** Success with JWT token

### Test 3: Invalid Email Format

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "notanemail",
    "firstName": "John",
    "lastName": "Doe",
    "password": "MyPassword123"
  }'
```

**Expected:** Error - "Please enter a valid email address."

### Test 4: Weak Password

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "123"
  }'
```

**Expected:** Error - "Password must be at least 6 characters long."

### Test 5: Create Merchant (Admin)

```bash
curl -X POST http://localhost:3000/api/merchant/add \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Merchant",
    "email": "merchant@example.com",
    "password": "MerchantPass123",
    "phoneNumber": "1234567890",
    "business": "Electronics",
    "brandName": "TechBrand"
  }'
```

**Expected:** Success message

### Test 6: Merchant Login

```bash
curl -X POST http://localhost:3000/api/auth/merchant/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "merchant@example.com",
    "password": "MerchantPass123"
  }'
```

**Expected:** Success with JWT token

---

## Key Validation Rules

| Field               | Validation                         | Error Message                                  |
| ------------------- | ---------------------------------- | ---------------------------------------------- |
| Email               | Must be valid email format         | "Please enter a valid email address."          |
| Email (Register)    | Must not exist                     | "That email address is already in use."        |
| Password (Register) | Minimum 6 characters               | "Password must be at least 6 characters long." |
| Password (Merchant) | Required                           | "You must set a password for the merchant."    |
| Password (All)      | Bcrypt hashed (never stored plain) | N/A                                            |

---

## Environment Variables Status

### ✅ Still Needed

```env
JWT_SECRET=your_secret_key
MONGO_URI=mongodb://...
MAILGUN_KEY=your_key
MAILGUN_DOMAIN=your_domain
MAILGUN_EMAIL_SENDER=sender@example.com
MAILCHIMP_KEY=your_key
MAILCHIMP_LIST_KEY=your_list_key
CLIENT_URL=http://localhost:8080
BASE_API_URL=api
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-2
AWS_BUCKET_NAME=your_bucket
```

### ❌ Can Be Removed

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
FACEBOOK_CALLBACK_URL=
```

---

## Common Issues & Solutions

### Issue: "No user found for this email address"

- **Cause:** User hasn't registered yet
- **Solution:** User must register first before logging in

### Issue: "Password Incorrect"

- **Cause:** Wrong password provided
- **Solution:** Verify password is correct, can reset via forgot password endpoint

### Issue: "That email address is already in use"

- **Cause:** Email already registered
- **Solution:** Use different email or login with existing account

### Issue: Merchant creation fails with "unauthorized"

- **Cause:** Non-admin trying to create merchant
- **Solution:** Only admins can create merchants

### Issue: "Please enter a valid email address"

- **Cause:** Email format invalid (missing @ or domain)
- **Solution:** Use format: user@example.com

---

## Related Documentation

📄 **AUTH_REFACTOR_GUIDE.md** - Detailed guide with all changes
📄 **CHANGELOG_AUTH_REFACTOR.md** - Complete changelog of modifications
📄 **TEST_AUTHENTICATION.sh** - Automated test script

---

## Next Steps

1. ✅ Review all changes in this guide
2. ✅ Run the test script: `bash TEST_AUTHENTICATION.sh`
3. ✅ Test in your application UI
4. ✅ Update any frontend code that depends on OAuth
5. ✅ Remove OAuth packages: `npm uninstall passport-google-oauth2 passport-facebook`
6. ✅ Deploy with updated environment variables
7. ✅ Monitor logs for any issues

---

## Still Have Questions?

Check the detailed guides:

- **For complete reference:** `AUTH_REFACTOR_GUIDE.md`
- **For all file changes:** `CHANGELOG_AUTH_REFACTOR.md`
- **For testing:** `TEST_AUTHENTICATION.sh`
