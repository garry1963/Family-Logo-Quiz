// src/db/seed.ts
import { db } from './index.ts';
import { categories, logos, levels } from './schema.ts';
import { DEFAULT_CATEGORIES } from '../data/defaultCategories.ts';
import { DEFAULT_LOGOS } from '../data/defaultLogos.ts';
import { DEFAULT_LEVELS } from '../data/defaultLevels.ts';

export async function seedInitialDatabase() {
  try {
    console.log('Checking database seed status...');
    
    // Seed Categories
    for (const cat of DEFAULT_CATEGORIES) {
      await db.insert(categories)
        .values({
          categoryId: cat.categoryId,
          name: cat.name,
          description: cat.description || '',
          iconName: cat.iconName || 'Tag',
          iconEmoji: cat.iconEmoji || null,
          color: cat.color || 'from-blue-600 to-cyan-500',
          sortOrder: cat.sortOrder || 0,
          active: cat.active ?? true,
          defaultDifficulty: cat.defaultDifficulty || 'Easy',
        })
        .onConflictDoNothing();
    }

    // Seed Levels
    for (const lvl of DEFAULT_LEVELS) {
      await db.insert(levels)
        .values({
          levelId: lvl.levelId,
          levelNumber: lvl.levelNumber,
          name: lvl.name,
          difficulty: lvl.difficulty || 'Easy',
          unlockRequirement: lvl.unlockRequirement,
          active: lvl.active ?? true,
        })
        .onConflictDoNothing();
    }

    // Seed Logos
    for (const logo of DEFAULT_LOGOS) {
      await db.insert(logos)
        .values({
          logoId: logo.logoId,
          brandName: logo.brandName,
          acceptedAnswers: logo.acceptedAnswers || [logo.brandName],
          alternativeSpellings: logo.alternativeSpellings || [],
          categoryId: logo.categoryId,
          subCategory: logo.subCategory || null,
          difficulty: logo.difficulty || 'Easy',
          levelNumber: logo.levelNumber || 1,
          imageSvg: logo.imageSvg || null,
          imageUrl: logo.imageUrl || null,
          historicImageUrl: logo.historicImageUrl || null,
          historicImageSvg: logo.historicImageSvg || null,
          historicEra: logo.historicEra || null,
          minimalistImageSvg: logo.minimalistImageSvg || null,
          colourChoices: logo.colourChoices || null,
          slogan: logo.slogan || null,
          country: logo.country || 'Global',
          industry: logo.industry || 'General',
          foundedYear: logo.foundedYear || 1990,
          description: logo.description || '',
          interestingFact: logo.interestingFact || '',
          website: logo.website || null,
          active: logo.active ?? true,
          gameModes: logo.gameModes || ['classic'],
        })
        .onConflictDoNothing();
    }

    console.log('Database initial seed complete!');
  } catch (err) {
    console.error('Error during initial database seed:', err);
  }
}
