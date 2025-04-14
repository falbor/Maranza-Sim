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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings } from "lucide-react";
import MaranzaImage from "@/assets/backgrounds/maranza.png";
import BackgroundPark from "@/assets/backgrounds/background_park_1.png";

const Game = () => {
  const { 
    game, 
    isLoadingGame, 
    activeTab, 
    setActiveTab 
  } = useGame();
  const [_, setLocation] = useLocation();
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    // If game isn't loaded yet, just wait
    if (isLoadingGame) return;
    
    // If game isn't started and we have a character, redirect to home
    if (!game.gameStarted && !game.character) {
      setLocation("/");
    }
  }, [game, isLoadingGame, setLocation]);

  const splitActivities = (activities) => {
    const leftColumn = [];
    const rightColumn = [];
    
    activities.forEach((activity, index) => {
      if (index % 2 === 0) {
        leftColumn.push(activity);
      } else {
        rightColumn.push(activity);
      }
    });
    
    return { leftColumn, rightColumn };
  };

  if (isLoadingGame) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-primary text-white shadow-lg">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold tracking-wider">Maranza Simulator</h1>
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

  const { leftColumn, rightColumn } = splitActivities(game.availableActivities);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white shadow-lg">
        <div className="container mx-auto px-3 py-2 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-wider">Maranza Simulator</h1>
          <div className="flex items-center gap-2">
            <span className="font-bold">Giorno {game.day}</span>
            <span className="px-2 py-1 bg-secondary rounded text-sm">{game.time}</span>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:text-white/90"
              onClick={() => setShowOptions(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-2 py-3">
        <div className="flex flex-col gap-4">
          <CharacterSection />
          
          <div className="w-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="activities" className="flex-1">Attività</TabsTrigger>
              </TabsList>
              
              <TabsContent value="activities" className="p-4 rounded-lg bg-opacity-80 backdrop-blur-sm" style={{ 
                backgroundImage: `url(${BackgroundPark})`, 
                backgroundSize: 'cover',
                backgroundPosition: 'center' 
              }}>
                <div className="flex flex-col md:flex-row justify-between">
                  {/* Left column */}
                  <div className="w-full md:w-1/3 space-y-3">
                    {leftColumn.map((activity) => (
                      <ActivityCard key={activity.id} activity={activity} />
                    ))}
                  </div>
                  
                  {/* Center image */}
                  <div className="hidden md:block md:w-1/3 px-4 py-6">
                    <img 
                      src={MaranzaImage} 
                      alt="Maranza" 
                      className="w-full max-h-80 object-contain mx-auto drop-shadow-lg"
                    />
                  </div>
                  
                  {/* Right column */}
                  <div className="w-full md:w-1/3 space-y-3">
                    {rightColumn.map((activity) => (
                      <ActivityCard key={activity.id} activity={activity} />
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <ActivityModal />
      <ResultModal />
      <CharacterCreationModal />
      <OptionsModal isOpen={showOptions} onClose={() => setShowOptions(false)} />
    </div>
  );
};

export default Game;
