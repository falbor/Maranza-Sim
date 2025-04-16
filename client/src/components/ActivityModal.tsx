import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGame } from "@/lib/gameContext";
import { Clock, Check, Minus, Info, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { Item } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Utility function per generare sotto-attività casuali appropriate al contesto
const generateSubActivities = (activityTitle: string, activityCategory: string): { id: number, name: string, duration: number, effects: Record<string, number>, description: string }[] => {
  // Base di sotto-attività per tutte le categorie
  const commonSubActivities = [
    { 
      id: 1001, 
      name: "Controlla il telefono", 
      duration: 0.5, 
      effects: { energy: -5, reputation: 2 },
      description: "Dai un'occhiata ai social e rispondi ai messaggi"
    },
    { 
      id: 1002, 
      name: "Chatta con amici", 
      duration: 0.5, 
      effects: { energy: -5, reputation: 3 },
      description: "Scambia messaggi con gli amici e condividi meme"
    },
    { 
      id: 1003, 
      name: "Fai un selfie", 
      duration: 0.5, 
      effects: { energy: -5, reputation: 5 },
      description: "Scatta un selfie per i social e ricevi like"
    }
  ];

  // Sotto-attività specifiche per categoria
  const categorySubActivities: Record<string, { id: number, name: string, duration: number, effects: Record<string, number>, description: string }[]> = {
    "sociale": [
      { 
        id: 2001, 
        name: "Fai nuove conoscenze", 
        duration: 1, 
        effects: { energy: -10, reputation: 8 },
        description: "Presentati a nuove persone per ampliare il tuo giro"
      },
      { 
        id: 2002, 
        name: "Sfoggia il tuo stile", 
        duration: 0.5, 
        effects: { energy: -5, respect: 5 },
        description: "Mettiti in mostra con il tuo look maranza"
      },
      { 
        id: 2003, 
        name: "Racconta una storia", 
        duration: 0.5, 
        effects: { energy: -5, reputation: 4 },
        description: "Racconta una storia esagerata per impressionare gli altri"
      }
    ],
    "acquisti": [
      { 
        id: 2004, 
        name: "Prova vestiti firmati", 
        duration: 0.5, 
        effects: { energy: -10, style: 5 },
        description: "Prova alcuni vestiti firmati senza comprarli"
      },
      { 
        id: 2005, 
        name: "Contratta il prezzo", 
        duration: 0.5, 
        effects: { energy: -10, money: 15 },
        description: "Cerca di ottenere uno sconto sui prodotti"
      },
      { 
        id: 2006, 
        name: "Sfoggia marche costose", 
        duration: 0.5, 
        effects: { energy: -5, respect: 4 },
        description: "Mostra i tuoi capi firmati al centro commerciale"
      }
    ],
    "fitness": [
      { 
        id: 2007, 
        name: "Allenamento intenso", 
        duration: 1, 
        effects: { energy: -20, respect: 10 },
        description: "Fai un allenamento intenso per migliorare il fisico"
      },
      { 
        id: 2008, 
        name: "Selfie in palestra", 
        duration: 0.5, 
        effects: { energy: -5, reputation: 7 },
        description: "Scatta un selfie allo specchio della palestra"
      },
      { 
        id: 2009, 
        name: "Mostra i muscoli", 
        duration: 0.5, 
        effects: { energy: -5, respect: 6 },
        description: "Esibisci i muscoli per impressionare gli altri"
      }
    ],
    "divertimento": [
      { 
        id: 2010, 
        name: "Balla al centro", 
        duration: 1, 
        effects: { energy: -15, reputation: 12 },
        description: "Balla al centro della pista mostrando le tue mosse"
      },
      { 
        id: 2011, 
        name: "Offri da bere", 
        duration: 0.5, 
        effects: { money: -20, reputation: 8 },
        description: "Offri da bere agli amici per fare bella figura"
      },
      { 
        id: 2012, 
        name: "Fai amicizia col DJ", 
        duration: 0.5, 
        effects: { energy: -5, respect: 8 },
        description: "Avvicinati al DJ e chiedi la tua canzone preferita"
      }
    ],
    "lavoro": [
      { 
        id: 2013, 
        name: "Lavora intensamente", 
        duration: 1, 
        effects: { energy: -15, money: 40 },
        description: "Lavora sodo per guadagnare più soldi"
      },
      { 
        id: 2014, 
        name: "Fai pausa caffè", 
        duration: 0.5, 
        effects: { energy: 5, money: 10 },
        description: "Prendi una pausa caffè per ricaricarti"
      },
      { 
        id: 2015, 
        name: "Chiedi aumento", 
        duration: 0.5, 
        effects: { energy: -5, money: 25 },
        description: "Prova a chiedere un aumento al capo"
      }
    ],
    "riposo": [
      { 
        id: 2016, 
        name: "Pisolino veloce", 
        duration: 0.5, 
        effects: { energy: 15 },
        description: "Fai un pisolino per recuperare energia"
      },
      { 
        id: 2017, 
        name: "Guarda serie TV", 
        duration: 1, 
        effects: { energy: 10 },
        description: "Rilassati guardando una serie TV"
      },
      { 
        id: 2018, 
        name: "Ascolta musica", 
        duration: 0.5, 
        effects: { energy: 8 },
        description: "Ascolta un po' di musica trap per rilassarti"
      }
    ],
    "evento": [
      { 
        id: 2019, 
        name: "Parla di auto", 
        duration: 0.5, 
        effects: { energy: -5, respect: 7 },
        description: "Discuti di auto modificate con altri appassionati"
      },
      { 
        id: 2020, 
        name: "Fai foto alle auto", 
        duration: 0.5, 
        effects: { energy: -5, reputation: 5 },
        description: "Scatta foto di auto modificate per i social"
      },
      { 
        id: 2021, 
        name: "Contatta meccanico", 
        duration: 0.5, 
        effects: { energy: -5, respect: 4 },
        description: "Parla con un meccanico di possibili modifiche"
      }
    ],
    "obbligo": [
      { 
        id: 2022, 
        name: "Studia per test", 
        duration: 1, 
        effects: { energy: -10, respect: -2 },
        description: "Dedica un po' di tempo a studiare per un test"
      },
      { 
        id: 2023, 
        name: "Socializza in pausa", 
        duration: 0.5, 
        effects: { energy: -5, reputation: 3 },
        description: "Socializza con i compagni durante la pausa"
      },
      { 
        id: 2024, 
        name: "Parla col professore", 
        duration: 0.5, 
        effects: { energy: -5, respect: -1 },
        description: "Parla con un professore per migliorare i voti"
      }
    ]
  };

  // Attività specifiche per titolo
  const titleSpecificSubActivities: Record<string, { id: number, name: string, duration: number, effects: Record<string, number>, description: string }[]> = {
    "Giro in Piazza": [
      { 
        id: 3001, 
        name: "Incontra il gruppo", 
        duration: 0.5, 
        effects: { energy: -5, reputation: 7 },
        description: "Ritrova il tuo gruppo di amici in piazza"
      },
      { 
        id: 3002, 
        name: "Sfoggia nuovi vestiti", 
        duration: 0.5, 
        effects: { energy: -5, style: 6 },
        description: "Mostra il tuo nuovo outfit agli amici"
      },
      { 
        id: 3003, 
        name: "Racconta storie esagerate", 
        duration: 0.5, 
        effects: { energy: -5, reputation: 8 },
        description: "Impressiona gli altri con storie esagerate"
      }
    ],
    "Shopping al Centro": [
      { 
        id: 3004, 
        name: "Cerca sconti speciali", 
        duration: 0.5, 
        effects: { energy: -5, money: 20 },
        description: "Cerca i migliori sconti nei negozi"
      },
      { 
        id: 3005, 
        name: "Prova molti capi", 
        duration: 0.5, 
        effects: { energy: -10, style: 3 },
        description: "Prova diversi outfit nei camerini"
      },
      { 
        id: 3006, 
        name: "Compra accessorio", 
        duration: 0.5, 
        effects: { money: -30, style: 5 },
        description: "Acquista un piccolo accessorio per migliorare il look"
      }
    ],
    "Palestra": [
      { 
        id: 3007, 
        name: "Allenamento estremo", 
        duration: 1, 
        effects: { energy: -25, respect: 12 },
        description: "Fai un allenamento estremamente intenso"
      },
      { 
        id: 3008, 
        name: "Posa davanti allo specchio", 
        duration: 0.5, 
        effects: { energy: -5, reputation: 5 },
        description: "Scatta foto davanti allo specchio della palestra"
      },
      { 
        id: 3009, 
        name: "Aiuta un principiante", 
        duration: 0.5, 
        effects: { energy: -10, respect: 7 },
        description: "Aiuta un principiante a usare gli attrezzi"
      }
    ],
    "Serata in Discoteca": [
      { 
        id: 3010, 
        name: "Balla sul cubo", 
        duration: 0.5, 
        effects: { energy: -15, reputation: 15 },
        description: "Sali sul cubo e mostra le tue mosse di ballo"
      },
      { 
        id: 3011, 
        name: "Parla col buttafuori", 
        duration: 0.5, 
        effects: { energy: -5, respect: 6 },
        description: "Fai amicizia con il buttafuori per saltare la fila"
      },
      { 
        id: 3012, 
        name: "Prenota tavolo VIP", 
        duration: 0.5, 
        effects: { money: -100, reputation: 20 },
        description: "Prenota un tavolo VIP per impressionare tutti"
      }
    ]
  };
  
  // Ottieni sotto-attività per questa attività specifica in base al titolo
  const titleSubActivities = titleSpecificSubActivities[activityTitle] || [];
  
  // Ottieni sotto-attività per la categoria
  const specificCategorySubActivities = categorySubActivities[activityCategory] || [];
  
  // Combina le sotto-attività e seleziona casualmente 4 diverse
  const allPossibleSubActivities = [...titleSubActivities, ...specificCategorySubActivities, ...commonSubActivities];
  
  // Mescola l'array
  const shuffled = [...allPossibleSubActivities].sort(() => 0.5 - Math.random());
  
  // Ritorna le prime 4 o meno se non ce ne sono abbastanza
  return shuffled.slice(0, 4);
};

/**
 * ActivityModal - Componente modale per visualizzare e scegliere una sotto-attività
 */
const ActivityModal = () => {
  // Accesso ai dati e alle funzioni del contesto di gioco
  const { 
    selectedActivity, // L'attività attualmente selezionata
    showActivityModal, // Flag che controlla la visibilità del modale
    setShowActivityModal, // Funzione per modificare la visibilità del modale
    doActivity, // Funzione per eseguire l'attività selezionata
    isPendingActivity, // Flag che indica se un'attività è in corso di elaborazione
    game, // Lo stato corrente del gioco
    refetchGame, // Funzione per ricaricare lo stato del gioco
    setActivityResult, // Funzione per impostare il risultato dell'attività
    setShowResultModal // Funzione per mostrare il modale dei risultati
  } = useGame();
  
  // Import del hook per le notifiche toast
  const { toast } = useToast();

  // Stato per le sotto-attività
  const [subActivities, setSubActivities] = useState<{ id: number, name: string, duration: number, effects: Record<string, number>, description: string }[]>([]);
  // Stato per gli oggetti del negozio (solo per lo shopping)
  const [shopItems, setShopItems] = useState<Item[]>([]);
  // Stato per tenere traccia della sotto-attività selezionata
  const [selectedSubActivity, setSelectedSubActivity] = useState<number | null>(null);

  // Effetto per generare sotto-attività quando l'attività selezionata cambia
  useEffect(() => {
    if (selectedActivity) {
      if (selectedActivity.title === "Shopping al Centro") {
        // Per lo shopping, carica oggetti reali dal negozio
        const fetchShopItems = async () => {
          try {
            const response = await apiRequest("GET", "/api/game/shop");
            const items = await response.json();
            
            // Seleziona 4 oggetti random non posseduti
            const notOwnedItems = items.filter((item: Item) => !item.isOwned);
            const randomItems = notOwnedItems
              .sort(() => 0.5 - Math.random())
              .slice(0, 4);
            
            setShopItems(randomItems);
            
            // Crea sotto-attività basate sugli oggetti
            const itemSubActivities = randomItems.map((item: Item) => {
              const effects: Record<string, number> = { money: -item.price };
              // Aggiungi anche il primo effetto dell'oggetto se presente
              if (item.effects && item.effects.length > 0) {
                effects[item.effects[0].type] = item.effects[0].value;
              }
              
              return {
                id: item.id + 10000, // Aggiungi un offset per evitare conflitti di ID
                name: `Compra ${item.name}`,
                duration: 0.5,
                effects: effects,
                description: item.description,
                itemId: item.id // Salva l'ID dell'oggetto per l'acquisto
              };
            });
            
            setSubActivities(itemSubActivities);
          } catch (error) {
            console.error("Errore nel caricamento degli oggetti:", error);
            // In caso di errore, usa sotto-attività generiche di shopping
            setSubActivities(generateSubActivities(selectedActivity.title, selectedActivity.category));
          }
        };
        
        fetchShopItems();
      } else {
        // Per le altre attività, genera sotto-attività casuali
        setSubActivities(generateSubActivities(selectedActivity.title, selectedActivity.category));
      }
    } else {
      // Resetta le sotto-attività quando non c'è un'attività selezionata
      setSubActivities([]);
      setSelectedSubActivity(null);
    }
  }, [selectedActivity]);

  // Non renderizzare nulla se non c'è un'attività selezionata
  if (!selectedActivity) return null;

  /**
   * Gestisce la selezione di una sotto-attività
   */
  const handleSelectSubActivity = (id: number) => {
    setSelectedSubActivity(id);
  };

  /**
   * Gestisce la conferma dell'attività
   * Se è un'attività di shopping e l'item ha un itemId, acquista l'oggetto
   * Altrimenti esegue la sotto-attività come un'attività normale
   */
  const handleConfirm = async () => {
    if (!selectedSubActivity) return;

    if (selectedActivity.title === "Shopping al Centro") {
      const subActivity = subActivities.find(sa => sa.id === selectedSubActivity);
      
      // Se è un'attività di shopping con itemId
      if (subActivity && 'itemId' in subActivity) {
        try {
          // Tenta di acquistare l'oggetto
          const response = await apiRequest("POST", "/api/game/shop/purchase", {
            itemId: subActivity.itemId
          });
          
          if (response.ok) {
            // Dopo l'acquisto, chiudi la modale e aggiorna il gioco
            const result = await response.json();
            
            // Mostra un messaggio di successo
            toast({
              title: "Acquisto completato!",
              description: result.message || `Hai acquistato un oggetto! -€${Math.abs(subActivity.effects.money || 0)}`,
              duration: 3000
            });
            
            // Aggiorna lo stato del gioco per riflettere i cambiamenti
            await refetchGame();
            
            // Chiude il modale
            setShowActivityModal(false);
          } else {
            // Gestisci gli errori nel caso di risposta non ok
            const errorData = await response.json();
            toast({
              title: "Errore nell'acquisto",
              description: errorData.message || "Non è stato possibile completare l'acquisto.",
              variant: "destructive",
              duration: 3000
            });
          }
        } catch (error) {
          console.error("Errore nell'acquisto:", error);
          toast({
            title: "Errore nell'acquisto",
            description: "Si è verificato un errore durante l'acquisto. Riprova più tardi.",
            variant: "destructive",
            duration: 3000
          });
        }
      } else {
        // È un'attività di shopping generica, eseguila come sotto-attività
        try {
          const response = await apiRequest("POST", `/api/game/activity/${selectedSubActivity}`, {
            isSubActivity: true
          });
          
          if (response.ok) {
            const result = await response.json();
            setActivityResult(result);
            setShowActivityModal(false);
            setShowResultModal(true);
            refetchGame();
          } else {
            const errorData = await response.json();
            toast({
              title: "Errore nell'attività",
              description: errorData.message || "Non è stato possibile completare l'attività.",
              variant: "destructive",
              duration: 3000
            });
          }
        } catch (error) {
          console.error("Errore nella sotto-attività:", error);
          toast({
            title: "Errore",
            description: "Si è verificato un errore durante l'esecuzione dell'attività.",
            variant: "destructive",
            duration: 3000
          });
        }
      }
    } else {
      // Per le altre attività, usa l'ID della sotto-attività e il flag isSubActivity
      try {
        const response = await apiRequest("POST", `/api/game/activity/${selectedSubActivity}`, {
          isSubActivity: true
        });
        
        if (response.ok) {
          const result = await response.json();
          setActivityResult(result);
          setShowActivityModal(false);
          setShowResultModal(true);
          refetchGame();
        } else {
          const errorData = await response.json();
          toast({
            title: "Errore nell'attività",
            description: errorData.message || "Non è stato possibile completare l'attività.",
            variant: "destructive",
            duration: 3000
          });
        }
      } catch (error) {
        console.error("Errore nella sotto-attività:", error);
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'esecuzione dell'attività.",
          variant: "destructive",
          duration: 3000
        });
      }
    }
  };

  /**
   * Gestisce la chiusura del modale
   */
  const handleClose = () => {
    setShowActivityModal(false);
    setSelectedSubActivity(null);
  };

  /**
   * Formatta la visualizzazione degli effetti in base al tipo
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
        
        {/* Sezione con le sotto-attività */}
        <div className="space-y-4">
          <p className="text-sm md:text-base text-white/90">
            {selectedActivity.description}
          </p>
          
          <div className="text-white/80 text-sm font-medium mb-2">
            Scegli un'attività da fare:
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {subActivities.map((subActivity) => (
              <div 
                key={subActivity.id}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedSubActivity === subActivity.id
                  ? 'border-primary bg-primary/20'
                  : 'border-white/10 bg-black/40 hover:border-white/30'
                }`}
                onClick={() => handleSelectSubActivity(subActivity.id)}
              >
                <div className="flex justify-between items-center">
                  <div className="font-medium text-sm">
                    {subActivity.name}
                  </div>
                  <div className="text-xs text-white/60">
                    {subActivity.duration}h
                  </div>
                </div>
                
                <div className="text-xs text-white/70 mt-1">
                  {subActivity.description}
                </div>
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(subActivity.effects).map(([type, value], idx) => (
                    <div 
                      key={idx}
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        value > 0 
                        ? type === 'money' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                        : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {value > 0 ? '+' : '-'}{formatEffect(type, value)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
            disabled={isPendingActivity || selectedSubActivity === null}
          >
            {isPendingActivity 
              ? "Attendere..." 
              : selectedActivity.title === "Shopping al Centro" 
                ? "Acquista" 
                : "Fai Attività"
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityModal;
