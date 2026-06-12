import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-zinc-950/[0.05] dark:bg-white/[0.06] text-zinc-950/90 dark:text-white/80': variant === 'default',
          'bg-green-500/10 text-green-300': variant === 'success',
          'bg-yellow-500/10 text-yellow-300': variant === 'warning',
          'bg-red-500/10 text-red-300': variant === 'danger',
          'border border-zinc-950/10 dark:border-white/10 text-zinc-950/70 dark:text-white/60': variant === 'outline',
        },
        className,
      )}
    >
      {children}
    </span>
  );
}
