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

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-emerald-500/10 text-emerald-400',
      pending: 'bg-amber-500/10 text-amber-400',
      cancelled: 'bg-red-500/10 text-red-400',
      completed: 'bg-blue-500/10 text-blue-400',
    };
    return (
      <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${colors[status] || 'bg-[#1a1a25] text-[#6b6b80]'}`}>
        {status}
      </span>
    );
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-[#6b6b80] mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Today" value={todayBookings.length} subtitle="bookings" color="blue" />
        <StatsCard title="This Month" value={monthBookings.length} subtitle="confirmed" color="green" />
        <StatsCard title="Revenue" value={`$${totalRevenue.toFixed(0)}`} subtitle="this month" color="amber" />
        <StatsCard title="Pending" value={pendingPayments} subtitle="awaiting payment" color={pendingPayments > 0 ? 'red' : 'green'} />
      </div>

      {/* Today's Bookings */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Today&apos;s Bookings</h2>
        </div>
        <DataTable
          columns={[
            { key: 'name', label: 'Customer' },
            { key: 'space', label: 'Space' },
            { key: 'time', label: 'Time' },
            { key: 'amount', label: 'Amount' },
            { key: 'status', label: 'Status', render: (val: string) => statusBadge(val) },
          ]}
          data={todayBookings.map((b) => ({
            name: b.customer_name,
            space: (b.spaces as unknown as { name: string })?.name || 'Unknown',
            time: `${formatTime(b.start_hour)} – ${formatTime(b.end_hour)}`,
            amount: `$${b.total_amount}`,
            status: b.status,
          }))}
          emptyMessage="No bookings today"
        />
      </div>

      {/* This Week */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">This Week</h2>
        </div>
        <DataTable
          columns={[
            { key: 'date', label: 'Date' },
            { key: 'name', label: 'Customer' },
            { key: 'space', label: 'Space' },
            { key: 'time', label: 'Time' },
            { key: 'status', label: 'Status', render: (val: string) => statusBadge(val) },
          ]}
          data={weekBookings.map((b) => ({
            date: format(new Date(b.date + 'T12:00:00'), 'EEE, MMM d'),
            name: b.customer_name,
            space: (b.spaces as unknown as { name: string })?.name || 'Unknown',
            time: `${formatTime(b.start_hour)} – ${formatTime(b.end_hour)}`,
            status: b.status,
          }))}
          emptyMessage="No bookings this week"
        />
      </div>
    </div>
  );
}
