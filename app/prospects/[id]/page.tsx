import { notFound } from 'next/navigation';
import { getProspectById, getActivityLog } from '@/lib/queries';
import ProspectDetailClient from './ProspectDetailClient';

interface ProspectDetailProps {
  params: Promise<{ id: string }>;
}

export default async function ProspectDetail({ params }: ProspectDetailProps) {
  const { id } = await params;
  const prospectId = parseInt(id);

  if (isNaN(prospectId)) {
    notFound();
  }

  const prospect = getProspectById(prospectId);

  if (!prospect) {
    notFound();
  }

  const activityLog = getActivityLog(prospectId);

  return <ProspectDetailClient prospect={prospect} activityLog={activityLog} />;
}
