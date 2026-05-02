export default function DataTable({
  columns,
  data,
  loading = false,
}: {
  columns: { key: string; label: string }[];
  data: any[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-400">No data to display</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
              {columns.map((col) => (
                <td
                  key={`${idx}-${col.key}`}
                  className="px-4 py-3.5 text-sm text-slate-700"
                >
                  {col.key === 'status' ? (
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium
                      ${row[col.key] === 'confirmed' ? 'bg-emerald-50 text-emerald-700' :
                        row[col.key] === 'pending' ? 'bg-amber-50 text-amber-700' :
                        row[col.key] === 'cancelled' ? 'bg-red-50 text-red-700' :
                        'bg-slate-100 text-slate-600'}`}
                    >
                      {row[col.key] || '-'}
                    </span>
                  ) : (
                    row[col.key] || '-'
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
