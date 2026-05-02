'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

interface Space {
  id: string;
  name: string;
  hourly_rate: number;
  min_booking_hours: number;
  max_booking_hours: number;
}

interface Settings {
  [key: string]: any;
}

export default function SettingsPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    event_space_name: '',
    court_name: '',
    deposit_percentage: 50,
    business_hours_start: 8,
    business_hours_end: 22,
    booking_advance_days: 90,
    cancellation_hours: 48,
    imap_email: '',
    imap_host: 'imap.gmail.com',
    imap_port: 993,
    imap_app_password: '',
    imap_use_ssl: true,
  });

  const [spaceData, setSpaceData] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Fetch spaces
      const { data: spacesData } = await supabase
        .from('spaces')
        .select('id, name, hourly_rate, min_booking_hours, max_booking_hours')
        .order('created_at');
      setSpaces(spacesData || []);

      // Initialize space data
      const spaceDataObj: any = {};
      (spacesData || []).forEach((space) => {
        spaceDataObj[space.id] = {
          hourly_rate: space.hourly_rate,
          min_booking_hours: space.min_booking_hours,
          max_booking_hours: space.max_booking_hours,
        };
      });
      setSpaceData(spaceDataObj);

      // Fetch settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('key, value');

      const settingsObj: Settings = {};
      (settingsData || []).forEach((setting: any) => {
        settingsObj[setting.key] = setting.value;
      });
      setSettings(settingsObj);

      // Update form data with fetched settings
      setFormData((prev) => ({
        ...prev,
        event_space_name: settingsObj.event_space_name || '',
        court_name: settingsObj.court_name || '',
        deposit_percentage: settingsObj.deposit_percentage?.deposit_percentage || settingsObj.deposit_percentage || 50,
        business_hours_start: settingsObj.business_hours_start || 8,
        business_hours_end: settingsObj.business_hours_end || 22,
        booking_advance_days: settingsObj.booking_advance_days || 90,
        cancellation_hours: settingsObj.cancellation_hours || 48,
        imap_email: settingsObj.imap_config?.email_address || '',
        imap_host: settingsObj.imap_config?.imap_host || 'imap.gmail.com',
        imap_port: settingsObj.imap_config?.imap_port || 993,
        imap_use_ssl: settingsObj.imap_config?.use_ssl !== false,
      }));
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSpaceChange = (spaceId: string, key: string, value: any) => {
    setSpaceData((prev) => ({
      ...prev,
      [spaceId]: {
        ...prev[spaceId],
        [key]: value,
      },
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const supabase = createClient();

      // Update spaces
      for (const spaceId in spaceData) {
        const { error } = await supabase
          .from('spaces')
          .update({
            hourly_rate: parseFloat(spaceData[spaceId].hourly_rate),
            min_booking_hours: parseInt(spaceData[spaceId].min_booking_hours),
            max_booking_hours: parseInt(spaceData[spaceId].max_booking_hours),
          })
          .eq('id', spaceId);

        if (error) throw error;
      }

      // Update settings
      const settingsToUpdate = [
        { key: 'event_space_name', value: formData.event_space_name },
        { key: 'court_name', value: formData.court_name },
        { key: 'deposit_percentage', value: { deposit_percentage: formData.deposit_percentage } },
        { key: 'business_hours_start', value: formData.business_hours_start },
        { key: 'business_hours_end', value: formData.business_hours_end },
        { key: 'booking_advance_days', value: formData.booking_advance_days },
        { key: 'cancellation_hours', value: formData.cancellation_hours },
        {
          key: 'imap_config',
          value: {
            email_address: formData.imap_email,
            imap_host: formData.imap_host,
            imap_port: formData.imap_port,
            app_password: formData.imap_app_password,
            use_ssl: formData.imap_use_ssl,
          },
        },
      ];

      for (const setting of settingsToUpdate) {
        const { data: existing } = await supabase
          .from('settings')
          .select('id')
          .eq('key', setting.key);

        if (existing && existing.length > 0) {
          const { error } = await supabase
            .from('settings')
            .update({ value: setting.value })
            .eq('key', setting.key);

          if (error) throw error;
        } else {
          const { error } = await supabase.from('settings').insert([setting]);

          if (error) throw error;
        }
      }

      alert('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Settings</h1>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Space Names */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Space Names</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Space Name
              </label>
              <input
                type="text"
                value={formData.event_space_name}
                onChange={(e) =>
                  handleSettingChange('event_space_name', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Basketball Court Name
              </label>
              <input
                type="text"
                value={formData.court_name}
                onChange={(e) =>
                  handleSettingChange('court_name', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Space Rates and Hours */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Space Rates & Hours</h2>
          <div className="space-y-6">
            {spaces.map((space) => (
              <div key={space.id} className="border-t pt-6 first:border-t-0 first:pt-0">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  {space.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hourly Rate ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={spaceData[space.id]?.hourly_rate || 0}
                      onChange={(e) =>
                        handleSpaceChange(
                          space.id,
                          'hourly_rate',
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Booking Hours
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={spaceData[space.id]?.min_booking_hours || 1}
                      onChange={(e) =>
                        handleSpaceChange(
                          space.id,
                          'min_booking_hours',
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Booking Hours
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={spaceData[space.id]?.max_booking_hours || 24}
                      onChange={(e) =>
                        handleSpaceChange(
                          space.id,
                          'max_booking_hours',
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Settings */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Business Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deposit Percentage (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.deposit_percentage}
                onChange={(e) =>
                  handleSettingChange('deposit_percentage', parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Hours Start (Hour)
              </label>
              <input
                type="number"
                min="0"
                max="23"
                value={formData.business_hours_start}
                onChange={(e) =>
                  handleSettingChange('business_hours_start', parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Hours End (Hour)
              </label>
              <input
                type="number"
                min="0"
                max="23"
                value={formData.business_hours_end}
                onChange={(e) =>
                  handleSettingChange('business_hours_end', parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Advance Days
              </label>
              <input
                type="number"
                min="1"
                value={formData.booking_advance_days}
                onChange={(e) =>
                  handleSettingChange('booking_advance_days', parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Hours
              </label>
              <input
                type="number"
                min="1"
                value={formData.cancellation_hours}
                onChange={(e) =>
                  handleSettingChange('cancellation_hours', parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* IMAP Configuration */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            E-Transfer Verification (IMAP Config)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.imap_email}
                onChange={(e) =>
                  handleSettingChange('imap_email', e.target.value)
                }
                placeholder="admin@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IMAP Host
              </label>
              <input
                type="text"
                value={formData.imap_host}
                onChange={(e) =>
                  handleSettingChange('imap_host', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IMAP Port
              </label>
              <input
                type="number"
                value={formData.imap_port}
                onChange={(e) =>
                  handleSettingChange('imap_port', parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                App Password
              </label>
              <input
                type="password"
                value={formData.imap_app_password}
                onChange={(e) =>
                  handleSettingChange('imap_app_password', e.target.value)
                }
                placeholder="Enter Gmail app password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.imap_use_ssl}
                  onChange={(e) =>
                    handleSettingChange('imap_use_ssl', e.target.checked)
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mr-2"
                />
                Use SSL
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
