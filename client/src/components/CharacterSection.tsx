import { useGame } from "@/lib/gameContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

const CharacterSection = () => {
  const { game, setShowCharacterCreation, isLoadingGame } = useGame();
  const { character } = game;

  if (isLoadingGame) {
    return (
      <div className="md:col-span-1 bg-card rounded-xl shadow-md p-6 border border-primary/20">
        <div className="text-center mb-4">
          <Skeleton className="h-6 w-36 mx-auto mb-2" />
          <Skeleton className="h-5 w-24 mx-auto" />
        </div>
        <div className="h-64 flex justify-center items-center bg-background/50 rounded-lg mb-4">
          <Skeleton className="w-40 h-40 rounded-full" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-14" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="md:col-span-1 bg-card rounded-xl shadow-md p-6 border border-primary/20">
        <div className="text-center">
          <h2 className="font-bold text-xl mb-4 text-primary">Crea il tuo Maranza</h2>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => setShowCharacterCreation(true)}
          >
            Inizia il gioco
          </Button>
        </div>
      </div>
    );
  }

  const statItems = [
    { label: "Soldi", value: `€${character.money}`, percentage: character.money / 1000 * 100, color: "bg-amber-500" },
    { label: "Reputazione", value: `${character.reputation}/100`, percentage: character.reputation, color: "bg-primary" },
    { label: "Stile", value: `${character.style}/100`, percentage: character.style, color: "bg-purple-400" },
    { label: "Energia", value: `${character.energy}/100`, percentage: character.energy, color: "bg-green-600" },
    { label: "Rispetto", value: `${character.respect}/100`, percentage: character.respect, color: "bg-rose-600" }
  ];

  return (
    <div className="md:col-span-1 bg-card rounded-xl shadow-md p-6 border border-primary/20">
      <div className="text-center mb-4">
        <h2 className="font-bold text-xl mb-2 text-primary bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text">Il Tuo Maranza</h2>
        <h3 className="font-bold text-lg">{character.name}</h3>
      </div>

      <div className="character-container relative h-64 flex justify-center items-center bg-background/50 rounded-lg mb-4 border border-primary/10">
        <div className="character relative">
          <div className="w-40 h-40 relative mx-auto">
            <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-4 border-primary shadow-lg shadow-primary/20">
              {/* Display different avatars based on the character's avatarId */}
              <span className="text-5xl font-bold text-primary">
                {character.avatarId === 1 && "K"}
                {character.avatarId === 2 && "L"}
                {character.avatarId === 3 && "M"}
                {character.avatarId === 4 && "G"}
                {character.avatarId === 5 && "S"}
              </span>
            </div>
            <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center opacity-0 hover:opacity-100 transition-opacity duration-300">
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-1 px-3 rounded-full text-sm shadow-md border-0"
                onClick={() => setShowCharacterCreation(true)}
              >
                Personalizza
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-container space-y-4 p-2">
        {statItems.map((stat, index) => (
          <div className="stat-item" key={index}>
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-sm">{stat.label}</span>
              <span className="text-sm font-medium">{stat.value}</span>
            </div>
            <Progress 
              value={Math.min(stat.percentage, 100)} 
              indicatorColor={stat.color} 
              className="h-2.5"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterSection;
