import { useGame } from "@/lib/gameContext";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function CharacterSection() {
  const { game } = useGame();
  const { character } = game;
  const [isOpen, setIsOpen] = useState(false);

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
    <div className={`fixed bottom-0 left-0 right-0 bg-white shadow-lg transition-transform duration-300 transform z-50 ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-3.5rem)]'}`}>
      <Button
        variant="ghost"
        className="absolute -top-8 right-4 h-8 w-20 rounded-t-lg bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex items-center justify-center gap-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <>
            Chiudi
            <ChevronDown className="w-4 h-4" />
          </>
        ) : (
          <>
            Apri
            <ChevronUp className="w-4 h-4" />
          </>
        )}
      </Button>

      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-4 mb-4 border-b pb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xl">{character.look === 'casual' ? '👕' : '🧢'}</span>
          </div>
          <div>
            <h2 className="font-bold text-lg">{character.name}</h2>
            <p className="text-sm text-gray-500">{character.personality}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {statItems.map((stat) => (
            <div key={stat.label} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span>{stat.icon}</span>
                <span className="text-sm font-medium">{stat.label}</span>
              </div>
              <Progress value={stat.percentage} className={`h-2 ${stat.color}`} />
              <span className="text-xs text-gray-600 mt-2 block">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}