import { 
  Users, 
  ShoppingBag, 
  Dumbbell, 
  Music, 
  Briefcase, 
  Home, 
  Share2, 
  Car, 
  Shirt
} from "lucide-react";

// Mappa delle icone per le diverse attività
export const getActivityIcon = (imageKey: string, size: number = 24) => {
  const iconProps = { size, className: "text-primary-foreground" };
  
  switch (imageKey) {
    case "plaza":
      return <Users {...iconProps} />;
    case "mall":
      return <ShoppingBag {...iconProps} />;
    case "gym":
      return <Dumbbell {...iconProps} />;
    case "club":
      return <Music {...iconProps} />;
    case "work":
      return <Briefcase {...iconProps} />;
    case "home":
      return <Home {...iconProps} />;
    case "social":
      return <Share2 {...iconProps} />;
    case "cars":
      return <Car {...iconProps} />;
    case "style":
      return <Shirt {...iconProps} />;
    default:
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