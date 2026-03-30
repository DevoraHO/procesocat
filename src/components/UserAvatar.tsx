import { cn } from '@/lib/utils';

interface UserAvatarProps {
  name: string;
  avatar_url?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = { sm: 32, md: 44, lg: 64, xl: 96 };
const textSize = { sm: 'text-xs', md: 'text-sm', lg: 'text-lg', xl: 'text-2xl' };

const hashColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 55%, 45%)`;
};

const UserAvatar = ({ name, avatar_url, size = 'md' }: UserAvatarProps) => {
  const px = sizeMap[size];
  const initials = name.charAt(0).toUpperCase();

  if (avatar_url) {
    return (
      <img
        src={avatar_url}
        alt={name}
        className="rounded-full object-cover"
        style={{ width: px, height: px }}
      />
    );
  }

  return (
    <div
      className={cn('rounded-full flex items-center justify-center text-white font-semibold', textSize[size])}
      style={{ width: px, height: px, backgroundColor: hashColor(name) }}
    >
      {initials}
    </div>
  );
};

export default UserAvatar;
