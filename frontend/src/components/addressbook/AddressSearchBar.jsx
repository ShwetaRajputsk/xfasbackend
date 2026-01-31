import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';

const AddressSearchBar = ({ value, onChange, placeholder = "Search addresses..." }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

export default AddressSearchBar;