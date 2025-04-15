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

  // Determine colors based on activity.color for dark theme
  const getColors = () => {
    switch (activity.color) {
      case "primary":
        return "from-primary/40 to-primary/10 text-primary-foreground border-primary/30";
      case "secondary":
        return "from-secondary/40 to-secondary/10 text-secondary-foreground border-secondary/30";
      case "accent":
        return "from-amber-500/40 to-amber-500/10 text-amber-100 border-amber-500/30";
      case "info":
        return "from-blue-500/40 to-blue-500/10 text-blue-100 border-blue-500/30";
      default:
        return "from-primary/40 to-primary/10 text-primary-foreground border-primary/30";
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
      className={`border border-border bg-gradient-to-b ${getColors()} cursor-pointer backdrop-blur-sm 
      rounded-lg transition-all duration-200 hover:scale-105 w-full 
      shadow-md hover:shadow-lg active:scale-95 active:shadow-inner ${className}`}
      onClick={handleSelectActivity}
    >
      <div className="p-1.5 flex flex-col items-center justify-center h-full w-full">
        <div className="text-2xl filter drop-shadow-md mb-1">
          {getActivityIcon()}
        </div>
        <div className="text-center w-full px-1">
          <h4 className="font-medium text-xs leading-tight truncate w-full overflow-hidden">{activity.title}</h4>
        </div>
      </div>
    </Card>
  );
};

export default ActivityCard;