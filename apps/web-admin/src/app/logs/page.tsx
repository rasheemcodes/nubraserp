'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Activity,
  Clock,
  Globe,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle,
  Minus,
  Plus,
  Hash,
  User,
  Tag,
  Code,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { ExpandedState, OnChangeFn } from '@tanstack/react-table';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

type LogError = {
  name: string;
  message: string;
  stack: string;
};

type LogEntry = {
  level: LogLevel;
  service: string;
  message: string;
  traceId: string;
  requestId: string;
  userId?: number | null;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  ip: string;
  timestamp: string;
  context?: string;
  tags?: string[];
  error?: LogError;
};

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type FilterOption = {
  value: string;
  label: string;
  count: number;
};

type FilterOptions = {
  levels: FilterOption[];
  services: FilterOption[];
  methods: FilterOption[];
  statusCodes: FilterOption[];
};

type Filters = {
  search: string | null;
  level: string | null;
  service: string | null;
  method: string | null;
  statusCode: string | null;
  startDate: string | null;
  endDate: string | null;
};

type LogsResponse = {
  data: LogEntry[];
  pagination: PaginationInfo;
  filters: Filters;
};

const columnHelper = createColumnHelper<LogEntry>();

const fetchLogs = async (
  page: number, 
  limit: number, 
  filters: Partial<Filters>
): Promise<LogsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value && typeof value === 'string' && value.trim()) {
      params.append(key, value.trim());
    }
  });
  
  const response = await fetch(`http://localhost:3001/api/v1/logs?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch logs');
  }
  return response.json();
};

const fetchFilterOptions = async (): Promise<FilterOptions> => {
  const response = await fetch(`http://localhost:3001/api/v1/logs/filters`);
  if (!response.ok) {
    return { levels: [], services: [], methods: [], statusCodes: [] };
  }
  return response.json();
};

