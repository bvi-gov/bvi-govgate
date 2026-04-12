'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'gold' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: {
    card: 'border-[#1e3a5f] bg-[#0f2140]',
    iconBg: 'bg-[#152a4e]',
  },
  gold: {
    card: 'border-[#d4af37]/30 bg-[#0f2140] glow-gold',
    iconBg: 'bg-[#d4af37]/15',
  },
  success: {
    card: 'border-[#4ade80]/30 bg-[#0f2140]',
    iconBg: 'bg-[#4ade80]/15',
  },
  warning: {
    card: 'border-[#fbbf24]/30 bg-[#0f2140]',
    iconBg: 'bg-[#fbbf24]/15',
  },
  danger: {
    card: 'border-[#f87171]/30 bg-[#0f2140]',
    iconBg: 'bg-[#f87171]/15',
  },
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  variant = 'default',
}: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card className={cn('transition-all duration-200 hover:scale-[1.02]', styles.card)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-xs font-medium text-[#8899b4] uppercase tracking-wider truncate">{title}</p>
            <p className="text-2xl font-bold text-[#e8edf5] tabular-nums">{value}</p>
            {subtitle && (
              <p className="text-xs text-[#8899b4] truncate">{subtitle}</p>
            )}
          </div>
          <div className={cn('p-2.5 rounded-xl flex-shrink-0', styles.iconBg)}>
            {icon}
          </div>
        </div>
        {trend && trendValue && (
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#1e3a5f]/50">
            {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-[#4ade80]" />}
            {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-[#f87171]" />}
            {trend === 'neutral' && <Minus className="w-3.5 h-3.5 text-[#8899b4]" />}
            <span
              className={cn(
                'text-xs font-medium',
                trend === 'up' && 'text-[#4ade80]',
                trend === 'down' && 'text-[#f87171]',
                trend === 'neutral' && 'text-[#8899b4]'
              )}
            >
              {trendValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
