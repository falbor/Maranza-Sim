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
        return "border-primary bg-primary/10 hover:bg-primary/20";
      case "secondary":
        return "border-secondary bg-secondary/10 hover:bg-secondary/20";
      case "accent":
        return "border-amber-400 bg-amber-400/10 hover:bg-amber-400/20";
      case "info":
        return "border-blue-500 bg-blue-500/10 hover:bg-blue-500/20";
      default:
        return "border-primary bg-primary/10 hover:bg-primary/20";
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
      className={`border ${getColors()} cursor-pointer shadow-sm rounded-2xl transition-all duration-200 hover:shadow-md w-full aspect-square flex flex-col ${className}`}
      onClick={handleSelectActivity}
    >
      <div className="p-2 flex flex-col items-center justify-center h-full text-center">
        <div className="text-3xl mb-1">
          {getActivityIcon()}
        </div>
        <div>
          <h4 className="font-semibold text-xs truncate w-full">{activity.title}</h4>
        </div>
      </div>
    </Card>
  );
};

export default ActivityCard;