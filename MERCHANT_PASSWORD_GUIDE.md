# Admin Dashboard - Merchant Password Field Implementation

## Overview

The Admin Dashboard "Add Merchant" form has been updated to include a password field. Admins can now set a secure password for each merchant account during creation.

---

## What Changed

### Frontend Updates

#### 1. **Merchant Form Component** (`client/app/components/Manager/AddMerchant/index.js`)

- Added new password input field
- Password field appears after email field
- Type: `password` (masked input for security)
- Placeholder: "Set Merchant Password (min 6 characters)"

#### 2. **Merchant Reducer** (`client/app/containers/Merchant/reducer.js`)

- Added `password: ''` to `merchantFormData` initial state
- Allows form to track password value

#### 3. **Merchant Actions** (`client/app/containers/Merchant/actions.js`)

- Added password validation rules:
    - `required` - Password must be provided
    - `min:6` - Password must be at least 6 characters
- Added error messages:
    - "Password is required."
    - "Password must be at least 6 characters."
- Password field is sent to backend in merchant creation request

### Backend Updates

#### **Merchant Model** (`server/models/merchant.js`)

- Password field: `String` type
- Passwords are stored as hashed values (never plain text)

#### **Merchant Creation Route** (`server/routes/api/merchant.js`)

- Requires authentication (admin only)
- Validates password is provided
- Hashes password with bcrypt (10 salt rounds)
- Stores hashed password in database
- Email validation and uniqueness checks

#### **Merchant Login** (`server/routes/api/auth.js`)

- Merchants authenticate with email + password
- Password compared using bcrypt for security

---

## Form Field Details

### Password Field Specification

```
Label: Password
Type: password (masked input)
Placeholder: "Set Merchant Password (min 6 characters)"
Validation:
  - Required: Yes
  - Minimum Length: 6 characters
  - Special Characters: Any
Error Display: Shows validation errors below field
```

### Form Flow

1. Admin fills in merchant details
2. Admin enters password (6+ characters)
3. Form validates all fields including password
4. On submit, password is sent to backend
5. Backend hashes password with bcrypt
6. Merchant account created with hashed password
7. Merchant can login with email + password later

---

## Validation Rules

| Field        | Rule                      | Error Message                                                           |
| ------------ | ------------------------- | ----------------------------------------------------------------------- |
| Name         | Required                  | "Name is required."                                                     |
| Email        | Required, Valid format    | "Email is required." / "Email format is invalid."                       |
| **Password** | **Required, Min 6 chars** | **"Password is required." / "Password must be at least 6 characters."** |
| Phone        | Required, Valid format    | "Phone number is required." / "Phone number format is invalid."         |
| Brand        | Required                  | "Brand is required."                                                    |
| Business     | Required, Min 10 chars    | "Business is required." / "Business must be at least 10 characters."    |

---

## Security Features

### Client-Side

✅ Password field is masked (type="password")
✅ Client-side validation prevents invalid submissions
✅ Password never logged or displayed in console
✅ Password cleared from form after successful submission

### Server-Side

✅ Password validated (6+ characters minimum)
✅ Password hashed using bcrypt with 10 salt rounds
✅ Hashed password stored in database
✅ Plain text password never stored
✅ Admin-only access (authentication required)
✅ Email uniqueness enforced

### Best Practices

✅ HTTPS required in production (prevents password interception)
✅ Rate limiting recommended (prevent brute force)
✅ Password not logged in audit trails
✅ Secure password comparison using bcrypt
✅ No password reset email (admin sets initial password)

---

## How It Works

### Step 1: Admin Opens Add Merchant Form

```
Location: Admin Dashboard → Merchants → Add Merchant
Form displays with all fields including password
```

### Step 2: Admin Fills Form

```
Name: John Merchant
Email: merchant@example.com
Password: MySecurePass123 (minimum 6 characters)
Phone: (123) 456-7890
Brand: TechBrand
Business: Electronics retail store
```

### Step 3: Form Validation

```
Frontend validates:
- All required fields filled
- Email format valid
- Password ≥ 6 characters
- Phone number format valid
- Business description ≥ 10 characters
```

### Step 4: Submit to Backend

```
POST /api/merchant/add
Headers: Authorization: Bearer <admin_jwt_token>
Body: {
  name: "John Merchant",
  email: "merchant@example.com",
  password: "MySecurePass123",  // Plain text (sent over HTTPS)
  phoneNumber: "(123) 456-7890",
  brandName: "TechBrand",
  business: "Electronics retail store"
}
```

### Step 5: Backend Processing

```
1. Verify admin authentication
2. Validate password (6+ characters)
3. Hash password with bcrypt
4. Check email uniqueness (merchant & user)
5. Create merchant record with hashed password
6. Send confirmation email
7. Return success response
```

### Step 6: Merchant Login

```
Later, merchant logs in with:
POST /api/auth/merchant/login
Body: {
  email: "merchant@example.com",
  password: "MySecurePass123"
}

Backend:
1. Find merchant by email
2. Compare password with bcrypt
3. Generate JWT token
4. Return token and merchant data
```

---

## Password Strength Recommendations

### Current Minimum

- At least 6 characters
- Any character type allowed (letters, numbers, symbols)

### Best Practices

When setting merchant passwords, consider:

