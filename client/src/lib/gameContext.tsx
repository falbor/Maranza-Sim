/**
 * Contesto di gioco per Maranza Simulator
 * Gestisce lo stato globale del gioco, le query API, e le mutazioni per le azioni di gioco
 * Fornisce un'interfaccia unificata per l'interazione con il backend
 */
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Character, 
  Item, 
  Skill, 
  Contact, 
  Activity, 
  ActivityResult,
  GameState
} from "@/lib/types";

/**
 * Definizione dei tipi per il contesto di gioco
 * Include tutti i metodi e gli stati necessari all'interfaccia utente
 */
interface GameContextType {
  game: GameState;                                         // Stato attuale del gioco
  selectedActivity: Activity | null;                       // Attività selezionata dall'utente
  activityResult: ActivityResult | null;                   // Risultato dell'ultima attività completata
  setSelectedActivity: (activity: Activity | null) => void; // Imposta l'attività selezionata
  setActivityResult: (result: ActivityResult | null) => void; // Imposta il risultato dell'attività
  doActivity: (activityId: number) => Promise<void>;       // Esegue un'attività
  advanceTime: (hours: number) => Promise<void>;           // Avanza il tempo di gioco
  createCharacter: (character: Partial<Character>) => Promise<void>; // Crea un nuovo personaggio
  isCreatingCharacter: boolean;                            // Flag per creazione personaggio in corso
  isPendingActivity: boolean;                              // Flag per attività in corso
  isLoadingGame: boolean;                                  // Flag per caricamento del gioco in corso
  showCharacterCreation: boolean;                          // Flag per mostrare schermata creazione personaggio
  setShowCharacterCreation: (show: boolean) => void;       // Imposta visibilità creazione personaggio
  showActivityModal: boolean;                              // Flag per mostrare modale attività
  setShowActivityModal: (show: boolean) => void;           // Imposta visibilità modale attività
  showResultModal: boolean;                                // Flag per mostrare modale risultato
  setShowResultModal: (show: boolean) => void;             // Imposta visibilità modale risultato
  resetGame: () => Promise<void>;                          // Reimposta il gioco allo stato iniziale
  activeTab: string;                                       // Tab attiva nell'interfaccia
  setActiveTab: (tab: string) => void;                     // Imposta la tab attiva
}

/**
 * Stato predefinito del gioco
 * Usato come valore iniziale prima del caricamento dei dati dal server
 */
const defaultGameState: GameState = {
  day: 1,
  time: "08:00",
  gameStarted: false,
  availableActivities: [],
  inventory: [],
  skills: [],
  contacts: [],
  character: null,
  hoursLeft: 16
};

// Creazione del contesto React
const GameContext = createContext<GameContextType | undefined>(undefined);

/**
 * Provider del contesto di gioco
 * Gestisce tutte le interazioni con il backend e mantiene lo stato globale del gioco
 * 
 * @param children - Componenti React figli che avranno accesso al contesto
 */
