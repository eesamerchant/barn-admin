interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; label: string };
  color?: 'blue' | 'green' | 'amber' | 'red';
}

const colorMap = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', icon: 'bg-blue-500/20' },
  green: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: 'bg-emerald-500/20' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', icon: 'bg-amber-500/20' },
  red: { bg: 'bg-red-500/10', text: 'text-red-400', icon: 'bg-red-500/20' },
};

export default function StatsCard({ title, value, subtitle, trend, color = 'blue' }: StatsCardProps) {
  const c = colorMap[color];
  return (
    <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-5 hover:border-[#3a3a4a] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-wider">{title}</p>
        <div className={`w-8 h-8 rounded-lg ${c.icon} flex items-center justify-center`}>
          <div className={`w-2 h-2 rounded-full ${c.bg} ${c.text}`} style={{ backgroundColor: 'currentColor' }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-[11px] text-[#6b6b80] mt-1">{subtitle}</p>}
      {trend && (
        <p className={`text-[11px] mt-1 ${trend.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </p>
      )}
    </div>
  );
}
