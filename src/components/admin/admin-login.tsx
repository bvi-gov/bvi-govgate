'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ShieldCheck,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminLogin() {
  const { setAdminLoggedIn, setCurrentView } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      setError('Enter your officer email');
      return;
    }
    if (!password.trim()) {
      setError('Enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/officers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (res.ok) {
        const officer = await res.json();
        setAdminLoggedIn(true, officer.name, officer.email, officer.role, officer.department);
        setCurrentView('admin-dashboard');
        toast.success(`Welcome, ${officer.name}!`);
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid credentials. Access denied.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C1B2A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#009B3A] to-[#007A2E] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#009B3A]/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">BVI GovGate</h1>
          <p className="text-white/50 text-sm mt-1">Government Staff Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#131F2E] border border-[#1E3A5F] rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-1">Sign In</h2>
          <p className="text-sm text-gray-400 mb-6">Enter your officer credentials</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Officer Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="officer@bvi.gov.vg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="bg-[#0C1B2A] border-[#1E3A5F] text-white placeholder:text-gray-500 h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="bg-[#0C1B2A] border-[#1E3A5F] text-white placeholder:text-gray-500 h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#009B3A] text-white hover:bg-[#007A2E] h-11 mt-6 font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={() => setCurrentView('public-home')}
            className="w-full text-gray-400 hover:text-white mt-3"
          >
            Back to Public Portal
          </Button>
        </div>

        {/* Dev Credentials - only shown in development */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 bg-[#131F2E]/50 border border-[#1E3A5F]/50 rounded-xl p-4">
            <summary className="text-xs text-gray-500 cursor-pointer text-center">Dev Credentials (hidden in production)</summary>
            <div className="mt-2 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Admin:</span>
                <span className="text-gray-300">k.******@bvi.gov.vg</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Senior Officer:</span>
                <span className="text-gray-300">d.******@bvi.gov.vg</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Officer:</span>
                <span className="text-gray-300">s.******@bvi.gov.vg</span>
              </div>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
