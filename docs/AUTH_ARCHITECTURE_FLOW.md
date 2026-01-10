# Auth System Architecture & Flow Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    EDUX AUTHENTICATION SYSTEM               │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    LANDING & ROLE SELECTION                 │
├──────────────────────────────────────────────────────────────┤
│  /auth (index.js)                                            │
│  ├─ Student Card → /auth/user/login or /auth/user/signup    │
│  ├─ Instructor Card → /auth/instructor/login or signup      │
│  └─ Admin Card → /auth/admin/login                          │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐
│   USER/STUDENT FLOW │  │  INSTRUCTOR FLOW     │  │   ADMIN FLOW     │
└─────────────────────┘  └──────────────────────┘  └──────────────────┘

   Frontend Pages:          Frontend Pages:         Frontend Pages:
   ├─ /auth/user/login      ├─ /auth/instructor/    ├─ /auth/admin/
   │   (LoginForm.js)       │   login               │   login
   │                        │   (LoginForm.js)      │   (LoginForm.js)
   └─ /auth/user/signup     │                       │
       (SignupForm.js)      └─ /auth/instructor/    └─ /auth/admin/
                               signup                  signup
                               (SignupForm.js)        (SignupForm.js)

   API Endpoints:           API Endpoints:         API Endpoints:
   ├─ POST /api/auth/       ├─ POST /api/auth/     ├─ POST /api/auth/
   │  user/login            │  instructor/login    │  admin/login
   │                        │                      │
   └─ POST /api/auth/       └─ POST /api/auth/     └─ POST /api/auth/
      user/signup              instructor/signup      admin/signup

   Database Checks:         Database Checks:       Database Checks:
   ├─ User exists           ├─ User exists         ├─ User exists
   ├─ Email unique          ├─ Email unique        ├─ Email unique
   ├─ Password valid        ├─ Password valid      ├─ Password valid
   ├─ STUDENT record        ├─ INSTRUCTOR record  ├─ is_admin flag
   └─ Hash password         ├─ Status check       └─ Hash password
                            └─ Hash password

   Auth Context:            Auth Context:         Auth Context:
   ├─ userLogin()           ├─ instructorLogin()  ├─ adminLogin()
   └─ userSignup()          └─ instructorSignup() └─ adminSignup()

   Stored Data:             Stored Data:          Stored Data:
   ├─ localStorage:         ├─ localStorage:      ├─ localStorage:
   │  - access_token        │  - access_token     │  - access_token
   │  - refresh_token       │  - refresh_token    │  - refresh_token
   │                        │                     │
   └─ secureLocalStorage:   └─ secureLocalStorage:└─ secureLocalStorage:
      ├─ u_id                 ├─ u_id              ├─ u_id
      ├─ u_email              ├─ u_email           ├─ u_email
      ├─ u_name               ├─ u_name            ├─ u_name
      ├─ isStudent: true      ├─ i_id              ├─ isStudent: false
      ├─ isInstructor: false  ├─ isStudent: false  ├─ isInstructor: false
      └─ isAdmin: false       ├─ isInstructor: true└─ isAdmin: true
                              └─ isAdmin: false

   Redirect Path:           Redirect Path:        Redirect Path:
   └─ /user/dashboard       ├─ /instructor/       └─ /admin/dashboard
                            │  dashboard
                            └─ /instructor/pending
                               (if not approved)
```

## User Authentication Flow

```
User Signup (New User)
├─ User visits /auth/user/signup
├─ Fills form: name, email, password, dob, gender
├─ Submits to POST /api/auth/user/signup
├─ Server:
│  ├─ Validates input
│  ├─ Checks email uniqueness
│  ├─ Hashes password with bcrypt
│  ├─ Calls CREATE_USER() stored procedure
│  ├─ Creates STUDENT record
│  ├─ Generates JWT token
│  └─ Returns user + token
├─ Client:
│  ├─ Stores token in localStorage
│  ├─ Stores user data in secureLocalStorage
│  └─ Redirects to /user/dashboard
└─ ✅ User account created

