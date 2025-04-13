import { useGame } from "@/lib/gameContext";
import { Progress } from "@/components/ui/progress";

export default function CharacterSection() {
  const { game } = useGame();
  const { character } = game;

  if (!character) {
    return null;
  }

  const statItems = [
    { label: "Soldi", value: `€${character.money}`, percentage: character.money / 1000 * 100, color: "bg-amber-400", icon: "💰" },
    { label: "Reputazione", value: `${character.reputation}/100`, percentage: character.reputation, color: "bg-primary", icon: "⭐" },
    { label: "Stile", value: `${character.style}/100`, percentage: character.style, color: "bg-secondary", icon: "👔" },
    { label: "Energia", value: `${character.energy}/100`, percentage: character.energy, color: "bg-green-500", icon: "⚡" },
    { label: "Rispetto", value: `${character.respect}/100`, percentage: character.respect, color: "bg-red-500", icon: "💪" }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-3">
      <div className="flex items-center gap-3 mb-3 border-b pb-2">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xl">{character.look === 'casual' ? '👕' : '🧢'}</span>
        </div>
        <div>
          <h2 className="font-bold text-lg">{character.name}</h2>
          <p className="text-sm text-gray-500">{character.persona}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {statItems.map((stat) => (
          <div key={stat.label} className="bg-gray-50 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <span>{stat.icon}</span>
              <span className="text-sm font-medium">{stat.label}</span>
            </div>
            <Progress value={stat.percentage} className={`h-2 ${stat.color}`} />
            <span className="text-xs text-gray-600 mt-1 block">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}