export function GameProvider({ children }: { children: ReactNode }) {
  // Stato locale del gioco
  const [game, setGame] = useState<GameState>(defaultGameState);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activityResult, setActivityResult] = useState<ActivityResult | null>(null);
  const [showCharacterCreation, setShowCharacterCreation] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [activeTab, setActiveTab] = useState("activities");
  const { toast } = useToast();

  /**
   * Query per recuperare lo stato del gioco dal server
   * Viene eseguita all'avvio e dopo ogni azione che modifica lo stato
   */
  const { data: gameData, isLoading: isLoadingGame, refetch } = useQuery({
    queryKey: ['/api/game/state'],
    onSuccess: (data) => {
      setGame(data);
      
      // Se il gioco non è iniziato e non c'è un personaggio, mostra la creazione personaggio
      if (!data.gameStarted && !data.character) {
        setShowCharacterCreation(true);
      }
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile caricare il gioco. Riprova più tardi.",
        variant: "destructive",
        duration: 3000
      });
      console.error("Failed to load game:", error);
    }
  });

  /**
   * Mutazione per creare un nuovo personaggio
   * Invia i dati al backend e aggiorna lo stato locale dopo il successo
   */
  const { mutate: createCharacterMutate, isPending: isCreatingCharacter } = useMutation({
    mutationFn: async (character: Partial<Character>) => {
      return await apiRequest("POST", "/api/game/character", character);
    },
    onSuccess: () => {
      refetch();
      setShowCharacterCreation(false);
      toast({
        title: "Personaggio creato!",
        description: "Il tuo maranza è pronto per iniziare la sua avventura.",
        duration: 3000
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile creare il personaggio. Riprova.",
        variant: "destructive",
        duration: 3000
      });
      console.error("Failed to create character:", error);
    }
  });

  /**
   * Mutazione per eseguire un'attività
   * Invia l'ID dell'attività al backend e gestisce il risultato o gli errori
   */
  const { mutate: doActivityMutate, isPending: isPendingActivity } = useMutation({
    mutationFn: async (activityId: number) => {
      return await apiRequest("POST", `/api/game/activity/${activityId}`, {});
    },
    onError: (error: any) => {
      // Gestione avanzata degli errori con messaggi personalizzati
      let errorMessage = "Impossibile completare l'attività. Riprova.";
      let errorTitle = "Errore";
      
      if (error.message) {
        // Estrai il messaggio pulito rimuovendo il codice di stato e formattandolo correttamente
        let cleanMessage = "";
        
        // Verifica se il messaggio è nel formato "codice: messaggio" o contiene JSON
        if (error.message.includes(": ")) {
          // Prendi solo la parte dopo i due punti e spazio
          cleanMessage = error.message.split(": ").slice(1).join(": ").trim();
        } else {
          cleanMessage = error.message;
        }

        // Prova a estrarre il messaggio da un possibile formato JSON
        try {
          // Verifica se il messaggio è in formato JSON
          const jsonMatch = cleanMessage.match(/{.*}/);
          if (jsonMatch) {
            const jsonObj = JSON.parse(jsonMatch[0]);
            if (jsonObj.message) {
              cleanMessage = jsonObj.message;
            }
          }
        } catch (e) {
          // Non è un JSON valido, continuiamo con il messaggio estratto
        }
        
        // Rimuovi numeri di status o prefissi tecnici
        cleanMessage = cleanMessage.replace(/^\d+\s*:\s*/, '');
        cleanMessage = cleanMessage.replace(/^Error:\s*/i, '');
        
        // Controllo dei messaggi relativi ai soldi
        if (cleanMessage.includes("soldi") || cleanMessage.includes("money") || cleanMessage.includes("cash")) {
          errorTitle = "Soldi Insufficienti";
          errorMessage = cleanMessage;
        }
        // Controllo dei messaggi relativi allo shopping
        else if (cleanMessage.includes("shopping") || cleanMessage.includes("Shopping")) {
          errorTitle = "Soldi Insufficienti per lo Shopping";
          errorMessage = cleanMessage;
        }
        // Controllo dei messaggi relativi alla discoteca
        else if (cleanMessage.includes("discoteca") || cleanMessage.includes("Discoteca")) {
          errorTitle = "Soldi Insufficienti per la Discoteca";
          errorMessage = cleanMessage;
        }
        // Controllo del tempo insufficiente
        else if (cleanMessage.includes("Not enough hours") || cleanMessage.includes("ore rimaste") || cleanMessage.includes("tempo")) {
          errorTitle = "Tempo Insufficiente";
          errorMessage = "Non hai abbastanza ore rimaste in questo giorno per completare questa attività.";
        }
        // Controllo energia insufficiente
        else if (cleanMessage.includes("energy") || cleanMessage.includes("energia")) {
          errorTitle = "Energia Insufficiente";
          errorMessage = cleanMessage;
        }
        // Per altri errori, usa il messaggio pulito
        else {
          errorMessage = cleanMessage;
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
        duration: 3000
      });
      
      console.error("Failed to complete activity:", error);
    },
    onSuccess: async (response) => {
      const result = await response.json() as ActivityResult;
      setActivityResult(result);
      setShowActivityModal(false);
      setShowResultModal(true);
      refetch();
    }
  });

  /**
   * Mutazione per avanzare il tempo di gioco
   * Utile per saltare ore durante il riposo o altre attività di tempo libero
   */
  const { mutate: advanceTimeMutate } = useMutation({
    mutationFn: async (hours: number) => {
      return await apiRequest("POST", `/api/game/advance-time`, { hours });
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile avanzare il tempo. Riprova.",
        variant: "destructive",
        duration: 3000
      });
      console.error("Failed to advance time:", error);
    }
  });

  /**
   * Mutazione per resettare completamente il gioco
   * Riporta tutto allo stato iniziale e richiede la creazione di un nuovo personaggio
   */
  const { mutate: resetGameMutate } = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/game/reset`, {});
    },
    onSuccess: () => {
      refetch();
      setShowCharacterCreation(true);
      toast({
        title: "Gioco resettato",
        description: "Il gioco è stato resettato con successo.",
        duration: 3000
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile resettare il gioco. Riprova.",
        variant: "destructive"
      });
      console.error("Failed to reset game:", error);
    }
  });

  /**
   * Funzione per eseguire un'attività
   * Wrapper della mutazione doActivityMutate per semplicità d'uso
   */
  const doActivity = async (activityId: number) => {
    doActivityMutate(activityId);
  };

  /**
   * Funzione per avanzare il tempo di gioco
   * Wrapper della mutazione advanceTimeMutate per semplicità d'uso
   */
  const advanceTime = async (hours: number) => {
    advanceTimeMutate(hours);
  };

  /**
   * Funzione per creare un nuovo personaggio
   * Wrapper della mutazione createCharacterMutate per semplicità d'uso
   */
  const createCharacter = async (character: Partial<Character>) => {
    createCharacterMutate(character);
  };

  /**
   * Funzione per resettare il gioco
   * Wrapper della mutazione resetGameMutate per semplicità d'uso
   */
  const resetGame = async () => {
    resetGameMutate();
  };

  /**
   * Effect per aggiornare lo stato del gioco quando gameData cambia
   * Assicura che il componente rifletta sempre i dati più recenti
   */
  useEffect(() => {
    if (gameData) {
      setGame(gameData);
    }
  }, [gameData]);

  /**
   * Effect per gestire gli eventi di salvataggio
   * Mostra un toast all'utente quando il gioco viene salvato automaticamente
   */
  useEffect(() => {
    // Aggiunge un event listener per i salvataggi automatici
    const handleStorageSave = () => {
      toast({
        title: "Gioco Salvato",
        description: "I tuoi progressi sono stati salvati automaticamente.",
        duration: 2000
      });
    };

    window.addEventListener('maranza-save', handleStorageSave);
    return () => window.removeEventListener('maranza-save', handleStorageSave);
  }, [toast]);

  // Fornisce tutte le funzioni e gli stati necessari ai componenti figli
  return (
    <GameContext.Provider
      value={{
        game,
        selectedActivity,
        activityResult,
        setSelectedActivity,
        setActivityResult,
        doActivity,
        advanceTime,
        createCharacter,
        isCreatingCharacter,
        isPendingActivity,
        isLoadingGame,
        showCharacterCreation,
        setShowCharacterCreation,
        showActivityModal,
        setShowActivityModal,
        showResultModal,
        setShowResultModal,
        resetGame,
        activeTab,
        setActiveTab
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

/**
 * Hook personalizzato per accedere al contesto di gioco
 * Semplifica l'accesso allo stato e alle funzioni del gioco nei componenti
 * 
 * @throws Error se usato fuori da un GameProvider
 */
export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
