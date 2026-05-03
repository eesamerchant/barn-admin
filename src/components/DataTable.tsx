interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  emptyMessage?: string;
}

export default function DataTable({ columns, data, emptyMessage = 'No data found' }: DataTableProps) {
  if (data.length === 0) {
    return (
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-12 text-center">
        <p className="text-[#6b6b80] text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2a2a3a]/60">
              {columns.map((col) => (
                <th key={col.key} className="text-left px-5 py-3 text-[10px] font-semibold text-[#4a4a5a] uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a3a]/40">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-[#1a1a25] transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-3.5 text-sm text-[#e4e4ed]">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
