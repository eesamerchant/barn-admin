'use client';

import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { useState } from 'react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const links = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/bookings', label: 'Bookings', icon: '📅' },
    { href: '/availability', label: 'Availability', icon: '🕐' },
    { href: '/add-ons', label: 'Add-ons', icon: '➕' },
    { href: '/discounts', label: 'Discounts', icon: '🏷️' },
    { href: '/payments', label: 'Payments', icon: '💳' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white shadow-lg flex flex-col">
      <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700">
        <h1 className="text-2xl font-bold">Barn Admin</h1>
        <p className="text-xs text-slate-400 mt-1">Management Panel</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block px-4 py-3 rounded-lg transition-all duration-200 border-l-4 ${
                    isActive
                      ? 'bg-blue-600 text-white border-l-blue-300 shadow-md'
                      : 'text-slate-300 hover:bg-slate-700 border-l-transparent hover:border-l-slate-500'
                  }`}
                >
                  <span className="mr-2">{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-500 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md"
        >
          {loggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  );
}
