import { ICONS, type IconName } from './icons';

interface Props {
  name: IconName;
  size?: number;
  className?: string;
}

/** Rend l'icône déclarée par une formation, à partir de son nom. */
export default function Icon({ name, size = 24, className }: Props) {
  const Cmp = ICONS[name] ?? ICONS.BookOpen;
  return <Cmp size={size} className={className} />;
}
