import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGame } from "@/lib/gameContext";
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import { ProfilePic1, ProfilePic2, ProfilePic3, ProfilePic4, ProfilePic5 } from "@/assets";

const avatarList = [ProfilePic1, ProfilePic2, ProfilePic3, ProfilePic4, ProfilePic5];

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
    const names = [
      "Kevin", "Lorenzo", "Matteo", "Simone", "Federico", "Manuel",
      "Alessandro", "Andrea", "Davide", "Gabriele", "Riccardo", "Francesco",
      "Giovanni", "Edoardo", "Luca", "Marco", "Tommaso", "Niccolò", "Stefano",
      "Antonio", "Giuseppe", "Michele", "Salvatore", "Pietro", "Samuele",
      "Leonardo", "Enrico", "Daniele", "Alberto", "Carlo", "Cristian",
      "Diego", "Filippo", "Giorgio", "Jacopo", "Luigi", "Mario", "Paolo",
      "Raffaele", "Roberto", "Sergio", "Vincenzo", "Youssef", "Omar", "Karim",
      "Samir", "Anis", "Walid", "Nabil", "Rachid", "Reda", "Mehdi", "Ayoub",
      "Mohamed", "Ahmed", "Mustafa", "Hassan", "Amine", "Bilal", "Ali",
      "Sami", "Tarek", "Adil", "Imad", "Hamza", "Sofiane", "Khalil", "Idris",
      "Abdel", "Mounir", "Yassine", "Saad", "Fouad", "Ziad", "Amin", "Farid",
      "Nadir", "Hakim", "Ismail", "Rami", "Tarik", "Younes", "Soufiane",
      "Abdallah", "Ilyas", "Mourad", "Nassim", "Salah", "Lotfi", "Said",
      "Brahim", "Jamal", "Kamal", "Samy", "Riyad", "Zaki", "Malik", "Faris",
      "Elia", "Giulio", "Massimo", "Valerio", "Dario", "Claudio", "Fabio",
      "Gianni", "Mirko", "Nicolò", "Ruggero", "Sebastiano", "Tiziano",
      "Vittorio", "Walter", "Yassin", "Ayman", "Mazen", "Bassam", "Fadi",
      "Hicham", "Jad", "Kais", "Lyes", "Marwan", "Nour", "Othman", "Rayan",
      "Selim", "Yahya", "Zine", "Abdelhak", "Badr", "Chafik", "Driss", "Fethi",
      "Ghassan", "Habib", "Ibrahim", "Jalal", "Khaled", "Lamine", "Mazen",
      "Nacer", "Omar", "Qais", "Rafik", "Saber", "Taha", "Yacine"
    ];
    const styles = ["casual", "sportivo", "firmato"] as const;
    const personalities = ["audace", "ribelle", "carismatico"] as const;
    
    setName(names[Math.floor(Math.random() * names.length)]);
    setStyle(styles[Math.floor(Math.random() * styles.length)]);
    setPersonality(personalities[Math.floor(Math.random() * personalities.length)]);
    setAvatarId(Math.floor(Math.random() * 5) + 1);
  };

  return (
    <div className={`fixed inset-0 z-50 bg-black/95 ${showCharacterCreation ? 'flex' : 'hidden'} items-center justify-center`}>
      <div className="w-full h-full flex flex-col p-6 md:p-10">
        <div className="text-center mb-6 md:mb-10">
          <h2 className="text-3xl md:text-4xl text-primary font-bold">
            Crea il Tuo Maranza
          </h2>
          <p className="text-base md:text-lg text-gray-300 mt-2">
            Personalizza il tuo personaggio
          </p>
        </div>
        
        <div className="flex-grow flex flex-col justify-center max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div className="space-y-8">
              <div>
                <Label className="text-white text-lg font-bold block mb-3" htmlFor="name">
                  Nome
                </Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="Inserisci un nome" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border border-primary/40 bg-black/60 text-white text-xl py-7 px-4 rounded-lg w-full"
                />
              </div>
              
              <div>
                <Label className="block text-white text-lg font-bold mb-3">
                  Stile
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button 
                    type="button"
                    className={`py-4 rounded-lg text-lg ${style === "casual" ? "bg-primary text-white" : "bg-black/70 text-white border border-white/30 hover:bg-white/10"}`}
                    onClick={() => setStyle("casual")}
                  >
                    Casual
                  </Button>
                  <Button 
                    type="button"
                    className={`py-4 rounded-lg text-lg ${style === "sportivo" ? "bg-primary text-white" : "bg-black/70 text-white border border-white/30 hover:bg-white/10"}`}
                    onClick={() => setStyle("sportivo")}
                  >
                    Sportivo
                  </Button>
                  <Button 
                    type="button"
                    className={`py-4 rounded-lg text-lg ${style === "firmato" ? "bg-primary text-white" : "bg-black/70 text-white border border-white/30 hover:bg-white/10"}`}
                    onClick={() => setStyle("firmato")}
                  >
                    Firmato
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="block text-white text-lg font-bold mb-3">
                  Personalità
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button 
                    type="button"
                    className={`py-4 rounded-lg text-lg ${personality === "audace" ? "bg-primary text-white" : "bg-black/70 text-white border border-white/30 hover:bg-white/10"}`}
                    onClick={() => setPersonality("audace")}
                  >
                    Audace
                  </Button>
                  <Button 
                    type="button"
                    className={`py-4 rounded-lg text-lg ${personality === "ribelle" ? "bg-primary text-white" : "bg-black/70 text-white border border-white/30 hover:bg-white/10"}`}
                    onClick={() => setPersonality("ribelle")}
                  >
                    Ribelle
                  </Button>
                  <Button 
                    type="button"
                    className={`py-4 rounded-lg text-lg ${personality === "carismatico" ? "bg-primary text-white" : "bg-black/70 text-white border border-white/30 hover:bg-white/10"}`}
                    onClick={() => setPersonality("carismatico")}
                  >
                    Carismatico
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-48 h-48 md:w-64 md:h-64 mb-8">
                <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-4 border-primary">
                  <img src={avatarList[avatarId - 1]} alt="Profile" className="w-full h-full object-cover" />
                </div>
              </div>
              
              <div className="flex space-x-6 items-center">
                <Button 
                  variant="outline"
                  className="p-4 bg-black/60 text-white border border-white/30 rounded-full hover:bg-white/10"
                  onClick={handlePrevAvatar}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                
                <Button 
                  variant="outline"
                  className="p-4 bg-black/60 text-white border border-white/30 rounded-full hover:bg-white/10"
                  onClick={handleRandomize}
                  title="Randomizza personaggio"
                >
                  <Shuffle className="w-8 h-8" />
                </Button>
                
                <Button 
                  variant="outline"
                  className="p-4 bg-black/60 text-white border border-white/30 rounded-full hover:bg-white/10"
                  onClick={handleNextAvatar}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center mt-10 gap-6 max-w-5xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Button
              onClick={() => setShowCharacterCreation(false)}
              className="px-10 py-5 bg-black/60 text-white border border-white/30 hover:bg-white/10 text-lg rounded-xl w-full sm:max-w-xs"
            >
              Annulla
            </Button>
            <Button
              onClick={handleCreateCharacter}
              className="px-10 py-5 bg-primary hover:bg-primary/90 text-white text-lg rounded-xl w-full sm:max-w-xs"
              disabled={!name || isCreatingCharacter}
            >
              {isCreatingCharacter ? "Creazione..." : "Inizia il Gioco"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreationModal;
