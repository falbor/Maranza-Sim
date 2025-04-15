import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGame } from "@/lib/gameContext";
import { Clock, Check, Minus, Info } from "lucide-react";

/**
 * ActivityModal - Componente modale per visualizzare e confermare un'attività selezionata
 * 
 * Questo componente mostra i dettagli di un'attività selezionata, compresi:
 * - Titolo e descrizione dell'attività
 * - Durata dell'attività
 * - Effetti positivi e negativi che l'attività avrà sul personaggio
 * - Possibili esiti dell'attività
 * 
 * Permette all'utente di confermare o annullare l'esecuzione dell'attività
 */
const ActivityModal = () => {
  // Accesso ai dati e alle funzioni del contesto di gioco
  const { 
    selectedActivity, // L'attività attualmente selezionata
    showActivityModal, // Flag che controlla la visibilità del modale
    setShowActivityModal, // Funzione per modificare la visibilità del modale
    doActivity, // Funzione per eseguire l'attività selezionata
    isPendingActivity // Flag che indica se un'attività è in corso di elaborazione
  } = useGame();

  // Non renderizzare nulla se non c'è un'attività selezionata
  if (!selectedActivity) return null;

  /**
   * Gestisce la conferma dell'attività
   * Richiama la funzione doActivity passando l'ID dell'attività selezionata
   */
  const handleConfirm = () => {
    doActivity(selectedActivity.id);
  };

  /**
   * Gestisce la chiusura del modale
   * Imposta showActivityModal a false
   */
  const handleClose = () => {
    setShowActivityModal(false);
  };

  // Estrae e organizza gli effetti positivi (valori > 0)
  const positiveEffects = Object.entries(selectedActivity.effects)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({ type: key, value }));

  // Estrae e organizza gli effetti negativi (valori < 0)
  const negativeEffects = Object.entries(selectedActivity.effects)
    .filter(([_, value]) => value < 0)
    .map(([key, value]) => ({ type: key, value }));

  /**
   * Formatta la visualizzazione degli effetti in base al tipo
   * @param type - Il tipo di effetto (es. "money", "energia", ecc.)
   * @param value - Il valore dell'effetto
   * @returns Una stringa formattata per la visualizzazione
   */
  const formatEffect = (type: string, value: number) => {
    if (type === "money") {
      return `€${Math.abs(value)}`;
    }
    return `${Math.abs(value)} ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  };

  return (
    <Dialog open={showActivityModal} onOpenChange={setShowActivityModal}>
      <DialogContent 
        className="w-[90vw] max-w-md mx-auto max-h-[65vh] overflow-y-auto bg-black/90 border-primary/30 text-white"
        style={{
          position: "fixed",
          left: "50%",
          top: "calc(50% + 2rem)",
          transform: "translate(-50%, -50%)",
          margin: "0 auto",
          zIndex: 100,
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl text-primary font-bold">
            {selectedActivity.title}
          </DialogTitle>
        </DialogHeader>
        
        {/* Sezione contenuto principale del modale */}
        <div className="space-y-4">
          <p className="text-sm md:text-base text-white/90">
            {selectedActivity.description}
          </p>
          
          {/* Sezione con la durata e gli effetti dell'attività */}
          <div className="space-y-2 text-sm md:text-base">
            {/* Visualizzazione della durata */}
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-primary mr-2" />
              <span>Durata: {selectedActivity.duration} {selectedActivity.duration === 1 ? 'ora' : 'ore'}</span>
            </div>
            
            {/* Effetti positivi con icona check */}
            {positiveEffects.map((effect, index) => (
              <div key={index} className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                <span>+{formatEffect(effect.type, effect.value)}</span>
              </div>
            ))}
            
            {/* Effetti negativi con icona minus */}
            {negativeEffects.map((effect, index) => (
              <div key={index} className="flex items-center">
                <Minus className="w-5 h-5 text-red-500 mr-2" />
                <span>-{formatEffect(effect.type, effect.value)}</span>
              </div>
            ))}
            
            {/* Possibili esiti dell'attività, se presenti */}
            {selectedActivity.possibleOutcomes.length > 0 && (
              <div className="flex items-center">
                <Info className="w-5 h-5 text-blue-500 mr-2" />
                <span>{selectedActivity.possibleOutcomes[0]}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer con pulsanti di azione */}
        <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
          <Button
            variant="outline"
            onClick={handleClose}
            className="px-4 py-2 text-white border-white/30 hover:bg-white/10"
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
