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

// Import logo image
import logoImage from "@/assets/icons/logo.png";
import { citybg } from "@/assets";

const Game = () => {
  const { 
    game, 
    isLoadingGame, 
    activeTab, 
    setActiveTab 
  } = useGame();
  const [_, setLocation] = useLocation();
  const [showOptions, setShowOptions] = useState(false);
  const [currentSecond, setCurrentSecond] = useState(new Date().getSeconds());

  // Aggiorniamo i secondi per animare l'orologio
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSecond(new Date().getSeconds());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const getDayTimeIcon = () => {
    // Assumi che game.time sia in formato "Mattina", "Pomeriggio", "Sera", "Notte"
    const timeOfDay = game.time.toLowerCase();
    if (timeOfDay.includes("mattina") || timeOfDay.includes("pomeriggio")) {
      return <Sun className="h-5 w-5 text-yellow-300 animate-pulse" />;
    } else {
      return <Moon className="h-5 w-5 text-blue-100 animate-pulse" />;
    }
  };

  useEffect(() => {
    // If game isn't loaded yet, just wait
    if (isLoadingGame) return;
    
    // If game isn't started and we have a character, redirect to home
    if (!game.gameStarted && !game.character) {
      setLocation("/");
    }
  }, [game, isLoadingGame, setLocation]);

  if (isLoadingGame) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-primary text-white shadow-lg">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Skeleton className="h-10 w-40" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-[500px]" />
            <Skeleton className="h-[500px] md:col-span-2" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-game-background bg-fixed bg-cover bg-center flex flex-col">
      <header className="bg-primary/90 backdrop-blur-sm text-white shadow-lg">
        <div className="container mx-auto px-3 py-2 flex justify-between items-center">
          <img src={logoImage} alt="Maranza Simulator Logo" className="h-8" />
          <div className="flex items-center gap-2">
            <div className="clock-container flex items-center drop-shadow-md">
              <span className="font-bold bg-gradient-to-r from-primary/40 to-primary/50 backdrop-blur-sm px-1.5 sm:px-2 py-1 rounded-l-lg border-l-2 border-y-2 border-secondary/80 flex items-center text-xs sm:text-sm">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1 text-secondary" />
                <span className="whitespace-nowrap">Giorno {game.day}</span>
              </span>
              <div className="relative overflow-hidden group">
                <span className="px-1.5 sm:px-3 py-1 bg-gradient-to-r from-secondary/80 to-secondary/90 backdrop-blur-sm rounded-r-lg flex items-center gap-0.5 sm:gap-1 border-r-2 border-y-2 border-secondary/80 font-mono transition-all duration-300 hover:bg-secondary shadow-inner text-xs sm:text-sm">
                  {getDayTimeIcon()} 
                  <span className="relative transition-transform duration-300 group-hover:scale-110 whitespace-nowrap">
                    {game.time}
                  </span>
                </span>
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none -translate-x-full animate-shimmer"
                  style={{ 
                    animationDuration: '2s',
                    animationIterationCount: 'infinite'
                  }}
                ></div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:text-purple/90"
              onClick={() => setShowOptions(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow relative">
        {/* Area di gioco principale che rimane fissa */}
        <div className="absolute inset-0 pointer-events-none z-0" />
        
        {/* Attività posizionate in modo permanente in basso */}
        <div className="fixed bottom-[4.5rem] left-0 w-full bg-gradient-to-t from-black/70 to-transparent">
          <div className="w-full px-0">
            <div className="grid grid-cols-4 gap-1">
              {game.availableActivities.slice(0, 8).map((activity) => (
                <ActivityCard key={activity.id} activity={activity} className="scale-90 transform-origin-bottom" />
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <CharacterSection />
      
      <ActivityModal />
      <ResultModal />
      <CharacterCreationModal />
      <OptionsModal isOpen={showOptions} onClose={() => setShowOptions(false)} />

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation-name: shimmer;
          }
          .clock-container {
            position: relative;
          }
          .clock-container::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 8px;
            padding: 1px;
            background: linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,255,255,0.3), rgba(255,255,255,0.1));
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
          }
          
          .bg-game-background {
            background-image: url('${citybg}');
            position: relative;
          }
          
          .bg-game-background::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.4);
            z-index: 0;
          }
          
          .bg-game-background > * {
            position: relative;
            z-index: 1;
          }
          
          /* Stili specifici per mobile */
          @media (max-width: 640px) {
            .clock-container {
              scale: 0.95;
              margin-right: -0.25rem;
            }
            .clock-container span {
              letter-spacing: -0.02em;
            }
          }
          
          /* Fix per iPhone e dispositivi iOS */
          @supports (-webkit-touch-callout: none) {
            .backdrop-blur-sm {
              backdrop-filter: blur(8px);
              -webkit-backdrop-filter: blur(8px);
            }
          }
        `
      }} />
    </div>
  );
};

export default Game;
