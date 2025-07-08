'use client';

import React, { useEffect } from 'react';
import PageWrapper from '@/components/PageWrapper';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
} from '@/components/ui/form';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { PlusCircle, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

const MODULES = [
  'sales',
  'finance',
  'hr',
  'system',
  'inventory',
  'manufacturing',
  'crm',
] as const;

const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  access: z.array(
    z.object({
      module: z.enum(MODULES),
      permissions: z.object({
        create: z.boolean(),
        read: z.boolean(),
        update: z.boolean(),
        delete: z.boolean(),
      }),
    })
  ),
});
type RoleFormValues = z.infer<typeof roleSchema>;

export default function RoleCreatePage() {
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      access: MODULES.map((m) => ({
        module: m,
        permissions: { create: false, read: false, update: false, delete: false },
      })),
    },
  });

  const { mutate: createRole, isPending } = useMutation({
    mutationFn: async (data: RoleFormValues) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_USER_API_URL}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create role');
      return json;
    },
    onSuccess: () => toast.success('Role created!'),
    onError: (err) => toast.error(err.message || 'Creation failed'),
  });

  const onSubmit = form.handleSubmit((vals) => createRole(vals));

  useEffect(() => {
    const err = form.formState.errors.name;
    if (err?.message) toast.error(err.message);
  }, [form.formState.errors.name]);

  return (
    <PageWrapper>
      <Card className="mt-6">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" /> Create New Role
            </CardTitle>
            <CardDescription>
              Give a name and configure module permissions below.
            </CardDescription>
          </div>
          <Button
            onClick={onSubmit}
            disabled={isPending}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-5 w-5" /> Create Role
          </Button>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Role Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Sales Manager" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Permissions Matrix */}
              <div className="overflow-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="bg-muted">Module</TableHead>
                      {(['Create', 'Read', 'Update', 'Delete'] as const).map((perm) => (
                        <TableHead key={perm} className="bg-muted">
                          {perm}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {form.getValues('access').map((entry, idx) => (
                      <TableRow key={entry.module}>
                        <TableCell className="font-medium capitalize">
                          {entry.module}
                        </TableCell>
                        {(['create', 'read', 'update', 'delete'] as const).map((perm) => (
                          <TableCell key={perm} className="text-left">
                            <FormField
                              control={form.control}
                              name={`access.${idx}.permissions.${perm}`}
                              render={({ field }) => (
                                <FormControl>
                                  <Input
                                    type="checkbox"
                                    className=' h-6 w-6'
                                    checked={field.value}
                                    onChange={(e) => field.onChange(e.target.checked)}
                                  />
                                </FormControl>
                              )}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <PlusCircle className="h-5 w-5" /> Create Role
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
