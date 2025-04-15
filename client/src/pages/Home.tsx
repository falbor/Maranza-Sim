import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGame } from "@/lib/gameContext";
import { Button } from "@/components/ui/button";
import CharacterCreationModal from "@/components/CharacterCreationModal";
import { logo1, parkbg1 } from "@/assets";

const Home = () => {
  const { game, isLoadingGame, setShowCharacterCreation, resetGame } = useGame();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    // If game isn't loaded yet, just wait
    if (isLoadingGame) return;

    // If game is started and we have a character, redirect to game
    if (game.gameStarted && game.character) {
      setLocation("/game");
    }
  }, [game, isLoadingGame, setLocation]);

  const handleStartGame = () => {
    if (game.character) {
      setLocation("/game");
    } else {
      setShowCharacterCreation(true);
    }
  };

  return (
    <div className="min-h-screen text-white flex flex-col relative">
      {/* Background image */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img 
          src={parkbg1} 
          alt="Park Background" 
          className="w-full h-full object-cover opacity-70" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 to-black/80"></div>
      </div>

      <header className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex justify-center mb-4">
          <img src={logo1} alt="Maranza Simulator Logo" className="max-h-28" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-2">Maranza Simulator</h1>
        <p className="text-center text-lg opacity-90">La vita di un vero maranza</p>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 relative z-10">
        <div className="max-w-lg w-full bg-black/70 text-white rounded-xl shadow-2xl p-4 sm:p-8 backdrop-blur-lg border border-primary/20">
          <h2 className="text-2xl font-bold text-primary mb-4 text-center">Benvenuto nel Simulatore</h2>
          
          <p className="mb-6 text-gray-300">
            Vivi la vita di un vero maranza! Fai shopping di vestiti firmati, vai in giro in piazza, 
            allenati in palestra, e aumenta il tuo rispetto tra gli altri maranza della città.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-black/50 p-4 rounded-lg border border-primary/10">
              <h3 className="font-bold text-primary mb-2">Caratteristiche</h3>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>• Personalizza il tuo maranza</li>
                <li>• Guadagna soldi e rispetto</li>
                <li>• Migliora il tuo stile</li>
                <li>• Incontra altri maranza</li>
              </ul>
            </div>
            
            <div className="bg-black/50 p-4 rounded-lg border border-primary/10">
              <h3 className="font-bold text-primary mb-2">Attività</h3>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>• Shopping di vestiti firmati</li>
                <li>• Giro in piazza</li>
                <li>• Sessioni in palestra</li>
                <li>• Serate in discoteca</li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button 
              className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white"
              onClick={handleStartGame}
            >
              {game.character ? "Continua Gioco" : "Inizia Nuovo Gioco"}
            </Button>
            
            {game.character && (
              <Button 
                variant="outline" 
                className="w-full md:w-auto text-white border-white/30 hover:bg-white/10"
                onClick={() => resetGame()}
              >
                Reset Gioco
              </Button>
            )}
          </div>
        </div>
      </main>
      
      <footer>
      </footer>
      
      <CharacterCreationModal />
    </div>
  );
};

export default Home;
