export default function StatsCard({
  title,
  value,
  icon,
  color = 'blue',
}: {
  title: string;
  value: string | number;
  icon: string;
  color?: 'blue' | 'green' | 'orange' | 'red';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-l-4 border-l-blue-500',
    green: 'bg-green-50 text-green-600 border-l-4 border-l-green-500',
    orange: 'bg-orange-50 text-orange-600 border-l-4 border-l-orange-500',
    red: 'bg-red-50 text-red-600 border-l-4 border-l-red-500',
  };

  return (
    <div
      className={`${colorClasses[color]} border border-gray-200 rounded-lg p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:scale-105`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}
