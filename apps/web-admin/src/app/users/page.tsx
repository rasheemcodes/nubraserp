'use client';

import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  getExpandedRowModel,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Phone,
  Mail,
  Shield,
  Calendar,
  User,
  Users,
  Minus,
  Plus,
  Check,
  X,
} from 'lucide-react';
import Link from 'next/link';

type AccessEntry = {
  module: string;
  permissions: Record<string, boolean>;
};

type RoleWithAccess = {
  id: number;
  name: string;
  access: AccessEntry[];
};

type User = {
  id: number;
  phone: string;
  email: string;
  isActive: boolean;
  roles: RoleWithAccess[];
  createdAt: Date;
};

const sampleRoles: RoleWithAccess[] = [
  {
    id: 1,
    name: 'Admin',
    access: [
      { module: 'finance', permissions: { create: true, read: true, update: true, delete: true } },
      { module: 'inventory', permissions: { create: true, read: true, update: true, delete: true } },
      { module: 'users', permissions: { create: true, read: true, update: true, delete: true } },
    ],
  },
  {
    id: 2,
    name: 'Editor',
    access: [
      { module: 'finance', permissions: { create: false, read: true, update: true, delete: false } },
      { module: 'inventory', permissions: { create: false, read: true, update: false, delete: false } },
    ],
  },
  {
    id: 3,
    name: 'Viewer',
    access: [
      { module: 'finance', permissions: { create: false, read: true, update: false, delete: false } },
      { module: 'reports', permissions: { create: false, read: true, update: false, delete: false } },
    ],
  },
];

// --- 3) mockUsers referencing sampleRoles ---
const mockUsers: User[] = [
  {
    id: 1,
    phone: '+971500000000',
    email: 'john.doe@example.com',
    isActive: true,
    roles: [sampleRoles[0], sampleRoles[2]],
    createdAt: new Date('2023-01-01'),
  },
  {
    id: 2,
    phone: '+971500000001',
    email: 'jane.doe@example.com',
    isActive: false,
    roles: [sampleRoles[1]],
    createdAt: new Date('2023-03-15'),
  },
];

const columnHelper = createColumnHelper<User>();
import type { ExpandedState, OnChangeFn } from '@tanstack/react-table';

export default function UsersDataTable() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  const [expanded, setExpanded] = useState<ExpandedState>({});

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            ID
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{row.getValue('id')}</span>
          </div>
        ),
      }),
      columnHelper.accessor('phone', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Phone
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-sm">{row.getValue('phone')}</span>
          </div>
        ),
      }),
      columnHelper.accessor('email', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Email
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{row.getValue('email')}</span>
          </div>
        ),
      }),
      columnHelper.accessor('isActive', {
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.getValue('isActive') ? 'default' : 'secondary'}>
            {row.getValue('isActive') ? 'Active' : 'Inactive'}
          </Badge>
        ),
      }),
      columnHelper.accessor('roles', {
        header: 'Roles',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {(row.getValue('roles') as RoleWithAccess[]).map((role) => (
              <Badge key={role.id} variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                {role.name}
              </Badge>
            ))}
          </div>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor('createdAt', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Created
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {(row.getValue('createdAt') as Date).toLocaleDateString()}
            </span>
          </div>
        ),
      }),
      columnHelper.display({
        id: 'expander',
        header: () => null,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => row.toggleExpanded()}
          >
            {row.getIsExpanded() ? <Minus /> : <Plus />}
          </Button>
        ),
      }),
    ],
    []
  );

  const table = useReactTable<User>({
    data: mockUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(), // ← add
    state: { globalFilter, sorting, expanded }, // ← include expanded
    onExpandedChange: setExpanded as OnChangeFn<ExpandedState>, // ← fix type
    onSortingChange: setSorting,
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-1 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 md:gap-0 md:items-center justify-between w-full">
            <div className="flex flex-col gap-1">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Users Management
              </CardTitle>
              <CardDescription>
                Manage your users and their roles efficiently with advanced
                filtering and sorting capabilities.
              </CardDescription>
            </div>
            <div className="flex items-center gap-x-6">

              <Link href="/users/roles" passHref>
                <Button variant={"secondary"} className="flex items-center gap-2">
                  <Shield className="h-4 w-4 mr-2" />
                  Manage Roles
                </Button>
              </Link>
              <Link href="/users/add" passHref>
                <Button className="flex items-center gap-2">
                  <User className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-2 w-full">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={globalFilter ?? ''}
                onChange={(event) =>
                  setGlobalFilter(String(event.target.value))
                }
                className="max-w-sm w-full"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <span>
                {table.getFilteredRowModel().rows.length} of{' '}
                {table.getCoreRowModel().rows.length} users
              </span>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <TableRow>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>

                    {row.getIsExpanded() && (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="bg-muted p-4"
                        >
                          {/* loop each role on this user */}
                          {row.original.roles.map((role) => (
                            <div key={role.id} className="mb-4">
                              <h4 className="font-medium">{role.name}</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                {role.access.map((entry) => (
                                  <div key={entry.module} className="space-y-1">
                                    {/* module badge */}
                                    <Badge
                                      variant="outline"
                                      className="uppercase"
                                    >
                                      {entry.module}
                                    </Badge>
                                    {/* permissions */}
                                    <div className="flex flex-wrap gap-2 pl-2">
                                      {Object.entries(entry.permissions).map(
                                        ([perm, allowed]) => (
                                          <Badge
                                            key={perm}
                                            variant={
                                              allowed
                                                ? 'success'
                                                : 'destructive'
                                            }
                                            className="flex items-center gap-1 text-xs"
                                          >
                                            {allowed ? (
                                              <Check className="h-3 w-3" />
                                            ) : (
                                              <X className="h-3 w-3" />
                                            )}
                                            {perm}
                                          </Badge>
                                        )
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between px-2 py-4">
            <div className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
