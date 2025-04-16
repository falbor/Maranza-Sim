/**
 * Componente principale della pagina di gioco di Maranza Simulator
 * Gestisce il layout, l'interfaccia utente e le interazioni principali del gioco
 */
import { useEffect, useState } from "react";
import { useGame } from "@/lib/gameContext";
import { useLocation } from "wouter";
import CharacterSection from "@/components/CharacterSection";
import ActivityCard from "@/components/ActivityCard";
import ActivityModal from "@/components/ActivityModal";
import ResultModal from "@/components/ResultModal";
import CharacterCreationModal from "@/components/CharacterCreationModal";
import OptionsModal from "@/components/OptionsModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Sun, Moon, Clock } from "lucide-react";

// Importa immagine del logo
import logoImage from "@/assets/icons/logo.png";
// Importa le immagini di sfondo e l'immagine maranza
import { citybg, stylebg, school1, parkbg1, parkbg2 } from "@/assets";

/**
 * Componente principale della pagina di gioco
 * Gestisce il layout, l'interfaccia utente e le interazioni principali
 */
const Game = () => {
  // Accedi allo stato globale del gioco tramite il hook useGame
  const { 
    game, 
    isLoadingGame, 
    activeTab, 
    setActiveTab 
  } = useGame();
  
  // Hook per la navigazione
  const [_, setLocation] = useLocation();
  
  // Stato locale per le opzioni e l'animazione dell'orologio
  const [showOptions, setShowOptions] = useState(false);
  const [currentSecond, setCurrentSecond] = useState(new Date().getSeconds());

  /**
   * Configura un timer per aggiornare i secondi correnti
   * Utilizzato per animazioni dell'UI e timing
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSecond(new Date().getSeconds());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  /**
   * Reindirizza alla home se il gioco non è iniziato o non c'è un personaggio
   * Protegge la pagina di gioco da accessi non autorizzati
   */
  useEffect(() => {
    if (!isLoadingGame && (!game.gameStarted || !game.character)) {
      setLocation("/");
    }
  }, [game, isLoadingGame, setLocation]);

  /**
   * Mostra lo scheletro di caricamento mentre il gioco sta caricando
   * o se il personaggio non è ancora disponibile
   */
  if (isLoadingGame || !game.character) {
    return (
      <div className="min-h-screen bg-background text-foreground p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        
        <div className="grid grid-cols-1 gap-4 mt-4">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col text-foreground relative" 
      style={{
        backgroundImage: `url(${school1})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Header - Barra superiore fissa con logo, data/ora e soldi */}
      <header className="sticky top-0 z-40 w-full border-b border-border/50 backdrop-blur-lg bg-black/70">
        <div className="container flex h-14 items-center">
          <div className="flex flex-1 items-center justify-between space-x-2">
            <div className="w-full flex justify-between items-center relative">
              {/* Lato sinistro - Solo logo */}
              <div className="flex items-center">
                <img src={logoImage} alt="Maranza Simulator" className="h-10 mr-1 ml-1" />
              </div>
              
              {/* Centro - Giorno e Orario */}
              <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
                <div className="flex items-center bg-black/30 px-3 py-1 rounded-full">
                  <span className="font-semibold text-white">Giorno {game.day}</span>
                  <Clock className="w-4 h-4 text-primary ml-2 mr-1" />
                  <span className="font-bold text-primary">{game.time}</span>
                  {(() => {
                    // Estrae l'ora dall'orario in formato 24 ore (hh:mm)
                    const timeStr = game.time;
                    const timeParts = timeStr.split(':');
                    const hour = parseInt(timeParts[0]);
                    const minute = parseInt(timeParts[1]);
                    
                    // Calcola il tempo in minuti dalla mezzanotte
                    const timeInMinutes = hour * 60 + minute;
                    
                    // Giorno: dalle 6:00 (360 minuti) alle 19:59 (1199 minuti)
                    return (timeInMinutes >= 360 && timeInMinutes < 1200) ? (
                      <Sun className="h-4 w-4 text-yellow-400 ml-2" />
                    ) : (
                      <Moon className="h-4 w-4 text-blue-300 ml-2" />
                    );
                  })()}
                </div>
              </div>
              
              {/* Lato destro - Soldi e Impostazioni */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-black/30 px-3 py-1 rounded-full">
                  <span className="font-bold text-primary">€{game.character.money}</span>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowOptions(true)}
                >
                  <Settings className="h-5 w-5 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenuto principale */}
      <main className="container z-10 relative flex flex-col flex-grow">
        <div className="flex-grow"></div>
        
        {/* Immagine maranza centrata orizzontalmente */}
        <div className="flex justify-center items-center mb-4" style={{ minHeight: "40vh" }}>
          <img 
            src={stylebg} 
            alt="Maranza" 
            className="object-contain max-h-[60vh] w-auto"
            style={{ maxWidth: "200%" }}
          />
        </div>
        
        {/* Griglia delle attività - posizionata nella parte inferiore della pagina */}
        <div className="mb-20">
          {game.availableActivities && game.availableActivities.length > 0 ? (
            <div className="bg-black/30 p-3 rounded-lg backdrop-blur-sm">
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 max-h-[16rem] overflow-y-auto">
                {/* Mappa tutte le attività disponibili in card selezionabili */}
                {game.availableActivities.map((activity) => (
                  <ActivityCard 
                    key={activity.id} 
                    activity={activity} 
                    className="h-20 sm:h-24"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center p-4 bg-black/40 rounded-lg backdrop-blur-sm">
              <p className="text-white/70">Nessuna attività disponibile al momento.</p>
            </div>
          )}
        </div>
      </main>

      {/* Sezione personaggio (bottom sheet con le statistiche del personaggio) */}
      <CharacterSection />
      
      {/* Modali per le varie interazioni di gioco */}
      <ActivityModal />
      <ResultModal />
      <CharacterCreationModal />
      <OptionsModal isOpen={showOptions} onClose={() => setShowOptions(false)} />
    </div>
  );
};

export default Game;
