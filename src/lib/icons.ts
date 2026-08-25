import {
  Accessibility, Baby, Bath, BookOpen, Brush, ClipboardList, HandHeart,
  HeartHandshake, Heart, House, Map, MessageCircle, Monitor, ShieldCheck,
  Shirt, Soup, Sparkles, Users, Utensils, WashingMachine,
} from 'lucide-react';
import type { ComponentType } from 'react';

/**
 * Icônes utilisables par une formation pour ses modules et son écran de démarrage.
 * Registre explicite (plutôt qu'un `import *`) pour garder le tree-shaking.
 */
export const ICONS = {
  Accessibility, Baby, Bath, BookOpen, Brush, ClipboardList, HandHeart,
  HeartHandshake, Heart, House, Map, MessageCircle, Monitor, ShieldCheck,
  Shirt, Soup, Sparkles, Users, Utensils, WashingMachine,
} satisfies Record<string, ComponentType<{ size?: number; className?: string }>>;

export type IconName = keyof typeof ICONS;
