import { useGame } from "@/lib/gameContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ShopItem, ItemEffect } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Plus, Check, Minus, AlertTriangle, ShoppingBag, Info } from "lucide-react";

/**
 * Utility function per generare oggetti in vendita basati sugli oggetti dal database
 * Sostituisce la versione precedente che creava oggetti fittizi
 */
const generateShoppingItems = (gameInventory: Item[]): ShopItem[] => {
  // Converti gli oggetti dell'inventario di gioco in ShopItem per lo store
  return gameInventory.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    effects: item.effects,
    price: item.price,
    image: item.image || item.category,
    category: item.category,
    isOwned: false,
    isInShop: true,
    unlockDay: item.unlockDay
  }));
};

/**
 * Componente Shop che mostra gli oggetti disponibili per l'acquisto
 * Permette al giocatore di comprare oggetti con buff e debuff
 */
const ShopView = () => {
  const { game, refetchGame } = useGame();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Carica gli oggetti dal negozio dal server
  useEffect(() => {
    // Simuliamo il caricamento
    setIsLoading(true);
    
    // Effettua la richiesta API per ottenere gli oggetti del negozio
    const fetchItems = async () => {
      try {
        const response = await apiRequest("GET", "/api/game/shop");
        if (response.ok) {
          const items = await response.json();
          setShopItems(items);
        } else {
          // In caso di errore, usa un fallback di oggetti generati localmente
          console.warn("Errore nel caricamento degli oggetti dal server, uso oggetti locali");
          const localItems = generateShoppingItems(game.inventory || []);
          setShopItems(localItems);
        }
      } catch (error) {
        console.error("Errore nel fetch degli oggetti:", error);
        // Fallback con oggetti locali
        const localItems = generateShoppingItems(game.inventory || []);
        setShopItems(localItems);
      } finally {
        // Termina il caricamento
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      }
    };
    
    fetchItems();
  }, [game.inventory]);
  
  // Mutazione per acquistare un oggetto
  const { mutate: purchaseItem, isPending } = useMutation({
    mutationFn: async (itemId: number) => {
      return await apiRequest("POST", "/api/game/shop/purchase", { itemId });
    },
    onSuccess: async (response) => {
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Acquisto completato!",
          description: result.message,
          duration: 3000
        });
        refetchGame();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Impossibile completare l'acquisto");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Impossibile completare l'acquisto",
        variant: "destructive",
        duration: 3000
      });
    }
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="bg-black/50 p-4 rounded-lg animate-pulse">
          Caricamento oggetti...
        </div>
      </div>
    );
  }

  if (!shopItems || shopItems.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="bg-black/50 p-4 rounded-lg text-white/70">
          Nessun oggetto disponibile al momento.
        </div>
      </div>
    );
  }
  
  // Ottieni tutte le categorie uniche
  const categories = Array.from(new Set(shopItems.map(item => item.category)));
  
  // Filtra gli oggetti in base alla categoria selezionata
  const filteredItems = selectedCategory 
    ? shopItems.filter(item => item.category === selectedCategory)
    : shopItems;
  
  // Traduzione delle categorie in italiano
  const categoryTranslations: Record<string, string> = {
    'clothing': 'Abbigliamento',
    'accessory': 'Accessori',
    'consumable': 'Consumabili',
    'special': 'Speciali'
  };
  
  // Genera badge colore per la categoria
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'clothing': return "bg-primary text-primary-foreground hover:bg-primary/80";
      case 'accessory': return "bg-secondary text-secondary-foreground hover:bg-secondary/80";
      case 'consumable': return "bg-blue-500 text-white hover:bg-blue-600";
      case 'special': return "bg-amber-500 text-white hover:bg-amber-600";
      default: return "bg-primary text-primary-foreground hover:bg-primary/80";
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-xl text-primary">Negozio</h3>
        <div className="text-sm text-white/80">
          <span className="font-bold text-primary">€{game.character?.money}</span> disponibili
        </div>
      </div>
      
      <div className="bg-black/30 p-3 rounded-lg border border-white/10 mb-4">
        <div className="flex items-center gap-2 text-primary">
          <ShoppingBag className="h-5 w-5" />
          <h4 className="font-semibold">Negozio Maranza</h4>
        </div>
        <p className="text-sm text-white/70 mt-1">
          Qui trovi i migliori articoli per migliorare il tuo stile e il tuo status da maranza!
        </p>
      </div>
      
      {/* Filtri categorie */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge 
          variant="outline" 
          className={`cursor-pointer ${!selectedCategory ? 'bg-primary/20 border-primary' : 'hover:bg-black/30'}`}
          onClick={() => setSelectedCategory(null)}
        >
          Tutti
        </Badge>
        {categories.map(category => (
          <Badge 
            key={category}
            variant="outline"
            className={`cursor-pointer ${selectedCategory === category ? 'bg-primary/20 border-primary' : 'hover:bg-black/30'}`}
            onClick={() => setSelectedCategory(category)}
          >
            {categoryTranslations[category] || category}
          </Badge>
        ))}
      </div>
      
      {/* Griglia oggetti */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredItems.map(item => (
          <div 
            key={item.id}
            className={`border ${item.isOwned ? 'border-green-500/30 bg-green-900/10' : 'border-white/10 bg-black/30'} rounded-lg p-3 hover:border-white/20 transition-colors`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-white">{item.name}</h4>
                <p className="text-xs text-white/70 mb-2">{item.description}</p>
              </div>
              <Badge className={getCategoryColor(item.category)}>
                {categoryTranslations[item.category] || item.category}
              </Badge>
            </div>
            
            {/* Effetti */}
            <div className="space-y-1 mb-3">
              {item.effects && item.effects.map((effect, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center text-xs ${effect.isDebuff ? 'text-red-400' : 'text-green-400'}`}
                >
                  {effect.isDebuff ? (
                    <Minus className="h-3 w-3 mr-1" />
                  ) : (
                    <Plus className="h-3 w-3 mr-1" />
                  )}
                  <span>
                    {effect.type.charAt(0).toUpperCase() + effect.type.slice(1)} {effect.value > 0 ? `+${effect.value}` : effect.value}
                  </span>
                </div>
              ))}
              
              {/* Avviso se ci sono debuff */}
              {item.effects && item.effects.some(effect => effect.isDebuff) && (
                <div className="flex items-center text-xs text-amber-400 mt-1">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  <span>Questo oggetto ha effetti negativi!</span>
                </div>
              )}
              
              {/* Avviso se è un oggetto sbloccato in un giorno specifico */}
              {item.unlockDay && (
                <div className="flex items-center text-xs text-blue-400 mt-1">
                  <Info className="h-3 w-3 mr-1" />
                  <span>Sbloccato al giorno {item.unlockDay}</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-bold text-primary">€{item.price}</span>
              
              {item.isOwned ? (
                <Button variant="ghost" className="text-green-400" disabled>
                  <Check className="h-4 w-4 mr-1" />
                  Posseduto
                </Button>
              ) : (
                <Button 
                  variant="secondary" 
                  size="sm"
                  disabled={isPending || (game.character?.money || 0) < item.price}
                  onClick={() => purchaseItem(item.id)}
                >
                  {isPending ? "Acquisto..." : "Acquista"}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopView;