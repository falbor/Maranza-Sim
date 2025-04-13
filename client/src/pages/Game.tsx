import { useEffect, useState } from "react";
import { useGame } from "@/lib/gameContext";
import { useLocation } from "wouter";
import CharacterSection from "@/components/CharacterSection";
import ActivityCard from "@/components/ActivityCard";
import ActivityModal from "@/components/ActivityModal";
import ResultModal from "@/components/ResultModal";
import CharacterCreationModal from "@/components/CharacterCreationModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const Game = () => {
  const { 
    game, 
    isLoadingGame, 
    activeTab, 
    setActiveTab 
  } = useGame();
  const [_, setLocation] = useLocation();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-wider">Maranza Simulator</h1>
          <div className="flex items-center space-x-2">
            <span className="font-bold">Giorno {game.day}</span>
            <span className="px-2 py-1 bg-secondary rounded text-sm">{game.time}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CharacterSection />
          
          <div className="md:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="activities" className="flex-1">Attività</TabsTrigger>
                <TabsTrigger value="inventory" className="flex-1">Inventario</TabsTrigger>
                <TabsTrigger value="social" className="flex-1">Sociale</TabsTrigger>
                <TabsTrigger value="skills" className="flex-1">Abilità</TabsTrigger>
              </TabsList>
              
              <TabsContent value="activities">
                <h3 className="font-bold text-xl mb-4 text-primary">Cosa Vuoi Fare Oggi?</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {game.availableActivities.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="inventory">
                <h3 className="font-bold text-xl mb-4 text-primary">Il Tuo Inventario</h3>
                <div className="bg-white rounded-lg shadow-md p-4">
                  {game.inventory.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Non hai ancora nessun oggetto. Fai shopping!</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {game.inventory.map((item) => (
                        <div key={item.id} className="flex items-center p-3 border border-gray-200 rounded-lg">
                          <div className="w-12 h-12 bg-gray-50 rounded-md flex items-center justify-center mr-3">
                            <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"></path>
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-bold">{item.name}</h4>
                            <p className="text-xs text-gray-500">
                              {item.effect.value > 0 ? '+' : ''}{item.effect.value} {item.effect.type.charAt(0).toUpperCase() + item.effect.type.slice(1)}
                              {item.unlockDay && `, Sbloccato Giorno ${item.unlockDay}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="social">
                <h3 className="font-bold text-xl mb-4 text-primary">La Tua Cerchia Sociale</h3>
                <div className="bg-white rounded-lg shadow-md p-4">
                  {game.contacts.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Non hai ancora nessun contatto. Socializza!</p>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {game.contacts.map((contact) => (
                        <li key={contact.id} className="py-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full bg-${contact.avatarColor}/20 flex items-center justify-center mr-3`}>
                              <span className={`text-${contact.avatarColor} font-bold`}>
                                {contact.avatarInitials}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-bold">{contact.name}</h4>
                              <p className="text-xs text-gray-500">{contact.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className={`text-xs px-2 py-1 ${
                              contact.respect === "alto" ? "bg-green-500/20 text-green-500" :
                              contact.respect === "medio" ? "bg-blue-500/20 text-blue-500" :
                              "bg-amber-400/20 text-amber-500"
                            } rounded-full`}>
                              Rispetto: {contact.respect.charAt(0).toUpperCase() + contact.respect.slice(1)}
                            </div>
                            <Button variant="ghost" className="p-1 text-primary">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                              </svg>
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="skills">
                <h3 className="font-bold text-xl mb-4 text-primary">Le Tue Abilità</h3>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="space-y-4">
                    {game.skills.map((skill) => (
                      <div key={skill.id} className="skill-item">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold">{skill.name}</span>
                          <span className={`text-xs ${
                            skill.level >= 4 ? "bg-secondary/20 text-secondary" :
                            skill.level >= 3 ? "bg-primary/20 text-primary" :
                            "bg-amber-400/20 text-amber-500/80"
                          } px-2 py-1 rounded-full`}>
                            Livello {skill.level}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              skill.level >= 4 ? "bg-secondary" :
                              skill.level >= 3 ? "bg-primary" :
                              "bg-amber-400"
                            }`} 
                            style={{ width: `${(skill.progress / skill.maxLevel) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{skill.description}</p>
                      </div>
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
    </div>
  );
};

export default Game;
