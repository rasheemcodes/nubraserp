"use client"
import React from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Container,
  Heading,
} from '@radix-ui/themes';
import {
  Home,
  ArrowLeft,
  FileQuestion,
} from 'lucide-react';

export default function NotFoundPage() {
  return (
    <Container size="1">
      <Flex
        direction="column"
        align="center"
        justify="center"
        style={{ minHeight: '100vh' }}
        gap="4"
      >
        {/* Icon */}
        <FileQuestion size={48} style={{ color: 'var(--gray-9)' }} />

        {/* 404 Text */}
        <Flex direction="column" align="center" gap="1">
          <Text size="8" weight="bold" color="gray">
            404
          </Text>
          <Heading size="4" color="gray">
            Page not found
          </Heading>
        </Flex>

        {/* Description */}
        <Text size="3" color="gray" align="center" >
          The page you&apos;re looking for doesn&apos;t exist.
        </Text>

        {/* Actions */}
        <Flex gap="3">
          <Button
            size="2"
            variant="outline"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={14} />
            Back
          </Button>
          
          <Button
            size="2"
            onClick={() => window.location.href = '/'}
          >
            <Home size={14} />
            Home
          </Button>
        </Flex>
      </Flex>
    </Container>
  );
}