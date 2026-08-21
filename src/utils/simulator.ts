import { Player, LineupSetup, Formation, CompetitorClub, Match, MatchEvent, SeasonResult, Position, UserMatchHistoryEntry, Difficulty } from "../types";
import { PLAYERS } from "../data/players";
import { chemistryGraphInstance } from "./chemistryGraph";
import { WORLD_CUP_YEARS_DATA } from "../data/worldCupYears";

// 15 legendary competitor clubs to populate the Champions League with the drafted team
export const COMPETITOR_CLUBS: CompetitorClub[] = [
  {
    id: "comp_barca_2011",
    name: "FC Barcelona (2011)",
    logo: "🔴🔵",
    rating: 95,
    era: "Modern (2011)",
    starPlayers: ["Lionel Messi", "Xavi", "Andrés Iniesta", "Carles Puyol"],
    description: "Pep Guardiola's peak tiki-taka orchestra. Universally regarded as one of the finest squads in history."
  },
  {
    id: "comp_madrid_3peat",
    name: "Real Madrid (2017)",
    logo: "⚪👑",
    rating: 95,
    era: "Modern (2017)",
    starPlayers: ["Cristiano Ronaldo", "Karim Benzema", "Luka Modrić", "Sergio Ramos"],
    description: "Zinedine Zidane's ruthless modern kings who swept 3 Champions League trophies in a row."
  },
  {
    id: "comp_milan_1989",
    name: "AC Milan (1989)",
    logo: "🔴⚫",
    rating: 94,
    era: "Classic (1989)",
    starPlayers: ["Marco van Basten", "Ruud Gullit", "Frank Rijkaard", "Franco Baresi"],
    description: "Arrigo Sacchi's revolutionary side. Back-to-back European Cup winners with ironclad defense."
  },
  {
    id: "comp_bayern_2020",
    name: "Bayern Munich (2020)",
    logo: "🔴⚪",
    rating: 93,
    era: "Present (2020)",
    starPlayers: ["Robert Lewandowski", "Thomas Müller", "Manuel Neuer", "Alphonso Davies"],
    description: "An unstoppable, hyper-pressing machine that went perfect - winning all 11 matches to lift the cup."
  },
  {
    id: "comp_ajax_1972",
    name: "Ajax (1972)",
    logo: "⚪🔴⚪",
    rating: 92,
    era: "Classic (1972)",
    starPlayers: ["Johan Cruyff", "Johan Neeskens", "Ruud Krol", "Arie Haan"],
    description: "The peak execution of 'Total Football' under Stefan Kovacs, capturing the treble."
  },
  {
    id: "comp_utd_1999",
    name: "Manchester United (1999)",
    logo: "🔴👹",
    rating: 91,
    era: "Legend (1999)",
    starPlayers: ["David Beckham", "Ryan Giggs", "Roy Keane", "Paul Scholes"],
    description: "Sir Alex Ferguson's legendary treble winners, famous for their resilient late-minute miracles."
  },
  {
    id: "comp_liverpool_2019",
    name: "Liverpool FC (2019)",
    logo: "🔴🦅",
    rating: 92,
    era: "Present (2019)",
    starPlayers: ["Mohamed Salah", "Sadio Mané", "Virgil van Dijk", "Alisson Becker"],
    description: "Jurgen Klopp's 'mentality monsters' who combined extreme heavy-metal pressing with rigid compactness."
  },
  {
    id: "comp_galacticos_2003",
    name: "Real Madrid Galácticos (2003)",
    logo: "⚪🌟",
    rating: 93,
    era: "Legend (2003)",
    starPlayers: ["Zinedine Zidane", "Ronaldo Nazário", "Luís Figo", "Roberto Carlos"],
    description: "An all-star armada of world-class blockbusters who dazzled Europe with sheer flair."
  },
  {
    id: "comp_arsenal_2004",
    name: "Arsenal Invincibles (2004)",
    logo: "🔴⚪⚡",
    rating: 91,
    era: "Legend (2004)",
    starPlayers: ["Thierry Henry", "Dennis Bergkamp", "Patrick Vieira", "Robert Pirès"],
    description: "Unbeaten domestically, this legendary fluid side represents the artistic peak of French elegance."
  },
  {
    id: "comp_inter_2010",
    name: "Inter Milan (2010)",
    logo: "🔵⚫",
    rating: 91,
    era: "Modern (2010)",
    starPlayers: ["Diego Milito", "Wesley Sneijder", "Samuel Eto'o", "Javier Zanetti"],
    description: "Jose Mourinho's defensive masters who defied all odds to shut down peak Barca and seal the treble."
  },
  {
    id: "comp_juventus_1996",
    name: "Juventus (1996)",
    logo: "⚪⚫🦓",
    rating: 90,
    era: "Legend (1996)",
    starPlayers: ["Alessandro Del Piero", "Gianluca Vialli", "Fabrizio Ravanelli", "Didier Deschamps"],
    description: "Marcello Lippi's gritty, hyper-tactical side that conquered the Champions League in Rome."
  },
  {
    id: "comp_benfica_1962",
    name: "Benfica (1962)",
    logo: "🔴🦅🇵🇹",
    rating: 89,
    era: "Classic (1962)",
    starPlayers: ["Eusébio", "Mário Coluna", "José Águas"],
    description: "Béla Guttmann's trailblazers who famously defeated Real Madrid 5-3 to retain the title."
  },
  {
    id: "comp_chelsea_2012",
    name: "Chelsea FC (2012)",
    logo: "🔵🦁",
    rating: 88,
    era: "Modern (2012)",
    starPlayers: ["Didier Drogba", "Frank Lampard", "John Terry", "Petr Čech"],
    description: "The ultimate underdog champions. Defied fate, penalty shootouts, and Bayern in Munich."
  },
  {
    id: "comp_porto_2004",
    name: "FC Porto (2004)",
    logo: "🔵⚪🐉",
    rating: 87,
    era: "Legend (2004)",
    starPlayers: ["Deco", "Ricardo Carvalho", "Maniche", "Vítor Baía"],
    description: "Mourinho's tactical masters who outclassed Europe's cash-giants with rigid discipline."
  },
  {
    id: "comp_psg_2021",
    name: "Paris Saint-Germain (2021)",
    logo: "🔵🔴🗼",
    rating: 90,
    era: "Present (2021)",
    starPlayers: ["Kylian Mbappé", "Neymar Jr", "Angel Di María", "Marquinhos"],
    description: "An expensive, high-explosive lineup that breezed through tough brackets on raw counter-speed."
  }
];

