/**
 * File delle route del server per Maranza Simulator
 * Definisce tutte le API endpoints e la logica di gioco principale
 */
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

/**
 * Formatta l'orario nel formato hh:mm
 * @param hours - Ore da formattare
 * @param minutes - Minuti da formattare
 * @returns Stringa formattata dell'orario
 */
function formatTime(hours: number, minutes: number): string {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Fa avanzare il tempo di gioco di un numero specificato di ore
 * - Aggiorna l'orario e il giorno quando necessario
 * - Ripristina l'energia del personaggio all'inizio di un nuovo giorno
 * 
 * @param userId - ID dell'utente di cui avanzare il tempo di gioco
 * @param hoursToAdvance - Numero di ore da avanzare
 */
async function advanceTime(userId: number, hoursToAdvance: number): Promise<void> {
  const gameState = await storage.getGameState(userId);
  if (!gameState) {
    throw new Error("Game state not found");
  }
  
  // Analizza il tempo corrente
  const [hourStr, minuteStr] = gameState.time.split(':');
  let hours = parseInt(hourStr);
  let minutes = parseInt(minuteStr);
  
  // Converte hoursToAdvance in ore e minuti (supporta frazioni di ora)
  const fullHours = Math.floor(hoursToAdvance);
  const remainingMinutes = Math.round((hoursToAdvance - fullHours) * 60);
  
  // Aggiorna ore e minuti
  hours += fullHours;
  minutes += remainingMinutes;
  
  // Gestisce l'overflow dei minuti
  if (minutes >= 60) {
    hours += Math.floor(minutes / 60);
    minutes = minutes % 60;
  }
  
  // Gestisce il cambio del giorno se le ore > 24
  let newDay = gameState.day;
  if (hours >= 24) {
    hours -= 24;
    newDay += 1;
  }
  
  // Formatta il nuovo orario
  const newTime = formatTime(hours, minutes);
  
  // Calcola le ore rimanenti nella giornata
  const hoursRemaining = 23 - hours;
  const minutesRemaining = 60 - minutes;
  const hoursLeft = hoursRemaining + (minutesRemaining / 60);
  
  // Aggiorna lo stato del gioco
  await storage.updateGameState(userId, {
    time: newTime,
    day: newDay,
    hoursLeft
  });
  
  // Se è un nuovo giorno, ripristina l'energia del personaggio
  if (newDay > gameState.day && gameState.characterId) {
    const character = await storage.getCharacter(gameState.characterId);
    if (character) {
      await storage.updateCharacter(character.id, {
        energy: 100
      });
    }
  }
}

/**
 * Schema di validazione per la creazione/modifica di un personaggio
 * Utilizza Zod per tipizzare e validare i dati
 */
const characterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  look: z.enum(["casual", "sportivo", "firmato"]),
  personality: z.enum(["audace", "ribelle", "carismatico"]),
  avatarId: z.number().int().min(1).max(5),
  money: z.number().int().default(250),
  reputation: z.number().int().default(50),
  energy: z.number().int().default(100),
  respect: z.number().int().default(30),
  style: z.number().int().default(60)
});

/**
 * Genera un testo di risultato personalizzato in base all'attività completata
 * @param activityTitle - Titolo dell'attività
 * @returns Testo risultato casuale dall'array di possibili risultati
 */
