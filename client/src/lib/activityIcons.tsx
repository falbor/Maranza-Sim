import { 
  Users, 
  ShoppingBag, 
  Dumbbell, 
  Music, 
  Briefcase, 
  Home, 
  Share2, 
  Car, 
  Shirt,
  Trophy,
  Utensils,
  Phone,
  HeartPulse,
  Book,
  Smartphone,
  PartyPopper,
  Coffee,
  Gamepad,
  Plane,
  Bus,
  School,
  Monitor
} from "lucide-react";

// Mappa delle icone per le diverse attività
export const getActivityIcon = (imageKey: string, size: number = 24) => {
  const iconProps = { size, className: "text-primary-foreground" };
  
  switch (imageKey.toLowerCase()) {
    // Luoghi
    case "plaza":
    case "piazza":
      return <Users {...iconProps} />;
    case "mall":
    case "centro commerciale":
      return <ShoppingBag {...iconProps} />;
    case "gym":
    case "palestra":
      return <Dumbbell {...iconProps} />;
    case "club":
    case "discoteca":
      return <Music {...iconProps} />;
    case "work":
    case "lavoro":
      return <Briefcase {...iconProps} />;
    case "home":
    case "casa":
      return <Home {...iconProps} />;
      
    // Attività
    case "social":
    case "social media":
    case "socializzare":
      return <Share2 {...iconProps} />;
    case "cars":
    case "auto":
    case "macchine":
      return <Car {...iconProps} />;
    case "style":
    case "stile":
    case "vestiti":
      return <Shirt {...iconProps} />;
    case "sport":
    case "competizione":
      return <Trophy {...iconProps} />;
    case "food":
    case "cibo":
    case "ristorante":
      return <Utensils {...iconProps} />;
    case "phone":
    case "telefono":
    case "chiamata":
      return <Phone {...iconProps} />;
    case "health":
    case "salute":
      return <HeartPulse {...iconProps} />;
    case "study":
    case "studiare":
    case "studio":
      return <Book {...iconProps} />;
    case "smartphone":
    case "cellulare":
      return <Smartphone {...iconProps} />;
    case "party":
    case "festa":
      return <PartyPopper {...iconProps} />;
    case "bar":
    case "caffè":
    case "aperitivo":
      return <Coffee {...iconProps} />;
    case "games":
    case "videogames":
    case "giochi":
      return <Gamepad {...iconProps} />;
    case "travel":
    case "viaggio":
    case "aereo":
      return <Plane {...iconProps} />;
    case "transport":
    case "trasporto":
    case "bus":
      return <Bus {...iconProps} />;
    case "school":
    case "scuola":
      return <School {...iconProps} />;
    case "computer":
    case "pc":
    case "internet":
      return <Monitor {...iconProps} />;
      
    // Default
    default:
      // In caso di mancata corrispondenza, mostra l'icona Users
      console.log(`Icona non trovata per: ${imageKey}`);
      return <Users {...iconProps} />;
  }
};

// Funzione per ottenere il colore di sfondo per l'icona
export const getIconBackground = (color: string) => {
  switch (color) {
    case "primary":
      return "bg-primary";
    case "secondary":
      return "bg-secondary";
    case "accent":
      return "bg-purple-600";
    case "info":
      return "bg-blue-600";
    default:
      return "bg-primary";
  }
};