// 15 legendary competitor nation teams to populate the World Cup with the drafted team
export const COMPETITOR_NATIONS: CompetitorClub[] = [
  {
    id: "comp_brazil_1970",
    name: "Brazil (1970)",
    logo: "🇧🇷👑",
    rating: 96,
    era: "Classic (1970)",
    starPlayers: ["Pelé", "Carlos Alberto", "Tostão", "Rivelino"],
    description: "Pelé's peak masterpiece. Widely considered the most beautiful attacking team of all time."
  },
  {
    id: "comp_argentina_1986",
    name: "Argentina (1986)",
    logo: "🇦🇷⚽",
    rating: 95,
    era: "Classic (1986)",
    starPlayers: ["Diego Maradona", "Jorge Valdano", "Oscar Ruggeri", "Jorge Burruchaga"],
    description: "Diego Maradona's absolute peak tournament, carrying a nation to glory in Mexico."
  },
  {
    id: "comp_france_1998",
    name: "France (1998)",
    logo: "🇫🇷🐓",
    rating: 94,
    era: "Legend (1998)",
    starPlayers: ["Zinedine Zidane", "Didier Deschamps", "Thierry Henry", "Marcel Desailly"],
    description: "Les Bleus' host-nation golden generation that demolished Brazil 3-0 in the Paris final."
  },
  {
    id: "comp_spain_2010",
    name: "Spain (2010)",
    logo: "🇪🇸🏆",
    rating: 94,
    era: "Modern (2010)",
    starPlayers: ["Andrés Iniesta", "Xavi", "Iker Casillas", "Carles Puyol"],
    description: "The absolute zenith of tiki-taka football, conquering South Africa with possession mastery."
  },
  {
    id: "comp_italy_2006",
    name: "Italy (2006)",
    logo: "🇮🇹🛡️",
    rating: 93,
    era: "Legend (2006)",
    starPlayers: ["Fabio Cannavaro", "Andrea Pirlo", "Gianluigi Buffon", "Francesco Totti"],
    description: "An ironclad squad that conceded only 2 goals all tournament, marshaled by Cannavaro's Ballon d'Or campaign."
  },
  {
    id: "comp_germany_2014",
    name: "Germany (2014)",
    logo: "🇩🇪🦅",
    rating: 94,
    era: "Modern (2014)",
    starPlayers: ["Thomas Müller", "Philipp Lahm", "Manuel Neuer", "Toni Kroos"],
    description: "A machine-like force that famously beat Brazil 7-1 before unlocking Argentina in extra time."
  },
  {
    id: "comp_netherlands_1974",
    name: "Netherlands (1974)",
    logo: "🇳🇱🦁",
    rating: 93,
    era: "Classic (1974)",
    starPlayers: ["Johan Cruyff", "Johan Neeskens", "Ruud Krol", "Johnny Rep"],
    description: "The birth of 'Total Football' on the world stage under Rinus Michels. Simply breathtaking."
  },
  {
    id: "comp_brazil_2002",
    name: "Brazil 3R's (2002)",
    logo: "🇧🇷🤙",
    rating: 95,
    era: "Legend (2002)",
    starPlayers: ["Ronaldo Nazário", "Ronaldinho Gaucho", "Rivaldo", "Roberto Carlos"],
    description: "The lethal combination of Ronaldo, Rivaldo, and Ronaldinho that swept to a perfect seven wins."
  },
  {
    id: "comp_france_2018",
    name: "France (2018)",
    logo: "🇫🇷⚡",
    rating: 93,
    era: "Present (2018)",
    starPlayers: ["Kylian Mbappé", "Antoine Griezmann", "Paul Pogba", "N'Golo Kanté"],
    description: "Didier Deschamps' ruthless counter-attacking champions, powered by an eighteen-year-old Mbappé."
  },
  {
    id: "comp_england_1966",
    name: "England (1966)",
    logo: "🏴󠁧󠁢󠁥󠁮󠁧󠁿🦁",
    rating: 91,
    era: "Classic (1966)",
    starPlayers: ["Bobby Moore", "Bobby Charlton", "Geoff Hurst", "Gordon Banks"],
    description: "The historic champions of Wembley, sealing fame with Hurst's hat-trick exploits."
  },
  {
    id: "comp_uruguay_1950",
    name: "Uruguay (1950)",
    logo: "🇺🇾☀️",
    rating: 91,
    era: "Classic (1950)",
    starPlayers: ["Obdulio Varela", "Alcides Ghiggia", "Juan Schiaffino"],
    description: "The creators of the Maracanazo, shocking 200,000 spectators to seal the Jules Rimet trophy."
  },
  {
    id: "comp_argentina_2022",
    name: "Argentina (2022)",
    logo: "🇦🇷🐐",
    rating: 94,
    era: "Present (2022)",
    starPlayers: ["Lionel Messi", "Ángel Di María", "Emiliano Martínez", "Enzo Fernández"],
    description: "The majestic crowning of Lionel Messi, concluding a cinematic Qatar campaign in the greatest final ever."
  },
  {
    id: "comp_portugal_2006",
    name: "Portugal (2006)",
    logo: "🇵🇹🍷",
    rating: 90,
    era: "Legend (2006)",
    starPlayers: ["Luís Figo", "Cristiano Ronaldo", "Deco", "Ricardo Carvalho"],
    description: "Scolari's elegant crew blending the golden generation's final dance with young Ronaldo's debut."
  },
  {
    id: "comp_croatia_2018",
    name: "Croatia (2018)",
    logo: "🇭🇷🧱",
    rating: 89,
    era: "Present (2018)",
    starPlayers: ["Luka Modrić", "Ivan Rakitić", "Mario Mandžukić", "Ivan Perišić"],
    description: "The ultimate tournament fighters, going to extra time thrice to make an inspiring final appearance."
  },
  {
    id: "comp_belgium_2018",
    name: "Belgium Golden (2018)",
    logo: "🇧🇪😈",
    rating: 91,
    era: "Present (2018)",
    starPlayers: ["Eden Hazard", "Kevin De Bruyne", "Romelu Lukaku", "Thibaut Courtois"],
    description: "The peak golden generation who produced spectacular counter-attacks to secure third-place bronze."
  }
];

// Commentary phrases
const SCENARIOS = [
  "glares at the goal and executes a jaw-dropping direct effort",
  "breaks down the inner channel and fires a thumping drive",
  "pounces on a loose mistake in the box and taps it into the roof",
  "leaps toweringly over the defense to bullet a magnificent header",
  "glides past two defenders with incredible dribbling before sliding it home",
  "intercepts an errant pass, rounds the keeper, and tucks it away with poise",
  "curls a breathtaking free-kick over the wall and into the top-right bin",
  "strikes a fierce half-volley from 25 yards that rattles the net",
];

const SAVES = [
  "pulls off an absolute world-class fingertip save to deny a certain goal",
  "dives heroically across the turf to tip it past the post",
  "makes himself massive in a 1v1 duel to block the fierce strike",
  "claims the looping cross with commanding authority over packing headers",
];

const INJURIES_YELLOW_CARDS = [
  "picks up a yellow card after a late sliding challenge in the center circle.",
  "is caution with a yellow card for persistent tactical hacking.",
  "clutches his hamstring after a sudden wing-burst and receives medical aid.",
  "goes down holding his ankle. He is limping but attempts to soldier on.",
];

// Match Arena Stadiums & Weather Conditions for realism
const FAMOUS_STADIUMS = [
  "Santiago Bernabéu", "Camp Nou", "Anfield", "Wembley Stadium",
  "San Siro", "Allianz Arena", "Old Trafford", "Maracanã", "Lusail Stadium"
];

const REFEREES = [
  { name: "Pierluigi Collina", style: "Legendary / High Strictness", strictness: 1.4 },
  { name: "Howard Webb", style: "Strict / Authoritative", strictness: 1.2 },
  { name: "Felix Brych", style: "Moderate / Tactical Balance", strictness: 1.0 },
  { name: "Mike Dean", style: "Volatile / Card Happy", strictness: 1.3 }
];

const WEATHER_CONDITIONS = [
  { name: "Clear & Perfect Pitch", cardMod: 1.0, description: "A gorgeous clear evening. Perfect conditions for high-tempo passing!", shotMod: 1.0, paceMod: 1.0 },
  { name: "Rainy & Slick Turf", cardMod: 1.1, description: "Heavy rain makes the pitch fast and slick. Goalkeepers will struggle with long range efforts!", shotMod: 1.1, paceMod: 0.95 },
  { name: "Snowy & Freezing", cardMod: 1.4, description: "Flurries of snow. Slick ball with slide tackles flying. Card risk is heavily amplified!", shotMod: 0.9, paceMod: 0.85 },
  { name: "Sultry Heat", cardMod: 1.0, description: "Extremely humid and hot. Players will fatigue much faster towards the final whistle.", shotMod: 1.0, paceMod: 0.9 }
];

// Helper: Extract required tactical position from standard slot keys (e.g. CB1 -> CB, ST2 -> ST)
export function getRequiredPositionForSlot(key: string): Position {
  const cleanKey = key.replace(/[0-9]/g, ""); // strip numbers
  if (Object.values(Position).includes(cleanKey as Position)) {
    return cleanKey as Position;
  }
  return Position.CM; // Default fallback
}

