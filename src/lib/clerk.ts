/**
 * Clerk is an optional enhancement to the storefront.  The core account
 * experience uses the application's own password and OTP APIs, so a missing
 * Clerk environment variable must never prevent customers from browsing.
 */
export const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() || '';

export const isClerkEnabled = /^pk_(?:test|live)_[A-Za-z0-9_-]+$/.test(clerkPublishableKey);
