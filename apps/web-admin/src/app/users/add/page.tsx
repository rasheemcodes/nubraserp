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
import { Check, PlusCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

//user form schema
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
        permissions: {
          create: true,
          read: true,
          update: true,
          delete: true,
        },
      },
      {
        module: 'inventory',
        permissions: {
          create: true,
          read: true,
          update: true,
          delete: true,
        },
      },
      {
        module: 'users',
        permissions: {
          create: true,
          read: true,
          update: true,
          delete: true,
        },
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
        permissions: {
          create: false,
          read: true,
          update: true,
          delete: false,
        },
      },
      {
        module: 'inventory',
        permissions: {
          create: false,
          read: true,
          update: false,
          delete: false,
        },
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
        permissions: {
          create: false,
          read: true,
          update: false,
          delete: false,
        },
      },
      {
        module: 'inventory',
        permissions: {
          create: false,
          read: true,
          update: false,
          delete: false,
        },
      },
      {
        module: 'reports',
        permissions: {
          create: false,
          read: true,
          update: false,
          delete: false,
        },
      },
    ],
    createdAt: new Date('2025-07-03T08:15:00Z'),
    updatedAt: new Date('2025-07-03T08:15:00Z'),
  },
];

export default function UserAddPage() {
  const form = useForm({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: undefined,
      roles: [],
    },
  });

  const { mutate: createUser } = useMutation({
    mutationFn: async (data: z.infer<typeof userFormSchema>) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_USER_API_URL}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(data),
        }
      );
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message || 'Failed to create user');
      }
      return json;
    },
    onSuccess: (data: { message: string }) => {
      toast.success(data.message || 'User created successfully!');
    },
    onError: (error) => {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Failed to create user. Please try again.');
    },
  });

  function onSubmit(data: z.infer<typeof userFormSchema>) {
    console.log('Form Data:', data);
    createUser(data);
  }

  const [rolesError, setRolesError] = React.useState<string[] | null>(null);

  useEffect(() => {
    Object.entries(form.formState.errors)
      .filter(([key]) => key === 'roles' || key.startsWith('roles.'))
      .forEach(([, error]) => {
        if (error?.message) {
          setRolesError(prev => {
            const prevErrors = prev ?? [];
            return [...prevErrors, error.message as string];  // Explicitly typed as string
          });
        }
      });
  }, [form.formState.errors]);


  return (
    <PageWrapper>
      <Card className="mt-6">
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <div>
              <CardTitle>Add a new user to nubras ERP</CardTitle>
              <CardDescription>
                Fill in the details below to create a new user account.
              </CardDescription>
            </div>
            <Button
              className=" gap-x-1 items-center md:flex hidden"
              onClick={form.handleSubmit(onSubmit)}
            >
              <PlusCircle className="h-6 w-6 fill-green-600 outline-0 text-white" />
              Create User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-8 flex flex-col md:flex-row gap-6">
              <div className="flex gap-6 flex-col w-full md:w-1/2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter user's first name"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter user's last name"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter user's phone number"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter user's email address"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-semibold">Assign Roles</h2>
                  <p className="text-sm text-muted-foreground max-w-prose">
                    Assign roles to the user. You can select multiple roles.
                    Control permissions for each role in the roles management
                    section.
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="roles"
                  render={({ field }) => (
                    <Accordion type="multiple" className="w-full">
                      <ScrollArea>
                        {sampleRoles.map((role) => {
                          const isSelected = field.value.some(
                            (r: { roleId: number }) => r.roleId === role.id
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
                                      className="form-checkbox h-6 w-6"
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
                                              (r: { roleId: number }) =>
                                                r.roleId !== role.id
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
                                        {Object.entries(entry.permissions).map(
                                          ([perm, allowed]) => (
                                            <div
                                              key={perm}
                                              className="flex items-center gap-1"
                                            >
                                              {allowed ? (
                                                <Check className="h-4 w-4 text-green-600" />
                                              ) : (
                                                <X className="h-4 w-4 text-red-500" />
                                              )}
                                              <span className="text-sm capitalize">
                                                {perm}
                                              </span>
                                            </div>
                                          )
                                        )}
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
                {rolesError && rolesError.length > 0 && (
                  <Alert variant="destructive" className='w-full'>
                    <AlertTitle>
                      {rolesError.map((error, index) => (
                        <li key={index} className=" dark:text-red-200 font-bold">
                          {error}
                        </li>
                      ))}
                    </AlertTitle>
                    <AlertDescription>
                      Please fix all the above errors before submitting.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <Button
                className="flex gap-x-1 items-center md:hidden"
                onClick={form.handleSubmit(onSubmit)}
              >
                <PlusCircle className="h-6 w-6 fill-green-600 outline-0 text-white" />
                Create User
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
// This code defines a user creation page in a web application using React and TypeScript.
// It includes a form for entering user details such as first name, last name, phone number, email, and roles.          