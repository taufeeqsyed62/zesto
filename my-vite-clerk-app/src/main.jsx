import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
   <ClerkProvider
  publishableKey={PUBLISHABLE_KEY}
  signInFallbackRedirectUrl="/"
  signUpFallbackRedirectUrl="/"
  appearance={{
    baseTheme: 'dark',
    elements: {
      card: 'bg-gray-800 text-white',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
  }}
>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</ClerkProvider>
  </React.StrictMode>
);