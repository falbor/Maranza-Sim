import {
  User,
  InsertUser,
  Character,
  InsertCharacter,
  Item,
  InsertItem,
  Skill,
  InsertSkill,
  Contact,
  InsertContact,
  Activity,
  InsertActivity,
  CharacterItem,
  InsertCharacterItem,
  CharacterSkill,
  InsertCharacterSkill,
  GameState,
  InsertGameState,
  users,
  characters,
  items,
  characterItems,
  skills,
  characterSkills,
  contacts,
  activities,
  gameStates
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// Define the storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Character methods
  getCharacter(id: number): Promise<Character | undefined>;
  getCharacterByUserId(userId: number): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: number, updates: Partial<Character>): Promise<Character>;

  // Item methods
  getItems(): Promise<Item[]>;
  getItem(id: number): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  getCharacterItems(characterId: number): Promise<Item[]>;
  addItemToCharacter(characterItem: InsertCharacterItem): Promise<CharacterItem>;

  // Skill methods
  getSkills(): Promise<Skill[]>;
  getSkill(id: number): Promise<Skill | undefined>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  getCharacterSkills(characterId: number): Promise<(Skill & { level: number, progress: number, maxLevel: number })[]>;
  updateCharacterSkill(characterId: number, skillId: number, updates: Partial<CharacterSkill>): Promise<CharacterSkill>;
  addSkillToCharacter(characterSkill: InsertCharacterSkill): Promise<CharacterSkill>;

  // Contact methods
  getContacts(characterId: number): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;

  // Activity methods
  getActivities(): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  getAvailableActivities(day: number): Promise<Activity[]>;

  // Game state methods
  getGameState(userId: number): Promise<GameState | undefined>;
  createGameState(gameState: InsertGameState): Promise<GameState>;
  updateGameState(userId: number, updates: Partial<GameState>): Promise<GameState>;
  resetGameState(userId: number): Promise<void>;

  // Utility methods
  initializeDefaultData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private characters: Map<number, Character>;
  private items: Map<number, Item>;
  private characterItems: Map<number, CharacterItem>;
  private skills: Map<number, Skill>;
  private characterSkills: Map<number, CharacterSkill>;
  private contacts: Map<number, Contact>;
  private activities: Map<number, Activity>;
  private gameStates: Map<number, GameState>;
  
  private userId: number;
  private characterId: number;
  private itemId: number;
  private characterItemId: number;
  private skillId: number;
  private characterSkillId: number;
  private contactId: number;
  private activityId: number;
  private gameStateId: number;

  constructor() {
    this.users = new Map();
    this.characters = new Map();
    this.items = new Map();
    this.characterItems = new Map();
    this.skills = new Map();
    this.characterSkills = new Map();
    this.contacts = new Map();
    this.activities = new Map();
    this.gameStates = new Map();
    
    this.userId = 1;
    this.characterId = 1;
    this.itemId = 1;
    this.characterItemId = 1;
    this.skillId = 1;
    this.characterSkillId = 1;
    this.contactId = 1;
    this.activityId = 1;
    this.gameStateId = 1;
    
    // Initialize default data
    this.initializeDefaultData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Character methods
  async getCharacter(id: number): Promise<Character | undefined> {
    return this.characters.get(id);
  }

  async getCharacterByUserId(userId: number): Promise<Character | undefined> {
    return Array.from(this.characters.values()).find(
      (character) => character.userId === userId,
    );
  }

  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    const id = this.characterId++;
    const character: Character = { ...insertCharacter, id };
    this.characters.set(id, character);
    return character;
  }

  async updateCharacter(id: number, updates: Partial<Character>): Promise<Character> {
    const character = await this.getCharacter(id);
    if (!character) {
      throw new Error(`Character with id ${id} not found`);
    }
    
    const updatedCharacter = { ...character, ...updates };
    this.characters.set(id, updatedCharacter);
    return updatedCharacter;
  }

  // Item methods
  async getItems(): Promise<Item[]> {
    return Array.from(this.items.values());
  }

  async getItem(id: number): Promise<Item | undefined> {
    return this.items.get(id);
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    const id = this.itemId++;
    const item: Item = { ...insertItem, id };
    this.items.set(id, item);
    return item;
  }

  async getCharacterItems(characterId: number): Promise<Item[]> {
    const characterItemsArray = Array.from(this.characterItems.values())
      .filter(ci => ci.characterId === characterId && ci.acquired);
    
    const items: Item[] = [];
    for (const ci of characterItemsArray) {
      const item = await this.getItem(ci.itemId);
      if (item) {
        items.push(item);
      }
    }
    
    return items;
  }

  async addItemToCharacter(insertCharacterItem: InsertCharacterItem): Promise<CharacterItem> {
    const id = this.characterItemId++;
    const characterItem: CharacterItem = { ...insertCharacterItem, id };
    this.characterItems.set(id, characterItem);
    return characterItem;
  }

  // Skill methods
  async getSkills(): Promise<Skill[]> {
    return Array.from(this.skills.values());
  }

  async getSkill(id: number): Promise<Skill | undefined> {
    return this.skills.get(id);
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const id = this.skillId++;
    const skill: Skill = { ...insertSkill, id };
    this.skills.set(id, skill);
    return skill;
  }

  async getCharacterSkills(characterId: number): Promise<(Skill & { level: number, progress: number, maxLevel: number })[]> {
    const characterSkillsArray = Array.from(this.characterSkills.values())
      .filter(cs => cs.characterId === characterId);
    
    const enrichedSkills: (Skill & { level: number, progress: number, maxLevel: number })[] = [];
    
    for (const cs of characterSkillsArray) {
      const skill = await this.getSkill(cs.skillId);
      if (skill) {
        enrichedSkills.push({
          ...skill,
          level: cs.level,
          progress: cs.progress,
          maxLevel: cs.maxLevel
        });
      }
    }
    
    return enrichedSkills;
  }

  async updateCharacterSkill(characterId: number, skillId: number, updates: Partial<CharacterSkill>): Promise<CharacterSkill> {
    const characterSkill = Array.from(this.characterSkills.values())
      .find(cs => cs.characterId === characterId && cs.skillId === skillId);
    
    if (!characterSkill) {
      throw new Error(`CharacterSkill with characterId ${characterId} and skillId ${skillId} not found`);
    }
    
    const updatedCharacterSkill = { ...characterSkill, ...updates };
    this.characterSkills.set(characterSkill.id, updatedCharacterSkill);
    return updatedCharacterSkill;
  }

  async addSkillToCharacter(insertCharacterSkill: InsertCharacterSkill): Promise<CharacterSkill> {
    const id = this.characterSkillId++;
    const characterSkill: CharacterSkill = { ...insertCharacterSkill, id };
    this.characterSkills.set(id, characterSkill);
    return characterSkill;
  }

  // Contact methods
  async getContacts(characterId: number): Promise<Contact[]> {
    return Array.from(this.contacts.values())
      .filter(contact => contact.characterId === characterId);
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.contactId++;
    const contact: Contact = { ...insertContact, id };
    this.contacts.set(id, contact);
    return contact;
  }

  // Activity methods
  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const activity: Activity = { ...insertActivity, id };
    this.activities.set(id, activity);
    return activity;
  }

  async getAvailableActivities(day: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => !activity.unlockDay || activity.unlockDay <= day);
  }

  // Game state methods
  async getGameState(userId: number): Promise<GameState | undefined> {
    return Array.from(this.gameStates.values())
      .find(gs => gs.userId === userId);
  }

  async createGameState(insertGameState: InsertGameState): Promise<GameState> {
    const id = this.gameStateId++;
    const gameState: GameState = { ...insertGameState, id };
    this.gameStates.set(id, gameState);
    return gameState;
  }

  async updateGameState(userId: number, updates: Partial<GameState>): Promise<GameState> {
    const gameState = await this.getGameState(userId);
    if (!gameState) {
      throw new Error(`GameState for userId ${userId} not found`);
    }
    
    const updatedGameState = { ...gameState, ...updates };
    this.gameStates.set(gameState.id, updatedGameState);
    return updatedGameState;
  }

  async resetGameState(userId: number): Promise<void> {
    const gameState = await this.getGameState(userId);
    if (gameState) {
      // Delete character skills
      if (gameState.characterId) {
        for (const [id, characterSkill] of this.characterSkills.entries()) {
          if (characterSkill.characterId === gameState.characterId) {
            this.characterSkills.delete(id);
          }
        }
        
        // Delete character items
        for (const [id, characterItem] of this.characterItems.entries()) {
          if (characterItem.characterId === gameState.characterId) {
            this.characterItems.delete(id);
          }
        }
        
        // Delete contacts
        for (const [id, contact] of this.contacts.entries()) {
          if (contact.characterId === gameState.characterId) {
            this.contacts.delete(id);
          }
        }
        
        // Delete character
        this.characters.delete(gameState.characterId);
      }
      
      // Reset game state
      this.gameStates.set(gameState.id, {
        ...gameState,
        characterId: undefined,
        day: 1,
        time: "08:00",
        gameStarted: false,
        hoursLeft: 16
      });
    }
  }

  // Initialize default data
  async initializeDefaultData(): Promise<void> {
    // Create default user
    const user = await this.createUser({
      username: "player",
      password: "password"
    });
    
    // Create default game state
    await this.createGameState({
      userId: user.id,
      day: 1,
      time: "08:00",
      gameStarted: false,
      hoursLeft: 16
    });

    // Create default skills
    const styleSkill = await this.createSkill({
      name: "Stile nel Vestire",
      description: "Capacità di abbinare capi firmati e creare outfit da vero maranza"
    });
    
    const slangSkill = await this.createSkill({
      name: "Parlata Slang",
      description: "Abilità nel parlare usando il gergo maranza e abbreviazioni"
    });
    
    const negotiationSkill = await this.createSkill({
      name: "Contrattazione",
      description: "Capacità di ottenere sconti e affari vantaggiosi"
    });
    
    const danceSkill = await this.createSkill({
      name: "Ballo",
      description: "Abilità nelle mosse di danza tipiche del maranza"
    });
    
    const socialSkill = await this.createSkill({
      name: "Carisma Sociale",
      description: "Capacità di farsi nuovi amici e influenzare gli altri"
    });

    // Create default items
    await this.createItem({
      name: "Felpa Firmata",
      description: "Una felpa di marca perfetta per il tuo stile maranza",
      effect: { type: "style", value: 15 },
      price: 150,
      image: "hoodie",
      unlockDay: 2,
      category: "clothing"
    });
    
    await this.createItem({
      name: "Marsupio Griffato",
      description: "Un marsupio di marca da portare a tracolla",
      effect: { type: "style", value: 10 },
      price: 80,
      image: "bag",
      category: "accessory"
    });
    
    await this.createItem({
      name: "Cappellino con Visiera",
      description: "Un cappellino con logo ben visibile, indispensabile per un maranza",
      effect: { type: "style", value: 8 },
      price: 40,
      image: "cap",
      category: "accessory"
    });
    
    await this.createItem({
      name: "Tuta Sportiva",
      description: "Una tuta sportiva di marca, comoda e alla moda",
      effect: { type: "style", value: 12 },
      price: 120,
      image: "tracksuit",
      category: "clothing"
    });
    
    await this.createItem({
      name: "Scarpe Costose",
      description: "Scarpe sportive estremamente costose con design vistoso",
      effect: { type: "style", value: 20 },
      price: 250,
      image: "shoes",
      unlockDay: 4,
      category: "clothing"
    });
    
    await this.createItem({
      name: "Energy Drink",
      description: "Una bevanda energetica per ricaricarti",
      effect: { type: "energy", value: 25 },
      price: 3,
      image: "drink",
      category: "consumable"
    });

    // Create default activities
    await this.createActivity({
      title: "Giro in Piazza",
      description: "Fai un giro nella piazza principale per mostrare il tuo stile e incontrare altri maranza.",
      image: "plaza",
      duration: 1,
      effects: {
        reputation: 15,
        energy: -10
      },
      possibleOutcomes: [
        "Possibile incontro con altri maranza",
        "Potresti incontrare qualcuno di importante"
      ],
      category: "social",
      color: "primary"
    });
    
    await this.createActivity({
      title: "Shopping al Centro",
      description: "Vai al centro commerciale per acquistare nuovi vestiti di marca e accessori. Aumenta il tuo stile!",
      image: "mall",
      duration: 2,
      effects: {
        style: 20,
        money: -100,
        energy: -5
      },
      possibleOutcomes: [
        "Potresti trovare capi in saldo",
        "Potrebbe esserci una nuova collezione"
      ],
      category: "shopping",
      color: "secondary"
    });
    
    await this.createActivity({
      title: "Palestra",
      description: "Allenati in palestra per aumentare la tua forma fisica e guadagnare rispetto dagli altri maranza.",
      image: "gym",
      duration: 3,
      effects: {
        respect: 25,
        energy: -30
      },
      possibleOutcomes: [
        "Potresti incontrare un personal trainer",
        "Potresti impressionare qualcuno"
      ],
      category: "fitness",
      color: "accent"
    });
    
    await this.createActivity({
      title: "Serata in Discoteca",
      description: "Vai in discoteca per ballare, incontrare gente e mostrare le tue mosse migliori.",
      image: "club",
      duration: 5,
      effects: {
        reputation: 30,
        energy: -50,
        money: -50
      },
      possibleOutcomes: [
        "Potresti conoscere nuove persone",
        "Potresti metterti in mostra con le tue mosse di ballo"
      ],
      category: "nightlife",
      color: "info"
    });
    
    await this.createActivity({
      title: "Lavoretto Part-time",
      description: "Fai un piccolo lavoro per guadagnare un po' di soldi. Non molto maranza, ma necessario.",
      image: "work",
      duration: 4,
      effects: {
        money: 80,
        energy: -20,
        reputation: -5
      },
      possibleOutcomes: [
        "Potresti ricevere una mancia extra",
        "Potresti incontrare un collega interessante"
      ],
      category: "work",
      color: "primary"
    });
    
    await this.createActivity({
      title: "Riposo a Casa",
      description: "Resta a casa per recuperare energia. Un vero maranza sa quando ricaricarsi.",
      image: "home",
      duration: 2,
      effects: {
        energy: 40
      },
      possibleOutcomes: [
        "Recuperi completamente le forze",
        "Potresti avere idee per nuovi outfit"
      ],
      category: "rest",
      color: "secondary"
    });
    
    await this.createActivity({
      title: "Social Media",
      description: "Pubblica foto e video sui social media per aumentare la tua presenza online e reputazione.",
      image: "social",
      duration: 1,
      effects: {
        reputation: 10,
        energy: -5
      },
      possibleOutcomes: [
        "Potresti diventare virale",
        "Potresti ricevere molti like"
      ],
      category: "social",
      color: "info"
    });
    
    await this.createActivity({
      title: "Raduno di Auto Tuning",
      description: "Partecipa a un raduno di auto modificate. Un classico appuntamento per i maranza.",
      image: "cars",
      duration: 3,
      effects: {
        respect: 20,
        reputation: 15,
        energy: -15
      },
      unlockDay: 3,
      possibleOutcomes: [
        "Potresti conoscere altri appassionati",
        "Potresti vedere auto impressionanti"
      ],
      category: "entertainment",
      color: "accent"
    });
    
    await this.createActivity({
      title: "Sfida di Stile",
      description: "Partecipa a una sfida di stile con altri maranza. Mostra chi è il più alla moda!",
      image: "style",
      duration: 2,
      effects: {
        style: 30,
        reputation: 20,
        respect: 15,
        energy: -10
      },
      unlockDay: 5,
      possibleOutcomes: [
        "Potresti vincere un premio",
        "Potresti impressionare tutti con il tuo look"
      ],
      category: "competition",
      color: "primary"
    });
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    const [character] = await db.select().from(characters).where(eq(characters.id, id));
    return character || undefined;
  }

  async getCharacterByUserId(userId: number): Promise<Character | undefined> {
    const [character] = await db.select().from(characters).where(eq(characters.userId, userId));
    return character || undefined;
  }

  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    const [character] = await db
      .insert(characters)
      .values(insertCharacter)
      .returning();
    return character;
  }

  async updateCharacter(id: number, updates: Partial<Character>): Promise<Character> {
    const [updatedCharacter] = await db
      .update(characters)
      .set(updates)
      .where(eq(characters.id, id))
      .returning();
    
    if (!updatedCharacter) {
      throw new Error(`Character with id ${id} not found`);
    }
    
    return updatedCharacter;
  }

  async getItems(): Promise<Item[]> {
    return db.select().from(items);
  }

  async getItem(id: number): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item || undefined;
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    const [item] = await db
      .insert(items)
      .values(insertItem)
      .returning();
    return item;
  }

  async getCharacterItems(characterId: number): Promise<Item[]> {
    const result = await db
      .select({
        item: items
      })
      .from(characterItems)
      .innerJoin(items, eq(characterItems.itemId, items.id))
      .where(and(
        eq(characterItems.characterId, characterId),
        eq(characterItems.acquired, true)
      ));
    
    return result.map(r => r.item);
  }

  async addItemToCharacter(insertCharacterItem: InsertCharacterItem): Promise<CharacterItem> {
    const [characterItem] = await db
      .insert(characterItems)
      .values(insertCharacterItem)
      .returning();
    return characterItem;
  }

  async getSkills(): Promise<Skill[]> {
    return db.select().from(skills);
  }

  async getSkill(id: number): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));
    return skill || undefined;
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const [skill] = await db
      .insert(skills)
      .values(insertSkill)
      .returning();
    return skill;
  }

  async getCharacterSkills(characterId: number): Promise<(Skill & { level: number, progress: number, maxLevel: number })[]> {
    const result = await db
      .select({
        skill: skills,
        level: characterSkills.level,
        progress: characterSkills.progress,
        maxLevel: characterSkills.maxLevel
      })
      .from(characterSkills)
      .innerJoin(skills, eq(characterSkills.skillId, skills.id))
      .where(eq(characterSkills.characterId, characterId));
    
    return result.map(r => ({
      ...r.skill,
      level: r.level,
      progress: r.progress,
      maxLevel: r.maxLevel
    }));
  }

  async updateCharacterSkill(characterId: number, skillId: number, updates: Partial<CharacterSkill>): Promise<CharacterSkill> {
    const [updatedCharacterSkill] = await db
      .update(characterSkills)
      .set(updates)
      .where(and(
        eq(characterSkills.characterId, characterId),
        eq(characterSkills.skillId, skillId)
      ))
      .returning();
    
    if (!updatedCharacterSkill) {
      throw new Error(`CharacterSkill with characterId ${characterId} and skillId ${skillId} not found`);
    }
    
    return updatedCharacterSkill;
  }

  async addSkillToCharacter(insertCharacterSkill: InsertCharacterSkill): Promise<CharacterSkill> {
    const [characterSkill] = await db
      .insert(characterSkills)
      .values(insertCharacterSkill)
      .returning();
    return characterSkill;
  }

  async getContacts(characterId: number): Promise<Contact[]> {
    return db
      .select()
      .from(contacts)
      .where(eq(contacts.characterId, characterId));
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(insertContact)
      .returning();
    return contact;
  }

  async getActivities(): Promise<Activity[]> {
    return db.select().from(activities);
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    const [activity] = await db.select().from(activities).where(eq(activities.id, id));
    return activity || undefined;
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(insertActivity)
      .returning();
    return activity;
  }

  async getAvailableActivities(day: number): Promise<Activity[]> {
    // Query for activities with no unlockDay or unlockDay <= day
    const availableActivities = await db.select().from(activities);
    
    // Filter in JavaScript instead of SQL for simpler handling
    return availableActivities.filter(activity => 
      activity.unlockDay === null || activity.unlockDay <= day
    );
  }

  async getGameState(userId: number): Promise<GameState | undefined> {
    const [gameState] = await db
      .select()
      .from(gameStates)
      .where(eq(gameStates.userId, userId));
    
    return gameState || undefined;
  }

  async createGameState(insertGameState: InsertGameState): Promise<GameState> {
    const [gameState] = await db
      .insert(gameStates)
      .values(insertGameState)
      .returning();
    return gameState;
  }

  async updateGameState(userId: number, updates: Partial<GameState>): Promise<GameState> {
    const [updatedGameState] = await db
      .update(gameStates)
      .set(updates)
      .where(eq(gameStates.userId, userId))
      .returning();
    
    if (!updatedGameState) {
      throw new Error(`GameState for userId ${userId} not found`);
    }
    
    return updatedGameState;
  }

  async resetGameState(userId: number): Promise<void> {
    const gameState = await this.getGameState(userId);
    if (gameState && gameState.characterId) {
      // Delete character skills
      await db
        .delete(characterSkills)
        .where(eq(characterSkills.characterId, gameState.characterId));
      
      // Delete character items
      await db
        .delete(characterItems)
        .where(eq(characterItems.characterId, gameState.characterId));
      
      // Delete contacts
      await db
        .delete(contacts)
        .where(eq(contacts.characterId, gameState.characterId));
      
      // Delete character
      await db
        .delete(characters)
        .where(eq(characters.id, gameState.characterId));
      
      // Reset game state
      await db
        .update(gameStates)
        .set({
          characterId: null,
          day: 1,
          time: "08:00",
          gameStarted: false,
          hoursLeft: 16
        })
        .where(eq(gameStates.id, gameState.id));
    }
  }

  async initializeDefaultData(): Promise<void> {
    // Check if we need to initialize (check if users exist)
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log("Database already has data, skipping initialization");
      return;
    }
    
    console.log("Initializing database with default data");
    
    // Create default user
    const user = await this.createUser({
      username: "player",
      password: "password"
    });
    
    // Create default game state
    await this.createGameState({
      userId: user.id,
      day: 1,
      time: "08:00",
      gameStarted: false,
      hoursLeft: 16
    });

    // Create default skills
    await this.createSkill({
      name: "Stile nel Vestire",
      description: "Capacità di abbinare capi firmati e creare outfit da vero maranza"
    });
    
    await this.createSkill({
      name: "Parlata Slang",
      description: "Abilità nel parlare usando il gergo maranza e abbreviazioni"
    });
    
    await this.createSkill({
      name: "Contrattazione",
      description: "Capacità di ottenere sconti e affari vantaggiosi"
    });
    
    await this.createSkill({
      name: "Ballo",
      description: "Abilità nelle mosse di danza tipiche del maranza"
    });
    
    await this.createSkill({
      name: "Carisma Sociale",
      description: "Capacità di farsi nuovi amici e influenzare gli altri"
    });

    // Create default items
    await this.createItem({
      name: "Felpa Firmata",
      description: "Una felpa di marca perfetta per il tuo stile maranza",
      effect: { type: "style", value: 15 },
      price: 150,
      image: "hoodie",
      unlockDay: 2,
      category: "clothing"
    });
    
    await this.createItem({
      name: "Marsupio Griffato",
      description: "Un marsupio di marca da portare a tracolla",
      effect: { type: "style", value: 10 },
      price: 80,
      image: "bag",
      category: "accessory"
    });
    
    await this.createItem({
      name: "Cappellino con Visiera",
      description: "Un cappellino con logo ben visibile, indispensabile per un maranza",
      effect: { type: "style", value: 8 },
      price: 40,
      image: "cap",
      category: "accessory"
    });
    
    await this.createItem({
      name: "Tuta Sportiva",
      description: "Una tuta sportiva di marca, comoda e alla moda",
      effect: { type: "style", value: 12 },
      price: 120,
      image: "tracksuit",
      category: "clothing"
    });
    
    await this.createItem({
      name: "Scarpe Costose",
      description: "Scarpe sportive estremamente costose con design vistoso",
      effect: { type: "style", value: 20 },
      price: 250,
      image: "shoes",
      unlockDay: 4,
      category: "clothing"
    });
    
    await this.createItem({
      name: "Energy Drink",
      description: "Una bevanda energetica per ricaricarti",
      effect: { type: "energy", value: 25 },
      price: 3,
      image: "drink",
      category: "consumable"
    });

    // Create default activities
    await this.createActivity({
      title: "Giro in Piazza",
      description: "Fai un giro nella piazza principale per mostrare il tuo stile e incontrare altri maranza.",
      image: "plaza",
      duration: 1,
      effects: {
        reputation: 15,
        energy: -10
      },
      possibleOutcomes: [
        "Possibile incontro con altri maranza",
        "Potresti incontrare qualcuno di importante"
      ],
      category: "social",
      color: "primary"
    });
    
    await this.createActivity({
      title: "Shopping al Centro",
      description: "Vai al centro commerciale per acquistare nuovi vestiti di marca e accessori. Aumenta il tuo stile!",
      image: "mall",
      duration: 2,
      effects: {
        style: 20,
        money: -100,
        energy: -5
      },
      possibleOutcomes: [
        "Potresti trovare capi in saldo",
        "Potrebbe esserci una nuova collezione"
      ],
      category: "shopping",
      color: "secondary"
    });
    
    await this.createActivity({
      title: "Palestra",
      description: "Allenati in palestra per aumentare la tua forma fisica e guadagnare rispetto dagli altri maranza.",
      image: "gym",
      duration: 3,
      effects: {
        respect: 25,
        energy: -30
      },
      possibleOutcomes: [
        "Potresti incontrare un personal trainer",
        "Potresti impressionare qualcuno"
      ],
      category: "fitness",
      color: "accent"
    });
    
    await this.createActivity({
      title: "Serata in Discoteca",
      description: "Vai in discoteca per ballare, incontrare gente e mostrare le tue mosse migliori.",
      image: "club",
      duration: 5,
      effects: {
        reputation: 30,
        energy: -50,
        money: -50
      },
      possibleOutcomes: [
        "Potresti fare nuove amicizie",
        "Potresti attirare l'attenzione"
      ],
      category: "social",
      color: "info"
    });

    await this.createActivity({
      title: "Lavoretto Part-time",
      description: "Svolgi un lavoretto part-time per guadagnare qualche soldo extra.",
      image: "work",
      duration: 6,
      effects: {
        money: 100,
        energy: -20,
        reputation: -5
      },
      possibleOutcomes: [
        "Potresti guadagnare una mancia extra",
        "Potresti conoscere persone utili"
      ],
      category: "work",
      color: "secondary"
    });
    
    await this.createActivity({
      title: "Riposo a Casa",
      description: "Prenditi del tempo per riposare e recuperare energie.",
      image: "home",
      duration: 3,
      effects: {
        energy: 50
      },
      possibleOutcomes: [
        "Ti sentirai rigenerato"
      ],
      category: "rest",
      color: "primary"
    });
    
    console.log("Database initialization complete");
  }
}

// Create instance of DatabaseStorage
export const storage = new DatabaseStorage();
