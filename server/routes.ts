import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

// Helper function to format time
function formatTime(hours: number, minutes: number): string {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Helper function to advance time
async function advanceTime(userId: number, hoursToAdvance: number): Promise<void> {
  const gameState = await storage.getGameState(userId);
  if (!gameState) {
    throw new Error("Game state not found");
  }
  
  // Parse current time
  const [hourStr, minuteStr] = gameState.time.split(':');
  let hours = parseInt(hourStr);
  let minutes = parseInt(minuteStr);
  
  // Add hours
  hours += hoursToAdvance;
  
  // Handle day change if hours > 24
  let newDay = gameState.day;
  if (hours >= 24) {
    hours -= 24;
    newDay += 1;
  }
  
  // Format new time
  const newTime = formatTime(hours, minutes);
  
  // Calculate hours left in the day
  const hoursLeft = Math.max(0, 24 - hours - (minutes > 0 ? 1 : 0));
  
  // Update game state
  await storage.updateGameState(userId, {
    time: newTime,
    day: newDay,
    hoursLeft
  });
  
  // If it's a new day, refill energy for the character
  if (newDay > gameState.day && gameState.characterId) {
    const character = await storage.getCharacter(gameState.characterId);
    if (character) {
      await storage.updateCharacter(character.id, {
        energy: 100
      });
    }
  }
}

// Character schema for validation
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

// Generate result text based on activity
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

  // Get random result for the activity or use a default
  const results = possibleResults[activityTitle] || ["Hai completato l'attività con successo!"];
  return results[Math.floor(Math.random() * results.length)];
}

// Generate random contacts
function generateRandomContact(characterId: number, day: number): { contact: any, name: string } | null {
  // 50% chance of getting a contact
  if (Math.random() < 0.5) return null;
  
  const firstNames = ["Marco", "Luca", "Sara", "Giulia", "Alessandro", "Matteo", "Federico", "Simone", "Manuel", "Lorenzo"];
  const lastNames = ["Bello", "Furioso", "Diva", "Style", "Bomber", "King", "Cool", "Top", "Ferro", "Boss"];
  const types = ["Amico d'infanzia", "Conosciuto in discoteca", "Compagno di palestra", "Amico di amici", "Conosciuto al raduno"];
  const respects = ["basso", "medio", "alto"];
  const colors = ["primary", "secondary", "info", "amber-400", "green-500"];
  
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

export async function registerRoutes(app: Express): Promise<Server> {
  // prefixing all routes with /api
  const apiRouter = '/api';
  
  // Check or create current game state
  app.get(`${apiRouter}/game/state`, async (req: Request, res: Response) => {
    try {
      // Get or create default user (for demo purposes we always use ID 1)
      const userId = 1;
      let user = await storage.getUser(userId);
      if (!user) {
        user = await storage.createUser({
          username: "player",
          password: "password"
        });
      }
      
      // Get game state
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
      
      // Get character if exists
      const character = gameState.characterId 
        ? await storage.getCharacter(gameState.characterId)
        : null;
      
      // Get available activities
      const availableActivities = await storage.getAvailableActivities(gameState.day);
      
      // Get inventory
      const inventory = character ? await storage.getCharacterItems(character.id) : [];
      
      // Get skills
      const skills = character ? await storage.getCharacterSkills(character.id) : [];
      
      // Get contacts
      const contacts = character ? await storage.getContacts(character.id) : [];
      
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
  
  // Create character
  app.post(`${apiRouter}/game/character`, async (req: Request, res: Response) => {
    try {
      // Validate request
      const validatedData = characterSchema.parse(req.body);
      
      // Get user (for demo we always use ID 1)
      const userId = 1;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create character
      const character = await storage.createCharacter({
        ...validatedData,
        userId: user.id
      });
      
      // Update game state
      const gameState = await storage.getGameState(userId);
      if (gameState) {
        await storage.updateGameState(userId, {
          characterId: character.id,
          gameStarted: true
        });
      }
      
      // Add default skills to character
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
  
  // Do activity
  app.post(`${apiRouter}/game/activity/:id`, async (req: Request, res: Response) => {
    try {
      const activityId = parseInt(req.params.id);
      if (isNaN(activityId)) {
        return res.status(400).json({ message: "Invalid activity ID" });
      }
      
      // Get activity
      const activity = await storage.getActivity(activityId);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      // Get user and game state
      const userId = 1;
      const gameState = await storage.getGameState(userId);
      if (!gameState || !gameState.characterId) {
        return res.status(400).json({ message: "Game not started or character not created" });
      }
      
      // Check if enough hours left
      if (gameState.hoursLeft < activity.duration) {
        return res.status(400).json({ message: "Not enough hours left in the day" });
      }
      
      // Get character
      const character = await storage.getCharacter(gameState.characterId);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      
      // Apply activity effects to character
      const updates: Partial<typeof character> = { ...character };
      const effects = activity.effects as Record<string, number>;
      
      // Track changes for result
      const changes = {
        moneyChange: 0,
        reputationChange: 0,
        styleChange: 0,
        energyChange: 0,
        respectChange: 0
      };
      
      // Apply each effect
      for (const [stat, value] of Object.entries(effects)) {
        if (stat in character) {
          const newValue = Math.max(0, Math.min(100, (character as any)[stat] + value));
          
          // Special case for money which can go above 100
          if (stat === 'money') {
            updates.money = character.money + value;
          } else {
            (updates as any)[stat] = newValue;
          }
          
          // Record change
          if (stat === 'money') changes.moneyChange = value;
          if (stat === 'reputation') changes.reputationChange = value;
          if (stat === 'style') changes.styleChange = value;
          if (stat === 'energy') changes.energyChange = value;
          if (stat === 'respect') changes.respectChange = value;
        }
      }
      
      // Update character
      await storage.updateCharacter(character.id, updates);
      
      // Advance time
      await advanceTime(userId, activity.duration);
      
      // Generate random chance for new contact
      const contactResult = generateRandomContact(character.id, gameState.day);
      let newContact = null;
      if (contactResult) {
        newContact = await storage.createContact(contactResult.contact);
      }
      
      // Generate result text
      const resultText = generateResultText(activity.title);
      
      // Update skill progress
      let skillProgress = null;
      const skills = await storage.getCharacterSkills(character.id);
      
      // Skills that might improve based on activity
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
        // Pick a random relevant skill
        const skillName = relevantSkills[Math.floor(Math.random() * relevantSkills.length)];
        const skill = skills.find(s => s.name === skillName);
        
        if (skill) {
          // Improve the skill
          const progressGain = Math.floor(Math.random() * 15) + 5;
          let newProgress = skill.progress + progressGain;
          let newLevel = skill.level;
          
          // Level up if progress exceeds maxLevel
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
      
      // Send activity result
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
  
  // Advance time manually (e.g., sleep)
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
  
  // Reset game
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

  const httpServer = createServer(app);
  return httpServer;
}
