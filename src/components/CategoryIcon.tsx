import React from 'react';
import {
  Laptop,
  Car,
  Apple,
  Coffee,
  Utensils,
  ShoppingCart,
  Shirt,
  Trophy,
  Gamepad2,
  Tv,
  Music,
  Plane,
  CreditCard,
  Share2,
  Radio,
  Sparkles,
  Crown,
  Globe,
  Building,
  Heart,
  Palette,
  Film,
  Book,
  Wrench,
  Zap,
  Award,
  Star,
  Smile,
  Compass,
  Tag,
  Layers,
  Fuel,
  Watch,
  Rocket,
  Flame,
  Smartphone,
  Luggage,
  Shield,
  Box,
  Truck
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Laptop,
  Car,
  Apple,
  Coffee,
  Utensils,
  ShoppingCart,
  Shirt,
  Trophy,
  Gamepad2,
  Tv,
  Music,
  Plane,
  CreditCard,
  Share2,
  Radio,
  Sparkles,
  Crown,
  Globe,
  Building,
  Heart,
  Palette,
  Film,
  Book,
  Wrench,
  Zap,
  Award,
  Star,
  Smile,
  Compass,
  Tag,
  Layers,
  Fuel,
  Watch,
  Rocket,
  Flame,
  Smartphone,
  Luggage,
  Shield,
  Box,
  Truck
};

export const AVAILABLE_CATEGORY_ICONS = [
  'Laptop',
  'Car',
  'Apple',
  'Coffee',
  'Utensils',
  'ShoppingCart',
  'Shirt',
  'Trophy',
  'Gamepad2',
  'Tv',
  'Music',
  'Plane',
  'CreditCard',
  'Share2',
  'Radio',
  'Sparkles',
  'Crown',
  'Globe',
  'Building',
  'Heart',
  'Palette',
  'Film',
  'Book',
  'Wrench',
  'Zap',
  'Award',
  'Star',
  'Smile',
  'Compass',
  'Watch',
  'Rocket',
  'Flame',
  'Smartphone',
  'Shield',
  'Truck'
];

interface CategoryIconProps {
  iconName?: string;
  iconEmoji?: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName,
  iconEmoji,
  className = 'w-6 h-6'
}) => {
  if (iconEmoji) {
    return <span className="inline-block leading-none text-xl select-none">{iconEmoji}</span>;
  }

  const IconComponent = (iconName && ICON_MAP[iconName]) || Layers;
  return <IconComponent className={className} />;
};
