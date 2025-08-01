import { AvatarImage } from '@radix-ui/react-avatar';
import { Avatar, Box, Button, DropdownMenu, Flex } from '@radix-ui/themes';
import React from 'react';

export default function Header() {
  return (
    <Box
      width={'100%'}
      height={'44px'}
      minHeight={'44px'}
      style={{ borderBottom: '1px solid var(--gray-5)' }}
    >
      <Flex
        height={'100%'}
        px={'6'}
        align={'center'}
        justify={'between'}
        width={'100%'}
        flexGrow={'1'}
      >
        Alnubras
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Flex align={'center'} gap={'2'} style={{cursor: 'pointer', outline: 'none'}}>
              <Avatar size={'2'} radius="full" fallback="C">
                <AvatarImage src="https://avatars.githubusercontent.com/u/75042455?v=4" />
              </Avatar>
            </Flex>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content side="bottom" align="end" sideOffset={10}>
            <DropdownMenu.Item>Profile</DropdownMenu.Item>
            <DropdownMenu.Item>Settings</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>Logout</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>
    </Box>
  );
}
