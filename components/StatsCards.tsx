'use client';

interface Stats {
  total: number;
  not_contacted: number;
  in_progress: number;
  won: number;
  lost: number;
}

interface StatsCardsProps {
  stats: Stats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: 'Total Prospects',
      value: stats.total,
      bgColor: 'bg-white',
      textColor: 'text-gray-900',
      borderColor: 'border-gray-200',
    },
    {
      label: 'Not Contacted',
      value: stats.not_contacted,
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
    },
    {
      label: 'In Progress',
      value: stats.in_progress,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
    },
    {
      label: 'Won',
      value: stats.won,
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
    },
    {
      label: 'Lost',
      value: stats.lost,
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.bgColor} ${card.borderColor} border rounded-lg p-4`}
        >
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
