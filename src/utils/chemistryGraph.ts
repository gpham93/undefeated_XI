import { Player, TeamChemistry, LineupSetup, Formation, Era } from "../types";
import { PLAYERS } from "../data/players";

export function getNationRegion(nation: string): string {
  const europe = [
    "Netherlands", "Germany", "Spain", "Portugal", "Northern Ireland", "France", 
    "Italy", "Belgium", "Croatia", "Poland", "England", "Scotland", "Wales", "Norway", 
    "Sweden", "Denmark", "Switzerland", "Austria", "Ukraine"
  ];
  const southAmerica = ["Brazil", "Argentina", "Uruguay", "Colombia", "Chile", "Ecuador", "Peru", "Paraguay"];
  const africa = ["Egypt", "Senegal", "Morocco", "Algeria", "Nigeria", "Ghana", "Cameroon", "Ivory Coast"];
  const northAmerica = ["Canada", "USA", "Mexico", "United States"];
  const asiaPlus = ["South Korea", "Japan", "Australia", "Saudi Arabia", "Iran"];

  const cleanNation = (nation || "").trim().toLowerCase();
  if (europe.some(n => cleanNation.includes(n.toLowerCase()))) return "Europe";
  if (southAmerica.some(n => cleanNation.includes(n.toLowerCase()))) return "South America";
  if (africa.some(n => cleanNation.includes(n.toLowerCase()))) return "Africa";
  if (northAmerica.some(n => cleanNation.includes(n.toLowerCase()))) return "North America";
  if (asiaPlus.some(n => cleanNation.includes(n.toLowerCase()))) return "Asia-Pacific";
  return "Rest of World";
}

export class ChemistryGraph {
  private players: Player[] = PLAYERS;
  private nodes: Map<string, { label: string; type: string }> = new Map();
  // adjacency list representation of weighted edges
  private adjacencyList: Map<string, Map<string, { type: string; weight: number }>> = new Map();

  constructor() {
    this.buildGraph();
  }

  public setPlayers(players: Player[]) {
    this.players = players;
    this.buildGraph();
  }

  private buildGraph() {
    this.nodes.clear();
    this.adjacencyList.clear();

    // 1. Add all players as nodes
    this.players.forEach((player) => {
      this.addNode(player.id, player.name, "player");

      // Era Node
      const eraNodeId = `era_${player.era}`;
      this.addNode(eraNodeId, player.era, "era");
      this.addEdge(player.id, eraNodeId, "belongs_to", 1);

      // Club Node
      const clubNodeId = `club_${player.club}`;
      this.addNode(clubNodeId, player.club, "club");
      this.addEdge(player.id, clubNodeId, "played_for", 2);

      // Nation Node
      const nationNodeId = `nation_${player.nation}`;
      this.addNode(nationNodeId, player.nation, "nation");
      this.addEdge(player.id, nationNodeId, "citizen_of", 2);
    });

    // 2. Interconnect players with direct 'chemistry_link' weights if they share attributes
    for (let i = 0; i < this.players.length; i++) {
      for (let j = i + 1; j < this.players.length; j++) {
        const p1 = this.players[i];
        const p2 = this.players[j];

        let weight = 0;
        let reasons: string[] = [];

        if (p1.club === p2.club) {
          weight += 4;
          reasons.push("same_club");
        }
        if (p1.nation === p2.nation) {
          weight += 3;
          reasons.push("same_nation");
        }
        if (p1.era === p2.era) {
          weight += 25; // Base era synergy
          reasons.push("same_era");
        }

        // Shared eras + same club/nation yields special historical chemistry boosts
        if (p1.club === p2.club && p1.era === p2.era) {
          weight += 5; // Legendary club partnership (e.g., Messi & Xavi at Barca)
        }

        if (weight > 25) {
          this.addEdge(p1.id, p2.id, "chemistry_link", weight);
        }
      }
    }
  }