// Simulates a single match segment-by-segment mathematically and generates realistic logs
export function simulateMatch(
  homeName: string,
  awayName: string,
  homeRating: number,
  awayRating: number,
  homePlayers: Player[] = [], // Pass drafted players if user's team is home
  awayPlayers: Player[] = [], // Pass drafted players if user's team is away
  homeOpponentStarPlayers: string[] = [],
  awayOpponentStarPlayers: string[] = [],
  stage: string = "Group Stage",
  homeLineup?: LineupSetup,
  awayLineup?: LineupSetup,
  homeChemistry?: number,
  awayChemistry?: number
): Match {
  // Select game arena variables
  const stadium = FAMOUS_STADIUMS[Math.floor(Math.random() * FAMOUS_STADIUMS.length)];
  const weather = WEATHER_CONDITIONS[Math.floor(Math.random() * WEATHER_CONDITIONS.length)];
  const referee = REFEREES[Math.floor(Math.random() * REFEREES.length)];

  // 1. Calculate realistic squad segment ratings
  const buildSquadLineStats = (players: Player[], isUser: boolean, lineupMap?: LineupSetup) => {
    let outOfPositionCount = 0;
    let totalPositionPenalty = 0;

    // Check positioning if user team with active lineup
    const computedPlayers = playerListAdjustPositionPenalty(players, lineupMap);

    // Find GK
    const gk = computedPlayers.find((p) => p.primaryPosition === Position.GK);
    const gkVal = gk ? gk.rating : isUser ? 70 : 80;

    // Defenders
    const defs = computedPlayers.filter((p) => [Position.CB, Position.LB, Position.RB].includes(p.primaryPosition));
    const defVal = defs.length > 0 
      ? defs.reduce((acc, p) => acc + (p.stats.def * 0.7 + p.stats.phy * 0.3) * (p.rating / p.originalRating), 0) / defs.length 
      : isUser ? 70 : 82;

    // Midfielders
    const mids = computedPlayers.filter((p) => [Position.CM, Position.LM, Position.RM].includes(p.primaryPosition));
    const midVal = mids.length > 0 
      ? mids.reduce((acc, p) => acc + (p.stats.pas * 0.6 + p.stats.dri * 0.4) * (p.rating / p.originalRating), 0) / mids.length 
      : isUser ? 70 : 81;

    // Attackers
    const atts = computedPlayers.filter((p) => [Position.ST, Position.LW, Position.RW].includes(p.primaryPosition));
    const attVal = atts.length > 0 
      ? atts.reduce((acc, p) => acc + (p.stats.sho * 0.7 + p.stats.pac * 0.3) * (p.rating / p.originalRating), 0) / atts.length 
      : isUser ? 70 : 83;

    return {
      gk: Math.max(50, gkVal),
      def: Math.max(50, defVal),
      mid: Math.max(50, midVal),
      att: Math.max(50, attVal)
    };
  };

  // Helper routine to flag and penalize rating if played out of position
  function playerListAdjustPositionPenalty(players: Player[], lineupMap?: LineupSetup): Player[] {
    if (!lineupMap) return players;
    
    return players.map((p) => {
      // Find the slot this player is occupying
      let activePositionKey = "";
      Object.entries(lineupMap).forEach(([slotKey, slotPlayer]) => {
        if (slotPlayer && slotPlayer.id === p.id) {
          activePositionKey = slotKey;
        }
      });

      if (!activePositionKey) return p;

      const requiredPos = getRequiredPositionForSlot(activePositionKey);
      const isPrimary = p.primaryPosition === requiredPos;
      const isAlternative = p.alternativePositions.includes(requiredPos);

      if (!isPrimary && !isAlternative) {
        // Severe position rating penalty! (30% drop)
        return {
          ...p,
          rating: Math.round(p.rating * 0.7),
          stats: {
            pac: Math.round(p.stats.pac * 0.7),
            sho: Math.round(p.stats.sho * 0.7),
            pas: Math.round(p.stats.pas * 0.7),
            dri: Math.round(p.stats.dri * 0.7),
            def: Math.round(p.stats.def * 0.7),
            phy: Math.round(p.stats.phy * 0.7)
          },
          description: p.description + " [WARNING: Playing Out of Position!]"
        };
      }
      return p;
    });
  }

  // Build the live squad values or synthetic equivalents
  const playHomeRating = homePlayers.length > 0 
    ? buildSquadLineStats(homePlayers, true, homeLineup) 
    : { gk: homeRating, def: homeRating, mid: homeRating, att: homeRating };

  const playAwayRating = awayPlayers.length > 0 
    ? buildSquadLineStats(awayPlayers, true, awayLineup) 
    : { gk: awayRating, def: awayRating, mid: awayRating, att: awayRating };

  // Set weather & stadium environment coefficients
  const baseHomeAdvantage = stadium === "Anfield" || stadium === "Camp Nou" || stadium === "Santiago Bernabéu" ? 4.5 : 2.5;

  let activeHomeGk = playHomeRating.gk;
  let activeHomeDef = playHomeRating.def + baseHomeAdvantage;
  let activeHomeMid = playHomeRating.mid + baseHomeAdvantage;
  let activeHomeAtt = playHomeRating.att + baseHomeAdvantage;

  let activeAwayGk = playAwayRating.gk;
  let activeAwayDef = playAwayRating.def;
  let activeAwayMid = playAwayRating.mid;
  let activeAwayAtt = playAwayRating.att;

  // Apply Weather conditions
  activeHomeMid *= weather.paceMod;
  activeAwayMid *= weather.paceMod;

  // Initial stats
  let homeGoalsValue = 0;
  let awayGoalsValue = 0;
  let homeShotsValue = 0;
  let awayShotsValue = 0;

  const scoreEvents: MatchEvent[] = [];
  const cardRecords: { [playerName: string]: number } = {};
  const activeRedCardHolders = new Set<string>();

  // Add intro arena atmosphere description event
  scoreEvents.push({
    minute: 1,
    type: "SAVE",
    playerName: "Referee",
    team: "home",
    description: `🏟️ Arena Kickoff at the ${stadium}! Weather state is ${weather.name}. ${weather.description} Matches overseen of strict referee ${referee.name} (${referee.style}).`
  });

  // Out of position announcements at kickoff
  const announcePositionWarnings = (players: Player[], name: string, team: "home" | "away", lineupMap?: LineupSetup) => {
    if (!lineupMap) return;
    players.forEach((p) => {
      let activePositionKey = "";
      Object.entries(lineupMap).forEach(([slotKey, slotPlayer]) => {
        if (slotPlayer && slotPlayer.id === p.id) activePositionKey = slotKey;
      });
      if (activePositionKey) {
        const req = getRequiredPositionForSlot(activePositionKey);
        if (p.primaryPosition !== req && !p.alternativePositions.includes(req)) {
          scoreEvents.push({
            minute: 1,
            type: "INJURY",
            playerName: p.shortName,
            team,
            description: `⚠️ Tactical Risk: ${p.shortName} is deployed as a ${req} which is entirely out of their comfort zone. Rating and individual stats heavily penalized (-30%)!`
          });
        }
      }
    });
  };
  announcePositionWarnings(homePlayers, homeName, "home", homeLineup);
  announcePositionWarnings(awayPlayers, awayName, "away", awayLineup);

  // Choose player based on shooting stats and position weighting
  const selectSegmentGoalscorer = (team: "home" | "away") => {
    const players = team === "home" ? homePlayers : awayPlayers;
    const cleanPlayers = playerListAdjustPositionPenalty(players, team === "home" ? homeLineup : awayLineup);
    const opponentRating = team === "home" ? homeRating : awayRating;
    
    if (cleanPlayers.length > 0) {
      const activeSTs = cleanPlayers.filter(p => !activeRedCardHolders.has(p.shortName));
      const list = activeSTs.length > 0 ? activeSTs : cleanPlayers;

      const weighted = list.map((p) => {
        let weight = p.stats.sho;
        if (p.primaryPosition === "ST") weight *= 2.8;
        if (p.primaryPosition === "LW" || p.primaryPosition === "RW") weight *= 2.0;
        if (p.primaryPosition === "CM" || p.primaryPosition === "LM" || p.primaryPosition === "RM") weight *= 1.2;
        if (p.primaryPosition === "CB" || p.primaryPosition === "LB" || p.primaryPosition === "RB") weight *= 0.35;
        if (p.primaryPosition === "GK") weight *= 0.01;
        return { p, weight };
      });

      const totalWeight = weighted.reduce((acc, curr) => acc + curr.weight, 0);
      let rand = Math.random() * totalWeight;
      for (const item of weighted) {
        rand -= item.weight;
        if (rand <= 0) {
          return {
            shortName: item.p.shortName,
            id: item.p.id,
            stats: {
              sho: item.p.stats.sho,
              pac: item.p.stats.pac,
              pas: item.p.stats.pas,
              dri: item.p.stats.dri,
            }
          };
        }
      }
      return {
        shortName: list[0].shortName,
        id: list[0].id,
        stats: {
          sho: list[0].stats.sho,
          pac: list[0].stats.pac,
          pas: list[0].stats.pas,
          dri: list[0].stats.dri,
        }
      };
    } else {
      const stars = team === "home" ? homeOpponentStarPlayers : awayOpponentStarPlayers;
      if (stars.length > 0) {
        const randStar = stars[Math.floor(Math.random() * stars.length)];
        return {
          shortName: randStar,
          id: "",
          stats: {
            sho: Math.max(70, Math.min(99, Math.round(opponentRating + 3))),
            pac: Math.max(70, Math.min(99, Math.round(opponentRating + 1))),
            pas: Math.max(70, Math.min(99, Math.round(opponentRating - 1))),
            dri: Math.max(70, Math.min(99, Math.round(opponentRating))),
          }
        };
      }
      return {
        shortName: team === "home" ? "Forward" : "Striker",
        id: "",
        stats: {
          sho: Math.round(opponentRating),
          pac: Math.round(opponentRating),
          pas: Math.round(opponentRating),
          dri: Math.round(opponentRating),
        }
      };
    }
  };

  const selectSegmentAssistant = (team: "home" | "away", scorerId: string) => {
    const players = team === "home" ? homePlayers : awayPlayers;
    const otherPlayers = players.filter((p) => p.id !== scorerId && !activeRedCardHolders.has(p.shortName));

    if (otherPlayers.length > 0) {
      const weighted = otherPlayers.map((p) => {
        let weight = p.stats.pas;
        if (p.primaryPosition === "CM") weight *= 2.8;
        if (p.primaryPosition === "LM" || p.primaryPosition === "RM" || p.primaryPosition === "LW" || p.primaryPosition === "RW") weight *= 2.1;
        if (p.primaryPosition === "LB" || p.primaryPosition === "RB") weight *= 1.5;
        if (p.primaryPosition === "CB") weight *= 0.6;
        if (p.primaryPosition === "GK") weight *= 0.1;
        return { p, weight };
      });

      const totalWeight = weighted.reduce((acc, curr) => acc + curr.weight, 0);
      let rand = Math.random() * totalWeight;
      for (const item of weighted) {
        rand -= item.weight;
        if (rand <= 0) return item.p.shortName;
      }
      return otherPlayers[0].shortName;
    } else {
      const stars = team === "home" ? homeOpponentStarPlayers : awayOpponentStarPlayers;
      const otherStars = stars.filter((s) => s !== scorerId);
      if (otherStars.length > 0) {
        return otherStars[Math.floor(Math.random() * otherStars.length)];
      }
      return "";
    }
  };

  const getDefensiveTactician = (team: "home" | "away") => {
    const players = team === "home" ? homePlayers : awayPlayers;
    const defs = players.filter(p => [Position.CB, Position.LB, Position.RB].includes(p.primaryPosition) && !activeRedCardHolders.has(p.shortName));
    if (defs.length > 0) {
      return defs[Math.floor(Math.random() * defs.length)].shortName;
    }
    return team === "home" ? "Defender" : "Center Back";
  };

  // 2. RUN MINUTE SEGMENTS (Segment ticker, 24 segments total)
  for (let segment = 1; segment <= 24; segment++) {
    const startMin = Math.round((segment - 1) * (90 / 24)) + 1;
    const endMin = Math.round(segment * (90 / 24));
    const segmentMinute = Math.min(90, Math.floor(Math.random() * (endMin - startMin + 1)) + startMin);

    // A. ATTACK INITIATIVE STAGE
    // Initiative is driven by Midfield ratios
    const totalMidfieldPower = activeHomeMid + activeAwayMid;
    const homePossessionShare = activeHomeMid / totalMidfieldPower;

    // Determine how many scoring opportunities arise in this segment
    let segmentPossessionRoll = Math.random();
    const isHomeOpportunity = segmentPossessionRoll < homePossessionShare * 1.05;

    if (Math.random() < 0.285) { // Proportionately adjusted from 0.38 to retain real-world goal rates over 24 segments
      if (isHomeOpportunity) {
        homeShotsValue++;
        
        // 1. Pick the shooter
        const shooter = selectSegmentGoalscorer("home");
        
        // 2. Individual shooter stats & weather conditions
        const baseShotsValue = shooter.stats.sho;
        const weatherShotBonus = weather.name === "Rainy & Slick Turf" ? 3 : weather.name === "Snowy & Freezing" ? -4 : 0;
        const adjustedShooterPower = baseShotsValue + weatherShotBonus;

        // 3. Opponent defense and goalkeeper stats response
        const oppGkName = awayPlayers.find((p) => p.primaryPosition === Position.GK)?.shortName || "Opposition Goalkeeper";
        const oppGkRating = awayPlayers.find((p) => p.primaryPosition === Position.GK)?.rating || awayRating;
        const oppDefRating = activeAwayDef;

        const defenderPower = (oppDefRating * 0.6) + (oppGkRating * 0.4);

        // 4. Squad Chemistry influence (Home)
        const teamChemistry = homeChemistry ?? 90;
        const chemistryCoefficient = 0.9 + (teamChemistry / 100) * 0.2; // Multiplier from 0.9 to 1.1 based on chemistry
        const chemistryBonusPercent = Math.round((chemistryCoefficient - 1) * 100);

        // 5. Final Conversion probability based on power differences
        const powerMargin = (adjustedShooterPower * chemistryCoefficient) - defenderPower;
        const conversionProb = Math.max(0.05, Math.min(0.85, 0.25 + (powerMargin / 100)));

        const shotRoll = Math.random();
        if (shotRoll < conversionProb) {
          // GOAL SCORED!
          // VAR check
          if (Math.random() < 0.05 && segment > 1) {
            scoreEvents.push({
              minute: segmentMinute,
              type: "WOODWORK",
              playerName: shooter.shortName,
              team: "home",
              description: `🖥️ VAR REVERSAL: ${shooter.shortName} slots it home! But VAR flags a marginal offside in the build-up. NO GOAL. [Shot power: ${baseShotsValue} OVR vs Def: ${Math.round(defenderPower)} OVR | Chem boost: ${chemistryBonusPercent >= 0 ? "+" : ""}${chemistryBonusPercent}%]`
            });
          } else {
            homeGoalsValue++;
            const assistant = Math.random() > 0.35 ? selectSegmentAssistant("home", shooter.id) : "";
            scoreEvents.push({
              minute: segmentMinute,
              type: "GOAL",
              playerName: shooter.shortName,
              assistedBy: assistant || undefined,
              team: "home",
              description: `⚽ GOAL! ${shooter.shortName} ${SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]}! ${assistant ? `${assistant} provided the exquisite assist.` : "Sensational individual effort!"} [Shot: ${baseShotsValue} OVR vs GK: ${Math.round(oppGkRating)} OVR | Chem: ${teamChemistry}% (${chemistryBonusPercent >= 0 ? "+" : ""}${chemistryBonusPercent}% conversion)]`
            });
          }
        } else {
          // MISSED or SAVED
          if (Math.random() < 0.6) {
            scoreEvents.push({
              minute: segmentMinute,
              type: "SAVE",
              playerName: oppGkName,
              team: "away",
              description: `🧤 SPECTACULAR SAVE! ${oppGkName} denies a fierce effort from ${shooter.shortName}. [Shot: ${baseShotsValue} OVR | Goalkeeper: ${Math.round(oppGkRating)} OVR]`
            });
          } else if (Math.random() < 0.25) {
            scoreEvents.push({
              minute: segmentMinute,
              type: "WOODWORK",
              playerName: shooter.shortName,
              team: "home",
              description: `💥 WOODWORK! ${shooter.shortName} intercepts, lets fly, but the thundering strike rattles off the left post! [Shot Power: ${baseShotsValue} OVR vs GK Response: ${Math.round(oppGkRating)} OVR]`
            });
          } else {
            scoreEvents.push({
              minute: segmentMinute,
              type: "SAVE",
              playerName: shooter.shortName,
              team: "home",
              description: `💨 OFF TARGET! ${shooter.shortName} gets into a dangerous pocket but slices his shot wide under pressure from the defense. [Shot Power: ${baseShotsValue} OVR vs Def Pressure: ${Math.round(oppDefRating)} OVR]`
            });
          }
        }
      } else {
        awayShotsValue++;
        
        // 1. Pick the shooter
        const shooter = selectSegmentGoalscorer("away");
        
        // 2. Individual shooter stats & weather conditions
        const baseShotsValue = shooter.stats.sho;
        const weatherShotBonus = weather.name === "Rainy & Slick Turf" ? 3 : weather.name === "Snowy & Freezing" ? -4 : 0;
        const adjustedShooterPower = baseShotsValue + weatherShotBonus;

        // 3. Opponent defense and goalkeeper stats response (Home is defendant)
        const oppGkName = homePlayers.find((p) => p.primaryPosition === Position.GK)?.shortName || "Your Goalkeeper";
        const oppGkRating = homePlayers.find((p) => p.primaryPosition === Position.GK)?.rating || homeRating;
        const oppDefRating = activeHomeDef;

        const defenderPower = (oppDefRating * 0.6) + (oppGkRating * 0.4);

        // 4. Squad Chemistry influence (Away)
        const teamChemistry = awayChemistry ?? 90;
        const chemistryCoefficient = 0.9 + (teamChemistry / 100) * 0.2;
        const chemistryBonusPercent = Math.round((chemistryCoefficient - 1) * 100);

        // 5. Final Conversion probability
        const powerMargin = (adjustedShooterPower * chemistryCoefficient) - defenderPower;
        const conversionProb = Math.max(0.05, Math.min(0.85, 0.25 + (powerMargin / 100)));

        const shotRoll = Math.random();
        if (shotRoll < conversionProb) {
          // GOAL SCORED!
          // VAR check
          if (Math.random() < 0.05 && segment > 1) {
            scoreEvents.push({
              minute: segmentMinute,
              type: "WOODWORK",
              playerName: shooter.shortName,
              team: "away",
              description: `🖥️ VAR CANCEL: ${shooter.shortName} finishes with class! However video referee reviews and chalks it off for hands in build-up. [Shot: ${baseShotsValue} OVR vs Def: ${Math.round(defenderPower)} OVR | Chem boost: ${chemistryBonusPercent >= 0 ? "+" : ""}${chemistryBonusPercent}%]`
            });
          } else {
            awayGoalsValue++;
            const assistant = Math.random() > 0.35 ? selectSegmentAssistant("away", shooter.id) : "";
            scoreEvents.push({
              minute: segmentMinute,
              type: "GOAL",
              playerName: shooter.shortName,
              assistedBy: assistant || undefined,
              team: "away",
              description: `⚽ GOAL! ${shooter.shortName} ${SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]}! ${assistant ? `Exquisite buildup play assisted by ${assistant}.` : "Absolute world-class solo goal!"} [Shot: ${baseShotsValue} OVR vs GK: ${Math.round(oppGkRating)} OVR | Chem: ${teamChemistry}% (${chemistryBonusPercent >= 0 ? "+" : ""}${chemistryBonusPercent}% conversion)]`
            });
          }
        } else {
          // MISSED or SAVED
          if (Math.random() < 0.6) {
            scoreEvents.push({
              minute: segmentMinute,
              type: "SAVE",
              playerName: oppGkName,
              team: "home",
              description: `🧤 SPECTACULAR SAVE! ${oppGkName} leaps acrobatically to palm away a bullet from ${shooter.shortName}. [Shot: ${baseShotsValue} OVR | Goalkeeper: ${Math.round(oppGkRating)} OVR]`
            });
          } else if (Math.random() < 0.25) {
            scoreEvents.push({
              minute: segmentMinute,
              type: "WOODWORK",
              playerName: shooter.shortName,
              team: "away",
              description: `💥 WOODWORK! ${shooter.shortName} cracks a powerful effort but it glances off the crossbar! [Shot: ${baseShotsValue} OVR vs Save-Response: ${Math.round(oppGkRating)} OVR]`
            });
          } else {
            scoreEvents.push({
              minute: segmentMinute,
              type: "SAVE",
              playerName: shooter.shortName,
              team: "away",
              description: `💨 OFF TARGET! ${shooter.shortName} gets past his marker but pulls the shot wide under pressure. [Shot Power: ${baseShotsValue} OVR vs Def Pressure: ${Math.round(oppDefRating)} OVR]`
            });
          }
        }
      }
    }

    // B. CARDS, FOULS & DISCIPLINE STAGE
    // Prob affected by weather slide tackle multiplier & referee strictness
    const cardProb = 0.06 * weather.cardMod * referee.strictness; // Adjusted from 0.08 to match 24 segments
    if (Math.random() < cardProb) {
      const cardTeam: "home" | "away" = Math.random() > 0.5 ? "home" : "away";
      const playersPool = cardTeam === "home" ? homePlayers : awayPlayers;
      
      if (playersPool.length > 0) {
        // Pick a random player to receive discipline
        const targetPlayer = playersPool[Math.floor(Math.random() * playersPool.length)].shortName;

        if (!activeRedCardHolders.has(targetPlayer)) {
          const hasYellow = cardRecords[targetPlayer] === 1;

          if (hasYellow) {
            // Double Yellow -> RED CARD!
            cardRecords[targetPlayer] = 2;
            activeRedCardHolders.add(targetPlayer);
            scoreEvents.push({
              minute: segmentMinute,
              type: "RED_CARD",
              playerName: targetPlayer,
              team: cardTeam,
              description: `❌ RED CARD! ${targetPlayer} picks up his second yellow card after a clumsy tactical pull. He has been ordered off the field by ${referee.name}!`
            });

            // Permanent rating penalty to the squad for playing down a man!
            if (cardTeam === "home") {
              activeHomeDef = Math.max(40, activeHomeDef - 10);
              activeHomeMid = Math.max(40, activeHomeMid - 10);
              activeHomeAtt = Math.max(40, activeHomeAtt - 8);
            } else {
              activeAwayDef = Math.max(40, activeAwayDef - 10);
              activeAwayMid = Math.max(40, activeAwayMid - 10);
              activeAwayAtt = Math.max(40, activeAwayAtt - 8);
            }
          } else {
            // First Yellow Card
            cardRecords[targetPlayer] = 1;
            scoreEvents.push({
              minute: segmentMinute,
              type: "YELLOW_CARD",
              playerName: targetPlayer,
              team: cardTeam,
              description: `⚠️ YELLOW CARD! ${targetPlayer} ${INJURIES_YELLOW_CARDS[Math.floor(Math.random() * 2)]}`
            });
          }
        }
      }
    }

    // C. INJURY STAGE
    if (Math.random() < 0.026) { // Adjusted from 0.035 to match 24 segments
      const injuryTeam: "home" | "away" = Math.random() > 0.5 ? "home" : "away";
      const playersPool = injuryTeam === "home" ? homePlayers : awayPlayers;
      if (playersPool.length > 0) {
        const targetPlayer = playersPool[Math.floor(Math.random() * playersPool.length)].shortName;
        const injuryPhrase = INJURIES_YELLOW_CARDS[2 + Math.floor(Math.random() * 2)];
        scoreEvents.push({
          minute: segmentMinute,
          type: "INJURY",
          playerName: targetPlayer,
          team: injuryTeam,
          description: `🚑 INJURY: ${targetPlayer} ${injuryPhrase}`
        });
      }
    }
  }

  // Final aggregate match statistics calculations based on midfield balance
  const homeShots = Math.max(homeGoalsValue, Math.round(homeShotsValue + Math.random() * 4));
  const awayShots = Math.max(awayGoalsValue, Math.round(awayShotsValue + Math.random() * 4));

  const totalMid = activeHomeMid + activeAwayMid;
  const rawHomePoss = (activeHomeMid / totalMid) * 100 + (Math.random() * 8 - 4);
  const homePossession = Math.max(28, Math.min(72, Math.round(rawHomePoss)));
  const awayPossession = 100 - homePossession;

  // Sort timeline events chronologically
  scoreEvents.sort((a, b) => a.minute - b.minute);

  return {
    id: `match_${Math.random().toString(36).substr(2, 9)}`,
    homeTeam: homeName,
    awayTeam: awayName,
    homeScore: homeGoalsValue,
    awayScore: awayGoalsValue,
    isSimulated: true,
    scoreEvents,
    stats: {
      homeShots,
      awayShots,
      homePossession,
      awayPossession
    },
    stage
  };
}

