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
      className={`border-l-4 ${getColors()} cursor-pointer shadow transition-all duration-200 hover:shadow-md`}
      onClick={handleSelectActivity}
    >
      <div className="p-3 flex items-center space-x-3">
        <div className="text-3xl">
          {getActivityIcon()}
        </div>
        <div>
          <h4 className="font-bold">{activity.title}</h4>
          <p className="text-xs opacity-70 line-clamp-1">{activity.description}</p>
          <div className="text-xs mt-1 opacity-80">
            {activity.duration} {activity.duration === 1 ? 'ora' : 'ore'}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ActivityCard;