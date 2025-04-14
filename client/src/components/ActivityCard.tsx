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
      className="game-card rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transform transition-transform hover:-translate-y-1"
      onClick={handleSelectActivity}
    >
      <div className={`aspect-square bg-gradient-to-r ${getGradient()} relative`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl mb-2">
            {activity.image}
          </div>
          <h4 className="text-white font-bold text-sm px-2 text-center drop-shadow-lg">{activity.title}</h4>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;