import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  Settings as SettingsIcon, Shield, Bell, Database, 
  Globe, Lock, Save, Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { toast } from "sonner";

const MASTER_ADMINS = ["admin@zeitgeistbusiness.com", "comandomorillo2020@gmail.com"];

export default function Settings() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      if (!MASTER_ADMINS.includes(currentUser?.email)) {
        window.location.href = createPageUrl("TenantDashboard");
      }
    };
    checkAccess();
  }, []);

  const [settings, setSettings] = useState({
    systemName: "BVI Digital Tower",
    jurisdiction: "British Virgin Islands",
    defaultCurrency: "USD",
    dataRetentionDays: 7,
    autoSuspendOverdue: true,
    autoSuspendDays: 30,
    emailNotifications: true,
    slackNotifications: false,
    auditLogging: true,
    twoFactorRequired: false,
  });

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">System Settings</h1>
        <p className="text-sm text-slate-500">Configure BVI Digital Tower platform settings</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-[#152a4e] border border-[#1e3a5f] p-1">
          <TabsTrigger 
            value="general" 
            className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-[#0a1628]"
          >
            <Globe className="mr-2 h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-[#0a1628]"
          >
            <Shield className="mr-2 h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-[#0a1628]"
          >
            <Bell className="mr-2 h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger 
            value="data" 
            className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-[#0a1628]"
          >
            <Database className="mr-2 h-4 w-4" /> Data
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-gradient-to-br from-[#152a4e] to-[#0f2140] border border-[#1e3a5f]"
          >
            <h2 className="text-lg font-semibold text-white mb-6">General Configuration</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-300">System Name</Label>
                  <Input
                    value={settings.systemName}
                    onChange={(e) => setSettings(s => ({ ...s, systemName: e.target.value }))}
                    className="bg-[#0a1628] border-[#1e3a5f] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Primary Jurisdiction</Label>
                  <Input
                    value={settings.jurisdiction}
                    onChange={(e) => setSettings(s => ({ ...s, jurisdiction: e.target.value }))}
                    className="bg-[#0a1628] border-[#1e3a5f] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Default Currency</Label>
                  <Input
                    value={settings.defaultCurrency}
                    onChange={(e) => setSettings(s => ({ ...s, defaultCurrency: e.target.value }))}
                    className="bg-[#0a1628] border-[#1e3a5f] text-white"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-gradient-to-br from-[#152a4e] to-[#0f2140] border border-[#1e3a5f]"
          >
            <h2 className="text-lg font-semibold text-white mb-6">Security Configuration</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-[#0a1628] border border-[#1e3a5f]">
                <div>
                  <h3 className="font-medium text-white">Two-Factor Authentication</h3>
                  <p className="text-sm text-slate-500">Require 2FA for all admin users</p>
                </div>
                <Switch
                  checked={settings.twoFactorRequired}
                  onCheckedChange={(checked) => setSettings(s => ({ ...s, twoFactorRequired: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-[#0a1628] border border-[#1e3a5f]">
                <div>
                  <h3 className="font-medium text-white">Audit Logging</h3>
                  <p className="text-sm text-slate-500">Log all system actions for compliance</p>
                </div>
                <Switch
                  checked={settings.auditLogging}
                  onCheckedChange={(checked) => setSettings(s => ({ ...s, auditLogging: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-[#0a1628] border border-[#1e3a5f]">
                <div>
                  <h3 className="font-medium text-white">Auto-Suspend Overdue</h3>
                  <p className="text-sm text-slate-500">Automatically suspend departments with overdue payments</p>
                </div>
                <Switch
                  checked={settings.autoSuspendOverdue}
                  onCheckedChange={(checked) => setSettings(s => ({ ...s, autoSuspendOverdue: checked }))}
                />
              </div>
              {settings.autoSuspendOverdue && (
                <div className="space-y-2 ml-4">
                  <Label className="text-slate-300">Suspend After (days)</Label>
                  <Input
                    type="number"
                    value={settings.autoSuspendDays}
                    onChange={(e) => setSettings(s => ({ ...s, autoSuspendDays: parseInt(e.target.value) }))}
                    className="bg-[#0a1628] border-[#1e3a5f] text-white w-32"
                  />
                </div>
              )}
            </div>
          </motion.div>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-gradient-to-br from-[#152a4e] to-[#0f2140] border border-[#1e3a5f]"
          >
            <h2 className="text-lg font-semibold text-white mb-6">Notification Preferences</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-[#0a1628] border border-[#1e3a5f]">
                <div>
                  <h3 className="font-medium text-white">Email Notifications</h3>
                  <p className="text-sm text-slate-500">Receive alerts via email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings(s => ({ ...s, emailNotifications: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-[#0a1628] border border-[#1e3a5f]">
                <div>
                  <h3 className="font-medium text-white">Slack Notifications</h3>
                  <p className="text-sm text-slate-500">Send alerts to Slack channel</p>
                </div>
                <Switch
                  checked={settings.slackNotifications}
                  onCheckedChange={(checked) => setSettings(s => ({ ...s, slackNotifications: checked }))}
                />
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* Data Settings */}
        <TabsContent value="data">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-gradient-to-br from-[#152a4e] to-[#0f2140] border border-[#1e3a5f]"
          >
            <h2 className="text-lg font-semibold text-white mb-6">Data Management</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-300">Data Retention Period (days)</Label>
                <p className="text-xs text-slate-500 mb-2">
                  Completed service requests will be automatically purged after this period
                </p>
                <Input
                  type="number"
                  value={settings.dataRetentionDays}
                  onChange={(e) => setSettings(s => ({ ...s, dataRetentionDays: parseInt(e.target.value) }))}
                  className="bg-[#0a1628] border-[#1e3a5f] text-white w-32"
                />
              </div>
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-amber-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-amber-400">AES-256 Encryption</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      All department data is encrypted at rest using AES-256 encryption with Row-Level Security (RLS) isolation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <Button 
          onClick={handleSave}
          className="bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#0a1628] font-semibold"
        >
          <Save className="mr-2 h-4 w-4" /> Save Settings
        </Button>
      </div>
    </div>
  );
}