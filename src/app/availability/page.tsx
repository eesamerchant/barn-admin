'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { format, addDays } from 'date-fns';

interface AvailabilityRecord {
  id: string;
  date: string;
  start_hour: number;
  end_hour: number;
  is_available: boolean;
  note: string | null;
}

export default function AvailabilityPage() {
  const [availabilities, setAvailabilities] = useState<AvailabilityRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [startHour, setStartHour] = useState(8);
  const [endHour, setEndHour] = useState(22);
  const [isAvailable, setIsAvailable] = useState(true);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AvailabilityRecord | null>(null);
  const [bulkDays, setBulkDays] = useState(30);
  const [bulkStartHour, setBulkStartHour] = useState(8);
  const [bulkEndHour, setBulkEndHour] = useState(22);

  useEffect(() => {
    fetchAvailabilities();
  }, []);

  const fetchAvailabilities = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('availability')
        .select('*')
        .order('date', { ascending: false });
      setAvailabilities(data || []);
    } catch (error) {
      console.error('Error fetching availabilities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadRecord = (record: AvailabilityRecord) => {
    setSelectedDate(record.date);
    setStartHour(record.start_hour);
    setEndHour(record.end_hour);
    setIsAvailable(record.is_available);
    setNote(record.note || '');
    setSelectedRecord(record);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const supabase = createClient();

      if (selectedRecord) {
        // Update existing
        const { error } = await supabase
          .from('availability')
          .update({
            start_hour: startHour,
            end_hour: endHour,
            is_available: isAvailable,
            note: note || null,
          })
          .eq('id', selectedRecord.id);

        if (error) throw error;
      } else {
        // Check if record exists for this date
        const { data: existing } = await supabase
          .from('availability')
          .select('id')
          .eq('date', selectedDate);

        if (existing && existing.length > 0) {
          // Update existing
          const { error } = await supabase
            .from('availability')
            .update({
              start_hour: startHour,
              end_hour: endHour,
              is_available: isAvailable,
              note: note || null,
            })
            .eq('date', selectedDate);

          if (error) throw error;
        } else {
          // Insert new
          const { error } = await supabase.from('availability').insert({
            date: selectedDate,
            start_hour: startHour,
            end_hour: endHour,
            is_available: isAvailable,
            note: note || null,
          });

          if (error) throw error;
        }
      }

      await fetchAvailabilities();
      setSelectedRecord(null);
      alert('Availability saved successfully');
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkSet = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const supabase = createClient();
      const today = new Date();
      const records = [];

      for (let i = 0; i < bulkDays; i++) {
        const date = addDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');

        records.push({
          date: dateStr,
          start_hour: bulkStartHour,
          end_hour: bulkEndHour,
          is_available: true,
          note: null,
        });
      }

      // Upsert records
      const { error } = await supabase.from('availability').upsert(records, {
        onConflict: 'date',
      });

      if (error) throw error;

      await fetchAvailabilities();
      alert(`Bulk availability set for ${bulkDays} days`);
    } catch (error) {
      console.error('Error bulk setting availability:', error);
      alert('Failed to bulk set availability');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this availability record?')) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('availability')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchAvailabilities();
      alert('Availability record deleted');
    } catch (error) {
      console.error('Error deleting availability:', error);
      alert('Failed to delete availability record');
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Availability Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Set Availability Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Set Availability</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Hour (0-23)
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={startHour}
                  onChange={(e) => setStartHour(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Hour (0-23)
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={endHour}
                  onChange={(e) => setEndHour(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label
                  htmlFor="isAvailable"
                  className="ml-2 text-sm font-medium text-gray-700"
                >
                  Available
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (Optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g., Maintenance scheduled"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
              >
                {saving ? 'Saving...' : 'Save Availability'}
              </button>
            </form>
          </div>

          {/* Bulk Set Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Bulk Set</h2>
            <form onSubmit={handleBulkSet} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Days from Today
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={bulkDays}
                  onChange={(e) => setBulkDays(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Hour
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={bulkStartHour}
                  onChange={(e) => setBulkStartHour(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Hour
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={bulkEndHour}
                  onChange={(e) => setBulkEndHour(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors"
              >
                {saving ? 'Setting...' : 'Bulk Set'}
              </button>
            </form>
          </div>
        </div>

        {/* Availability List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              All Availability Records
            </h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : availabilities.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No availability records</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {availabilities.map((record) => (
                  <div
                    key={record.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRecord?.id === record.id
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div
                      onClick={() => handleLoadRecord(record)}
                      className="flex justify-between items-start mb-2"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {format(new Date(record.date), 'EEE, MMM dd, yyyy')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {record.start_hour}:00 - {record.end_hour}:00
                        </p>
                        {record.note && (
                          <p className="text-sm text-gray-500 mt-1">{record.note}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            record.is_available
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {record.is_available ? 'Available' : 'Unavailable'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(record.id);
                          }}
                          className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