User Login (Existing User)
├─ User visits /auth/user/login
├─ Enters email and password
├─ Submits to POST /api/auth/user/login
├─ Server:
│  ├─ Validates input
│  ├─ Calls CHECK_USER() with email
│  ├─ Verifies password (bcrypt or plaintext)
│  ├─ Checks STUDENT role (s_id must exist)
│  ├─ Generates JWT token
│  └─ Returns user + token
├─ Client:
│  ├─ Stores token in localStorage
│  ├─ Stores user data in secureLocalStorage
│  └─ Redirects to /user/dashboard
└─ ✅ User logged in
```

## Instructor Authentication Flow

```
Instructor Signup (Application)
├─ Instructor visits /auth/instructor/signup
├─ Fills form: name, email, password, expertise, bio
├─ Submits to POST /api/auth/instructor/signup
├─ Server:
│  ├─ Validates input (expertise required)
│  ├─ Checks email uniqueness
│  ├─ Hashes password with bcrypt
│  ├─ Calls CREATE_USER() stored procedure
│  ├─ Creates INSTRUCTOR record with status='pending'
│  ├─ Generates JWT token
│  └─ Returns user + token
├─ Client:
│  ├─ Stores token in localStorage
│  ├─ Stores user data in secureLocalStorage
│  └─ Redirects to /instructor/pending
├─ 📋 Admin reviews application
└─ ✅ Admin approves → status='approved'

Instructor Login (Existing Approved Instructor)
├─ Instructor visits /auth/instructor/login
├─ Enters email and password
├─ Submits to POST /api/auth/instructor/login
├─ Server:
│  ├─ Validates input
│  ├─ Calls CHECK_USER() with email
│  ├─ Verifies password (bcrypt or plaintext)
│  ├─ Checks INSTRUCTOR role (i_id must exist)
│  ├─ Checks status (must be 'approved' or 'active')
│  ├─ Generates JWT token
│  └─ Returns user + token
├─ Client:
│  ├─ Stores token in localStorage
│  ├─ Stores user data in secureLocalStorage (with i_id)
│  └─ Redirects to /instructor
└─ ✅ Instructor logged in (Pending instructors get error)
```

## Admin Authentication Flow

```
Admin Signup (Restricted - Code Required)
├─ Admin visits /auth/admin/signup
├─ Fills form: name, email, password, adminCode
├─ Submits to POST /api/auth/admin/signup
├─ Server:
│  ├─ Validates input
│  ├─ Validates admin code (from ADMIN_CODES env)
│  ├─ Checks email uniqueness
│  ├─ Hashes password with bcrypt
│  ├─ Calls CREATE_ADMIN_USER() stored procedure
│  ├─ Sets is_admin flag
│  ├─ Generates JWT token
│  └─ Returns user + token
├─ Client:
│  ├─ Stores token in localStorage
│  ├─ Stores user data in secureLocalStorage
│  └─ Redirects to /admin/dashboard
└─ ✅ Admin account created (Invalid code → Error)

Admin Login (Existing Admin)
├─ Admin visits /auth/admin/login
├─ Enters email and password
├─ Submits to POST /api/auth/admin/login
├─ Server:
│  ├─ Validates input
│  ├─ Calls CHECK_USER() with email
│  ├─ Verifies password (bcrypt or plaintext)
│  ├─ Checks admin privileges (is_admin must be true)
│  ├─ Generates JWT token
│  └─ Returns user + token
├─ Client:
│  ├─ Stores token in localStorage
│  ├─ Stores user data in secureLocalStorage
│  └─ Redirects to /admin/dashboard
└─ ✅ Admin logged in
```

## Protected Route Flow

```
withProtectedRoute(Component, requiredRoles)
├─ Component attempts to render
├─ useEffect checks authentication:
│  ├─ Reads secureLocalStorage
│  ├─ Checks for u_id (authenticated?)
│  ├─ YES:
│  │  ├─ Check required roles
│  │  ├─ Match roles:
│  │  │  ├─ 'user' → Check isStudent = true
│  │  │  ├─ 'instructor' → Check isInstructor = true
│  │  │  └─ 'admin' → Check isAdmin = true
│  │  ├─ Has required role?
│  │  │  ├─ YES → Render component
│  │  │  └─ NO → Redirect to appropriate dashboard
│  │  └─ Authorized = true
│  └─ NO:
│     ├─ No u_id → Not authenticated
│     ├─ Redirect to /auth/user/login
│     └─ Authorized = false
├─ Loading state during check
└─ Component only renders if authorized
```

## Error Handling & Validation

```
INPUT VALIDATION (Client & Server)
├─ Email:
│  ├─ Required
│  ├─ Valid email format
│  └─ Unique (server only)
├─ Password:
│  ├─ Required
│  ├─ Minimum 8 characters
│  └─ Hashed before transmission
├─ Name:
│  ├─ Required
│  └─ Minimum 2 characters
├─ Expertise (Instructor):
│  ├─ Required
│  └─ Minimum 5 characters
└─ Admin Code (Admin):
   ├─ Required
   └─ Must be in ADMIN_CODES list

