export enum Era {
  Classic = "Classic Era (1950s-1980s)",
  Legend = "Legend Era (1990s-2000s)",
  Modern = "Modern Golden Era (2010s)",
  Present = "Present Era (2020s)",
}

export enum Position {
  GK = "GK",
  LB = "LB",
  CB = "CB",
  RB = "RB",
  LM = "LM",
  CM = "CM",
  RM = "RM",
  LW = "LW",
  ST = "ST",
  RW = "RW",
}

export interface PlayerStats {
  pac: number; // Pace/Velocity
  sho: number; // Shooting
  pas: number; // Passing
  dri: number; // Dribbling
  def: number; // Defending
  phy: number; // Physical
}

export interface Player {
  id: string;
  name: string;
  shortName: string;
  era: Era;
  primaryPosition: Position;
  alternativePositions: Position[];
  originalRating: number;
  rating: number; // Dynamically adjusted rating based on balance criteria & chemistry
  stats: PlayerStats;
  club: string; // Famous Champions League club they represented
  nation: string;
  imageTheme: string; // Color scheme (hex or tailwind class)
  description: string; // Brief historical achievement
  actionImageUrl?: string;
  isWcHero?: boolean; // Highlighted World Cup Hero performer
}

// Graph-based relationships
export interface GraphNode {
  id: string;
  type: "player" | "club" | "nation" | "era" | "position";
  label: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: "played_for" | "citizen_of" | "belongs_to" | "chemistry_link";
  weight: number; // Strength of chemistry
}

export interface TeamChemistry {
  score: number; // 0 to 100
  linksCount: number;
  clubLinks: number;
  nationLinks: number;
  eraLinks: number;
  regionLinks?: number;
}

// Lineup structure
export type LineupSetup = {
  [key: string]: Player | null; // e.g. "GK", "LB", "CB1", "CB2", etc.
};

export interface Formation {
  name: string; // e.g. "4-3-3", "4-4-2", "3-5-2"
  positions: {
    key: string; // Unique key in lineup e.g. "GK", "LB", "CB1", "CB2", "RB", "CM1", "CM2", "CM3", "LW", "ST", "RW"
    label: Position; // Required tactical position
    x: number; // Pitch layout % starting from left
    y: number; // Pitch layout % starting from bottom (0 is defense, 100 is attack)
    links: string[]; // Neighboring position keys for chemistry calculation
  }[];
}

// Tournament Simulation Structure
export interface CompetitorClub {
  id: string;
  name: string;
  logo: string;
  rating: number;
  era: string; // To showcase classic vs modern clubs
  starPlayers: string[];
  description: string;
}

export interface Match {
  id: string;
  homeTeam: string; // Name of club
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  isSimulated: boolean;
  scoreEvents: MatchEvent[];
  stats: {
    homeShots: number;
    awayShots: number;
    homePossession: number;
    awayPossession: number;
  };
  stage: string; // "Group Stage Match 1", "Quarter-Finals Leg 1", etc.
}

export interface MatchEvent {
  minute: number;
  type: "GOAL" | "ASSIST" | "YELLOW_CARD" | "RED_CARD" | "INJURY" | "SAVE" | "WOODWORK";
  playerName: string;
  assistedBy?: string;
  team: "home" | "away";
  description: string;
}

export interface SeasonResult {
  year: number;
  draftedSquadName: string;
  chemistryScore: number;
  squadAverageRating: number;
  stageReached: string; // "GS", "QF", "SF", "F_RunnerUp", "Champion"
  record: { wins: number; draws: number; losses: number };
  playerStats: {
    [playerId: string]: {
      goals: number;
      assists: number;
      cleanSheets: number;
      gamesPlayed: number;
      averageRating: number;
    };
  };
  difficulty?: Difficulty;
  tournamentMode?: "ucl" | "worldcup";
  earnedCoins?: number;
}

export interface UserMatchHistoryEntry {
  matchdayLabel: string; // e.g. "Matchday 1", etc.
  goalsScored: number;
  goalsConceded: number;
  possession: number;
  playerRatings: { [playerShortName: string]: string | number };
}

export enum Difficulty {
  Amateur = "Amateur",
  SemiPro = "Semi-Pro",
  Professional = "Professional",
  Legendary = "Legendary",
}

export interface CustomBadge {
  shieldShape: "classic" | "round" | "diamond" | "spiky";
  bgColor: string; // Hex color or gradient string e.g., 'from-blue-600 via-indigo-650 to-purple-800'
  customBgColor?: string; // Opt solid background color override from picker
  accentColor: string; // Hex accent color e.g., '#ef4444'
  symbol: string; // Focal emoji or mascot icon e.g., '🦁'
  stars: number; // 0 to 5 championship stars
  wikiIcon?: string; // Resolved image URL of team badge if loaded from Wikipedia API
}

export interface UserCareerState {
  seasonsCount: number;
  trophies: string[]; // Season years they won
  historicalSeasons: SeasonResult[];
  squadName: string;
  currentEraBalance: "balanced" | "retro_boost" | "modern_boost" | "raw";
  currentActiveEras: Era[];
  difficulty?: Difficulty;
  customBadge?: CustomBadge | null;
  tournamentMode?: "ucl" | "worldcup";
  coins?: number;
  unlockedPlayerIds?: string[];
  tournamentYear?: number;
}

export interface GlobalStats {
  totalPlayers: number;
  totalSeasonsCompleted: number;
}

