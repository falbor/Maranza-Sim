import { Activity } from "@/lib/types";
import { useGame } from "@/lib/gameContext";
import { Card } from "@/components/ui/card";

interface ActivityCardProps {
  activity: Activity;
  className?: string;
}

const ActivityCard = ({ activity, className = "" }: ActivityCardProps) => {
  const { setSelectedActivity, setShowActivityModal } = useGame();

  const handleSelectActivity = () => {
    setSelectedActivity(activity);
    setShowActivityModal(true);
  };

  // Determine colors based on activity.color
  const getColors = () => {
    switch (activity.color) {
      case "primary":
        return "from-primary/30 to-primary/10 text-primary-foreground";
      case "secondary":
        return "from-secondary/30 to-secondary/10 text-secondary-foreground";
      case "accent":
        return "from-amber-400/30 to-amber-400/10 text-amber-700";
      case "info":
        return "from-blue-500/30 to-blue-500/10 text-blue-700";
      default:
        return "from-primary/30 to-primary/10 text-primary-foreground";
    }
  };

  // Convert image string to emoji or icon based on activity type
  const getActivityIcon = () => {
    switch (activity.image) {
      case "plaza": return "🏙️";
      case "mall": return "🛍️";
      case "gym": return "💪";
      case "club": return "🎵";
      case "work": return "💼";
      case "home": return "🏠";
      case "social": return "📱";
      case "cars": return "🚗";
      case "style": return "👕";
      case "school": return "🏫";
      default: return "⭐";
    }
  };

  return (
    <Card 
      className={`border-none bg-gradient-to-b ${getColors()} cursor-pointer backdrop-blur-sm 
      rounded-3xl transition-all duration-300 hover:scale-105 w-full aspect-square flex flex-col 
      shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] 
      active:scale-95 active:shadow-inner ${className}`}
      onClick={handleSelectActivity}
    >
      <div className="p-2 flex flex-col items-center justify-center h-full text-center">
        <div className="text-3xl mb-2 filter drop-shadow-sm">
          {getActivityIcon()}
        </div>
        <div>
          <h4 className="font-medium text-xs leading-tight truncate w-full">{activity.title}</h4>
        </div>
      </div>
    </Card>
  );
};

export default ActivityCard;