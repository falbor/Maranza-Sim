import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGame } from "@/lib/gameContext";
import { Button } from "@/components/ui/button";
import CharacterCreationModal from "@/components/CharacterCreationModal";

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
    <div className="min-h-screen bg-gradient-to-b from-primary to-secondary text-white flex flex-col">
      <header className="container mx-auto px-4 py-6">
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-2">Maranza Simulator</h1>
        <p className="text-center text-lg opacity-90">La vita di un vero maranza</p>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white text-gray-800 rounded-xl shadow-2xl p-4 sm:p-8">
          <h2 className="text-2xl font-bold text-primary mb-4 text-center">Benvenuto nel Simulatore</h2>
          
          <p className="mb-6 text-gray-600">
            Vivi la vita di un vero maranza! Fai shopping di vestiti firmati, vai in giro in piazza, 
            allenati in palestra, e aumenta il tuo rispetto tra gli altri maranza della città.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-primary mb-2">Caratteristiche</h3>
              <ul className="text-sm space-y-1">
                <li>• Personalizza il tuo maranza</li>
                <li>• Guadagna soldi e rispetto</li>
                <li>• Migliora il tuo stile</li>
                <li>• Incontra altri maranza</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-primary mb-2">Attività</h3>
              <ul className="text-sm space-y-1">
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
                className="w-full md:w-auto"
                onClick={() => resetGame()}
              >
                Reset Gioco
              </Button>
            )}
          </div>
        </div>
      </main>
      
      <footer className="container mx-auto px-4 py-6 text-center text-white/70 text-sm">
        <p>Un simulatore di vita ispirato a Tabboz Simulator</p>
      </footer>
      
      <CharacterCreationModal />
    </div>
  );
};

export default Home;
