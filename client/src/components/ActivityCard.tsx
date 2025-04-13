import { Clock, Check } from "lucide-react";
import { Activity } from "@/lib/types";
import { useGame } from "@/lib/gameContext";

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

  // Determine gradient colors based on activity.color
  const getGradient = () => {
    switch (activity.color) {
      case "primary":
        return "from-primary to-secondary";
      case "secondary":
        return "from-secondary to-primary";
      case "accent":
        return "from-amber-400 to-primary";
      case "info":
        return "from-blue-500 to-secondary";
      default:
        return "from-primary to-secondary";
    }
  };

  return (
    <div 
      className="game-card bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transform transition-transform hover:-translate-y-1"
      onClick={handleSelectActivity}
    >
      <div className={`h-32 bg-gradient-to-r ${getGradient()} relative`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <h4 className="text-white font-bold text-lg drop-shadow-lg">{activity.title}</h4>
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-700 text-sm">{activity.description}</p>
        <div className="flex justify-between mt-3 text-xs">
          <span className="inline-flex items-center">
            <Clock className="w-4 h-4 mr-1 text-primary" />
            {activity.duration} {activity.duration === 1 ? 'ora' : 'ore'}
          </span>
          {mainEffect && (
            <span className="inline-flex items-center">
              <Check className="w-4 h-4 mr-1 text-green-500" />
              {mainEffect}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;