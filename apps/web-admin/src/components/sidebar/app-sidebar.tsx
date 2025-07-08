"use client";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar"; 
import { NavMain} from "./nav-main"; 
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user"; 
import {
  Users2,
  Activity,
  BarChart3,
  Settings,
  ScrollText,
  ClipboardList,
  Book,
  LifeBuoy,
  Shield,
  LayoutDashboard,
  Bug,
  Wrench,
  Database
} from "lucide-react";
import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props} >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <Shield className="!size-6" />
                <span className="text-base font-semibold">System Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain
  items={[
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "User Management",
      url: "/users",
      icon: Users2,
    },
    // ── Observability ──
    {
      title: "System Logs",
      url: "/observability/logs",
      icon: ScrollText,
    },
    {
      title: "Audit Trails",
      url: "/observability/audit-trails",
      icon: ClipboardList,
    },
    {
      title: "System Metrics",
      url: "/observability/metrics",
      icon: BarChart3,
    },
    {
      title: "Monitoring",
      url: "/observability/monitoring",
      icon: Activity,
    },
    {
      title: "Error Tracking",
      url: "/observability/errors",
      icon: Bug,
    },
    // ── Config & Settings ──
    {
      title: "API Config",
      url: "/config/api",
      icon: Wrench,
    },
    {
      title: "Database Config",
      url: "/config/database",
      icon: Database,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
    // ── Developer & Tools ──
    // {
    //   title: "Health Checks",
    //   url: "/tools/health",
    //   icon: HeartPulse,
    // },
    // {
    //   title: "System Jobs",
    //   url: "/tools/jobs",
    //   icon: TimerReset,
    // },
    // {
    //   title: "Service Registry",
    //   url: "/tools/services",
    //   icon: Network,
    // },
  ]}
/>


        <NavSecondary
          className="mt-auto"
          items={[
            {
              title: "Docs",
              url: "/docs",
              icon:  Book,
            },
            {
              title: "Support",
              url: "/support",
              icon: LifeBuoy,
            },
          ]}
        />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={{phone: "+971 12345678", name: "demo user", avatar: "/placeholder.svg"}} />
      </SidebarFooter>
    </Sidebar>
  );
}
