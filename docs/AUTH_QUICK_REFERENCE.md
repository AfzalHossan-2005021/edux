# Auth System - Quick Reference Guide

## URLs at a Glance

### Landing & Role Selection
- **`/auth`** - Main auth landing page with role selection

### User/Student Auth
- **`/auth/user/login`** - Student login page
- **`/auth/user/signup`** - Student registration page
- **`POST /api/auth/user/login`** - Student login API
- **`POST /api/auth/user/signup`** - Student signup API

### Instructor Auth
- **`/auth/instructor/login`** - Instructor login page
- **`/auth/instructor/signup`** - Instructor application page
- **`POST /api/auth/instructor/login`** - Instructor login API
- **`POST /api/auth/instructor/signup`** - Instructor signup API

### Admin Auth
- **`/auth/admin/login`** - Admin login page
- **`/auth/admin/signup`** - Admin signup page (code required)
- **`POST /api/auth/admin/login`** - Admin login API
- **`POST /api/auth/admin/signup`** - Admin signup API

### Legacy (Redirect)
- **`/login`** → `/auth/user/login` (redirects)
- **`/signup`** → `/auth/user/signup` (redirects)
- **`/api/login`** → `/api/auth/user/login` (proxies)
- **`/api/signup`** → `/api/auth/user/signup` (proxies)

---

## Component Usage

### LoginForm Component
```javascript
import LoginForm from '@/components/auth/LoginForm';

<LoginForm
  onSubmit={handleLogin}
  isLoading={isLoading}
  error={error}
  errors={errors}
  email={email}
  password={password}
  onEmailChange={setEmail}
  onPasswordChange={setPassword}
/>
```

### SignupForm Component
```javascript
import SignupForm from '@/components/auth/SignupForm';

<SignupForm
  role="user|instructor|admin"
  onSubmit={handleSignup}
  isLoading={isLoading}
  error={error}
  errors={errors}
  fields={[
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
    },
    // ... more fields
  ]}
  onFieldChange={fieldChangeHandlers}
  fieldValues={formData}
/>
```

### Protected Route HOC
```javascript
import { withProtectedRoute } from '@/lib/auth/withProtectedRoute';
import { AUTH_ROLES } from '@/lib/auth/authUtils';

const ProtectedPage = ({ data }) => {
  return <div>Protected Content</div>;
};

export default withProtectedRoute(ProtectedPage, [AUTH_ROLES.USER]);
```

---

## Auth Context Usage

### Using the Hook
```javascript
import { useAuth } from '@/context/AuthContext';

export default function MyComponent() {
  const { user, isAuthenticated, userLogin, logout } = useAuth();

  const handleLogin = async () => {
    const result = await userLogin(email, password);
    if (result.success) {
      // Logged in
    }
  };

  return (
    <button onClick={handleLogin}>Login</button>
  );
}
```

### Available Methods
```javascript
const {
  // State
  user,                    // Current user object
  isAuthenticated,         // Boolean
  loading,                 // Boolean

  // Login methods
  login(email, password),           // Generic (legacy)
  userLogin(email, password),       // User/student login
  instructorLogin(email, password), // Instructor login
  adminLogin(email, password),      // Admin login

  // Signup methods
  signup(userData),           // Generic (legacy)
  userSignup(userData),       // User/student signup
  instructorSignup(userData), // Instructor signup
  adminSignup(userData),      // Admin signup

  // Utility methods
  logout(),                   // Logout user
  refreshToken(),             // Refresh JWT
  checkAuth(),                // Check auth status
} = useAuth();
```

---

## Auth Utilities

### Available Functions
```javascript
import {
  AUTH_ROLES,
  validateAuthData,
  isValidAdminCode,
  storeAuthTokens,
  getAuthToken,
  clearAuthTokens,
  getUserRole,
  hasRole,
  getRedirectPathByRole,
} from '@/lib/auth/authUtils';

// Constants
AUTH_ROLES.USER        // 'user'
AUTH_ROLES.INSTRUCTOR  // 'instructor'
AUTH_ROLES.ADMIN       // 'admin'

// Validation
validateAuthData('user', { name, email, password, dob, gender })
// Returns: { success: boolean, errors: string[] }

isValidAdminCode('ADMIN_CODE_123')
// Returns: boolean

// Token Management
storeAuthTokens(accessToken, refreshToken)
getAuthToken()
clearAuthTokens()

// Role Checking
getUserRole(userObject)           // Returns role string
hasRole(userObject, 'user')       // Returns boolean
hasRole(userObject, ['user', 'instructor']) // Returns boolean

// Redirect Logic
getRedirectPathByRole('user')       // Returns '/user/dashboard'
getRedirectPathByRole('instructor') // Returns '/instructor'
getRedirectPathByRole('admin')      // Returns '/admin/dashboard'
```

