import { forwardRef } from 'react';

/**
 * Reusable Input component with label, optional icon, and error message.
 *
 * @param {string} label - Label text above the input
 * @param {string} error - Error message displayed below input in red
 * @param {React.ComponentType} icon - Lucide icon component to render inside input
 * @param {string} type - Input type (text, email, password, etc.)
 * @param {string} className - Additional Tailwind classes
 */
const Input = forwardRef(function Input(
  { label, error, icon: Icon, type = 'text', className = '', ...rest },
  ref
) {
  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {/* Left icon */}
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
            <Icon size={18} />
          </div>
        )}

        <input
          ref={ref}
          type={type}
          className={`
            w-full rounded-xl border bg-white dark:bg-slate-800
            py-3 px-4
            ${Icon ? 'pl-11' : ''}
            text-gray-900 dark:text-gray-100
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            border-gray-300 dark:border-gray-600
            focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500
            dark:focus:ring-indigo-400/40 dark:focus:border-indigo-400
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 dark:border-red-400 focus:ring-red-500/40 focus:border-red-500' : ''}
            ${className}
          `}
          {...rest}
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1.5 text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
