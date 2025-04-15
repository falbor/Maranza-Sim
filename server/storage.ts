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
    
    // Aggiunge automaticamente alcuni oggetti di base all'inventario del personaggio
    if (character.id) {
      // Aggiunge un cappellino come oggetto iniziale
      await this.addItemToCharacter({
        characterId: character.id,
        itemId: 3, // Cappellino con Visiera
        acquired: true,
        acquiredDay: 1
      });
      
      // Aggiunge energy drink iniziale
      await this.addItemToCharacter({
        characterId: character.id,
        itemId: 6, // Energy Drink
        acquired: true,
        acquiredDay: 1
      });
    }
    
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
    
    // Crea l'utente predefinito solo se non esistono utenti
    const existingUsers = Array.from(this.users.values());
    if (existingUsers.length === 0) {
      const user = await this.createUser({
        username: "player",
        password: "password"
      });
      
      await this.createGameState({
        userId: user.id,
        day: 1,
        time: "08:00",
        gameStarted: false,
        hoursLeft: 16
      });
    }

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
      
      // Crea gli oggetti di base
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
    }

    // Crea le attività predefinite se non esistono
    if (!hasActivities) {
      // Prima elimina eventuali attività esistenti per evitare duplicati
      for (const [id, _] of this.activities.entries()) {
        this.activities.delete(id);
      }
      // Azzera il contatore degli ID
      this.activityId = 1;
      
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

      await this.createActivity({
        title: "Vai a Scuola",
        description: "Frequenta le lezioni a scuola. Non è molto maranza, ma i tuoi ci tengono e potrebbe tornarti utile.",
        image: "school",
        duration: 6,
        effects: {
          energy: -40,
          reputation: 5,
          respect: -5,
          money: -5
        },
        possibleOutcomes: [
          "Potresti imparare qualcosa di utile",
          "Potresti conoscere nuovi compagni di classe",
          "Potresti avere problemi con i professori"
        ],
        category: "education",
        color: "info"
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
