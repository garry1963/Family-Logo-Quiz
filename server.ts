import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import {
  users,
  categories,
  logos,
  levels,
  profiles,
  puzzleProgress,
  profileFavourites,
  userAchievements,
  challengeResults,
  appSettings
} from './src/db/schema.ts';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth, optionalAuth, AuthRequest } from './src/middleware/auth.ts';
import { seedInitialDatabase } from './src/db/seed.ts';

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Seed DB on startup if needed
  seedInitialDatabase().catch(err => console.error('Seed error:', err));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // User auth sync / registration
  app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const existing = await db.select().from(users).where(eq(users.uid, user.uid)).limit(1);

      let dbUser;
      if (existing.length > 0) {
        const updated = await db.update(users)
          .set({
            email: user.email || existing[0].email,
            displayName: user.name || existing[0].displayName,
            photoUrl: user.picture || existing[0].photoUrl,
            lastLoginAt: new Date()
          })
          .where(eq(users.uid, user.uid))
          .returning();
        dbUser = updated[0];
      } else {
        const inserted = await db.insert(users)
          .values({
            uid: user.uid,
            email: user.email || 'user@example.com',
            displayName: user.name || 'Player',
            photoUrl: user.picture || null,
            createdAt: new Date(),
            lastLoginAt: new Date()
          })
          .returning();
        dbUser = inserted[0];
      }

      // Check if user has profiles; if not, create default profile
      const userProfiles = await db.select().from(profiles).where(eq(profiles.userId, user.uid));
      if (userProfiles.length === 0) {
        await db.insert(profiles).values({
          profileId: `profile-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          userId: user.uid,
          displayName: user.name || 'Primary Profile',
          avatar: '👨‍💼',
          difficultyPreference: 'Medium',
          hintBalance: 25,
          gamePoints: 0
        });
      }

      res.json({ success: true, user: dbUser });
    } catch (err) {
      console.error('Auth sync failed:', err);
      res.status(500).json({ error: 'Failed to sync user data' });
    }
  });

  // --- LOGOS & CONTENT ---
  app.get('/api/logos', async (req, res) => {
    try {
      const allLogos = await db.select().from(logos).orderBy(logos.levelNumber);
      res.json(allLogos);
    } catch (err) {
      console.error('Fetch logos failed:', err);
      res.status(500).json({ error: 'Failed to fetch logos' });
    }
  });

  app.post('/api/logos', requireAuth, async (req: AuthRequest, res) => {
    try {
      const logoData = req.body;
      const existing = await db.select().from(logos).where(eq(logos.logoId, logoData.logoId)).limit(1);

      if (existing.length > 0) {
        const updated = await db.update(logos)
          .set({
            ...logoData,
            updatedAt: new Date()
          })
          .where(eq(logos.logoId, logoData.logoId))
          .returning();
        res.json(updated[0]);
      } else {
        const inserted = await db.insert(logos)
          .values({
            ...logoData,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
        res.json(inserted[0]);
      }
    } catch (err) {
      console.error('Save logo error:', err);
      res.status(500).json({ error: 'Failed to save logo' });
    }
  });

  app.delete('/api/logos/:logoId', requireAuth, async (req: AuthRequest, res) => {
    try {
      await db.delete(logos).where(eq(logos.logoId, req.params.logoId));
      res.json({ success: true });
    } catch (err) {
      console.error('Delete logo error:', err);
      res.status(500).json({ error: 'Failed to delete logo' });
    }
  });

  // --- CATEGORIES ---
  app.get('/api/categories', async (req, res) => {
    try {
      const allCategories = await db.select().from(categories).orderBy(categories.sortOrder);
      res.json(allCategories);
    } catch (err) {
      console.error('Fetch categories failed:', err);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  app.post('/api/categories', requireAuth, async (req: AuthRequest, res) => {
    try {
      const catData = req.body;
      const existing = await db.select().from(categories).where(eq(categories.categoryId, catData.categoryId)).limit(1);

      if (existing.length > 0) {
        const updated = await db.update(categories)
          .set({
            ...catData,
            updatedAt: new Date()
          })
          .where(eq(categories.categoryId, catData.categoryId))
          .returning();
        res.json(updated[0]);
      } else {
        const inserted = await db.insert(categories)
          .values({
            ...catData,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
        res.json(inserted[0]);
      }
    } catch (err) {
      console.error('Save category error:', err);
      res.status(500).json({ error: 'Failed to save category' });
    }
  });

  app.delete('/api/categories/:categoryId', requireAuth, async (req: AuthRequest, res) => {
    try {
      await db.delete(categories).where(eq(categories.categoryId, req.params.categoryId));
      res.json({ success: true });
    } catch (err) {
      console.error('Delete category error:', err);
      res.status(500).json({ error: 'Failed to delete category' });
    }
  });

  // --- LEVELS ---
  app.get('/api/levels', async (req, res) => {
    try {
      const allLevels = await db.select().from(levels).orderBy(levels.levelNumber);
      res.json(allLevels);
    } catch (err) {
      console.error('Fetch levels failed:', err);
      res.status(500).json({ error: 'Failed to fetch levels' });
    }
  });

  app.post('/api/levels', requireAuth, async (req: AuthRequest, res) => {
    try {
      const lvlData = req.body;
      const existing = await db.select().from(levels).where(eq(levels.levelId, lvlData.levelId)).limit(1);

      if (existing.length > 0) {
        const updated = await db.update(levels)
          .set(lvlData)
          .where(eq(levels.levelId, lvlData.levelId))
          .returning();
        res.json(updated[0]);
      } else {
        const inserted = await db.insert(levels)
          .values(lvlData)
          .returning();
        res.json(inserted[0]);
      }
    } catch (err) {
      console.error('Save level error:', err);
      res.status(500).json({ error: 'Failed to save level' });
    }
  });

  // --- PROFILES & GAMEPLAY PROGRESS ---
  app.get('/api/profiles', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const userProfiles = await db.select().from(profiles).where(eq(profiles.userId, user.uid));
      res.json(userProfiles);
    } catch (err) {
      console.error('Fetch profiles error:', err);
      res.status(500).json({ error: 'Failed to fetch profiles' });
    }
  });

  app.post('/api/profiles', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const p = req.body;
      const profileId = p.profileId || `profile-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      
      const inserted = await db.insert(profiles).values({
        profileId,
        userId: user.uid,
        displayName: p.displayName || 'Player',
        avatar: p.avatar || '👤',
        difficultyPreference: p.difficultyPreference || 'Medium',
        isChildFriendly: p.isChildFriendly ?? false,
        unlimitedHints: p.unlimitedHints ?? false,
        noTimer: p.noTimer ?? false,
        largeText: p.largeText ?? false,
        reducedMotion: p.reducedMotion ?? false,
        easyModeOnly: p.easyModeOnly ?? false,
        hintBalance: p.hintBalance ?? (p.unlimitedHints ? 999 : 25),
        gamePoints: p.gamePoints ?? 0,
        createdAt: new Date(),
        lastPlayed: new Date()
      }).returning();

      res.json(inserted[0]);
    } catch (err) {
      console.error('Create profile error:', err);
      res.status(500).json({ error: 'Failed to create profile' });
    }
  });

  app.put('/api/profiles/:profileId', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const pId = req.params.profileId;
      const updates = req.body;

      const updated = await db.update(profiles)
        .set({
          ...updates,
          lastPlayed: new Date()
        })
        .where(and(eq(profiles.profileId, pId), eq(profiles.userId, user.uid)))
        .returning();

      res.json(updated[0] || null);
    } catch (err) {
      console.error('Update profile error:', err);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  app.delete('/api/profiles/:profileId', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const pId = req.params.profileId;
      await db.delete(profiles).where(and(eq(profiles.profileId, pId), eq(profiles.userId, user.uid)));
      res.json({ success: true });
    } catch (err) {
      console.error('Delete profile error:', err);
      res.status(500).json({ error: 'Failed to delete profile' });
    }
  });

  // --- PROGRESS ---
  app.get('/api/progress/:profileId', requireAuth, async (req: AuthRequest, res) => {
    try {
      const pId = req.params.profileId;
      const prog = await db.select().from(puzzleProgress).where(eq(puzzleProgress.profileId, pId));
      res.json(prog);
    } catch (err) {
      console.error('Fetch progress error:', err);
      res.status(500).json({ error: 'Failed to fetch progress' });
    }
  });

  app.post('/api/progress', requireAuth, async (req: AuthRequest, res) => {
    try {
      const data = req.body;
      const { profileId, logoId, solved, attempts, hintsUsed, hintsRevealedIndices, lettersRemoved, categoryClueShown, gameMode } = data;

      const existing = await db.select().from(puzzleProgress)
        .where(and(eq(puzzleProgress.profileId, profileId), eq(puzzleProgress.logoId, logoId)))
        .limit(1);

      let record;
      if (existing.length > 0) {
        const cur = existing[0];
        const isNowSolved = cur.solved || solved;
        const updated = await db.update(puzzleProgress)
          .set({
            solved: isNowSolved,
            attempts: (cur.attempts || 0) + (attempts || 1),
            hintsUsed: Math.max(cur.hintsUsed, hintsUsed || 0),
            hintsRevealedIndices: Array.from(new Set([...(cur.hintsRevealedIndices || []), ...(hintsRevealedIndices || [])])),
            lettersRemoved: Array.from(new Set([...(cur.lettersRemoved || []), ...(lettersRemoved || [])])),
            categoryClueShown: cur.categoryClueShown || categoryClueShown || false,
            solvedAt: isNowSolved && !cur.solved ? new Date() : cur.solvedAt,
            gameMode: gameMode || cur.gameMode,
            updatedAt: new Date()
          })
          .where(eq(puzzleProgress.id, cur.id))
          .returning();
        record = updated[0];
      } else {
        const inserted = await db.insert(puzzleProgress).values({
          profileId,
          logoId,
          solved: solved || false,
          attempts: attempts || 1,
          hintsUsed: hintsUsed || 0,
          hintsRevealedIndices: hintsRevealedIndices || [],
          lettersRemoved: lettersRemoved || [],
          categoryClueShown: categoryClueShown || false,
          solvedAt: solved ? new Date() : null,
          gameMode: gameMode || 'classic',
          updatedAt: new Date()
        }).returning();
        record = inserted[0];
      }

      // Update points and hint balance if newly solved
      if (solved && (!existing.length || !existing[0].solved)) {
        const curProf = await db.select().from(profiles).where(eq(profiles.profileId, profileId)).limit(1);
        if (curProf.length > 0) {
          await db.update(profiles)
            .set({
              gamePoints: curProf[0].gamePoints + 10,
              hintBalance: curProf[0].hintBalance + 1
            })
            .where(eq(profiles.profileId, profileId));
        }
      }

      res.json(record);
    } catch (err) {
      console.error('Record progress error:', err);
      res.status(500).json({ error: 'Failed to record progress' });
    }
  });

  // --- FAVOURITES ---
  app.get('/api/favourites/:profileId', requireAuth, async (req: AuthRequest, res) => {
    try {
      const favs = await db.select().from(profileFavourites).where(eq(profileFavourites.profileId, req.params.profileId));
      res.json(favs.map(f => f.logoId));
    } catch (err) {
      console.error('Fetch favourites error:', err);
      res.status(500).json({ error: 'Failed to fetch favourites' });
    }
  });

  app.post('/api/favourites/toggle', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { profileId, logoId } = req.body;
      const existing = await db.select().from(profileFavourites)
        .where(and(eq(profileFavourites.profileId, profileId), eq(profileFavourites.logoId, logoId)))
        .limit(1);

      if (existing.length > 0) {
        await db.delete(profileFavourites).where(eq(profileFavourites.id, existing[0].id));
        res.json({ isFavourite: false });
      } else {
        await db.insert(profileFavourites).values({ profileId, logoId, createdAt: new Date() });
        res.json({ isFavourite: true });
      }
    } catch (err) {
      console.error('Toggle favourite error:', err);
      res.status(500).json({ error: 'Failed to toggle favourite' });
    }
  });

  // --- ACHIEVEMENTS ---
  app.get('/api/achievements/:profileId', requireAuth, async (req: AuthRequest, res) => {
    try {
      const list = await db.select().from(userAchievements).where(eq(userAchievements.profileId, req.params.profileId));
      const map: Record<string, string> = {};
      list.forEach(item => {
        map[item.achievementId] = item.unlockedAt.toISOString();
      });
      res.json(map);
    } catch (err) {
      console.error('Fetch achievements error:', err);
      res.status(500).json({ error: 'Failed to fetch achievements' });
    }
  });

  // --- DAILY & WEEKLY RESULTS ---
  app.get('/api/challenges/:profileId', requireAuth, async (req: AuthRequest, res) => {
    try {
      const results = await db.select().from(challengeResults).where(eq(challengeResults.profileId, req.params.profileId));
      res.json(results);
    } catch (err) {
      console.error('Fetch challenge results error:', err);
      res.status(500).json({ error: 'Failed to fetch challenge results' });
    }
  });

  app.post('/api/challenges', requireAuth, async (req: AuthRequest, res) => {
    try {
      const resultData = req.body;
      const inserted = await db.insert(challengeResults).values({
        ...resultData,
        completedAt: new Date()
      }).returning();

      // Bonus points/hints
      const curProf = await db.select().from(profiles).where(eq(profiles.profileId, resultData.profileId)).limit(1);
      if (curProf.length > 0) {
        const bonusPts = resultData.challengeType === 'weekly' ? 200 : 50;
        const bonusHints = resultData.challengeType === 'weekly' ? 10 : 3;
        await db.update(profiles).set({
          gamePoints: curProf[0].gamePoints + bonusPts,
          hintBalance: curProf[0].hintBalance + bonusHints
        }).where(eq(profiles.profileId, resultData.profileId));
      }

      res.json(inserted[0]);
    } catch (err) {
      console.error('Save challenge result error:', err);
      res.status(500).json({ error: 'Failed to save challenge result' });
    }
  });

  // --- SETTINGS ---
  app.get('/api/settings', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.uid || 'guest';
      const settingRow = await db.select().from(appSettings).where(eq(appSettings.userId, userId)).limit(1);
      if (settingRow.length > 0) {
        res.json({ settings: settingRow[0].settings, adminPin: settingRow[0].adminPin });
      } else {
        res.json(null);
      }
    } catch (err) {
      console.error('Fetch settings error:', err);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  app.post('/api/settings', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.uid || 'guest';
      const { settings, adminPin } = req.body;
      const existing = await db.select().from(appSettings).where(eq(appSettings.userId, userId)).limit(1);

      if (existing.length > 0) {
        const updated = await db.update(appSettings).set({
          settings: settings ?? existing[0].settings,
          adminPin: adminPin ?? existing[0].adminPin,
          updatedAt: new Date()
        }).where(eq(appSettings.userId, userId)).returning();
        res.json(updated[0]);
      } else {
        const inserted = await db.insert(appSettings).values({
          userId,
          settings: settings || {},
          adminPin: adminPin || '1234',
          updatedAt: new Date()
        }).returning();
        res.json(inserted[0]);
      }
    } catch (err) {
      console.error('Save settings error:', err);
      res.status(500).json({ error: 'Failed to save settings' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
