'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Package, Users, UserCheck, Calculator, Truck, Building2, BarChart3, FileText, Settings, LucideIcon } from 'lucide-react';

type ModuleId =
  | 'sales'
  | 'inventory'
  | 'crm'
  | 'hr'
  | 'accounting'
  | 'procurement'
  | 'manufacturing'
  | 'reports'
  | 'documents'
  | 'settings';

type ModuleColor = 'indigo' | 'green' | 'purple' | 'orange' | 'cyan' | 'brown' | 'gray' | 'blue' | 'teal' | 'ruby';

interface ModuleData {
  id: ModuleId;
  name: string;
  route: string;
  icon: LucideIcon;
  color: ModuleColor;
}

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentModule: ModuleId;
  handleModuleChange: (moduleId: ModuleId) => void;
  currentModuleData: ModuleData | null;
  modules: ModuleData[];
}

export const SidebarContext = createContext<SidebarContextType | null>(null);

const modules = [
    {
      id: 'sales' as ModuleId,
      name: 'Sales',
      route: '/sales',
      icon: ShoppingCart,
      color: 'indigo' as ModuleColor
    },
    {
      id: 'inventory' as ModuleId,
      name: 'Inventory',
      route: '/inventory',
      icon: Package,
      color: 'green' as ModuleColor
    },
    {
      id: 'crm' as ModuleId,
      name: 'CRM',
      route: '/crm',
      icon: Users,
      color: 'purple' as ModuleColor
    },
    {
      id: 'hr' as ModuleId,
      name: 'HR',
      route: '/hr',
      icon: UserCheck,
      color: 'orange' as ModuleColor
    },
    {
      id: 'accounting' as ModuleId,
      name: 'Accounting',
      route: '/accounting',
      icon: Calculator,
      color: 'cyan' as ModuleColor
    },
    {
      id: 'procurement' as ModuleId,
      name: 'Procurement',
      route: '/procurement',
      icon: Truck,
      color: 'brown' as ModuleColor
    },
    {
      id: 'manufacturing' as ModuleId,
      name: 'Manufacturing',
      route: '/manufacturing',
      icon: Building2,
      color: 'gray' as ModuleColor
    },
    {
      id: 'reports' as ModuleId,
      name: 'Reports',
      route: '/reports',
      icon: BarChart3,
      color: 'blue' as ModuleColor
    },
    {
      id: 'documents' as ModuleId,
      name: 'Documents',
      route: '/documents',
      icon: FileText,
      color: 'teal' as ModuleColor
    },
    {
      id: 'settings' as ModuleId,
      name: 'Settings',
      route: '/settings',
      icon: Settings,
      color: 'ruby' as ModuleColor
    }
  ];


export const SidebarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  // Determine current module from path
  const getCurrentModule = (path: string): ModuleId => {
    if (path.startsWith('/sales')) return 'sales';
    if (path.startsWith('/inventory')) return 'inventory';
    if (path.startsWith('/crm')) return 'crm';
    if (path.startsWith('/hr')) return 'hr';
    if (path.startsWith('/accounting')) return 'accounting';
    if (path.startsWith('/procurement')) return 'procurement';
    if (path.startsWith('/manufacturing')) return 'manufacturing';
    if (path.startsWith('/reports')) return 'reports';
    if (path.startsWith('/documents')) return 'documents';
    if (path.startsWith('/settings')) return 'settings';
    return 'sales';
  };



  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentModule, setCurrentModule] = useState<ModuleId>(getCurrentModule(pathname));

  const handleModuleChange = (moduleId: ModuleId) => {
    const selectedModule = modules.find(m => m.id === moduleId);
    if (selectedModule && moduleId !== currentModule) {
      setCurrentModule(moduleId)
      router.push(selectedModule.route)
    }
  };

  const currentModuleData = modules.find(m => m.id === currentModule) || null;

  return (
    <SidebarContext.Provider
      value={{ isOpen, setIsOpen, currentModule, handleModuleChange, currentModuleData, modules }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