  public addNode(id: string, label: string, type: string) {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, { label, type });
      this.adjacencyList.set(id, new Map());
    }
  }

  public addEdge(sourceId: string, targetId: string, type: string, weight: number) {
    if (!this.adjacencyList.has(sourceId)) {
      this.adjacencyList.set(sourceId, new Map());
    }
    if (!this.adjacencyList.has(targetId)) {
      this.adjacencyList.set(targetId, new Map());
    }

    this.adjacencyList.get(sourceId)!.set(targetId, { type, weight });
    this.adjacencyList.get(targetId)!.set(sourceId, { type, weight }); // Undirected
  }

  // Check chemistry link strength directly between two players
  public getChemistryLink(p1Id: string, p2Id: string): { weight: number; clubShared: boolean; nationShared: boolean; eraShared: boolean } {
    const defaultRes = { weight: 0, clubShared: false, nationShared: false, eraShared: false };
    
    const p1 = this.players.find((p) => p.id === p1Id);
    const p2 = this.players.find((p) => p.id === p2Id);

    if (!p1 || !p2) return defaultRes;

    const clubShared = p1.club === p2.club;
    const nationShared = p1.nation === p2.nation;
    const eraShared = p1.era === p2.era;

    // Query graph adjacent edges
    const p1Edges = this.adjacencyList.get(p1Id);
    if (p1Edges && p1Edges.has(p2Id)) {
      return {
        weight: p1Edges.get(p2Id)!.weight,
        clubShared,
        nationShared,
        eraShared,
      };
    }

    // fallback matching if direct edge is thin
    let fallbackWeight = 0;
    if (clubShared) fallbackWeight += 3;
    if (nationShared) fallbackWeight += 2;
    if (eraShared) fallbackWeight += 1;

    return {
      weight: fallbackWeight,
      clubShared,
      nationShared,
      eraShared,
    };
  }

  // Compute total lineup chemistry and individual boosts
  public calculateTeamChemistry(
    lineup: LineupSetup, 
    formation: Formation,
    mode: "ucl" | "worldcup" = "ucl"
  ): TeamChemistry {
    let score = 0;
    let linksCount = 0;
    let clubLinks = 0;
    let nationLinks = 0;
    let eraLinks = 0;
    let regionLinks = 0;

    const keys = formation.positions.map((p) => p.key);

    formation.positions.forEach((pos) => {
      const player = lineup[pos.key];
      if (!player) return;

      pos.links.forEach((linkKey) => {
        // Simple double links check - count edge once strictly by ordering key strings
        if (pos.key > linkKey) return; 

        const neighbor = lineup[linkKey];
        if (!neighbor) return;

        const info = this.getChemistryLink(player.id, neighbor.id);
        if (info.weight > 0) {
          linksCount++;
          
          if (mode === "worldcup") {
            const p1Reg = getNationRegion(player.nation);
            const p2Reg = getNationRegion(neighbor.nation);
            const isRegShared = p1Reg === p2Reg;

            if (info.nationShared) {
              nationLinks++;
            } else if (isRegShared) {
              regionLinks++;
            }
            if (info.eraShared) eraLinks++;

            // Accumulate chemistry points for World Cup
            let pts = 0;
            if (info.nationShared) pts += 25; // Massive synergy for countrymen
            else if (isRegShared) pts += 10;  // Continent level connection
            if (info.eraShared) pts += 5;

            score += pts;
          } else {
            if (info.clubShared) clubLinks++;
            if (info.nationShared) nationLinks++;
            if (info.eraShared) eraLinks++;

            // Accumulate chemistry points for UCL
            let pts = 0;
            if (info.clubShared) pts += 15; // standard links representation
            if (info.nationShared) pts += 10;
            if (info.eraShared) pts += 5;

            score += pts;
          }
        }
      });
    });

    // Add extra checks for positional compatibility
    let positionCorrectCount = 0;
    formation.positions.forEach((pos) => {
      const player = lineup[pos.key];
      if (!player) return;

      const isExact = player.primaryPosition === pos.label;
      const isAlt = player.alternativePositions.includes(pos.label);

      if (isExact) {
        score += 10; // Positional match points
        positionCorrectCount++;
      } else if (isAlt) {
        score += 5; // Half points for alt position
        positionCorrectCount++;
      }
    });

    // Normalize out of 100
    // Max theoretical points is: approx 11 players exact position (11 * 10 = 110) + ~15-20 links
    // We scale it smoothly to a maximum cap of 100
    const totalRaw = score;
    const baseDivider = 150; // Tuned for standard formations
    const finalScore = Math.min(100, Math.round((totalRaw / baseDivider) * 100));

    return {
      score: isNaN(finalScore) ? 0 : Math.max(0, finalScore),
      linksCount,
      clubLinks,
      nationLinks,
      eraLinks,
      regionLinks,
    };
  }

  // Retrieve player rating boosted dynamically by chemistry links (similar to Chemistry Boosts)
  public getPlayerBoostedRating(
    player: Player,
    lineup: LineupSetup,
    formation: Formation,
    eraBalance: "balanced" | "retro_boost" | "modern_boost" | "raw" = "balanced",
    mode: "ucl" | "worldcup" = "ucl"
  ): { finalRating: number; boostAmt: number; eraAdjustment: number } {
    // 1. Balance Eras
    let eraAdjustment = 0;
    if (player.era === Era.Classic) {
      if (eraBalance === "balanced") eraAdjustment = +1;
      else if (eraBalance === "retro_boost") eraAdjustment = +4;
      else if (eraBalance === "modern_boost") eraAdjustment = -2;
    } else if (player.era === Era.Legend) {
      if (eraBalance === "retro_boost") eraAdjustment = +2;
      else if (eraBalance === "modern_boost") eraAdjustment = -1;
    } else if (player.era === Era.Present) {
      if (eraBalance === "balanced") eraAdjustment = 0;
      else if (eraBalance === "retro_boost") eraAdjustment = -3;
      else if (eraBalance === "modern_boost") eraAdjustment = +3;
    }

    // 2. Chemistry booster
    let chemistryConnections = 0;
    // Find where player is in lineup
    let playerKey: string | null = null;
    for (const [key, p] of Object.entries(lineup)) {
      if (p && p.id === player.id) {
        playerKey = key;
        break;
      }
    }

    let isOutOfPosition = false;
    let boostAmt = 0;

    if (playerKey) {
      const positionDef = formation.positions.find((pos) => pos.key === playerKey);
      if (positionDef) {
        // Position compliance
        const primaryMatch = player.primaryPosition === positionDef.label;
        const alternativeMatch = player.alternativePositions.includes(positionDef.label);

        if (!primaryMatch && !alternativeMatch) {
          isOutOfPosition = true;
          // Out of position players suffer rating penalty
          boostAmt -= 4;
        }

        // Check neighbor chemistry
        positionDef.links.forEach((linkKey) => {
          const neighbor = lineup[linkKey];
          if (!neighbor) return;

          const chem = this.getChemistryLink(player.id, neighbor.id);
          if (chem.weight > 0) {
            if (mode === "worldcup") {
              const p1Reg = getNationRegion(player.nation);
              const p2Reg = getNationRegion(neighbor.nation);
              const isRegShared = p1Reg === p2Reg;

              if (chem.nationShared) {
                chem.eraShared ? chemistryConnections += 1.8 : chemistryConnections += 1.2;
              } else if (isRegShared) {
                chemistryConnections += 0.5;
              }
              if (chem.eraShared) chemistryConnections += 0.2;
            } else {
              if (chem.clubShared) chem.eraShared ? chemistryConnections += 1.5 : chemistryConnections += 1.0;
              if (chem.nationShared) chemistryConnections += 0.5;
              if (chem.eraShared) chemistryConnections += 0.3;
            }
          }
        });
      }
    }

    // Max chemical boost capped at +3, min chemical penalty is -4 if out of position
    if (!isOutOfPosition && chemistryConnections > 0) {
      boostAmt += Math.min(3, Math.round(chemistryConnections));
    }

    const finalRating = Math.max(70, Math.min(99, player.originalRating + eraAdjustment + boostAmt));

    return {
      finalRating,
      boostAmt,
      eraAdjustment,
    };
  }

  // Get list of direct graph node/edge visual model for drawing chemistry network
  public getNetworkVisualization(lineup: LineupSetup, formation: Formation) {
    const finalNodes: any[] = [];
    const finalEdges: any[] = [];
    const activePlayers = Object.entries(lineup).filter(([k, v]) => v !== null) as [string, Player][];

    // Build unique nodes
    activePlayers.forEach(([key, player]) => {
      finalNodes.push({
        id: player.id,
        label: player.shortName,
        rating: player.originalRating,
        era: player.era,
        club: player.club,
        nation: player.nation,
        positionKey: key,
      });
    });

    // Build links
    formation.positions.forEach((pos) => {
      const player = lineup[pos.key];
      if (!player) return;

      pos.links.forEach((linkKey) => {
        if (pos.key > linkKey) return; // Prevent double edge

        const neighbor = lineup[linkKey];
        if (!neighbor) return;

        const chem = this.getChemistryLink(player.id, neighbor.id);
        if (chem.weight > 0) {
          let color = "#cbd5e1"; // generic grey
          if (chem.clubShared && chem.nationShared) {
            color = "#facc15"; // gold link (both)
          } else if (chem.clubShared) {
            color = "#22c55e"; // green link (same club)
          } else if (chem.nationShared) {
            color = "#3b82f6"; // blue link (same nation)
          } else if (chem.eraShared) {
            color = "#6366f1"; // indigo (same era only)
          }

          finalEdges.push({
            source: player.id,
            target: neighbor.id,
            sourcePos: pos.key,
            targetPos: linkKey,
            weight: chem.weight,
            color,
            clubShared: chem.clubShared,
            nationShared: chem.nationShared,
            eraShared: chem.eraShared,
          });
        }
      });
    });

    return { nodes: finalNodes, edges: finalEdges };
  }
}
export const chemistryGraphInstance = new ChemistryGraph();
export default chemistryGraphInstance;
