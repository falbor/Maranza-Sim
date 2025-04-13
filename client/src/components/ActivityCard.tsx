import { Clock, Check } from "lucide-react";
import { Activity } from "@/lib/types";
import { useGame } from "@/lib/gameContext";
import { Button } from "@/components/ui/button";
import { getActivityIcon, getIconBackground } from "@/lib/activityIcons";

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
  const getButtonColorClass = () => {
    switch (activity.color) {
      case "primary":
        return "activity-button-primary";
      case "secondary":
        return "activity-button-secondary";
      case "accent":
        return "activity-button-accent";
      case "info":
        return "activity-button-info";
      default:
        return "activity-button-primary";
    }
  };

  return (
    <Button 
      className={`activity-button ${getButtonColorClass()}`}
      onClick={handleSelectActivity}
      variant="ghost"
    >
      <div className="flex items-start w-full">
        {/* Icona dell'attività */}
        <div className={`${getIconBackground(activity.color)} mr-3 p-2 rounded-lg shrink-0`}>
          {getActivityIcon(activity.image, 22)}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-center w-full mb-2">
            <h4 className="font-bold text-lg">{activity.title}</h4>
            <span className="activity-badge">
              <Clock className="w-3 h-3 mr-1" />
              {activity.duration} {activity.duration === 1 ? 'ora' : 'ore'}
            </span>
          </div>
          
          <p className="text-sm mb-2">{activity.description}</p>
          
          {mainEffect && (
            <div className="activity-badge mt-auto">
              <Check className="w-3 h-3 mr-1" />
              {mainEffect}
            </div>
          )}
        </div>
      </div>
    </Button>
  );
};

export default ActivityCard;
