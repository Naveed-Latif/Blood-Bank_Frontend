import { cn } from '@/lib/utils';

export const Select = ({ 
  label, 
  error, 
  options = [], 
  placeholder = 'Select an option',
  className = '', 
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        className={cn(
          'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm',
          error && 'border-red-300 focus:ring-red-500 focus:border-red-500',
          className
        )}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};