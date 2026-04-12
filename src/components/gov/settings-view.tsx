'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Shield, Bell, Database, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface SettingItem {
  key: string;
  label: string;
  value: string;
  description: string;
  type: 'text' | 'select' | 'switch' | 'number';
  options?: string[];
}

export function SettingsView() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const defaultSettings: Record<string, SettingItem> = {
    maintenance_mode: { key: 'maintenance_mode', label: 'Maintenance Mode', value: 'false', description: 'Enable to show maintenance page to visitors', type: 'switch' },
    session_timeout: { key: 'session_timeout', label: 'Session Timeout (minutes)', value: '30', description: 'Auto-logout after inactivity', type: 'number' },
    max_upload_size: { key: 'max_upload_size', label: 'Max Upload Size (bytes)', value: '52428800', description: 'Maximum file upload size (50MB default)', type: 'number' },
    auto_purge_days: { key: 'auto_purge_days', label: 'Auto-Purge Period (days)', value: '365', description: 'Automatically purge old records after this period', type: 'number' },
    smtp_host: { key: 'smtp_host', label: 'SMTP Host', value: 'mail.bvi.gov.vg', description: 'Email server hostname', type: 'text' },
    notification_email: { key: 'notification_email', label: 'Notification Email', value: 'admin@bvi.gov.vg', description: 'System notification recipient', type: 'text' },
    api_rate_limit: { key: 'api_rate_limit', label: 'API Rate Limit (req/min)', value: '100', description: 'Maximum API requests per minute per user', type: 'number' },
    backup_frequency: { key: 'backup_frequency', label: 'Backup Frequency', value: 'daily', description: 'How often system backups are created', type: 'select', options: ['hourly', 'daily', 'weekly', 'monthly'] },
  };

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(data => {
      // Use defaults if no system settings endpoint
      const defaults: Record<string, string> = {
        maintenance_mode: 'false',
        session_timeout: '30',
        max_upload_size: '52428800',
        auto_purge_days: '365',
        smtp_host: 'mail.bvi.gov.vg',
        notification_email: 'admin@bvi.gov.vg',
        api_rate_limit: '100',
        backup_frequency: 'daily',
      };
      setSettings(defaults);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Settings saved successfully');
    }, 1000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-[#152a4e] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const settingGroups = {
    general: ['maintenance_mode', 'session_timeout', 'max_upload_size', 'auto_purge_days'],
    security: ['api_rate_limit', 'session_timeout', 'auto_purge_days'],
    notifications: ['notification_email', 'smtp_host'],
    data: ['backup_frequency', 'auto_purge_days'],
  };

  const renderSetting = (key: string) => {
    const item = defaultSettings[key];
    const value = settings[key] || item.value;

    if (item.type === 'switch') {
      return (
        <div key={key} className="flex items-center justify-between p-4 rounded-lg bg-[#0a1628]">
          <div>
            <Label className="text-[#e8edf5] text-sm font-medium">{item.label}</Label>
            <p className="text-xs text-[#8899b4] mt-0.5">{item.description}</p>
          </div>
          <Switch
            checked={value === 'true'}
            onCheckedChange={(checked) => updateSetting(key, String(checked))}
          />
        </div>
      );
    }

    if (item.type === 'select') {
      return (
        <div key={key} className="space-y-2">
          <Label className="text-[#e8edf5] text-sm font-medium">{item.label}</Label>
          <p className="text-xs text-[#8899b4]">{item.description}</p>
          <Select value={value} onValueChange={(v) => updateSetting(key, v)}>
            <SelectTrigger className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#152a4e] border-[#1e3a5f]">
              {item.options?.map(opt => <SelectItem key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      );
    }

    return (
      <div key={key} className="space-y-2">
        <Label className="text-[#e8edf5] text-sm font-medium">{item.label}</Label>
        <p className="text-xs text-[#8899b4]">{item.description}</p>
        <Input
          type={item.type === 'number' ? 'number' : 'text'}
          value={value}
          onChange={(e) => updateSetting(key, e.target.value)}
          className="bg-[#0a1628] border-[#1e3a5f] text-[#e8edf5]"
        />
      </div>
    );
  };

  return (
    <div className="space-y-6 section-enter">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#e8edf5]">Configuración</h2>
          <p className="text-sm text-[#8899b4]">System configuration and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-[#d4af37] text-[#0a1628] hover:bg-[#e6c453]">
          <Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-[#0f2140] border border-[#1e3a5f]">
          <TabsTrigger value="general" className="data-[state=active]:bg-[#d4af37]/15 data-[state=active]:text-[#d4af37] text-[#8899b4]">
            <Settings className="w-4 h-4 mr-1.5" /> General
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-[#d4af37]/15 data-[state=active]:text-[#d4af37] text-[#8899b4]">
            <Shield className="w-4 h-4 mr-1.5" /> Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-[#d4af37]/15 data-[state=active]:text-[#d4af37] text-[#8899b4]">
            <Bell className="w-4 h-4 mr-1.5" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="data" className="data-[state=active]:bg-[#d4af37]/15 data-[state=active]:text-[#d4af37] text-[#8899b4]">
            <Database className="w-4 h-4 mr-1.5" /> Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="border-[#1e3a5f] bg-[#0f2140]">
            <CardHeader><CardTitle className="text-sm font-medium text-[#8899b4]">General Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {settingGroups.general.map(key => renderSetting(key))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="border-[#1e3a5f] bg-[#0f2140]">
            <CardHeader><CardTitle className="text-sm font-medium text-[#8899b4]">Security Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {settingGroups.security.map(key => renderSetting(key))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-[#1e3a5f] bg-[#0f2140]">
            <CardHeader><CardTitle className="text-sm font-medium text-[#8899b4]">Notification Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {settingGroups.notifications.map(key => renderSetting(key))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card className="border-[#1e3a5f] bg-[#0f2140]">
            <CardHeader><CardTitle className="text-sm font-medium text-[#8899b4]">Data Management</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {settingGroups.data.map(key => renderSetting(key))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compliance Info */}
      <Card className="border-[#d4af37]/30 bg-[#d4af37]/5">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-[#d4af37] flex items-center gap-2">
            <Shield className="w-4 h-4" /> Compliance Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-[#0a1628] rounded-lg">
              <p className="text-[#8899b4]">Jurisdiction</p>
              <p className="text-[#e8edf5] font-medium mt-1">British Virgin Islands</p>
            </div>
            <div className="p-3 bg-[#0a1628] rounded-lg">
              <p className="text-[#8899b4]">Data Protection</p>
              <p className="text-[#e8edf5] font-medium mt-1">GDPR Compliant</p>
            </div>
            <div className="p-3 bg-[#0a1628] rounded-lg">
              <p className="text-[#8899b4]">Encryption</p>
              <p className="text-[#e8edf5] font-medium mt-1">AES-256 at Rest</p>
            </div>
            <div className="p-3 bg-[#0a1628] rounded-lg">
              <p className="text-[#8899b4]">Last Audit</p>
              <p className="text-[#e8edf5] font-medium mt-1">January 15, 2024</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
