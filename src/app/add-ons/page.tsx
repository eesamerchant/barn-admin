'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import DataTable from '@/components/DataTable';

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  space_id: string | null;
  is_active: boolean;
  spaces?: { name: string };
}

interface Space {
  id: string;
  name: string;
}

export default function AddOnsPage() {
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    space_id: 'all',
    is_active: true,
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

      const { data: addOnsData } = await supabase
        .from('add_ons')
        .select('id, name, description, price, space_id, is_active, spaces(name)')
        .order('created_at', { ascending: false });
      setAddOns((addOnsData as unknown as AddOn[]) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (addOn: AddOn) => {
    setFormMode('edit');
    setEditingId(addOn.id);
    setFormData({
      name: addOn.name,
      description: addOn.description,
      price: addOn.price.toString(),
      space_id: addOn.space_id || 'all',
      is_active: addOn.is_active,
    });
    setShowForm(true);
  };

  const handleCreate = () => {
    setFormMode('create');
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      space_id: 'all',
      is_active: true,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const supabase = createClient();
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        space_id: formData.space_id === 'all' ? null : formData.space_id,
        is_active: formData.is_active,
      };

      if (formMode === 'edit' && editingId) {
        const { error } = await supabase
          .from('add_ons')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('add_ons').insert([payload]);

        if (error) throw error;
      }

      await fetchData();
      setShowForm(false);
      alert(`Add-on ${formMode === 'edit' ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Error saving add-on:', error);
      alert('Failed to save add-on');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this add-on?')) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.from('add_ons').delete().eq('id', id);

      if (error) throw error;

      await fetchData();
      alert('Add-on deleted successfully');
    } catch (error) {
      console.error('Error deleting add-on:', error);
      alert('Failed to delete add-on');
    }
  };

  const tableData = addOns.map((addon) => ({
    name: addon.name,
    description: addon.description,
    price: `$${addon.price}`,
    space:
      addon.space_id === null
        ? 'Both Spaces'
        : (addon.spaces as any)?.name || 'Unknown',
    status: addon.is_active ? 'Active' : 'Inactive',
  }));

  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Add-ons Management</h1>

      <button
        onClick={handleCreate}
        className="mb-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        + New Add-on
      </button>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">All Add-ons</h2>
        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'description', label: 'Description' },
            { key: 'price', label: 'Price' },
            { key: 'space', label: 'Space' },
            { key: 'status', label: 'Status' },
          ]}
          data={tableData}
          loading={loading}
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-slate-900">
                {formMode === 'edit' ? 'Edit Add-on' : 'Create New Add-on'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
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
