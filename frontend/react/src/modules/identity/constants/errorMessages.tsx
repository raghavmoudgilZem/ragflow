export const AUTH_ERROR_MESSAGES = {
    OFFLINE: 'Network connectivity issue detected. Please check your internet connection.',
    MOCK_CONNECT_FAILED: 'Cannot connect to Mock Server. Please ensure your backend terminal is active on http://localhost:4000',
    FALLBACK_FAILED: 'Login failed due to an unexpected processing error.'
} as const;