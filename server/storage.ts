/**
 * File di gestione dello storage per Maranza Simulator
 * Implementa la persistenza dei dati e le funzionalità CRUD per tutte le entità del gioco
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Ottiene la directory del file corrente in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importazione dei tipi dal modello dati condiviso
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

/**
 * Interfaccia che definisce tutti i metodi di storage necessari per l'applicazione
 * Funziona come contratto per l'implementazione delle classi concrete
 */
export interface IStorage {
  // Metodi per gli utenti
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Metodi per i personaggi
  getCharacter(id: number): Promise<Character | undefined>;
  getCharacterByUserId(userId: number): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: number, updates: Partial<Character>): Promise<Character>;

  // Metodi per gli oggetti
  getItems(): Promise<Item[]>;
  getItem(id: number): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  getCharacterItems(characterId: number): Promise<Item[]>;
  addItemToCharacter(characterItem: InsertCharacterItem): Promise<CharacterItem>;

  // Metodi per le abilità
  getSkills(): Promise<Skill[]>;
  getSkill(id: number): Promise<Skill | undefined>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  getCharacterSkills(characterId: number): Promise<(Skill & { level: number, progress: number, maxLevel: number })[]>;
  updateCharacterSkill(characterId: number, skillId: number, updates: Partial<CharacterSkill>): Promise<CharacterSkill>;
  addSkillToCharacter(characterSkill: InsertCharacterSkill): Promise<CharacterSkill>;

  // Metodi per i contatti
  getContacts(characterId: number): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;

  // Metodi per le attività
  getActivities(): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  getAvailableActivities(day: number): Promise<Activity[]>;

  // Metodi per lo stato del gioco
  getGameState(userId: number): Promise<GameState | undefined>;
  createGameState(gameState: InsertGameState): Promise<GameState>;
  updateGameState(userId: number, updates: Partial<GameState>): Promise<GameState>;
  resetGameState(userId: number): Promise<void>;

  // Metodi di utilità
  initializeDefaultData(): Promise<void>;
}

/**
 * Implementazione di base dello storage in memoria
 * Memorizza tutti i dati in mappe in-memory per un accesso rapido
 */
export class MemStorage implements IStorage {
  // Mappe per memorizzare le diverse entità del gioco
  protected users: Map<number, User>;
  protected characters: Map<number, Character>;
  protected items: Map<number, Item>;
  protected characterItems: Map<number, CharacterItem>;
  protected skills: Map<number, Skill>;
  protected characterSkills: Map<number, CharacterSkill>;
  protected contacts: Map<number, Contact>;
  protected activities: Map<number, Activity>;
  protected gameStates: Map<number, GameState>;
  
  // Contatori per gli ID auto-incrementali
  protected userId: number;
  protected characterId: number;
  protected itemId: number;
  protected characterItemId: number;
  protected skillId: number;
  protected characterSkillId: number;
  protected contactId: number;
  protected activityId: number;
  protected gameStateId: number;

  /**
   * Costruttore che inizializza tutte le mappe di dati e i contatori ID
   */
  constructor() {
    // Inizializza le mappe per memorizzare le entità
    this.users = new Map();
    this.characters = new Map();
    this.items = new Map();
    this.characterItems = new Map();
    this.skills = new Map();
    this.characterSkills = new Map();
    this.contacts = new Map();
    this.activities = new Map();
    this.gameStates = new Map();
    
    // Inizializza i contatori degli ID auto-incrementali
    this.userId = 1;
    this.characterId = 1;
    this.itemId = 1;
    this.characterItemId = 1;
    this.skillId = 1;
    this.characterSkillId = 1;
    this.contactId = 1;
    this.activityId = 1;
    this.gameStateId = 1;
    
    // Inizializza i dati predefiniti
    this.initializeDefaultData();
  }

  /**
   * Metodi per la gestione degli utenti
   */
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

  /**
   * Metodi per la gestione dei personaggi
   */
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

