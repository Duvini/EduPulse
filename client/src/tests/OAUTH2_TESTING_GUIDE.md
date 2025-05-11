# Google OAuth2 Authentication Testing Guide

This guide provides steps to test the Google OAuth2 authentication functionality in the EduPulse application.

## Prerequisites

1. Make sure the backend server is running on `http://localhost:8080`
2. Make sure the frontend is running on `http://localhost:5173`
3. Have a Google account ready for testing

## Testing Steps

### Step 1: Navigate to the Auth Test Page

Go to `http://localhost:5173/auth-test` to access the authentication test page. This page will show you the current authentication status and provide tools for testing.

### Step 2: Clear Existing Authentication

In your browser console, run:
```javascript
localStorage.clear();
```

Refresh the page to confirm you're logged out.

### Step 3: Test Google OAuth2 Login

1. Go to the sign-in page: `http://localhost:5173/signin`
2. Click the "Sign in with Google" button
3. Complete the Google authentication flow
4. You should be redirected back to the EduPulse application after successful authentication

### Step 4: Verify Authentication

After completing the OAuth2 login:
1. Go to `http://localhost:5173/auth-test`
2. Check that your authentication status shows "Authenticated"
3. Verify that your user information is displayed
4. Check that "Auth Method" shows "Google OAuth2"

### Step 5: Test Traditional Login

1. Clear authentication again with `localStorage.clear()`
2. Go to the sign-in page
3. Log in with a traditional username and password
4. Verify on the auth test page that "Auth Method" shows "Traditional"

## Troubleshooting

If you encounter issues with Google OAuth2 authentication:

1. **Check Redirect URL**: Make sure the redirect URL in `application.yaml` is set to `http://localhost:5173/oauth2/callback/google`

2. **Check Backend Logs**: Look for OAuth2 related logs in the Spring Boot console

3. **Check Browser Console**: Look for errors or logs in the browser developer console

4. **Verify Google Console Configuration**: Make sure your Google OAuth credentials in the Google Developer Console have the correct redirect URI

5. **Check Token Processing**: The received token should be stored in localStorage correctly

## Testing Via URL

You can also test the OAuth2 callback directly by visiting:
```
http://localhost:5173/oauth2/callback/google?token=test_token&userId=123&username=testuser&email=test@example.com&name=Test%20User
```

This simulates the callback with test parameters.

## Common Issues

1. **Invalid Redirect URI**: If Google shows an error about redirect URI, update it in both the Google Developer Console and `application.yaml`.

2. **CORS Issues**: Check that the backend allows CORS for `http://localhost:5173`.

3. **Missing Parameters**: The OAuth2 callback requires token, userId, and username parameters to be present.