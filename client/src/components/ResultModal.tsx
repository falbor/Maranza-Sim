import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGame } from "@/lib/gameContext";
import { Check, Minus, Eye } from "lucide-react";

const ResultModal = () => {
  const { 
    activityResult, 
    showResultModal, 
    setShowResultModal
  } = useGame();

  if (!activityResult) return null;

  const handleClose = () => {
    setShowResultModal(false);
  };

  // Collect all the changes
  const changes = [
    { type: "money", value: activityResult.moneyChange || 0 },
    { type: "reputation", value: activityResult.reputationChange || 0 },
    { type: "style", value: activityResult.styleChange || 0 },
    { type: "energy", value: activityResult.energyChange || 0 },
    { type: "respect", value: activityResult.respectChange || 0 }
  ].filter(change => change.value !== 0);

  // Format the change display
  const formatChange = (type: string, value: number) => {
    if (type === "money") {
      return `€${Math.abs(value)}`;
    }
    return `${Math.abs(value)} ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  };

  return (
    <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
      <DialogContent 
        className="w-[90vw] max-w-md mx-auto max-h-[65vh] overflow-y-auto bg-black/90 border-primary/30 text-white"
      >
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl text-primary font-bold">
            Risultato Attività
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm md:text-base text-white/90">
            {activityResult.text}
          </p>
          
          <div className="bg-black/70 rounded-lg p-3 md:p-4 space-y-2 border border-white/10">
            {changes.map((change, index) => (
              <div key={index} className={`flex items-center ${change.value > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {change.value > 0 ? (
                  <Check className="w-5 h-5 mr-2" />
                ) : (
                  <Minus className="w-5 h-5 mr-2" />
                )}
                <span>{change.value > 0 ? '+' : '-'}{formatChange(change.type, change.value)}</span>
              </div>
            ))}
            
            {activityResult.newContact && (
              <div className="flex items-center text-blue-400">
                <Eye className="w-5 h-5 mr-2" />
                <span>Nuovo contatto aggiunto: {activityResult.newContact.name}</span>
              </div>
            )}
            
            {activityResult.newItem && (
              <div className="flex items-center text-purple-400">
                <Check className="w-5 h-5 mr-2" />
                <span>Nuovo oggetto: {activityResult.newItem.name}</span>
              </div>
            )}
            
            {activityResult.skillProgress && (
              <div className="flex items-center text-amber-400">
                <Check className="w-5 h-5 mr-2" />
                <span>Abilità migliorata!</span>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex justify-center mt-4">
          <Button
            onClick={handleClose}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white"
          >
            Continua
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResultModal;