const getLevelIcon = (level: LogLevel) => {
  switch (level) {
    case 'info':
      return <Info className="h-4 w-4" />;
    case 'warn':
      return <AlertTriangle className="h-4 w-4" />;
    case 'error':
      return <XCircle className="h-4 w-4" />;
    case 'debug':
      return <Code className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

const getLevelVariant = (level: LogLevel) => {
  switch (level) {
    case 'info':
      return 'default';
    case 'warn':
      return 'secondary';
    case 'error':
      return 'destructive';
    case 'debug':
      return 'outline';
    default:
      return 'default';
  }
};

const getStatusCodeVariant = (statusCode: number) => {
  if (statusCode >= 200 && statusCode < 300) return 'default';
  if (statusCode >= 300 && statusCode < 400) return 'secondary';
  if (statusCode >= 400 && statusCode < 500) return 'destructive';
  if (statusCode >= 500) return 'destructive';
  return 'outline';
};

const getStatusCodeIcon = (statusCode: number) => {
  if (statusCode >= 200 && statusCode < 300) return <CheckCircle className="h-3 w-3" />;
  if (statusCode >= 300 && statusCode < 400) return <Info className="h-3 w-3" />;
  if (statusCode >= 400) return <XCircle className="h-3 w-3" />;
  return <AlertCircle className="h-3 w-3" />;
};

export default function LogsDataTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [level, setLevel] = useState('all');
  const [service, setService] = useState('all');
  const [method, setMethod] = useState('all');
  const [statusCode, setStatusCode] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout>(null);

  // Handle search with longer debounce and no auto-refresh during typing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }, 800); // Longer debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Reset pagination when any filter changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [level, service, method, statusCode, startDate, endDate]);

  // Build current filters
  const currentFilters: Partial<Filters> = {
    search: debouncedSearch || undefined,
    level: level !== 'all' ? level : undefined,
    service: service !== 'all' ? service : undefined,
    method: method !== 'all' ? method : undefined,
    statusCode: statusCode !== 'all' ? statusCode : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };

  // Queries
  const { data: logsResponse, isLoading, error } = useQuery({
    queryKey: ['logs', pagination.pageIndex + 1, pagination.pageSize, currentFilters],
    queryFn: () => fetchLogs(pagination.pageIndex + 1, pagination.pageSize, currentFilters),
    refetchInterval: searchTerm ? undefined : 5000, // Only auto-refresh when not searching
    staleTime: 1000, // Prevent excessive requests
  });

  const { data: filterOptions } = useQuery({
    queryKey: ['logFilterOptions'],
    queryFn: fetchFilterOptions,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const logs = logsResponse?.data || [];
  const paginationInfo = logsResponse?.pagination;

  const resetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setLevel('all');
    setService('all');
    setMethod('all');
    setStatusCode('all');
    setStartDate('');
    setEndDate('');
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const hasActiveFilters = searchTerm || level !== 'all' || service !== 'all' || 
    method !== 'all' || statusCode !== 'all' || startDate || endDate;

  const columns = useMemo(
    () => [
      columnHelper.accessor('level', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Level
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
          <Badge variant={getLevelVariant(row.getValue('level'))} className="flex items-center gap-1 w-fit">
            {getLevelIcon(row.getValue('level'))}
            {(row.getValue('level') as string).toUpperCase()}
          </Badge>
        ),
      }),
      columnHelper.accessor('service', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Service
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
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{row.getValue('service')}</span>
          </div>
        ),
      }),
      columnHelper.accessor('message', {
        header: 'Message',
        cell: ({ row }) => (
          <div className="flex items-center space-x-2 max-w-md">
            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm truncate">{row.getValue('message')}</span>
          </div>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor('method', {
        header: 'Method',
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono text-xs">
            {row.getValue('method')}
          </Badge>
        ),
      }),
      columnHelper.accessor('path', {
        header: 'Path',
        cell: ({ row }) => (
          <div className="flex items-center space-x-2 max-w-xs">
            <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-mono truncate">{row.getValue('path')}</span>
          </div>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor('statusCode', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Status
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
          <Badge variant={getStatusCodeVariant(row.getValue('statusCode'))} className="flex items-center gap-1 w-fit">
            {getStatusCodeIcon(row.getValue('statusCode'))}
            {row.getValue('statusCode')}
          </Badge>
        ),
      }),
      columnHelper.accessor('durationMs', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Duration
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
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-mono">{row.getValue('durationMs')}ms</span>
          </div>
        ),
      }),
      columnHelper.accessor('timestamp', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Timestamp
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
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-mono">
              {new Date(row.getValue('timestamp')).toLocaleString()}
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

  const table = useReactTable<LogEntry>({
    data: logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    state: { 
      sorting, 
      expanded, 
      pagination 
    },
    onExpandedChange: setExpanded as OnChangeFn<ExpandedState>,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: paginationInfo?.totalPages || -1,
  });

  if (isLoading && !logs.length) {
    return (
      <div className="w-full max-w-8xl mx-auto p-1 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-8xl mx-auto p-1 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-red-500">Error loading logs: {(error as Error).message}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-8xl mx-auto p-1 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 md:gap-0 md:items-center justify-between w-full">
              <div className="flex flex-col gap-1">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Logs
                </CardTitle>
                <CardDescription>
                  Monitor and analyze system logs with real-time updates, powerful search, and advanced filtering.
                </CardDescription>
              </div>
              <div className="flex items-center gap-x-4">
                {!searchTerm && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    Auto-refresh: 5s
                  </div>
                )}
              </div>
            </div>

            {/* Compact Search and Filters */}
            <div className="space-y-2">
              {/* Search Row */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 flex-1"
                  />
                </div>
                {searchTerm !== debouncedSearch && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                    Searching...
                  </div>
                )}
              </div>

              {/* Compact Filters Row */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Level */}
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger className="h-7  text-xs">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {filterOptions?.levels.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label} ({opt.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Service */}
                <Select value={service} onValueChange={setService}>
                  <SelectTrigger className="h-7  text-xs">
                    <SelectValue placeholder="Service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {filterOptions?.services.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label} ({opt.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Method */}
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="h-7  text-xs">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    {filterOptions?.methods.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label} ({opt.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status */}
                <Select value={statusCode} onValueChange={setStatusCode}>
                  <SelectTrigger className="h-7  text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {filterOptions?.statusCodes.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Date Range */}
                <div className="flex items-center gap-1">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-7  text-xs"
                    placeholder="From"
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-7  text-xs"
                    placeholder="To"
                  />
                </div>

                {/* Clear Filters - moved to filters row for better layout */}
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={resetFilters} className="h-7 px-2 text-xs">
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Results Info */}
          <div className="flex items-center justify-between py-2">
            <div className="text-sm text-muted-foreground">
              {paginationInfo ? 
                `Showing ${((paginationInfo.page - 1) * paginationInfo.limit) + 1}-${Math.min(paginationInfo.page * paginationInfo.limit, paginationInfo.total)} of ${paginationInfo.total} ${hasActiveFilters ? 'filtered' : ''} logs` :
                `${logs.length} logs`
              }
            </div>
            {isLoading && logs.length > 0 && (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                Updating...
              </div>
            )}
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
                          <div className="space-y-4">
                            {/* Trace and Request IDs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Hash className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Trace ID:</span>
                                </div>
                                <Badge variant="outline" className="font-mono text-xs">
                                  {row.original.traceId}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Hash className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Request ID:</span>
                                </div>
                                <Badge variant="outline" className="font-mono text-xs">
                                  {row.original.requestId}
                                </Badge>
                              </div>
                            </div>

                            {/* Additional Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Globe className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">IP Address:</span>
                                </div>
                                <Badge variant="outline" className="font-mono text-xs">
                                  {row.original.ip}
                                </Badge>
                              </div>
                              
                              {row.original.userId && (
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">User ID:</span>
                                  </div>
                                  <Badge variant="outline" className="font-mono text-xs">
                                    {row.original.userId}
                                  </Badge>
                                </div>
                              )}

                              {row.original.context && (
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <Code className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Context:</span>
                                  </div>
                                  <Badge variant="outline" className="font-mono text-xs">
                                    {row.original.context}
                                  </Badge>
                                </div>
                              )}
                            </div>

                            {/* Tags */}
                            {row.original.tags && row.original.tags.length > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Tag className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Tags:</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {row.original.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Error Details */}
                            {row.original.error && (
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4 text-destructive" />
                                  <span className="font-medium text-destructive">Error Details:</span>
                                </div>
                                <div className="bg-destructive/10 p-4 rounded-lg border border-destructive">
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">Name:</span>
                                      <Badge variant="destructive">
                                        {row.original.error.name}
                                      </Badge>
                                    </div>
                                    <div className="space-y-1.5">
                                      <span className="font-medium">Message:</span>
                                      <p className="text-sm text-red-200 font-bold">
                                        {row.original.error.message}
                                      </p>
                                    </div>
                                    <div className="space-y-1.5">
                                      <span className="font-medium">Stack Trace:</span>
                                      <pre className="text-xs bg-destructive/5 p-3 rounded-md overflow-x-auto border border-destructive/10">
                                        {row.original.error.stack}
                                      </pre>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
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
              {paginationInfo?.totalPages || '?'}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage() || !(paginationInfo?.hasPrev)}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage() || !(paginationInfo?.hasNext)}
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