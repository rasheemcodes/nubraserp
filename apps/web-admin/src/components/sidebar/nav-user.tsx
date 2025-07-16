'use client';

import {
  LogOut as IconLogout,
  Bell as IconNotification,
  UserCircle as IconUserCircle,
  Shield,
  CheckCircle,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/auth-context';

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    return null;
  }

  // Generate initials from phone number (last 2 digits) or use default
  const initials = user.phone ? user.phone.slice(-2) : 'U';

  // Calculate total permissions
  const totalPermissions = user.roles?.reduce((total, role) => {
    return total + Object.keys(role.permissions || {}).length;
  }, 0) || 0;

  const activePermissions = user.roles?.reduce((total, role) => {
    return total + Object.values(role.permissions || {}).filter(Boolean).length;
  }, 0) || 0;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-2">
          {/* Account Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="flex-1 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src="" alt={user.phone} />
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.phone}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email || 'User'}
                  </span>
                </div>
                <IconUserCircle className="ml-auto size-4" />
              </SidebarMenuButton>
            </PopoverTrigger>
            <PopoverContent 
              className="w-80 p-0" 
              side={isMobile ? 'bottom' : 'right'}
              align="start"
              sideOffset={8}
            >
              <div className="p-4">
                {/* User Header */}
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12 rounded-xl">
                    <AvatarImage src="" alt={user.phone} />
                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base leading-tight">
                      {user.phone}
                    </h3>
                    <p className="text-muted-foreground text-sm truncate">
                      {user.email || 'No email provided'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        ID: {user.id}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {activePermissions}/{totalPermissions} permissions
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator className="mb-4" />

                {/* Roles & Permissions */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm">Access & Permissions</span>
                  </div>
                  
                  {user.roles && user.roles.length > 0 ? (
                    <div className="space-y-3">
                      {user.roles.map((role, index) => (
                        <div key={index} className="rounded-lg border bg-muted/30 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm capitalize">
                              {role.module} Module
                            </span>
                            <Badge variant="default" className="text-xs">
                              {Object.values(role.permissions || {}).filter(Boolean).length} active
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(role.permissions || {}).map(([permission, granted]) => (
                              <div key={permission} className="flex items-center gap-2 text-xs">
                                {granted ? (
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                ) : (
                                  <X className="h-3 w-3 text-red-400" />
                                )}
                                <span className={granted ? 'text-green-700' : 'text-muted-foreground'}>
                                  {permission}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No roles assigned
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                {/* Actions */}
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={logout}
                  >
                    <IconLogout className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Notifications Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0"
            onClick={() => router.push('/notifications')}
          >
            <IconNotification className="h-4 w-4" />
          </Button>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
