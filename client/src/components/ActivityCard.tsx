import { Activity } from "@/lib/types";
import { useGame } from "@/lib/gameContext";
import { Card } from "@/components/ui/card";

interface ActivityCardProps {
  activity: Activity;
}

const ActivityCard = ({ activity }: ActivityCardProps) => {
  const { setSelectedActivity, setShowActivityModal } = useGame();

  const handleSelectActivity = () => {
    setSelectedActivity(activity);
    setShowActivityModal(true);
  };

  // Determine colors based on activity.color
  const getColors = () => {
    switch (activity.color) {
      case "primary":
        return "border-primary bg-primary/5 hover:bg-primary/10";
      case "secondary":
        return "border-secondary bg-secondary/5 hover:bg-secondary/10";
      case "accent":
        return "border-amber-400 bg-amber-400/5 hover:bg-amber-400/10";
      case "info":
        return "border-blue-500 bg-blue-500/5 hover:bg-blue-500/10";
      default:
        return "border-primary bg-primary/5 hover:bg-primary/10";
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
      className={`border-2 ${getColors()} cursor-pointer shadow transition-all duration-200 hover:shadow-md w-full aspect-square flex flex-col`}
      onClick={handleSelectActivity}
    >
      <div className="p-3 flex flex-col items-center justify-center h-full text-center">
        <div className="text-4xl mb-3">
          {getActivityIcon()}
        </div>
        <div>
          <h4 className="font-bold">{activity.title}</h4>
          <p className="text-xs opacity-70 line-clamp-2 mt-1">{activity.description}</p>
          <div className="text-xs mt-2 opacity-80">
            {activity.duration} {activity.duration === 1 ? 'ora' : 'ore'}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ActivityCard;