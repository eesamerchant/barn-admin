'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

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

type FilterType = 'all' | 'both' | string;

export default function AddOnsPage() {
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    space_id: 'both',
    is_active: true,
  });

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

  const getSpaceLabel = (spaceId: string | null): string => {
    if (spaceId === null) return 'Both Sites';
    const space = spaces.find((s) => s.id === spaceId);
    return space?.name || 'Unknown';
  };

  const getSpaceBadgeColor = (spaceId: string | null): string => {
    if (spaceId === null) return 'bg-blue-100 text-blue-800';
    const space = spaces.find((s) => s.id === spaceId);
    if (space?.name.toLowerCase().includes('barn') && !space?.name.toLowerCase().includes('scape')) {
      return 'bg-cyan-100 text-cyan-800';
    }
    return 'bg-amber-100 text-amber-800';
  };

  const filteredAddOns = addOns.filter((addon) => {
    if (filter === 'all') return true;
    if (filter === 'both') return addon.space_id === null;
    return addon.space_id === filter;
  });

  const handleEdit = (addOn: AddOn) => {
    setFormMode('edit');
    setEditingId(addOn.id);
    setFormData({
      name: addOn.name,
      description: addOn.description,
      price: addOn.price.toString(),
      space_id: addOn.space_id || 'both',
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
      space_id: 'both',
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
        space_id: formData.space_id === 'both' ? null : formData.space_id,
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

  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Add-ons Management</h1>

      <button
        onClick={handleCreate}
        className="mb-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
      >
        + New Add-on
      </button>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">All Add-ons</h2>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('both')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filter === 'both'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Both Sites
          </button>
          {spaces.map((space) => (
            <button
              key={space.id}
              onClick={() => setFilter(space.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter === space.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {space.name}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredAddOns.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No add-ons to display</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Site
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAddOns.map((addon, idx) => (
                  <tr
                    key={addon.id}
                    className={`border-b transition-colors duration-150 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } hover:bg-blue-50`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {addon.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {addon.description}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ${addon.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getSpaceBadgeColor(
                          addon.space_id
                        )}`}
                      >
                        {getSpaceLabel(addon.space_id)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          addon.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {addon.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(addon)}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(addon.id)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-slide-up">
            <div className="p-6 border-b border-gray-200">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Push to Site
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Choose which booking site this add-on will appear on
                </p>
                <select
                  value={formData.space_id}
                  onChange={(e) =>
                    setFormData({ ...formData, space_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="both">Both Sites</option>
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
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
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
