# Registration Testing Guide

## Setup Verification

### 1. Backend Status
Ensure your backend is running on port **8081**:
```
http://localhost:8081/api/users
```

### 2. CORS Configuration
Your backend needs to allow requests from the frontend. Add this to your Spring Boot application:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

## Testing Registration Flow

### Step 1: Open Signup Modal
1. Navigate to your app (usually `http://localhost:5173`)
2. Click the signup button to open the modal

### Step 2: Fill Registration Form
Enter the following test data:
- **First Name**: John
- **Last Name**: Doe
- **Email**: john.doe@example.com
- **Telephone**: +254712345678
- **Password**: password123
- ✅ Check "Accept the Terms & Condition"

### Step 3: Click PROCEED
The role selection overlay should appear

### Step 4: Select Role
Click either:
- 💼 **I'm a Client** → sends `userRole: "CLIENT"`
- 👨‍💻 **I'm a Developer** → sends `userRole: "DEVELOPER"`

### Expected Request Payload
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "telephone": "+254712345678",
  "password": "password123",
  "userRole": "DEVELOPER"
}
```

### Expected Backend Response
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "telephone": "+254712345678",
  "userRole": "DEVELOPER",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

## Debugging

### Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for:
   - "Sending registration data:" log
   - "Registration successful:" log
   - Any error messages

### Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Look for POST request to `/api/users/register`
4. Check:
   - **Request Method**: POST
   - **Request URL**: `http://localhost:8081/api/users/register`
   - **Request Headers**: Content-Type: application/json
   - **Request Payload**: Should match expected format
   - **Response Status**: Should be 201 (Created) or 200 (OK)

### Common Issues

#### CORS Error
**Symptom**: "Access to fetch at 'http://localhost:8081/api/users/register' from origin 'http://localhost:5173' has been blocked by CORS policy"

**Solution**: Add CORS configuration to your backend (see above)

#### 404 Not Found
**Symptom**: Network tab shows 404 error

**Solution**: 
- Verify backend is running
- Check the endpoint URL in backend controller
- Verify port 8081 is correct

#### 400 Bad Request
**Symptom**: Registration fails with validation error

**Solution**: 
- Check all required fields are filled
- Verify field names match backend DTO (firstName, lastName, email, telephone, password, userRole)
- Check password requirements on backend

#### 500 Internal Server Error
**Symptom**: Backend crashes

**Solution**: 
- Check backend console for error logs
- Verify database connection
- Check if all required services are working

## Success Indicators

✅ No errors in browser console
✅ Network request returns 200/201 status
✅ Alert shows "Welcome, [Name]! Registration successful as [ROLE]."
✅ Modal closes automatically
✅ User data stored in localStorage:
   - `devconnect_token`
   - `devconnect_refresh_token`
   - `devconnect_user`

## Verification in Browser

After successful registration, open Console and type:
```javascript
localStorage.getItem('devconnect_token')
localStorage.getItem('devconnect_user')
```

You should see the stored token and user data.
