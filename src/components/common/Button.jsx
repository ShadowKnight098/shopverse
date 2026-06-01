import { Loader2 } from 'lucide-react';

/**
 * Reusable Button component with multiple variants, sizes, and states.
 *
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'} variant - Visual style
 * @param {'sm'|'md'|'lg'} size - Button size
 * @param {boolean} isLoading - Shows spinner and disables interaction
 * @param {boolean} disabled - Disables the button
 * @param {string} className - Additional Tailwind classes
 */
const variantStyles = {
  primary:
    'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30',
  secondary:
    'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20 hover:shadow-lg hover:shadow-violet-500/30',
  outline:
    'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-400 dark:hover:bg-indigo-950',
  ghost:
    'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
  danger:
    'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3.5 text-base gap-2.5',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  children,
  onClick,
  type = 'button',
  ...rest
}) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-medium rounded-xl
        transition-all duration-200 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        active:scale-[0.97]
        ${variantStyles[variant] || variantStyles.primary}
        ${sizeStyles[size] || sizeStyles.md}
        ${className}
      `}
      {...rest}
    >
      {isLoading && (
        <Loader2 className="animate-spin shrink-0" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      )}
      {children}
    </button>
  );
}
