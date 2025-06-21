# Error Handling Troubleshooting Guide

## Problem: Server Errors Not Showing to Users

This document addresses the issue where server errors are not being displayed to users, making it difficult to understand what's happening when operations fail.

## Root Causes Identified

### 1. Toast Configuration Issues
- **Problem**: `TOAST_LIMIT = 1` - Only one error message could be shown at a time
- **Problem**: `TOAST_REMOVE_DELAY = 1000000` (16+ minutes) - Errors stayed on screen forever
- **Solution**: Updated to `TOAST_LIMIT = 5` and `TOAST_REMOVE_DELAY = 8000` (8 seconds)

### 2. Missing Global Error Handling
- **Problem**: No React ErrorBoundary to catch unexpected errors
- **Problem**: No global handlers for unhandled promise rejections
- **Solution**: Added `ErrorBoundary` component and global error handlers

### 3. Inconsistent Error Display
- **Problem**: Many catch blocks only logged to console without showing user-friendly messages
- **Problem**: Different error handling patterns across components
- **Solution**: Created centralized `handleError` utility

### 4. Axios Interceptor Limitations
- **Problem**: Response interceptor didn't provide user feedback for all error types
- **Solution**: Enhanced interceptor with better error classification and user notifications

## Solutions Implemented

### 1. Enhanced Toast System
```typescript
// Before
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

// After  
const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 8000;
```

### 2. Error Boundary Component
Created `src/components/ErrorBoundary.tsx` to catch React render errors and display user-friendly messages.

### 3. Centralized Error Handler
Created `src/lib/errorHandler.ts` with:
- Consistent error message extraction
- Automatic toast notifications
- Global unhandled error handlers
- HTTP status code mapping

### 4. Error Handler Hook
Created `src/hooks/useErrorHandler.ts` for easy component integration:
```typescript
const { showError } = useErrorHandler();

// Usage
try {
  await someApiCall();
} catch (error) {
  showError(error, {
    title: "Operation Failed",
    fallbackMessage: "Something went wrong"
  });
}
```

### 5. Enhanced Axios Interceptor
Updated `src/lib/axios.ts` to:
- Show network errors to users
- Handle 5xx server errors globally
- Provide better authentication error feedback

## How to Use the New Error Handling

### For New Components
```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler';

const MyComponent = () => {
  const { showError } = useErrorHandler();
  
  const handleAction = async () => {
    try {
      await someOperation();
    } catch (error) {
      showError(error, {
        title: "Action Failed",
        fallbackMessage: "Unable to complete the action"
      });
    }
  };
};
```

### For Existing Components
Replace manual error handling:
```typescript
// Old way
} catch (error: any) {
  console.error('Error:', error);
  let errorMessage = "Unknown error";
  if (error?.response?.data?.message) {
    errorMessage = error.response.data.message;
  }
  toast({
    title: "Error",
    description: errorMessage,
    variant: "destructive"
  });
}

// New way
} catch (error) {
  showError(error, {
    title: "Operation Failed"
  });
}
```

## Testing Error Handling

### 1. Network Errors
- Disconnect internet and try operations
- Should show "인터넷 연결을 확인해주세요" message

### 2. Server Errors (5xx)
- Should show "서버에서 오류가 발생했습니다" message
- Check browser console for detailed error logs

### 3. Client Errors (4xx)
- Individual handlers should provide specific messages
- Generic 400/401/403/404 messages provided by default

### 4. Unhandled Errors
- JavaScript errors should show error boundary UI
- Promise rejections should show toast notifications

## Best Practices

### 1. Use Centralized Error Handler
Always use `useErrorHandler` hook instead of manual error handling.

### 2. Provide Context-Specific Messages
```typescript
showError(error, {
  title: "Student Update Failed",
  fallbackMessage: "Unable to update student information"
});
```

### 3. Don't Suppress Errors
Avoid empty catch blocks or console.error without user notification.

### 4. Test Error Scenarios
- Invalid inputs
- Network failures  
- Server unavailability
- Authentication expiry

## Configuration

### Environment Variables
Ensure `VITE_API_URL` is properly configured for your environment.

### Toast Settings
Adjust toast settings in `src/hooks/use-toast.ts`:
- `TOAST_LIMIT`: Maximum concurrent error messages
- `TOAST_REMOVE_DELAY`: How long errors remain visible (milliseconds)

## Debugging

### 1. Check Browser Console
Detailed error information is always logged to console for debugging.

### 2. Network Tab
Verify API responses and status codes in browser dev tools.

### 3. Toast Component
Ensure `<Toaster />` is properly rendered in your app structure.

## Common Issues

### Toast Not Showing
- Check if `<Toaster />` is rendered in App.tsx
- Verify error handler is being called
- Check browser console for JavaScript errors

### Generic Error Messages
- Server might not be sending proper error messages
- Check API response format
- Verify error extraction logic in `handleError`

### Too Many Error Messages
- Adjust `TOAST_LIMIT` in use-toast.ts
- Check for duplicate error handling
- Ensure proper error boundaries 