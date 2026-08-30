import { LevelRecord, Difficulty } from '../types';

export function generate52Levels(): LevelRecord[] {
  const levels: LevelRecord[] = [];
  
  const levelThemes = [
    "Everyday Basics", "Supermarket Favourites", "Tech Pioneers", "Fast Food Classics",
    "Car Hall of Fame", "Sweet Treats & Candy", "Sporting Legends", "Global Retailers",
    "Social & Web Giants", "Breakfast Brands", "Beverage Icons", "High-Street Fashion",
    "Household & Cleaning", "Aviation & Airways", "Gaming Legends", "Cinema & Cartoons",
    "Luxury & Designer", "Bank & Payment Systems", "Snack Attack", "Motorway Stops",
    "Audio & Gadgets", "British Heritage", "European Giants", "American Staples",
    "Toy Box Treasures", "Pet Care & Animals", "Footwear & Trainers", "Coffee & Cafes",
    "Ice Cream & Desserts", "Stationery & Office", "DIY & Home Improvement", "Cosmetics & Glam",
    "Pharma & Wellness", "Streaming & Viral", "Telecom & Carriers", "Car Makers Tier 2",
    "Vintage Classics", "Supercars & Exotics", "Bookstores & Media", "Pizza & Pasta Chains",
    "Chocolate Craving", "Energy & Oil Titans", "Department Stores", "Airlines Global",
    "Board Games & Toys", "Kitchen & Appliances", "Watchmakers & Time", "Hardware & Tools",
    "Boutique & Specialty", "Master Brands Tier 1", "The Grand Challenge", "Logo Grandmaster"
  ];

  for (let i = 1; i <= 52; i++) {
    let diff: Difficulty = 'Easy';
    if (i > 10) diff = 'Medium';
    if (i > 25) diff = 'Hard';
    if (i > 40) diff = 'Expert';
    if (i > 48) diff = 'Nightmare';

    // Unlock requirement: complete at least (i-1) * 3 logos or 75% of previous
    const requiredLogos = i === 1 ? 0 : Math.max(3, (i - 1) * 3);

    levels.push({
      levelId: `level-${i}`,
      levelNumber: i,
      name: levelThemes[i - 1] || `Level ${i}`,
      difficulty: diff,
      unlockRequirement: {
        requiredLogosSolved: requiredLogos,
        requiredPercentage: 60,
        previousLevelCompleted: i > 1
      },
      active: true
    });
  }

  return levels;
}

export const DEFAULT_LEVELS = generate52Levels();