function generateResultText(activityTitle: string): string {
  const possibleResults: Record<string, string[]> = {
    "Giro in Piazza": [
      "Hai fatto un giro in piazza e hai incontrato alcuni amici maranza. La tua reputazione è aumentata!",
      "Mentre camminavi in piazza, hai ricevuto molti apprezzamenti per il tuo stile. Ti senti al top!",
      "Il tuo giro in piazza è stato notato da tutti. Sei sempre al centro dell'attenzione!"
    ],
    "Shopping al Centro": [
      "Hai fatto shopping e hai trovato capi perfetti per il tuo stile maranza. Ora sei ancora più alla moda!",
      "Il commesso ti ha fatto uno sconto speciale perché hai un'aria da vero maranza. Grande affare!",
      "Hai speso un po' di soldi, ma ne è valsa la pena. I tuoi nuovi acquisti sono fantastici!"
    ],
    "Palestra": [
      "Hai completato un allenamento intenso. I tuoi muscoli sono stanchi, ma hai guadagnato rispetto!",
      "Durante l'allenamento, molti ti hanno osservato con ammirazione. Il tuo status è salito!",
      "La sessione in palestra ti ha stancato, ma ora sembri più forte e più rispettato!"
    ],
    "Serata in Discoteca": [
      "La tua serata in discoteca è stata un successo! Tutti hanno notato le tue mosse di ballo!",
      "Hai fatto colpo su molte persone in discoteca. La tua reputazione è aumentata notevolmente!",
      "La discoteca era piena e tu eri la star. Un vero maranza sa come farsi notare!"
    ],
    "Lavoretto Part-time": [
      "Hai guadagnato qualche soldo, anche se non è stato molto divertente. Almeno ora puoi comprare cose nuove!",
      "Il lavoro è stato noioso, ma il tuo portafoglio ringrazia. È il prezzo da pagare per lo stile!",
      "Lavoro completato! Non molto maranza, ma i soldi ti serviranno per mantenere il tuo stile!"
    ],
    "Riposo a Casa": [
      "Ti sei riposato bene e hai recuperato energia. Pronto per nuove avventure da maranza!",
      "Un buon sonno ti ha rigenerato. Ora sei pronto per tornare in piazza con stile!",
      "Il riposo era necessario. Ora ti senti di nuovo al 100%, pronto per fare colpo!"
    ],
    "Social Media": [
      "I tuoi post hanno ricevuto molti like! La tua presenza sui social sta crescendo rapidamente!",
      "Le tue foto hanno fatto il pieno di commenti positivi. Sei una vera star del web!",
      "Il tuo ultimo video è diventato virale! La tua reputazione online è alle stelle!"
    ],
    "Raduno di Auto Tuning": [
      "Il raduno è stato fantastico! Hai visto auto incredibili e hai fatto nuove amicizie!",
      "Al raduno tutti hanno apprezzato la tua conoscenza delle auto. Rispetto guadagnato!",
      "Le auto modificate erano spettacolari! Ti sei fatto notare per il tuo entusiasmo!"
    ],
    "Sfida di Stile": [
      "Hai partecipato alla sfida di stile e tutti hanno ammirato il tuo look da vero maranza!",
      "La tua combinazione di vestiti ha impressionato anche i più esigenti. Sei un'icona di stile!",
      "La sfida è stata combattuta, ma il tuo stile maranza ha brillato. Che vittoria!"
    ],
    "Vai a Scuola": [
      "La giornata a scuola è stata lunga ma hai imparato qualcosa di utile. Non proprio da maranza, ma serve anche questo!",
      "I professori ti hanno dato del filo da torcere, ma hai mantenuto il tuo stile maranza anche in classe!",
      "Hai socializzato con i compagni di classe durante le pause. Non tutto è perduto!"
    ]
  };
  
  // Seleziona un risultato casuale per l'attività o usa un default
  const results = possibleResults[activityTitle] || ["Hai completato l'attività con successo!"];
  return results[Math.floor(Math.random() * results.length)];
}

/**
 * Genera un contatto casuale per il personaggio
 * @param characterId - ID del personaggio
 * @param day - Giorno corrente del gioco
 * @returns Un nuovo contatto o null (50% di probabilità)
 */
