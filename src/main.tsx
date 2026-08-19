import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthenticateWithRedirectCallback, ClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_ZGlzdGluY3QtYW1vZWJhLTUzLmNsZXJrLmFjY291bnRzLmRldiQ';

function RootApp() {
  if (window.location.pathname === '/sso-callback') {
    return <AuthenticateWithRedirectCallback />;
  }
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        afterSignOutUrl="/"
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
        appearance={{
          baseTheme: dark,
          variables: {
            colorPrimary: '#D4648A',
            colorBackground: '#0B132B',
            colorText: '#FFFFFF',
            colorTextSecondary: '#94A3B8',
            colorInputBackground: '#020617',
            colorInputText: '#FFFFFF',
            colorBorder: '#1E293B',
            borderRadius: '0.75rem',
          },
          elements: {
            card: '!bg-[#0F172A] !border-pink-100 dark:border-pink-900/20 shadow-2xl text-gray-900 dark:text-gray-100',
            headerTitle: 'text-white font-display uppercase tracking-widest',
            headerSubtitle: 'text-gray-500 dark:text-gray-400 text-xs',
            socialButtonsBlockButton: '!bg-white dark:bg-gray-900 !border-pink-200/50 dark:border-pink-900/30 !text-white hover:!bg-gray-50 dark:bg-gray-800',
            socialButtonsBlockButtonText: '!text-white font-semibold text-xs',
            providerIcon__apple: { filter: 'none' },
            formButtonPrimary: '!bg-gradient-to-tr !from-[#D4648A] !to-[#E6C35C] hover:!from-[#B59011] hover:!to-[#D5B24B] !text-gray-950 font-bold',
            footerActionLink: 'text-[#D4648A] hover:text-[#E6C35C]'
          }
        }}
      >
        <RootApp />
      </ClerkProvider>
    </ErrorBoundary>
  </StrictMode>,
);



