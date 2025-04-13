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
import LoadingScreen from "@/components/LoadingScreen";

interface GameContextType {
  game: GameState;
  selectedActivity: Activity | null;
  activityResult: ActivityResult | null;
  setSelectedActivity: (activity: Activity | null) => void;
  setActivityResult: (result: ActivityResult | null) => void;
  doActivity: (activityId: number) => Promise<void>;
  advanceTime: (hours: number) => Promise<void>;
  createCharacter: (character: Partial<Character>) => Promise<void>;
  isCreatingCharacter: boolean;
  isPendingActivity: boolean;
  isLoadingGame: boolean;
  showCharacterCreation: boolean;
  setShowCharacterCreation: (show: boolean) => void;
  showActivityModal: boolean;
  setShowActivityModal: (show: boolean) => void;
  showResultModal: boolean;
  setShowResultModal: (show: boolean) => void;
  resetGame: () => Promise<void>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

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

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<GameState>(defaultGameState);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activityResult, setActivityResult] = useState<ActivityResult | null>(null);
  const [showCharacterCreation, setShowCharacterCreation] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [activeTab, setActiveTab] = useState("activities");
  const { toast } = useToast();

  // Fetch game state
  const { data: gameData, isLoading: isLoadingGame, refetch } = useQuery({
    queryKey: ['/api/game/state'],
    onSuccess: (data) => {
      setGame(data);
      
      // If game is not started and character is null, show character creation
      if (!data.gameStarted && !data.character) {
        setShowCharacterCreation(true);
      }
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile caricare il gioco. Riprova più tardi.",
        variant: "destructive"
      });
      console.error("Failed to load game:", error);
    }
  });

  // Create character mutation
  const { mutate: createCharacterMutate, isPending: isCreatingCharacter } = useMutation({
    mutationFn: async (character: Partial<Character>) => {
      return await apiRequest("POST", "/api/game/character", character);
    },
    onSuccess: () => {
      refetch();
      setShowCharacterCreation(false);
      toast({
        title: "Personaggio creato!",
        description: "Il tuo maranza è pronto per iniziare la sua avventura."
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile creare il personaggio. Riprova.",
        variant: "destructive"
      });
      console.error("Failed to create character:", error);
    }
  });

  // Do activity mutation
  const { mutate: doActivityMutate, isPending: isPendingActivity } = useMutation({
    mutationFn: async (activityId: number) => {
      return await apiRequest("POST", `/api/game/activity/${activityId}`, {});
    },
    onSuccess: async (response) => {
      const result = await response.json() as ActivityResult;
      setActivityResult(result);
      setShowActivityModal(false);
      setShowResultModal(true);
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile completare l'attività. Riprova.",
        variant: "destructive"
      });
      console.error("Failed to complete activity:", error);
    }
  });

  // Advance time mutation
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
        variant: "destructive"
      });
      console.error("Failed to advance time:", error);
    }
  });

  // Reset game mutation
  const { mutate: resetGameMutate } = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/game/reset`, {});
    },
    onSuccess: () => {
      refetch();
      setShowCharacterCreation(true);
      toast({
        title: "Gioco resettato",
        description: "Il gioco è stato resettato con successo."
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

  const doActivity = async (activityId: number) => {
    doActivityMutate(activityId);
  };

  const advanceTime = async (hours: number) => {
    advanceTimeMutate(hours);
  };

  const createCharacter = async (character: Partial<Character>) => {
    createCharacterMutate(character);
  };

  const resetGame = async () => {
    resetGameMutate();
  };

  // Effect to update game state when gameData changes
  useEffect(() => {
    if (gameData) {
      setGame(gameData);
    }
  }, [gameData]);

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

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
