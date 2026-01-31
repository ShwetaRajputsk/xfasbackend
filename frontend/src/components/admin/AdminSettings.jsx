import React from 'react';
import { CogIcon } from '@heroicons/react/outline';

const AdminSettings = () => {
  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Admin Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure system settings and preferences
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 text-center">
        <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">System Settings</h3>
        <p className="mt-2 text-sm text-gray-500">
          Configure admin panel settings and preferences
        </p>
      </div>
    </div>
  );
};

export default AdminSettings;