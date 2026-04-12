import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Settings, Building2, User, Bell, Lock, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function TenantSettings() {
  const [user, setUser] = useState(null);
  const [department, setDepartment] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const deptUsers = await base44.entities.DepartmentUser.filter({ user_email: currentUser.email });
      if (deptUsers.length > 0) {
        const depts = await base44.entities.Department.filter({ id: deptUsers[0].department_id });
        if (depts.length > 0) setDepartment(depts[0]);
      }
    };
    loadData();
  }, []);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    requestAlerts: true,
    weeklyDigest: false,
  });

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-500">{department?.name || "Loading..."}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-[#152a4e] border border-[#1e3a5f] p-1">
          <TabsTrigger 
            value="profile" 
            className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-[#0a1628]"
          >
            <User className="mr-2 h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger 
            value="department" 
            className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-[#0a1628]"
          >
            <Building2 className="mr-2 h-4 w-4" /> Department
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-[#0a1628]"
          >
            <Bell className="mr-2 h-4 w-4" /> Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-gradient-to-br from-[#152a4e] to-[#0f2140] border border-[#1e3a5f]"
          >
            <h2 className="text-lg font-semibold text-white mb-6">Profile Information</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#152a4e] flex items-center justify-center border border-[#2a4a70]">
                  <span className="text-2xl font-bold text-[#d4af37]">
                    {user?.full_name?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">{user?.full_name}</h3>
                  <p className="text-slate-500">{user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-300">Full Name</Label>
                  <Input
                    value={user?.full_name || ""}
                    className="bg-[#0a1628] border-[#1e3a5f] text-white"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Email Address</Label>
                  <Input
                    value={user?.email || ""}
                    className="bg-[#0a1628] border-[#1e3a5f] text-white"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* Department Settings */}
        <TabsContent value="department">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-gradient-to-br from-[#152a4e] to-[#0f2140] border border-[#1e3a5f]"
          >
            <h2 className="text-lg font-semibold text-white mb-6">Department Information</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-300">Department Name</Label>
                  <Input
                    value={department?.name || ""}
                    className="bg-[#0a1628] border-[#1e3a5f] text-white"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Department Code</Label>
                  <Input
                    value={department?.code || ""}
                    className="bg-[#0a1628] border-[#1e3a5f] text-white font-mono"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Subscription Tier</Label>
                  <Input
                    value={department?.tier?.toUpperCase() || "STANDARD"}
                    className="bg-[#0a1628] border-[#1e3a5f] text-[#d4af37] font-semibold"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Jurisdiction</Label>
                  <Input
                    value={department?.jurisdiction || "BVI"}
                    className="bg-[#0a1628] border-[#1e3a5f] text-white"
                    readOnly
                  />
                </div>
              </div>
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-emerald-400" />
                  <div>
                    <h3 className="font-medium text-emerald-400">Data Protected</h3>
                    <p className="text-sm text-slate-400">AES-256 encryption with Row-Level Security active</p>
                  </div>
                </div>
              </div>
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
                  <p className="text-sm text-slate-500">Receive updates via email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings(s => ({ ...s, emailNotifications: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-[#0a1628] border border-[#1e3a5f]">
                <div>
                  <h3 className="font-medium text-white">Request Alerts</h3>
                  <p className="text-sm text-slate-500">Get notified on new requests</p>
                </div>
                <Switch
                  checked={settings.requestAlerts}
                  onCheckedChange={(checked) => setSettings(s => ({ ...s, requestAlerts: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-[#0a1628] border border-[#1e3a5f]">
                <div>
                  <h3 className="font-medium text-white">Weekly Digest</h3>
                  <p className="text-sm text-slate-500">Summary of weekly activity</p>
                </div>
                <Switch
                  checked={settings.weeklyDigest}
                  onCheckedChange={(checked) => setSettings(s => ({ ...s, weeklyDigest: checked }))}
                />
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