  /**
   * Metodi per la gestione degli oggetti
   */
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
    // Trova tutti gli elementi di characterItems che appartengono al personaggio
    const characterItemsArray = Array.from(this.characterItems.values())
      .filter(ci => ci.characterId === characterId && ci.acquired);
    
    // Ottiene i dettagli completi degli oggetti
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

  /**
   * Metodi per la gestione delle abilità
   */
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
    // Trova tutte le abilità del personaggio
    const characterSkillsArray = Array.from(this.characterSkills.values())
      .filter(cs => cs.characterId === characterId);
    
    // Arricchisce i dati delle abilità con informazioni sul progresso
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

  /**
   * Metodi per la gestione dei contatti
   */
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

  /**
   * Metodi per la gestione delle attività
   */
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
    // Restituisce solo le attività disponibili in base al giorno corrente
    return Array.from(this.activities.values())
      .filter(activity => !activity.unlockDay || activity.unlockDay <= day);
  }

  /**
   * Metodi per la gestione dello stato del gioco
   */
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

  /**
   * Reimposta completamente lo stato del gioco
   * - Elimina tutti i dati relativi al personaggio corrente
   * - Ricrea i dati predefiniti (abilità, oggetti, attività)
   */
  async resetGameState(userId: number): Promise<void> {
    const gameState = await this.getGameState(userId);
    if (gameState) {
      // 1. Elimina tutti i dati relativi al personaggio
      if (gameState.characterId) {
        // Elimina le abilità del personaggio
        for (const [id, characterSkill] of this.characterSkills.entries()) {
          if (characterSkill.characterId === gameState.characterId) {
            this.characterSkills.delete(id);
          }
        }
        
        // Elimina gli oggetti del personaggio
        for (const [id, characterItem] of this.characterItems.entries()) {
          if (characterItem.characterId === gameState.characterId) {
            this.characterItems.delete(id);
          }
        }
        
        // Elimina i contatti
        for (const [id, contact] of this.contacts.entries()) {
          if (contact.characterId === gameState.characterId) {
            this.contacts.delete(id);
          }
        }
        
        // Elimina il personaggio
        this.characters.delete(gameState.characterId);
      }

      // 2. Pulisce completamente le collezioni
      this.items.clear();
      this.skills.clear();  
      this.activities.clear();
      
      // 3. Pulisce gli stati di gioco per questo utente (tranne quello corrente)
      for (const [id, state] of this.gameStates.entries()) {
        if (state.userId === userId && id !== gameState.id) {
          this.gameStates.delete(id);
        }
      }
      
      // 4. Reimposta i contatori ID mantenendo l'ID dello stato del gioco corrente
      this.characterId = 1;
      this.itemId = 1;
      this.characterItemId = 1;
      this.skillId = 1;
      this.characterSkillId = 1;
      this.contactId = 1;
      this.activityId = 1;
      
      // 5. Reimposta lo stato del gioco ai valori iniziali
      this.gameStates.set(gameState.id, {
        ...gameState,
        characterId: null,
        day: 1,
        time: "08:00",
        gameStarted: false,
        hoursLeft: 16
      });

      // 6. Reinizializza i dati predefiniti (abilità, oggetti, attività)
      await this.initializeDefaultData();
    }
  }

  /**
   * Inizializza i dati predefiniti del gioco (abilità, oggetti, attività)
   * Viene chiamato al primo avvio o dopo un reset del gioco
   */
  async initializeDefaultData(): Promise<void> {
    // Ottiene i dati esistenti
    const skills = await this.getSkills();
    const activities = await this.getActivities();
    const items = await this.getItems();
    
    // Verifica più rigorosa dei dati esistenti, usando una combinazione di lunghezza e verifica della presenza di elementi specifici
    const hasSkills = skills.length > 0 && skills.some(s => s.name === "Stile nel Vestire");
    const hasActivities = activities.length > 0 && activities.some(a => a.title === "Giro in Piazza");
    const hasItems = items.length > 0 && items.some(i => i.name === "Felpa Firmata");

    // Crea le abilità predefinite se non esistono
    if (!hasSkills) {
      // Prima elimina eventuali abilità esistenti per evitare duplicati
      for (const [id, _] of this.skills.entries()) {
        this.skills.delete(id);
      }
      // Azzera il contatore degli ID
      this.skillId = 1;
      
      // Crea le abilità di base
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
    }

    // Crea gli oggetti predefiniti se non esistono
    if (!hasItems) {
      // Prima elimina eventuali oggetti esistenti per evitare duplicati
      for (const [id, _] of this.items.entries()) {
        this.items.delete(id);
      }
      // Azzera il contatore degli ID
      this.itemId = 1;
      
      // Crea gli oggetti base - bilanciamento migliorato
      await this.createItem({
        name: "Felpa Firmata",
        description: "Una felpa di marca perfetta per il tuo stile maranza",
        effects: [
          { type: "style", value: 15 }
        ],
        price: 120,
        image: "hoodie",
        category: "clothing",
        isInShop: true,
        unlockDay: 2
      });
      
      await this.createItem({
        name: "Marsupio Griffato",
        description: "Un marsupio di marca da portare a tracolla",
        effects: [
          { type: "style", value: 8 },
          { type: "respect", value: 3 }
        ],
        price: 70,
        image: "bag",
        category: "accessory",
        isInShop: true
      });
      
      await this.createItem({
        name: "Cappellino con Visiera",
        description: "Un cappellino con logo ben visibile, indispensabile per un maranza",
        effects: [
          { type: "style", value: 6 },
          { type: "reputation", value: 4 }
        ],
        price: 35,
        image: "cap",
        category: "accessory",
        isInShop: true
      });
      
      await this.createItem({
        name: "Tuta Sportiva",
        description: "Una tuta sportiva di marca, comoda e alla moda",
        effects: [
          { type: "style", value: 12 },
          { type: "energy", value: 5 }
        ],
        price: 95,
        image: "tracksuit",
        category: "clothing",
        isInShop: true
      });
      
      await this.createItem({
        name: "Scarpe Costose",
        description: "Scarpe sportive estremamente costose con design vistoso",
        effects: [
          { type: "style", value: 18 },
          { type: "reputation", value: 5 }
        ],
        price: 200,
        image: "shoes",
        unlockDay: 4,
        category: "clothing",
        isInShop: true
      });
      
      await this.createItem({
        name: "Energy Drink",
        description: "Una bevanda energetica per ricaricarti",
        effects: [
          { type: "energy", value: 25 }
        ],
        price: 3,
        image: "drink",
        category: "consumable",
        isInShop: true
      });
      
      await this.createItem({
        name: "Occhiali da Sole Tamarri",
        description: "Occhiali da sole appariscenti che ti fanno sembrare un vero maranza, ma sono scomodi",
        effects: [
          { type: "style", value: 10 },
          { type: "respect", value: 3 },
          { type: "energy", value: -5, isDebuff: true }
        ],
        price: 55,
        image: "glasses",
        category: "accessory",
        isInShop: true
      });
      
      await this.createItem({
        name: "Orecchino XXL",
        description: "Un orecchino enorme che attira l'attenzione ma può essere fastidioso",
        effects: [
          { type: "style", value: 8 },
          { type: "respect", value: 5 },
          { type: "energy", value: -3, isDebuff: true }
        ],
        price: 45,
        image: "earring",
        category: "accessory",
        isInShop: true
      });
      
      await this.createItem({
        name: "Collana d'Oro Pesante",
        description: "Una grossa catena d'oro che migliora il tuo stile ma è pesantissima",
        effects: [
          { type: "style", value: 20 },
          { type: "respect", value: 12 },
          { type: "energy", value: -8, isDebuff: true }
        ],
        price: 250,
        image: "necklace",
        category: "accessory",
        isInShop: true,
        unlockDay: 3
      });
      
      await this.createItem({
        name: "Air Force Taroccate",
        description: "Sembrano originali, ma non lo sono. Costa poco ma se ti beccano perdi reputazione",
        effects: [
          { type: "style", value: 8 },
          { type: "reputation", value: -5, isDebuff: true }
        ],
        price: 30,
        image: "fakeShoes",
        category: "clothing",
        isInShop: true
      });
      
      await this.createItem({
        name: "Berretto Aderente",
        description: "Un berretto strettissimo che stringe la testa, ma fa molto stile",
        effects: [
          { type: "style", value: 7 },
          { type: "energy", value: -2, isDebuff: true }
        ],
        price: 20,
        image: "beanie",
        category: "accessory",
        isInShop: true
      });
      
      await this.createItem({
        name: "Energy Drink Potenziato",
        description: "Tripla caffeina, per una carica immediata ma un crash garantito dopo",
        effects: [
          { type: "energy", value: 40 },
          { type: "energy", value: -15, isDebuff: true, delay: 2 }
        ],
        price: 8,
        image: "energyDrink",
        category: "consumable",
        isInShop: true
      });
      
      await this.createItem({
        name: "Cintura Borchiata",
        description: "Una cintura vistosa con borchie, molto appariscente",
        effects: [
          { type: "style", value: 7 },
          { type: "respect", value: 3 }
        ],
        price: 25,
        image: "belt",
        category: "accessory",
        isInShop: true
      });
      
      await this.createItem({
        name: "Smartphone Ultimo Modello",
        description: "Costa un occhio della testa ma aumenta drasticamente il tuo stile e reputazione",
        effects: [
          { type: "style", value: 15 },
          { type: "reputation", value: 12 }
        ],
        price: 350,
        image: "phone",
        category: "accessory",
        isInShop: true,
        unlockDay: 5
      });
    }
    
    // Crea le attività predefinite se non esistono
    if (!hasActivities) {
      // Prima elimina eventuali attività esistenti per evitare duplicati
      for (const [id, _] of this.activities.entries()) {
        this.activities.delete(id);
      }
      // Azzera il contatore degli ID
      this.activityId = 1;
      
      // Crea le attività di base - bilanciamento migliorato
      await this.createActivity({
        title: "Giro in Piazza",
        description: "Fai un giro in piazza per farti notare e incontrare altri maranza",
        image: "piazza",
        duration: 1,
        effects: {
          reputation: 5,
          energy: -8
        },
        possibleOutcomes: [
          "Hai fatto un giro in piazza e hai incontrato alcuni amici maranza.",
          "Mentre camminavi in piazza, hai ricevuto molti apprezzamenti per il tuo stile."
        ],
        category: "sociale",
        color: "bg-primary"
      });
      
      await this.createActivity({
        title: "Shopping al Centro",
        description: "Vai a fare shopping per trovare vestiti alla moda",
        image: "shopping",
        duration: 2,
        effects: {
          money: -40,
          style: 6,
          energy: -12
        },
        possibleOutcomes: [
          "Hai fatto shopping e hai trovato capi perfetti per il tuo stile maranza.",
          "Il commesso ti ha fatto uno sconto speciale perché hai un'aria da vero maranza."
        ],
        category: "acquisti",
        color: "bg-pink-500"
      });
      
      await this.createActivity({
        title: "Palestra",
        description: "Vai in palestra per migliorare il tuo fisico e incontrare altri maranza",
        image: "gym",
        duration: 2,
        effects: {
          respect: 8,
          energy: -25
        },
        possibleOutcomes: [
          "Hai completato un allenamento intenso. I tuoi muscoli sono stanchi, ma hai guadagnato rispetto!",
          "Durante l'allenamento, molti ti hanno osservato con ammirazione."
        ],
        category: "fitness",
        color: "bg-orange-500"
      });
      
      await this.createActivity({
        title: "Serata in Discoteca",
        description: "Vai a ballare in discoteca e mostra il tuo stile maranza",
        image: "disco",
        duration: 4,
        effects: {
          money: -70,
          reputation: 12,
          energy: -35
        },
        possibleOutcomes: [
          "La tua serata in discoteca è stata un successo! Tutti hanno notato le tue mosse di ballo!",
          "Hai fatto colpo su molte persone in discoteca."
        ],
        category: "divertimento",
        color: "bg-purple-500"
      });
      
      await this.createActivity({
        title: "Lavoretto Part-time",
        description: "Fai un lavoretto per guadagnare soldi da spendere",
        image: "work",
        duration: 3,
        effects: {
          money: 120,
          energy: -20,
          reputation: -2
        },
        possibleOutcomes: [
          "Hai guadagnato qualche soldo, anche se non è stato molto divertente.",
          "Il lavoro è stato noioso, ma il tuo portafoglio ringrazia."
        ],
        category: "lavoro",
        color: "bg-green-500"
      });
      
      await this.createActivity({
        title: "Riposo a Casa",
        description: "Riposati a casa per recuperare energia",
        image: "home",
        duration: 2,
        effects: {
          energy: 40
        },
        possibleOutcomes: [
          "Ti sei riposato bene e hai recuperato energia.",
          "Un buon sonno ti ha rigenerato."
        ],
        category: "riposo",
        color: "bg-blue-500"
      });
      
      await this.createActivity({
        title: "Social Media",
        description: "Condividi i tuoi outfit e le tue attività sui social",
        image: "social",
        duration: 1,
        effects: {
          reputation: 8,
          energy: -4
        },
        possibleOutcomes: [
          "I tuoi post hanno ricevuto molti like!",
          "Le tue foto hanno fatto il pieno di commenti positivi."
        ],
        category: "sociale",
        color: "bg-cyan-500"
      });
      
      await this.createActivity({
        title: "Raduno di Auto Tuning",
        description: "Partecipa a un raduno di auto modificate",
        image: "cars",
        duration: 3,
        effects: {
          respect: 10,
          energy: -18,
          money: -25
        },
        unlockDay: 3,
        possibleOutcomes: [
          "Il raduno è stato fantastico! Hai visto auto incredibili!",
          "Al raduno tutti hanno apprezzato la tua conoscenza delle auto."
        ],
        category: "evento",
        color: "bg-amber-500"
      });
      
      await this.createActivity({
        title: "Sfida di Stile",
        description: "Partecipa a una sfida tra maranza per determinare chi ha lo stile migliore",
        image: "fashion",
        duration: 2,
        effects: {
          style: 10,
          energy: -15,
          reputation: 8
        },
        unlockDay: 4,
        requirements: {
          style: 60
        },
        possibleOutcomes: [
          "Hai partecipato alla sfida di stile e tutti hanno ammirato il tuo look da vero maranza!",
          "La tua combinazione di vestiti ha impressionato anche i più esigenti."
        ],
        category: "evento",
        color: "bg-rose-500"
      });
      
      await this.createActivity({
        title: "Vai a Scuola",
        description: "Frequenta la scuola (solo per mantenere le apparenze)",
        image: "school",
        duration: 5,
        effects: {
          energy: -20,
          respect: -3,
          style: -2
        },
        possibleOutcomes: [
          "La giornata a scuola è stata lunga ma hai imparato qualcosa di utile.",
          "I professori ti hanno dato del filo da torcere, ma hai mantenuto il tuo stile maranza anche in classe!"
        ],
        category: "obbligo",
        color: "bg-gray-500"
      });
      
      // Aggiungi nuove attività bilanciate
      await this.createActivity({
        title: "Meet-up Maranza",
        description: "Partecipa a un ritrovo organizzato di maranza della zona",
        image: "meetup",
        duration: 3,
        effects: {
          reputation: 10,
          respect: 5,
          energy: -15
        },
        unlockDay: 5,
        possibleOutcomes: [
          "Il meet-up è stato un successo! Hai conosciuto molti altri maranza come te.",
          "Ti sei fatto notare al ritrovo e hai guadagnato rispetto e reputazione."
        ],
        category: "evento",
        color: "bg-indigo-500"
      });
      
      await this.createActivity({
        title: "Allenamento Freestyle",
        description: "Impara nuove mosse di ballo freestyle in un corso improvvisato",
        image: "dance",
        duration: 2,
        effects: {
          respect: 6,
          energy: -20,
          style: 4
        },
        unlockDay: 2,
        possibleOutcomes: [
          "Hai imparato nuove mosse che ti faranno fare bella figura in discoteca!",
          "Il tuo allenamento di freestyle ha attirato l'attenzione di altri ballerini."
        ],
        category: "fitness",
        color: "bg-yellow-500"
      });
      
      await this.createActivity({
        title: "Progetto Musicale",
        description: "Crea una base trap o registra un pezzo con altri maranza musicisti",
        image: "music",
        duration: 4,
        effects: {
          reputation: 15,
          energy: -20,
          money: -40
        },
        unlockDay: 6,
        requirements: {
          reputation: 65
        },
        possibleOutcomes: [
          "La tua traccia sta iniziando a circolare tra i maranza della città!",
          "Il tuo pezzo musicale ha ricevuto apprezzamenti sui social."
        ],
        category: "creativo",
        color: "bg-green-600"
      });
    }
  }
}

