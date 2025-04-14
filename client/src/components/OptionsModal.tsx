import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGame } from "@/lib/gameContext";

interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OptionsModal = ({ isOpen, onClose }: OptionsModalProps) => {
  const { resetGame } = useGame();

  const handleReset = async () => {
    if (confirm("Sei sicuro di voler resettare il gioco? Tutti i progressi verranno persi!")) {
      await resetGame();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Opzioni</DialogTitle>
          <DialogDescription>
            Gestisci le impostazioni del tuo gioco
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <h3 className="font-medium mb-2">Informazioni di Gioco</h3>
            <p className="text-sm text-gray-500">
              Maranza Simulator è un gioco dove vivi la vita di un vero maranza.
              Gestisci il tuo stile, la tua reputazione e il tuo rispetto nella comunità.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-red-600 mb-2">Zona Pericolosa</h3>
            <p className="text-sm text-gray-500 mb-2">
              Attenzione: resettare il gioco cancellerà tutti i tuoi progressi.
            </p>
            <Button 
              variant="destructive" 
              onClick={handleReset}
              className="w-full"
            >
              Resetta Gioco
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Chiudi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OptionsModal;