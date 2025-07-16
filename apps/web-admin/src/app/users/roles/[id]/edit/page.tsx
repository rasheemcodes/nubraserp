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

//
// 1) Modules list & sample data
//
const MODULES = [
    'sales',
    'finance',
    'hr',
    'system',
    'inventory',
    'manufacturing',
    'crm',
] as const;

const sampleRole = {
    id: 42,
    name: 'Editor',
    access: [
        { module: 'sales', permissions: { create: false, read: true, update: true, delete: false } },
        { module: 'finance', permissions: { create: false, read: true, update: false, delete: false } },
        { module: 'hr', permissions: { create: false, read: false, update: false, delete: false } },
        { module: 'system', permissions: { create: false, read: true, update: true, delete: false } },
        { module: 'inventory', permissions: { create: false, read: true, update: false, delete: false } },
        { module: 'manufacturing', permissions: { create: false, read: false, update: false, delete: false } },
        { module: 'crm', permissions: { create: true, read: true, update: false, delete: false } },
    ],
};

//
// 2) Zod schema & TS type
//
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

//
// 3) Edit page component
//
export default function RoleEditPage() {
    const form = useForm<RoleFormValues>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            name: sampleRole.name,
            access: sampleRole.access as Array<{
                module: typeof MODULES[number];
                permissions: {
                    create: boolean;
                    read: boolean;
                    update: boolean;
                    delete: boolean;
                };
            }>,
        },
    });

    // Mutation to update
    const { mutate: updateRole, isPending } = useMutation({
        mutationFn: async (data: RoleFormValues) => {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_USER_API_URL}/roles/${sampleRole.id}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(data),
                }
            );
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Failed to update role');
            return json;
        },
        onSuccess: () => toast.success('Role updated!'),
        onError: (err) => toast.error(err.message || 'Update failed'),
    });

    const onSubmit = form.handleSubmit((vals) => updateRole(vals));

    // show any name validation error once
    useEffect(() => {
        const e = form.formState.errors.name;
        if (e?.message) toast.error(e.message);
    }, [form.formState.errors.name]);

    return (
        <PageWrapper>
            <Card className="mt-6">
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Shield className="h-5 w-5" /> Edit Role #{sampleRole.id}
                        </CardTitle>
                        <CardDescription>
                            Modify the "{sampleRole.name}" role’s name & permissions.
                        </CardDescription>
                    </div>
                    <Button
                        onClick={onSubmit}
                        disabled={isPending}
                        className="flex items-center gap-2"
                    >
                        <PlusCircle className="h-5 w-5" /> Save Changes
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
                                            <Input {...field} />
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
                                                                        className="h-6 w-6"
                                                                        checked={field.value}
                                                                        onChange={e => field.onChange(e.target.checked)}
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
                            <div className="pt-4 text-right">
                                <Button type="submit" disabled={isPending}>
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </PageWrapper>
    );
}
