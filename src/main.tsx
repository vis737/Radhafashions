import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_ZGlzdGluY3QtYW1vZWJhLTUzLmNsZXJrLmFjY291bnRzLmRldiQ';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        afterSignOutUrl="/"
        appearance={{
          baseTheme: dark,
          variables: {
            colorPrimary: '#C5A021',
            colorBackground: '#0B132B',
            colorText: '#FFFFFF',
            colorTextSecondary: '#94A3B8',
            colorInputBackground: '#020617',
            colorInputText: '#FFFFFF',
            colorBorder: '#1E293B',
            borderRadius: '0.75rem',
          },
          elements: {
            card: '!bg-[#0F172A] !border-slate-800 shadow-2xl text-slate-100',
            headerTitle: 'text-white font-display uppercase tracking-widest',
            headerSubtitle: 'text-slate-400 text-xs',
            socialButtonsBlockButton: '!bg-slate-900 !border-slate-700 !text-white hover:!bg-slate-800',
            socialButtonsBlockButtonText: '!text-white font-semibold text-xs',
            formButtonPrimary: '!bg-gradient-to-tr !from-[#C5A021] !to-[#E6C35C] hover:!from-[#B59011] hover:!to-[#D5B24B] !text-slate-950 font-bold',
            footerActionLink: 'text-[#C5A021] hover:text-[#E6C35C]'
          }
        }}
      >
        <App />
      </ClerkProvider>
    </ErrorBoundary>
  </StrictMode>,
);