ERROR RESPONSES
├─ 400 Bad Request
│  └─ Validation failed, missing fields
├─ 401 Unauthorized
│  ├─ Invalid email or password
│  └─ User role not found
├─ 403 Forbidden
│  ├─ Account not approved (instructor)
│  ├─ Invalid admin code
│  └─ Insufficient privileges
├─ 409 Conflict
│  └─ Email already registered
└─ 500 Internal Server Error
   └─ Database or system error
```

## Component Dependencies

```
pages/auth/user/login.js
├─ Imports:
│  ├─ LoginForm (component)
│  ├─ apiPost (API helper)
│  ├─ useRouter
│  └─ secureLocalStorage
└─ Uses:
   ├─ /api/auth/user/login endpoint
   └─ useAuth context (optional)

pages/auth/user/signup.js
├─ Imports:
│  ├─ SignupForm (component)
│  ├─ apiPost (API helper)
│  ├─ useRouter
│  └─ secureLocalStorage
└─ Uses:
   ├─ /api/auth/user/signup endpoint
   └─ useAuth context (optional)

components/auth/LoginForm.js
├─ Reusable for:
│  ├─ User login
│  ├─ Instructor login
│  └─ Admin login
└─ Props:
   ├─ onSubmit (callback)
   ├─ email, password (values)
   ├─ onEmailChange, onPasswordChange (handlers)
   ├─ isLoading, error, errors (state)
   └─ showAdditionalFields, additionalFields (for future)

components/auth/SignupForm.js
├─ Reusable for:
│  ├─ User signup
│  ├─ Instructor signup
│  └─ Admin signup
└─ Props:
   ├─ role (user/instructor/admin)
   ├─ fields (dynamic fields array)
   ├─ fieldValues (form data)
   ├─ onFieldChange (handlers map)
   ├─ onSubmit (callback)
   └─ isLoading, error, errors (state)

lib/auth/authUtils.js
├─ Exports:
│  ├─ AUTH_ROLES constant
│  ├─ validateAuthData()
│  ├─ storeAuthTokens()
│  ├─ getAuthToken()
│  ├─ clearAuthTokens()
│  ├─ getUserRole()
│  ├─ hasRole()
│  └─ getRedirectPathByRole()
└─ Used by: pages, components, context

lib/auth/withProtectedRoute.js
├─ HOC for protecting routes
├─ Requires: component, requiredRoles[]
└─ Returns: wrapped component with auth check

context/AuthContext.js
├─ Exports:
│  ├─ AuthContext
│  ├─ useAuth hook
│  ├─ AuthProvider component
│  └─ State: user, loading, isAuthenticated
└─ Methods:
   ├─ login() / userLogin()
   ├─ loginSignup() / userSignup()
   ├─ instructorLogin()
   ├─ instructorSignup()
   ├─ adminLogin()
   ├─ adminSignup()
   ├─ logout()
   ├─ refreshToken()
   └─ checkAuth()
```

## Security Workflow

```
Password Security
├─ Signup:
│  ├─ User enters password
│  ├─ Client validates (min 8 chars)
│  ├─ Sent over HTTPS
│  ├─ Server validates again
│  ├─ Hashed with bcrypt
│  └─ Stored in database
├─ Login:
│  ├─ User enters password
│  ├─ Sent over HTTPS
│  ├─ Server retrieves hashed password
│  ├─ Compared with bcrypt.compare()
│  └─ Backward compat: plaintext fallback
└─ Never stored/cached in frontend

