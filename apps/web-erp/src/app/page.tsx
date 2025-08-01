'use client';
import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  Text, 
  Flex, 
  Separator,
  Badge,
  Grid,
  Container
} from '@radix-ui/themes';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  UserCheck, 
  Calculator, 
  FileText, 
  BarChart3, 
  Settings,
  Building2,
  Truck
} from 'lucide-react';

type ModuleId = 'sales' | 'inventory' | 'crm' | 'hr' | 'accounting' | 'procurement' | 'manufacturing' | 'reports' | 'documents' | 'settings';
type ModuleColor = 'indigo' | 'green' | 'purple' | 'orange' | 'cyan' | 'brown' | 'gray' | 'blue' | 'teal' | 'ruby';

interface Module {
  id: ModuleId;
  name: string;
  icon: React.ElementType;
  description: string;
  color: ModuleColor;
}

const ModuleSwitcher = () => {
  const [currentModule, setCurrentModule] = useState<ModuleId>('sales');

  const modules: Module[] = [
    {
      id: 'sales',
      name: 'Sales',
      icon: ShoppingCart,
      description: 'Manage sales orders and customers',
      color: 'blue'
    },
    {
      id: 'inventory',
      name: 'Inventory',
      icon: Package,
      description: 'Stock management and warehousing',
      color: 'green'
    },
    {
      id: 'crm',
      name: 'CRM',
      icon: Users,
      description: 'Customer relationship management',
      color: 'purple'
    },
    {
      id: 'hr',
      name: 'Human Resources',
      icon: UserCheck,
      description: 'Employee management and payroll',
      color: 'orange'
    },
    {
      id: 'accounting',
      name: 'Accounting',
      icon: Calculator,
      description: 'Financial management and reporting',
      color: 'cyan'
    },
    {
      id: 'procurement',
      name: 'Procurement',
      icon: Truck,
      description: 'Purchase orders and supplier management',
      color: 'brown'
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing',
      icon: Building2,
      description: 'Production planning and control',
      color: 'gray'
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: BarChart3,
      description: 'Analytics and business intelligence',
      color: 'indigo'
    },
    {
      id: 'documents',
      name: 'Documents',
      icon: FileText,
      description: 'Document management system',
      color: 'teal'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      description: 'System configuration and preferences',
      color: 'ruby'
    }
  ];

  const handleModuleClick = (moduleId: ModuleId) => {
    if (moduleId !== currentModule) {
      setCurrentModule(moduleId);
      console.log(`Navigating to ${moduleId}`);
    }
  };

  return (

    <Container style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "calc(100vh - 44px)"}}>
      <Flex direction="column" gap="4">
        <Flex direction="column">
          <Text size="5" weight="bold" mb="1">
            ERP Module Switcher
          </Text>
          <Text size="2" color="gray">
            Select a module to access its features
          </Text>
        </Flex>

        <Separator size="4" />

        <Grid columns={{ initial: '2', sm: '3', md: '4', lg: '4' }} gap="3">
          {modules.map((module) => {
            const IconComponent = module.icon;
            const isActive = module.id === currentModule;
            
            return (
              <Card 
                key={module.id}
                variant={isActive ? 'classic' : 'surface'}
                style={{ 
                  cursor: isActive ? 'default' : 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  padding: '16px',
                  minHeight: '120px',
                  position: 'relative'
                }}
                className={!isActive ? 'hover-card' : ''}
                onClick={() => handleModuleClick(module.id)}
              >
                <Flex direction="column" align="center" gap="3" height="100%" justify="between">
                  <Box position="relative">
                    <Box 
                      p="2" 
                      style={{ 
                        borderRadius: '8px',
                        backgroundColor: isActive ? `var(--${module.color}-3)` : 'var(--gray-2)',
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <IconComponent 
                        size={24} 
                        style={{ 
                          color: isActive ? `var(--${module.color}-11)` : 'var(--gray-11)',
                          transition: 'color 0.2s ease-in-out'
                        }} 
                      />
                    </Box>
                    {isActive && (
                      <Badge 
                        color={module.color}
                        variant="solid"
                        size="1"
                        style={{
                          position: 'absolute',
                          top: '-4px',
                          right: '-4px',
                          fontSize: '8px',
                          minWidth: '12px',
                          height: '12px',
                          padding: '0'
                        }}
                      >
                        ●
                      </Badge>
                    )}
                  </Box>
                  
                  <Flex direction="column" align="center" gap="1" style={{ textAlign: 'center' }}>
                    <Text 
                      size="2" 
                      weight="bold"
                      style={{
                        color: isActive ? `var(--${module.color}-11)` : 'var(--gray-12)',
                        transition: 'color 0.2s ease-in-out'
                      }}
                    >
                      {module.name}
                    </Text>
                    <Text 
                      size="1" 
                      color="gray" 
                      style={{ 
                        lineHeight: '1.3',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textAlign: 'center'
                      }}
                    >
                      {module.description}
                    </Text>
                  </Flex>
                </Flex>
              </Card>
            );
          })}
        </Grid>

        <Separator size="4" />

        <Flex justify="between" align="center" wrap="wrap" gap="2">
          <Text size="2" color="gray">
            Currently active: <Text weight="bold" color={modules.find(m => m.id === currentModule)?.color}>
              {modules.find(m => m.id === currentModule)?.name}
            </Text>
          </Text>
          <Badge color={modules.find(m => m.id === currentModule)?.color} variant="soft">
            Active Module
          </Badge>
        </Flex>
      </Flex>

      <style jsx>{`
        .hover-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        .hover-card:hover [data-icon] {
          transform: scale(1.1);
        }
      `}</style>
    </Container>
  );
};

export default ModuleSwitcher;