// Generate the fully structured Champions League tournament seasons
export class ChampionsLeagueTournament {
  public draftedSquadName: string;
  public draftedLineup: Player[];
  public draftedLineupMap: LineupSetup;
  public draftedAvgRating: number;
  public draftedChemScore: number;
  
  public difficulty: Difficulty;
  public tournamentMode: "ucl" | "worldcup";
  
  public allTeams: { id: string; name: string; isUser: boolean; rating: number; logo: string; starPlayers: string[]; chemistry: number; group?: string }[] = [];
  public groups: { name: string; teams: string[] }[] = []; // 4/8 groups of 4 teams
  public groupTables: {
    [teamName: string]: { played: number; won: number; drawn: number; lost: number; gf: number; ga: number; gd: number; pts: number };
  } = {};

  public fixtures: Match[] = [];
  public currentFixtureIndex = 0;

  // Knockout Stages State
  public qfLegs: { [coupleId: string]: Match[] } = {};
  public sfLegs: { [coupleId: string]: Match[] } = {};
  public finalFixture: Match | null = null;

  // World Cup properties
  public tournamentYear: number;
  public r16Matches: Match[] = [];

  public currentStageIndex = 0; // 0=GS, 1=GS Matches, 2=QF Draw, 3=QF Legs, 4=SF Legs, 5=Final
  public stageText = "Group Stage Preparation";