- Mix of uppercase and lowercase letters
- Include numbers and special characters
- Avoid common words or patterns
- Avoid sequential numbers (123, abc)
- Avoid reusing old passwords

### Example Strong Passwords

- `TechBrand@2024!`
- `Secure$Pass#99`
- `M3rchant_Key2024`
- `Str0ng!Pass@2024`

### Example Weak Passwords (Avoid)

- `password` (too common)
- `123456` (sequential)
- `merchant` (related to business)
- `Pass1` (too short, only 5 chars)

---

## Error Handling

### Client-Side Errors

```
If password field is empty:
Error: "Password is required."

If password less than 6 characters:
Error: "Password must be at least 6 characters."

Example: "Pass" → "Password must be at least 6 characters."
         "MyPass123" → Validation passes
```

### Server-Side Errors

```
If admin not authenticated:
Status: 401 Unauthorized

If password missing in request:
Status: 400 Bad Request
Error: "You must set a password for the merchant."

If email already exists:
Status: 400 Bad Request
Error: "That email address is already in use."

If email registered as user:
Status: 400 Bad Request
Error: "That email address is already registered as a user."
```

---

## Testing Checklist

### Functionality Tests

- [ ] Password field appears in Add Merchant form
- [ ] Password is masked (not visible as plain text)
- [ ] Empty password validation triggers error
- [ ] Short password (<6 chars) validation triggers error
- [ ] Valid password passes validation
- [ ] Form submission includes password
- [ ] Successful creation shows success message
- [ ] Form clears after successful submission

### Security Tests

- [ ] Password not displayed in browser console
- [ ] Password not stored in localStorage
- [ ] Password not shown in network requests (use HTTPS)
- [ ] Admin authentication required for endpoint
- [ ] Non-admin cannot create merchant
- [ ] Merchant can login with created password
- [ ] Failed login with wrong password

### Integration Tests

- [ ] Merchant created with hashed password
- [ ] Merchant login with email + password works
- [ ] Merchant JWT token generated on login
- [ ] Merchant can access merchant-only endpoints

---

## API Reference

### Create Merchant with Password

```
POST /api/merchant/add

Headers:
{
  "Authorization": "Bearer <admin_jwt_token>",
  "Content-Type": "application/json"
}

Request Body:
{
  "name": "John Merchant",
  "email": "merchant@example.com",
  "password": "SecurePassword123",
  "phoneNumber": "(123) 456-7890",
  "brandName": "TechBrand",
  "business": "Electronics retail business"
}

Success Response (200):
{
  "success": true,
  "message": "Merchant account created successfully...",
  "merchant": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Merchant",
    "email": "merchant@example.com",
    "phoneNumber": "(123) 456-7890",
    "brandName": "TechBrand",
    "status": "Waiting_Approval",
    "isActive": false
  }
}

Error Response (400):
{
  "error": "You must set a password for the merchant."
}
```

### Merchant Login with Password

```
POST /api/auth/merchant/login

Headers:
{
  "Content-Type": "application/json"
}

Request Body:
{
  "email": "merchant@example.com",
  "password": "SecurePassword123"
}

Success Response (200):
{
  "success": true,
  "token": "Bearer eyJhbGciOiJIUzI1NiIs...",
  "merchant": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Merchant",
    "email": "merchant@example.com",
    "brandName": "TechBrand"
  }
}

Error Response (400):
{
  "error": "No merchant account found for this email address."
}
```

---

## Troubleshooting

### Issue: Password field not showing in form

**Solution:** Ensure reducer has `password: ''` in merchantFormData initial state

### Issue: Password validation not triggering

**Solution:** Check actions.js has password validation rules with `required|min:6`

### Issue: Password not being sent to backend

**Solution:** Verify merchantChange action is updating password field in Redux state

### Issue: Backend error "You must set a password"

**Solution:** Ensure frontend sends password field in request body

### Issue: Merchant cannot login after creation

**Solution:** Verify password was hashed in database, check merchant login endpoint validation

### Issue: "That email address is already in use" error

**Solution:** Email must be unique - check existing merchants and users with same email

---

## Best Practices

### For Admins

1. Use strong, unique passwords for each merchant
2. Use password manager to store merchant passwords
3. Share password securely (not in email/chat)
4. Advise merchants to change password on first login
5. Keep record of merchant accounts created

### For Developers

1. Always use HTTPS in production
2. Never log passwords
3. Use bcrypt for hashing (10+ salt rounds)
4. Validate password on frontend and backend
5. Implement rate limiting for login attempts
6. Use secure password comparison functions

### For Security

1. Implement password expiration policy
2. Add login attempt limits
3. Monitor failed login attempts
4. Add two-factor authentication (optional)
5. Regular security audits
6. GDPR compliance for password handling

---

## Related Documentation

📄 **AUTH_REFACTOR_GUIDE.md** - Complete authentication refactor details  
📄 **QUICK_AUTH_REFERENCE.md** - Quick reference for authentication endpoints  
📄 **CHANGELOG_AUTH_REFACTOR.md** - Detailed changelog of auth changes

---

## Questions & Support

For issues with merchant password functionality:

1. Check validation error messages
2. Verify password meets minimum requirements
3. Ensure admin is authenticated
4. Check browser console for JavaScript errors
5. Review server logs for backend errors
6. Verify email is unique for new merchant
