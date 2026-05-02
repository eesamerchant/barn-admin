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
  const iconBg: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${iconBg[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
