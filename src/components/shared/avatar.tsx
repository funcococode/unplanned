import Image from 'next/image';
import { cn, getInitials } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  name: string | null | undefined;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: { container: 'h-8 w-8 text-xs', image: 32 },
  md: { container: 'h-10 w-10 text-sm', image: 40 },
  lg: { container: 'h-14 w-14 text-base', image: 56 },
  xl: { container: 'h-20 w-20 text-xl', image: 80 },
};

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const { container, image } = sizeMap[size];

  if (src) {
    return (
      <Image
        src={src}
        alt={name || 'User avatar'}
        width={image}
        height={image}
        className={cn('rounded-full object-cover', container, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-700',
        container,
        className,
      )}
    >
      {getInitials(name || 'User')}
    </div>
  );
}
