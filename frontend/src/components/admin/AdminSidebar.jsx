import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  TruckIcon,
  UsersIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  LocationMarkerIcon,
  CogIcon,
  MenuAlt1Icon,
  XIcon,
  ShieldCheckIcon,
  ClipboardListIcon
} from '@heroicons/react/outline';

const AdminSidebar = ({ open, setOpen }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon, exact: true },
    { name: 'Bookings', href: '/admin/bookings', icon: TruckIcon },
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Courier Rates', href: '/admin/rates', icon: CurrencyDollarIcon },
    { name: 'KYC Management', href: '/admin/kyc', icon: ShieldCheckIcon },
    { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
    { name: 'Tracking', href: '/admin/tracking', icon: LocationMarkerIcon },
    { name: 'Settings', href: '/admin/settings', icon: CogIcon },
  ];

  const isActive = (href, exact = false) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {!open && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity md:hidden z-20"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-gray-200 transition-all duration-300
        ${open ? 'w-64' : 'w-20'}
      `}>
        {/* Logo area */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {open ? (
            <>
              <Link to="/admin" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <TruckIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">XFas Admin</span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="w-full p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <MenuAlt1Icon className="w-6 h-6 mx-auto" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                  ${active
                    ? 'bg-orange-100 text-orange-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                  ${!open ? 'justify-center' : ''}
                `}
                title={!open ? item.name : ''}
              >
                <item.icon
                  className={`
                    flex-shrink-0 w-5 h-5
                    ${active ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'}
                    ${!open ? '' : 'mr-3'}
                  `}
                />
                {open && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        {open && (
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              XFas Logistics Admin Panel
              <br />
              v2.0.0
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminSidebar;