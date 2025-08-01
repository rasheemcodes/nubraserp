'use client';

import { Box, Flex, Text, Separator, Theme, Button } from '@radix-ui/themes';
import {
  Home,
  FileText,
  Package,
  Truck,
  Receipt,
  DollarSign,
  RotateCcw,
  Percent,
  Settings,
  CheckSquare,
  ArrowLeftRight,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import ModuleSwitcher from './moduleSelector';

const SalesnavItems = [
  { label: 'Dashboard', icon: Home, href: '/' },
  { label: 'Quotations', icon: FileText, href: '/sales/quotations' },
  { label: 'Sales Orders', icon: Package, href: '/sales/orders' },
  { label: 'Deliveries', icon: Truck, href: '/sales/deliveries' },
  { label: 'Invoices', icon: Receipt, href: '/sales/invoices' },
  { label: 'Payments', icon: DollarSign, href: '/sales/payments' },
  { label: 'Returns', icon: RotateCcw, href: '/sales/returns' },
  { label: 'Credit Notes', icon: ArrowLeftRight, href: '/sales/credit-notes' },
  { label: 'Discounts / Offers', icon: Percent, href: '/sales/discounts' },
  { label: 'Customer History', icon: CheckSquare, href: '/sales/history' },
  { label: 'Settings', icon: Settings, href: '/sales/settings' },
];

const InventorynavItems = [
  { label: 'Dashboard', icon: Home, href: '/' },
  { label: 'Inventory', icon: Package, href: '/inventory' },
  {
    label: 'Stock Adjustments',
    icon: RotateCcw,
    href: '/inventory/adjustments',
  },
  {
    label: 'Purchase Orders',
    icon: Package,
    href: '/inventory/purchase-orders',
  },
  {
    label: 'Purchase Invoices',
    icon: Receipt,
    href: '/inventory/purchase-invoices',
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const navItems = pathname.startsWith('/sales')
    ? SalesnavItems
    : InventorynavItems;

  return (
    <Box
      width="250px"
      flexGrow={'1'}
      minHeight={'calc(100vh - 44px)'}
      maxHeight={'calc(100vh - 44px)'}
      minWidth={'250px'}
      flexShrink={'0'}
      style={{
        borderRight: '1px solid var(--gray-a4)',
      }}
    >
      <Flex
        direction="column"
        p="4"
        gap="2"
        align="stretch"
        justify={'between'}
        height={'100%'}
      >
        <Flex
          direction="column"
          p="4"
          gap="2"
          align="stretch"
          style={{ flexGrow: 1 }}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{ textDecoration: 'none' }}
            >
              <Button
                variant={pathname === item.href ? 'soft' : 'ghost'}
                size="2"
                color={pathname === item.href ? 'indigo' : 'gray'}
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  gap: '8px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <item.icon size={18} />
                <Text size="2" style={{ whiteSpace: 'nowrap' }}>
                  {item.label}
                </Text>
              </Button>
            </Link>
          ))}
        </Flex>
        <ModuleSwitcher />
      </Flex>
    </Box>
  );
}
