"use client";

import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(12, 12, 14, 0.8)',
            backdropFilter: 'blur(16px)',
            color: '#FFFFFF',
            border: '1px solid rgba(124, 58, 237, 0.2)',
            borderRadius: '16px',
            padding: '12px 20px',
            fontSize: '13px',
            fontWeight: '600',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
          },
          success: {
            iconTheme: {
              primary: '#7C3AED',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
    </>
  );
}