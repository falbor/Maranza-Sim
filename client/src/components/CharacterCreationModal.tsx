import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGame } from "@/lib/gameContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProfilePic1 } from "@/assets";

const CharacterCreationModal = () => {
  const { 
    showCharacterCreation, 
    setShowCharacterCreation, 
    createCharacter,
    isCreatingCharacter
  } = useGame();

  const [name, setName] = useState("Kevin");
  const [style, setStyle] = useState<"casual" | "sportivo" | "firmato">("casual");
  const [personality, setPersonality] = useState<"audace" | "ribelle" | "carismatico">("ribelle");
  const [avatarId, setAvatarId] = useState(1);

  const handleCreateCharacter = () => {
    createCharacter({
      name,
      look: style,
      personality,
      avatarId,
      money: 250,
      reputation: 50,
      energy: 100,
      respect: 30,
      style: 60
    });
  };

  const handlePrevAvatar = () => {
    setAvatarId(prev => (prev > 1 ? prev - 1 : 5));
  };

  const handleNextAvatar = () => {
    setAvatarId(prev => (prev < 5 ? prev + 1 : 1));
  };

  const handleRandomize = () => {
    const names = ["Kevin", "Lorenzo", "Matteo", "Simone", "Federico", "Manuel"];
    const styles = ["casual", "sportivo", "firmato"] as const;
    const personalities = ["audace", "ribelle", "carismatico"] as const;
    
    setName(names[Math.floor(Math.random() * names.length)]);
    setStyle(styles[Math.floor(Math.random() * styles.length)]);
    setPersonality(personalities[Math.floor(Math.random() * personalities.length)]);
    setAvatarId(Math.floor(Math.random() * 5) + 1);
  };

  return (
    <Dialog open={showCharacterCreation} onOpenChange={setShowCharacterCreation}>
      <DialogContent className="w-[90vw] max-w-xl mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl text-primary font-bold">
            Crea il Tuo Maranza
          </DialogTitle>
          <p className="text-sm md:text-base text-gray-600">
            Personalizza il tuo personaggio
          </p>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <div className="mb-4">
                <Label className="text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Nome
                </Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="Inserisci un nome" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border rounded w-full py-2 px-3 text-gray-700"
                />
              </div>
              
              <div className="mb-4">
                <Label className="block text-gray-700 text-sm font-bold mb-2">
                  Stile
                </Label>
                <div className="flex space-x-2">
                  <Button 
                    type="button"
                    className={`px-3 py-2 rounded-lg text-sm ${style === "casual" ? "bg-primary text-white" : "bg-gray-200"}`}
                    onClick={() => setStyle("casual")}
                  >
                    Casual
                  </Button>
                  <Button 
                    type="button"
                    className={`px-3 py-2 rounded-lg text-sm ${style === "sportivo" ? "bg-primary text-white" : "bg-gray-200"}`}
                    onClick={() => setStyle("sportivo")}
                  >
                    Sportivo
                  </Button>
                  <Button 
                    type="button"
                    className={`px-3 py-2 rounded-lg text-sm ${style === "firmato" ? "bg-primary text-white" : "bg-gray-200"}`}
                    onClick={() => setStyle("firmato")}
                  >
                    Firmato
                  </Button>
                </div>
              </div>
              
              <div className="mb-4">
                <Label className="block text-gray-700 text-sm font-bold mb-2">
                  Personalità
                </Label>
                <div className="flex space-x-2">
                  <Button 
                    type="button"
                    className={`px-3 py-2 rounded-lg text-sm ${personality === "audace" ? "bg-primary text-white" : "bg-gray-200"}`}
                    onClick={() => setPersonality("audace")}
                  >
                    Audace
                  </Button>
                  <Button 
                    type="button"
                    className={`px-3 py-2 rounded-lg text-sm ${personality === "ribelle" ? "bg-primary text-white" : "bg-gray-200"}`}
                    onClick={() => setPersonality("ribelle")}
                  >
                    Ribelle
                  </Button>
                  <Button 
                    type="button"
                    className={`px-3 py-2 rounded-lg text-sm ${personality === "carismatico" ? "bg-primary text-white" : "bg-gray-200"}`}
                    onClick={() => setPersonality("carismatico")}
                  >
                    Carismatico
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-32 h-32 mb-4">
                <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-4 border-primary">
                  <img src={ProfilePic1} alt="Profile" className="w-full h-full object-cover" />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  className="p-2 bg-gray-200 rounded-full"
                  onClick={handlePrevAvatar}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button 
                  variant="outline"
                  className="p-2 bg-gray-200 rounded-full"
                  onClick={handleNextAvatar}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between mt-6 gap-2 sm:justify-between">
          <Button
            variant="outline"
            onClick={handleRandomize}
            className="px-4 py-2 bg-gray-200"
          >
            Randomizza
          </Button>
          <Button
            onClick={handleCreateCharacter}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white"
            disabled={!name || isCreatingCharacter}
          >
            {isCreatingCharacter ? "Creazione..." : "Inizia il Gioco"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CharacterCreationModal;
