import { CategoryRecord } from '../types';

export const DEFAULT_CATEGORIES: CategoryRecord[] = [
  { categoryId: 'tech', name: 'Technology', description: 'Tech giants, computing, devices, and software', iconName: 'Laptop', color: 'from-blue-600 to-cyan-500', sortOrder: 1, active: true, defaultDifficulty: 'Easy' },
  { categoryId: 'cars', name: 'Cars & Automotive', description: 'Car manufacturers, motorcycles and motorsport', iconName: 'Car', color: 'from-red-600 to-amber-500', sortOrder: 2, active: true, defaultDifficulty: 'Medium' },
  { categoryId: 'food', name: 'Food & Groceries', description: 'Snacks, packaged food, pantry items and cereals', iconName: 'Apple', color: 'from-green-600 to-emerald-400', sortOrder: 3, active: true, defaultDifficulty: 'Easy' },
  { categoryId: 'drinks', name: 'Drinks & Beverages', description: 'Sodas, juices, energy drinks, tea and coffee', iconName: 'Coffee', color: 'from-amber-600 to-yellow-400', sortOrder: 4, active: true, defaultDifficulty: 'Easy' },
  { categoryId: 'fast_food', name: 'Fast Food & Restaurants', description: 'Burger joints, pizza, diners, and chains', iconName: 'Utensils', color: 'from-orange-600 to-red-500', sortOrder: 5, active: true, defaultDifficulty: 'Easy' },
  { categoryId: 'supermarkets', name: 'Supermarkets & Retail', description: 'Hypermarkets, department stores and grocers', iconName: 'ShoppingCart', color: 'from-indigo-600 to-blue-400', sortOrder: 6, active: true, defaultDifficulty: 'Medium' },
  { categoryId: 'fashion', name: 'Fashion & Apparel', description: 'Clothing, luxury labels, sportswear and footwear', iconName: 'Shirt', color: 'from-pink-600 to-rose-400', sortOrder: 7, active: true, defaultDifficulty: 'Medium' },
  { categoryId: 'sports', name: 'Sports & Fitness', description: 'Sporting goods, leagues, clubs and gym brands', iconName: 'Trophy', color: 'from-emerald-600 to-teal-400', sortOrder: 8, active: true, defaultDifficulty: 'Medium' },
  { categoryId: 'gaming', name: 'Gaming & Entertainment', description: 'Consoles, game publishers, toys and studios', iconName: 'Gamepad2', color: 'from-purple-600 to-indigo-500', sortOrder: 9, active: true, defaultDifficulty: 'Easy' },
  { categoryId: 'streaming', name: 'Movies, TV & Media', description: 'Streaming networks, film studios and television', iconName: 'Tv', color: 'from-violet-600 to-fuchsia-500', sortOrder: 10, active: true, defaultDifficulty: 'Easy' },
  { categoryId: 'music', name: 'Music & Audio', description: 'Audio equipment, music apps and instruments', iconName: 'Music', color: 'from-rose-600 to-pink-500', sortOrder: 11, active: true, defaultDifficulty: 'Medium' },
  { categoryId: 'travel', name: 'Airlines & Travel', description: 'Airlines, booking sites, luggage and hotels', iconName: 'Plane', color: 'from-sky-600 to-blue-500', sortOrder: 12, active: true, defaultDifficulty: 'Medium' },
  { categoryId: 'finance', name: 'Banks & Finance', description: 'Credit cards, banking, payment apps and insurers', iconName: 'CreditCard', color: 'from-slate-700 to-slate-900', sortOrder: 13, active: true, defaultDifficulty: 'Hard' },
  { categoryId: 'social', name: 'Social Media & Apps', description: 'Social networks, chat apps and web services', iconName: 'Share2', color: 'from-cyan-600 to-blue-600', sortOrder: 14, active: true, defaultDifficulty: 'Easy' },
  { categoryId: 'telecom', name: 'Telecommunications', description: 'Mobile carriers, broadband and network providers', iconName: 'Radio', color: 'from-teal-600 to-emerald-500', sortOrder: 15, active: true, defaultDifficulty: 'Hard' },
  { categoryId: 'beauty', name: 'Beauty & Personal Care', description: 'Skincare, cosmetics, haircare and toiletries', iconName: 'Sparkles', color: 'from-fuchsia-600 to-pink-400', sortOrder: 16, active: true, defaultDifficulty: 'Medium' },
  { categoryId: 'uk_brands', name: 'UK & British Brands', description: 'Iconic British heritage, high-street and food', iconName: 'Crown', color: 'from-blue-700 to-red-600', sortOrder: 17, active: true, defaultDifficulty: 'Medium' },
  { categoryId: 'global', name: 'Global & Conglomerates', description: 'Industrial, consumer goods and global conglomerates', iconName: 'Globe', color: 'from-emerald-700 to-cyan-600', sortOrder: 18, active: true, defaultDifficulty: 'Hard' }
];
