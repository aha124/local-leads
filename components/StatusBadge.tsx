'use client';

import { ProspectStatus } from '@/lib/db';

interface StatusBadgeProps {
  status: ProspectStatus;
  className?: string;
}

const statusConfig: Record<ProspectStatus, { label: string; className: string }> = {
  not_contacted: {
    label: 'Not Contacted',
    className: 'bg-gray-100 text-gray-800',
  },
  email_sent: {
    label: 'Email Sent',
    className: 'bg-blue-100 text-blue-800',
  },
  called: {
    label: 'Called',
    className: 'bg-purple-100 text-purple-800',
  },
  meeting_scheduled: {
    label: 'Meeting Scheduled',
    className: 'bg-indigo-100 text-indigo-800',
  },
  proposal_sent: {
    label: 'Proposal Sent',
    className: 'bg-orange-100 text-orange-800',
  },
  won: {
    label: 'Won',
    className: 'bg-green-100 text-green-800',
  },
  lost: {
    label: 'Lost',
    className: 'bg-red-100 text-red-800',
  },
  not_interested: {
    label: 'Not Interested',
    className: 'bg-gray-100 text-gray-500',
  },
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.not_contacted;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}

export function getStatusOptions(): { value: ProspectStatus; label: string }[] {
  return Object.entries(statusConfig).map(([value, { label }]) => ({
    value: value as ProspectStatus,
    label,
  }));
}
