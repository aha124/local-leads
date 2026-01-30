'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Prospect, ProspectStatus } from '@/lib/db';
import { getStatusOptions } from './StatusBadge';

interface ProspectFormProps {
  prospect?: Prospect;
  mode: 'create' | 'edit';
}

export default function ProspectForm({ prospect, mode }: ProspectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    business_name: prospect?.business_name || '',
    business_type: prospect?.business_type || '',
    location: prospect?.location || '',
    phone: prospect?.phone || '',
    email: prospect?.email || '',
    current_web_presence: prospect?.current_web_presence || 'No website',
    listing_url: prospect?.listing_url || '',
    years_in_business: prospect?.years_in_business?.toString() || '',
    status: prospect?.status || 'not_contacted',
    notes: prospect?.notes || '',
    last_contacted: prospect?.last_contacted || '',
    next_followup: prospect?.next_followup || '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        years_in_business: formData.years_in_business ? parseInt(formData.years_in_business) : null,
        phone: formData.phone || null,
        email: formData.email || null,
        listing_url: formData.listing_url || null,
        notes: formData.notes || null,
        last_contacted: formData.last_contacted || null,
        next_followup: formData.next_followup || null,
      };

      const url = mode === 'create' ? '/api/prospects' : `/api/prospects/${prospect?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to save prospect');
      }

      const data = await res.json();
      router.push(`/prospects/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const webPresenceOptions = [
    'No website',
    'Facebook only',
    'Placeholder only',
    'Outdated website',
    'Basic website',
    'Other',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Name */}
        <div>
          <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-1">
            Business Name *
          </label>
          <input
            type="text"
            id="business_name"
            name="business_name"
            required
            value={formData.business_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Business Type */}
        <div>
          <label htmlFor="business_type" className="block text-sm font-medium text-gray-700 mb-1">
            Business Type *
          </label>
          <input
            type="text"
            id="business_type"
            name="business_type"
            required
            placeholder="e.g., Electrician, Restaurant, CPA"
            value={formData.business_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            required
            placeholder="Town name"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Current Web Presence */}
        <div>
          <label htmlFor="current_web_presence" className="block text-sm font-medium text-gray-700 mb-1">
            Current Web Presence *
          </label>
          <select
            id="current_web_presence"
            name="current_web_presence"
            required
            value={formData.current_web_presence}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {webPresenceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Listing URL */}
        <div>
          <label htmlFor="listing_url" className="block text-sm font-medium text-gray-700 mb-1">
            Listing URL
          </label>
          <input
            type="text"
            id="listing_url"
            name="listing_url"
            placeholder="Yelp or YellowPages link"
            value={formData.listing_url}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Years in Business */}
        <div>
          <label htmlFor="years_in_business" className="block text-sm font-medium text-gray-700 mb-1">
            Years in Business
          </label>
          <input
            type="number"
            id="years_in_business"
            name="years_in_business"
            min="0"
            value={formData.years_in_business}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {mode === 'edit' && (
          <>
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {getStatusOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Last Contacted */}
            <div>
              <label htmlFor="last_contacted" className="block text-sm font-medium text-gray-700 mb-1">
                Last Contacted
              </label>
              <input
                type="date"
                id="last_contacted"
                name="last_contacted"
                value={formData.last_contacted}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Next Followup */}
            <div>
              <label htmlFor="next_followup" className="block text-sm font-medium text-gray-700 mb-1">
                Next Followup
              </label>
              <input
                type="date"
                id="next_followup"
                name="next_followup"
                value={formData.next_followup}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          value={formData.notes}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Add Prospect' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
