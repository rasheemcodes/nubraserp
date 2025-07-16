'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, RotateCcw } from 'lucide-react';

export default function NotFoundPage() {
  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="h-full bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        {/* Icon
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
            <SquareSlash className="h-8 w-8 text-muted-foreground" />
          </div>
        </div> */}

        {/* Error Content */}
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-muted-foreground mb-2">
            404
          </h1>
          <h2 className="text-xl font-medium text-foreground mb-2">
            Page Not Found
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The page you're looking for doesn't exist.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mb-6">
          <Button onClick={handleGoHome} className="w-full cursor-pointer" size="default" >
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button variant="outline" onClick={handleGoBack} size="sm" className='cursor-pointer'>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            <Button variant="outline" onClick={handleRefresh} size="sm" className='cursor-pointer'>
              <RotateCcw className="mr-1 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

       
      </div>
    </div>
  );
}