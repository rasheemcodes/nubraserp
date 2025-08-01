'use client';

import {
  Box,
  Text,
  Flex,
  Button,
  DropdownMenu,
  Separator,
} from '@radix-ui/themes';
import { useSidebar } from '@/contexts/sidebar';
import { ChevronDown } from 'lucide-react';
import { Check } from 'lucide-react';

const ModuleSwitcher = () => {
  const { currentModule, currentModuleData, handleModuleChange, modules } =
    useSidebar();

  return (
    <Box>
      <Separator size="4" mb="4" />

      <Flex direction="column" gap="2">
        <Text
          size="1"
          color="gray"
          weight="medium"
          style={{ paddingLeft: '8px', paddingRight: '8px' }}
        >
          MODULE
        </Text>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button
              variant="ghost"
              size="2"
              color="gray"
              style={{
                width: '100%',
                justifyContent: 'space-between',
                padding: '8px 12px',
                gap: '8px',
              }}
            >
              <Flex align="center" gap="2">
                {currentModuleData?.icon && (
                  <currentModuleData.icon size={18} />
                )}
                <Text size="2" weight="medium">
                  {currentModuleData?.name}
                </Text>
              </Flex>
              <ChevronDown size={14} />
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content
            size="2"
            align="start"
            style={{
              width: '220px',
              maxHeight: '350px',
            }}
          >
            <DropdownMenu.Label>
              <Text size="2" weight="medium" color="gray">
                Switch Module
              </Text>
            </DropdownMenu.Label>

            <DropdownMenu.Separator />

            {modules.map((module) => {
              const IconComponent = module.icon;
              const isActive = module.id === currentModule;

              return (
                <DropdownMenu.Item
                  key={module.id}
                  disabled={isActive}
                  onSelect={() => handleModuleChange(module.id)}
                  style={{
                    padding: '8px 12px',
                    cursor: isActive ? 'default' : 'pointer',
                    opacity: isActive ? 0.7 : 1,
                  }}
                >
                  <Flex align="center" gap="3" width="100%">
                    <IconComponent size={16} />
                    <Text size="2" weight="medium" style={{ flex: 1 }}>
                      {module.name}
                    </Text>
                    {isActive && <Check size={14} />}
                  </Flex>
                </DropdownMenu.Item>
              );
            })}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>
    </Box>
  );
};

export default ModuleSwitcher;
