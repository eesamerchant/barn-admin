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
  total_amount: number;
  deposit_amount: number;
  etransfer_reference: string;
  payment_verified: boolean;
  spaces?: { name: string };
}

interface EtransferVerification {
  id: string;
  booking_id: string;
  reference_number: string;
  amount_found: number;
  email_subject: string;
  email_date: string;
  verified: boolean;
  checked_at: string;
}

export default function PaymentsPage() {
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [verifications, setVerifications] = useState<EtransferVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Fetch pending bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('id, space_id, date, start_hour, end_hour, customer_name, customer_email, total_amount, deposit_amount, etransfer_reference, payment_verified, spaces(name)')
        .eq('status', 'pending')
        .eq('payment_verified', false)
        .order('date');
      setPendingBookings((bookingsData as unknown as Booking[]) || []);

      // Fetch verifications
      const { data: verificationsData } = await supabase
        .from('etransfer_verifications')
        .select('*')
        .order('checked_at', { ascending: false });
      setVerifications(verificationsData || []);
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (bookingId: string) => {
    setVerifying(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('bookings')
        .update({ payment_verified: true })
        .eq('id', bookingId);

      if (error) throw error;

      setPendingBookings(
        pendingBookings.filter((b) => b.id !== bookingId)
      );

      if (selectedBooking?.id === bookingId) {
        setShowDetail(false);
        setSelectedBooking(null);
      }

      alert('Payment verified successfully');
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Failed to verify payment');
    } finally {
      setVerifying(false);
    }
  };

  const tableData = pendingBookings.map((b) => ({
    date: format(new Date(b.date), 'MMM dd, yyyy'),
    customer: b.customer_name,
    space: (b.spaces as any)?.name || 'Unknown',
    amount: `$${b.total_amount}`,
    deposit: `$${b.deposit_amount}`,
    reference: b.etransfer_reference || 'N/A',
  }));

  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Payment Verification</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-sm font-medium text-gray-600">Pending Payments</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{pendingBookings.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <p className="text-sm font-medium text-gray-600">Total Amount Due</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            ${pendingBookings
              .reduce((sum, b) => sum + b.total_amount, 0)
              .toFixed(2)}
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <p className="text-sm font-medium text-gray-600">Deposits Due</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            ${pendingBookings
              .reduce((sum, b) => sum + b.deposit_amount, 0)
              .toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Pending Payments</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : pendingBookings.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No pending payments</p>
        ) : (
          <div className="space-y-3">
            {pendingBookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex justify-between items-center"
              >
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    {booking.customer_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(booking.date), 'MMM dd, yyyy')} at {(booking.spaces as any)?.name}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    E-transfer Ref: {booking.etransfer_reference || 'Not provided'}
                  </p>
                  <p className="text-sm font-medium text-gray-700 mt-2">
                    Total: ${booking.total_amount} | Deposit: ${booking.deposit_amount}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedBooking(booking);
                    setShowDetail(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Verify
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Recent Verifications
        </h2>
        {verifications.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No verification records</p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {verifications.slice(0, 20).map((verification) => (
              <div
                key={verification.id}
                className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {verification.reference_number}
                    </p>
                    <p className="text-xs text-gray-600">
                      {verification.email_subject}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Amount: ${verification.amount_found}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      verification.verified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {verification.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDetail && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-slate-900">Verify Payment</h2>
            </div>

            <div className="p-6 space-y-4">
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
                <p className="text-sm font-medium text-gray-600">Date</p>
                <p className="text-lg font-semibold">
                  {format(new Date(selectedBooking.date), 'MMM dd, yyyy')}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-lg font-semibold">
                  ${selectedBooking.total_amount}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Deposit Amount</p>
                <p className="text-lg font-semibold">
                  ${selectedBooking.deposit_amount}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">
                  E-transfer Reference
                </p>
                <p className="text-lg font-semibold">
                  {selectedBooking.etransfer_reference || 'Not provided'}
                </p>
              </div>

              <p className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded p-3">
                Verify that the e-transfer was received with the matching reference number.
              </p>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDetail(false);
                  setSelectedBooking(null);
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerifyPayment(selectedBooking.id)}
                disabled={verifying}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors"
              >
                {verifying ? 'Verifying...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
