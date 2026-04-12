'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore, type CurrentView } from '@/lib/store';
import { PublicLayout } from '@/components/portal/public-layout';
import { AdminLayout } from '@/components/admin/admin-layout';
import { HomeView } from '@/components/portal/home-view';
import { ServicesView } from '@/components/portal/services-view';
import { ServiceDetailView } from '@/components/portal/service-detail-view';
import { ApplicationFormView } from '@/components/portal/application-form-view';
import { PaymentView } from '@/components/portal/payment-view';
import { TrackingView } from '@/components/portal/tracking-view';
import { MyApplicationsView } from '@/components/portal/my-applications-view';
import { AdminLogin } from '@/components/admin/admin-login';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { AdminQueue } from '@/components/admin/admin-queue';
import { AdminProcessingView } from '@/components/admin/admin-processing-view';
import { AdminReports } from '@/components/admin/admin-reports';
import { AdminCertificates } from '@/components/admin/admin-certificates';
import { AdminScanner } from '@/components/admin/admin-scanner';
import { AdminImport } from '@/components/admin/admin-import';
import { AdminMinistries } from '@/components/admin/admin-ministries';
import { Toaster } from '@/components/ui/sonner';
import dynamic from 'next/dynamic';

// Dynamically import heavy ministry pages to avoid SSR issues
const AdminMinistryRVIPF = dynamic(() => import('@/components/admin/admin-ministry-rvipf').then(m => ({ default: m.AdminMinistryRVIPF })), { ssr: false });
const AdminMinistryRevenue = dynamic(() => import('@/components/admin/admin-ministry-revenue').then(m => ({ default: m.AdminMinistryRevenue })), { ssr: false });
const AdminMinistryImmigration = dynamic(() => import('@/components/admin/admin-ministry-immigration').then(m => ({ default: m.AdminMinistryImmigration })), { ssr: false });
const AdminMinistryCivilRegistry = dynamic(() => import('@/components/admin/admin-ministry-civil-registry').then(m => ({ default: m.AdminMinistryCivilRegistry })), { ssr: false });
const AdminMinistryDmv = dynamic(() => import('@/components/admin/admin-ministry-dmv').then(m => ({ default: m.AdminMinistryDmv })), { ssr: false });
const AdminMinistryFSC = dynamic(() => import('@/components/admin/admin-ministry-fsc').then(m => ({ default: m.AdminMinistryFSC })), { ssr: false });
const AdminMinistryLands = dynamic(() => import('@/components/admin/admin-ministry-lands').then(m => ({ default: m.AdminMinistryLands })), { ssr: false });

function PublicRouter() {
  const { currentView } = useAppStore();

  switch (currentView) {
    case 'public-home':
      return <HomeView />;
    case 'services':
      return <ServicesView />;
    case 'service-detail':
      return <ServiceDetailView />;
    case 'application-form':
      return <ApplicationFormView />;
    case 'payment':
      return <PaymentView />;
    case 'tracking':
      return <TrackingView />;
    case 'my-applications':
      return <MyApplicationsView />;
    default:
      return <HomeView />;
  }
}

function AdminRouter() {
  const { currentView } = useAppStore();

  switch (currentView) {
    case 'admin-dashboard':
      return <AdminDashboard />;
    case 'admin-queue':
      return <AdminQueue />;
    case 'admin-processing':
      return <AdminProcessingView />;
    case 'admin-reports':
      return <AdminReports />;
    case 'admin-certificates':
      return <AdminCertificates />;
    case 'admin-scanner':
      return <AdminScanner />;
    case 'admin-import':
      return <AdminImport />;
    case 'admin-ministries':
      return <AdminMinistries />;
    case 'admin-ministry-rvipf':
      return <AdminMinistryRVIPF />;
    case 'admin-ministry-revenue':
      return <AdminMinistryRevenue />;
    case 'admin-ministry-immigration':
      return <AdminMinistryImmigration />;
    case 'admin-ministry-civil-registry':
      return <AdminMinistryCivilRegistry />;
    case 'admin-ministry-dmv':
      return <AdminMinistryDmv />;
    case 'admin-ministry-fsc':
      return <AdminMinistryFSC />;
    case 'admin-ministry-lands':
      return <AdminMinistryLands />;
    case 'admin-settings':
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">System Settings</h1>
            <p className="text-gray-400 text-sm mt-1">Configure system preferences and parameters</p>
          </div>
          <div className="bg-[#131F2E] border border-[#1E3A5F] rounded-xl p-8 text-center">
            <p className="text-gray-500">Settings module coming soon</p>
          </div>
        </div>
      );
    case 'admin-officers':
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Officer Management</h1>
            <p className="text-gray-400 text-sm mt-1">Manage staff accounts and permissions</p>
          </div>
          <div className="bg-[#131F2E] border border-[#1E3A5F] rounded-xl p-8 text-center">
            <p className="text-gray-500">Officer management module coming soon</p>
          </div>
        </div>
      );
    default:
      return <AdminDashboard />;
  }
}

export default function Home() {
  const { currentView, isAdminLoggedIn } = useAppStore();

  // Seed data on first load
  useEffect(() => {
    async function seedData() {
      try {
        await fetch('/api/seed', { method: 'POST' });
      } catch (err) {
        console.log('Seed data already exists or error:', err);
      }
      try {
        await fetch('/api/land/seed', { method: 'POST' });
      } catch (err) {
        console.log('Land seed data already exists or error:', err);
      }
    }
    seedData();
  }, []);

  // Admin login page (full screen, no layout)
  if (currentView === 'admin-login') {
    return (
      <>
        <Toaster theme="dark" position="top-right" richColors />
        <AdminLogin />
      </>
    );
  }

  // Admin views
  if (isAdminLoggedIn) {
    return (
      <>
        <Toaster theme="dark" position="top-right" richColors />
        <AdminLayout>
          <AdminRouter />
        </AdminLayout>
      </>
    );
  }

  // Public views
  return (
    <>
      <Toaster theme="dark" position="top-right" richColors />
      <PublicLayout>
        <PublicRouter />
      </PublicLayout>
    </>
  );
}
