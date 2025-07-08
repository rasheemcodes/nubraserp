'use client';

import PageWrapper from '@/components/PageWrapper';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Check, X, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';

//
// 1) Zod schema for validation
//
const userFormSchema = z.object({
  firstName: z.string().min(3).max(50),
  lastName: z.string().min(3).max(50),
  phone: z.string().min(5).max(20),
  email: z.string().email().optional(),
  roles: z
    .array(
      z.object({
        roleId: z.number().int().min(1, 'Role ID must be a positive integer'),
      })
    )
    .nonempty({ message: 'At least one role must be selected' }),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

//
// 2) Sample roles data
//
type Role = {
  id: number;
  name: string;
  access: Array<{
    module: string;
    permissions: Record<string, boolean>;
  }>;
  createdAt: Date;
  updatedAt: Date;
};
export const sampleRoles: Role[] = [
  {
    id: 1,
    name: 'Admin',
    access: [
      {
        module: 'finance',
        permissions: { create: true, read: true, update: true, delete: true },
      },
      {
        module: 'inventory',
        permissions: { create: true, read: true, update: true, delete: true },
      },
      {
        module: 'users',
        permissions: { create: true, read: true, update: true, delete: true },
      },
    ],
    createdAt: new Date('2025-07-01T10:00:00Z'),
    updatedAt: new Date('2025-07-01T10:00:00Z'),
  },
  {
    id: 2,
    name: 'Editor',
    access: [
      {
        module: 'finance',
        permissions: { create: false, read: true, update: true, delete: false },
      },
      {
        module: 'inventory',
        permissions: { create: false, read: true, update: false, delete: false },
      },
    ],
    createdAt: new Date('2025-07-02T09:30:00Z'),
    updatedAt: new Date('2025-07-02T09:30:00Z'),
  },
  {
    id: 3,
    name: 'Viewer',
    access: [
      {
        module: 'finance',
        permissions: { create: false, read: true, update: false, delete: false },
      },
      {
        module: 'inventory',
        permissions: { create: false, read: true, update: false, delete: false },
      },
      {
        module: 'reports',
        permissions: { create: false, read: true, update: false, delete: false },
      },
    ],
    createdAt: new Date('2025-07-03T08:15:00Z'),
    updatedAt: new Date('2025-07-03T08:15:00Z'),
  },
];

//
// 3) Sample user data to pre-fill the form
//
const sampleUser: UserFormValues & { id: number } = {
  id: 42,
  firstName: 'Alice',
  lastName: 'Wonderland',
  phone: '+971500123456',
  email: 'alice@example.com',
  roles: [{ roleId: 1 }, { roleId: 3 }],
};

export default function UserEditPage() {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: sampleUser,
  });

  // 4) React Query mutation stub
  const { mutate: updateUser, isPending } = useMutation({
    mutationFn: async (data: typeof sampleUser) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_USER_API_URL}/auth/${sampleUser.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Update failed');
      return json;
    },
    onSuccess: (resp: { message: string }) => {
      toast.success(resp.message || 'User updated successfully!');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update user.');
    },
  });

  function onSubmit(data: UserFormValues) {
    updateUser({ ...data, id: sampleUser.id });
  }

  // only toast array-level “roles” errors
  useEffect(() => {
    const err = form.formState.errors.roles;
    if (err?.message) toast.error(err.message);
  }, [form.formState.errors.roles]);

  return (
    <PageWrapper>
      <Card className="mt-6">
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <div>
              <CardTitle>Edit User</CardTitle>
              <CardDescription>Modify user details and roles</CardDescription>
            </div>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isPending}
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-6 w-6" />
              Update User
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form className="space-y-8 flex flex-col lg:flex-row gap-6">
              {/* Left column: basic info */}
              <div className="flex flex-col gap-6 w-full lg:w-1/2">
                {(['firstName', 'lastName', 'phone', 'email'] as const).map(
                  (fieldName) => (
                    <FormField
                      key={fieldName}
                      control={form.control}
                      name={fieldName}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {fieldName === 'firstName'
                              ? 'First Name'
                              : fieldName === 'lastName'
                              ? 'Last Name'
                              : fieldName === 'phone'
                              ? 'User Phone'
                              : 'User Email'}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={`Enter user's ${fieldName}`}
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )
                )}
              </div>

              {/* Right column: roles accordion */}
              <div className="flex flex-col gap-6 w-full lg:w-1/2">
                <div>
                  <h2 className="text-lg font-semibold">Assign Roles</h2>
                  <p className="text-sm text-muted-foreground max-w-prose">
                    Toggle roles for this user. See each role’s permissions
                    below.
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="roles"
                  render={({ field }) => (
                    <Accordion type="multiple" className="w-full">
                      <ScrollArea className="h-[400px] overflow-auto">
                        {sampleRoles.map((role) => {
                          const isSelected = field.value.some(
                            (r) => r.roleId === role.id
                          );
                          return (
                            <AccordionItem
                              key={role.id}
                              value={`role-${role.id}`}
                            >
                              <AccordionTrigger>
                                <div className="flex items-center justify-between w-full">
                                  <label
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Input
                                      type="checkbox"
                                      className='h-6 w-6 cursor-pointer'
                                      checked={isSelected}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          field.onChange([
                                            ...field.value,
                                            { roleId: role.id },
                                          ]);
                                        } else {
                                          field.onChange(
                                            field.value.filter(
                                              (r) => r.roleId !== role.id
                                            )
                                          );
                                        }
                                      }}
                                    />
                                    <span className="font-medium">
                                      {role.name}
                                    </span>
                                  </label>
                                  <span className="text-sm text-muted-foreground">
                                    {role.access.length} modules
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                  {role.access.map((entry) => (
                                    <div
                                      key={entry.module}
                                      className="space-y-1"
                                    >
                                      <Badge
                                        variant="outline"
                                        className="flex items-center gap-1"
                                      >
                                        <Check className="h-4 w-4" />
                                        <span className="capitalize">
                                          {entry.module}
                                        </span>
                                      </Badge>
                                      <div className="flex flex-wrap gap-2 pl-2">
                                        {Object.entries(
                                          entry.permissions
                                        ).map(([perm, ok]) => (
                                          <div
                                            key={perm}
                                            className="flex items-center gap-1"
                                          >
                                            {ok ? (
                                              <Check className="h-4 w-4 text-green-600" />
                                            ) : (
                                              <X className="h-4 w-4 text-red-500" />
                                            )}
                                            <span className="text-sm capitalize">
                                              {perm}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </ScrollArea>
                    </Accordion>
                  )}
                />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
