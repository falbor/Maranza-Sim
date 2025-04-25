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
    "auto": [
      { 
        id: 2001, 
        name: "Modifica motore", 
        duration: 1, 
        effects: { energy: -15, respect: 10, money: -30 },
        description: "Potenzia il motore della tua auto per farla sentire a chilometri di distanza"
      },
      { 
        id: 2002, 
        name: "Installa luci neon", 
        duration: 0.5, 
        effects: { energy: -5, style: 8, money: -20 },
        description: "Aggiungi luci neon sotto la tua auto per uno stile unico"
      },
      { 
        id: 2003, 
        name: "Lucida carrozzeria", 
        duration: 0.5, 
        effects: { energy: -8, style: 5 },
        description: "Lucida la carrozzeria per far brillare la tua auto"
      }
    ],
    "lavoro": [
      { 
        id: 2004, 
        name: "Turno extra", 
        duration: 1, 
        effects: { energy: -20, money: 50 },
        description: "Fai un turno extra per guadagnare più soldi"
      },
      { 
        id: 2005, 
        name: "Chiedi aumento", 
        duration: 0.5, 
        effects: { energy: -5, money: 25, respect: 3 },
        description: "Metti pressione al tuo capo per avere un aumento"
      },
      { 
        id: 2006, 
        name: "Networking", 
        duration: 0.5, 
        effects: { energy: -5, reputation: 7 },
        description: "Fai amicizia con colleghi per opportunità future"
      }
    ],
    "educazione": [
      { 
        id: 2007, 
        name: "Studia intensamente", 
        duration: 1, 
        effects: { energy: -15, respect: -2 },
        description: "Dedica tempo allo studio per migliorare le tue competenze"
      },
      { 
        id: 2008, 
        name: "Copia compiti", 
        duration: 0.5, 
        effects: { energy: -5, reputation: 3, respect: -1 },
        description: "Copia i compiti da un compagno di classe"
      },
      { 
        id: 2009, 
        name: "Disturba in classe", 
        duration: 0.5, 
        effects: { energy: -5, respect: 5, reputation: 3 },
        description: "Disturba la lezione per fare colpo sui compagni"
      }
    ],
    "sociale": [
      { 
        id: 2010, 
        name: "Organizza uscita", 
        duration: 1, 
        effects: { energy: -10, reputation: 10, money: -15 },
        description: "Organizza un'uscita con la tua crew per rafforzare i legami"
      },
      { 
        id: 2011, 
        name: "Litiga per territorio", 
        duration: 0.5, 
        effects: { energy: -15, respect: 12 },
        description: "Affronta un'altra crew per difendere il vostro territorio"
      },
      { 
        id: 2012, 
        name: "Posta foto di gruppo", 
        duration: 0.5, 
        effects: { energy: -5, reputation: 8 },
        description: "Pubblica foto con la tua crew sui social per aumentare il tuo status"
      }
    ],
    "famiglia": [
      { 
        id: 2013, 
        name: "Cena in famiglia", 
        duration: 1, 
        effects: { energy: 5, reputation: -5 },
        description: "Passa del tempo con la tua famiglia, anche se non è molto maranza"
      },
      { 
        id: 2014, 
        name: "Chiedi soldi", 
        duration: 0.5, 
        effects: { money: 15, respect: -5 },
        description: "Chiedi soldi ai tuoi genitori con una scusa credibile"
      },
      { 
        id: 2015, 
        name: "Aiuta in casa", 
        duration: 0.5, 
        effects: { energy: -10, respect: -2 },
        description: "Aiuta con le faccende di casa per migliorare i rapporti familiari"
      }
    ],
    "divertimento": [
      { 
        id: 2016, 
        name: "Prenota tavolo VIP", 
        duration: 0.5, 
        effects: { energy: -10, reputation: 15, money: -100 },
        description: "Prenota un tavolo VIP in discoteca per fare bella figura"
      },
      { 
        id: 2017, 
        name: "Balla in centro pista", 
        duration: 1, 
        effects: { energy: -15, reputation: 12 },
        description: "Mettiti al centro della pista e mostra le tue mosse migliori"
      },
      { 
        id: 2018, 
        name: "Offri drink", 
        duration: 0.5, 
        effects: { energy: -5, reputation: 8, money: -30 },
        description: "Offri drink agli amici per essere generoso"
      }
    ],
    "acquisti": [
      { 
        id: 2019, 
        name: "Sfoggia marchi costosi", 
        duration: 0.5, 
        effects: { energy: -5, style: 8, reputation: 5 },
        description: "Vai in giro con vestiti firmati per impressionare gli altri"
      },
      { 
        id: 2020, 
        name: "Contratta il prezzo", 
        duration: 0.5, 
        effects: { energy: -5, money: 15 },
        description: "Cerca di ottenere uno sconto sui prodotti che vuoi comprare"
      },
      { 
        id: 2021, 
        name: "Compra nuovi accessori", 
        duration: 0.5, 
        effects: { energy: -5, style: 6, money: -25 },
        description: "Acquista accessori per completare il tuo look maranza"
      }
    ],
    "romantico": [
      { 
        id: 2022, 
        name: "Invita ad uscire", 
        duration: 1, 
        effects: { energy: -10, reputation: 5, money: -20 },
        description: "Invita il tuo crush a uscire per un appuntamento"
      },
      { 
        id: 2023, 
        name: "Manda messaggi", 
        duration: 0.5, 
        effects: { energy: -5, reputation: 3 },
        description: "Manda messaggi al tuo crush per fargli sapere che ci tieni"
      },
      { 
        id: 2024, 
        name: "Regala qualcosa", 
        duration: 0.5, 
        effects: { energy: -5, respect: 3, money: -30 },
        description: "Fai un piccolo regalo per impressionare il tuo crush"
      }
    ]
  };

  // Attività specifiche per titolo
  const titleSpecificSubActivities: Record<string, { id: number, name: string, duration: number, effects: Record<string, number>, description: string }[]> = {
    "Garage": [
      { 
        id: 3001, 
        name: "Scarico racing", 
        duration: 0.5, 
        effects: { energy: -10, respect: 12, money: -50 },
        description: "Installa uno scarico racing per far sentire la tua auto da lontano"
      },
      { 
        id: 3002, 
        name: "Cerchi in lega", 
        duration: 0.5, 
        effects: { energy: -8, style: 10, money: -40 },
        description: "Monta nuovi cerchi in lega per uno stile aggressivo"
      },
      { 
        id: 3003, 
        name: "Abbassa l'auto", 
        duration: 0.5, 
        effects: { energy: -10, style: 8, respect: 7, money: -30 },
        description: "Abbassa la tua auto per un look ancora più aggressivo"
      }
    ],
    "Lavoro": [
      { 
        id: 3004, 
        name: "Consegne cibo", 
        duration: 0.5, 
        effects: { energy: -15, money: 35 },
        description: "Consegna cibo a domicilio per guadagnare extra"
      },
      { 
        id: 3005, 
        name: "Aiuta officina", 
        duration: 1, 
        effects: { energy: -20, money: 45, respect: 5 },
        description: "Aiuta in officina meccanica, impara e guadagna"
      },
      { 
        id: 3006, 
        name: "Dj set locale", 
        duration: 0.5, 
        effects: { energy: -15, money: 40, reputation: 10 },
        description: "Suona come DJ in un locale per guadagnare e farti conoscere"
      }
    ],
    "Scuola": [
      { 
        id: 3007, 
        name: "Salta lezione", 
        duration: 1, 
        effects: { energy: 5, respect: 8, reputation: 3 },
        description: "Salta la lezione per aumentare la tua reputazione da maranza"
      },
      { 
        id: 3008, 
        name: "Butta giù compiti", 
        duration: 0.5, 
        effects: { energy: -10, respect: -2 },
        description: "Fai velocemente i compiti per toglierti il pensiero"
      },
      { 
        id: 3009, 
        name: "Fai colpo sui compagni", 
        duration: 0.5, 
        effects: { energy: -5, reputation: 7, style: 3 },
        description: "Impressiona i compagni con il tuo stile da maranza"
      }
    ],
    "Crew": [
      { 
        id: 3010, 
        name: "Riunione di crew", 
        duration: 0.5, 
        effects: { energy: -5, respect: 10, reputation: 5 },
        description: "Riunisci la tua crew per pianificare le prossime mosse"
      },
      { 
        id: 3011, 
        name: "Graffiti", 
        duration: 0.5, 
        effects: { energy: -10, reputation: 12, respect: 8 },
        description: "Fai graffiti con la tua crew per marcare il territorio"
      },
      { 
        id: 3012, 
        name: "Video TikTok", 
        duration: 0.5, 
        effects: { energy: -8, reputation: 15 },
        description: "Gira un video TikTok con la tua crew per diventare virale"
      }
    ],
    "Famiglia": [
      { 
        id: 3013, 
        name: "Discussione", 
        duration: 0.5, 
        effects: { energy: -10, respect: -3, reputation: 2 },
        description: "Discuti con i genitori che non capiscono il tuo stile maranza"
      },
      { 
        id: 3014, 
        name: "Negozia uscita", 
        duration: 0.5, 
        effects: { energy: -5, respect: -1 },
        description: "Cerca di convincere i genitori a farti uscire più tardi"
      },
      { 
        id: 3015, 
        name: "Inventa scusa", 
        duration: 0.5, 
        effects: { energy: -5, money: 20, respect: -2 },
        description: "Inventa una scusa per ottenere soldi dai genitori"
      }
    ],
    "Serata": [
      { 
        id: 3016, 
        name: "Fai amicizia con DJ", 
        duration: 0.5, 
        effects: { energy: -10, reputation: 12 },
        description: "Fai amicizia con il DJ per farti mettere la tua canzone preferita"
      },
      { 
        id: 3017, 
        name: "Flirta in discoteca", 
        duration: 0.5, 
        effects: { energy: -10, reputation: 8, respect: 5 },
        description: "Flirta in discoteca per mostrare il tuo carisma"
      },
      { 
        id: 3018, 
        name: "Serata VIP", 
        duration: 1, 
        effects: { energy: -20, reputation: 20, money: -150 },
        description: "Organizza una serata VIP con bottiglia e privé"
      }
    ],
    "Shop": [
      { 
        id: 3019, 
        name: "Vestiti firmati", 
        duration: 0.5, 
        effects: { energy: -5, style: 12, money: -80 },
        description: "Acquista vestiti di marca per migliorare il tuo look maranza"
      },
      { 
        id: 3020, 
        name: "Catena oro", 
        duration: 0.5, 
        effects: { style: 15, money: -120, respect: 10 },
        description: "Compra una catena d'oro per aumentare il tuo prestigio"
      },
      { 
        id: 3021, 
        name: "Accessori street", 
        duration: 0.5, 
        effects: { energy: -5, style: 8, money: -40 },
        description: "Acquista accessori street per completare il tuo outfit"
      }
    ],
    "Crush": [
      { 
        id: 3022, 
        name: "Appuntamento romantico", 
        duration: 1, 
        effects: { energy: -15, money: -50, reputation: 10 },
        description: "Porta il tuo crush in un posto speciale per fare colpo"
      },
      { 
        id: 3023, 
        name: "Giro in auto", 
        duration: 0.5, 
        effects: { energy: -10, reputation: 8, style: 5 },
        description: "Porta il tuo crush a fare un giro sulla tua auto modificata"
      },
      { 
        id: 3024, 
        name: "Dedica canzone", 
        duration: 0.5, 
        effects: { energy: -5, reputation: 7 },
        description: "Dedica una canzone trap al tuo crush per dimostrare i tuoi sentimenti"
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
      // Resetta la sotto-attività selezionata quando cambia l'attività principale
      setSelectedSubActivity(null);
      
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
    if (!selectedSubActivity) {
      toast({
        title: "Nessuna sotto-attività selezionata",
        description: "Devi selezionare un'attività da svolgere prima di procedere.",
        variant: "destructive",
        duration: 3000
      });
      return;
    }

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
        
        {/* Footer con pulsante di azione */}
        <DialogFooter className="flex items-center justify-center gap-2 sm:justify-center">
          <Button
            onClick={handleConfirm}
            className={`px-4 py-2 ${
              selectedSubActivity === null
                ? 'bg-gray-600 cursor-not-allowed opacity-60'
                : 'bg-primary hover:bg-primary/90'
            } text-white`}
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
