/**
 * Badge component – small pill-shaped label with color variants.
 *
 * @param {'success'|'warning'|'danger'|'info'|'default'} variant
 * @param {string} className - Additional Tailwind classes
 * @param {React.ReactNode} children
 */
const variantStyles = {
  success:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  danger:
    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  info:
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  default:
    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export default function Badge({
  variant = 'default',
  children,
  className = '',
}) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5
        text-xs font-semibold rounded-full
        ${variantStyles[variant] || variantStyles.default}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