  // Match-by-match metrics tracking for user's drafted squad over time
  public userMatchHistory: UserMatchHistoryEntry[] = [];

  // Individual goals and assists tracking
  public playerStatTracker: {
    [pName: string]: { id: string; goals: number; assists: number; ratingsSum: number; appearances: number; isUserTeam: boolean };
  } = {};

  constructor(
    squadName: string,
    lineup: LineupSetup,
    avgRating: number,
    chemScore: number,
    difficulty: Difficulty = Difficulty.Amateur,
    tournamentMode: "ucl" | "worldcup" = "ucl",
    tournamentYear?: number
  ) {
    this.draftedSquadName = squadName || "Custom Squad";
    // Convert lineup setup map back to array
    this.draftedLineup = Object.values(lineup).filter((v) => v !== null) as Player[];
    this.draftedLineupMap = lineup;
    this.draftedAvgRating = avgRating;
    this.draftedChemScore = chemScore;
    this.difficulty = difficulty;
    this.tournamentMode = tournamentMode;
    this.tournamentYear = tournamentYear || 2014;

    this.initializeTournament();
  }

  private initializeTournament() {
    let opponentRatingBoost = 0;
    if (this.difficulty === Difficulty.SemiPro) {
      opponentRatingBoost = 1;
    } else if (this.difficulty === Difficulty.Professional) {
      opponentRatingBoost = 3;
    } else if (this.difficulty === Difficulty.Legendary) {
      opponentRatingBoost = 6;
    }

    if (this.tournamentMode === "worldcup") {
      const yearConfig = WORLD_CUP_YEARS_DATA[this.tournamentYear] || WORLD_CUP_YEARS_DATA[2014];
      const wcTeams = yearConfig.teams;

      // Group A replacement to position user team
      const teamsWithGroup = [...wcTeams];
      this.allTeams = teamsWithGroup.map((t, idx) => {
        const isUserTeamReplacement = idx === 0;
        if (isUserTeamReplacement) {
          return {
            id: "user_squad",
            name: this.draftedSquadName,
            isUser: true,
            rating: Math.round(this.draftedAvgRating + (this.draftedChemScore - 50) / 10),
            logo: "🏆",
            starPlayers: this.draftedLineup.map((l) => l.name),
            chemistry: this.draftedChemScore,
            group: t.group
          };
        } else {
          return {
            id: t.id,
            name: t.name,
            isUser: false,
            rating: Math.max(70, Math.min(99, t.rating + opponentRatingBoost)),
            logo: t.logo,
            starPlayers: t.starPlayers,
            chemistry: Math.max(80, Math.min(100, Math.round(t.rating - 2 + Math.random() * 5))),
            group: t.group
          };
        }
      });

      // Distribute into 8 groups (Group A to Group H)
      const groupMap: Record<string, string[]> = {};
      this.allTeams.forEach((team) => {
        const grp = team.group || "Group A";
        if (!groupMap[grp]) groupMap[grp] = [];
        groupMap[grp].push(team.name);
      });

      this.groups = Object.entries(groupMap).map(([name, teams]) => ({
        name,
        teams
      })).sort((a, b) => a.name.localeCompare(b.name));

      // Initialize group tables metrics
      this.allTeams.forEach((t) => {
        this.groupTables[t.name] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
      });

      // Generate 3 matchdays for World Cup group stage
      const rounds = [
        [[0, 1], [2, 3]],
        [[0, 2], [1, 3]],
        [[0, 3], [1, 2]],
      ];

      rounds.forEach((round, rIndex) => {
        this.groups.forEach((group) => {
          const teams = group.teams;
          round.forEach(([homeI, awayI]) => {
            if (teams[homeI] && teams[awayI]) {
              this.fixtures.push({
                id: `fixture_gs_${group.name.replace(" ", "")}_r${rIndex}_${homeI}_${awayI}`,
                homeTeam: teams[homeI],
                awayTeam: teams[awayI],
                homeScore: 0,
                awayScore: 0,
                isSimulated: false,
                scoreEvents: [],
                stats: { homeShots: 0, awayShots: 0, homePossession: 50, awayPossession: 50 },
                stage: `${group.name} - Matchday ${rIndex + 1}`,
              });
            }
          });
        });
      });
    } else {
      let compPool = COMPETITOR_CLUBS;

      this.allTeams = [
        { id: "user_squad", name: this.draftedSquadName, isUser: true, rating: Math.round(this.draftedAvgRating + (this.draftedChemScore - 50) / 10), logo: "🛡️", starPlayers: this.draftedLineup.map((l) => l.name), chemistry: this.draftedChemScore },
        ...compPool.map((c) => ({ 
          id: c.id, 
          name: c.name, 
          isUser: false, 
          rating: Math.max(70, Math.min(99, (c.rating - 10) + opponentRatingBoost)), 
          logo: c.logo, 
          starPlayers: c.starPlayers,
          chemistry: Math.max(80, Math.min(100, Math.round(c.rating - 2 + Math.random() * 5)))
        })),
      ];

      // Shuffled opponent teams
      const competitors = [...this.allTeams];
      // Fisher-Yates shuffle
      for (let i = competitors.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [competitors[i], competitors[j]] = [competitors[j], competitors[i]];
      }

      // Distribute into 4 groups (Group A, B, C, D)
      this.groups = [
        { name: "Group A", teams: competitors.slice(0, 4).map((t) => t.name) },
        { name: "Group B", teams: competitors.slice(4, 8).map((t) => t.name) },
        { name: "Group C", teams: competitors.slice(8, 12).map((t) => t.name) },
        { name: "Group D", teams: competitors.slice(12, 16).map((t) => t.name) },
      ];

      // Initialize group tables metrics
      this.allTeams.forEach((t) => {
        this.groupTables[t.name] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
      });

      // Generate Double Round Robin Fixtures for groups (6 matchweeks)
      const rounds = [
        [[0, 1], [2, 3]],
        [[0, 2], [1, 3]],
        [[0, 3], [1, 2]],
        [[1, 0], [3, 2]], // second legs
        [[2, 0], [3, 1]],
        [[3, 0], [2, 1]],
      ];

      rounds.forEach((round, rIndex) => {
        this.groups.forEach((group) => {
          const teams = group.teams;
          round.forEach(([homeI, awayI]) => {
            this.fixtures.push({
              id: `fixture_gs_${group.name.replace(" ", "")}_r${rIndex}_${homeI}_${awayI}`,
              homeTeam: teams[homeI],
              awayTeam: teams[awayI],
              homeScore: 0,
              awayScore: 0,
              isSimulated: false,
              scoreEvents: [],
              stats: { homeShots: 0, awayShots: 0, homePossession: 50, awayPossession: 50 },
              stage: `${group.name} - Matchday ${rIndex + 1}`,
            });
          });
        });
      });
    }

    // Populate standard Player tracker for user team
    this.draftedLineup.forEach((p) => {
      this.playerStatTracker[p.shortName] = { id: p.id, goals: 0, assists: 0, ratingsSum: 0, appearances: 0, isUserTeam: true };
    });
  }

