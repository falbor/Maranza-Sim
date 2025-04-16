import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (core login table)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Characters table (player character)
export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  style: integer("style").notNull().default(50),
  personality: text("personality").notNull(),
  look: text("look").notNull(),
  money: integer("money").notNull().default(250),
  reputation: integer("reputation").notNull().default(50),
  energy: integer("energy").notNull().default(100),
  respect: integer("respect").notNull().default(30),
  avatarId: integer("avatar_id").notNull().default(1),
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
});

// Items table (inventory)
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  effect: jsonb("effect").notNull(),
  price: integer("price").notNull(),
  image: text("image").notNull(),
  unlockDay: integer("unlock_day"),
  category: text("category").notNull(),
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
});

// Character items (association table)
export const characterItems = pgTable("character_items", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").notNull().references(() => characters.id),
  itemId: integer("item_id").notNull().references(() => items.id),
  acquired: boolean("acquired").notNull().default(false),
  acquiredDay: integer("acquired_day"),
});

export const insertCharacterItemSchema = createInsertSchema(characterItems).omit({
  id: true,
});

// Skills table
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
});

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
});

// Character skills (association table)
export const characterSkills = pgTable("character_skills", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").notNull().references(() => characters.id),
  skillId: integer("skill_id").notNull().references(() => skills.id),
  level: integer("level").notNull().default(1),
  progress: integer("progress").notNull().default(0),
  maxLevel: integer("max_level").notNull().default(100),
});

export const insertCharacterSkillSchema = createInsertSchema(characterSkills).omit({
  id: true,
});

// Contacts table (social connections)
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").notNull().references(() => characters.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  respect: text("respect").notNull(),
  meetDay: integer("meet_day").notNull(),
  avatarInitials: text("avatar_initials").notNull(),
  avatarColor: text("avatar_color").notNull(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
});

// Activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  duration: integer("duration").notNull(),
  effects: jsonb("effects").notNull(),
  requirements: jsonb("requirements"),
  possibleOutcomes: jsonb("possible_outcomes").notNull(),
  unlockDay: integer("unlock_day"),
  category: text("category").notNull(),
  color: text("color").notNull(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
});

// Game state table
export const gameStates = pgTable("game_states", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  characterId: integer("character_id").references(() => characters.id),
  day: integer("day").notNull().default(1),
  time: text("time").notNull().default("08:00"),
  gameStarted: boolean("game_started").notNull().default(false),
  hoursLeft: integer("hours_left").notNull().default(16),
});

export const insertGameStateSchema = createInsertSchema(gameStates).omit({
  id: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;

export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;

export type CharacterItem = typeof characterItems.$inferSelect;
export type InsertCharacterItem = z.infer<typeof insertCharacterItemSchema>;

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;

export type CharacterSkill = typeof characterSkills.$inferSelect;
export type InsertCharacterSkill = z.infer<typeof insertCharacterSkillSchema>;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type GameState = typeof gameStates.$inferSelect;
export type InsertGameState = z.infer<typeof insertGameStateSchema>;

export interface User {
  id: number;
  username: string;
  password: string;
}

export interface InsertUser {
  username: string;
  password: string;
}

export interface Character {
  id: number;
  userId: number;
  name: string;
  style: number;
  personality: "audace" | "ribelle" | "carismatico";
  look: "casual" | "sportivo" | "firmato";
  money: number;
  reputation: number;
  energy: number;
  respect: number;
  avatarId: number;
}

export interface InsertCharacter {
  userId: number;
  name: string;
  personality: "audace" | "ribelle" | "carismatico";
  look: "casual" | "sportivo" | "firmato";
  style?: number;
  money?: number;
  reputation?: number;
  energy?: number;
  respect?: number;
  avatarId?: number;
}

export interface ItemEffect {
  type: "style" | "money" | "reputation" | "energy" | "respect";
  value: number;
  isDebuff?: boolean;
}

export interface Item {
  id: number;
  name: string;
  description: string;
  effects: ItemEffect[];
  price: number;
  image: string;
  unlockDay?: number | null;
  category: "clothing" | "accessory" | "consumable" | "special";
  isInShop?: boolean;
  isBuyable?: boolean;
}

export interface InsertItem {
  name: string;
  description: string;
  effects: ItemEffect[];
  price: number;
  image: string;
  unlockDay?: number | null;
  category: "clothing" | "accessory" | "consumable" | "special";
  isInShop?: boolean;
  isBuyable?: boolean;
}

export interface CharacterItem {
  id: number;
  characterId: number;
  itemId: number;
  acquired: boolean;
  acquiredDay?: number | null;
}

export interface InsertCharacterItem {
  characterId: number;
  itemId: number;
  acquired?: boolean;
  acquiredDay?: number | null;
}

export interface Skill {
  id: number;
  name: string;
  description: string;
}

export interface InsertSkill {
  name: string;
  description: string;
}

export interface CharacterSkill {
  id: number;
  characterId: number;
  skillId: number;
  level: number;
  progress: number;
  maxLevel: number;
}

export interface InsertCharacterSkill {
  characterId: number;
  skillId: number;
  level?: number;
  progress?: number;
  maxLevel?: number;
}

export interface Contact {
  id: number;
  characterId: number;
  name: string;
  type: string;
  respect: "basso" | "medio" | "alto";
  meetDay: number;
  avatarInitials: string;
  avatarColor: string;
}

export interface InsertContact {
  characterId: number;
  name: string;
  type: string;
  respect: "basso" | "medio" | "alto";
  meetDay: number;
  avatarInitials: string;
  avatarColor: string;
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  image: string;
  duration: number;
  effects: {
    reputation?: number;
    money?: number;
    energy?: number;
    respect?: number;
    style?: number;
  };
  requirements?: {
    money?: number;
    energy?: number;
    reputation?: number;
    respect?: number;
    style?: number;
    items?: number[];
    skills?: { id: number; level: number }[];
  } | null;
  possibleOutcomes: string[];
  unlockDay?: number | null;
  category: string;
  color: string;
}

export interface InsertActivity {
  title: string;
  description: string;
  image: string;
  duration: number;
  effects: {
    reputation?: number;
    money?: number;
    energy?: number;
    respect?: number;
    style?: number;
  };
  requirements?: {
    money?: number;
    energy?: number;
    reputation?: number;
    respect?: number;
    style?: number;
    items?: number[];
    skills?: { id: number; level: number }[];
  } | null;
  possibleOutcomes: string[];
  unlockDay?: number | null;
  category: string;
  color: string;
}

export interface GameState {
  id: number;
  userId: number;
  characterId?: number | null;
  day: number;
  time: string;
  gameStarted: boolean;
  hoursLeft: number;
}

export interface InsertGameState {
  userId: number;
  characterId?: number | null;
  day?: number;
  time?: string;
  gameStarted?: boolean;
  hoursLeft?: number;
}

export interface ShopItem extends Item {
  isOwned: boolean;
}

export interface PurchaseItemRequest {
  itemId: number;
}

export interface PurchaseItemResponse {
  success: boolean;
  message: string;
  newMoney?: number;
  item?: Item;
}
