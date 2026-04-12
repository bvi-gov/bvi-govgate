'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Server, Database, Cpu, HardDrive, Wifi, Shield, Clock, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  uptime: number;
  latency: string;
  lastCheck: string;
}

export function MonitoringView() {
  const [refreshing, setRefreshing] = useState(false);

  const services: ServiceStatus[] = [
    { name: 'API Gateway', status: 'operational', uptime: 99.98, latency: '12ms', lastCheck: '2 seconds ago' },
    { name: 'Database (SQLite)', status: 'operational', uptime: 99.95, latency: '3ms', lastCheck: '5 seconds ago' },
    { name: 'Authentication Service', status: 'operational', uptime: 99.99, latency: '8ms', lastCheck: '1 second ago' },
    { name: 'File Storage', status: 'degraded', uptime: 98.5, latency: '145ms', lastCheck: '3 seconds ago' },
    { name: 'Email Service', status: 'operational', uptime: 99.7, latency: '89ms', lastCheck: '10 seconds ago' },
    { name: 'Payment Gateway', status: 'operational', uptime: 99.9, latency: '34ms', lastCheck: '2 seconds ago' },
    { name: 'CDN / Static Assets', status: 'operational', uptime: 100, latency: '5ms', lastCheck: '15 seconds ago' },
    { name: 'Audit Logging', status: 'operational', uptime: 99.85, latency: '7ms', lastCheck: '4 seconds ago' },
  ];

  const systemResources = [
    { name: 'CPU Usage', value: 23, max: 100, unit: '%', color: 'bg-[#4ade80]' },
    { name: 'Memory', value: 61, max: 100, unit: '%', color: 'bg-[#38bdf8]' },
    { name: 'Disk Space', value: 45, max: 100, unit: '%', color: 'bg-[#d4af37]' },
    { name: 'Network I/O', value: 18, max: 100, unit: '%', color: 'bg-[#a855f7]' },
  ];

  const statusIcon = (status: string) => {
    if (status === 'operational') return <CheckCircle className="w-4 h-4 text-[#4ade80]" />;
    if (status === 'degraded') return <AlertTriangle className="w-4 h-4 text-[#fbbf24]" />;
    return <XCircle className="w-4 h-4 text-[#f87171]" />;
  };

  const statusBadge = (status: string) => {
    const styles = {
      operational: 'bg-[#4ade80]/15 text-[#4ade80] border-[#4ade80]/30',
      degraded: 'bg-[#fbbf24]/15 text-[#fbbf24] border-[#fbbf24]/30',
      down: 'bg-[#f87171]/15 text-[#f87171] border-[#f87171]/30',
    };
    return styles[status as keyof typeof styles] || styles.operational;
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <div className="space-y-6 section-enter">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#e8edf5]">Monitoreo</h2>
          <p className="text-sm text-[#8899b4]">System health & performance monitoring</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" className="border-[#1e3a5f] text-[#8899b4]">
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />Refresh
        </Button>
      </div>

      {/* Overall Status */}
      <Card className="border-[#4ade80]/30 bg-[#4ade80]/5">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#4ade80]/15 flex items-center justify-center">
            <Shield className="w-6 h-6 text-[#4ade80]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#4ade80]">All Systems Operational</h3>
            <p className="text-xs text-[#8899b4]">Last incident: 3 days ago — File Storage latency spike resolved</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-bold text-[#4ade80]">99.9%</p>
            <p className="text-[10px] text-[#8899b4]">Overall Uptime (30d)</p>
          </div>
        </CardContent>
      </Card>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemResources.map((res) => (
          <Card key={res.name} className="border-[#1e3a5f] bg-[#0f2140]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#8899b4]">{res.name}</span>
                <span className="text-sm font-bold text-[#e8edf5]">{res.value}{res.unit}</span>
              </div>
              <div className="w-full h-2 bg-[#152a4e] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${res.color}`} style={{ width: `${res.value}%` }} />
              </div>
              <p className="text-[10px] text-[#8899b4] mt-1">{res.max * res.value / 100} / {res.max}{res.unit}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Service Status */}
      <Card className="border-[#1e3a5f] bg-[#0f2140]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-[#8899b4]">Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {services.map((svc) => (
              <div key={svc.name} className="flex items-center gap-4 p-3 rounded-lg bg-[#0a1628] hover:bg-[#152a4e] transition-colors">
                <div className="flex-shrink-0">{statusIcon(svc.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-[#e8edf5]">{svc.name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${statusBadge(svc.status)}`}>{svc.status}</span>
                  </div>
                  <p className="text-[10px] text-[#8899b4] mt-0.5">Latency: {svc.latency} • Checked {svc.lastCheck}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-[#e8edf5]">{svc.uptime}%</p>
                  <p className="text-[10px] text-[#8899b4]">uptime</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Uptime Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#1e3a5f] bg-[#0f2140]">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-[#d4af37] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#e8edf5]">72h</p>
            <p className="text-xs text-[#8899b4]">No Downtime</p>
          </CardContent>
        </Card>
        <Card className="border-[#1e3a5f] bg-[#0f2140]">
          <CardContent className="p-4 text-center">
            <Server className="w-8 h-8 text-[#38bdf8] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#e8edf5]">1.2M</p>
            <p className="text-xs text-[#8899b4]">API Requests (24h)</p>
          </CardContent>
        </Card>
        <Card className="border-[#1e3a5f] bg-[#0f2140]">
          <CardContent className="p-4 text-center">
            <Database className="w-8 h-8 text-[#4ade80] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#e8edf5]">99.7%</p>
            <p className="text-xs text-[#8899b4]">Query Success Rate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