---

## API Endpoint Responses

### Login Response (Success)
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "u_id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "isStudent": true,
    "isInstructor": false,
    "isAdmin": false
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Login Response (Error)
```json
{
  "success": false,
  "message": "Invalid email or password",
  "errors": []
}
```

### Signup Response (Success)
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "u_id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "isStudent": true,
    "isInstructor": false,
    "isAdmin": false
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Instructor Signup Response (Pending)
```json
{
  "success": true,
  "message": "Instructor account created successfully. Please wait for approval.",
  "user": {
    "u_id": 123,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "isStudent": false,
    "isInstructor": true,
    "isAdmin": false,
    "status": "pending"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## Storage Keys

### localStorage
```javascript
localStorage.getItem('edux_access_token')   // JWT token
localStorage.getItem('edux_refresh_token')  // Refresh token
```

### secureLocalStorage
```javascript
secureLocalStorage.getItem('u_id')           // User ID
secureLocalStorage.getItem('u_email')        // Email
secureLocalStorage.getItem('u_name')         // Name
secureLocalStorage.getItem('isStudent')      // Boolean
secureLocalStorage.getItem('isInstructor')   // Boolean
secureLocalStorage.getItem('isAdmin')        // Boolean
secureLocalStorage.getItem('i_id')           // Instructor ID (if instructor)
```

---

## Common Tasks

### Login a User
```javascript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const { userLogin } = useAuth();

const handleLogin = async () => {
  const result = await userLogin(email, password);
  if (result.success) {
    // Redirect happens automatically
  } else {
    console.log(result.message);
  }
};
```

### Sign Up a User
```javascript
const { userSignup } = useAuth();
const [formData, setFormData] = useState({
  name: '',
  email: '',
  password: '',
  dob: '',
  gender: '',
});

const handleSignup = async () => {
  const result = await userSignup(formData);
  if (result.success) {
    // User logged in, redirect
  }
};
```

### Check User Role
```javascript
import { hasRole, AUTH_ROLES } from '@/lib/auth/authUtils';

const user = secureLocalStorage.getItem('isStudent'); // true/false
if (hasRole(user, AUTH_ROLES.USER)) {
  // User is a student
}
```

### Protect a Route
```javascript
import { withProtectedRoute } from '@/lib/auth/withProtectedRoute';

function AdminPage() {
  return <div>Admin Only</div>;
}

export default withProtectedRoute(AdminPage, ['admin']);
```

### Logout User
```javascript
const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  router.push('/auth');
};
```

---

## Environment Variables

### Required
```
ADMIN_CODES=ADMIN_SECRET_CODE_001,ADMIN_SECRET_CODE_002
```

### Optional (if using external services)
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

---

## Troubleshooting

### User Can't Login
1. Check if email exists in database
2. Verify password is correct
3. Check user role flags (isStudent, etc.)
4. Verify JWT signing works
5. Check console for errors

### Token Not Stored
1. Verify localStorage is enabled
2. Check browser console for errors
3. Verify HTTPS in production
4. Check setAuthCookies() is called

### Instructor Can't Login
1. Check instructor status (pending/approved/active)
2. Verify INSTRUCTOR record exists
3. Check i_id field is populated
4. Verify approval workflow completed

### Admin Code Invalid
1. Check ADMIN_CODES in .env
2. Verify code is in correct format
3. Ensure code is not expired
4. Check for trailing spaces

### Protected Route Not Working
1. Verify withProtectedRoute wrapper is applied
2. Check required roles array
3. Verify storage flags are set
4. Check browser console for auth errors

---

## File Structure Quick Reference

```
pages/
├── auth/
│   ├── index.js (landing)
│   ├── user/
│   │   ├── login.js
│   │   └── signup.js
│   ├── instructor/
│   │   ├── login.js
│   │   └── signup.js
│   └── admin/
│       ├── login.js
│       └── signup.js

pages/api/
├── auth/
│   ├── user/
│   │   ├── login.js
│   │   └── signup.js
│   ├── instructor/
│   │   ├── login.js
│   │   └── signup.js
│   └── admin/
│       ├── login.js
│       └── signup.js

lib/auth/
├── authUtils.js
└── withProtectedRoute.js

components/auth/
├── LoginForm.js
└── SignupForm.js

context/
└── AuthContext.js
```

---

## Summary

✅ Three distinct auth flows (user, instructor, admin)
✅ Reusable components and utilities
✅ Backward compatible with old system
✅ Secure password and token management
✅ Role-based access control
✅ Clean, modular code

**Ready to use!** 🚀
