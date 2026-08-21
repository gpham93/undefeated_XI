import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, RefreshCw, Layers, Check, HelpCircle, AlertCircle, PlayCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Player, Formation, LineupSetup, Position, Era, Difficulty, UserCareerState } from "../types";
import { PLAYERS } from "../data/players";
import { ProCard } from "./ProCard";
import { chemistryGraphInstance } from "../utils/chemistryGraph";
import { BadgeBuilder } from "./BadgeBuilder";
import { WORLD_CUP_YEARS_DATA } from "../data/worldCupYears";

interface DraftGridProps {
  playersList: Player[];
  lineup: LineupSetup;
  setLineup: React.Dispatch<React.SetStateAction<LineupSetup>>;
  formation: Formation;
  setFormation: (form: Formation) => void;
  activeEras: Era[];
  setActiveEras: (eras: Era[]) => void;
  eraBalance: "balanced" | "retro_boost" | "modern_boost" | "raw";
  setEraBalance: (balance: "balanced" | "retro_boost" | "modern_boost" | "raw") => void;
  onDraftComplete: () => void;
  difficulty: Difficulty;
  setDifficulty: (diff: Difficulty) => void;
  onPlayerScouted: (player: Player) => void;
  userAuthenticated: boolean;
  careerState: UserCareerState;
  saveCareer: (nextState: UserCareerState) => void;
}

// Support three iconic tactical formations matching position indices
export const FORMATIONS: Formation[] = [
  {
    name: "4-3-3",
    positions: [
      { key: "GK", label: Position.GK, x: 50, y: 10, links: ["CB1", "CB2"] },
      { key: "LB", label: Position.LB, x: 15, y: 32, links: ["CB1", "CM1"] },
      { key: "CB1", label: Position.CB, x: 38, y: 28, links: ["GK", "LB", "CB2", "CM1"] },
      { key: "CB2", label: Position.CB, x: 62, y: 28, links: ["GK", "RB", "CB1", "CM3"] },
      { key: "RB", label: Position.RB, x: 85, y: 32, links: ["CB2", "CM3"] },
      { key: "CM1", label: Position.CM, x: 30, y: 52, links: ["LB", "CB1", "CM2", "LW"] },
      { key: "CM2", label: Position.CM, x: 50, y: 48, links: ["CM1", "CM3", "ST"] },
      { key: "CM3", label: Position.CM, x: 70, y: 52, links: ["RB", "CB2", "CM2", "RW"] },
      { key: "LW", label: Position.LW, x: 20, y: 78, links: ["CM1", "ST"] },
      { key: "ST", label: Position.ST, x: 50, y: 82, links: ["CM2", "LW", "RW"] },
      { key: "RW", label: Position.RW, x: 80, y: 78, links: ["CM3", "ST"] },
    ],
  },
  {
    name: "4-4-2",
    positions: [
      { key: "GK", label: Position.GK, x: 50, y: 10, links: ["CB1", "CB2"] },
      { key: "LB", label: Position.LB, x: 15, y: 30, links: ["CB1", "LM"] },
      { key: "CB1", label: Position.CB, x: 38, y: 26, links: ["GK", "LB", "CB2", "CM1"] },
      { key: "CB2", label: Position.CB, x: 62, y: 26, links: ["GK", "RB", "CB1", "CM2"] },
      { key: "RB", label: Position.RB, x: 85, y: 30, links: ["CB2", "RM"] },
      { key: "LM", label: Position.LM, x: 15, y: 56, links: ["LB", "CM1", "ST1"] },
      { key: "CM1", label: Position.CM, x: 38, y: 52, links: ["CB1", "LM", "CM2", "ST1"] },
      { key: "CM2", label: Position.CM, x: 62, y: 52, links: ["CB2", "RM", "CM1", "ST2"] },
      { key: "RM", label: Position.RM, x: 85, y: 56, links: ["RB", "CM2", "ST2"] },
      { key: "ST1", label: Position.ST, x: 35, y: 80, links: ["LM", "CM1", "ST2"] },
      { key: "ST2", label: Position.ST, x: 65, y: 80, links: ["RM", "CM2", "ST1"] },
    ],
  },
  {
    name: "3-5-2",
    positions: [
      { key: "GK", label: Position.GK, x: 50, y: 10, links: ["CB2"] },
      { key: "CB1", label: Position.CB, x: 25, y: 26, links: ["CB2", "LM"] },
      { key: "CB2", label: Position.CB, x: 50, y: 24, links: ["GK", "CB1", "CB3", "CM2"] },
      { key: "CB3", label: Position.CB, x: 75, y: 26, links: ["CB2", "RM"] },
      { key: "LM", label: Position.LM, x: 12, y: 54, links: ["CB1", "CM1"] },
      { key: "CM1", label: Position.CM, x: 32, y: 48, links: ["CB1", "LM", "CM2", "ST1"] },
      { key: "CM2", label: Position.CM, x: 50, y: 45, links: ["CB2", "CM1", "CM3"] },
      { key: "CM3", label: Position.CM, x: 68, y: 48, links: ["CB3", "RM", "CM2", "ST2"] },
      { key: "RM", label: Position.RM, x: 88, y: 54, links: ["CB3", "CM3"] },
      { key: "ST1", label: Position.ST, x: 35, y: 78, links: ["CM1", "ST2"] },
      { key: "ST2", label: Position.ST, x: 65, y: 78, links: ["CM3", "ST1"] },
    ],
  },
];