function generateRandomContact(characterId: number, day: number): { contact: any, name: string } | null {
  // 50% di probabilità di ottenere un contatto
  if (Math.random() < 0.5) return null;
  
  const firstNames = ["Marco", "Luca", "Sara", "Giulia", "Alessandro", "Matteo", "Federico", "Simone", "Manuel", "Lorenzo"];
  const lastNames = ["Bello", "Furioso", "Diva", "Style", "Bomber", "King", "Cool", "Top", "Ferro", "Boss"];
  const types = ["Amico d'infanzia", "Conosciuto in discoteca", "Compagno di palestra", "Amico di amici", "Conosciuto al raduno"];
  const respects = ["basso", "medio", "alto"];
  const colors = ["primary", "secondary", "info", "amber-400", "green-500"];
  
  // Generazione casuale dei dettagli del contatto
  const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const fullName = `${randomFirstName} ${randomLastName}`;
  const initials = `${randomFirstName[0]}${randomLastName[0]}`;
  
  const contact = {
    characterId,
    name: fullName,
    type: types[Math.floor(Math.random() * types.length)],
    respect: respects[Math.floor(Math.random() * respects.length)],
    meetDay: day,
    avatarInitials: initials,
    avatarColor: colors[Math.floor(Math.random() * colors.length)]
  };
  
  return { contact, name: fullName };
}

