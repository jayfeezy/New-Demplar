import type { Character, InsertCharacter, UpdateCharacter, SessionLog, InsertSessionLog, UpdateSessionLog, User, InsertUser } from "@shared/schema";
import { users, characters, sessionLogs } from "@shared/schema";
import { db } from "./db";
import { eq, like, or, desc } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateUser(username: string, password: string): Promise<User | null>;
  initializeDefaultUser(): Promise<void>;
  
  // Character operations
  getCharacter(id: number): Promise<Character | undefined>;
  getCharacters(): Promise<Character[]>;
  getCharactersByPlayer(playerName: string): Promise<Character[]>;
  searchCharacters(query: string): Promise<Character[]>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: number, updates: UpdateCharacter): Promise<Character | undefined>;
  deleteCharacter(id: number): Promise<boolean>;
  
  // Session log operations
  getSessionLogs(characterId: number): Promise<SessionLog[]>;
  createSessionLog(sessionLog: InsertSessionLog): Promise<SessionLog>;
  updateSessionLog(id: number, updates: UpdateSessionLog): Promise<SessionLog | undefined>;
  deleteSessionLog(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async initializeDefaultUser(): Promise<void> {
    const existingUser = await this.getUserByUsername("master");
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash("password", 10);
      await db.insert(users).values({
        username: "master",
        passwordHash: hashedPassword,
        role: "master",
      });
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.passwordHash, 10);
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        passwordHash: hashedPassword,
      })
      .returning();
    return user;
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }

  // Character operations
  async getCharacter(id: number): Promise<Character | undefined> {
    const [character] = await db.select().from(characters).where(eq(characters.id, id));
    return character;
  }

  async getCharacters(): Promise<Character[]> {
    return await db.select().from(characters).orderBy(desc(characters.lastActive));
  }

  async getCharactersByPlayer(playerName: string): Promise<Character[]> {
    return await db
      .select()
      .from(characters)
      .where(eq(characters.playerName, playerName))
      .orderBy(desc(characters.lastActive));
  }

  async searchCharacters(query: string): Promise<Character[]> {
    const lowercaseQuery = `%${query.toLowerCase()}%`;
    return await db
      .select()
      .from(characters)
      .where(
        or(
          like(characters.name, lowercaseQuery),
          like(characters.playerName, lowercaseQuery),
          like(characters.className, lowercaseQuery),
          like(characters.faction, lowercaseQuery)
        )
      )
      .orderBy(desc(characters.lastActive));
  }

  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    const now = new Date().toISOString();
    
    const characterData = {
      name: insertCharacter.name,
      playerName: insertCharacter.playerName,
      className: insertCharacter.className,
      faction: insertCharacter.faction ?? null,
      backstory: insertCharacter.backstory ?? null,
      avatarUrl: insertCharacter.avatarUrl ?? null,
      level: insertCharacter.level ?? 1,
      currentXP: insertCharacter.currentXP ?? 0,
      nextLevelXP: insertCharacter.nextLevelXP ?? 1000,
      gold: insertCharacter.gold ?? 0,
      strength: insertCharacter.strength ?? 50,
      dexterity: insertCharacter.dexterity ?? 50,
      intelligence: insertCharacter.intelligence ?? 50,
      wisdom: insertCharacter.wisdom ?? 50,
      constitution: insertCharacter.constitution ?? 50,
      charisma: insertCharacter.charisma ?? 50,
      stealth: insertCharacter.stealth ?? 50,
      intimidation: insertCharacter.intimidation ?? 50,
      persuasion: insertCharacter.persuasion ?? 50,
      luck: insertCharacter.luck ?? 50,
      customStats: insertCharacter.customStats ?? {},
      powerLevel: insertCharacter.powerLevel ?? 1,
      loreLevel: insertCharacter.loreLevel ?? 1,
      arenaRanking: insertCharacter.arenaRanking ?? "N/A",
      notoriety: insertCharacter.notoriety ?? "unknown",
      inventory: insertCharacter.inventory ?? [],
      equipment: insertCharacter.equipment ?? [],
      notes: insertCharacter.notes ?? null,
      createdAt: now,
      lastActive: now,
    };

    try {
      const [character] = await db
        .insert(characters)
        .values(characterData as any)
        .returning();
      return character;
    } catch (error) {
      console.error('Character creation error:', error);
      throw new Error('Failed to create character');
    }
  }

  async updateCharacter(id: number, updates: UpdateCharacter): Promise<Character | undefined> {
    const updateData: any = { ...updates };
    delete updateData.id;
    delete updateData.createdAt;
    updateData.lastActive = new Date().toISOString();
    
    const [character] = await db
      .update(characters)
      .set(updateData)
      .where(eq(characters.id, id))
      .returning();
    return character;
  }

  async deleteCharacter(id: number): Promise<boolean> {
    // First delete related session logs
    await db.delete(sessionLogs).where(eq(sessionLogs.characterId, id));
    
    // Then delete the character
    const result = await db.delete(characters).where(eq(characters.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Session log operations
  async getSessionLogs(characterId: number): Promise<SessionLog[]> {
    return await db
      .select()
      .from(sessionLogs)
      .where(eq(sessionLogs.characterId, characterId))
      .orderBy(desc(sessionLogs.createdAt));
  }

  async createSessionLog(insertSessionLog: InsertSessionLog): Promise<SessionLog> {
    const sessionData = {
      characterId: insertSessionLog.characterId,
      title: insertSessionLog.title,
      description: insertSessionLog.description,
      sessionDate: insertSessionLog.sessionDate,
      xpGained: insertSessionLog.xpGained ?? 0,
      duration: insertSessionLog.duration ?? null,
      tags: insertSessionLog.tags ?? [],
      createdAt: new Date().toISOString(),
    };

    const [sessionLog] = await db
      .insert(sessionLogs)
      .values(sessionData as any)
      .returning();
    return sessionLog;
  }

  async updateSessionLog(id: number, updates: UpdateSessionLog): Promise<SessionLog | undefined> {
    const updateData: any = { ...updates };
    delete updateData.id;
    
    const [sessionLog] = await db
      .update(sessionLogs)
      .set(updateData)
      .where(eq(sessionLogs.id, id))
      .returning();
    return sessionLog;
  }

  async deleteSessionLog(id: number): Promise<boolean> {
    const result = await db.delete(sessionLogs).where(eq(sessionLogs.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export const storage = new DatabaseStorage();