export const DraftGrid: React.FC<DraftGridProps> = ({
  playersList,
  lineup,
  setLineup,
  formation,
  setFormation,
  activeEras,
  setActiveEras,
  eraBalance,
  setEraBalance,
  onDraftComplete,
  difficulty,
  setDifficulty,
  onPlayerScouted,
  userAuthenticated,
  careerState,
  saveCareer,
}) => {
  const [selectedSlotKey, setSelectedSlotKey] = useState<string | null>(null);
  const [draftChoices, setDraftChoices] = useState<Player[]>([]);
  const [isDrawOpen, setIsDrawOpen] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [isParamsCollapsed, setIsParamsCollapsed] = useState(true);
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0);
  const [isRoadmapCollapsed, setIsRoadmapCollapsed] = useState(true);
  const [showAdvancedParams, setShowAdvancedParams] = useState(false);

  // Get details on the unlocked roster progress (how many 84+ players have been unlocked via packs)
  const getDraftPoolRules = () => {
    const unlockedSet = new Set(careerState.unlockedPlayerIds || []);
    const elitePlayers = PLAYERS.filter((p) => p.originalRating >= 84);
    const totalEliteCount = elitePlayers.length;
    const unlockedEliteCount = elitePlayers.filter((p) => unlockedSet.has(p.id)).length;
    
    return {
      totalEliteCount,
      unlockedEliteCount,
      unlockedPercentage: totalEliteCount > 0 ? Math.round((unlockedEliteCount / totalEliteCount) * 100) : 0,
      ordinaryPlayersCount: PLAYERS.filter((p) => p.originalRating < 84).length,
    };
  };

  const prevMobileSlot = () => {
    setCurrentMobileIndex((prev) => (prev > 0 ? prev - 1 : formation.positions.length - 1));
  };

  const nextMobileSlot = () => {
    setCurrentMobileIndex((prev) => (prev < formation.positions.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    setCurrentMobileIndex(0);
  }, [formation]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculations for average and chemistry
  const [averageRating, setAverageRating] = useState(0);
  const [calculatedChem, setCalculatedChem] = useState({ score: 0, clubLinks: 0, nationLinks: 0, eraLinks: 0, regionLinks: 0 });

  useEffect(() => {
    // Re-verify rating and chemistry whenever lineup changes
    const activeMembers = Object.values(lineup).filter((p) => p !== null) as Player[];
    if (activeMembers.length === 0) {
      setAverageRating(0);
      setCalculatedChem({ score: 0, clubLinks: 0, nationLinks: 0, eraLinks: 0, regionLinks: 0 });
      return;
    }

    // Apply baseline boosted evaluations
    const sum = activeMembers.reduce((acc, curr) => {
      const stats = chemistryGraphInstance.getPlayerBoostedRating(curr, lineup, formation, eraBalance, careerState.tournamentMode);
      return acc + stats.finalRating;
    }, 0);

    const avg = Math.round(sum / activeMembers.length);
    setAverageRating(avg);

    const chemObj = chemistryGraphInstance.calculateTeamChemistry(lineup, formation, careerState.tournamentMode);
    setCalculatedChem(chemObj);
  }, [lineup, formation, eraBalance, careerState.tournamentMode]);

  // Handle slot trigger draft
  const triggerSlotSelection = (key: string, positionLabel: Position) => {
    setSelectedSlotKey(key);

    const activeUnlockedIds = new Set(careerState.unlockedPlayerIds || []);
    const isEligible = (p: Player) => p.originalRating < 84 || activeUnlockedIds.has(p.id);
    const eligiblePlayers = playersList.filter(isEligible);

    // Calculate dynamic rating counts for difficulty rules
    const draftedPlayersWithoutCurrent = Object.entries(lineup)
      .filter(([slotKey, v]) => slotKey !== key && v !== null)
      .map(([slotKey, v]) => v) as Player[];

    const count94Plus = draftedPlayersWithoutCurrent.filter((p) => p.originalRating >= 94).length;
    const count96Plus = draftedPlayersWithoutCurrent.filter((p) => p.originalRating >= 96).length;

    let max94Allowed = Infinity;
    let max96Allowed = Infinity;

    if (difficulty === Difficulty.SemiPro) {
      max94Allowed = 5;
      max96Allowed = 2;
    } else if (difficulty === Difficulty.Professional) {
      max94Allowed = 3;
      max96Allowed = 1;
    } else if (difficulty === Difficulty.Legendary) {
      max94Allowed = 1;
      max96Allowed = 0;
    }

    // Filter roster by selected Eras and prioritize positions as close as possible to selected position
    const matchSelectedEraAndPrimary = eligiblePlayers.filter(
      (p) => activeEras.includes(p.era) && p.primaryPosition === positionLabel
    );
    const matchSelectedEraAndAlt = eligiblePlayers.filter(
      (p) => activeEras.includes(p.era) && p.alternativePositions.includes(positionLabel)
    );

    // Look in other eras to keep position match strong
    const matchOtherEraAndPrimary = eligiblePlayers.filter(
      (p) => !activeEras.includes(p.era) && p.primaryPosition === positionLabel
    );
    const matchOtherEraAndAlt = eligiblePlayers.filter(
      (p) => !activeEras.includes(p.era) && p.alternativePositions.includes(positionLabel)
    );

    // Combine them with high priority
    let positionMatches = [
      ...matchSelectedEraAndPrimary,
      ...matchSelectedEraAndAlt,
      ...matchOtherEraAndPrimary,
      ...matchOtherEraAndAlt,
    ];

    // Remove duplicates
    const seenIds = new Set<string>();
    positionMatches = positionMatches.filter((p) => {
      if (seenIds.has(p.id)) return false;
      seenIds.add(p.id);
      return true;
    });

    // If still less than 5 matches, pull from "related positions"
    if (positionMatches.length < 5) {
      let relatedPositions: Position[] = [];
      if (positionLabel === Position.RB) {
        relatedPositions = [Position.LB, Position.CB, Position.RM];
      } else if (positionLabel === Position.LB) {
        relatedPositions = [Position.RB, Position.CB, Position.LM];
      } else if (positionLabel === Position.CB) {
        relatedPositions = [Position.LB, Position.RB];
      } else if (positionLabel === Position.CM) {
        relatedPositions = [Position.LM, Position.RM, Position.CB];
      } else if (positionLabel === Position.LM) {
        relatedPositions = [Position.CM, Position.LW, Position.RM];
      } else if (positionLabel === Position.RM) {
        relatedPositions = [Position.CM, Position.RW, Position.LM];
      } else if (positionLabel === Position.LW || positionLabel === Position.RW || positionLabel === Position.ST) {
        relatedPositions = [Position.ST, Position.LW, Position.RW, Position.LM, Position.RM].filter(pos => pos !== positionLabel) as Position[];
      }

      // Add related positions in active eras
      const matchRelatedSelected = eligiblePlayers.filter(
        (p) => activeEras.includes(p.era) && relatedPositions.includes(p.primaryPosition) && !seenIds.has(p.id)
      );
      matchRelatedSelected.forEach(p => seenIds.add(p.id));
      positionMatches = [...positionMatches, ...matchRelatedSelected];

      // Add related positions in other eras
      if (positionMatches.length < 5) {
        const matchRelatedOther = eligiblePlayers.filter(
          (p) => !activeEras.includes(p.era) && relatedPositions.includes(p.primaryPosition) && !seenIds.has(p.id)
        );
        matchRelatedOther.forEach(p => seenIds.add(p.id));
        positionMatches = [...positionMatches, ...matchRelatedOther];
      }
    }

    // Finally, if still less than 5, use general outfield/GK fallbacks
    if (positionMatches.length < 5) {
      if (positionLabel === Position.GK) {
        const extraGks = eligiblePlayers.filter((p) => p.primaryPosition === Position.GK && !seenIds.has(p.id));
        positionMatches = [...positionMatches, ...extraGks];
      } else {
        const extraOutfield = eligiblePlayers.filter(
          (p) => p.primaryPosition !== Position.GK && !p.alternativePositions.includes(Position.GK) && !seenIds.has(p.id)
        );
        positionMatches = [...positionMatches, ...extraOutfield];
      }
    }

    // Helper to determine weight for a player based on rating and difficulty (higher ratings heavily favored at lower difficulties)
    const getPlayerWeight = (player: Player) => {
      const r = player.originalRating;
      if (difficulty === Difficulty.Amateur) {
        if (r >= 96) return 15;
        if (r >= 94) return 10;
        if (r >= 90) return 6;
        if (r >= 84) return 3;
        return 0.8; // slightly de-emphasize low ratings on easy
      } else if (difficulty === Difficulty.SemiPro) {
        if (r >= 96) return 7;
        if (r >= 94) return 5;
        if (r >= 90) return 4;
        if (r >= 84) return 2.5;
        return 1;
      } else if (difficulty === Difficulty.Professional) {
        if (r >= 96) return 2;
        if (r >= 94) return 2.2;
        if (r >= 90) return 2;
        if (r >= 84) return 1.5;
        return 1.2;
      } else { // Legendary
        if (r >= 96) return 0.2;
        if (r >= 94) return 0.4;
        if (r >= 90) return 0.7;
        if (r >= 84) return 1.2;
        return 3; // Heavily favor actual challenges/lower ratings
      }
    };

    // Filter out players already drafted elsewhere in the lineup
    const draftedIds = Object.values(lineup)
      .filter((v): v is Player => v !== null)
      .map((p) => p.id);
    
    let dryPool = positionMatches.filter((p) => !draftedIds.includes(p.id));

    // Expand the pool with other undrafted eligible players if we don't have enough unique choices.
    // This strictly avoids duplicate draft picks in a team lineup!
    if (dryPool.length < 5) {
      const extraEligible = eligiblePlayers.filter(
        (p) => !draftedIds.includes(p.id) && !dryPool.some((dp) => dp.id === p.id)
      );
      dryPool = [...dryPool, ...extraEligible];
    }

    // Select 5 players using difficulty-based weighted random selection without replacement
    const finalFive: Player[] = [];
    const tempPool = [...dryPool];

    while (finalFive.length < 5 && tempPool.length > 0) {
      let totalWeight = 0;
      for (const p of tempPool) {
        totalWeight += getPlayerWeight(p);
      }
      
      let rand = Math.random() * totalWeight;
      let selectedIdx = 0;
      for (let i = 0; i < tempPool.length; i++) {
        const w = getPlayerWeight(tempPool[i]);
        if (rand < w) {
          selectedIdx = i;
          break;
        }
        rand -= w;
        selectedIdx = i;
      }
      finalFive.push(tempPool.splice(selectedIdx, 1)[0]);
    }

    const finalChoices = [...finalFive];
    finalChoices.sort(() => Math.random() - 0.5);

    setDraftChoices(finalChoices);
    setRevealedIds(new Set()); // Hidden states
    setIsDrawOpen(true);
  };

  // Commit player of draft selection
  const commitDraftPick = (player: Player) => {
    if (!selectedSlotKey) return;

    setLineup((prev) => ({
      ...prev,
      [selectedSlotKey]: player,
    }));

    setIsDrawOpen(false);
    setSelectedSlotKey(null);
  };

  // Auto Draft fill-in respecting difficulty weighted chances and pack unlocks
  const triggerAutoDraft = () => {
    const freshLineup: LineupSetup = {};
    const activeUnlockedIds = new Set(careerState.unlockedPlayerIds || []);
    const isEligible = (p: Player) => p.originalRating < 84 || activeUnlockedIds.has(p.id);
    const eligiblePlayers = playersList.filter(isEligible);

    const getPlayerWeight = (player: Player) => {
      const r = player.originalRating;
      if (difficulty === Difficulty.Amateur) {
        if (r >= 96) return 15;
        if (r >= 94) return 10;
        if (r >= 90) return 6;
        if (r >= 84) return 3;
        return 0.8;
      } else if (difficulty === Difficulty.SemiPro) {
        if (r >= 96) return 7;
        if (r >= 94) return 5;
        if (r >= 90) return 4;
        if (r >= 84) return 2.5;
        return 1;
      } else if (difficulty === Difficulty.Professional) {
        if (r >= 96) return 2;
        if (r >= 94) return 2.2;
        if (r >= 90) return 2;
        if (r >= 84) return 1.5;
        return 1.2;
      } else { // Legendary
        if (r >= 96) return 0.2;
        if (r >= 94) return 0.4;
        if (r >= 90) return 0.7;
        if (r >= 84) return 1.2;
        return 3;
      }
    };

    const pickWeightedPlayer = (pool: Player[]) => {
      if (pool.length === 0) return null;
      let totalWeight = 0;
      for (const p of pool) {
        totalWeight += getPlayerWeight(p);
      }
      let rand = Math.random() * totalWeight;
      for (const p of pool) {
        const w = getPlayerWeight(p);
        if (rand < w) return p;
        rand -= w;
      }
      return pool[pool.length - 1];
    };

    formation.positions.forEach((pos) => {
      const posLabel = pos.label;
      const alreadyDrafted = Object.values(freshLineup).filter((v): v is Player => v !== null);
      const draftedIds = alreadyDrafted.map((p) => p.id);

      let pool = eligiblePlayers.filter(
        (p) =>
          activeEras.includes(p.era) &&
          !draftedIds.includes(p.id) &&
          (p.primaryPosition === posLabel || p.alternativePositions.includes(posLabel))
      );

      if (pool.length > 0) {
        const pick = pickWeightedPlayer(pool);
        freshLineup[pos.key] = pick;
      } else {
        // broad fallback
        let fallbackPool = eligiblePlayers.filter((p) => !draftedIds.includes(p.id));
        if (fallbackPool.length === 0) {
          fallbackPool = playersList.filter((p) => !draftedIds.includes(p.id));
        }
        if (posLabel === Position.GK) {
          fallbackPool = fallbackPool.filter((p) => p.primaryPosition === Position.GK);
        } else {
          fallbackPool = fallbackPool.filter((p) => p.primaryPosition !== Position.GK && !p.alternativePositions.includes(Position.GK));
        }
        freshLineup[pos.key] = pickWeightedPlayer(fallbackPool);
      }
    });

    setLineup(freshLineup);
  };

  // Switch formation template
  const updateFormationTemplate = (formName: string) => {
    const nextForm = FORMATIONS.find((f) => f.name === formName)!;
    setFormation(nextForm);
    // Flush current slots to avoid mismatch keys
    const cleared: LineupSetup = {};
    nextForm.positions.forEach((p) => {
      cleared[p.key] = null;
    });
    setLineup(cleared);
  };

  const handleEraSelection = (era: Era) => {
    if (activeEras.includes(era)) {
      if (activeEras.length > 1) {
        setActiveEras(activeEras.filter((e) => e !== era));
      }
    } else {
      setActiveEras([...activeEras, era]);
    }
  };

  const isFullHouse = Object.values(lineup).every((slot) => slot !== null);

  const draftedPlayersCount = Object.values(lineup).filter((s) => s !== null).length;
  const isSquadDrafted = draftedPlayersCount === 11;
  const hasCustomBadge = !!careerState.customBadge;
  const hasPlayedSeasons = (careerState.seasonsCount || 0) > 0;
  const hasUnlockedSuperstars = (careerState.unlockedPlayerIds || []).length > 0;

  let completedStepsCount = 0;
  if (isSquadDrafted) completedStepsCount++;
  if (hasCustomBadge) completedStepsCount++;
  if (hasPlayedSeasons) completedStepsCount++;
  if (hasUnlockedSuperstars) completedStepsCount++;
  const progressPercent = Math.round((completedStepsCount / 4) * 100);

  return (
    <div className="flex flex-col gap-6 w-full py-2 relative z-10 font-sans">
      
      {/* World Cup Edition selection (only when in worldcup mode on desktop) */}
      {!isMobile && careerState.tournamentMode === "worldcup" && (
        <div className="bg-[#1e150a]/75 backdrop-blur-xl border border-amber-500/15 rounded-2xl p-4 sm:p-5 shadow-[0_4px_30px_rgba(0,0,0,0.4)] animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <span className="text-xs uppercase font-extrabold text-amber-500 tracking-wider flex items-center gap-1.5 font-display">
                🏆 WORLD CUP EDITION YEAR
              </span>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Select custom host country database, teams rating, and aesthetic stadium themes. Current Selection: <span className="text-amber-400 font-bold font-mono">{careerState.tournamentYear || 2014}</span>
              </p>
            </div>
            
            <div className="grid grid-cols-5 gap-1.5 w-full md:w-auto shrink-0 md:max-w-xs">
              {[1998, 2006, 2014, 2022, 2026].map((yr) => {
                const isSelected = (careerState.tournamentYear || 2014) === yr;
                const flags: Record<number, string> = {
                  1998: "🇫🇷",
                  2006: "🇩🇪",
                  2014: "🇧🇷",
                  2022: "🇶🇦",
                  2026: "🇺🇸",
                };
                return (
                  <button
                    key={yr}
                    onClick={() => {
                      saveCareer({
                        ...careerState,
                        tournamentYear: yr,
                      });
                    }}
                    className={`py-2 px-1 rounded-lg text-center flex flex-col items-center justify-center border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-600 border-amber-400 text-white font-black shadow-[0_0_12px_rgba(217,119,6,0.3)] scale-[1.03]"
                        : "bg-white/5 border-white/10 text-slate-350 hover:bg-white/10 hover:border-white/20 animate-none"
                    }`}
                  >
                    <span className="text-xs leading-none mb-0.5">{flags[yr]}</span>
                    <span className="text-[9px] font-mono leading-none tracking-tight font-black">{yr}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-2.5 text-[10px] text-amber-250/70 font-mono leading-normal bg-black/35 p-2 rounded-lg border border-amber-500/10">
            {WORLD_CUP_YEARS_DATA[careerState.tournamentYear || 2014]?.description}
          </div>
        </div>
      )}
      
      {/* Starting Screen Draft Difficulty Selector Bar */}
      {!isMobile && (
        <div className="bg-[#0b1426]/75 backdrop-blur-xl border border-cyan-500/15 rounded-2xl p-4 sm:p-5 shadow-[0_4px_30px_rgba(0,0,0,0.4)] animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <span className="text-xs uppercase font-extrabold text-cyan-400 tracking-wider flex items-center gap-1.5 font-display">
                🎮 CHOOSE CHAMPIONSHIP DIFFICULTY
              </span>
              <p className="text-[11px] text-white/50 mt-1 leading-snug">
                Boosts draft pool probabilities to fetch high-rated all-time superstars easily at lower levels!
              </p>
            </div>
            
            <div className="grid grid-cols-4 gap-1.5 w-full md:w-auto shrink-0 md:max-w-sm">
              {Object.values(Difficulty).map((d) => {
                const isSelected = difficulty === d;
                return (
                  <button
                    key={d}
                    id={`top_difficulty_btn_${d}`}
                    onClick={() => {
                      const cleared: LineupSetup = {};
                      formation.positions.forEach((p) => { cleared[p.key] = null; });
                      setLineup(cleared);
                      setDifficulty(d);
                    }}
                    className={`py-2 px-1 rounded-lg text-center flex flex-col items-center justify-center border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-cyan-600 border-cyan-400 text-white font-black shadow-[0_0_12px_rgba(6,182,212,0.35)] scale-[1.03]"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                    }`}
                    title="Changes the drop quality probabilities & opponent campaign rating boost"
                  >
                    <span className="text-[10px] font-mono leading-none tracking-tight font-black">{d}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-2.5 p-2 rounded-lg bg-black/40 border border-white/5 text-[9px] text-slate-400 leading-normal font-mono flex flex-wrap items-center gap-2">
            <span className="font-bold text-white uppercase uppercase">Active Effect:</span>
            {difficulty === Difficulty.Amateur && (
              <span className="text-emerald-400">🟢 Easy Draft. Peak 94+ stars drop at an extremely high rate. Opponents play at base rating levels.</span>
            )}
            {difficulty === Difficulty.SemiPro && (
              <span className="text-amber-400">🟡 Moderate Draft. Superstars are highly favored. Opponents receive a +1 OVR rating boost.</span>
            )}
            {difficulty === Difficulty.Professional && (
              <span className="text-orange-400">🟠 Advanced Draft. Standard balanced historic chances. Opponents receive a +3 OVR rating boost.</span>
            )}
            {difficulty === Difficulty.Legendary && (
              <span className="text-red-400">🔴 Hard Draft. Superstars are rare, forcing tactical budget picks. Opponents receive a +6 OVR rating boost.</span>
            )}
          </div>
        </div>
      )}
      
      {/* Visual Onboarding Roadmap Progress Board */}
      {!isMobile && (
        <div className="bg-[#0b1426]/75 backdrop-blur-xl border border-cyan-500/15 rounded-2xl p-4 sm:p-5 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </span>
                <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  Manager Career Roadmap: <span className="text-cyan-400">{progressPercent}% Completed</span>
                </h3>
              </div>
              <p className="text-[10px] text-white/50 mt-1">Complete these simple milestones to build your custom football club dynasty, earn coins, and unlock retro legends!</p>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto shrink-0 justify-between md:justify-end">
              <div className="w-40 sm:w-48 bg-white/5 h-2 rounded-full border border-white/5 overflow-hidden flex items-center">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full transition-all duration-700" 
                  style={{ width: `${Math.max(5, progressPercent)}%` }}
                />
              </div>
              <button
                onClick={() => setIsRoadmapCollapsed(!isRoadmapCollapsed)}
                className="py-1.5 px-3 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 rounded-lg text-[10px] font-mono uppercase font-bold text-slate-300 transition-all cursor-pointer inline-flex items-center gap-1 shrink-0"
              >
                <span>{isRoadmapCollapsed ? "HELP TO PLAY [ + ]" : "CLOSE GUIDE [ - ]"}</span>
              </button>
            </div>
          </div>

          {!isRoadmapCollapsed && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/10">
              {/* Step 1 */}
              <div className={`p-3 rounded-xl border transition-all ${
                isSquadDrafted 
                  ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" 
                  : "bg-cyan-950/20 border-cyan-500/25 text-cyan-400"
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] uppercase font-mono tracking-wider font-black">Step 1: Draft Squad</span>
                  {isSquadDrafted ? (
                    <span className="bg-emerald-500/20 text-emerald-305 font-mono text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">DONE ✅</span>
                  ) : (
                    <span className="bg-cyan-500/20 text-cyan-305 font-mono text-[8px] px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">ACTIVE ⚡</span>
                  )}
                </div>
                <h4 className="text-[11px] font-bold text-white uppercase">Pick 11 Players</h4>
                <p className="text-[10px] text-white/45 mt-1 leading-normal">
                  Click elements on the pitch to scout and choose superstars.
                  <span className="text-slate-200 mt-1 block font-mono font-bold">Progress: {draftedPlayersCount}/11 Selected</span>
                </p>
              </div>

              {/* Step 2 */}
              <div className={`p-3 rounded-xl border transition-all ${
                hasCustomBadge 
                  ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" 
                  : isSquadDrafted 
                    ? "bg-cyan-500/10 border-cyan-505/30 text-cyan-400 border-dashed animate-pulse" 
                    : "bg-white/2 border-white/5 text-slate-400"
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] uppercase font-mono tracking-wider font-black">Step 2: Customize Badge</span>
                  {hasCustomBadge ? (
                    <span className="bg-emerald-500/20 text-emerald-305 font-mono text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">DONE ✅</span>
                  ) : isSquadDrafted ? (
                    <span className="bg-cyan-500/20 text-cyan-300 font-mono text-[8px] px-1.5 py-0.5 rounded font-bold uppercase animate-bounce">START CREST</span>
                  ) : (
                    <span className="bg-white/5 text-white/40 font-mono text-[8px] px-1.5 py-0.5 rounded">LOCKED 🔒</span>
                  )}
                </div>
                <h4 className="text-[11px] font-bold text-white uppercase">Design Club Crest</h4>
                <p className="text-[10px] text-white/45 mt-1 leading-normal">
                  Use the Badge Builder below to scout & link a real club logo or custom vector!
                </p>
              </div>

              {/* Step 3 */}
              <div className={`p-3 rounded-xl border transition-all ${
                hasPlayedSeasons 
                  ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" 
                  : isSquadDrafted 
                    ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-400 animate-pulse"
                    : "bg-white/2 border-white/5 text-slate-400"
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] uppercase font-mono tracking-wider font-black">Step 3: Simulate</span>
                  {hasPlayedSeasons ? (
                    <span className="bg-emerald-500/20 text-emerald-305 font-mono text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">DONE ✅</span>
                  ) : isSquadDrafted ? (
                    <span className="bg-cyan-500/20 text-cyan-300 font-mono text-[8px] px-1.5 py-0.5 rounded font-bold uppercase animate-bounce">PLAY CUP</span>
                  ) : (
                    <span className="bg-white/5 text-white/40 font-mono text-[8px] px-1.5 py-0.5 rounded">LOCKED 🔒</span>
                  )}
                </div>
                <h4 className="text-[11px] font-bold text-white uppercase">Run Tournament</h4>
                <p className="text-[10px] text-white/45 mt-1 leading-normal">
                  Go to **Simulation** tab and run matches with live ticking commentary!
                </p>
              </div>

              {/* Step 4 */}
              <div className={`p-3 rounded-xl border transition-all ${
                hasUnlockedSuperstars 
                  ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" 
                  : hasPlayedSeasons 
                    ? "bg-cyan-500/15 border-cyan-500/25 text-cyan-405 animate-pulse"
                    : "bg-white/2 border-white/5 text-slate-400"
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] uppercase font-mono tracking-wider font-black">Step 4: Spend Coins</span>
                  {hasUnlockedSuperstars ? (
                    <span className="bg-emerald-500/20 text-emerald-305 font-mono text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">DONE ✅</span>
                  ) : hasPlayedSeasons ? (
                    <span className="bg-cyan-500/20 text-cyan-300 font-mono text-[8px] px-1.5 py-0.5 rounded font-bold uppercase animate-bounce">OPEN PACKS</span>
                  ) : (
                    <span className="bg-white/5 text-white/40 font-mono text-[8px] px-1.5 py-0.5 rounded">LOCKED 🔒</span>
                  )}
                </div>
                <h4 className="text-[11px] font-bold text-white uppercase">Spend Dynasty Coins</h4>
                <p className="text-[10px] text-white/45 mt-1 leading-normal">
                  Spend coins in the **Legends Packs** tab to open retrospective packs.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-4 relative z-10 font-sans">
      
      {/* LEFT: Tactical Control & Setup */}
      <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
        
        {/* Toggle Parameters Button on Mobile to prevent crowding */}
        <button
          onClick={() => setIsParamsCollapsed(!isParamsCollapsed)}
          className="lg:hidden w-full flex items-center justify-between p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl text-xs font-bold text-slate-200 transition-all active:scale-[0.98]"
        >
          <span className="flex items-center gap-2">
            <Layers className="text-cyan-400 w-4 h-4" />
            <span>Draft Parameters Set ({formation.name} • {difficulty})</span>
          </span>
          <span className="text-cyan-400 font-mono text-[10px]">
            {isParamsCollapsed ? "[ EXPAND MATCH RULES + ]" : "[ COLLAPSE MATCH RULES - ]"}
          </span>
        </button>

        {/* Panel 1: Formation & Era options */}
        <div className={`${isParamsCollapsed ? "hidden lg:block" : "block"} bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl`}>
          <div className="flex items-center gap-2 mb-4">
            <Layers className="text-cyan-400 w-5 h-5 animate-pulse" />
            <h3 className="font-display font-medium text-lg text-white">Draft Parameters</h3>
          </div>
 
          {/* Formations list */}
          <div className="mb-5">
            <span className="text-xs uppercase font-semibold text-white/50 tracking-wider">Tactical Formation</span>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {FORMATIONS.map((f) => (
                <button
                  key={f.name}
                  id={`formation_btn_${f.name}`}
                  onClick={() => updateFormationTemplate(f.name)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    formation.name === f.name
                      ? "bg-cyan-600 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                      : "bg-white/5 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Collapsible Section Trigger */}
          <div className="pt-2 mt-2 border-t border-white/5">
            <button
              id="toggle_advanced_params_btn"
              onClick={() => setShowAdvancedParams(!showAdvancedParams)}
              className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer border border-white/5"
            >
              <span className="flex items-center gap-1.5 font-display">
                ⚙️ SHOW RULES & ERAS
              </span>
              <span className="text-[10px] font-mono text-cyan-400 font-extrabold uppercase">
                {showAdvancedParams ? "[ HIDE - ]" : "[ SHOW + ]"}
              </span>
            </button>
          </div>

          {showAdvancedParams && (
            <div className="mt-4 pt-4 border-t border-white/15 flex flex-col gap-5">
              {/* Eras configuration */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs uppercase font-semibold text-white/50 tracking-wider">Active Legends Eras</span>
                  <span className="text-[10px] text-cyan-400 font-mono italic">Multi-era draft</span>
                </div>
                <div className="flex flex-col gap-2">
                  {Object.values(Era).map((era) => {
                    const isActive = activeEras.includes(era);
                    return (
                      <label
                        key={era}
                        id={`checkbox_era_${era.replace(/\s+/g, "")}`}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-colors 
                          ${isActive 
                            ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 font-medium animate-pulse" 
                            : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/10"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => handleEraSelection(era)}
                          className="hidden"
                        />
                        <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all 
                          ${isActive ? "bg-cyan-600 border-cyan-400 text-white" : "border-white/20 bg-transparent"}`}
                        >
                          {isActive && <Check className="w-3 h-3 text-current stroke-[3px]" />}
                        </div>
                        {era}
                      </label>
                    );
                  })}
                </div>
              </div>
     

    
              {/* Rating system balancing */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs uppercase font-semibold text-white/50 tracking-wider">Dynamic Balance Rating</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-white cursor-pointer" title="Adjust stats to balance retro physical stats versus modern giants" />
                </div>
                <select
                  id="era_balance_select"
                  value={eraBalance}
                  onChange={(e: any) => setEraBalance(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 px-3 text-xs text-white/80 focus:border-cyan-500/50 outline-hidden cursor-pointer"
                >
                  <option value="balanced">Balanced Rating Normalization</option>
                  <option value="retro_boost">Retro Boost (Vintage stars gain high physical rating)</option>
                  <option value="modern_boost">Modern physical edge (Boost present 2020s players)</option>
                  <option value="raw">Raw historic statistics (No normalizations)</option>
                </select>
              </div>
            </div>
          )}
        </div>
 
        {/* Panel 2: Chemistry & Live Metrics */}
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display font-medium text-base text-white">Squad Quality</h3>
            <div className="flex gap-2">
              <button
                id="auto_draft_btn"
                onClick={triggerAutoDraft}
                className="flex items-center gap-1.5 py-1 px-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-[10px] text-white font-bold transition-all cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Auto Draft
              </button>
              <button
                id="reset_draft_btn"
                onClick={() => {
                  const cleared: LineupSetup = {};
                  formation.positions.forEach((p) => { cleared[p.key] = null; });
                  setLineup(cleared);
                }}
                className="flex items-center gap-1 py-1 px-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-[10px] text-white font-bold transition-all cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-rose-450" />
                Reset
              </button>
            </div>
          </div>
 
          {/* Average Rating Gauges */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">OVR Rating</span>
              <p className="text-3xl font-black text-cyan-400 font-mono mt-1 drop-shadow-[0_0_10px_rgba(6,182,212,0.25)]">
                {averageRating || "--"}
              </p>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Chemistry</span>
              <p className="text-3xl font-black text-emerald-400 font-mono mt-1 drop-shadow-[0_0_10px_rgba(16,185,129,0.25)]">
                {calculatedChem.score}%
              </p>
            </div>
          </div>
        </div>
 
        {/* Start button triggers */}
        <button
          id="confirm_squad_btn"
          disabled={!isFullHouse}
          onClick={onDraftComplete}
          className={`flex items-center justify-center gap-2 w-full py-4 px-6 rounded-2xl font-bold font-display text-sm tracking-wide transition-all shadow-lg uppercase
            ${isFullHouse
              ? "bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(8,145,178,0.4)] border border-cyan-400/30 cursor-pointer active:scale-[0.98]"
              : "bg-white/5 border border-white/10 text-white/20 cursor-not-allowed"
            }`}
        >
          <PlayCircle className="w-5 h-5 stroke-[2.5px]" />
          CONFIRM TEAM & RUN SEASON
        </button>
 
        {!isFullHouse && (
          <div className="flex items-start gap-2 text-[10px] text-white/50 bg-white/5 p-3 rounded-lg border border-white/10">
            <AlertCircle className="w-4 h-4 text-white/30 shrink-0 mt-0.5" />
            <p>Please select and draft players for all remaining position card slots on the pitch map before simulating your Champions League campaign.</p>
          </div>
        )}

        <BadgeBuilder
          careerState={careerState}
          saveCareer={saveCareer}
        />
      </div>

      {/* RIGHT: Animated Soccer Pitch with draft slots */}
      <div className="lg:col-span-8 flex flex-col order-1 lg:order-2">
        
        {isMobile ? (
          /* Mobile Swipeable Pitch deck with interactive swipe card gestures */
          <div className="w-full bg-radial from-cyan-950/20 via-[#06080D] to-black rounded-3xl border border-white/10 shadow-2xl p-3 sm:p-4 flex flex-col gap-3 overflow-hidden relative min-h-[500px]">
            {/* Ambient grid background and flare overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(6,182,212,0.015)_1px,transparent_1px),linear-gradient(to_right,rgba(6,182,212,0.015)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

            {/* FAST METRICS & QUICK ACTION HUD */}
            <div className="flex items-center justify-between bg-black/60 backdrop-blur-md border border-white/10 p-2.5 rounded-2xl gap-2 shrink-0 z-10 relative">
              {/* OVR Rating */}
              <div className="flex items-center gap-1.5 pl-1">
                <span className="text-[8px] uppercase font-black text-white/40 tracking-wider font-mono">OVR</span>
                <span className="text-lg font-mono font-black text-cyan-400">
                  {averageRating || "--"}
                </span>
              </div>

              {/* Minimal Divider */}
              <div className="h-4 w-[1px] bg-white/10" />

              {/* Team Chemistry */}
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] uppercase font-black text-white/40 tracking-wider font-mono">CHEM</span>
                <span className="text-lg font-mono font-black text-emerald-400">
                  {calculatedChem.score}%
                </span>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-1.5 ml-auto">
                <button
                  id="mob_quick_auto_draft"
                  onClick={triggerAutoDraft}
                  className="flex items-center gap-1 py-1 px-2.5 bg-cyan-600/25 hover:bg-cyan-650/35 border border-cyan-500/25 rounded-md text-[10px] font-bold text-cyan-400 cursor-pointer active:scale-95 transition-all"
                  title="Auto Draft"
                >
                  <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                  <span>Auto</span>
                </button>
                <button
                  id="mob_quick_reset_draft"
                  onClick={() => {
                    const cleared: LineupSetup = {};
                    formation.positions.forEach((p) => { cleared[p.key] = null; });
                    setLineup(cleared);
                  }}
                  className="flex items-center gap-1 py-1 px-2 bg-rose-600/15 hover:bg-rose-650/25 border border-rose-500/20 rounded-md text-[10px] font-bold text-rose-400 cursor-pointer active:scale-95 transition-all"
                  title="Reset Draft"
                >
                  <RefreshCw className="w-2.5 h-2.5 text-rose-450" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* PART 1: Miniature Haptic Field Map Context */}
            <div className="relative w-full h-24 bg-black/60 border border-white/5 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center p-1 shrink-0">
              {/* Field line markers */}
              <div className="absolute inset-1.5 border border-cyan-500/10 pointer-events-none rounded-xl">
                <div className="absolute top-1/2 inset-x-0 h-[1px] bg-cyan-500/10" />
                <div className="absolute top-[35%] left-[35%] w-[30%] aspect-square border border-cyan-500/10 rounded-full" />
                <div className="absolute top-0 left-[35%] w-[30%] h-1/5 border-b border-x border-cyan-500/10" />
                <div className="absolute bottom-0 left-[35%] w-[30%] h-1/5 border-t border-x border-cyan-500/10" />
              </div>

              {/* Position Dots Layer */}
              <div className="absolute inset-0 z-10 p-2">
                {formation.positions.map((pos, idx) => {
                  const player = lineup[pos.key];
                  const isActive = idx === currentMobileIndex;

                  return (
                    <button
                      key={pos.key}
                      onClick={() => setCurrentMobileIndex(idx)}
                      className="absolute group transition-transform active:scale-90"
                      style={{
                        left: `${pos.x}%`,
                        top: `${100 - pos.y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      title={pos.key}
                    >
                      <div
                        className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[7px] font-black border transition-all duration-300
                          ${isActive
                            ? "bg-cyan-500 border-cyan-350 text-black shadow-[0_0_10px_#06b6d4] scale-115 z-25"
                            : player
                            ? "bg-emerald-600 border-emerald-450 text-white z-10"
                            : "bg-[#090D14]/80 border-white/15 text-slate-400 hover:border-white/30"
                          }`}
                      >
                        {pos.key}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PART 2: Swipable Central Carousel Card */}
            {(() => {
              const pos = formation.positions[currentMobileIndex];
              const player = lineup[pos.key];
              const boostObj = player 
                ? chemistryGraphInstance.getPlayerBoostedRating(player, lineup, formation, eraBalance, careerState.tournamentMode)
                : { boostAmt: 0, eraAdjustment: 0 };

              return (
                <div className="flex-1 flex flex-col items-center justify-center py-1 relative">
                  
                  {/* Cards Swiper Frame */}
                  <div className="w-full flex items-center justify-between gap-3 max-w-sm z-10">
                    
                    {/* Previous Button */}
                    <button
                      onClick={prevMobileSlot}
                      className="w-9 h-9 rounded-full bg-slate-900/90 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white active:scale-90 transition-transform cursor-pointer"
                    >
                      <ChevronLeft className="w-4.5 h-4.5 stroke-[2.5px]" />
                    </button>
                    
                    {/* Swipable motion card wrapper with real draggable motion */}
                    <motion.div
                      key={pos.key}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.5}
                      onDragEnd={(event, info) => {
                        if (info.offset.x < -60) {
                          nextMobileSlot();
                        } else if (info.offset.x > 60) {
                          prevMobileSlot();
                        }
                      }}
                      className="cursor-grab active:cursor-grabbing flex flex-col items-center select-none"
                    >
                      <div className="relative">
                        <ProCard
                          player={player}
                          positionLabel={pos.label}
                          onClick={() => triggerSlotSelection(pos.key, pos.label)}
                          size="lg"
                          chemistryBoost={boostObj.boostAmt}
                          eraAdjustment={boostObj.eraAdjustment}
                          tournamentMode={careerState.tournamentMode}
                        />
                        
                        {!player && (
                          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center pointer-events-none">
                            <span className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-[10px] font-black tracking-widest uppercase py-1 px-3 rounded-full backdrop-blur-xs animate-pulse">
                              Tap to Draft
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* Next Button */}
                    <button
                      onClick={nextMobileSlot}
                      className="w-9 h-9 rounded-full bg-slate-900/90 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white active:scale-90 transition-transform cursor-pointer"
                    >
                      <ChevronRight className="w-4.5 h-4.5 stroke-[2.5px]" />
                    </button>

                  </div>

                  {/* Active card info overlay details */}
                  <div className="text-center mt-2 bg-black/45 border border-white/5 py-1 px-3 rounded-xl z-10 w-full max-w-xs">
                    <span className="text-[8px] uppercase font-mono tracking-widest text-slate-500 block">Draft Position</span>
                    <span className="font-black text-white text-xs">
                      {pos.key} — {pos.label}
                    </span>
                    {player ? (
                      <span className="text-[9px] text-emerald-400 block mt-0.5">
                        🧬 {player.shortName} ({player.originalRating + boostObj.boostAmt + boostObj.eraAdjustment} Rating)
                      </span>
                    ) : (
                      <span className="text-[8px] text-yellow-500/80 block mt-0.5 animate-pulse font-medium">
                        ⚠️ Empty Slot — Tap card to select a Legend
                      </span>
                    )}
                  </div>

                </div>
              );
            })()}

            {/* PART 3: Scrollable row indicator list */}
            <div className="w-full flex gap-1 bg-white/2 py-2 px-1.5 rounded-xl overflow-x-auto pb-1 shrink-0 snap-x justify-start border border-white/5 select-none scrollbar-none">
              {formation.positions.map((pos, idx) => {
                const isDrafted = lineup[pos.key] !== null;
                const isActive = idx === currentMobileIndex;

                return (
                  <button
                    key={pos.key}
                    onClick={() => setCurrentMobileIndex(idx)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[9px] font-bold snap-center shrink-0 transition-colors cursor-pointer
                      ${isActive
                        ? "bg-cyan-600 border-cyan-400 text-white shadow-[0_0_10px_rgba(6,182,212,0.25)] font-black"
                        : isDrafted
                        ? "bg-emerald-955/45 border-emerald-500/20 text-emerald-400 font-black"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200"
                      }`}
                  >
                    {isDrafted && <Check className="w-2 h-2 text-emerald-400 stroke-[3px]" />}
                    <span>{pos.key}</span>
                  </button>
                );
              })}
            </div>

            {/* MOBILE QUICK FORMATION SWITCH SELECTOR */}
            <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-white/50 shrink-0 z-10 relative">
              <span className="font-sans font-medium text-slate-400">Tactics:</span>
              <div className="flex gap-1">
                {FORMATIONS.map((f) => {
                  const isCur = formation.name === f.name;
                  return (
                    <button
                      key={f.name}
                      onClick={() => updateFormationTemplate(f.name)}
                      className={`px-2.5 py-1 rounded text-[9px] font-mono font-bold border transition-colors cursor-pointer ${
                        isCur
                          ? "bg-cyan-600 border-cyan-400 text-white shadow-md shadow-cyan-650/15"
                          : "bg-white/5 border-white/10 text-slate-350 hover:bg-white/10"
                      }`}
                    >
                      {f.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* HIGH VISIBILITY SEAMLESS COMPLETION LAUNCH BUTTON */}
            {isFullHouse && (
              <motion.button
                id="mob_confirm_squad_direct_btn"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={onDraftComplete}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/40 text-xs font-black rounded-2xl tracking-wider text-center uppercase shadow-[0_4px_25px_rgba(16,185,129,0.3)] animate-pulse flex items-center justify-center gap-2 shrink-0 z-20 cursor-pointer text-white mt-1 active:scale-[0.98] transition-transform"
              >
                <PlayCircle className="w-4 h-4 text-white stroke-[3px]" />
                CONFIRM TEAM & PLAY CUP
              </motion.button>
            )}

          </div>
        ) : (
          /* Turf Pitch Container Mockup - Redesigned as dark holographic arena */
          <div className="relative w-full aspect-[5/6] md:aspect-[4.5/5] bg-radial from-cyan-950/15 via-[#06080D] to-black rounded-[40px] border border-white/10 shadow-2xl p-4 overflow-hidden">
            
            {/* Soccer field white/cyan markings */}
            <div className="absolute inset-4 border border-cyan-500/5 pointer-events-none rounded-[32px]">
              {/* Center Line */}
              <div className="absolute top-1/2 inset-x-0 h-[1px] bg-cyan-500/5" />
              {/* Center Circle */}
              <div className="absolute top-[35%] left-[30%] w-[40%] aspect-square border border-cyan-500/5 rounded-full" />
              {/* Penalty areas */}
              <div className="absolute top-0 left-1/4 w-1/2 h-1/6 border-b border-x border-cyan-500/5" />
              <div className="absolute bottom-0 left-1/4 w-1/2 h-1/6 border-t border-x border-cyan-500/5" />
            </div>

            {/* SVG Chemistry links overlay running dynamically */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {formation.positions.map((pos) => {
                const player = lineup[pos.key];
                if (!player) return null;

                return pos.links.map((linkKey) => {
                  // count link edge once safely
                  if (pos.key > linkKey) return null;

                  const neighbor = lineup[linkKey];
                  if (!neighbor) return null;

                  // Lookup link chemistry in the graph
                  const chem = chemistryGraphInstance.getChemistryLink(player.id, neighbor.id);
                  if (chem.weight === 0) return null;

                  // coordinates
                  const x1 = `${pos.x}%`;
                  const y1 = `${100 - pos.y}%`;
                  const neighborDef = formation.positions.find((p) => p.key === linkKey)!;
                  const x2 = `${neighborDef.x}%`;
                  const y2 = `${100 - neighborDef.y}%`;

                  // color
                  let strokeColor = "rgba(148, 163, 184, 0.2)"; // generic grey slim
                  if (chem.clubShared && chem.nationShared) {
                    strokeColor = "rgba(234, 179, 8, 0.75)"; // glowing gold both
                  } else if (chem.clubShared) {
                    strokeColor = "rgba(34, 197, 94, 0.65)"; // bright green same club
                  } else if (chem.nationShared) {
                    strokeColor = "rgba(59, 130, 246, 0.65)"; // blue same nation
                  } else if (chem.eraShared) {
                    strokeColor = "rgba(99, 102, 241, 0.55)"; // Indigo same era
                  }

                  return (
                    <line
                      key={`${pos.key}_${linkKey}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={strokeColor}
                      strokeWidth={chem.weight > 25 ? "3.5" : "2"}
                      strokeDasharray={chem.weight > 25 ? "none" : "4 4"}
                      className="transition-all duration-300 animate-pulse"
                    />
                  );
                });
              })}
            </svg>

            {/* Position Cards Layout */}
            <div className="absolute inset-0 z-10">
              {formation.positions.map((pos) => {
                const player = lineup[pos.key];
                const boostObj = player 
                  ? chemistryGraphInstance.getPlayerBoostedRating(player, lineup, formation, eraBalance, careerState.tournamentMode)
                  : { boostAmt: 0, eraAdjustment: 0 };

                return (
                  <div
                    key={pos.key}
                    className="absolute"
                    style={{
                      left: `${pos.x}%`,
                      top: `${100 - pos.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <ProCard
                      player={player}
                      positionLabel={pos.label}
                      onClick={() => triggerSlotSelection(pos.key, pos.label)}
                      size={isMobile ? "sm" : "md"}
                      chemistryBoost={boostObj.boostAmt}
                      eraAdjustment={boostObj.eraAdjustment}
                      tournamentMode={careerState.tournamentMode}
                    />
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>

       {/* COMPLETED: SQUAD PACK OPENING MODAL & INTERACTIVE REVEAL POPUP */}
      <AnimatePresence>
        {isDrawOpen && (
          <>
            {/* Ambient Darkened Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[99]"
              onClick={() => setIsDrawOpen(false)}
            />

            {isMobile ? (
              /* MOBILE COLLAPSIBLE BOTTOM DRAWER FOR SELECTION */
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 24, stiffness: 200 }}
                className="fixed bottom-0 inset-x-0 bg-[#080B10] border-t border-white/15 rounded-t-[32px] p-5 pb-8 shadow-[0_-15px_40px_rgba(6,182,212,0.25)] z-[100] flex flex-col max-h-[90vh] overflow-y-auto"
              >
                {/* Visual grab bar indicating a drawer */}
                <div className="w-12 h-1.5 bg-white/15 rounded-full mx-auto mb-4 shrink-0" />

                <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-3">
                  <div>
                    <span className="text-[10px] text-cyan-400 tracking-widest font-black uppercase font-mono">
                      {careerState.tournamentMode === "worldcup" ? "WORLD CUP" : "CHAMPIONS LEAGUE"} PACK
                    </span>
                    <h3 className="font-display font-medium text-lg text-white">
                      Drafting Pos: <span className="text-cyan-400 text-xl font-black">{formation.positions.find((p) => p.key === selectedSlotKey)?.label}</span>
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsDrawOpen(false)}
                    className="py-1 px-3 text-[10px] font-semibold rounded bg-white/5 hover:bg-white/10 text-white/75 border border-white/10 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                {/* Draft Pool Unlock Awareness indicator */}
                {(() => {
                  const stats = getDraftPoolRules();
                  return (
                    <div className="p-2.5 mb-3 bg-gradient-to-r from-cyan-950/40 to-indigo-950/30 border border-cyan-500/15 rounded-xl text-[11px]">
                      <div className="flex justify-between items-center font-bold text-white text-[11px]">
                        <span className="flex items-center gap-1">📚 Roster Discoverability Status</span>
                        <span className="text-[10px] font-mono text-cyan-300">Album Collected: {stats.unlockedPercentage}%</span>
                      </div>
                      <p className="opacity-85 text-[10px] mt-0.5 leading-snug text-slate-305">
                        Higher-tier superstars (<span className="text-cyan-300 font-bold">84+ OVR</span>) are locked until unlocked in **Packs**. Unlocked players appear here dynamically!
                      </p>
                    </div>
                  );
                })()}

                {/* Horizontal Swipeable Choices Row to minimize screen crowding */}
                <div className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x snap-mandatory min-h-[310px] items-start scrollbar-none scroll-smooth">
                  {draftChoices.map((p, idx) => {
                    const isRevealed = revealedIds.has(p.id);

                    return (
                      <div key={p.id} className="snap-center shrink-0 flex flex-col items-center w-40">
                        <AnimatePresence mode="wait">
                          {!isRevealed ? (
                            <motion.div
                              key="sealed"
                              initial={{ rotateY: 180, opacity: 0 }}
                              animate={{ rotateY: 0, opacity: 1 }}
                              exit={{ rotateY: -180, opacity: 0 }}
                              transition={{ duration: 0.5 }}
                              onClick={() => setRevealedIds((prev) => new Set([...prev, p.id]))}
                              className="w-36 h-52 bg-gradient-to-b from-cyan-950/25 via-blue-950/25 to-[#0A0D12] border-2 border-cyan-500/35 hover:border-cyan-400 rounded-xl shadow-xl flex flex-col items-center justify-center cursor-pointer select-none relative hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 group"
                            >
                              <div className="absolute inset-2 border border-white/5 rounded pointer-events-none" />
                              <Sparkles className="w-8 h-8 text-cyan-400/60 mb-3 group-hover:scale-110 group-hover:text-cyan-400 transition-all animate-bounce" />
                              <span className="text-[10px] font-bold text-cyan-400/80 tracking-wider">TAP REVEAL</span>
                              <span className="text-[8px] opacity-40 mt-1 uppercase font-mono">Pack #{idx + 1}</span>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="revealed"
                              initial={{ rotateY: 180, opacity: 0, scale: 0.8 }}
                              animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                              transition={{ type: "spring", stiffness: 100, damping: 15 }}
                              className="flex flex-col items-center text-center w-full"
                            >
                              <ProCard
                                player={p}
                                positionLabel={formation.positions.find((pos) => pos.key === selectedSlotKey)?.label || Position.ST}
                                size="md"
                                tournamentMode={careerState.tournamentMode}
                              />
                              
                              {/* Selection submit trigger */}
                              <button
                                id={`commit_select_btn_mob_${p.id}`}
                                onClick={() => commitDraftPick(p)}
                                className="mt-3 py-1.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] rounded-lg tracking-wider transition-colors shadow-md hover:shadow-cyan-500/30 w-full hover:scale-[1.02] active:scale-95 cursor-pointer"
                              >
                                CHOOSE SQUAD
                              </button>
                              
                              {/* Mini-biography text */}
                              <p className="text-[9px] text-slate-400 leading-tight mt-2 opacity-80 h-12 overflow-hidden line-clamp-3">
                                {p.description}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom navigation layout tools */}
                <div className="border-t border-white/5 pt-3 mt-auto flex justify-between items-center text-[10px] text-white/40">
                  <span>Swipe horizontally to browse • Tap to reveal cards</span>
                  <button
                    id="reveal_all_packs_btn_mob"
                    onClick={() => setRevealedIds(new Set(draftChoices.map((p) => p.id)))}
                    className="py-1 px-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-cyan-400 border border-white/10 rounded text-[9px] font-bold cursor-pointer transition-colors"
                  >
                    Reveal All
                  </button>
                </div>

              </motion.div>
            ) : (
              /* DESKTOP CENTERED INTERACTIVE POPUP */
              <div className="fixed inset-0 flex items-center justify-center p-4 z-[100]">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 50 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 50 }}
                  className="relative w-full max-w-5xl bg-[#080B10]/95 border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden"
                >
                  {/* Metallic cyan/blue flare background decoration */}
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_20px_#06b6d4]" />
                  <div className="absolute top-[-20%] left-[-10%] w-[40%] aspect-square rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

                  {/* Header card draft */}
                  <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
                    <div>
                      <span className="text-[10px] text-cyan-400 tracking-widest font-bold uppercase font-mono">
                        {careerState.tournamentMode === "worldcup" ? "WORLD CUP" : "CHAMPIONS LEAGUE"} PACK OPENING
                      </span>
                      <h3 className="font-display font-medium text-xl text-white">
                        Drafting Position: <span className="text-cyan-400 text-2xl font-black">{formation.positions.find((p) => p.key === selectedSlotKey)?.label}</span>
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsDrawOpen(false)}
                      className="py-1 px-3.5 text-xs font-semibold rounded bg-white/5 hover:bg-white/10 text-white/75 border border-white/10 hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel Pack
                    </button>
                  </div>

                  {/* Draft Pool Unlock Awareness indicator */}
                  {(() => {
                    const stats = getDraftPoolRules();
                    return (
                      <div className="p-3.5 mb-6 bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-slate-900/35 border border-cyan-500/10 rounded-xl flex items-center justify-between shadow-lg">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 block">Collection Progression Mode</span>
                          <h4 className="text-sm font-bold text-white">Roster Album Unlocked: {stats.unlockedPercentage}%</h4>
                        </div>
                        <div className="text-right max-w-sm hidden md:block">
                          <p className="text-[11px] text-white/90">
                            Superstars rated <span className="text-cyan-300 font-bold">84+ OVR</span> must be found in the **Pack Store** to appear in draft packs. Standard players under 84 are open by default.
                          </p>
                          <span className="text-[10px] font-mono font-medium text-slate-400 block mt-0.5">
                            Total Unlocked: {stats.unlockedEliteCount} / {stats.totalEliteCount} Elite Players
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Packed player items - reveal-by-reveal cards */}
                  <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center items-center gap-4 md:gap-6 py-6 overflow-x-auto min-h-[300px]">
                    {draftChoices.map((p, idx) => {
                      const isRevealed = revealedIds.has(p.id);

                      return (
                        <div key={p.id} className="flex flex-col items-center">
                          <AnimatePresence mode="wait">
                            {!isRevealed ? (
                              <motion.div
                                key="sealed"
                                initial={{ rotateY: 180, opacity: 0 }}
                                animate={{ rotateY: 0, opacity: 1 }}
                                exit={{ rotateY: -180, opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                onClick={() => setRevealedIds((prev) => new Set([...prev, p.id]))}
                                className="w-36 h-52 bg-gradient-to-b from-cyan-950/20 via-blue-950/25 to-[#0A0D12] border-2 border-cyan-500/30 hover:border-cyan-405 rounded-xl shadow-xl flex flex-col items-center justify-center cursor-pointer select-none relative hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 group"
                              >
                                <div className="absolute inset-2 border border-white/5 rounded pointer-events-none" />
                                <Sparkles className="w-8 h-8 text-cyan-400/50 mb-3 group-hover:scale-110 group-hover:text-cyan-450 transition-all animate-bounce" />
                                <span className="text-[10px] font-bold text-cyan-400/70 tracking-wider">REVEAL LEGEND</span>
                                <span className="text-[8px] opacity-40 mt-1 uppercase font-mono">{careerState.tournamentMode === "worldcup" ? "World Cup" : "UCL"} Pack #{idx + 1}</span>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="revealed"
                                initial={{ rotateY: 180, opacity: 0, scale: 0.8 }}
                                animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                                className="flex flex-col items-center text-center"
                              >
                                <ProCard
                                  player={p}
                                  positionLabel={formation.positions.find((pos) => pos.key === selectedSlotKey)?.label || Position.ST}
                                  size="md"
                                  tournamentMode={careerState.tournamentMode}
                                />
                                
                                {/* Drafting commit selection */}
                                <button
                                  id={`commit_select_btn_${p.id}`}
                                  onClick={() => commitDraftPick(p)}
                                  className="mt-3 py-1.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] rounded-lg tracking-wider transition-colors shadow-md hover:shadow-cyan-500/20 shadow-neutral-900 active:scale-[0.95]"
                                >
                                  CHOOSE SQUAD
                                </button>
                                
                                {/* Short bio info */}
                                <p className="text-[9px] text-slate-400 max-w-[130px] leading-tight mt-2 opacity-80 h-10 overflow-hidden line-clamp-3">
                                  {p.description}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick instructions panel */}
                  <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row gap-2 justify-between items-center text-[11px] text-white/40">
                    <span>Click sealed packs to initiate the interactive board reveal. Pick the best player for your chemistry graph links!</span>
                    <button
                      id="reveal_all_packs_btn"
                      onClick={() => setRevealedIds(new Set(draftChoices.map((p) => p.id)))}
                      className="py-1 px-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-cyan-400 border border-white/10 rounded text-[9px] font-bold cursor-pointer"
                    >
                      Reveal All
                    </button>
                  </div>

                </motion.div>
              </div>
            )}
          </>
        )}
      </AnimatePresence>

      </div>
    </div>
  );
};
export default DraftGrid;
