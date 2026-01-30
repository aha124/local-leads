'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Prospect, ProspectStatus } from '@/lib/db';
import StatusBadge from './StatusBadge';

interface ProspectTableProps {
  prospects: Prospect[];
  filterOptions: {
    business_types: string[];
    locations: string[];
    statuses: string[];
  };
}

function isFollowupToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}

function isFollowupOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateStr < today;
}

function getRowClassName(prospect: Prospect): string {
  if (prospect.status === 'won') return 'bg-green-50 hover:bg-green-100';
  if (prospect.status === 'lost' || prospect.status === 'not_interested') return 'bg-red-50 hover:bg-red-100';
  if (isFollowupToday(prospect.next_followup)) return 'bg-yellow-50 hover:bg-yellow-100';
  if (isFollowupOverdue(prospect.next_followup)) return 'bg-orange-50 hover:bg-orange-100';
  return 'hover:bg-gray-50';
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString();
}

export default function ProspectTable({ prospects, filterOptions }: ProspectTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentFilters = {
    status: searchParams.get('status') || '',
    business_type: searchParams.get('business_type') || '',
    location: searchParams.get('location') || '',
    sort_by: searchParams.get('sort_by') || 'created_at',
    sort_order: (searchParams.get('sort_order') || 'desc') as 'asc' | 'desc',
  };

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/?${params.toString()}`);
  };

  const toggleSort = (column: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentFilters.sort_by === column) {
      params.set('sort_order', currentFilters.sort_order === 'asc' ? 'desc' : 'asc');
    } else {
      params.set('sort_by', column);
      params.set('sort_order', 'asc');
    }
    router.push(`/?${params.toString()}`);
  };

  const getSortIcon = (column: string) => {
    if (currentFilters.sort_by !== column) return '↕';
    return currentFilters.sort_order === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b bg-gray-50 flex flex-wrap gap-3">
        <select
          value={currentFilters.status}
          onChange={(e) => updateFilters('status', e.target.value)}
          className="px-3 py-2 border rounded-md text-sm bg-white"
        >
          <option value="">All Statuses</option>
          {filterOptions.statuses.map((status) => (
            <option key={status} value={status}>
              {status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>

        <select
          value={currentFilters.business_type}
          onChange={(e) => updateFilters('business_type', e.target.value)}
          className="px-3 py-2 border rounded-md text-sm bg-white"
        >
          <option value="">All Business Types</option>
          {filterOptions.business_types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          value={currentFilters.location}
          onChange={(e) => updateFilters('location', e.target.value)}
          className="px-3 py-2 border rounded-md text-sm bg-white"
        >
          <option value="">All Locations</option>
          {filterOptions.locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        {(currentFilters.status || currentFilters.business_type || currentFilters.location) && (
          <button
            onClick={() => router.push('/')}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => toggleSort('business_name')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Business {getSortIcon('business_name')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Web Presence
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th
                onClick={() => toggleSort('last_contacted')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Last Contact {getSortIcon('last_contacted')}
              </th>
              <th
                onClick={() => toggleSort('next_followup')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Next Followup {getSortIcon('next_followup')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {prospects.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No prospects found. <a href="/prospects/new" className="text-blue-600 hover:underline">Add your first prospect</a>
                </td>
              </tr>
            ) : (
              prospects.map((prospect) => (
                <tr
                  key={prospect.id}
                  onClick={() => router.push(`/prospects/${prospect.id}`)}
                  className={`cursor-pointer ${getRowClassName(prospect)}`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{prospect.business_name}</div>
                    {prospect.phone && (
                      <div className="text-sm text-gray-500">{prospect.phone}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{prospect.business_type}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{prospect.location}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{prospect.current_web_presence}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={prospect.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(prospect.last_contacted)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={
                        isFollowupToday(prospect.next_followup)
                          ? 'text-yellow-700 font-medium'
                          : isFollowupOverdue(prospect.next_followup)
                          ? 'text-red-600 font-medium'
                          : 'text-gray-600'
                      }
                    >
                      {formatDate(prospect.next_followup)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Count */}
      <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-600">
        Showing {prospects.length} prospect{prospects.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