/**
 * Registra tutte le route dell'API e crea un server HTTP
 * @param app - Istanza di Express
 * @returns Server HTTP
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Prefisso per tutte le route API
  const apiRouter = '/api';
  
  /**
   * GET /api/game/state
   * Ottiene o crea lo stato di gioco corrente
   */
  app.get(`${apiRouter}/game/state`, async (req: Request, res: Response) => {
    try {
      // Ottiene o crea l'utente predefinito (per demo usiamo sempre ID 1)
      const userId = 1;
      let user = await storage.getUser(userId);
      if (!user) {
        user = await storage.createUser({
          username: "player",
          password: "password"
        });
      }
      
      // Ottiene lo stato del gioco
      let gameState = await storage.getGameState(userId);
      if (!gameState) {
        gameState = await storage.createGameState({
          userId: user.id,
          day: 1,
          time: "08:00",
          gameStarted: false,
          hoursLeft: 16
        });
      }
      
      // Ottiene il personaggio se esiste
      const character = gameState.characterId 
        ? await storage.getCharacter(gameState.characterId)
        : null;
      
      // Ottiene le attività disponibili
      const availableActivities = await storage.getAvailableActivities(gameState.day);
      
      // Ottiene l'inventario
      const inventory = character ? await storage.getCharacterItems(character.id) : [];
      
      // Ottiene le abilità
      const skills = character ? await storage.getCharacterSkills(character.id) : [];
      
      // Ottiene i contatti
      const contacts = character ? await storage.getContacts(character.id) : [];
      
      // Invia la risposta completa con tutti i dati di gioco
      res.json({
        day: gameState.day,
        time: gameState.time,
        gameStarted: gameState.gameStarted,
        hoursLeft: gameState.hoursLeft,
        character,
        availableActivities,
        inventory,
        skills,
        contacts
      });
    } catch (error) {
      console.error("Failed to get game state:", error);
      res.status(500).json({ message: "Failed to get game state" });
    }
  });
  
  /**
   * POST /api/game/character
   * Crea un nuovo personaggio
   */
  app.post(`${apiRouter}/game/character`, async (req: Request, res: Response) => {
    try {
      // Valida i dati della richiesta
      const validatedData = characterSchema.parse(req.body);
      
      // Ottiene l'utente (per demo usiamo sempre ID 1)
      const userId = 1;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Crea il personaggio
      const character = await storage.createCharacter({
        ...validatedData,
        userId: user.id
      });
      
      // Aggiorna lo stato del gioco
      const gameState = await storage.getGameState(userId);
      if (gameState) {
        await storage.updateGameState(userId, {
          characterId: character.id,
          gameStarted: true
        });
      }
      
      // Aggiunge abilità predefinite al personaggio
      const skills = await storage.getSkills();
      for (const skill of skills) {
        await storage.addSkillToCharacter({
          characterId: character.id,
          skillId: skill.id,
          level: Math.floor(Math.random() * 3) + 1,
          progress: Math.floor(Math.random() * 40) + 10,
          maxLevel: 100
        });
      }
      
      res.status(201).json(character);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid character data", errors: fromZodError(error).message });
      }
      console.error("Failed to create character:", error);
      res.status(500).json({ message: "Failed to create character" });
    }
  });
  
  /**
   * POST /api/game/activity/:id
   * Esegue un'attività selezionata dal giocatore
   * Supporta anche l'esecuzione di sotto-attività con ID specifici
   */
  app.post(`${apiRouter}/game/activity/:id`, async (req: Request, res: Response) => {
    try {
      const activityId = parseInt(req.params.id);
      if (isNaN(activityId)) {
        return res.status(400).json({ message: "Invalid activity ID" });
      }
      
      // Ottiene il flag per le sotto-attività (se presente)
      const { isSubActivity = false } = req.body;
      
      // Ottiene l'utente e lo stato del gioco
      const userId = 1;
      const gameState = await storage.getGameState(userId);
      if (!gameState || !gameState.characterId) {
        return res.status(400).json({ message: "Game not started or character not created" });
      }
      
      // Ottiene il personaggio
      const character = await storage.getCharacter(gameState.characterId);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      
      // Comportamento diverso per attività e sotto-attività
      let activity;
      let effects;
      let activityDuration;
      
      if (isSubActivity) {
        // Gestione delle sotto-attività (basata sugli ID predefiniti nel client)
        const subActivityEffects: Record<number, { effects: Record<string, number>, duration: number }> = {
          // Attività sociale
          2001: { effects: { energy: -10, reputation: 8 }, duration: 1 },
          2002: { effects: { energy: -5, respect: 5 }, duration: 0.5 },
          2003: { effects: { energy: -5, reputation: 4 }, duration: 0.5 },
          
          // Attività acquisti
          2004: { effects: { energy: -10, style: 5 }, duration: 0.5 },
          2005: { effects: { energy: -10, money: 15 }, duration: 0.5 },
          2006: { effects: { energy: -5, respect: 4 }, duration: 0.5 },
          
          // Attività fitness
          2007: { effects: { energy: -20, respect: 10 }, duration: 1 },
          2008: { effects: { energy: -5, reputation: 7 }, duration: 0.5 },
          2009: { effects: { energy: -5, respect: 6 }, duration: 0.5 },
          
          // Attività divertimento
          2010: { effects: { energy: -15, reputation: 12 }, duration: 1 },
          2011: { effects: { money: -20, reputation: 8 }, duration: 0.5 },
          2012: { effects: { energy: -5, respect: 8 }, duration: 0.5 },
          
          // Attività lavoro
          2013: { effects: { energy: -15, money: 40 }, duration: 1 },
          2014: { effects: { energy: 5, money: 10 }, duration: 0.5 },
          2015: { effects: { energy: -5, money: 25 }, duration: 0.5 },
          
          // Attività riposo
          2016: { effects: { energy: 15 }, duration: 0.5 },
          2017: { effects: { energy: 10 }, duration: 1 },
          2018: { effects: { energy: 8 }, duration: 0.5 },
          
          // Attività evento
          2019: { effects: { energy: -5, respect: 7 }, duration: 0.5 },
          2020: { effects: { energy: -5, reputation: 5 }, duration: 0.5 },
          2021: { effects: { energy: -5, respect: 4 }, duration: 0.5 },
          
          // Attività obbligo
          2022: { effects: { energy: -10, respect: -2 }, duration: 1 },
          2023: { effects: { energy: -5, reputation: 3 }, duration: 0.5 },
          2024: { effects: { energy: -5, respect: -1 }, duration: 0.5 },
          
          // Sotto-attività specifiche per Giro in Piazza
          3001: { effects: { energy: -5, reputation: 7 }, duration: 0.5 },
          3002: { effects: { energy: -5, style: 6 }, duration: 0.5 },
          3003: { effects: { energy: -5, reputation: 8 }, duration: 0.5 },
          
          // Sotto-attività specifiche per Shopping al Centro
          3004: { effects: { energy: -5, money: 20 }, duration: 0.5 },
          3005: { effects: { energy: -10, style: 8 }, duration: 0.5 },
          3006: { effects: { money: -30, style: 10 }, duration: 0.5 },
          
          // Sotto-attività specifiche per Palestra
          3007: { effects: { energy: -25, respect: 12 }, duration: 1 },
          3008: { effects: { energy: -5, reputation: 5 }, duration: 0.5 },
          3009: { effects: { energy: -10, respect: 7 }, duration: 0.5 },
          
          // Sotto-attività specifiche per Serata in Discoteca
          3010: { effects: { energy: -15, reputation: 15 }, duration: 0.5 },
          3011: { effects: { energy: -5, respect: 6 }, duration: 0.5 },
          3012: { effects: { money: -100, reputation: 20 }, duration: 0.5 }
        };
        
        // Verifica che la sotto-attività esista
        if (!subActivityEffects[activityId]) {
          return res.status(404).json({ message: "Sub-activity not found" });
        }
        
        // Ottiene gli effetti e la durata della sotto-attività
        effects = subActivityEffects[activityId].effects;
        activityDuration = subActivityEffects[activityId].duration;
        
        // Ottiene l'attività principale (per il risultato)
        const mainActivityCategories: Record<number, string> = {
          2001: "Giro in Piazza", 2002: "Giro in Piazza", 2003: "Giro in Piazza",
          2004: "Shopping al Centro", 2005: "Shopping al Centro", 2006: "Shopping al Centro",
          2007: "Palestra", 2008: "Palestra", 2009: "Palestra",
          2010: "Serata in Discoteca", 2011: "Serata in Discoteca", 2012: "Serata in Discoteca",
          2013: "Lavoretto Part-time", 2014: "Lavoretto Part-time", 2015: "Lavoretto Part-time",
          2016: "Riposo a Casa", 2017: "Riposo a Casa", 2018: "Riposo a Casa",
          2019: "Raduno di Auto Tuning", 2020: "Raduno di Auto Tuning", 2021: "Raduno di Auto Tuning",
          2022: "Vai a Scuola", 2023: "Vai a Scuola", 2024: "Vai a Scuola",
          3001: "Giro in Piazza", 3002: "Giro in Piazza", 3003: "Giro in Piazza",
          3004: "Shopping al Centro", 3005: "Shopping al Centro", 3006: "Shopping al Centro",
          3007: "Palestra", 3008: "Palestra", 3009: "Palestra",
          3010: "Serata in Discoteca", 3011: "Serata in Discoteca", 3012: "Serata in Discoteca"
        };
        
        // Imposta il titolo dell'attività principale per generare il testo del risultato
        const mainActivityTitle = mainActivityCategories[activityId] || "Attività Generica";
        activity = { title: mainActivityTitle };
      } else {
        // Normale gestione delle attività
        activity = await storage.getActivity(activityId);
        if (!activity) {
          return res.status(404).json({ message: "Activity not found" });
        }
        
        effects = activity.effects as Record<string, number>;
        activityDuration = activity.duration;
      }
      
      // Controlla se ci sono abbastanza ore rimaste
      if (gameState.hoursLeft < activityDuration) {
        return res.status(400).json({ message: "Not enough hours left in the day" });
      }
      
      // Controlla se il personaggio ha risorse sufficienti per l'attività
      for (const [stat, value] of Object.entries(effects)) {
        if (value < 0 && (character as any)[stat] + value < 0) {
          // Messaggi personalizzati in base all'attività e alla risorsa mancante
          let errorMessage = "";
          
          if (stat === 'money') {
            switch (activity.title) {
              case "Shopping al Centro":
                errorMessage = "Non hai abbastanza soldi per andare a fare shopping. Prova a fare un lavoretto part-time!";
                break;
              case "Serata in Discoteca":
                errorMessage = "Non puoi permetterti di andare in discoteca. Trovati un lavoretto prima!";
                break;
              default:
                errorMessage = "Non hai abbastanza soldi per questa attività. Devi guadagnare un po' di cash!";
            }
          } else if (stat === 'energy') {
            switch (activity.title) {
              case "Palestra":
                errorMessage = "Sei troppo stanco per allenarti. Riposati un po' prima!";
                break;
              case "Serata in Discoteca":
                errorMessage = "Non hai abbastanza energia per una serata in discoteca. Fatti una dormita prima!";
                break;
              case "Lavoretto Part-time":
                errorMessage = "Sei troppo esausto per lavorare. Riposati a casa e riprova dopo!";
                break;
              case "Vai a Scuola":
                errorMessage = "Sei troppo stanco per andare a scuola. Recupera le forze prima!";
                break;
              default:
                errorMessage = "Non hai abbastanza energia per questa attività. Riposati un po'!";
            }
          } else if (stat === 'respect') {
            errorMessage = "Non hai abbastanza rispetto tra i maranza per questa attività. Guadagnati una reputazione!";
          } else if (stat === 'reputation') {
            errorMessage = "La tua reputazione è troppo bassa per questa attività. Fatti conoscere di più in giro!";
          } else {
            errorMessage = `Non hai abbastanza ${stat} per questa attività.`;
          }
          
          return res.status(400).json({ message: errorMessage });
        }
      }
      
      // Applica gli effetti dell'attività al personaggio
      const updates: Partial<typeof character> = { ...character };
      
      // Tiene traccia dei cambiamenti per il risultato
      const changes = {
        moneyChange: 0,
        reputationChange: 0,
        styleChange: 0,
        energyChange: 0,
        respectChange: 0
      };
      
      // Applica ogni effetto
      for (const [stat, value] of Object.entries(effects)) {
        if (stat in character) {
          if (stat === 'money') {
            // Assicura che i soldi non vadano sotto 0
            updates.money = Math.max(0, character.money + value);
            changes.moneyChange = value;
          } else {
            // Per gli altri stat, assicura che rimangano tra 0 e 100
            const newValue = Math.max(0, Math.min(100, (character as any)[stat] + value));
            (updates as any)[stat] = newValue;
            
            // Registra il cambiamento
            if (stat === 'reputation') changes.reputationChange = value;
            if (stat === 'style') changes.styleChange = value;
            if (stat === 'energy') changes.energyChange = value;
            if (stat === 'respect') changes.respectChange = value;
          }
        }
      }
      
      // Aggiorna il personaggio
      await storage.updateCharacter(character.id, updates);
      
      // Avanza il tempo
      await advanceTime(userId, activityDuration);
      
      // Genera una possibilità casuale per un nuovo contatto (solo per le attività complete, non le sotto-attività)
      let newContact = null;
      if (!isSubActivity && Math.random() < 0.5) {
        const contactResult = generateRandomContact(character.id, gameState.day);
        if (contactResult) {
          newContact = await storage.createContact(contactResult.contact);
        }
      }
      
      // Genera il testo del risultato
      const resultText = generateResultText(activity.title);
      
      // Aggiorna il progresso delle abilità
      let skillProgress = null;
      const skills = await storage.getCharacterSkills(character.id);
      
      // Abilità che potrebbero migliorare in base all'attività
      const skillMap: Record<string, string[]> = {
        "Shopping al Centro": ["Stile nel Vestire", "Contrattazione"],
        "Palestra": ["Ballo"],
        "Serata in Discoteca": ["Ballo", "Carisma Sociale"],
        "Giro in Piazza": ["Parlata Slang", "Carisma Sociale"],
        "Social Media": ["Carisma Sociale"],
        "Sfida di Stile": ["Stile nel Vestire"],
        "Raduno di Auto Tuning": ["Carisma Sociale"],
        "Vai a Scuola": ["Contrattazione", "Carisma Sociale"]
      };
      
      const relevantSkills = skillMap[activity.title] || [];
      if (relevantSkills.length > 0 && Math.random() < 0.7) {
        // Scegli un'abilità rilevante casuale
        const skillName = relevantSkills[Math.floor(Math.random() * relevantSkills.length)];
        const skill = skills.find(s => s.name === skillName);
        
        if (skill) {
          // Migliora l'abilità
          const progressGain = Math.floor(Math.random() * 15) + 5;
          let newProgress = skill.progress + progressGain;
          let newLevel = skill.level;
          
          // Aumenta il livello se il progresso supera il maxLevel
          if (newProgress >= skill.maxLevel && skill.level < 5) {
            newProgress = newProgress - skill.maxLevel;
            newLevel = skill.level + 1;
          }
          
          await storage.updateCharacterSkill(character.id, skill.id, {
            progress: newProgress,
            level: newLevel
          });
          
          skillProgress = {
            skillId: skill.id,
            value: progressGain
          };
        }
      }
      
      // Invia il risultato dell'attività
      res.json({
        text: resultText,
        ...changes,
        newContact,
        skillProgress
      });
    } catch (error) {
      console.error("Failed to complete activity:", error);
      res.status(500).json({ message: "Failed to complete activity" });
    }
  });
  
  /**
   * POST /api/game/advance-time
   * Avanza manualmente il tempo (es. dormire)
   */
  app.post(`${apiRouter}/game/advance-time`, async (req: Request, res: Response) => {
    try {
      const hoursSchema = z.object({
        hours: z.number().int().min(1).max(12)
      });
      
      const { hours } = hoursSchema.parse(req.body);
      const userId = 1;
      
      await advanceTime(userId, hours);
      
      res.json({ message: "Time advanced successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid hours value", errors: fromZodError(error).message });
      }
      console.error("Failed to advance time:", error);
      res.status(500).json({ message: "Failed to advance time" });
    }
  });
  
  /**
   * POST /api/game/reset
   * Reimposta il gioco allo stato iniziale
   */
  app.post(`${apiRouter}/game/reset`, async (req: Request, res: Response) => {
    try {
      const userId = 1;
      
      await storage.resetGameState(userId);
      
      res.json({ message: "Game reset successfully" });
    } catch (error) {
      console.error("Failed to reset game:", error);
      res.status(500).json({ message: "Failed to reset game" });
    }
  });

  /**
   * POST /api/game/shop/purchase
   * Acquista un oggetto dal negozio
   */
  app.post(`${apiRouter}/game/shop/purchase`, async (req: Request, res: Response) => {
    try {
      const { itemId } = req.body;
      if (!itemId || isNaN(parseInt(itemId))) {
        return res.status(400).json({ message: "ID oggetto non valido" });
      }
      
      // Ottiene l'utente (per demo usiamo sempre ID 1)
      const userId = 1;
      const gameState = await storage.getGameState(userId);
      if (!gameState || !gameState.characterId) {
        return res.status(400).json({ message: "Devi prima creare un personaggio" });
      }
      
      // Ottiene il personaggio e l'oggetto
      const character = await storage.getCharacter(gameState.characterId);
      const item = await storage.getItem(parseInt(itemId));
      
      if (!character) {
        return res.status(404).json({ message: "Personaggio non trovato" });
      }
      
      if (!item) {
        return res.status(404).json({ message: "Oggetto non trovato" });
      }
      
      // Controlla se l'oggetto è acquistabile
      if (!item.isInShop) {
        return res.status(400).json({ message: "Questo oggetto non è disponibile per l'acquisto" });
      }
      
      // Controlla se l'oggetto è già posseduto
      const characterItems = await storage.getCharacterItems(character.id);
      const alreadyOwned = characterItems.some(i => i.id === item.id);
      if (alreadyOwned) {
        return res.status(400).json({ message: "Possiedi già questo oggetto" });
      }
      
      // Controlla se il personaggio ha abbastanza soldi
      if (character.money < item.price) {
        return res.status(400).json({ message: `Non hai abbastanza soldi. Ti servono ${item.price - character.money}€ in più.` });
      }
      
      // Controlla eventuali requisiti di giorno
      if (item.unlockDay && gameState.day < item.unlockDay) {
        return res.status(400).json({ message: `Questo oggetto sarà disponibile dal giorno ${item.unlockDay}` });
      }
      
      // Acquista l'oggetto
      await storage.updateCharacter(character.id, {
        money: character.money - item.price
      });
      
      // Aggiunge l'oggetto all'inventario
      await storage.addItemToCharacter({
        characterId: character.id,
        itemId: item.id,
        acquired: true,
        acquiredDay: gameState.day
      });
      
      // Applica immediatamente gli effetti permanenti dell'oggetto
      // In un'implementazione più complessa, gli effetti verrebbero applicati quando l'oggetto è equipaggiato
      const updates: Partial<Character> = {};
      let applyEffects = false;
      
      // Per ora, consideriamo che tutti gli oggetti hanno effetti permanenti una volta acquistati
      for (const effect of item.effects) {
        if (!effect.isDebuff && effect.type !== 'money') { // Skippa gli effetti monetari
          applyEffects = true;
          if (effect.type === 'style') {
            updates.style = Math.min(100, (character.style + effect.value));
          } else if (effect.type === 'respect') {
            updates.respect = Math.min(100, (character.respect + effect.value));
          } else if (effect.type === 'reputation') {
            updates.reputation = Math.min(100, (character.reputation + effect.value));
          } else if (effect.type === 'energy') {
            updates.energy = Math.min(100, (character.energy + effect.value));
          }
        }
      }
      
      // Applica gli effetti se necessario
      if (applyEffects) {
        await storage.updateCharacter(character.id, updates);
      }
      
      res.json({
        success: true, 
        message: `Hai acquistato ${item.name}!`, 
        newMoney: character.money - item.price,
        item
      });
    } catch (error) {
      console.error("Failed to purchase item:", error);
      res.status(500).json({ message: "Impossibile completare l'acquisto" });
    }
  });
  
  /**
   * GET /api/game/shop
   * Ottiene la lista di oggetti disponibili nel negozio
   */
  app.get(`${apiRouter}/game/shop`, async (req: Request, res: Response) => {
    try {
      // Ottiene l'utente (per demo usiamo sempre ID 1)
      const userId = 1;
      const gameState = await storage.getGameState(userId);
      if (!gameState || !gameState.characterId) {
        return res.status(400).json({ message: "Devi prima creare un personaggio" });
      }
      
      // Ottiene tutti gli oggetti
      const allItems = await storage.getItems();
      
      // Filtra solo gli oggetti disponibili nel negozio e adatti al giorno attuale
      const shopItems = allItems.filter(item => 
        item.isInShop && (!item.unlockDay || item.unlockDay <= gameState.day)
      );
      
      // Ottiene gli oggetti già posseduti per marcarli come tali
      const characterItems = await storage.getCharacterItems(gameState.characterId);
      const characterItemIds = characterItems.map(item => item.id);
      
      // Arricchisce gli oggetti del negozio con informazioni sul possesso
      const enrichedShopItems = shopItems.map(item => ({
        ...item,
        isOwned: characterItemIds.includes(item.id)
      }));
      
      res.json(enrichedShopItems);
    } catch (error) {
      console.error("Failed to get shop items:", error);
      res.status(500).json({ message: "Impossibile ottenere gli oggetti del negozio" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
