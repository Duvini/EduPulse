/**
 * Test script to validate both authentication methods
 * 
 * This file contains functions to test:
 * 1. Traditional username/password login
 * 2. Google OAuth2 login
 * 3. User state management for both auth methods
 */

// Helper function to check if user is properly stored
function checkUserStorage() {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  
  console.log('=== Authentication State Check ===');
  console.log('Token exists:', !!token);
  console.log('User data:', user);
  
  if (!token) {
    console.error('No token found in localStorage!');
    return false;
  }
  
  if (!user) {
    console.error('No user data found in localStorage!');
    return false;
  }
  
  if (!user.id || !user.username) {
    console.error('User data is incomplete!');
    return false;
  }
  
  console.log('Authentication state is valid');
  return true;
}

// Test traditional login (run this in the browser console from the signin page)
function testTraditionalLogin(username, password) {
  console.log(`Attempting traditional login with username: ${username}`);
  
  // Clear existing auth data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  const usernameInput = document.querySelector('input[name="username"]');
  const passwordInput = document.querySelector('input[name="password"]');
  const loginButton = document.querySelector('button[type="submit"]');
  
  if (!usernameInput || !passwordInput || !loginButton) {
    console.error('Login form elements not found!');
    return;
  }
  
  // Set input values
  usernameInput.value = username;
  const usernameEvent = new Event('input', { bubbles: true });
  usernameInput.dispatchEvent(usernameEvent);
  
  passwordInput.value = password;
  const passwordEvent = new Event('input', { bubbles: true });
  passwordInput.dispatchEvent(passwordEvent);
  
  // Submit form
  console.log('Submitting login form...');
  loginButton.click();
  
  // Check results after a short delay
  setTimeout(() => {
    const successful = checkUserStorage();
    console.log('Traditional login test ' + (successful ? 'PASSED' : 'FAILED'));
  }, 2000);
}

// Helper to test OAuth2 login (this just provides instructions)
function testOAuth2Login() {
  console.log('=== Google OAuth2 Login Test ===');
  console.log('To test Google OAuth2 login, follow these steps:');
  console.log('1. Clear your browser storage (localStorage) for this site');
  console.log('2. Click the "Sign in with Google" button');
  console.log('3. Complete the Google authentication flow');
  console.log('4. After redirection, run checkUserStorage() function in the console');
  console.log('5. Verify that you are properly logged in and redirected to the home page');
}

// Compare both authentication methods
function compareAuthMethods() {
  const user = JSON.parse(localStorage.getItem('user'));
  
  console.log('=== Authentication Method Detection ===');
  
  if (!user) {
    console.log('No authenticated user found');
    return;
  }
  
  if (user.provider === 'google') {
    console.log('Currently logged in via: Google OAuth2');
  } else {
    console.log('Currently logged in via: Traditional username/password');
  }
  
  console.log('User data:', user);
}

// Export functions so they're accessible in the browser console
window.testAuthFunctions = {
  testTraditionalLogin,
  testOAuth2Login,
  checkUserStorage,
  compareAuthMethods
};

console.log('Auth test functions loaded! Access them via window.testAuthFunctions');
