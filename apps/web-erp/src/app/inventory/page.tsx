import { Box, Button, Flex, Text } from '@radix-ui/themes';
import { PlusIcon } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function Page() {
  return (
    <Flex direction="column" p="4" gap="4" maxWidth={'9'}>
      <Flex justify="between" align="center">
        <Text size="6" weight="bold">
          Inventory items
        </Text>
        <Link href="/inventory/add">
          <Button variant="solid">
            <PlusIcon size={16} style={{ marginRight: 8 }} />
            Add Item
          </Button>
        </Link>
      </Flex>
    </Flex>
  );
}