  // Simulates a single match in the tournament (by reference match)
  public simulateSpecificMatch(f: Match): Match {
    if (f.isSimulated) return f;

    const homeT = this.allTeams.find((t) => t.name === f.homeTeam)!;
    const awayT = this.allTeams.find((t) => t.name === f.awayTeam)!;

    const userIsHome = homeT.isUser;
    const userIsAway = awayT.isUser;

    const sim = simulateMatch(
      f.homeTeam,
      f.awayTeam,
      homeT.rating,
      awayT.rating,
      userIsHome ? this.draftedLineup : [],
      userIsAway ? this.draftedLineup : [],
      userIsHome ? [] : homeT.starPlayers,
      userIsAway ? [] : awayT.starPlayers,
      f.stage,
      userIsHome ? this.draftedLineupMap : undefined,
      userIsAway ? this.draftedLineupMap : undefined,
      userIsHome ? this.draftedChemScore : homeT.chemistry ?? 90,
      userIsAway ? this.draftedChemScore : awayT.chemistry ?? 90
    );

    f.homeScore = sim.homeScore;
    f.awayScore = sim.awayScore;
    f.isSimulated = true;
    f.scoreEvents = sim.scoreEvents;
    f.stats = sim.stats;

    // Update player logs and stats trackers
    this.accumulatePlayerStats(sim, homeT, awayT);

    // Update live Group Tables if group stage
    const hTable = this.groupTables[f.homeTeam];
    const aTable = this.groupTables[f.awayTeam];

    if (hTable && aTable) {
      hTable.played++;
      aTable.played++;
      hTable.gf += sim.homeScore;
      hTable.ga += sim.awayScore;
      hTable.gd = hTable.gf - hTable.ga;
      aTable.gf += sim.awayScore;
      aTable.ga += sim.homeScore;
      aTable.gd = aTable.gf - aTable.ga;

      if (sim.homeScore > sim.awayScore) {
        hTable.won++;
        hTable.pts += 3;
        aTable.lost++;
      } else if (sim.homeScore < sim.awayScore) {
        aTable.won++;
        aTable.pts += 3;
        hTable.lost++;
      } else {
        hTable.drawn++;
        hTable.pts++;
        aTable.drawn++;
        aTable.pts++;
      }
    }

    return f;
  }

  // Simulates a single matchday, returns played matches
  public simulateNextGroupMatchday(): Match[] {
    const unsimulated = this.fixtures.filter((f) => !f.isSimulated);
    if (unsimulated.length === 0) return [];

    // Simulate in pairs of 8 matches (16 matches for World Cup stage)
    const matchSize = this.tournamentMode === "worldcup" ? 16 : 8;
    const matchdayFixtures = unsimulated.slice(0, matchSize);
    matchdayFixtures.forEach((f) => {
      this.simulateSpecificMatch(f);
    });

    return matchdayFixtures;
  }

  private accumulatePlayerStats(match: Match, homeT: any, awayT: any) {
    const isUserHome = homeT.isUser;
    const isUserAway = awayT.isUser;
    
    const currentRatings: { [playerShortName: string]: number } = {};

    // Increment game records
    if (isUserHome) {
      this.draftedLineup.forEach((p) => {
        this.playerStatTracker[p.shortName].appearances++;
        // Award primitive player rating based on random base + score multiplier
        const playerMatchPerf = Math.round(Math.min(10.0, Math.max(5.0, 6.5 + (match.homeScore - match.awayScore) * 0.3 + (Math.random() * 2.0 - 1.0))) * 10) / 10;
        this.playerStatTracker[p.shortName].ratingsSum += playerMatchPerf;
        currentRatings[p.shortName] = playerMatchPerf;
      });
    } else if (isUserAway) {
      this.draftedLineup.forEach((p) => {
        this.playerStatTracker[p.shortName].appearances++;
        const playerMatchPerf = Math.round(Math.min(10.0, Math.max(5.0, 6.5 + (match.awayScore - match.homeScore) * 0.3 + (Math.random() * 2.0 - 1.0))) * 10) / 10;
        this.playerStatTracker[p.shortName].ratingsSum += playerMatchPerf;
        currentRatings[p.shortName] = playerMatchPerf;
      });
    }

    if (isUserHome || isUserAway) {
      const goalsScored = isUserHome ? match.homeScore : match.awayScore;
      const goalsConceded = isUserHome ? match.awayScore : match.homeScore;
      const possession = isUserHome ? match.stats.homePossession : match.stats.awayPossession;
      
      this.userMatchHistory.push({
        matchdayLabel: match.stage,
        goalsScored,
        goalsConceded,
        possession,
        playerRatings: currentRatings,
      });
    }

    match.scoreEvents.forEach((ev) => {
      if (ev.type === "GOAL") {
        if (!this.playerStatTracker[ev.playerName]) {
          this.playerStatTracker[ev.playerName] = { id: "", goals: 0, assists: 0, ratingsSum: 0, appearances: 1, isUserTeam: false };
        }
        this.playerStatTracker[ev.playerName].goals++;

        if (ev.playerName && ev.assistedBy) {
          if (!this.playerStatTracker[ev.assistedBy]) {
            this.playerStatTracker[ev.assistedBy] = { id: "", goals: 0, assists: 0, ratingsSum: 0, appearances: 1, isUserTeam: false };
          }
          this.playerStatTracker[ev.assistedBy].assists++;
        }
      }
    });
  }

  // Draw and perform Round of 16 matches for World Cup Mode using top 2 of each of the 8 groups
  public qualifyRoundOf16() {
    if (this.tournamentMode !== "worldcup") return;

    interface StandingEntry {
      name: string;
      pts: number;
      gd: number;
      gf: number;
      rating: number;
      logo: string;
      starPlayers: string[];
    }

    const leaders: Record<string, StandingEntry[]> = {};

    this.groups.forEach((group) => {
      const standings = group.teams
        .map((teamName) => ({
          name: teamName,
          stats: this.groupTables[teamName],
          meta: this.allTeams.find((t) => t.name === teamName)!,
        }))
        .sort((a, b) => {
          if (b.stats.pts !== a.stats.pts) return b.stats.pts - a.stats.pts;
          if (b.stats.gd !== a.stats.gd) return b.stats.gd - a.stats.gd;
          return b.stats.gf - a.stats.gf;
        });

      leaders[group.name] = [
        {
          name: standings[0].name,
          pts: standings[0].stats.pts,
          gd: standings[0].stats.gd,
          gf: standings[0].stats.gf,
          rating: standings[0].meta.rating,
          logo: standings[0].meta.logo,
          starPlayers: standings[0].meta.starPlayers,
        },
        {
          name: standings[1].name,
          pts: standings[1].stats.pts,
          gd: standings[1].stats.gd,
          gf: standings[1].stats.gf,
          rating: standings[1].meta.rating,
          logo: standings[1].meta.logo,
          starPlayers: standings[1].meta.starPlayers,
        }
      ];
    });

    const pairs = [
      ["Group A", "Group B"],
      ["Group C", "Group D"],
      ["Group E", "Group F"],
      ["Group G", "Group H"],
    ];

    this.r16Matches = [];
    let r16MatchId = 1;

    pairs.forEach(([grpA, grpB]) => {
      const winnerA = leaders[grpA]?.[0];
      const runnerA = leaders[grpA]?.[1];
      const winnerB = leaders[grpB]?.[0];
      const runnerB = leaders[grpB]?.[1];

      if (winnerA && runnerB) {
        const m1: Match = {
          id: `fixture_r16_${r16MatchId}`,
          homeTeam: winnerA.name,
          awayTeam: runnerB.name,
          homeScore: 0,
          awayScore: 0,
          isSimulated: false,
          scoreEvents: [],
          stats: { homeShots: 0, awayShots: 0, homePossession: 50, awayPossession: 50 },
          stage: "Round of 16",
        };
        this.r16Matches.push(m1);
        this.fixtures.push(m1);
        r16MatchId++;
      }

      if (winnerB && runnerA) {
        const m2: Match = {
          id: `fixture_r16_${r16MatchId}`,
          homeTeam: winnerB.name,
          awayTeam: runnerA.name,
          homeScore: 0,
          awayScore: 0,
          isSimulated: false,
          scoreEvents: [],
          stats: { homeShots: 0, awayShots: 0, homePossession: 50, awayPossession: 50 },
          stage: "Round of 16",
        };
        this.r16Matches.push(m2);
        this.fixtures.push(m2);
        r16MatchId++;
      }
    });

    // Simulate non-user matches instantly
    this.r16Matches.forEach((match) => {
      const userIsHere = match.homeTeam === this.draftedSquadName || match.awayTeam === this.draftedSquadName;
      if (!userIsHere) {
        this.simulateSpecificMatch(match);
        if (match.homeScore === match.awayScore) {
          if (Math.random() > 0.5) {
            match.homeScore += 1;
          } else {
            match.awayScore += 1;
          }
        }
      }
    });
  }

  // Draw the Quarter-Final matches based on Top 2 qualifiers of each group
  public qualifyTopTeams() {
    if (this.tournamentMode === "worldcup") {
      // In World Cup, QF matches are drawn from the 8 survivors of Round of 16 matches
      const r16Winners = this.r16Matches.map((m) => {
        const winnerName = m.homeScore > m.awayScore ? m.homeTeam : m.awayTeam;
        return this.allTeams.find((t) => t.name === winnerName)!;
      });

      this.qfLegs = {};
      this.fixtures = this.fixtures.filter(f => !f.stage.startsWith("Quarter-Final"));

      let matchId = 1;
      const pool = [...r16Winners];
      while (pool.length > 0) {
        const teamA = pool.splice(0, 1)[0];
        const teamB = pool.splice(0, 1)[0];
        const coupleKey = `qf_match_${matchId}`;

        if (teamA && teamB) {
          const match: Match = {
            id: `fixture_qf_${matchId}`,
            homeTeam: teamA.name,
            awayTeam: teamB.name,
            homeScore: 0,
            awayScore: 0,
            isSimulated: false,
            scoreEvents: [],
            stats: { homeShots: 0, awayShots: 0, homePossession: 50, awayPossession: 50 },
            stage: "Quarter-Finals",
          };

          this.qfLegs[coupleKey] = [match];
          this.fixtures.push(match);
          matchId++;

          // Simulate non-user matches instantly
          const userIsHere = teamA.name === this.draftedSquadName || teamB.name === this.draftedSquadName;
          if (!userIsHere) {
            this.simulateSpecificMatch(match);
            if (match.homeScore === match.awayScore) {
              if (Math.random() > 0.5) {
                match.homeScore += 1;
              } else {
                match.awayScore += 1;
              }
            }
          }
        }
      }
      return;
    }

    interface QualifiedTeam {
      name: string;
      pts: number;
      gd: number;
      gf: number;
      rating: number;
      logo: string;
      starPlayers: string[];
    }

    const quarterFinalists: QualifiedTeam[] = [];

    this.groups.forEach((group) => {
      const standings = group.teams
        .map((teamName) => ({
          name: teamName,
          stats: this.groupTables[teamName],
          meta: this.allTeams.find((t) => t.name === teamName)!,
        }))
        .sort((a, b) => {
          if (b.stats.pts !== a.stats.pts) return b.stats.pts - a.stats.pts;
          if (b.stats.gd !== a.stats.gd) return b.stats.gd - a.stats.gd;
          return b.stats.gf - a.stats.gf;
        });

      // Fetch top 2
      quarterFinalists.push({
        name: standings[0].name,
        pts: standings[0].stats.pts,
        gd: standings[0].stats.gd,
        gf: standings[0].stats.gf,
        rating: standings[0].meta.rating,
        logo: standings[0].meta.logo,
        starPlayers: standings[0].meta.starPlayers,
      });

      quarterFinalists.push({
        name: standings[1].name,
        pts: standings[1].stats.pts,
        gd: standings[1].stats.gd,
        gf: standings[1].stats.gf,
        rating: standings[1].meta.rating,
        logo: standings[1].meta.logo,
        starPlayers: standings[1].meta.starPlayers,
      });
    });

    // Shuffle and pair QF legs
    const pool = [...quarterFinalists];
    this.qfLegs = {};

    let matchId = 1;
    while (pool.length > 0) {
      const idxA = Math.floor(Math.random() * pool.length);
      const teamA = pool.splice(idxA, 1)[0];
      const idxB = Math.floor(Math.random() * pool.length);
      const teamB = pool.splice(idxB, 1)[0];

      const coupleKey = `qf_match_${matchId}`;

      // Leg 1 (home A, away B)
      const leg1 = simulateMatch(
        teamA.name,
        teamB.name,
        teamA.rating,
        teamB.rating,
        teamA.name === this.draftedSquadName ? this.draftedLineup : [],
        teamB.name === this.draftedSquadName ? this.draftedLineup : [],
        teamA.starPlayers,
        teamB.starPlayers,
        `Quarter-Finals Leg 1`,
        teamA.name === this.draftedSquadName ? this.draftedLineupMap : undefined,
        teamB.name === this.draftedSquadName ? this.draftedLineupMap : undefined
      );

      // Leg 2 (home B, away A)
      const leg2 = simulateMatch(
        teamB.name,
        teamA.name,
        teamB.rating,
        teamA.rating,
        teamB.name === this.draftedSquadName ? this.draftedLineup : [],
        teamA.name === this.draftedSquadName ? this.draftedLineup : [],
        teamB.starPlayers,
        teamA.starPlayers,
        `Quarter-Finals Leg 2`,
        teamB.name === this.draftedSquadName ? this.draftedLineupMap : undefined,
        teamA.name === this.draftedSquadName ? this.draftedLineupMap : undefined
      );

      this.qfLegs[coupleKey] = [leg1, leg2];
      matchId++;

      // Populate players stats
      this.accumulatePlayerStats(leg1, this.allTeams.find((x) => x.name === teamA.name)!, this.allTeams.find((x) => x.name === teamB.name)!);
      this.accumulatePlayerStats(leg2, this.allTeams.find((x) => x.name === teamB.name)!, this.allTeams.find((x) => x.name === teamA.name)!);
    }
  }

  // Draw and perform Semi-Final rounds
  public playSemiFinals() {
    interface QualifiedTeam {
      name: string;
      rating: number;
      starPlayers: string[];
    }

    const sfTeams: QualifiedTeam[] = [];

    // Solve Quarter-Final scores
    Object.entries(this.qfLegs).forEach(([coupleKey, legs]) => {
      let winner = "";
      if (this.tournamentMode === "worldcup") {
        const match = legs[0];
        winner = match.homeScore > match.awayScore ? match.homeTeam : match.awayTeam;
      } else {
        const leg1 = legs[0];
        const leg2 = legs[1];

        const teamA = leg1.homeTeam;
        const teamB = leg1.awayTeam;

        const aggA = leg1.homeScore + leg2.awayScore;
        const aggB = leg1.awayScore + leg2.homeScore;

        if (aggA > aggB) {
          winner = teamA;
        } else if (aggB > aggA) {
          winner = teamB;
        } else {
          winner = Math.random() > 0.5 ? teamA : teamB;
        }
      }

      const winnerMeta = this.allTeams.find((t) => t.name === winner);
      if (winnerMeta) {
        sfTeams.push({
          name: winnerMeta.name,
          rating: winnerMeta.rating,
          starPlayers: winnerMeta.starPlayers,
        });
      }
    });

    // Pair Semi-Finals
    this.sfLegs = {};
    const couple1 = [sfTeams[0], sfTeams[1]];
    const couple2 = [sfTeams[2], sfTeams[3]];

    const runSfCouple = (tA: QualifiedTeam, tB: QualifiedTeam, idx: number) => {
      if (!tA || !tB) return;

      if (this.tournamentMode === "worldcup") {
        const matchResult = simulateMatch(
          tA.name,
          tB.name,
          tA.rating,
          tB.rating,
          tA.name === this.draftedSquadName ? this.draftedLineup : [],
          tB.name === this.draftedSquadName ? this.draftedLineup : [],
          tA.starPlayers,
          tB.starPlayers,
          "Semi-Finals",
          tA.name === this.draftedSquadName ? this.draftedLineupMap : undefined,
          tB.name === this.draftedSquadName ? this.draftedLineupMap : undefined
        );

        if (matchResult.homeScore === matchResult.awayScore) {
          const homeWins = Math.random() > 0.5;
          if (homeWins) matchResult.homeScore += 1;
          else matchResult.awayScore += 1;

          matchResult.scoreEvents.push({
            minute: 120,
            type: "GOAL",
            playerName: homeWins ? matchResult.homeTeam : matchResult.awayTeam,
            team: homeWins ? "home" : "away",
            description: `🏆 PENALTY SHOOTOUT RESOLUTION! ${homeWins ? matchResult.homeTeam : matchResult.awayTeam} win the shootout to advance to the Grand Final!`
          });
        }

        this.sfLegs[`sf_match_${idx}`] = [matchResult];
        this.fixtures.push(matchResult);

        this.accumulatePlayerStats(matchResult, this.allTeams.find((x) => x.name === tA.name)!, this.allTeams.find((x) => x.name === tB.name)!);
      } else {
        const l1 = simulateMatch(
          tA.name,
          tB.name,
          tA.rating,
          tB.rating,
          tA.name === this.draftedSquadName ? this.draftedLineup : [],
          tB.name === this.draftedSquadName ? this.draftedLineup : [],
          tA.starPlayers,
          tB.starPlayers,
          `Semi-Finals Leg 1`,
          tA.name === this.draftedSquadName ? this.draftedLineupMap : undefined,
          tB.name === this.draftedSquadName ? this.draftedLineupMap : undefined
        );

        const l2 = simulateMatch(
          tB.name,
          tA.name,
          tB.rating,
          tA.rating,
          tB.name === this.draftedSquadName ? this.draftedLineup : [],
          tA.name === this.draftedSquadName ? this.draftedLineup : [],
          tB.starPlayers,
          tA.starPlayers,
          `Semi-Finals Leg 2`,
          tB.name === this.draftedSquadName ? this.draftedLineupMap : undefined,
          tA.name === this.draftedSquadName ? this.draftedLineupMap : undefined
        );

        this.sfLegs[`sf_match_${idx}`] = [l1, l2];
        this.fixtures.push(l1, l2);

        this.accumulatePlayerStats(l1, this.allTeams.find((x) => x.name === tA.name)!, this.allTeams.find((x) => x.name === tB.name)!);
        this.accumulatePlayerStats(l2, this.allTeams.find((x) => x.name === tB.name)!, this.allTeams.find((x) => x.name === tA.name)!);
      }
    };

    runSfCouple(couple1[0], couple1[1], 1);
    runSfCouple(couple2[0], couple2[1], 2);
  }

  // Draw and simulate Neutral Venue single-legged Final
  public playFinal(): Match {
    interface QualifiedTeam {
      name: string;
      rating: number;
      starPlayers: string[];
    }

    const finalTeams: QualifiedTeam[] = [];

    // Solve Semi-Finals
    Object.entries(this.sfLegs).forEach(([coupleKey, legs]) => {
      let winner = "";
      if (this.tournamentMode === "worldcup") {
        const match = legs[0];
        winner = match.homeScore > match.awayScore ? match.homeTeam : match.awayTeam;
      } else {
        const leg1 = legs[0];
        const leg2 = legs[1];

        const teamA = leg1.homeTeam;
        const teamB = leg1.awayTeam;

        const aggA = leg1.homeScore + leg2.awayScore;
        const aggB = leg1.awayScore + leg2.homeScore;

        if (aggA > aggB) {
          winner = teamA;
        } else if (aggB > aggA) {
          winner = teamB;
        } else {
          winner = Math.random() > 0.5 ? teamA : teamB;
        }
      }

      const winnerMeta = this.allTeams.find((t) => t.name === winner);
      if (winnerMeta) {
        finalTeams.push({
          name: winnerMeta.name,
          rating: winnerMeta.rating,
          starPlayers: winnerMeta.starPlayers,
        });
      }
    });

    const fA = finalTeams[0];
    const fB = finalTeams[1];

    const finalMatch = simulateMatch(
      fA.name,
      fB.name,
      fA.rating,
      fB.rating,
      fA.name === this.draftedSquadName ? this.draftedLineup : [],
      fB.name === this.draftedSquadName ? this.draftedLineup : [],
      fA.starPlayers,
      fB.starPlayers,
      this.tournamentMode === "worldcup" ? "Lusail Stadium World Cup Final" : "Wembley Stadium Champions League Final",
      fA.name === this.draftedSquadName ? this.draftedLineupMap : undefined,
      fB.name === this.draftedSquadName ? this.draftedLineupMap : undefined
    );

    // Dynamic penalty shootout resolution if score draw in neutral Final
    if (finalMatch.homeScore === finalMatch.awayScore) {
      const teamAWins = Math.random() > 0.5;
      const penA = teamAWins ? 5 : 4;
      const penB = teamAWins ? 4 : 5;

      finalMatch.scoreEvents.push({
        minute: 120,
        type: "GOAL",
        playerName: `${teamAWins ? fA.name : fB.name} Winner`,
        team: teamAWins ? "home" : "away",
        description: this.tournamentMode === "worldcup"
          ? `🏆 PENALTY SHOOTOUT RESOLUTON! ${fA.name} [ ${penA} - ${penB} ] ${fB.name}! ${teamAWins ? fA.name : fB.name} are crowned World Cup Champions!`
          : `🏆 PENALTY SHOOTOUT RESOLUTON! ${fA.name} [ ${penA} - ${penB} ] ${fB.name}! ${teamAWins ? fA.name : fB.name} are crowned Champions of Europe!`
      });

      // Avoid exact scores in record
      if (teamAWins) finalMatch.homeScore += 1;
      else finalMatch.awayScore += 1;
    } else {
      // Announce direct champion
      const victor = finalMatch.homeScore > finalMatch.awayScore ? fA.name : fB.name;
      finalMatch.scoreEvents.push({
        minute: 90,
        type: "GOAL",
        playerName: victor,
        team: finalMatch.homeScore > finalMatch.awayScore ? "home" : "away",
        description: this.tournamentMode === "worldcup"
          ? `🏆 FULL TIME IN LUSAIL! ${victor} defeat their opponents to conquer the glorious Global World Cup!`
          : `🏆 FULL TIME AT WEMBLEY! ${victor} defeat their opponents to conquer the prestigious UEFA Champions League!`
      });
    }

    this.finalFixture = finalMatch;
    this.accumulatePlayerStats(finalMatch, this.allTeams.find((x) => x.name === fA.name)!, this.allTeams.find((x) => x.name === fB.name)!);

    return finalMatch;
  }

  // Checks user's custom team's farthest tournament position reached
  public getUserFarthestStageReached(): { stageReached: string; wins: number; draws: number; losses: number } {
    let stageReached = "Group Stage";
    let wins = 0;
    let draws = 0;
    let losses = 0;

    // Count stats across all simulated matches the user participated in
    this.fixtures.forEach((f) => {
      if (!f.isSimulated) return;
      const isHome = f.homeTeam === this.draftedSquadName;
      const isAway = f.awayTeam === this.draftedSquadName;
      if (!isHome && !isAway) return;

      const userG = isHome ? f.homeScore : f.awayScore;
      const oppG = isHome ? f.awayScore : f.homeScore;

      if (userG > oppG) wins++;
      else if (userG < oppG) losses++;
      else draws++;
    });

    let reachedGS = false;
    let reachedR16 = false;
    let reachedQF = false;
    let reachedSF = false;
    let reachedF = false;
    let wonFinal = false;

    this.fixtures.forEach((f) => {
      const isHome = f.homeTeam === this.draftedSquadName;
      const isAway = f.awayTeam === this.draftedSquadName;
      if (!isHome && !isAway) return;

      if (f.stage.includes("Matchday")) {
        reachedGS = true;
      }
      if (f.stage.includes("Round of 16")) {
        reachedR16 = true;
      }
      if (f.stage.includes("Quarter-Final")) {
        reachedQF = true;
      }
      if (f.stage.includes("Semi-Final")) {
        reachedSF = true;
      }
      if (f.stage.includes("Final")) {
        reachedF = true;
        if (f.isSimulated) {
          const won = (isHome && f.homeScore > f.awayScore) || (isAway && f.awayScore > f.homeScore);
          if (won) wonFinal = true;
        }
      }
    });

    if (wonFinal) {
      stageReached = "Champion";
    } else if (reachedF) {
      stageReached = "Finalist";
    } else if (reachedSF) {
      stageReached = "Semi-Finalist";
    } else if (reachedQF) {
      stageReached = "Quarter-Finalist";
    } else if (reachedR16) {
      stageReached = "Round of 16";
    } else {
      stageReached = "Group Stage";
    }

    return { stageReached, wins, draws, losses };
  }
}
export default ChampionsLeagueTournament;