/**
 * Estensione dello storage in memoria che salva i dati su file
 * Garantisce la persistenza dei dati tra i riavvii dell'applicazione
 */
export class FileStorage extends MemStorage {
  private dataPath: string;

  constructor() {
    super();
    this.dataPath = path.resolve(__dirname, '..', 'data', 'storage.json');
    
    // Assicura che la directory dei dati esista
    const dataDir = path.dirname(this.dataPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Carica i dati dal file all'avvio
    this.loadFromFile();
    
    // Avvolge i metodi con la funzionalità di salvataggio automatico
    this.wrapMethodsWithSave();
  }

  /**
   * Avvolge i metodi originali con una funzione che salva automaticamente 
   * i dati dopo ogni operazione di modifica
   */
  private wrapMethodsWithSave() {
    const methodsToWrap = [
      'createUser',
      'createCharacter',
      'updateCharacter',
      'createItem',
      'addItemToCharacter',
      'createSkill',
      'addSkillToCharacter',
      'updateCharacterSkill',
      'createContact',
      'createActivity',
      'createGameState',
      'updateGameState',
      'resetGameState'
    ];

    methodsToWrap.forEach(methodName => {
      const originalMethod = this[methodName];
      this[methodName] = async (...args) => {
        const result = await originalMethod.apply(this, args);
        this.saveToFile();
        return result;
      };
    });
  }

  /**
   * Carica i dati dal file di storage
   */
  private loadFromFile() {
    try {
      if (fs.existsSync(this.dataPath)) {
        const savedData = JSON.parse(fs.readFileSync(this.dataPath, 'utf-8'));
        if (savedData) {
          // Ripristina tutte le mappe di dati
          this.users = new Map(savedData.users);
          this.characters = new Map(savedData.characters);
          this.items = new Map(savedData.items);
          this.characterItems = new Map(savedData.characterItems);
          this.skills = new Map(savedData.skills);
          this.characterSkills = new Map(savedData.characterSkills);
          this.contacts = new Map(savedData.contacts);
          this.activities = new Map(savedData.activities);
          this.gameStates = new Map(savedData.gameStates);
          
          // Ripristina i contatori degli ID
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
      // In caso di errore nel caricamento del file, continueremo a usare i dati predefiniti inizializzati
    }
  }

  /**
   * Salva i dati nel file di storage
   */
  private saveToFile() {
    try {
      if (!this.dataPath) {
        throw new Error('Data path is not initialized');
      }

      // Prepara i dati da salvare
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
      
      // Assicura che la directory esista prima di scrivere
      const dataDir = path.dirname(this.dataPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Scrive i dati formattati nel file
      fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }
}

// Esporta un'istanza di FileStorage per l'utilizzo nell'applicazione
export const storage = new FileStorage();
