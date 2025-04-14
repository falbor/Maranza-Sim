import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file's directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  InsertGameState
} from "../shared/schema";

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
  protected users: Map<number, User>;
  protected characters: Map<number, Character>;
  protected items: Map<number, Item>;
  protected characterItems: Map<number, CharacterItem>;
  protected skills: Map<number, Skill>;
  protected characterSkills: Map<number, CharacterSkill>;
  protected contacts: Map<number, Contact>;
  protected activities: Map<number, Activity>;
  protected gameStates: Map<number, GameState>;
  
  protected userId: number;
  protected characterId: number;
  protected itemId: number;
  protected characterItemId: number;
  protected skillId: number;
  protected characterSkillId: number;
  protected contactId: number;
  protected activityId: number;
  protected gameStateId: number;

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
    const character: Character = {
      ...insertCharacter,
      id,
      style: insertCharacter.style ?? 0,
      money: insertCharacter.money ?? 0,
      reputation: insertCharacter.reputation ?? 0,
      energy: insertCharacter.energy ?? 100,
      respect: insertCharacter.respect ?? 0,
      avatarId: insertCharacter.avatarId ?? 1
    };
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
    const item: Item = {
      ...insertItem,
      id,
      unlockDay: insertItem.unlockDay ?? null
    };
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
    const characterItem: CharacterItem = {
      ...insertCharacterItem,
      id,
      acquired: insertCharacterItem.acquired ?? true,
      acquiredDay: insertCharacterItem.acquiredDay ?? null
    };
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
    const characterSkill: CharacterSkill = {
      ...insertCharacterSkill,
      id,
      level: insertCharacterSkill.level ?? 1,
      progress: insertCharacterSkill.progress ?? 0,
      maxLevel: insertCharacterSkill.maxLevel ?? 100
    };
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
    const activity: Activity = {
      ...insertActivity,
      id,
      unlockDay: insertActivity.unlockDay ?? null,
      requirements: insertActivity.requirements ?? null
    };
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
    const gameState: GameState = {
      ...insertGameState,
      id,
      characterId: insertGameState.characterId ?? null,
      day: insertGameState.day ?? 1,
      time: insertGameState.time ?? "08:00",
      gameStarted: insertGameState.gameStarted ?? false,
      hoursLeft: insertGameState.hoursLeft ?? 16
    };
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
        characterId: null,
        day: 1,
        time: "08:00",
        gameStarted: false,
        hoursLeft: 16
      });
    }
  }

  // Initialize default data
  async initializeDefaultData(): Promise<void> {
    // Only initialize if no data exists
    const skills = await this.getSkills();
    const activities = await this.getActivities();
    const items = await this.getItems();
    
    if (skills.length > 0 && activities.length > 0 && items.length > 0) {
      return; // Data already exists, skip initialization
    }

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

export class FileStorage extends MemStorage {
  private dataPath: string;

  constructor() {
    super();
    // Ensure we create an absolute path to the data directory
    this.dataPath = path.resolve(__dirname, '..', 'data', 'storage.json');
    
    // Create data directory if it doesn't exist
    const dataDir = path.dirname(this.dataPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.loadFromFile();
  }

  private loadFromFile() {
    try {
      if (fs.existsSync(this.dataPath)) {
        const savedData = JSON.parse(fs.readFileSync(this.dataPath, 'utf-8'));
        if (savedData) {
          this.users = new Map(savedData.users);
          this.characters = new Map(savedData.characters);
          this.items = new Map(savedData.items);
          this.characterItems = new Map(savedData.characterItems);
          this.skills = new Map(savedData.skills);
          this.characterSkills = new Map(savedData.characterSkills);
          this.contacts = new Map(savedData.contacts);
          this.activities = new Map(savedData.activities);
          this.gameStates = new Map(savedData.gameStates);
          
          this.userId = savedData.userId;
          this.characterId = savedData.characterId;
          this.itemId = savedData.itemId;
          this.characterItemId = savedData.characterItemId;
          this.skillId = savedData.skillId;
          this.characterSkillId = savedData.characterSkillId;
          this.contactId = savedData.contactId;
          this.activityId = savedData.activityId;
          this.gameStateId = savedData.gameStateId;
        }
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
      // If there's an error loading the file, we'll keep using the default initialized data
    }
  }

  private saveToFile() {
    try {
      if (!this.dataPath) {
        throw new Error('Data path is not initialized');
      }

      const data = {
        users: Array.from(this.users.entries()),
        characters: Array.from(this.characters.entries()),
        items: Array.from(this.items.entries()),
        characterItems: Array.from(this.characterItems.entries()),
        skills: Array.from(this.skills.entries()),
        characterSkills: Array.from(this.characterSkills.entries()),
        contacts: Array.from(this.contacts.entries()),
        activities: Array.from(this.activities.entries()),
        gameStates: Array.from(this.gameStates.entries()),
        userId: this.userId,
        characterId: this.characterId,
        itemId: this.itemId,
        characterItemId: this.characterItemId,
        skillId: this.skillId,
        characterSkillId: this.characterSkillId,
        contactId: this.contactId,
        activityId: this.activityId,
        gameStateId: this.gameStateId
      };
      
      // Ensure the directory exists before writing
      const dataDir = path.dirname(this.dataPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // Override all methods that modify data to save after changes
  async createUser(insertUser: InsertUser): Promise<User> {
    const user = await super.createUser(insertUser);
    this.saveToFile();
    return user;
  }

  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    const character = await super.createCharacter(insertCharacter);
    this.saveToFile();
    return character;
  }

  async updateCharacter(id: number, updates: Partial<Character>): Promise<Character> {
    const character = await super.updateCharacter(id, updates);
    this.saveToFile();
    return character;
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    const item = await super.createItem(insertItem);
    this.saveToFile();
    return item;
  }

  async addItemToCharacter(insertCharacterItem: InsertCharacterItem): Promise<CharacterItem> {
    const characterItem = await super.addItemToCharacter(insertCharacterItem);
    this.saveToFile();
    return characterItem;
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const skill = await super.createSkill(insertSkill);
    this.saveToFile();
    return skill;
  }

  async addSkillToCharacter(insertCharacterSkill: InsertCharacterSkill): Promise<CharacterSkill> {
    const characterSkill = await super.addSkillToCharacter(insertCharacterSkill);
    this.saveToFile();
    return characterSkill;
  }

  async updateCharacterSkill(characterId: number, skillId: number, updates: Partial<CharacterSkill>): Promise<CharacterSkill> {
    const characterSkill = await super.updateCharacterSkill(characterId, skillId, updates);
    this.saveToFile();
    return characterSkill;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const contact = await super.createContact(insertContact);
    this.saveToFile();
    return contact;
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const activity = await super.createActivity(insertActivity);
    this.saveToFile();
    return activity;
  }

  async createGameState(insertGameState: InsertGameState): Promise<GameState> {
    const gameState = await super.createGameState(insertGameState);
    this.saveToFile();
    return gameState;
  }

  async updateGameState(userId: number, updates: Partial<GameState>): Promise<GameState> {
    const gameState = await super.updateGameState(userId, updates);
    this.saveToFile();
    return gameState;
  }

  async resetGameState(userId: number): Promise<void> {
    await super.resetGameState(userId);
    this.saveToFile();
  }
}

// Export an instance of FileStorage instead of LocalStorage
export const storage = new FileStorage();
