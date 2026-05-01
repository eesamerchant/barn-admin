'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import StatsCard from '@/components/StatsCard';
import DataTable from '@/components/DataTable';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

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

interface Space {
  id: string;
  name: string;
}

export default function DashboardPage() {
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [weekBookings, setWeekBookings] = useState<Booking[]>([]);
  const [monthBookings, setMonthBookings] = useState<Booking[]>([]);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const today = new Date();

        // Fetch spaces
        const { data: spacesData } = await supabase
          .from('spaces')
          .select('id, name')
          .order('created_at');
        setSpaces(spacesData || []);

        // Fetch today's bookings
        const { data: todayData } = await supabase
          .from('bookings')
          .select('id, space_id, date, start_hour, end_hour, customer_name, total_amount, status, spaces(name)')
          .eq('date', format(today, 'yyyy-MM-dd'))
          .order('start_hour');
        setTodayBookings(todayData || []);

        // Fetch this week's bookings
        const weekStart = startOfWeek(today);
        const weekEnd = endOfWeek(today);
        const { data: weekData } = await supabase
          .from('bookings')
          .select('id, space_id, date, start_hour, end_hour, customer_name, total_amount, status, spaces(name)')
          .gte('date', format(weekStart, 'yyyy-MM-dd'))
          .lte('date', format(weekEnd, 'yyyy-MM-dd'))
          .order('date');
        setWeekBookings(weekData || []);

        // Fetch month bookings for revenue
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);
        const { data: monthData } = await supabase
          .from('bookings')
          .select('id, total_amount, status')
          .gte('date', format(monthStart, 'yyyy-MM-dd'))
          .lte('date', format(monthEnd, 'yyyy-MM-dd'))
          .eq('status', 'confirmed');
        setMonthBookings(monthData || []);

        // Calculate month revenue
        const revenue = (monthData || []).reduce((sum, b) => sum + (b.total_amount || 0), 0);
        setTotalRevenue(revenue);

        // Fetch pending payments
        const { data: pendingData } = await supabase
          .from('bookings')
          .select('id')
          .eq('status', 'pending')
          .eq('payment_verified', false);
        setPendingPayments(pendingData?.length || 0);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const todayTableData = todayBookings.map((b) => ({
    name: b.customer_name,
    space: (b.spaces as any)?.name || 'Unknown',
    time: `${b.start_hour}:00 - ${b.end_hour}:00`,
    amount: `$${b.total_amount}`,
    status: b.status,
  }));

  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Today's Bookings"
          value={todayBookings.length}
          icon="📅"
          color="blue"
        />
        <StatsCard
          title="This Month's Bookings"
          value={monthBookings.length}
          icon="📊"
          color="green"
        />
        <StatsCard
          title="This Month's Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          icon="💰"
          color="green"
        />
        <StatsCard
          title="Pending Payments"
          value={pendingPayments}
          icon="⏳"
          color={pendingPayments > 0 ? 'orange' : 'blue'}
        />
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Today's Bookings</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'name', label: 'Customer' },
              { key: 'space', label: 'Space' },
              { key: 'time', label: 'Time' },
              { key: 'amount', label: 'Amount' },
              { key: 'status', label: 'Status' },
            ]}
            data={todayTableData}
            loading={false}
          />
        )}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          This Week's Bookings
        </h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
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
              time: `${b.start_hour}:00 - ${b.end_hour}:00`,
              status: b.status,
            }))}
            loading={false}
          />
        )}
      </div>
    </div>
  );
}
