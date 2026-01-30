'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Prospect, ActivityLog, ProspectStatus } from '@/lib/db';
import ProspectForm from '@/components/ProspectForm';
import StatusBadge from '@/components/StatusBadge';
import LogContactModal from '@/components/LogContactModal';

interface ProspectDetailClientProps {
  prospect: Prospect;
  activityLog: ActivityLog[];
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString();
}

export default function ProspectDetailClient({ prospect, activityLog }: ProspectDetailClientProps) {
  const router = useRouter();
  const [showLogModal, setShowLogModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);

  const quickStatusUpdate = async (newStatus: ProspectStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/prospects/${prospect.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');
      router.refresh();
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this prospect?')) return;

    try {
      const res = await fetch(`/api/prospects/${prospect.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');
      router.push('/');
    } catch (err) {
      alert('Failed to delete prospect');
    }
  };

  if (isEditing) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Edit Prospect</h1>
          <button
            onClick={() => setIsEditing(false)}
            className="text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <ProspectForm prospect={prospect} mode="edit" />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <a href="/" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
            &larr; Back to Dashboard
          </a>
          <h1 className="text-2xl font-bold text-gray-900">{prospect.business_name}</h1>
          <p className="text-gray-600">{prospect.business_type} &bull; {prospect.location}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowLogModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Log Contact
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={prospect.status} />
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Web Presence</dt>
                <dd className="mt-1 text-gray-900">{prospect.current_web_presence}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Phone</dt>
                <dd className="mt-1 text-gray-900">
                  {prospect.phone ? (
                    <a href={`tel:${prospect.phone}`} className="text-blue-600 hover:underline">
                      {prospect.phone}
                    </a>
                  ) : (
                    '-'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="mt-1 text-gray-900">
                  {prospect.email ? (
                    <a href={`mailto:${prospect.email}`} className="text-blue-600 hover:underline">
                      {prospect.email}
                    </a>
                  ) : (
                    '-'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Years in Business</dt>
                <dd className="mt-1 text-gray-900">{prospect.years_in_business || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Listing URL</dt>
                <dd className="mt-1 text-gray-900">
                  {prospect.listing_url ? (
                    <a
                      href={prospect.listing_url.startsWith('http') ? prospect.listing_url : `https://${prospect.listing_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {prospect.listing_url}
                    </a>
                  ) : (
                    '-'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Last Contacted</dt>
                <dd className="mt-1 text-gray-900">{formatDate(prospect.last_contacted)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Next Followup</dt>
                <dd className="mt-1 text-gray-900">{formatDate(prospect.next_followup)}</dd>
              </div>
            </dl>

            {prospect.notes && (
              <div className="mt-6 pt-6 border-t">
                <dt className="text-sm text-gray-500 mb-1">Notes</dt>
                <dd className="text-gray-900 whitespace-pre-wrap">{prospect.notes}</dd>
              </div>
            )}
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Log</h2>
            {activityLog.length === 0 ? (
              <p className="text-gray-500">No activity recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {activityLog.map((entry) => (
                  <div key={entry.id} className="border-l-2 border-gray-200 pl-4 pb-4">
                    <p className="text-sm text-gray-500">{formatDateTime(entry.created_at)}</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {entry.action.replace(/_/g, ' ')}
                    </p>
                    {entry.details && (
                      <p className="text-gray-600 mt-1">{entry.details}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Status Update</h2>
            <div className="space-y-2">
              <button
                onClick={() => quickStatusUpdate('email_sent')}
                disabled={updating || prospect.status === 'email_sent'}
                className="w-full px-4 py-2 text-left border rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Mark as Emailed
              </button>
              <button
                onClick={() => quickStatusUpdate('called')}
                disabled={updating || prospect.status === 'called'}
                className="w-full px-4 py-2 text-left border rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Mark as Called
              </button>
              <button
                onClick={() => quickStatusUpdate('meeting_scheduled')}
                disabled={updating || prospect.status === 'meeting_scheduled'}
                className="w-full px-4 py-2 text-left border rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Meeting Scheduled
              </button>
              <button
                onClick={() => quickStatusUpdate('proposal_sent')}
                disabled={updating || prospect.status === 'proposal_sent'}
                className="w-full px-4 py-2 text-left border rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Proposal Sent
              </button>
              <button
                onClick={() => quickStatusUpdate('won')}
                disabled={updating || prospect.status === 'won'}
                className="w-full px-4 py-2 text-left border rounded-md bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50"
              >
                Mark as Won
              </button>
              <button
                onClick={() => quickStatusUpdate('lost')}
                disabled={updating || prospect.status === 'lost'}
                className="w-full px-4 py-2 text-left border rounded-md bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                Mark as Lost
              </button>
              <button
                onClick={() => quickStatusUpdate('not_interested')}
                disabled={updating || prospect.status === 'not_interested'}
                className="w-full px-4 py-2 text-left border rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Not Interested
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1">Created</p>
            <p>{formatDateTime(prospect.created_at)}</p>
            <p className="font-medium text-gray-900 mb-1 mt-3">Last Updated</p>
            <p>{formatDateTime(prospect.updated_at)}</p>
          </div>
        </div>
      </div>

      <LogContactModal
        prospectId={prospect.id}
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
      />
    </div>
  );
}
