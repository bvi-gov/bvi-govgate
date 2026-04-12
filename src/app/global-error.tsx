'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#0C1B2A] antialiased">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Application Error</h1>
            <p className="text-gray-400 text-sm mb-6">
              A client-side exception has occurred. Please refresh the page or try again.
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 mb-4">Error ID: {error.digest}</p>
            )}
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => reset()}
                className="bg-[#009B3A] text-white hover:bg-[#007A2E] w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-[#1E3A5F] text-gray-300 hover:bg-[#1E3A5F] w-full"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