Token Security
├─ Generated:
│  ├─ JWT token created on signup/login
│  └─ Signed with secret key
├─ Storage:
│  ├─ localStorage (accessible to JS)
│  ├─ HTTP-only cookie (not accessible to JS)
│  └─ Both used for redundancy
├─ Transmission:
│  ├─ Sent in Authorization header
│  └─ Over HTTPS only
├─ Validation:
│  ├─ Signature verified on each request
│  ├─ Expiration checked
│  └─ Invalid tokens rejected
└─ Refresh:
   ├─ Refresh token used to get new access token
   ├─ Old token invalidated
   └─ User stays logged in

Role Verification
├─ At Signup:
│  ├─ Role stored in database
│  ├─ Role flag set: isStudent/isInstructor/isAdmin
│  └─ Returned in JWT claims
├─ At Login:
│  ├─ User role verified from database
│  ├─ Correct role must exist
│  ├─ Status checked (instructor: approved?)
│  └─ Returned in JWT claims
├─ At Resource Access:
│  ├─ JWT verified
│  ├─ Claims checked for role
│  ├─ Role-based access control applied
│  └─ Unauthorized access rejected
└─ On Frontend:
   ├─ Roles checked from secureLocalStorage
   ├─ withProtectedRoute enforces roles
   └─ Invalid roles redirect to appropriate dashboard
```

## Data Flow Diagram

```
USER SIGNUP DATA FLOW:
┌─────────────────┐
│ Signup Form     │
│ - name          │
│ - email         │
│ - password      │
│ - dob           │
│ - gender        │
└────────┬────────┘
         │ POST /api/auth/user/signup (HTTPS)
         ▼
┌─────────────────────────────┐
│ Backend Validation          │
│ ✓ Email format              │
│ ✓ Password length           │
│ ✓ Name length               │
│ ✓ Email uniqueness          │
└────────┬────────────────────┘
         │ VALID
         ▼
┌──────────────────────────────────┐
│ Database Operations              │
│ ✓ CREATE_USER()                  │
│ ✓ Create STUDENT record          │
│ ✓ Hash password (bcrypt)         │
│ ✓ Store in database              │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Token Generation                 │
│ ✓ Create JWT access token        │
│ ✓ Create JWT refresh token       │
│ ✓ Set HTTP-only cookies          │
└────────┬─────────────────────────┘
         │ 200 + { user, token }
         ▼
┌──────────────────────────────────┐
│ Client Storage                   │
│ ✓ localStorage:                  │
│  - edux_access_token             │
│  - edux_refresh_token            │
│ ✓ secureLocalStorage:            │
│  - u_id, u_email, u_name         │
│  - isStudent: true               │
│  - isInstructor: false           │
│  - isAdmin: false                │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Redirect to Dashboard            │
│ → /user/dashboard                │
└──────────────────────────────────┘
```

## Backward Compatibility Flow

```
OLD CODE → NEW SYSTEM

Old Page /login.js
├─ Imported LoginForm? NO
├─ Used custom form? YES
└─ → REDIRECTS to /auth/user/login ✅

Old API /api/login
├─ Called directly? YES
├─ Proxy enabled? YES
└─ → ROUTES to /api/auth/user/login ✅

Old Context Method login()
├─ Called directly? YES
├─ Still available? YES
└─ → DELEGATES to userLogin() ✅

Old Context Method signup()
├─ Called directly? YES
├─ Still available? YES
└─ → DELEGATES to userSignup() ✅

Old Context Method instructorSignup()
├─ Called directly? YES
├─ Still available? YES
└─ → DELEGATES to instructorSignup() ✅

Secure Storage Keys
├─ u_id → SAME ✅
├─ u_email → SAME ✅
├─ u_name → SAME ✅
├─ isStudent → SAME ✅
├─ isInstructor → SAME ✅
└─ isAdmin → NEW (added) ✅

Token Storage
├─ localStorage keys → SAME ✅
├─ Format → SAME ✅
└─ Usage → SAME ✅

→ ALL OLD CODE CONTINUES TO WORK ✅
```

---

This architecture ensures:
- ✅ Clean separation of concerns
- ✅ Role-based authentication
- ✅ Backward compatibility
- ✅ Security best practices
- ✅ Scalability
- ✅ Maintainability
