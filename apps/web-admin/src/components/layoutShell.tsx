'use client';

import { usePathname } from 'next/navigation';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/sidebar/site-header';
import AppSidebar from '@/components/sidebar/app-sidebar';
import { Toaster } from '@/components/ui/sonner';
import { AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import QueryProvider from '@/components/providers/query-client-provider';
import { useAuth } from '@/contexts/auth-context';

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isLoading } = useAuth();

  const isAuthRoute = ['/login'].includes(pathname);

  // Show loading spinner while checking authentication
  if (isLoading && !isAuthRoute) {
    return (
      <QueryProvider>
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
        <Toaster
          closeButton
          position="top-right"
          richColors
          swipeDirections={['right', 'top']}
          icons={{
            success: (
              <CheckCircle className="h-5 w-5 fill-green-600 text-white" />
            ),
            error: <AlertCircle className="h-5 w-5 fill-red-600 text-white" />,
            warning: (
              <AlertCircle className="h-5 w-5 fill-yellow-600 text-white" />
            ),
            info: <AlertCircle className="h-5 w-5 fill-blue-600 text-white" />,
            close: <XCircle className="h-5 w-5 fill-gray-600 text-white" />,
          }}
        />
      </QueryProvider>
    );
  }

  if (isAuthRoute) {
    return (
      <QueryProvider>
        {children}
        <Toaster
          closeButton
          position="top-right"
          richColors
          swipeDirections={['right', 'top']}
          icons={{
            success: (
              <CheckCircle className="h-5 w-5 fill-green-600 text-white" />
            ),
            error: <AlertCircle className="h-5 w-5 fill-red-600 text-white" />,
            warning: (
              <AlertCircle className="h-5 w-5 fill-yellow-600 text-white" />
            ),
            info: <AlertCircle className="h-5 w-5 fill-blue-600 text-white" />,
            close: <XCircle className="h-5 w-5 fill-gray-600 text-white" />,
          }}
        />
      </QueryProvider>
    ); // No sidebar, no header
  }

  return (
    <QueryProvider>
      <SidebarProvider
        defaultOpen
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex-1 flex flex-col">{children}</div>
          <Toaster
            closeButton
            position="top-right"
            richColors
            swipeDirections={['right', 'top']}
            icons={{
              success: (
                <CheckCircle className="h-5 w-5 fill-green-600 text-white" />
              ),
              error: (
                <AlertCircle className="h-5 w-5 fill-red-600 text-white" />
              ),
              warning: (
                <AlertCircle className="h-5 w-5 fill-yellow-600 text-white" />
              ),
              info: (
                <AlertCircle className="h-5 w-5 fill-blue-600 text-white" />
              ),
              close: <XCircle className="h-5 w-5 fill-gray-600 text-white" />,
            }}
          />
        </SidebarInset>
      </SidebarProvider>
    </QueryProvider>
  );
}
