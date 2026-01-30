import { getProspects, getStats, getFilterOptions } from '@/lib/queries';
import StatsCards from '@/components/StatsCards';
import ProspectTable from '@/components/ProspectTable';

interface HomeProps {
  searchParams: Promise<{
    status?: string;
    business_type?: string;
    location?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const prospects = getProspects({
    status: params.status,
    business_type: params.business_type,
    location: params.location,
    sort_by: params.sort_by,
    sort_order: params.sort_order,
  });
  const stats = getStats();
  const filterOptions = getFilterOptions();

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <a
          href="/prospects/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Add Prospect
        </a>
      </div>

      <StatsCards stats={stats} />

      <ProspectTable prospects={prospects} filterOptions={filterOptions} />
    </div>
  );
}
