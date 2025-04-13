import { useEffect, useState } from "react";
import { Shirt, Music, Car, ShoppingBag, Sparkles } from "lucide-react";

/**
 * Schermata di caricamento a tema Maranza con animazioni divertenti
 */
const LoadingScreen = ({ show = false, message = "Caricamento in corso..." }: { show?: boolean, message?: string }) => {
  const [loadingTip, setLoadingTip] = useState("");
  
  // Lista di suggerimenti divertenti in stile maranza
  const tips = [
    "Lucidando le scarpe firmate...",
    "Stirando la tuta...",
    "Caricando la playlist trap...",
    "Contando i soldi...",
    "Sistemando il ciuffo...",
    "Abbassando la macchina...",
    "Aumentando il volume...",
    "Preparando le mosse di ballo...",
    "Controllando lo stile...",
    "Cercando rispetto...",
  ];
  
  // Cambia i suggerimenti ogni 2 secondi
  useEffect(() => {
    if (!show) return;
    
    const getRandomTip = () => tips[Math.floor(Math.random() * tips.length)];
    setLoadingTip(getRandomTip());
    
    const interval = setInterval(() => {
      setLoadingTip(getRandomTip());
    }, 2000);
    
    return () => clearInterval(interval);
  }, [show]);
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
      {/* Icone animate */}
      <div className="relative w-40 h-40 mb-8">
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles size={64} className="text-primary animate-pulse" />
        </div>
        
        {/* Icone rotanti */}
        <div className="absolute inset-0">
          <div className="animate-orbit-1">
            <div className="absolute -left-5 -top-5 bg-primary text-primary-foreground p-2 rounded-full shadow-lg">
              <Shirt size={24} />
            </div>
          </div>
          <div className="animate-orbit-2">
            <div className="absolute -left-5 -top-5 bg-purple-600 text-white p-2 rounded-full shadow-lg">
              <Music size={24} />
            </div>
          </div>
          <div className="animate-orbit-3">
            <div className="absolute -left-5 -top-5 bg-blue-600 text-white p-2 rounded-full shadow-lg">
              <Car size={24} />
            </div>
          </div>
          <div className="animate-orbit-4">
            <div className="absolute -left-5 -top-5 bg-rose-500 text-white p-2 rounded-full shadow-lg">
              <ShoppingBag size={24} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Testo di caricamento con gradiente */}
      <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
        {message}
      </h2>
      
      {/* Suggerimento casuale */}
      <p className="text-foreground/70 text-center max-w-xs">{loadingTip}</p>
      
      {/* Barra di progresso animata */}
      <div className="w-64 h-3 bg-primary/20 rounded-full mt-6 overflow-hidden border border-primary/30">
        <div 
          className="h-full bg-gradient-to-r from-primary via-purple-500 to-primary animate-progress rounded-full"
          style={{ backgroundSize: "200% 100%" }}
        ></div>
      </div>
      
      {/* Testo maranza animato */}
      <div className="mt-8 font-bold text-xs tracking-widest uppercase">
        <span className="inline-block animate-shimmer bg-gradient-to-r from-primary/70 via-purple-400 to-primary/70 bg-[length:200%_100%] text-transparent bg-clip-text">
          Maranza Simulator
        </span>
      </div>
    </div>
  );
};

export default LoadingScreen;