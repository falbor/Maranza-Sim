import { useGame } from "@/lib/gameContext";
import { Progress } from "@/components/ui/progress";
import { ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { ProfilePic1, ProfilePic2, ProfilePic3, ProfilePic4, ProfilePic5, ProfilePic6, ProfilePic7, ProfilePic8, ProfilePic9, ProfilePic10 } from "@/assets";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// Array delle immagini di profilo
const profilePics = [
  ProfilePic1, ProfilePic2, ProfilePic3, ProfilePic4, ProfilePic5,
  ProfilePic6, ProfilePic7, ProfilePic8, ProfilePic9, ProfilePic10
];

export default function CharacterSection() {
  const { game, activeTab, setActiveTab, refetchGame } = useGame();
  const { character } = game;
  const [isOpen, setIsOpen] = useState(false);
  
  // Imposta il tab "inventory" come default se non è stato impostato o se era "shop"
  useEffect(() => {
    if (!["inventory", "social", "skills"].includes(activeTab)) {
      setActiveTab("inventory");
    }
  }, []);

  if (!character) {
    return null;
  }

  // Seleziona l'immagine di profilo in base all'avatarId
  const profileImage = character.avatarId && character.avatarId > 0 && character.avatarId <= profilePics.length 
    ? profilePics[character.avatarId - 1] 
    : ProfilePic1;

  // Definizione delle statistiche esclusi i soldi (mostrati nell'header)
  const statItems = [
    { label: "Rep", value: character.reputation, percentage: character.reputation, color: "bg-primary", icon: "⭐" },
    { label: "Stile", value: character.style, percentage: character.style, color: "bg-secondary", icon: "👔" },
    { label: "Energia", value: character.energy, percentage: character.energy, color: "bg-green-500", icon: "⚡" },
    { label: "Rispetto", value: character.respect, percentage: character.respect, color: "bg-red-500", icon: "💪" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg shadow-lg z-50 border-t border-white/10">
      <div 
        className="h-[4.5rem] px-4 py-3 flex items-center justify-between cursor-pointer border-b border-white/10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="font-bold text-base leading-tight text-white">{character.name}</h2>
            <p className="text-xs text-primary/80 leading-tight">{character.personality}</p>
          </div>
        </div>
        
        <div className="flex-grow mx-6">
          <div className="stats-container grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1 px-1">
            {statItems.map((stat) => (
              <div key={stat.label} className="stat-item">
                <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${stat.color}`} 
                    style={{ width: `${stat.percentage}%` }}
                  ></div>
                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-between px-1.5">
                    <span className="text-[10px] text-white drop-shadow-sm font-medium flex items-center gap-1">
                      <span>{stat.icon}</span> <span>{stat.label}</span>
                    </span>
                    <span className="text-[10px] text-white drop-shadow-sm font-medium">
                      {stat.value}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <ChevronUp className={`ml-1 w-5 h-5 text-primary transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <div 
        className="overflow-y-auto transition-all duration-300 bg-black/90"
        style={{ 
          height: isOpen ? 'calc(100vh - 4.5rem - 3.5rem)' : '0',
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden'
        }}
      >
        <div className="p-4 sm:p-6">
          {/* Tabs per Inventory, Social, Skills - rimossa la tab Shop */}
          <div className="w-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full bg-black/50 border border-white/10">
                <TabsTrigger value="inventory" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white text-gray-300">Inventario</TabsTrigger>
                <TabsTrigger value="social" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white text-gray-300">Sociale</TabsTrigger>
                <TabsTrigger value="skills" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white text-gray-300">Abilità</TabsTrigger>
              </TabsList>
              <TabsContent value="inventory">
                <h3 className="font-bold text-xl mb-4 text-primary">Il Tuo Inventario</h3>
                <div className="bg-black/50 rounded-lg shadow-md p-4 border border-white/10">
                  {game.inventory.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">Non hai ancora nessun oggetto. Fai shopping!</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {game.inventory.map((item) => (
                        <div key={item.id} className="flex items-center p-3 border border-white/10 rounded-lg bg-black/30">
                          <div className="w-12 h-12 bg-black/50 rounded-md flex items-center justify-center mr-3">
                            <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"></path>
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-bold text-white">{item.name}</h4>
                            <p className="text-xs text-gray-400">
                              {item.effects && item.effects.length > 0 ? (
                                <>
                                  {item.effects[0].value > 0 ? '+' : ''}{item.effects[0].value} {item.effects[0].type.charAt(0).toUpperCase() + item.effects[0].type.slice(1)}
                                  {item.effects.length > 1 && ` (+ ${item.effects.length - 1} altri effetti)`}
                                </>
                              ) : item.effect && item.effect.value ? (
                                <>
                                  {item.effect.value > 0 ? '+' : ''}{item.effect.value} {item.effect.type.charAt(0).toUpperCase() + item.effect.type.slice(1)}
                                </>
                              ) : "Nessun effetto"}
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
                <div className="bg-black/50 rounded-lg shadow-md p-4 border border-white/10">
                  {game.contacts.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">Non hai ancora nessun contatto. Socializza!</p>
                  ) : (
                    <ul className="divide-y divide-white/10">
                      {game.contacts.map((contact) => (
                        <li key={contact.id} className="py-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full bg-${contact.avatarColor}/20 flex items-center justify-center mr-3`}>
                              <span className={`text-${contact.avatarColor} font-bold`}>
                                {contact.avatarInitials}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-bold text-white">{contact.name}</h4>
                              <p className="text-xs text-gray-400">{contact.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className={`text-xs px-2 py-1 ${
                              contact.respect === "alto" ? "bg-green-500/20 text-green-400" :
                              contact.respect === "medio" ? "bg-blue-500/20 text-blue-400" :
                              "bg-amber-400/20 text-amber-400"
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
                <div className="bg-black/50 rounded-lg shadow-md p-4 border border-white/10">
                  <div className="space-y-4">
                    {game.skills.map((skill) => (
                      <div key={skill.id} className="skill-item">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-white">{skill.name}</span>
                          <span className={`text-xs ${
                            skill.level >= 4 ? "bg-secondary/20 text-secondary" :
                            skill.level >= 3 ? "bg-primary/20 text-primary" :
                            "bg-amber-400/20 text-amber-300"
                          } px-2 py-1 rounded-full`}>
                            Livello {skill.level}
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              skill.level >= 4 ? "bg-secondary" :
                              skill.level >= 3 ? "bg-primary" :
                              "bg-amber-400"
                            }`} 
                            style={{ width: `${(skill.progress / skill.maxLevel) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{skill.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}