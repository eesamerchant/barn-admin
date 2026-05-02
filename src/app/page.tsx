'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import StatsCard from '@/components/StatsCard';
import DataTable from '@/components/DataTable';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface Booking {
  id: string;
  space_id: string;
  date: string;
  start_hour: number;
  end_hour: number;
  customer_name: string;
  total_amount: number;
  status: string;
  spaces?: { name: string };
}

export default function DashboardPage() {
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [weekBookings, setWeekBookings] = useState<Booking[]>([]);
  const [monthBookings, setMonthBookings] = useState<Booking[]>([]);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const today = new Date();

        const [{ data: todayData }, { data: weekData }, { data: monthData }, { data: pendingData }] = await Promise.all([
          supabase
            .from('bookings')
            .select('id, space_id, date, start_hour, end_hour, customer_name, total_amount, status, spaces(name)')
            .eq('date', format(today, 'yyyy-MM-dd'))
            .order('start_hour'),
          supabase
            .from('bookings')
            .select('id, space_id, date, start_hour, end_hour, customer_name, total_amount, status, spaces(name)')
            .gte('date', format(startOfWeek(today), 'yyyy-MM-dd'))
            .lte('date', format(endOfWeek(today), 'yyyy-MM-dd'))
            .order('date'),
          supabase
            .from('bookings')
            .select('id, total_amount, status')
            .gte('date', format(startOfMonth(today), 'yyyy-MM-dd'))
            .lte('date', format(endOfMonth(today), 'yyyy-MM-dd'))
            .eq('status', 'confirmed'),
          supabase
            .from('bookings')
            .select('id')
            .eq('status', 'pending')
            .eq('payment_verified', false),
        ]);

        setTodayBookings((todayData as unknown as Booking[]) || []);
        setWeekBookings((weekData as unknown as Booking[]) || []);
        setMonthBookings((monthData as unknown as Booking[]) || []);
        setTotalRevenue((monthData || []).reduce((sum, b) => sum + (b.total_amount || 0), 0));
        setPendingPayments(pendingData?.length || 0);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatTime = (h: number) => {
    const suffix = h >= 12 ? 'PM' : 'AM';
    const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${display}:00 ${suffix}`;
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Today" value={todayBookings.length} icon="📅" color="blue" />
        <StatsCard title="This Month" value={monthBookings.length} icon="📊" color="green" />
        <StatsCard title="Revenue" value={`$${totalRevenue.toFixed(2)}`} icon="💰" color="green" />
        <StatsCard title="Pending" value={pendingPayments} icon="⏳" color={pendingPayments > 0 ? 'orange' : 'blue'} />
      </div>

      {/* Today's Bookings */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Today&apos;s Bookings</h2>
        </div>
        <DataTable
          columns={[
            { key: 'name', label: 'Customer' },
            { key: 'space', label: 'Space' },
            { key: 'time', label: 'Time' },
            { key: 'amount', label: 'Amount' },
            { key: 'status', label: 'Status' },
          ]}
          data={todayBookings.map((b) => ({
            name: b.customer_name,
            space: (b.spaces as any)?.name || 'Unknown',
            time: `${formatTime(b.start_hour)} – ${formatTime(b.end_hour)}`,
            amount: `$${b.total_amount}`,
            status: b.status,
          }))}
          loading={loading}
        />
      </div>

      {/* This Week */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">This Week</h2>
        </div>
        <DataTable
          columns={[
            { key: 'date', label: 'Date' },
            { key: 'name', label: 'Customer' },
            { key: 'space', label: 'Space' },
            { key: 'time', label: 'Time' },
            { key: 'status', label: 'Status' },
          ]}
          data={weekBookings.map((b) => ({
            date: format(new Date(b.date), 'MMM dd'),
            name: b.customer_name,
            space: (b.spaces as any)?.name || 'Unknown',
            time: `${formatTime(b.start_hour)} – ${formatTime(b.end_hour)}`,
            status: b.status,
          }))}
          loading={loading}
        />
      </div>
    </div>
  );
}
