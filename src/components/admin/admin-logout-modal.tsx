'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';

interface AdminLogoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminLogoutModal({ open, onOpenChange }: AdminLogoutModalProps) {
  const { logout } = useAppStore();
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await fetch('/api/officers/logout', { method: 'POST' });
    } catch {
      // Continue with client-side logout even if API call fails
    }
    logout();
    onOpenChange(false);
    toast.success('Logged out successfully');
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#131F2E] border-[#1E3A5F] text-white sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-400" />
            </div>
            <DialogTitle className="text-white">Sign Out</DialogTitle>
          </div>
          <DialogDescription className="text-gray-400 text-sm">
            Are you sure you want to sign out? You will need to sign in again to access the admin portal.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="text-gray-400 hover:text-white hover:bg-white/5 flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white flex-1 sm:flex-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
