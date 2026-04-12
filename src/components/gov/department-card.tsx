'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Pause,
  Play,
  Trash2,
  Users,
  FileText,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';

interface DepartmentCardProps {
  department: {
    id: string;
    name: string;
    code: string;
    description?: string | null;
    status: string;
    tier: string;
    ownerName?: string | null;
    ownerEmail?: string | null;
    monthlyFee: number;
    currency: string;
    paymentStatus: string;
    _count?: {
      members?: number;
      serviceRequests?: number;
      documents?: number;
      citizenRequests?: number;
    };
  };
  onEdit?: (dept: DepartmentCardProps['department']) => void;
  onDelete?: (id: string) => void;
  onView?: (dept: DepartmentCardProps['department']) => void;
  onStatusChange?: (id: string, status: string) => void;
}

const tierColors: Record<string, string> = {
  basic: 'bg-[#8899b4]/15 text-[#8899b4] border-[#8899b4]/30',
  standard: 'bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/30',
  premium: 'bg-[#d4af37]/15 text-[#d4af37] border-[#d4af37]/30',
  enterprise: 'bg-[#a855f7]/15 text-[#a855f7] border-[#a855f7]/30',
};

export function DepartmentCard({ department, onEdit, onDelete, onView, onStatusChange }: DepartmentCardProps) {
  const statusClass = department.status === 'active' ? 'status-active' :
    department.status === 'suspended' ? 'status-suspended' : 'status-pending';

  return (
    <Card className="border-[#1e3a5f] bg-[#0f2140] hover:border-[#d4af37]/30 transition-all duration-200 group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-[#e8edf5] truncate">{department.name}</h3>
              <span className={cn('text-[10px] px-1.5 py-0.5 rounded-md font-medium border', tierColors[department.tier] || tierColors.standard)}>
                {department.tier}
              </span>
            </div>
            <p className="text-xs text-[#8899b4] mt-0.5 font-mono">{department.code}</p>
            {department.description && (
              <p className="text-xs text-[#8899b4] mt-2 line-clamp-2">{department.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', statusClass)}>
              {department.status}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-[#8899b4] hover:text-[#e8edf5] opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#152a4e] border-[#1e3a5f]">
                <DropdownMenuItem onClick={() => onView?.(department)} className="text-[#e8edf5] focus:bg-[#1e3a5f]">
                  <Eye className="w-4 h-4 mr-2" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(department)} className="text-[#e8edf5] focus:bg-[#1e3a5f]">
                  <Pencil className="w-4 h-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onStatusChange?.(department.id, department.status === 'active' ? 'suspended' : 'active')}
                  className="text-[#e8edf5] focus:bg-[#1e3a5f]"
                >
                  {department.status === 'active' ? (
                    <><Pause className="w-4 h-4 mr-2" /> Suspend</>
                  ) : (
                    <><Play className="w-4 h-4 mr-2" /> Activate</>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#1e3a5f]" />
                <DropdownMenuItem onClick={() => onDelete?.(department.id)} className="text-[#f87171] focus:bg-[#1e3a5f] focus:text-[#f87171]">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#1e3a5f]/50">
          {department.ownerName && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#8899b4]">
              <Users className="w-3 h-3" />
              <span className="truncate">{department.ownerName}</span>
            </div>
          )}
          {department._count && (
            <>
              <div className="flex items-center gap-1 text-[11px] text-[#8899b4]">
                <FileText className="w-3 h-3" />
                <span>{department._count.serviceRequests || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#d4af37] ml-auto">
                <DollarSign className="w-3 h-3" />
                <span>{department.currency} {department.monthlyFee.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
