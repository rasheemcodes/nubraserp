'use client';

import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ExpandedState,
  OnChangeFn,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  PlusCircle,
  Minus,
  Plus,
  Check,
  X,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

//
// 1) Types & Sample Data
//
type AccessEntry = {
  module: string;
  permissions: Record<string, boolean>;
};

type RoleRow = {
  id: number;
  name: string;
  access: AccessEntry[];
  modulesCount: number;
  usersCount: number;
  createdAt: Date;
};

const sampleRoles: RoleRow[] = [
  {
    id: 1,
    name: 'Admin',
    access: [
      { module: 'Finance', permissions: { create: true, read: true, update: true, delete: true } },
      { module: 'Inventory', permissions: { create: true, read: true, update: true, delete: true } },
      { module: 'Users', permissions: { create: true, read: true, update: true, delete: true } },
    ],
    modulesCount: 3,
    usersCount: 5,
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 2,
    name: 'Editor',
    access: [
      { module: 'Finance', permissions: { create: false, read: true, update: true, delete: false } },
      { module: 'Inventory', permissions: { create: false, read: true, update: false, delete: false } },
    ],
    modulesCount: 2,
    usersCount: 8,
    createdAt: new Date('2025-03-10'),
  },
  {
    id: 3,
    name: 'Viewer',
    access: [
      { module: 'Finance', permissions: { create: false, read: true, update: false, delete: false } },
      { module: 'Reports', permissions: { create: false, read: true, update: false, delete: false } },
    ],
    modulesCount: 2,
    usersCount: 12,
    createdAt: new Date('2025-05-22'),
  },
  {
    id: 4,
    name: 'Support',
    access: [
      { module: 'Tickets', permissions: { create: true, read: true, update: true, delete: false } },
      { module: 'Chat', permissions: { create: true, read: true, update: false, delete: false } },
    ],
    modulesCount: 2,
    usersCount: 3,
    createdAt: new Date('2025-06-05'),
  },
];

//
// 2) Component
//
export default function RolesPermissionsPage() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const columnHelper = createColumnHelper<RoleRow>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Role ID{' '}
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown />
            ) : (
              <ArrowUpDown />
            )}
          </Button>
        ),
        cell: info => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('name', {
        header: 'Role Name',
        cell: info => <span>{info.getValue()}</span>,
      }),
      columnHelper.accessor('modulesCount', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            # Modules{' '}
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown />
            ) : (
              <ArrowUpDown />
            )}
          </Button>
        ),
        cell: info => <Badge variant="outline">{info.getValue()}</Badge>,
      }),
      columnHelper.accessor('usersCount', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            # Users{' '}
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown />
            ) : (
              <ArrowUpDown />
            )}
          </Button>
        ),
        cell: info => <Badge variant="secondary">{info.getValue()}</Badge>,
      }),
      columnHelper.accessor('createdAt', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Created On{' '}
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown />
            ) : (
              <ArrowUpDown />
            )}
          </Button>
        ),
        cell: info => (
          <span>{(info.getValue() as Date).toLocaleDateString()}</span>
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

  const table = useReactTable<RoleRow>({
    data: sampleRoles,
    columns,
    state: { globalFilter, sorting, expanded },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onExpandedChange: setExpanded as OnChangeFn<ExpandedState>,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="space-y-2 md:space-y-0 md:flex md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" /> Role Management
            </CardTitle>
            <CardDescription>
              View and manage all roles, modules &amp; permissions.
            </CardDescription>
          </div>
          <Link href="/users/roles/new" passHref>
            <Button>
              <PlusCircle className="h-5 w-5" /> New Role
            </Button>
          </Link>
        </CardHeader>

        <CardContent>
          {/* Search + Count */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-4 gap-4">
            <div className="flex items-center space-x-2 max-w-sm w-full">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter roles..."
                value={globalFilter}
                onChange={e => setGlobalFilter(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} of{' '}
              {table.getCoreRowModel().rows.length} roles
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(hg => (
                  <TableRow key={hg.id}>
                    {hg.headers.map(h => (
                      <TableHead key={h.id}>
                        {h.isPlaceholder
                          ? null
                          : flexRender(h.column.columnDef.header, h.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map(row => (
                  <React.Fragment key={row.id}>
                    {/* Main row */}
                    <TableRow>
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Expanded details */}
                    {row.getIsExpanded() && (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="bg-muted p-4">
                          <div className="space-y-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {row.original.access.map(entry => (
                              <div key={entry.module}>
                                <h4 className="text-base font-medium">{entry.module}</h4>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(entry.permissions).map(([perm, ok]) => (
                                    <Badge
                                      key={perm}
                                      variant={ok ? 'success' : 'destructive'}
                                      className="flex items-center gap-1 text-xs"
                                    >
                                      {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                      {perm}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
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
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
