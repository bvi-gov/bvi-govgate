'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ChevronRight } from 'lucide-react';

export function AdminBreadcrumbs() {
  const { getBreadcrumbs, goBackTo, navHistory, currentView } = useAppStore();

  const crumbs = getBreadcrumbs();

  // Don't show breadcrumbs on dashboard or when no history
  if (crumbs.length <= 1) return null;

  const handleClick = (view: string) => {
    goBackTo(view as any);
  };

  return (
    <div className="bg-[#0a1220] border-b border-[#1E3A5F] px-4 lg:px-6 py-2.5">
      <Breadcrumb>
        <BreadcrumbList className="text-xs">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            return (
              <React.Fragment key={`${crumb.view}-${index}`}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="text-gray-200 font-medium text-xs">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      onClick={() => handleClick(crumb.view)}
                      className="text-gray-500 hover:text-[#009B3A] transition-colors cursor-pointer text-xs"
                    >
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && (
                  <BreadcrumbSeparator className="text-gray-600">
                    <ChevronRight className="w-3 h-3" />
                  </BreadcrumbSeparator>
                )}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
