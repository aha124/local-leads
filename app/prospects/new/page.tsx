import ProspectForm from '@/components/ProspectForm';

export default function NewProspect() {
  return (
    <div>
      <div className="mb-6">
        <a href="/" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
          &larr; Back to Dashboard
        </a>
        <h1 className="text-2xl font-bold text-gray-900">Add New Prospect</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <ProspectForm mode="create" />
      </div>
    </div>
  );
}
