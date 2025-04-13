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
    { type: "money", value: activityResult.moneyChange },
    { type: "reputation", value: activityResult.reputationChange },
    { type: "style", value: activityResult.styleChange },
    { type: "energy", value: activityResult.energyChange },
    { type: "respect", value: activityResult.respectChange }
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
      <DialogContent className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-bold text-2xl text-primary">
            Risultato Attività
          </DialogTitle>
        </DialogHeader>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            {activityResult.text}
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            {changes.map((change, index) => (
              change.value !== 0 && (
                <div key={index} className={`flex items-center ${change.value > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {change.value > 0 ? (
                    <Check className="w-5 h-5 mr-2" />
                  ) : (
                    <Minus className="w-5 h-5 mr-2" />
                  )}
                  <span>{change.value > 0 ? '+' : '-'}{formatChange(change.type, change.value)}</span>
                </div>
              )
            ))}
            
            {activityResult.newContact && (
              <div className="flex items-center text-blue-500">
                <Eye className="w-5 h-5 mr-2" />
                <span>Nuovo contatto aggiunto: {activityResult.newContact.name}</span>
              </div>
            )}
            
            {activityResult.newItem && (
              <div className="flex items-center text-purple-500">
                <Check className="w-5 h-5 mr-2" />
                <span>Nuovo oggetto: {activityResult.newItem.name}</span>
              </div>
            )}
            
            {activityResult.skillProgress && (
              <div className="flex items-center text-amber-500">
                <Check className="w-5 h-5 mr-2" />
                <span>Abilità migliorata!</span>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex justify-center">
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
