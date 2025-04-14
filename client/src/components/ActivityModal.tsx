import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGame } from "@/lib/gameContext";
import { Clock, Check, Minus, Info } from "lucide-react";

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
      <DialogContent className="w-[90vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl text-primary font-bold">
            {selectedActivity.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm md:text-base text-gray-700">
            {selectedActivity.description}
          </p>
          
          <div className="space-y-2 text-sm md:text-base">
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
                <Minus className="w-5 h-5 text-red-500 mr-2" />
                <span>-{formatEffect(effect.type, effect.value)}</span>
              </div>
            ))}
            
            {selectedActivity.possibleOutcomes.length > 0 && (
              <div className="flex items-center">
                <Info className="w-5 h-5 text-blue-500 mr-2" />
                <span>{selectedActivity.possibleOutcomes[0]}</span>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
          <Button
            variant="outline"
            onClick={handleClose}
            className="px-4 py-2"
          >
            Annulla
          </Button>
          <Button
            onClick={handleConfirm}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white"
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
