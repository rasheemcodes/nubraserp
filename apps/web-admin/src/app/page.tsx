'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Activity, Globe, AlertTriangle, Clock, TrendingUp, Loader2, RefreshCw, Database, Monitor } from 'lucide-react';

interface RequestDurationPercentile {
  percentile: number;
  value: number;
}

interface ErrorMetricByStatus {
  statusCode: string;
  total: number;
  recent: number;
  rate: number;
}

interface UserAgentStat {
  userAgent: string;
  rate: number;
  count: number;
}

interface RequestResponseSize {
  percentile: number;
  requestSize: number | null;
  responseSize: number;
}

interface HttpMetricsData {
  requestRate: number;
  totalHttpRequests: number;
  requestDurationByPercentiles: RequestDurationPercentile[];
  errorRatePerSecond: number;
  totalErrorCount: number;
  errorMetricsByStatus: ErrorMetricByStatus[];
  maxLatency: number;
  averageLatency: number | null;
  internalErrorsVsExceptionsRate: number;
  userAgentRequestStats: UserAgentStat[];
  requestVsResponseSizeHistogram: RequestResponseSize[];
}



const fetchMetrics = async (): Promise<HttpMetricsData> => {
  const response = await fetch('http://localhost:3000/api/v1/metrics/dashboard', {
    headers: {
      'Content-Type': 'application/json'
    } 
  });
  return response.json(); 
};

const HttpDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('http');
  
  const { 
    data: metricsData, 
    isLoading, 
    isError, 
    error, 
    refetch,
    isRefetching 
  } = useQuery<HttpMetricsData, Error>({
    queryKey: ['http-metrics'],
    queryFn: fetchMetrics,
    refetchInterval: 15000, //15 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(2);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 0.001) return `${(seconds * 1000000).toFixed(0)}μs`;
    if (seconds < 1) return `${(seconds * 1000).toFixed(2)}ms`;
    return `${seconds.toFixed(3)}s`;
  };

  const getStatusCodeColor = (statusCode: string): string => {
    const code = parseInt(statusCode);
    if (code >= 500) return '#ef4444'; // red-500
    if (code >= 400) return '#f97316'; // orange-500
    if (code >= 300) return '#eab308'; // yellow-500
    return '#10b981'; // emerald-500
  };

  // Enhanced chart colors with better contrast for dark theme
  const chartColors = {
    primary: '#3b82f6',    // blue-500
    secondary: '#8b5cf6',  // violet-500
    accent: '#10b981',     // emerald-500
    warning: '#f59e0b',    // amber-500
    danger: '#ef4444',     // red-500
    info: '#06b6d4',       // cyan-500
    success: '#22c55e',    // green-500
    purple: '#a855f7',     // purple-500
  };

  const pieChartColors = [
    chartColors.primary,
    chartColors.secondary,
    chartColors.accent,
    chartColors.warning,
    chartColors.info,
    chartColors.purple,
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading dashboard metrics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <Alert className="max-w-2xl mx-auto mt-10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load dashboard metrics: {error?.message}
              <button 
                onClick={() => refetch()} 
                className="ml-2 underline hover:no-underline text-primary"
              >
                Try again
              </button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!metricsData) return null;

  // Prepare chart data
  const percentileData = metricsData.requestDurationByPercentiles.map(item => ({
    percentile: `P${item.percentile}`,
    duration: item.value * 1000,
    durationSeconds: item.value
  }));

  const userAgentData = metricsData.userAgentRequestStats.map((item, index) => ({
    name: item.userAgent,
    requests: Math.round(item.count),
    rate: item.rate,
    fill: pieChartColors[index % pieChartColors.length]
  }));

  const responseSizeData = metricsData.requestVsResponseSizeHistogram.map(item => ({
    percentile: `P${item.percentile}`,
    responseSize: item.responseSize / 1024,
    requestSize: item.requestSize ? item.requestSize / 1024 : 0,
    responseSizeBytes: item.responseSize
  }));

  const errorStatusData = metricsData.errorMetricsByStatus.map(error => ({
    status: error.statusCode,
    total: error.total,
    recent: error.recent,
    rate: error.rate,
    fill: getStatusCodeColor(error.statusCode)
  }));

  const HttpContent = () => (
    <div className="space-y-4">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Request Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{metricsData.requestRate.toFixed(3)}</div>
            <p className="text-xs text-muted-foreground">requests/second</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Globe className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatNumber(metricsData.totalHttpRequests)}</div>
            <p className="text-xs text-muted-foreground">total HTTP requests</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{metricsData.errorRatePerSecond.toFixed(3)}</div>
            <p className="text-xs text-muted-foreground">errors/second</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Latency</CardTitle>
            <Clock className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatDuration(metricsData.maxLatency)}</div>
            <p className="text-xs text-muted-foreground">maximum response time</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Request Duration Percentiles */}
        <Card className="bg-card/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Request Duration</CardTitle>
            <CardDescription>Response time percentiles</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={percentileData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="percentile" 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={{ stroke: '#374151' }}
                />
                <YAxis 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={{ stroke: '#374151' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f9fafb',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [`${value.toFixed(2)} ms`, 'Duration']}
                />
                <Bar 
                  dataKey="duration" 
                  fill={chartColors.primary}
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Agent Distribution */}
        <Card className="bg-card/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">User Agents</CardTitle>
            <CardDescription>Request distribution by client</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={userAgentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="requests"
                  label={({ name, percent = 0 }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                  style={{ fontSize: '11px' }}
                >
                  {userAgentData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={pieChartColors[index % pieChartColors.length]}
                      stroke="#1f2937"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '12px',
                    backdropFilter: 'blur(12px)'
                  }}
                  formatter={(value: number) => [`${value} requests`]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Response Size Distribution */}
        <Card className="bg-card/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Response Size</CardTitle>
            <CardDescription>Size distribution by percentiles</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={responseSizeData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="percentile" 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={{ stroke: '#374151' }}
                />
                <YAxis 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={{ stroke: '#374151' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f9fafb',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [formatBytes(value * 1024), 'Response Size']}
                />
                <Line 
                  type="monotone" 
                  dataKey="responseSize" 
                  stroke={chartColors.accent}
                  strokeWidth={3}
                  dot={{ fill: chartColors.accent, strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: chartColors.accent, stroke: '#1f2937', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Error Status Codes */}
        <Card className="bg-card/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Error Status</CardTitle>
            <CardDescription>HTTP status code breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {errorStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={errorStatusData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="status" 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    axisLine={{ stroke: '#374151' }}
                  />
                  <YAxis 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    axisLine={{ stroke: '#374151' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f9fafb',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [value, 'Total Errors']}
                  />
                  <Bar 
                    dataKey="total" 
                    fill={chartColors.danger}
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                <div className="text-center">
                  <AlertTriangle className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No error data</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Error Details */}
        <Card className="bg-card/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Error Details</CardTitle>
          </CardHeader>
          <CardContent>
            {metricsData.errorMetricsByStatus.length > 0 ? (
              <div className="space-y-2">
                {metricsData.errorMetricsByStatus.map((error, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-md bg-background/50">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-3 w-3 text-destructive" />
                      <span className="text-sm font-medium">HTTP {error.statusCode}</span>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive" className="text-xs">
                        {error.total}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{error.rate.toFixed(4)}/sec</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-20 text-muted-foreground">
                <p className="text-sm">No errors detected</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Metrics */}
        <Card className="bg-card/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Max Latency</span>
                <span className="text-sm font-medium">{formatDuration(metricsData.maxLatency)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Latency</span>
                <span className="text-sm font-medium">
                  {metricsData.averageLatency ? formatDuration(metricsData.averageLatency) : 'N/A'}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Internal Error Rate</span>
                <span className="text-sm font-medium">
                  {(metricsData.internalErrorsVsExceptionsRate * 100).toFixed(1)}%
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Health Status</span>
                <Badge 
                  variant={metricsData.errorRatePerSecond > 0.1 ? "destructive" : "default"}
                  className="text-xs"
                >
                  {metricsData.errorRatePerSecond > 0.1 ? 'Issues' : 'Healthy'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Metrics Dashboard</h1>
            <p className="text-sm text-muted-foreground">Real-time system monitoring</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="flex items-center space-x-1 px-3 py-1 text-sm border rounded-md hover:bg-accent transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isRefetching ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <Badge variant="outline" className="h-6">
              <Activity className="w-3 h-3 mr-1" />
              Live every 15 seconds
            </Badge>
            <Badge variant="outline" className="h-6">
                <Clock className="w-3 h-3 mr-1" />
                Last 5 mins data
            </Badge>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="http" className="flex items-center space-x-1">
              <Globe className="w-4 h-4" />
              <span>HTTP</span>
            </TabsTrigger>
            <TabsTrigger value="database" disabled className="flex items-center space-x-1">
              <Database className="w-4 h-4" />
              <span>Database</span>
            </TabsTrigger>
            <TabsTrigger value="system" disabled className="flex items-center space-x-1">
              <Monitor className="w-4 h-4" />
              <span>System</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="http" className="space-y-4">
            <HttpContent />
          </TabsContent>

          <TabsContent value="database" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="flex items-center justify-center h-40">
                <div className="text-center text-muted-foreground">
                  <Database className="h-8 w-8 mx-auto mb-2" />
                  <p>Database metrics coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="flex items-center justify-center h-40">
                <div className="text-center text-muted-foreground">
                  <Monitor className="h-8 w-8 mx-auto mb-2" />
                  <p>System metrics coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HttpDashboard;