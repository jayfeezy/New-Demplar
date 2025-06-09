import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for access control
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("readonly"), // "master" or "readonly"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Characters table
export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  playerName: text("player_name").notNull(),
  className: text("class_name").notNull(),
  faction: text("faction"),
  backstory: text("backstory"),
  avatarUrl: text("avatar_url"), // Player card image URL
  level: integer("level").notNull().default(1),
  currentXP: integer("current_xp").notNull().default(0),
  nextLevelXP: integer("next_level_xp").notNull().default(1000),
  gold: integer("gold").notNull().default(0),
  // Core stats (percentage-based)
  strength: integer("strength").notNull().default(0),
  dexterity: integer("dexterity").notNull().default(0),
  intelligence: integer("intelligence").notNull().default(0),
  wisdom: integer("wisdom").notNull().default(0),
  constitution: integer("constitution").notNull().default(0),
  charisma: integer("charisma").notNull().default(0),
  stealth: integer("stealth").notNull().default(0),
  intimidation: integer("intimidation").notNull().default(0),
  persuasion: integer("persuasion").notNull().default(0),
  luck: integer("luck").notNull().default(0),
  // Custom stats as JSON (percentage-based)
  customStats: jsonb("custom_stats").$type<Record<string, number>>().default({}),
  // Power and Lore bars (1-1000)
  powerLevel: integer("power_level").notNull().default(1),
  loreLevel: integer("lore_level").notNull().default(1),
  // Arena ranking
  arenaRanking: text("arena_ranking").notNull().default("N/A"),
  // Duelist system
  duelistRank: text("duelist_rank"),
  duelistPoints: integer("duelist_points").notNull().default(0),
  // Weapon and abilities
  weapon: jsonb("weapon").$type<{
    name: string;
    description: string;
    effects: string[];
    bonusStats?: string;
  }>(),
  supportSkill: jsonb("support_skill").$type<{
    name: string;
    level: string;
    description: string;
  }>(),
  abilities: jsonb("abilities").$type<Array<{
    name: string;
    description: string;
    effects: string[];
  }>>().default([]),
  traits: jsonb("traits").$type<string[]>().default([]),
  // Skills and dialogue
  skills: jsonb("skills").$type<Record<string, string>>().default({}),
  // Event items and quest items
  eventItems: jsonb("event_items").$type<Array<{
    name: string;
    quantity: number;
    description?: string;
  }>>().default([]),
  questItems: jsonb("quest_items").$type<Array<{
    name: string;
    description: string;
    source: string;
  }>>().default([]),
  // Active quests
  activeQuests: jsonb("active_quests").$type<Array<{
    name: string;
    description: string;
    location?: string;
    questGiver?: string;
  }>>().default([]),
  // Status effects and buffs
  statusEffects: jsonb("status_effects").$type<Array<{
    name: string;
    description: string;
    duration?: string;
    effects: string[];
  }>>().default([]),
  // Lore and exploration
  loreEntries: jsonb("lore_entries").$type<Array<{
    location: string;
    events: string[];
    npcsEncountered?: string[];
    battles?: Array<{
      enemy: string;
      result: "Won" | "Lost" | "Fled";
      description?: string;
    }>;
  }>>().default([]),
  // Notoriety/Alignment
  notoriety: text("notoriety").notNull().default("unknown"),
  // Inventory as JSON
  equipment: jsonb("equipment").$type<InventoryItem[]>().default([]),
  inventory: jsonb("inventory").$type<InventoryItem[]>().default([]),
  // Notes
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  lastActive: text("last_active").notNull(),
});

// Session logs table
export const sessionLogs = pgTable("session_logs", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  xpGained: integer("xp_gained").notNull().default(0),
  duration: text("duration"),
  tags: jsonb("tags").$type<string[]>().default([]),
  sessionDate: text("session_date").notNull(),
  createdAt: text("created_at").notNull(),
});

// Types for inventory items
export type InventoryItem = {
  id: string;
  name: string;
  type: "weapon" | "armor" | "consumable" | "quest" | "misc";
  quantity: number;
  description?: string;
  equipped?: boolean;
  rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary";
  effects?: string;
  // Weapon-specific fields
  mainStat?: string; // For weapons: "Strength", "Intelligence", etc.
  bonusStats?: string; // Additional stat bonuses
  extraEffects?: string; // Special weapon effects
  // Armor-specific fields
  defenseStat?: string; // For armor: armor value or defense type
};

// Character insert schema
export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  createdAt: true,
  lastActive: true,
});

// Session log insert schema
export const insertSessionLogSchema = createInsertSchema(sessionLogs).omit({
  id: true,
  createdAt: true,
});

// Update schemas
export const updateCharacterSchema = insertCharacterSchema.partial();
export const updateSessionLogSchema = insertSessionLogSchema.partial();

// Types
export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type UpdateCharacter = z.infer<typeof updateCharacterSchema>;

export type SessionLog = typeof sessionLogs.$inferSelect;
export type InsertSessionLog = z.infer<typeof insertSessionLogSchema>;
export type UpdateSessionLog = z.infer<typeof updateSessionLogSchema>;

// User types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
