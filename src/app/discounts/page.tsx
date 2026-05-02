'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import DataTable from '@/components/DataTable';

interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_booking_amount: number;
  max_uses: number | null;
  current_uses: number;
  space_id: string | null;
  is_active: boolean;
  expires_at: string | null;
  spaces?: { name: string };
}

interface Space {
  id: string;
  name: string;
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as const,
    value: '',
    min_booking_amount: '',
    max_uses: '',
    space_id: 'all',
    is_active: true,
    expires_at: '',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const { data: spacesData } = await supabase
        .from('spaces')
        .select('id, name');
      setSpaces(spacesData || []);

      const { data: discountsData } = await supabase
        .from('discount_codes')
        .select('id, code, type, value, min_booking_amount, max_uses, current_uses, space_id, is_active, expires_at, spaces(name)')
        .order('created_at', { ascending: false });
      setDiscounts((discountsData as unknown as DiscountCode[]) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (discount: DiscountCode) => {
    setFormMode('edit');
    setEditingId(discount.id);
    setFormData({
      code: discount.code,
      type: discount.type,
      value: discount.value.toString(),
      min_booking_amount: discount.min_booking_amount.toString(),
      max_uses: discount.max_uses?.toString() || '',
      space_id: discount.space_id || 'all',
      is_active: discount.is_active,
      expires_at: discount.expires_at
        ? new Date(discount.expires_at).toISOString().split('T')[0]
        : '',
    });
    setShowForm(true);
  };

  const handleCreate = () => {
    setFormMode('create');
    setEditingId(null);
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      min_booking_amount: '',
      max_uses: '',
      space_id: 'all',
      is_active: true,
      expires_at: '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const supabase = createClient();
      const payload = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: parseFloat(formData.value),
        min_booking_amount: parseFloat(formData.min_booking_amount || '0'),
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        space_id: formData.space_id === 'all' ? null : formData.space_id,
        is_active: formData.is_active,
        expires_at: formData.expires_at || null,
      };

      if (formMode === 'edit' && editingId) {
        const { error } = await supabase
          .from('discount_codes')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('discount_codes')
          .insert([{ ...payload, current_uses: 0 }]);

        if (error) throw error;
      }

      await fetchData();
      setShowForm(false);
      alert(`Discount code ${formMode === 'edit' ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Error saving discount code:', error);
      alert('Failed to save discount code');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discount code?')) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('discount_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchData();
      alert('Discount code deleted successfully');
    } catch (error) {
      console.error('Error deleting discount code:', error);
      alert('Failed to delete discount code');
    }
  };

  const tableData = discounts.map((discount) => ({
    code: discount.code,
    type: discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`,
    minAmount: `$${discount.min_booking_amount}`,
    uses: discount.max_uses
      ? `${discount.current_uses}/${discount.max_uses}`
      : `${discount.current_uses}/∞`,
    space: discount.space_id === null ? 'Both' : (discount.spaces as any)?.name || 'Unknown',
    status: discount.is_active ? 'Active' : 'Inactive',
    expires: discount.expires_at
      ? new Date(discount.expires_at).toLocaleDateString()
      : 'Never',
  }));

  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Discount Codes</h1>

      <button
        onClick={handleCreate}
        className="mb-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        + New Discount Code
      </button>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">All Discount Codes</h2>
        <DataTable
          columns={[
            { key: 'code', label: 'Code' },
            { key: 'type', label: 'Discount' },
            { key: 'minAmount', label: 'Min Amount' },
            { key: 'uses', label: 'Uses' },
            { key: 'space', label: 'Space' },
            { key: 'status', label: 'Status' },
            { key: 'expires', label: 'Expires' },
          ]}
          data={tableData}
          loading={loading}
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-slate-900">
                {formMode === 'edit' ? 'Edit Discount Code' : 'Create New Discount Code'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="e.g., SAVE20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as 'percentage' | 'fixed',
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Booking Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.min_booking_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, min_booking_amount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Uses (leave empty for unlimited)
                </label>
                <input
                  type="number"
                  value={formData.max_uses}
                  onChange={(e) =>
                    setFormData({ ...formData, max_uses: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available For
                </label>
                <select
                  value={formData.space_id}
                  onChange={(e) =>
                    setFormData({ ...formData, space_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Both Spaces</option>
                  {spaces.map((space) => (
                    <option key={space.id} value={space.id}>
                      {space.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expires At (optional)
                </label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) =>
                    setFormData({ ...formData, expires_at: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 text-sm font-medium text-gray-700"
                >
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
