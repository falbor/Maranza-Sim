export interface Character {
  id: number;
  userId: number;
  name: string;
  style: number;
  personality: "audace" | "ribelle" | "carismatico";
  look: "casual" | "sportivo" | "firmato";
  money: number;
  reputation: number;
  energy: number;
  respect: number;
  avatarId: number;
}

export interface ItemEffect {
  type: "style" | "money" | "reputation" | "energy" | "respect";
  value: number;
  isDebuff?: boolean;
}

export interface Item {
  id: number;
  name: string;
  description: string;
  effects: ItemEffect[];
  price: number;
  image: string;
  unlockDay?: number;
  category: "clothing" | "accessory" | "consumable" | "special";
  isInShop?: boolean;
  isBuyable?: boolean;
}

export interface Skill {
  id: number;
  name: string;
  description: string;
  level: number;
  progress: number;
  maxLevel: number;
}

export interface Contact {
  id: number;
  name: string;
  type: string;
  respect: "basso" | "medio" | "alto";
  meetDay: number;
  avatarInitials: string;
  avatarColor: string;
}

export interface ActivityResult {
  text: string;
  moneyChange: number;
  reputationChange: number;
  styleChange: number;
  energyChange: number;
  respectChange: number;
  newContact?: Contact;
  newItem?: Item;
  skillProgress?: {
    skillId: number;
    value: number;
  };
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  image: string;
  duration: number;
  effects: {
    reputation?: number;
    money?: number;
    energy?: number;
    respect?: number;
    style?: number;
  };
  requirements?: {
    money?: number;
    energy?: number;
    reputation?: number;
    respect?: number;
    style?: number;
    items?: number[];
    skills?: { id: number; level: number }[];
  };
  possibleOutcomes: string[];
  unlockDay?: number;
  category: string;
  color: string;
}

export interface ShopItem extends Item {
  isOwned: boolean;
}

export interface GameState {
  day: number;
  time: string;
  gameStarted: boolean;
  availableActivities: Activity[];
  inventory: Item[];
  shopItems?: ShopItem[];
  skills: Skill[];
  contacts: Contact[];
  character: Character | null;
  hoursLeft: number;
}
