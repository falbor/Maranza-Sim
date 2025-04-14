import { useGame } from "@/lib/gameContext";
import { Progress } from "@/components/ui/progress";
import { ChevronUp } from "lucide-react";
import { useState } from "react";
import { ProfilePic1 } from "@/assets";

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
    <div className={`fixed bottom-0 left-0 right-0 bg-white shadow-lg transition-transform duration-300 transform z-50 ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-4.5rem)]'}`}>
      <div 
        className="h-[4.5rem] bg-white px-4 py-3 flex items-center justify-between cursor-pointer border-b"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img src={ProfilePic1} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="font-bold text-base leading-tight">{character.name}</h2>
            <p className="text-sm text-gray-500 leading-tight">{character.personality}</p>
          </div>
        </div>
        <ChevronUp className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <div className="p-4 sm:p-6">
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