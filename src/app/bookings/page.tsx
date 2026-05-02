'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import DataTable from '@/components/DataTable';
import { format } from 'date-fns';

interface Booking {
  id: string;
  space_id: string;
  date: string;
  start_hour: number;
  end_hour: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  deposit_amount: number;
  status: string;
  payment_verified: boolean;
  spaces?: { name: string };
}

interface Space {
  id: string;
  name: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpace, setSelectedSpace] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const supabase = createClient();

        const { data: spacesData } = await supabase
          .from('spaces')
          .select('id, name')
          .order('created_at');
        setSpaces(spacesData || []);

        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('id, space_id, date, start_hour, end_hour, customer_name, customer_email, customer_phone, total_amount, deposit_amount, status, payment_verified, spaces(name)')
          .order('date', { ascending: false });
        setBookings(bookingsData || []);
        setFilteredBookings(bookingsData || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  useEffect(() => {
    let filtered = [...bookings];

    if (selectedSpace !== 'all') {
      filtered = filtered.filter((b) => b.space_id === selectedSpace);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((b) => b.status === selectedStatus);
    }

    if (dateFrom) {
      filtered = filtered.filter((b) => b.date >= dateFrom);
    }

    if (dateTo) {
      filtered = filtered.filter((b) => b.date <= dateTo);
    }

    setFilteredBookings(filtered);
  }, [selectedSpace, selectedStatus, dateFrom, dateTo, bookings]);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(
        bookings.map((b) =>
          b.id === bookingId ? { ...b, status: newStatus } : b
        )
      );

      if (selectedBooking?.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status');
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentVerification = async (bookingId: string) => {
    setUpdating(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('bookings')
        .update({ payment_verified: true })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(
        bookings.map((b) =>
          b.id === bookingId ? { ...b, payment_verified: true } : b
        )
      );

      if (selectedBooking?.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, payment_verified: true });
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Failed to verify payment');
    } finally {
      setUpdating(false);
    }
  };

  const tableData = filteredBookings.map((b) => ({
    date: format(new Date(b.date), 'MMM dd, yyyy'),
    customer: b.customer_name,
    space: b.spaces?.name || 'Unknown',
    time: `${b.start_hour}:00 - ${b.end_hour}:00`,
    amount: `$${b.total_amount}`,
    status: b.status,
    payment: b.payment_verified ? '✓' : '✗',
  }));

  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Bookings Management</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Space
            </label>
            <select
              value={selectedSpace}
              onChange={(e) => setSelectedSpace(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Spaces</option>
              {spaces.map((space) => (
                <option key={space.id} value={space.id}>
                  {space.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Bookings ({filteredBookings.length})
        </h2>
        <DataTable
          columns={[
            { key: 'date', label: 'Date' },
            { key: 'customer', label: 'Customer' },
            { key: 'space', label: 'Space' },
            { key: 'time', label: 'Time' },
            { key: 'amount', label: 'Amount' },
            { key: 'status', label: 'Status' },
            { key: 'payment', label: 'Payment' },
          ]}
          data={tableData}
          loading={loading}
        />
      </div>

      {showDetail && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-slate-900">
                Booking Details
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Date</p>
                  <p className="text-lg font-semibold">
                    {format(new Date(selectedBooking.date), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Time</p>
                  <p className="text-lg font-semibold">
                    {selectedBooking.start_hour}:00 - {selectedBooking.end_hour}:00
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Customer</p>
                  <p className="text-lg font-semibold">
                    {selectedBooking.customer_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-lg font-semibold">
                    {selectedBooking.customer_email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Phone</p>
                  <p className="text-lg font-semibold">
                    {selectedBooking.customer_phone}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Space</p>
                  <p className="text-lg font-semibold">
                    {selectedBooking.spaces?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-lg font-semibold">
                    ${selectedBooking.total_amount}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Deposit</p>
                  <p className="text-lg font-semibold">
                    ${selectedBooking.deposit_amount}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className="text-lg font-semibold capitalize">
                    {selectedBooking.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Payment</p>
                  <p className="text-lg font-semibold">
                    {selectedBooking.payment_verified ? 'Verified' : 'Not Verified'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                {selectedBooking.status !== 'completed' && (
                  <select
                    value={selectedBooking.status}
                    onChange={(e) =>
                      handleStatusChange(selectedBooking.id, e.target.value)
                    }
                    disabled={updating}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                )}

                {!selectedBooking.payment_verified && (
                  <button
                    onClick={() => handlePaymentVerification(selectedBooking.id)}
                    disabled={updating}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors"
                  >
                    {updating ? 'Verifying...' : 'Verify Payment'}
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDetail(false);
                  setSelectedBooking(null);
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
