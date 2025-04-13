import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGame } from "@/lib/gameContext";
import { Clock, Check, Minus, Info } from "lucide-react";
import { getActivityIcon, getIconBackground } from "@/lib/activityIcons";

const ActivityModal = () => {
  const { 
    selectedActivity, 
    showActivityModal, 
    setShowActivityModal, 
    doActivity,
    isPendingActivity
  } = useGame();

  if (!selectedActivity) return null;

  const handleConfirm = () => {
    doActivity(selectedActivity.id);
  };

  const handleClose = () => {
    setShowActivityModal(false);
  };

  // Extract positive and negative effects
  const positiveEffects = Object.entries(selectedActivity.effects)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({ type: key, value }));

  const negativeEffects = Object.entries(selectedActivity.effects)
    .filter(([_, value]) => value < 0)
    .map(([key, value]) => ({ type: key, value }));

  // Format effect display
  const formatEffect = (type: string, value: number) => {
    if (type === "money") {
      return `€${Math.abs(value)}`;
    }
    return `${Math.abs(value)} ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  };

  return (
    <Dialog open={showActivityModal} onOpenChange={setShowActivityModal}>
      <DialogContent
  aria-describedby="activity-modal-description" className="bg-card rounded-xl shadow-xl max-w-md w-full mx-4 p-6 sm:max-w-md border border-primary/20">
        <DialogHeader className="flex items-center">
          <div className={`${getIconBackground(selectedActivity.color)} p-3 rounded-lg mb-3`}>
            {getActivityIcon(selectedActivity.image, 28)}
          </div>
          <DialogTitle className="text-center font-bold text-2xl text-primary bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text">
            {selectedActivity.title}
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <p className="text-foreground/90 text-center">
            {selectedActivity.description}
          </p>

          <div className="mt-6 space-y-3 text-sm bg-background/40 p-4 rounded-lg border border-primary/10">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-primary mr-2" />
              <span>Durata: {selectedActivity.duration} {selectedActivity.duration === 1 ? 'ora' : 'ore'}</span>
            </div>

            {positiveEffects.map((effect, index) => (
              <div key={index} className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                <span>+{formatEffect(effect.type, effect.value)}</span>
              </div>
            ))}

            {negativeEffects.map((effect, index) => (
              <div key={index} className="flex items-center">
                <Minus className="w-5 h-5 text-rose-500 mr-2" />
                <span>-{formatEffect(effect.type, effect.value)}</span>
              </div>
            ))}

            {selectedActivity.possibleOutcomes.length > 0 && (
              <div className="flex items-center mt-2 pt-2 border-t border-primary/10">
                <Info className="w-5 h-5 text-primary mr-2 shrink-0" />
                <span>{selectedActivity.possibleOutcomes[0]}</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between gap-3 sm:justify-between pt-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="px-4 py-2 border-primary/20"
          >
            Annulla
          </Button>
          <Button
            onClick={handleConfirm}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            disabled={isPendingActivity}
          >
            {isPendingActivity ? "Attendere..." : "Fai Attività"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityModal;