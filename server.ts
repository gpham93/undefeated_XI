import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { PLAYERS } from "./src/data/players";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.use(express.json());

// In-memory cache for resolved player images
const playerImageCache: Record<string, string> = {};

// Helper: Search TheSportsDB for a high-quality player action/cutout or picture
async function searchTheSportsDBImage(playerName: string): Promise<string | null> {
  try {
    // Standard public test key '3' for search queries
    const formattedName = encodeURIComponent(playerName.trim());
    const searchUrl = `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${formattedName}`;
    const response = await fetch(searchUrl);
    if (!response.ok) return null;

    const data: any = await response.json();
    if (data && data.player && data.player.length > 0) {
      const player = data.player[0];
      // Prefer strCutout (beautiful dynamic transparent cutout pngs)
      if (player.strCutout) {
        return player.strCutout;
      }
      // Fallback to strThumb
      if (player.strThumb) {
        return player.strThumb;
      }
    }
    return null;
  } catch (err) {
    console.error(`Failed to retrieve TheSportsDB image for ${playerName}:`, err);
    return null;
  }
}

// Helper: Query Wikipedia search and Page Images API
async function searchWikipediaImage(playerName: string): Promise<string | null> {
  try {
    // 1. Search Wikipedia for player article name (prioritize results matching "football" or "soccer" to get accurate pages)
    const searchQuery = encodeURIComponent(`${playerName} football`);
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchQuery}&format=json&origin=*`;
    
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return null;
    
    const searchData: any = await searchRes.json();
    let wikiTitle = "";

    if (searchData.query?.search && searchData.query.search.length > 0) {
      wikiTitle = searchData.query.search[0].title;
    } else {
      // Retry with name only in case they are ultra famous
      const searchUrl2 = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(playerName)}&format=json&origin=*`;
      const searchRes2 = await fetch(searchUrl2);
      if (searchRes2.ok) {
        const searchData2: any = await searchRes2.json();
        if (searchData2.query?.search && searchData2.query.search.length > 0) {
          wikiTitle = searchData2.query.search[0].title;
        }
      }
    }

    if (!wikiTitle) return null;

    // 2. Query pageimages for Resolved Title
    const imageQueryUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiTitle)}&prop=pageimages&pithumbsize=500&format=json&origin=*`;
    const imageRes = await fetch(imageQueryUrl);
    if (!imageRes.ok) return null;

    const imageData: any = await imageRes.json();
    if (imageData.query?.pages) {
      const pages = imageData.query.pages;
      const pageId = Object.keys(pages)[0];
      if (pageId && pages[pageId]?.thumbnail?.source) {
        return pages[pageId].thumbnail.source;
      }
    }
    return null;
  } catch (err) {
    console.error(`Failed to retrieve Wikipedia image for ${playerName}:`, err);
    return null;
  }
}

// API: Fetch and proxy player image from sports databases or Wikipedia to prevent browser hotlink blocks
app.get("/api/player-image", async (req, res) => {
  const name = req.query.name as string;
  const pos = req.query.pos as string;

  if (!name) {
    return res.status(400).send("Player name query parameter 'name' is required.");
  }

  try {
    let imageUrl = playerImageCache[name];

    if (!imageUrl) {
      // 1. Try high quality TheSportsDB first (transparencies, cutouts)
      const sportsDbUrl = await searchTheSportsDBImage(name);
      if (sportsDbUrl) {
        imageUrl = sportsDbUrl;
      } else {
        // 2. Fallback to Wikipedia
        const wikiUrl = await searchWikipediaImage(name);
        if (wikiUrl) {
          imageUrl = wikiUrl;
        } else {
          // 3. Unsplash placeholders
          let fallbackUrl = "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=350&auto=format&fit=crop"; // ST / LW / RW (striker kicking jumps)
          if (pos === "GK") {
            fallbackUrl = "https://images.unsplash.com/photo-1512719994953-eabf50865dfa?q=80&w=350&auto=format&fit=crop"; // GK (flying goalie diving save)
          } else if (pos === "CB" || pos === "LB" || pos === "RB") {
            fallbackUrl = "https://images.unsplash.com/photo-1431324155629-1a6edd1dec8d?q=80&w=350&auto=format&fit=crop"; // CB / LB / RB (dynamic slide tackle)
          } else if (pos === "CM" || pos === "LM" || pos === "RM") {
            fallbackUrl = "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=350&auto=format&fit=crop"; // CM / LM / RM (speed dribbling sprint)
          }
          imageUrl = fallbackUrl;
        }
      }
      playerImageCache[name] = imageUrl;
    }

    if (imageUrl.includes("unsplash.com")) {
      // Unsplash images allow direct client hotlinking and do not need server proxying.
      return res.redirect(imageUrl);
    }

    // Fetch and proxy TheSportsDB or Wikipedia images with a legitimate user-agent
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) DynastyDraftLegends/1.0",
      }
    });

    if (!response.ok) {
      console.warn(`Could not proxy image directly for ${name} (${response.status}) from source. Redirecting client directly.`);
      return res.redirect(imageUrl);
    }

    const contentType = response.headers.get("Content-Type") || "image/png";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 1 day

    const arrayBuffer = await response.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.warn(`Graceful warning proxying image for ${name}:`, err);
    // Silent failover to dynamic stadium fallback redirs
    return res.redirect("https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=300");
  }
});

// Helper: Search TheSportsDB for club logo/crest
async function searchTheSportsDBClubBadge(clubName: string): Promise<string | null> {
  try {
    const formattedName = encodeURIComponent(clubName.trim());
    const searchUrl = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${formattedName}`;
    const response = await fetch(searchUrl);
    if (!response.ok) return null;

    const data: any = await response.json();
    if (data && data.teams && data.teams.length > 0) {
      const team = data.teams[0];
      if (team.strTeamBadge) {
        return team.strTeamBadge;
      }
    }
    return null;
  } catch (err) {
    console.error(`Failed to retrieve TheSportsDB club badge for ${clubName}:`, err);
    return null;
  }
}

// Helper: Search Wikipedia for club logo/crest
async function searchWikipediaClubBadge(clubName: string): Promise<string | null> {
  try {
    const searchQuery = encodeURIComponent(`${clubName} football club logo`);
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchQuery}&format=json&origin=*`;
    
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return null;
    
    const searchData: any = await searchRes.json();
    let wikiTitle = "";

    if (searchData.query?.search && searchData.query.search.length > 0) {
      wikiTitle = searchData.query.search[0].title;
    } else {
      const fallbackQuery = encodeURIComponent(`${clubName} football club`);
      const searchRes2 = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${fallbackQuery}&format=json&origin=*`);
      if (searchRes2.ok) {
        const searchData2: any = await searchRes2.json();
        if (searchData2.query?.search && searchData2.query.search.length > 0) {
          wikiTitle = searchData2.query.search[0].title;
        }
      }
    }

    if (!wikiTitle) return null;

    const imageQueryUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiTitle)}&prop=pageimages&pithumbsize=200&format=json&origin=*`;
    const imageRes = await fetch(imageQueryUrl);
    if (!imageRes.ok) return null;

    const imageData: any = await imageRes.json();
    if (imageData.query?.pages) {
      const pages = imageData.query.pages;
      const pageId = Object.keys(pages)[0];
      if (pageId && pages[pageId]?.thumbnail?.source) {
        return pages[pageId].thumbnail.source;
      }
    }
    return null;
  } catch (err) {
    console.error(`Failed to retrieve Wikipedia logo for club ${clubName}:`, err);
    return null;
  }
}

// In-memory cache for resolved club badges
const clubBadgeCache: Record<string, string> = {};

const STATIC_CLUB_BADGES: Record<string, string> = {
  "Real Madrid": "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
  "Barcelona": "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
  "FC Barcelona": "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
  "Bayern Munich": "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
  "Manchester United": "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
  "Chelsea": "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
  "Atlético Madrid": "https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg",
  "Arsenal": "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
  "Manchester City": "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
  "Bayer Leverkusen": "https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg",
  "Juventus": "https://upload.wikimedia.org/wikipedia/commons/b/bc/Juventus_FC_2017_icon_%28black%29.svg",
  "AC Milan": "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg",
  "Inter Milan": "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021_Logo.svg",
  "Benfica": "https://upload.wikimedia.org/wikipedia/en/a/a2/SL_Benfica_logo.svg",
  "Ajax": "https://upload.wikimedia.org/wikipedia/en/7/79/Ajax_Amsterdam.svg",
  "Galatasaray": "https://upload.wikimedia.org/wikipedia/commons/3/31/Galatasaray_Star_Logo.svg",
  "Napoli": "https://upload.wikimedia.org/wikipedia/commons/2/2d/SSC_Napoli_2024.svg",
  "PSG": "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
  "Sporting CP": "https://upload.wikimedia.org/wikipedia/en/3/3e/Sporting_Clube_de_Portugal.svg",
  "Liverpool": "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
  "Aston Villa": "https://upload.wikimedia.org/wikipedia/en/f/f9/Aston_Villa_FC_crest_%282016%29.svg",
  "Nottingham Forest": "https://upload.wikimedia.org/wikipedia/en/e/e5/Nottingham_Forest_F.C._logo.svg",
  "Leeds United": "https://upload.wikimedia.org/wikipedia/en/5/54/Leeds_United_F.C._logo.svg",
  "Rangers": "https://upload.wikimedia.org/wikipedia/en/4/4b/Rangers_FC.svg",
  "Tottenham": "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",
  "Valencia": "https://upload.wikimedia.org/wikipedia/en/1/1d/Valencia_Cf_logo.svg",
  "Everton": "https://upload.wikimedia.org/wikipedia/en/7/7c/Everton_FC_logo.svg",
  "West Ham": "https://upload.wikimedia.org/wikipedia/en/c/c2/West_Ham_United_FC_logo.svg",
  "Dundee United": "https://upload.wikimedia.org/wikipedia/en/2/27/Dundee_United_F.C._logo.svg",
  "Derby County": "https://upload.wikimedia.org/wikipedia/en/4/4a/Derby_County_FC.svg",
  "Malaga CF": "https://upload.wikimedia.org/wikipedia/en/a/ae/M%C3%A1laga_CF.svg",
  "Shakhtar Donetsk": "https://upload.wikimedia.org/wikipedia/en/a/a1/FC_Shakhtar_Donetsk.svg",
  "Botafogo": "https://upload.wikimedia.org/wikipedia/commons/c/cb/Botafogo_de_Futebol_e_Regatas_logo.svg",
  "Santos": "https://upload.wikimedia.org/wikipedia/commons/3/35/Santos_FC_logo.svg"
};

// API: Fetch and proxy club badge image
app.get("/api/club-badge", async (req, res) => {
  const clubName = req.query.club as string;

  if (!clubName) {
    return res.status(400).send("Club query parameter is required.");
  }

  // Handle cached dynamic inline SVGs
  if (clubBadgeCache[clubName] && clubBadgeCache[clubName].startsWith("<svg")) {
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("x-badge-found", "false");
    return res.send(clubBadgeCache[clubName]);
  }

  try {
    let badgeUrl = clubBadgeCache[clubName];

    if (!badgeUrl) {
      // Check static mapping first
      badgeUrl = STATIC_CLUB_BADGES[clubName];
      if (!badgeUrl) {
        const lowerClub = clubName.toLowerCase().trim();
        const foundKey = Object.keys(STATIC_CLUB_BADGES).find(
          key => key.toLowerCase() === lowerClub
        );
        if (foundKey) {
          badgeUrl = STATIC_CLUB_BADGES[foundKey];
        }
      }

      if (badgeUrl) {
        clubBadgeCache[clubName] = badgeUrl;
      } else {
        // 1. Try high quality TheSportsDB first (transparencies, cutouts)
        const sportsDbBadge = await searchTheSportsDBClubBadge(clubName);
        if (sportsDbBadge) {
          badgeUrl = sportsDbBadge;
          clubBadgeCache[clubName] = badgeUrl;
        } else {
          // 2. Fallback to Wikipedia
          const wikiBadge = await searchWikipediaClubBadge(clubName);
          if (wikiBadge) {
            badgeUrl = wikiBadge;
            clubBadgeCache[clubName] = badgeUrl;
          }
        }
      }
    }

    if (badgeUrl) {
      const response = await fetch(badgeUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) DynastyDraftLegends/1.0",
        }
      });
      if (response.ok) {
        const contentType = response.headers.get("Content-Type") || "image/png";
        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 1 day
        res.setHeader("x-badge-found", "true");
        const arrayBuffer = await response.arrayBuffer();
        return res.send(Buffer.from(arrayBuffer));
      }
    }
  } catch (err) {
    console.error(`Error proxying badge for ${clubName}:`, err);
  }

  // Fallback: Generate a beautiful, custom dynamic SVG badge on the fly!
  const initials = clubName
    .split(/[\s\-_]+/)
    .map(word => word[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .substring(0, 3) || "FC";

  // Use a nice hash to choose from a few elegant background color stops for variety!
  let hash = 0;
  for (let i = 0; i < clubName.length; i++) {
    hash = clubName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    { start: "#0f172a", end: "#1e293b", accent: "#fbbf24" }, // Slate / Amber Gold
    { start: "#1e1b4b", end: "#312e81", accent: "#22d3ee" }, // Indigo / Cyan Laser
    { start: "#3b0764", end: "#1d003a", accent: "#ec4899" }, // Dark Purple / Fuchsia
    { start: "#064e3b", end: "#022c22", accent: "#34d399" }, // Deep Emerald / Mint
    { start: "#450a0a", end: "#1c0000", accent: "#f87171" }, // Midnight Crimson / Coral
    { start: "#1c1917", end: "#0c0a09", accent: "#fbbf24" }, // Stone / Chrome Gold
  ];
  const colorSet = colors[Math.abs(hash) % colors.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100" height="120">
  <defs>
    <linearGradient id="shieldGrad_${Math.abs(hash)}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colorSet.start}" />
      <stop offset="100%" stop-color="${colorSet.end}" />
    </linearGradient>
  </defs>
  <!-- Shield Outline Base -->
  <path d="M50 5 L90 18 V80 C90 98 50 115 50 115 C50 115 10 98 10 80 V18 Z" fill="url(#shieldGrad_${Math.abs(hash)})" stroke="${colorSet.accent}" stroke-width="2.5" stroke-linejoin="round" />
  <!-- Inner Rim lines -->
  <path d="M50 12 L82 22 V76 C82 90 50 105 50 105 C50 105 18 90 18 76 V22 Z" fill="none" stroke="${colorSet.accent}" stroke-opacity="0.35" stroke-width="1" stroke-dasharray="3 2" />
  <!-- Star -->
  <polygon points="50,22 53,28 60,29 55,34 56,41 50,37 44,41 45,34 40,29 47,28" fill="${colorSet.accent}" />
  <!-- Initials dynamic text -->
  <text x="50" y="74" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" text-anchor="middle" fill="#ffffff" letter-spacing="0.5">${initials}</text>
  <!-- Small details -->
  <text x="50" y="93" font-family="system-ui, -apple-system, sans-serif" font-size="7.5" font-weight="700" text-anchor="middle" fill="#94a3b8" letter-spacing="1.5" fill-opacity="0.75">EST. 2026</text>
</svg>`;

  clubBadgeCache[clubName] = svg;
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("x-badge-found", "false");
  return res.send(svg);
});

// Helper: Generate a highly realistic dynamic/offline player card
function offlineGeneratePlayer(playerNameInput: string): any {
  const normInput = playerNameInput.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // 1. Try to find a fuzzy match in the existing offline PLAYERS database
  const matchedPlayer = PLAYERS.find(p => {
    const normName = p.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normShort = p.shortName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return normName.includes(normInput) || normInput.includes(normName) || normShort.includes(normInput) || normInput.includes(normShort);
  });

  if (matchedPlayer) {
    console.log(`Pristine offline match found: "${matchedPlayer.name}"`);
    const cleanSlug = matchedPlayer.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_");
      
    return {
      id: `scouted_${cleanSlug}_${Math.floor(1000 + Math.random() * 9000)}`,
      name: matchedPlayer.name,
      shortName: matchedPlayer.shortName,
      era: matchedPlayer.era,
      primaryPosition: matchedPlayer.primaryPosition,
      alternativePositions: matchedPlayer.alternativePositions || [],
      originalRating: matchedPlayer.originalRating,
      rating: matchedPlayer.originalRating,
      stats: { ...matchedPlayer.stats },
      club: matchedPlayer.club,
      nation: matchedPlayer.nation,
      imageTheme: matchedPlayer.imageTheme || "#c5a059",
      description: matchedPlayer.description
    };
  }

  // 2. No direct match - procedurally construct a highly tailored player card based on name properties (deterministic hash)
  console.log(`No direct match. Creating realistic procedural player card for "${playerNameInput}"`);
  
  let hash = 0;
  for (let i = 0; i < normInput.length; i++) {
    hash = (hash << 5) - hash + normInput.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);

  const words = playerNameInput.trim().split(/\s+/);
  const capitalizedWords = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  const fullName = capitalizedWords.join(" ");
  const shortName = capitalizedWords[capitalizedWords.length - 1] || "Player";

  // Guess position from keywords
  let primaryPosition = "ST";
  const posInput = normInput;
  if (/gk|keeper|goal/.test(posInput)) primaryPosition = "GK";
  else if (/def|back|cb/.test(posInput)) primaryPosition = "CB";
  else if (/left.*back|lb/.test(posInput)) primaryPosition = "LB";
  else if (/right.*back|rb/.test(posInput)) primaryPosition = "RB";
  else if (/wing|lw/.test(posInput)) primaryPosition = "LW";
  else if (/wing|rw/.test(posInput)) primaryPosition = "RW";
  else if (/mid|cm|center.*mid/.test(posInput)) primaryPosition = "CM";
  else if (/left.*mid|lm/.test(posInput)) primaryPosition = "LM";
  else if (/right.*mid|rm/.test(posInput)) primaryPosition = "RM";
  else if (/st|striker|forward|cf|attack/.test(posInput)) primaryPosition = "ST";
  else {
    const POSITIONS = ["ST", "LW", "RW", "CM", "CB", "LB", "RB", "GK", "LM", "RM"];
    primaryPosition = POSITIONS[hash % POSITIONS.length];
  }

  // Alternative positions
  let alternativePositions: string[] = [];
  if (primaryPosition === "ST") alternativePositions = ["LW", "RW"];
  else if (primaryPosition === "LW") alternativePositions = ["RW", "LM"];
  else if (primaryPosition === "RW") alternativePositions = ["LW", "RM"];
  else if (primaryPosition === "CM") alternativePositions = ["RM", "LM"];
  else if (primaryPosition === "CB") alternativePositions = ["RB", "LB"];
  else if (primaryPosition === "LB") alternativePositions = ["LM", "CB"];
  else if (primaryPosition === "RB") alternativePositions = ["RM", "CB"];

  // Historic eras mappings
  let era = "Present Era (2020s)";
  if (/pele|maradona|cruyff|best|yashin|puskas|garrincha|charlton|moore/.test(normInput)) {
    era = "Classic Era (1950s-1980s)";
  } else if (/zidane|ronaldo|henry|beckham|maldini|kahn|figo|nedved|shearer|schmeichel|bergkamp/.test(normInput)) {
    if (/cristiano|cr7/.test(normInput)) {
      era = "Modern Golden Era (2010s)";
    } else {
      era = "Legend Era (1990s-2000s)";
    }
  } else if (/messi|cristiano|neymar|iniesta|xavi|suarez|bale|robben|ribery|ibrahimovic|modric/.test(normInput)) {
    era = "Modern Golden Era (2010s)";
  }

  // Rating scaled realistically (84 - 94)
  const originalRating = 84 + (hash % 11);

  // Stats generation tailored to positions and rating
  let stats = { pac: 80, sho: 80, pas: 80, dri: 80, def: 50, phy: 80 };
  const ratingFactor = originalRating - 80;

  if (primaryPosition === "GK") {
    stats = {
      pac: 80 + Math.floor(ratingFactor * 0.8), // DIVing
      sho: 80 + Math.floor(ratingFactor * 0.6), // HANdling
      pas: 75 + Math.floor(ratingFactor * 0.5), // KICking
      dri: 83 + Math.floor(ratingFactor * 0.8), // REFlexes
      def: 45 + Math.floor(ratingFactor * 0.3), // SPeD
      phy: 82 + Math.floor(ratingFactor * 0.7), // POSitioning
    };
  } else if (["ST", "LW", "RW"].includes(primaryPosition)) {
    stats = {
      pac: 84 + (hash % 10) + Math.floor(ratingFactor * 0.5),
      sho: 82 + (hash % 12) + Math.floor(ratingFactor * 0.6),
      pas: 72 + (hash % 13) + Math.floor(ratingFactor * 0.4),
      dri: 80 + (hash % 14) + Math.floor(ratingFactor * 0.5),
      def: 30 + (hash % 20),
      phy: 68 + (hash % 15) + Math.floor(ratingFactor * 0.3),
    };
  } else if (["CM", "LM", "RM"].includes(primaryPosition)) {
    stats = {
      pac: 75 + (hash % 12) + Math.floor(ratingFactor * 0.3),
      sho: 70 + (hash % 15) + Math.floor(ratingFactor * 0.4),
      pas: 82 + (hash % 12) + Math.floor(ratingFactor * 0.6),
      dri: 78 + (hash % 15) + Math.floor(ratingFactor * 0.5),
      def: 60 + (hash % 20) + Math.floor(ratingFactor * 0.4),
      phy: 70 + (hash % 15) + Math.floor(ratingFactor * 0.4),
    };
  } else {
    // CB, LB, RB defending posts
    stats = {
      pac: 74 + (hash % 14) + Math.floor(ratingFactor * 0.4),
      sho: 45 + (hash % 20),
      pas: 68 + (hash % 15) + Math.floor(ratingFactor * 0.3),
      dri: 70 + (hash % 15) + Math.floor(ratingFactor * 0.3),
      def: 82 + (hash % 12) + Math.floor(ratingFactor * 0.6),
      phy: 80 + (hash % 13) + Math.floor(ratingFactor * 0.5),
    };
  }

  // Cap stats strictly between [35, 99]
  const cap = (val: number) => Math.min(Math.max(val, 35), 99);
  stats = {
    pac: cap(stats.pac),
    sho: cap(stats.sho),
    pas: cap(stats.pas),
    dri: cap(stats.dri),
    def: cap(stats.def),
    phy: cap(stats.phy),
  };

  const CLUBS = [
    "Real Madrid", "Barcelona", "Manchester City", "Arsenal", "Liverpool", 
    "Bayern Munich", "Juventus", "AC Milan", "PSG", "Inter Milan", "Manchester United", "Borussia Dortmund"
  ];
  const club = CLUBS[hash % CLUBS.length];

  const NATIONS = [
    "England", "France", "Brazil", "Spain", "Norway", "Argentina", 
    "Germany", "Italy", "Netherlands", "Portugal", "Belgium", "Croatia"
  ];
  const nation = NATIONS[(hash + 3) % NATIONS.length];

  const THEMES = ["#c5a059", "#1e3a8a", "#991b1b", "#06b6d4", "#047857", "#4338ca", "#b45309"];
  const imageTheme = THEMES[hash % THEMES.length];

  const description = `Scouted via the DynastyDraft scouting engine. A formidable ${primaryPosition} who matches high performance tactical profiles with a rating of ${originalRating}.`;

  const cleanSlug = fullName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_");

  return {
    id: `scouted_${cleanSlug}_${Math.floor(1000 + Math.random() * 9000)}`,
    name: fullName,
    shortName: shortName,
    era: era,
    primaryPosition: primaryPosition as any,
    alternativePositions: alternativePositions as any[],
    originalRating: originalRating,
    rating: originalRating,
    stats: stats,
    club: club,
    nation: nation,
    imageTheme: imageTheme,
    description: description
  };
}

// API: Scout a player dynamically using Gemini with procedural offline fallback
app.post("/api/scout", async (req, res) => {
  const { playerName } = req.body;
  
  if (!playerName || typeof playerName !== "string") {
    return res.status(400).json({ error: "Player name is required and must be a string." });
  }

  // 1. FIRST: Attempt to find a high-quality preloaded match in our expanded offline static soccer database
  try {
    const normInput = playerName.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const matchedPlayer = PLAYERS.find(p => {
      const normName = p.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const normShort = p.shortName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normName === normInput || normShort === normInput || normName.includes(normInput) || normInput.includes(normName) || normShort.includes(normInput) || normInput.includes(normShort);
    });

    if (matchedPlayer) {
      console.log(`Pristine offline database scout match found for: "${matchedPlayer.name}"`);
      const cleanSlug = matchedPlayer.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "_")
        .replace(/_+/g, "_");
        
      const finalPlayer = {
        id: `scouted_${cleanSlug}_${Math.floor(1000 + Math.random() * 9000)}`,
        name: matchedPlayer.name,
        shortName: matchedPlayer.shortName,
        era: matchedPlayer.era,
        primaryPosition: matchedPlayer.primaryPosition,
        alternativePositions: matchedPlayer.alternativePositions || [],
        originalRating: matchedPlayer.originalRating,
        rating: matchedPlayer.originalRating,
        stats: { ...matchedPlayer.stats },
        club: matchedPlayer.club,
        nation: matchedPlayer.nation,
        imageTheme: matchedPlayer.imageTheme || "#c5a059",
        description: matchedPlayer.description
      };
      return res.json({ player: finalPlayer });
    }
  } catch (lookupErr) {
    console.error("Offline static database lookup error:", lookupErr);
  }

  // 2. SECOND: No direct match - try live Gemini API or fall back gracefully to procedural generation
  try {
    console.log(`No direct static match. Scouting player via Gemini: "${playerName}"`);
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate actual, realistic Ultimate Team card attributes, clubs representation, positions, and history stats for the football player matching search request: "${playerName}".`,
      config: {
        systemInstruction: "You are an expert football scout specialized in generating authentic player attributes, cards, stats, and records in exact FUT card values and UEFA Champions League history. Make stats realistic—for example, current world-class stars should have high-80s or 90s ratings, whereas older players or prospects should be scaled appropriately. Ensure there is solid reasoning behind the stats.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Full name of the player (e.g. Bukayo Saka)" },
            shortName: { type: Type.STRING, description: "Display name on a jersey/card (e.g. Saka)" },
            era: { 
              type: Type.STRING, 
              enum: [
                "Classic Era (1950s-1980s)",
                "Legend Era (1990s-2000s)",
                "Modern Golden Era (2010s)",
                "Present Era (2020s)"
              ],
              description: "The historical play era they belong to. Map active players after 2019 to 'Present Era (2020s)'. Map 2010s peaks to 'Modern Golden Era (2010s)'."
            },
            primaryPosition: { 
              type: Type.STRING, 
              enum: ["GK", "LB", "CB", "RB", "LM", "CM", "RM", "LW", "ST", "RW"],
              description: "Their absolute main role/position." 
            },
            alternativePositions: {
              type: Type.ARRAY,
              items: { 
                type: Type.STRING,
                enum: ["GK", "LB", "CB", "RB", "LM", "CM", "RM", "LW", "ST", "RW"]
              },
              description: "List up to 2 alternative positions they can successfully play."
            },
            originalRating: { type: Type.INTEGER, description: "Authentic overall card rating between 75 and 99 (e.g., Lamine Yamal 81-85, Lionel Messi 93-94, Erling Haaland 91-92, Cole Palmer 85, Robben 89, etc)." },
            stats: {
              type: Type.OBJECT,
              properties: {
                pac: { type: Type.INTEGER, description: "Pace/velocity stat (30-99)" },
                sho: { type: Type.INTEGER, description: "Shooting/finishing stat (30-99)" },
                pas: { type: Type.INTEGER, description: "Passing stat (30-99)" },
                dri: { type: Type.INTEGER, description: "Dribbling stat (30-99)" },
                def: { type: Type.INTEGER, description: "Defending stat (30-99)" },
                phy: { type: Type.INTEGER, description: "Physical/strength stat (30-99)" },
              },
              required: ["pac", "sho", "pas", "dri", "def", "phy"]
            },
            club: { type: Type.STRING, description: "The famous football club they represent, preferably a historically prominent Champions League team (e.g. Arsenal, Real Madrid, Manchester City, Barcelona, Liverpool, Bayern Munich, Inter Milan, AC Milan, PSG)." },
            nation: { type: Type.STRING, description: "Main nationality country name (e.g. England, France, Brazil, Spain, Norway, Argentina)." },
            imageTheme: { type: Type.STRING, description: "Hex value or short aesthetic tailwind color representer for their card (e.g. '#c5a059' for gold, '#1e3a8a' for deep blue, '#991b1b' for deep red, '#ec4899', '#06b6d4', or white, gold, darkblue, emerald)." },
            description: { type: Type.STRING, description: "1-2 elegant sentences documenting their famous UCL achievements, playing style, or highlight moments." },
          },
          required: ["name", "shortName", "era", "primaryPosition", "alternativePositions", "originalRating", "stats", "club", "nation", "imageTheme", "description"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    
    // Sluggify name to prepare pristine ID
    const cleanSlug = parsedData.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accent diacritics
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_");
    
    const finalPlayer = {
      ...parsedData,
      id: `scouted_${cleanSlug}_${Math.floor(1000 + Math.random() * 9000)}`,
      rating: parsedData.originalRating, // Default live rating matches original
    };

    return res.json({ player: finalPlayer });
  } catch (err: any) {
    console.error("Gemini scouting error, falling back to local procedural generator:", err);
    try {
      const finalPlayer = offlineGeneratePlayer(playerName);
      console.log(`Successfully generated dynamic offline player card for "${playerName}":`, finalPlayer.name);
      return res.json({ player: finalPlayer });
    } catch (fallbackErr) {
      console.error("Severe: Offline generator failed:", fallbackErr);
      return res.status(500).json({ error: "Failed to generate player stats offline or online." });
    }
  }
});

// Setup Vite Dev server or Serve production assets
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Configuring Vite middleware in dev mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Legends Simulator Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
