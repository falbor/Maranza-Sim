import { Clock, Check } from "lucide-react";
import { Activity } from "@/lib/types";
import { useGame } from "@/lib/gameContext";
import { Button } from "@/components/ui/button";

interface ActivityCardProps {
  activity: Activity;
}

const ActivityCard = ({ activity }: ActivityCardProps) => {
  const { setSelectedActivity, setShowActivityModal } = useGame();

  const handleSelectActivity = () => {
    setSelectedActivity(activity);
    setShowActivityModal(true);
  };

  // Calculate what effect to show as the main effect
  const getMainEffect = () => {
    const effects = activity.effects;
    const effectTypes = Object.keys(effects) as Array<keyof typeof effects>;
    
    // Sort by effect value and get the most significant one
    const sortedEffects = effectTypes
      .filter(type => effects[type] !== undefined)
      .sort((a, b) => {
        const valA = effects[a] || 0;
        const valB = effects[b] || 0;
        return Math.abs(valB) - Math.abs(valA);
      });
    
    if (sortedEffects.length === 0) return null;
    
    const mainEffectType = sortedEffects[0];
    const mainEffectValue = effects[mainEffectType] || 0;
    
    let label = mainEffectType.charAt(0).toUpperCase() + mainEffectType.slice(1);
    let sign = mainEffectValue > 0 ? "+" : "";
    
    // Special formatting for money
    if (mainEffectType === "money") {
      return `${sign}€${mainEffectValue}`;
    }
    
    return `${sign}${mainEffectValue} ${label}`;
  };

  const mainEffect = getMainEffect();
  
  // Determine color based on activity.color
  const getButtonColor = () => {
    switch (activity.color) {
      case "primary":
        return "bg-primary hover:bg-primary/90 text-white";
      case "secondary":
        return "bg-secondary hover:bg-secondary/90 text-white";
      case "accent":
        return "bg-amber-400 hover:bg-amber-500 text-white";
      case "info":
        return "bg-blue-500 hover:bg-blue-600 text-white";
      default:
        return "bg-primary hover:bg-primary/90 text-white";
    }
  };

  return (
    <Button 
      className={`w-full flex flex-col items-start text-left p-4 h-auto ${getButtonColor()} shadow-md hover:shadow-lg`}
      onClick={handleSelectActivity}
    >
      <div className="flex justify-between items-center w-full mb-2">
        <h4 className="font-bold text-lg">{activity.title}</h4>
        <span className="inline-flex items-center text-xs bg-white/20 px-2 py-1 rounded-full">
          <Clock className="w-3 h-3 mr-1" />
          {activity.duration} {activity.duration === 1 ? 'ora' : 'ore'}
        </span>
      </div>
      
      <p className="text-sm opacity-90 mb-2">{activity.description}</p>
      
      {mainEffect && (
        <div className="inline-flex items-center text-xs bg-white/30 px-2 py-1 rounded-full mt-auto">
          <Check className="w-3 h-3 mr-1" />
          {mainEffect}
        </div>
      )}
    </Button>
  );
};

export default ActivityCard;
