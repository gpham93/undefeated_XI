import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Trophy, ShieldAlert, Award, Calendar, ChevronRight, Activity, ArrowLeft } from "lucide-react";
import { Player, LineupSetup, Formation, Match, MatchEvent, Difficulty, CustomBadge } from "../types";
import { ChampionsLeagueTournament } from "../utils/simulator";
import { ProCard } from "./ProCard";
import { getNationFlag, getClubShortIcon } from "./ProCard";
import { PerformanceAnalytics } from "./PerformanceAnalytics";

interface SeasonSimulatorProps {
  squadName: string;
  lineup: LineupSetup;
  averageRating: number;
  chemistryScore: number;
  onSeasonComplete: (resultObj: any) => void;
  onExit: () => void;
  difficulty?: Difficulty;
  tournamentMode?: "ucl" | "worldcup";
  customBadge?: CustomBadge | null;
  tournamentYear?: number;
}

export const SeasonSimulator: React.FC<SeasonSimulatorProps> = ({
  squadName,
  lineup,
  averageRating,
  chemistryScore,
  onSeasonComplete,
  onExit,
  difficulty = Difficulty.Amateur,
  tournamentMode = "ucl",
  customBadge = null,
  tournamentYear = 2014,
}) => {
  const [tournament, setTournament] = useState<ChampionsLeagueTournament | null>(null);
  
  // Game state controllers
  const [matchdayIndex, setMatchdayIndex] = useState(1); // Group stage matchdays (1 to 6/3), then KO matches
  const [activeTab, setActiveTab] = useState<"fixtures" | "standings" | "bracket" | "stats" | "analytics">("fixtures");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simMode, setSimMode] = useState<"interactive" | "quick">("interactive");
  
  // Highlighting active simulated match details
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showLiveTicker, setShowLiveTicker] = useState(false);
  const [liveScoreHome, setLiveScoreHome] = useState(0);
  const [liveScoreAway, setLiveScoreAway] = useState(0);
  const [liveEvents, setLiveEvents] = useState<MatchEvent[]>([]);
  const [tickerMinute, setTickerMinute] = useState(0);
  const [copied, setCopied] = useState(false);

  // States for multiplex concurrent live simulators across all matches
  const [activeMatchdayMatches, setActiveMatchdayMatches] = useState<Match[]>([]);
  const [liveScoresHomeMap, setLiveScoresHomeMap] = useState<Record<string, number>>({});
  const [liveScoresAwayMap, setLiveScoresAwayMap] = useState<Record<string, number>>({});
  const [simulationSpeedMs, setSimulationSpeedMs] = useState<number>(600); // Default: 600ms per segment tick (slower than original 300ms)

  // States for sequential simulation
  const [isSequentialSim, setIsSequentialSim] = useState(true);
  const [showOtherMatchesLive, setShowOtherMatchesLive] = useState(false);
  const [isSimulatingSequential, setIsSimulatingSequential] = useState(false);
  const [sequentialMatchesList, setSequentialMatchesList] = useState<Match[]>([]);
  const [currSequentialIndex, setCurrSequentialIndex] = useState<number>(0);

  const skipMatchTickerRef = useRef<() => void>(() => {});

  const isWc = tournamentMode === "worldcup";

  // Dynamic Team Badge render with Wikipedia integration
  const renderTeamBadge = (teamName: string, size: "sm" | "md" | "lg" = "md") => {
    const isUserTeam = tournament && (teamName === tournament.draftedSquadName);
    if (isUserTeam && customBadge) {
      const isWiki = !!customBadge.wikiIcon;
      const shapePath = {
        classic: "polygon(50% 0%, 100% 15%, 100% 75%, 50% 100%, 0% 75%, 0% 15%)",
        round: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        diamond: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
        spiky: "polygon(50% 0%, 95% 10%, 85% 75%, 50% 100%, 15% 75%, 5% 10%)",
      }[customBadge.shieldShape || "classic"];

      const dimensions = size === "sm" ? "w-6 h-7.5 text-xs" : size === "md" ? "w-10 h-12 text-base" : "w-14 h-16.5 text-xl";
      return (
        <div 
          className={`relative flex flex-col items-center justify-center shadow-md shrink-0 border inline-flex ${
            isWiki ? "bg-slate-900 border-white/10 rounded-lg" : customBadge.customBgColor ? "" : `bg-gradient-to-br ${customBadge.bgColor}`
          } ${dimensions}`}
          style={{
            clipPath: isWiki ? undefined : shapePath,
            borderColor: isWiki ? undefined : customBadge.accentColor,
            background: (!isWiki && customBadge.customBgColor) ? customBadge.customBgColor : undefined
          }}
        >
          {isWiki ? (
            <img src={customBadge.wikiIcon} alt="Crest" className={size === "sm" ? "w-[15px] h-[15px] object-contain" : size === "md" ? "w-6 h-6 object-contain" : "w-10 h-10 object-contain"} referrerPolicy="no-referrer" />
          ) : (
            <span className="select-none leading-none scale-90">{customBadge.symbol || "🦁"}</span>
          )}
        </div>
      );
    }

    // Fallback standard icons
    const emoji = getClubShortIcon(teamName);
    const textClass = size === "sm" ? "text-base" : size === "md" ? "text-3xl" : "text-4xl";
    return <span className={`${textClass} select-none`}>{emoji}</span>;
  };

  // Initialize tournament
  useEffect(() => {
    const tour = new ChampionsLeagueTournament(squadName, lineup, averageRating, chemistryScore, difficulty, (tournamentMode || "ucl") as "ucl" | "worldcup", tournamentYear);
    setTournament(tour);
  }, [squadName, lineup, averageRating, chemistryScore, difficulty, tournamentMode, tournamentYear]);

  if (!tournament) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500" />
      </div>
    );
  }

  // Helper to run sequential group matches one by one
  const runSingleGroupSequentialMatch = (matchesList: Match[], index: number) => {
    const rawMatch = matchesList[index];
    const isUserMatch = rawMatch.homeTeam === tournament.draftedSquadName || rawMatch.awayTeam === tournament.draftedSquadName;

    // Simulate this match mathematically
    const simulatedMatch = tournament.simulateSpecificMatch(rawMatch);

    const advanceToNext = () => {
      const nextIndex = index + 1;
      if (nextIndex < matchesList.length) {
        setCurrSequentialIndex(nextIndex);
        runSingleGroupSequentialMatch(matchesList, nextIndex);
      } else {
        // Complete matchday simulation
        setIsSimulatingSequential(false);
        setIsSimulating(false);
        setMatchdayIndex((prev) => prev + 1);
        setTournament(Object.create(tournament));
      }
    };

    if (isUserMatch || showOtherMatchesLive) {
      triggerLiveMatchTicker(matchesList, simulatedMatch, advanceToNext);
    } else {
      // Instantly quick-sim matches that don't involve the user
      advanceToNext();
    }
  };

  // Group Matchday triggers
  const simulateGroupStageMatchday = () => {
    const maxGroupMatchdays = isWc ? 3 : 6;
    if (matchdayIndex > maxGroupMatchdays || isSimulating) return;

    setIsSimulating(true);

    if (isSequentialSim) {
      // Find the next unplayed fixtures for this Matchday (16 for WC groups, 8 for UCL groups)
      const daySize = isWc ? 16 : 8;
      const unplayed = tournament.fixtures.filter((f) => !f.isSimulated).slice(0, daySize);
      if (unplayed.length === 0) {
        setIsSimulating(false);
        return;
      }
      setSequentialMatchesList(unplayed);
      setCurrSequentialIndex(0);
      setIsSimulatingSequential(true);
      runSingleGroupSequentialMatch(unplayed, 0);
    } else {
      // Simulate current round Robin fixtures in parallel instantly
      const matches = tournament.simulateNextGroupMatchday();
      const userMatch = matches.find(
        (m) => m.homeTeam === tournament.draftedSquadName || m.awayTeam === tournament.draftedSquadName
      );

      if (userMatch) {
        triggerLiveMatchTicker(matches, userMatch, () => {
          setIsSimulating(false);
          setMatchdayIndex((prev) => prev + 1);
          setTournament(Object.create(tournament));
        });
      } else {
        setIsSimulating(false);
        setMatchdayIndex((prev) => prev + 1);
        setTournament(Object.create(tournament));
      }
    }
  };

  // Instant solver for all remaining stages of the campaign
  const handleQuickSimEntireTournament = () => {
    if (!tournament || isSimulating) return;
    setIsSimulating(true);

    let currentStage = matchdayIndex;

    if (isWc) {
      // Group Stage (matchdays 1, 2, 3)
      while (currentStage <= 3) {
        tournament.simulateNextGroupMatchday();
        currentStage++;
      }
      // Round of 16 (index 4)
      if (currentStage === 4) {
        tournament.qualifyRoundOf16();
        currentStage = 5;
      }
      // Quarter-Finals (index 5)
      if (currentStage === 5) {
        tournament.qualifyTopTeams();
        currentStage = 6;
      }
      // Semi-Finals (index 6)
      if (currentStage === 6) {
        tournament.playSemiFinals();
        currentStage = 7;
      }
      // Neutral Final (index 7)
      if (currentStage === 7) {
        tournament.playFinal();
        currentStage = 8;
      }
      setMatchdayIndex(8);
    } else {
      // Simulate Group Stage (if UCL mode and index between 1 and 6)
      while (currentStage <= 6) {
        tournament.simulateNextGroupMatchday();
        currentStage++;
      }
      // Quarter-Finals (index 7)
      if (currentStage === 7) {
        tournament.qualifyTopTeams();
        currentStage = 8;
      }
      // Semi-Finals (index 8)
      if (currentStage === 8) {
        tournament.playSemiFinals();
        currentStage = 9;
      }
      // Neutral Final (index 9)
      if (currentStage === 9) {
        tournament.playFinal();
        currentStage = 10;
      }
      setMatchdayIndex(10);
    }

    // Refresh the tournament state representation
    setTournament(Object.create(tournament));
    setIsSimulating(false);
  };

  // Run live matching commentary animation with multiplex parallel updates
  const triggerLiveMatchTicker = (matchesList: Match[], focusMatch: Match, callback: () => void) => {
    if (simMode === "quick") {
      callback();
      return;
    }
    
    setActiveMatchdayMatches(matchesList);
    setSelectedMatch(focusMatch);
    setShowLiveTicker(true);
    
    // Seed maps
    const initialHomeScores: Record<string, number> = {};
    const initialAwayScores: Record<string, number> = {};
    matchesList.forEach((m) => {
      initialHomeScores[m.id] = 0;
      initialAwayScores[m.id] = 0;
    });
    setLiveScoresHomeMap(initialHomeScores);
    setLiveScoresAwayMap(initialAwayScores);

    setLiveScoreHome(0);
    setLiveScoreAway(0);
    setLiveEvents([]);
    setTickerMinute(0);

    let currentSegment = 0;
    const totalSegments = 24;
    const allEvents = [...focusMatch.scoreEvents];

    const timer = setInterval(() => {
      currentSegment += 1;
      
      const prevMin = Math.round((currentSegment - 1) * (90 / totalSegments));
      const currentMin = Math.round(currentSegment * (90 / totalSegments));
      
      setTickerMinute(currentMin);

      // 1. Process events for focusing match
      const occurring = allEvents.filter((e) => e.minute > prevMin && e.minute <= currentMin);
      if (occurring.length > 0) {
        setLiveEvents((prev) => [...occurring, ...prev]);

        occurring.forEach((e) => {
          if (e.type === "GOAL") {
            if (e.team === "home") {
              setLiveScoreHome((val) => val + 1);
            } else {
              setLiveScoreAway((val) => val + 1);
            }
          }
        });
      }

      // 2. Accumulate scores live for ALL matches up to currentMin (relative to current index for sequence mode)
      const updatedHomeScores: Record<string, number> = {};
      const updatedAwayScores: Record<string, number> = {};

      matchesList.forEach((m, matchIdx) => {
        const matchesListFullIndex = isSimulatingSequential ? matchesList.indexOf(focusMatch) : -1;
        
        if (isSimulatingSequential && matchesListFullIndex !== -1) {
          if (matchIdx < matchesListFullIndex) {
            // Already completed games show full score
            updatedHomeScores[m.id] = m.homeScore;
            updatedAwayScores[m.id] = m.awayScore;
          } else if (matchIdx === matchesListFullIndex) {
            // Active sequential game ticks live
            let curHome = 0;
            let curAway = 0;
            m.scoreEvents.forEach((ev) => {
              if (ev.minute <= currentMin && ev.type === "GOAL") {
                if (ev.team === "home") curHome++;
                else curAway++;
              }
            });
            updatedHomeScores[m.id] = curHome;
            updatedAwayScores[m.id] = curAway;
          } else {
            // Upcoming sequential games show Pending (0-0)
            updatedHomeScores[m.id] = 0;
            updatedAwayScores[m.id] = 0;
          }
        } else {
          // Parallel mode (original multiplex concurrent update behavior)
          let curHome = 0;
          let curAway = 0;
          m.scoreEvents.forEach((ev) => {
            if (ev.minute <= currentMin && ev.type === "GOAL") {
              if (ev.team === "home") curHome++;
              else curAway++;
            }
          });
          updatedHomeScores[m.id] = curHome;
          updatedAwayScores[m.id] = curAway;
        }
      });

      setLiveScoresHomeMap(updatedHomeScores);
      setLiveScoresAwayMap(updatedAwayScores);

      if (currentSegment >= totalSegments) {
        clearInterval(timer);
        
        // Handle extra time events at 91+ minutes
        const extraTimeEvents = allEvents.filter((e) => e.minute > 90);
        if (extraTimeEvents.length > 0) {
          setTimeout(() => {
            setTickerMinute(120);
            setLiveEvents((prev) => [...extraTimeEvents, ...prev]);
            extraTimeEvents.forEach((e) => {
              if (e.type === "GOAL") {
                if (e.team === "home") {
                  setLiveScoreHome((val) => val + 1);
                } else {
                  setLiveScoreAway((val) => val + 1);
                }
              }
            });

            // Make sure final maps are fully set
            const finalHomeScores: Record<string, number> = {};
            const finalAwayScores: Record<string, number> = {};
            matchesList.forEach((ml) => {
              finalHomeScores[ml.id] = ml.homeScore;
              finalAwayScores[ml.id] = ml.awayScore;
            });
            setLiveScoresHomeMap(finalHomeScores);
            setLiveScoresAwayMap(finalAwayScores);

            setTimeout(() => {
              setShowLiveTicker(false);
              callback();
            }, 2500);
          }, 1500);
        } else {
          setTimeout(() => {
            setShowLiveTicker(false);
            callback();
          }, 1800);
        }
      }
    }, simulationSpeedMs);

    // Setup skip callback handler
    skipMatchTickerRef.current = () => {
      clearInterval(timer);
      
      // Calculate final target scores instantly
      setLiveScoreHome(focusMatch.homeScore);
      setLiveScoreAway(focusMatch.awayScore);
      const maxMinutes = focusMatch.scoreEvents.some((e) => e.minute > 90) ? 120 : 90;
      setTickerMinute(maxMinutes);

      // Trigger all full outcomes for simultaneous matches
      const finalHomeScores: Record<string, number> = {};
      const finalAwayScores: Record<string, number> = {};
      matchesList.forEach((m, matchIdx) => {
        const matchesListFullIndex = isSimulatingSequential ? matchesList.indexOf(focusMatch) : -1;
        if (isSimulatingSequential && matchesListFullIndex !== -1) {
          if (matchIdx <= matchesListFullIndex) {
            finalHomeScores[m.id] = m.homeScore;
            finalAwayScores[m.id] = m.awayScore;
          } else {
            finalHomeScores[m.id] = 0;
            finalAwayScores[m.id] = 0;
          }
        } else {
          finalHomeScores[m.id] = m.homeScore;
          finalAwayScores[m.id] = m.awayScore;
        }
      });
      setLiveScoresHomeMap(finalHomeScores);
      setLiveScoresAwayMap(finalAwayScores);

      // Quick show all goal events in ticker commentary
      setLiveEvents([...focusMatch.scoreEvents].reverse());

      setTimeout(() => {
        setShowLiveTicker(false);
        callback();
      }, 1000);
    };
  };

  const resolveKnockoutDrawDirectly = (match: Match) => {
    const isHomeUser = match.homeTeam === tournament.draftedSquadName;
    const isAwayUser = match.awayTeam === tournament.draftedSquadName;
    
    const homeRatingVal = isHomeUser ? tournament.draftedAvgRating : 80;
    const awayRatingVal = isAwayUser ? tournament.draftedAvgRating : 80;
    
    const homeWins = Math.random() < (homeRatingVal / (homeRatingVal + awayRatingVal));
    const extraGoalsHome = (Math.random() < 0.2) ? 1 : 0;
    const extraGoalsAway = (Math.random() < 0.2) ? 1 : 0;

    if (extraGoalsHome > 0) {
      match.homeScore += extraGoalsHome;
      match.scoreEvents.push({
        minute: 105,
        type: "GOAL",
        playerName: isHomeUser ? "Your Star Attack" : `${match.homeTeam} Attacker`,
        team: "home",
        description: `⚽ EXTRA-TIME GOAL! ${match.homeTeam} break the parity in the 105th minute of extra time!`
      });
    }

    if (extraGoalsAway > 0) {
      match.awayScore += extraGoalsAway;
      match.scoreEvents.push({
        minute: 112,
        type: "GOAL",
        playerName: isAwayUser ? "Your Star Attack" : `${match.awayTeam} Attacker`,
        team: "away",
        description: `⚽ EXTRA-TIME GOAL! ${match.awayTeam} equalize in the 112th minute with spectacular composure!`
      });
    }

    if (match.homeScore === match.awayScore) {
      const penHome = homeWins ? 5 : 4;
      const penAway = homeWins ? 4 : 5;
      
      match.scoreEvents.push({
        minute: 120,
        type: "GOAL",
        playerName: homeWins ? match.homeTeam : match.awayTeam,
        team: homeWins ? "home" : "away",
        description: `🏆 PENALTY SHOOTOUT RESOLUTION! ${match.homeTeam} [ ${penHome} - ${penAway} ] ${match.awayTeam}. ${homeWins ? match.homeTeam : match.awayTeam} triumph after an absolute thriller of a shootout!`
      });

      if (homeWins) match.homeScore += 1;
      else match.awayScore += 1;
    } else {
      const ETWinner = match.homeScore > match.awayScore ? match.homeTeam : match.awayTeam;
      match.scoreEvents.push({
        minute: 120,
        type: "GOAL",
        playerName: ETWinner,
        team: match.homeScore > match.awayScore ? "home" : "away",
        description: `⏱️ EXTRA-TIME FULL TIME! ${ETWinner} hold off their opponents to seal a magnificent knockout victory!`
      });
    }
  };

  const resolveUclDbLegDraw = (leg2: Match, leg1: Match) => {
    const isHomeUser = leg2.homeTeam === tournament.draftedSquadName;
    const isAwayUser = leg2.awayTeam === tournament.draftedSquadName;

    const homeRatingVal = isHomeUser ? tournament.draftedAvgRating : 80;
    const awayRatingVal = isAwayUser ? tournament.draftedAvgRating : 80;

    const homeWins = Math.random() < (homeRatingVal / (homeRatingVal + awayRatingVal));
    const extraGoalsHome = (Math.random() < 0.2) ? 1 : 0;
    const extraGoalsAway = (Math.random() < 0.2) ? 1 : 0;

    if (extraGoalsHome > 0) {
      leg2.homeScore += extraGoalsHome;
      leg2.scoreEvents.push({
        minute: 105,
        type: "GOAL",
        playerName: isHomeUser ? "Your Star Attack" : `${leg2.homeTeam} Attacker`,
        team: "home",
        description: `⚽ EXTRA-TIME GOAL! ${leg2.homeTeam} score in extra time to put themselves ahead on aggregate!`
      });
    }

    if (extraGoalsAway > 0) {
      leg2.awayScore += extraGoalsAway;
      leg2.scoreEvents.push({
        minute: 112,
        type: "GOAL",
        playerName: isAwayUser ? "Your Star Attack" : `${leg2.awayTeam} Attacker`,
        team: "away",
        description: `⚽ EXTRA-TIME GOAL! ${leg2.awayTeam} respond instantly, levelling the tie on aggregate once more!`
      });
    }

    const totalB = leg1.awayScore + leg2.homeScore;
    const totalA = leg1.homeScore + leg2.awayScore;

    if (totalB === totalA) {
      const bWins = homeWins;
      const penB = bWins ? 5 : 4;
      const penA = bWins ? 4 : 5;

      leg2.scoreEvents.push({
        minute: 120,
        type: "GOAL",
        playerName: bWins ? leg2.homeTeam : leg2.awayTeam,
        team: bWins ? "home" : "away",
        description: `🏆 UEFA CHAMPIONS LEAGUE SHOOTOUT! ${leg2.homeTeam} [ ${penB} - ${penA} ] ${leg2.awayTeam}. ${bWins ? leg2.homeTeam : leg2.awayTeam} emerge victorious under immense pressure!`
      });

      if (bWins) leg2.homeScore += 1;
      else leg2.awayScore += 1;
    } else {
      const aggWinner = totalB > totalA ? leg2.homeTeam : leg2.awayTeam;
      leg2.scoreEvents.push({
        minute: 120,
        type: "GOAL",
        playerName: aggWinner,
        team: totalB > totalA ? "home" : "away",
        description: `⏱️ EXTRA-TIME FULL TIME! ${aggWinner} advance on aggregate after a grueling extra-time battle!`
      });
    }
  };

  // Run Round of 16 simulations (only for World Cup mode)
  const playRoundOf16Round = () => {
    setIsSimulating(true);
    tournament.qualifyRoundOf16();

    // Look for user match
    let userMatch: Match | undefined;
    tournament.r16Matches.forEach((m) => {
      if (m.homeTeam === tournament.draftedSquadName || m.awayTeam === tournament.draftedSquadName) {
        userMatch = m;
      }
    });

    if (userMatch) {
      if (!userMatch.isSimulated) {
        tournament.simulateSpecificMatch(userMatch);
        if (userMatch.homeScore === userMatch.awayScore) {
          resolveKnockoutDrawDirectly(userMatch);
        }
      }
      triggerLiveMatchTicker(tournament.r16Matches, userMatch, () => {
        setIsSimulating(false);
        setTournament(Object.create(tournament));
        setMatchdayIndex(5); // Advance to Quarter Finals (matchdayIndex 5)
      });
    } else {
      setIsSimulating(false);
      setTournament(Object.create(tournament));
      setMatchdayIndex(5);
    }
  };

  // Run Quarter-Final simulations (single-legged for WC, double-legged for UCL)
  const playQuarterFinalsRound = () => {
    setIsSimulating(true);
    tournament.qualifyTopTeams();
    
    // Look for user couple
    let userCoupleKey = "";
    let userLegs: Match[] = [];
    (Object.entries(tournament.qfLegs) as [string, Match[]][]).forEach(([key, legs]) => {
      if (legs[0].homeTeam === tournament.draftedSquadName || legs[0].awayTeam === tournament.draftedSquadName) {
        userCoupleKey = key;
        userLegs = legs;
      }
    });

    if (userLegs.length > 0) {
      if (isWc) {
        // Single leg
        const allQfLegs = Object.values(tournament.qfLegs).map(legs => legs[0]);
        const targetMatch = userLegs[0];

        if (!targetMatch.isSimulated) {
          tournament.simulateSpecificMatch(targetMatch);
          if (targetMatch.homeScore === targetMatch.awayScore) {
            resolveKnockoutDrawDirectly(targetMatch);
          }
        }

        // Simulate any other remaining unsimulated QF matches
        allQfLegs.forEach((m) => {
          if (!m.isSimulated) {
            tournament.simulateSpecificMatch(m);
            if (m.homeScore === m.awayScore) {
              if (Math.random() > 0.5) m.homeScore += 1;
              else m.awayScore += 1;
            }
          }
        });

        triggerLiveMatchTicker(allQfLegs, targetMatch, () => {
          setIsSimulating(false);
          setTournament(Object.create(tournament));
          setMatchdayIndex(6); // mark QF complete, move to SF
        });
      } else {
        // Show leg 1 ticker, then leg 2 ticker sequentially
        const legs1 = Object.values(tournament.qfLegs).map(legs => legs[0]);
        const legs2 = Object.values(tournament.qfLegs).map(legs => legs[1]).filter(Boolean);

        const leg1 = userLegs[0];
        const leg2 = userLegs[1];

        // Resolve leg2 if total aggregate ends in a draw
        const aggA = leg1.homeScore + leg2.awayScore;
        const aggB = leg1.awayScore + leg2.homeScore;
        if (aggA === aggB) {
          resolveUclDbLegDraw(leg2, leg1);
        }

        triggerLiveMatchTicker(legs1, userLegs[0], () => {
          // Now do Leg 2
          setTimeout(() => {
            triggerLiveMatchTicker(legs2, userLegs[1], () => {
              setIsSimulating(false);
              setTournament(Object.create(tournament));
              setMatchdayIndex(8); // mark QF complete
            });
          }, 500);
        });
      }
    } else {
      setIsSimulating(false);
      setTournament(Object.create(tournament));
      setMatchdayIndex(isWc ? 6 : 8);
    }
  };

  // Run Semi-Final simulations (single-legged for WC, double-legged for UCL)
  const playSemiFinalsRound = () => {
    setIsSimulating(true);
    tournament.playSemiFinals();

    let userLegs: Match[] = [];
    (Object.entries(tournament.sfLegs) as [string, Match[]][]).forEach(([key, legs]) => {
      if (legs[0].homeTeam === tournament.draftedSquadName || legs[0].awayTeam === tournament.draftedSquadName) {
        userLegs = legs;
      }
    });

    if (userLegs.length > 0) {
      if (isWc) {
        // Single leg
        const allSfLegs = Object.values(tournament.sfLegs).map(legs => legs[0]);
        const targetMatch = userLegs[0];

        // For user comfort, if user is in SF and somehow it holds draw (simulateMatch should have resolved but we can be extra sure)
        if (targetMatch.homeScore === targetMatch.awayScore) {
          resolveKnockoutDrawDirectly(targetMatch);
        }

        triggerLiveMatchTicker(allSfLegs, targetMatch, () => {
          setIsSimulating(false);
          setTournament(Object.create(tournament));
          setMatchdayIndex(7); // mark SF complete, move to Grand Final
        });
      } else {
        const legs1 = Object.values(tournament.sfLegs).map(legs => legs[0]);
        const legs2 = Object.values(tournament.sfLegs).map(legs => legs[1]).filter(Boolean);

        const leg1 = userLegs[0];
        const leg2 = userLegs[1];

        // Resolve leg2 if total aggregate ends in a draw
        const aggA = leg1.homeScore + leg2.awayScore;
        const aggB = leg1.awayScore + leg2.homeScore;
        if (aggA === aggB) {
          resolveUclDbLegDraw(leg2, leg1);
        }

        triggerLiveMatchTicker(legs1, userLegs[0], () => {
          setTimeout(() => {
            triggerLiveMatchTicker(legs2, userLegs[1], () => {
              setIsSimulating(false);
              setTournament(Object.create(tournament));
              setMatchdayIndex(9); // mark SF complete
            });
          }, 500);
        });
      }
    } else {
      setIsSimulating(false);
      setTournament(Object.create(tournament));
      setMatchdayIndex(isWc ? 7 : 9);
    }
  };

  // Run final championship simulation
  const playNeutralFinalMatch = () => {
    setIsSimulating(true);
    const finalMatch = tournament.playFinal();

    const userPlays = finalMatch.homeTeam === tournament.draftedSquadName || finalMatch.awayTeam === tournament.draftedSquadName;

    if (userPlays || true) { // Always show final ticker for hype
      // `playFinal()` will resolve any draws with penalty shootout comments and update finalMatch accordingly.
      triggerLiveMatchTicker([finalMatch], finalMatch, () => {
        setIsSimulating(false);
        setTournament(Object.create(tournament));
        setMatchdayIndex(isWc ? 8 : 10); // Final complete, go to complete state
      });
    } else {
      setIsSimulating(false);
      setTournament(Object.create(tournament));
      setMatchdayIndex(isWc ? 8 : 10);
    }
  };

  // Wrap up season statistics and push state to main Career tracking
  const handleSeasonFinished = () => {
    const perf = tournament.getUserFarthestStageReached();
    
    // Assemble structured results log
    const userResultObj = {
      draftedSquadName: tournament.draftedSquadName,
      chemistryScore: tournament.draftedChemScore,
      squadAverageRating: tournament.draftedAvgRating,
      stageReached: perf.stageReached,
      record: { wins: perf.wins, draws: perf.draws, losses: perf.losses },
      playerStats: {} as any,
    };

    // Pack player performance stats
    (Object.entries(tournament.playerStatTracker) as [string, { id: string; goals: number; assists: number; ratingsSum: number; appearances: number; isUserTeam: boolean }][]).forEach(([name, stats]) => {
      if (stats.isUserTeam) {
        userResultObj.playerStats[stats.id] = {
          goals: stats.goals,
          assists: stats.assists,
          cleanSheets: Math.max(0, perf.wins - stats.goals), // simple math ratio
          gamesPlayed: stats.appearances,
          averageRating: stats.appearances > 0 ? Math.round((stats.ratingsSum / stats.appearances) * 10) / 10 : 6.0,
        };
      }
    });

    onSeasonComplete(userResultObj);
  };

  // Resolve top scorers lists
  const sortedScorers = (Object.entries(tournament.playerStatTracker) as [string, { id: string; goals: number; assists: number; ratingsSum: number; appearances: number; isUserTeam: boolean }][])
    .map(([name, val]) => ({ name, ...val }))
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 10);

  const sortedAssisters = (Object.entries(tournament.playerStatTracker) as [string, { id: string; goals: number; assists: number; ratingsSum: number; appearances: number; isUserTeam: boolean }][])
    .map(([name, val]) => ({ name, ...val }))
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 10);

  const activeUserUclFixture = tournament.fixtures.filter(
    (f) =>
      (f.homeTeam === tournament.draftedSquadName || f.awayTeam === tournament.draftedSquadName) &&
      !f.isSimulated
  )[0];

  return (
    <div className="py-4 relative z-10 font-sans">
      
      {/* Header controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-5 mb-6 gap-4">
        <div className="flex items-center gap-3">
          {renderTeamBadge(tournament.draftedSquadName, "lg")}
          <div>
            <span className={`text-[10px] tracking-widest font-mono font-bold uppercase ${isWc ? "text-amber-450" : "text-cyan-400"}`}>
              {isWc ? "🏆 Global World Cup Tournament Arena" : "🇪🇺 UEFA Champions League Tournament Arena"}
            </span>
            <h2 className="font-display font-medium text-2xl text-white mt-1">
              Managing: <span className={`font-black ${isWc ? "text-amber-450" : "text-cyan-400"}`}>{tournament.draftedSquadName}</span>
            </h2>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap items-center">
          <button
            id="back_to_draft_btn"
            onClick={onExit}
            className="flex items-center gap-1.5 py-2 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs text-white font-semibold cursor-pointer transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Draft
          </button>

          {/* Simulation mode switch selector */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 items-center">
            <button
              type="button"
              onClick={() => setSimMode("interactive")}
              className={`py-1.5 px-3 rounded-lg text-[11px] font-bold transition-all ${
                simMode === "interactive"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/10 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🎙️ Live Ticker
            </button>
            <button
              type="button"
              onClick={() => setSimMode("quick")}
              className={`py-1.5 px-3 rounded-lg text-[11px] font-bold transition-all ${
                simMode === "quick"
                  ? "bg-amber-500/20 text-amber-450 border border-amber-500/10 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ⚡ Quick Sim
            </button>
          </div>

          {simMode === "interactive" && (
            <div className="flex flex-wrap items-center gap-3 bg-black/40 p-1.5 px-3 rounded-xl border border-white/5 h-9">
              <label className="flex items-center gap-1.5 text-[11px] text-slate-355 select-none cursor-pointer font-medium hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={isSequentialSim}
                  onChange={(e) => setIsSequentialSim(e.target.checked)}
                  className="rounded border-slate-705 bg-slate-900 text-emerald-505 focus:ring-emerald-505 w-3.5 h-3.5"
                />
                <span>📋 Game-by-Game</span>
              </label>

              {isSequentialSim && (
                <label className="flex items-center gap-1.5 text-[11px] text-slate-355 select-none cursor-pointer font-medium border-l border-white/5 pl-3 hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={showOtherMatchesLive}
                    onChange={(e) => setShowOtherMatchesLive(e.target.checked)}
                    className="rounded border-slate-705 bg-slate-900 text-emerald-505 focus:ring-emerald-505 w-3.5 h-3.5"
                  />
                  <span>👀 Spectate Opponents</span>
                </label>
              )}
            </div>
          )}

          {/* Entire Campaign Rapid solver button */}
          {simMode === "quick" && matchdayIndex < (isWc ? 8 : 10) && (
            <button
              type="button"
              onClick={handleQuickSimEntireTournament}
              className="py-2 px-4 shadow-md text-xs font-black rounded-xl transition-all border text-black bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 border-yellow-300 cursor-pointer"
            >
              🚀 Sim Entire Season
            </button>
          )}
          
          {((!isWc && matchdayIndex <= 6) || (isWc && matchdayIndex <= 3)) && (
            <button
              id={`simulate_md_btn_md${matchdayIndex}`}
              onClick={simulateGroupStageMatchday}
              disabled={isSimulating}
              className={`flex items-center gap-2 py-2 px-5 rounded-xl font-extrabold text-xs text-white shadow-md cursor-pointer disabled:opacity-50 transition-all border ${
                isWc 
                  ? "bg-amber-600 hover:bg-amber-500 shadow-amber-500/25 border-amber-400/30" 
                  : "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/25 border-cyan-400/30"
              }`}
            >
              <Play className="w-4 h-4 fill-current text-white" />
              SIMULATE MATCHDAY {matchdayIndex}
            </button>
          )}

          {isWc && matchdayIndex === 4 && (
            <button
              id="simulate_r16_btn"
              onClick={playRoundOf16Round}
              disabled={isSimulating}
              className="flex items-center gap-2 py-2 px-5 rounded-xl font-extrabold text-xs text-white shadow-md cursor-pointer disabled:opacity-50 transition-all border bg-amber-600 hover:bg-amber-500 shadow-amber-500/25 border-amber-400/30"
            >
              <Trophy className="w-4 h-4 text-white" />
              PLAY Round of 16
            </button>
          )}

          {((!isWc && matchdayIndex === 7) || (isWc && matchdayIndex === 5)) && (
            <button
              id="simulate_qf_btn"
              onClick={playQuarterFinalsRound}
              disabled={isSimulating}
              className={`flex items-center gap-2 py-2 px-5 rounded-xl font-extrabold text-xs text-white shadow-md cursor-pointer disabled:opacity-50 transition-all border ${
                isWc 
                  ? "bg-amber-600 hover:bg-amber-500 shadow-amber-500/25 border-amber-400/30" 
                  : "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/25 border-cyan-400/30"
              }`}
            >
              <Trophy className="w-4 h-4 text-white" />
              {isWc ? "PLAY Quarter-Finals" : "PLAY QUARTER-FINALS LEGS"}
            </button>
          )}

          {((!isWc && matchdayIndex === 8) || (isWc && matchdayIndex === 6)) && (
            <button
              id="simulate_sf_btn"
              onClick={playSemiFinalsRound}
              disabled={isSimulating}
              className={`flex items-center gap-2 py-2 px-5 rounded-xl font-extrabold text-xs text-white shadow-md cursor-pointer disabled:opacity-50 transition-all border ${
                isWc 
                  ? "bg-amber-600 hover:bg-amber-500 shadow-amber-500/25 border-amber-400/30" 
                  : "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/25 border-cyan-400/30"
              }`}
            >
              <Award className="w-4 h-4 text-white" />
              {isWc ? "PLAY Semi-Finals" : "PLAY SEMI-FINALS LEGS"}
            </button>
          )}

          {((!isWc && matchdayIndex === 9) || (isWc && matchdayIndex === 7)) && (
            <button
              id="simulate_final_btn"
              onClick={playNeutralFinalMatch}
              disabled={isSimulating}
              className={`flex items-center gap-2 py-2.5 px-6 rounded-xl font-black text-xs text-white shadow-lg cursor-pointer animate-pulse border ${
                isWc 
                  ? "bg-amber-600 hover:bg-amber-500 shadow-amber-500/40 border-amber-450/50" 
                  : "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/40 border-cyan-405/50"
              }`}
            >
              <Trophy className="w-4.5 h-4.5 text-white" />
              {isWc ? "SIMULATE WORLD CUP FINAL" : "SIMULATE CHAMPIONS LEAGUE FINAL"}
            </button>
          )}

          {matchdayIndex >= (isWc ? 8 : 10) && (
            <button
              id="finalize_season_btn"
              onClick={handleSeasonFinished}
              className={`flex items-center gap-2 py-2.5 px-6 rounded-xl font-extrabold text-xs text-white shadow-md cursor-pointer border ${
                isWc 
                  ? "bg-amber-600 hover:bg-amber-500 shadow-amber-500/25 border-amber-455/30" 
                  : "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/20 border-cyan-405/30"
              }`}
            >
              FINALIZE SEASON RESULTS
            </button>
          )}
        </div>
      </div>

      {/* Campaign Complete Social Share Banner */}
      {matchdayIndex >= (isWc ? 8 : 10) && (() => {
        const perf = tournament.getUserFarthestStageReached();
        const isUndefeated = perf.losses === 0;
        const formatName = isWc ? "Global World Cup" : "UEFA Champions League";
        const statusText = isUndefeated ? "🛡️ UNDEFEATED / INVINCIBLE 🛡️" : `reached the ${perf.stageReached}`;
        const tweetText = `🎮 Drafted a legendary 🪐 ${tournament.draftedSquadName} dynasty in undefeated XI!\n\n⚽ Format: ${formatName}\n📊 Rating: ${tournament.draftedAvgRating} OVR | Chemistry: ${tournament.draftedChemScore}%\n🏆 Record: ${perf.wins}W - ${perf.draws}D - ${perf.losses}L (${statusText})\n\nDraft your squad and challenge my record! #UndefeatedXI`;

        return (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 mb-6 rounded-2xl border ${
              isWc 
                ? "bg-radial from-amber-955/20 via-slate-900 to-black border-amber-500/30 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.15)]" 
                : "bg-radial from-cyan-955/20 via-slate-900 to-black border-cyan-500/30 text-cyan-100 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
            } relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-5`}
          >
            {/* Ambient gold or blue background highlight shine */}
            <div className={`absolute top-0 right-0 w-[40%] aspect-square rounded-full filter blur-3xl opacity-10 pointer-events-none ${isWc ? "bg-amber-400" : "bg-cyan-400"}`} />

            <div className="space-y-2 text-center md:text-left">
              <span className={`text-[10px] tracking-widest font-mono font-bold uppercase py-1 px-2.5 rounded-full border ${isWc ? "bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse" : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 animate-pulse"}`}>
                🎉 Legendary Campaign Logged!
              </span>
              <h3 className="font-display font-bold text-lg text-white mt-1">
                Share "{tournament.draftedSquadName}" to Social Media!
              </h3>
              <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                You went <span className="font-bold text-white">{perf.wins}W - {perf.draws}D - {perf.losses}L</span> and finished as <span className={`font-semibold ${isWc ? "text-amber-450" : "text-cyan-400"}`}>{perf.stageReached}</span> in the {formatName}! Post your dynasty status below.
              </p>
            </div>

            <div className="flex flex-wrap md:flex-nowrap gap-2 items-center w-full md:w-auto shrink-0 justify-center">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(tweetText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className={`py-2 px-4 shadow-md text-xs font-black rounded-xl transition-all border shrink-0 text-black font-semibold cursor-pointer ${
                  isWc 
                    ? "bg-amber-400 hover:bg-amber-300 border-amber-300" 
                    : "bg-cyan-400 hover:bg-cyan-300 border-cyan-300"
                }`}
              >
                {copied ? "Copied! ✓" : "Copy Post Text"}
              </button>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3.5 bg-black hover:bg-white/5 border border-white/10 text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 shrink-0"
              >
                Twitter / X
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(tweetText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 shrink-0"
              >
                WhatsApp
              </a>
            </div>
          </motion.div>
        );
      })()}

      {/* Main interactive Tab lists */}
      <div className="flex border-b border-white/10 mb-6 font-display font-medium text-xs bg-white/2 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("fixtures")}
          className={`pb-2.5 pt-2 px-4 relative transition-all rounded-lg font-bold ${
            activeTab === "fixtures" 
              ? `${isWc ? "text-amber-405 bg-amber-500/10" : "text-cyan-400 bg-white/5"}` 
              : "text-white/60 hover:text-white"
          }`}
        >
          Fixtures & Timeline
          {activeTab === "fixtures" && <span className={`absolute bottom-0 inset-x-2 h-0.5 ${isWc ? "bg-amber-500" : "bg-cyan-500"}`} />}
        </button>
        <button
          onClick={() => setActiveTab("standings")}
          className={`pb-2.5 pt-2 px-4 relative transition-colors rounded-lg font-bold ${
            activeTab === "standings" 
              ? `${isWc ? "text-amber-405 bg-amber-500/10" : "text-cyan-400 bg-white/5"}` 
              : "text-white/60 hover:text-white"
          }`}
        >
          Group Standings
          {activeTab === "standings" && <span className={`absolute bottom-0 inset-x-2 h-0.5 ${isWc ? "bg-amber-500" : "bg-cyan-500"}`} />}
        </button>
        <button
          onClick={() => setActiveTab("bracket")}
          className={`pb-2.5 pt-2 px-4 relative transition-colors rounded-lg font-bold ${
            activeTab === "bracket" 
              ? `${isWc ? "text-amber-405 bg-amber-500/10" : "text-cyan-400 bg-white/5"}` 
              : "text-white/60 hover:text-white"
          }`}
        >
          Knockout Bracket
          {activeTab === "bracket" && <span className={`absolute bottom-0 inset-x-2 h-0.5 ${isWc ? "bg-amber-500" : "bg-cyan-500"}`} />}
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`pb-2.5 pt-2 px-4 relative transition-colors rounded-lg font-bold ${
            activeTab === "stats" 
              ? `${isWc ? "text-amber-405 bg-amber-500/10" : "text-cyan-400 bg-white/5"}` 
              : "text-white/60 hover:text-white"
          }`}
        >
          Leaderboards
          {activeTab === "stats" && <span className={`absolute bottom-0 inset-x-2 h-0.5 ${isWc ? "bg-amber-500" : "bg-cyan-500"}`} />}
        </button>
        <button
          id="analytics_tab_btn"
          onClick={() => setActiveTab("analytics")}
          className={`pb-2.5 pt-2 px-4 relative transition-colors rounded-lg font-bold ${
            activeTab === "analytics" 
              ? `${isWc ? "text-amber-405 bg-amber-500/10" : "text-cyan-400 bg-white/5"}` 
              : "text-white/60 hover:text-white"
          }`}
        >
          Performance Trends
          {activeTab === "analytics" && <span className={`absolute bottom-0 inset-x-2 h-0.5 ${isWc ? "bg-amber-500" : "bg-cyan-500"}`} />}
        </button>
      </div>

      {/* TAB CONTENT 1: FIXTURES & RESULTS */}
      {activeTab === "fixtures" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Active Opponent Overview Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-md">
              <span className="text-[10px] text-yellow-400 font-bold font-mono tracking-wider uppercase block">
                Next Match Preview
              </span>
              
              {activeUserUclFixture ? (
                <div className="mt-4">
                  <div className="flex justify-between items-center bg-black/45 p-4 rounded-xl border border-slate-850 mb-4 text-center">
                    <div className="flex flex-col items-center">
                      <div className="mb-1">{renderTeamBadge(tournament.draftedSquadName, "md")}</div>
                      <span className="text-[10px] uppercase text-slate-400 font-bold">{tournament.draftedSquadName.substring(0,6)}</span>
                    </div>
                    <span className="text-xs font-black text-slate-500">VS</span>
                    <div className="flex flex-col items-center">
                      <div className="mb-1">
                        {renderTeamBadge(
                          activeUserUclFixture.homeTeam === tournament.draftedSquadName 
                            ? activeUserUclFixture.awayTeam 
                            : activeUserUclFixture.homeTeam,
                          "md"
                        )}
                      </div>
                      <span className="text-[10px] uppercase text-slate-400 font-bold truncate block max-w-[80px]">
                        {(activeUserUclFixture.homeTeam === tournament.draftedSquadName ? activeUserUclFixture.awayTeam : activeUserUclFixture.homeTeam).substring(0,8)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Your dynamic team rating is <span className="text-yellow-400 font-bold font-mono">{tournament.allTeams.find(t=>t.isUser)?.rating}</span> (boosted by chemistry). Simulating the season will test your historical synergy!
                  </p>

                  <div className="space-y-1.5 text-[11px] text-slate-400">
                    <div className="flex gap-2 items-center">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{activeUserUclFixture.stage}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Activity className="w-3.5 h-3.5 text-slate-500" />
                      <span>Simulating probabilistically using individual player card parameters.</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-center py-6 text-slate-500">
                  <Trophy className="w-10 h-10 mx-auto text-slate-700 mb-3" />
                  <p className="text-xs">
                    {isWc ? "Tournament is in progress! Navigate to 'Knockout Bracket' to manage matches." : "Group Stage matches have concluded. Proceed to the double-legged Knockouts!"}
                  </p>
                </div>
              )}
            </div>

            {/* List of squad players */}
            <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-md">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Drafted Lineup List</span>
              <div className="space-y-2 mt-4 max-h-56 overflow-y-auto">
                {tournament.draftedLineup.map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-2 rounded-lg bg-black/20 border border-slate-850 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{getNationFlag(p.nation)}</span>
                      <span className="font-semibold text-slate-200">{p.shortName}</span>
                      <span className="text-[10px] text-yellow-400 font-bold bg-yellow-500/10 px-1 rounded">{p.primaryPosition}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-400">{p.originalRating} OVR</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Matches List */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-md">
            <h3 className="font-display font-medium text-slate-100 text-base mb-4">
              {isWc ? "Global World Cup Fixtures & Results" : "Champions League Fixtures & Results"}
            </h3>
            
            <div className="space-y-3 max-h-128 overflow-y-auto">
              {tournament.fixtures.map((f) => {
                const isUserMatch = f.homeTeam === tournament.draftedSquadName || f.awayTeam === tournament.draftedSquadName;
                
                return (
                  <div
                    key={f.id}
                    onClick={() => f.isSimulated && setSelectedMatch(f)}
                    className={`flex flex-col gap-2 p-3 sm:flex-row sm:justify-between sm:items-center sm:p-3.5 rounded-xl border transition-all text-xs cursor-pointer group
                      ${isUserMatch 
                        ? "bg-yellow-500/5 hover:bg-yellow-500/10 border-yellow-500/20 shadow-neutral-900/60" 
                        : "bg-black/30 hover:bg-black/40 border-slate-850 hover:border-slate-800"
                      }`}
                  >
                    <div className="flex items-center justify-between w-full sm:w-auto text-slate-400 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono bg-slate-900/60 border border-slate-800 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">{f.stage}</span>
                        {isUserMatch && <span className="bg-yellow-500/10 text-yellow-405 font-bold px-1.5 py-0.5 rounded text-[8px] uppercase font-mono tracking-wider">YOUR MATCH</span>}
                      </div>
                      <div className="sm:hidden text-slate-400 text-[10px] font-medium font-mono">
                        {f.isSimulated ? (
                          <span className="text-yellow-400 font-bold bg-yellow-400/5 border border-yellow-400/20 px-1.5 py-0.5 rounded">Review 📝</span>
                        ) : (
                          <span className="text-slate-500 bg-slate-900/40 border border-slate-855 px-1.5 py-0.5 rounded">Pending</span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center gap-2 sm:gap-6 text-center w-full sm:w-3/5 my-1 sm:my-0">
                      <div className="flex-1 text-right truncate text-slate-100 font-semibold text-xs sm:text-sm">
                        <span className="hidden sm:inline-block mr-1.5">{getClubShortIcon(f.homeTeam)}</span>
                        {f.homeTeam}
                      </div>

                      {f.isSimulated ? (
                        <div className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-black font-mono text-[11px] sm:text-xs min-w-[50px] shadow-[inset_0_0_8px_rgba(0,0,0,0.6)]">
                          {f.homeScore} - {f.awayScore}
                        </div>
                      ) : (
                        <div className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-900 text-slate-500 text-[10px] font-bold font-mono min-w-[50px]">
                          VS
                        </div>
                      )}

                      <div className="flex-1 text-left truncate text-slate-100 font-semibold text-xs sm:text-sm">
                        {f.awayTeam}
                        <span className="hidden sm:inline-block ml-1.5">{getClubShortIcon(f.awayTeam)}</span>
                      </div>
                    </div>

                    <div className="hidden sm:block text-slate-400 text-[10px] w-24 text-right">
                      {f.isSimulated ? (
                        <span className="text-yellow-400 font-bold hover:underline transition-all group-hover:text-yellow-300">Review Lineup 📝</span>
                      ) : (
                        <span className="text-slate-500 font-mono">Pending</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT 2: GROUP STANDINGS */}
      {activeTab === "standings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tournament.groups.map((group) => (
            <div key={group.name} className="bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-md">
              <h3 className="font-display font-medium text-yellow-400 text-sm mb-4 flex items-center justify-between">
                <span>{group.name}</span>
                <span className="text-[10px] text-slate-500">Group Phase Table</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-850 text-[10px] uppercase grid grid-cols-12 text-slate-500 font-bold font-mono">
                      <th className="col-span-5 pb-2">Club Name</th>
                      <th className="col-span-1 pb-2 text-center">PL</th>
                      <th className="col-span-1 pb-2 text-center">W</th>
                      <th className="col-span-1 pb-2 text-center">D</th>
                      <th className="col-span-1 pb-2 text-center">L</th>
                      <th className="col-span-1 pb-2 text-center">GD</th>
                      <th className="col-span-2 pb-2 text-right">PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.teams
                      .map((teamName) => ({
                        teamName,
                        stats: tournament.groupTables[teamName],
                        isUser: teamName === tournament.draftedSquadName,
                      }))
                      .sort((a, b) => {
                        if (b.stats.pts !== a.stats.pts) return b.stats.pts - a.stats.pts;
                        if (b.stats.gd !== a.stats.gd) return b.stats.gd - a.stats.gd;
                        return b.stats.gf - a.stats.gf;
                      })
                      .map((item, idx) => (
                        <tr
                          key={item.teamName}
                          className={`grid grid-cols-12 py-2.5 border-b border-slate-850/40 items-center font-mono
                            ${item.isUser ? "bg-yellow-500/5 text-yellow-300 font-extrabold" : "text-slate-200"}`}
                        >
                          <td className="col-span-5 flex items-center gap-2 truncate font-sans text-xs">
                            <span className="text-slate-500 font-mono font-bold w-4 text-[10px]">{idx + 1}</span>
                            <span className="text-base">{getClubShortIcon(item.teamName)}</span>
                            <span className="truncate">{item.teamName}</span>
                          </td>
                          <td className="col-span-1 text-center">{item.stats.played}</td>
                          <td className="col-span-1 text-center text-emerald-450">{item.stats.won}</td>
                          <td className="col-span-1 text-center text-slate-400">{item.stats.drawn}</td>
                          <td className="col-span-1 text-center text-rose-450">{item.stats.lost}</td>
                          <td className="col-span-1 text-center">{item.stats.gd > 0 ? `+${item.stats.gd}` : item.stats.gd}</td>
                          <td className="col-span-2 text-right text-yellow-400 font-extrabold">{item.stats.pts}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT 3: KNOCKOUT BRACKET */}
      {activeTab === "bracket" && (
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 md:p-8 shadow-md">
          <h3 className="font-display font-medium text-slate-100 text-lg mb-6 text-center">
            {isWc ? "Global World Cup Bracket" : "Champions League Playoff Rounds"}
          </h3>

          {((isWc && (!tournament.r16Matches || tournament.r16Matches.length === 0)) || (!isWc && Object.keys(tournament.qfLegs).length === 0)) ? (
            <div className="text-center py-16 text-slate-500">
              <ShieldAlert className="w-12 h-12 mx-auto text-slate-700 mb-3" />
              <p className="text-sm">Playoffs are locked! Complete all group stage matches to view the bracket.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Round of 16 displays (only for WC) */}
              {isWc && tournament.r16Matches && tournament.r16Matches.length > 0 && (
                <div>
                  <span className="text-xs uppercase text-orange-405 font-mono font-bold block mb-4 border-b border-slate-850 pb-2">
                    Round of 16 (Single leg)
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tournament.r16Matches.map((match, idx) => {
                      const tA = match.homeTeam;
                      const tB = match.awayTeam;
                      const hasPlayed = match.isSimulated;

                      return (
                        <div key={match.id} className="bg-black/35 border border-slate-850 p-3 sm:p-4 rounded-xl flex gap-3 justify-between items-center text-xs">
                          <span className="text-slate-505 font-mono italic text-[10px] sm:text-xs shrink-0">M #{idx + 1}</span>
                          
                          <div className="flex gap-2 sm:gap-3 items-center flex-1 min-w-0 justify-center">
                            <span className={`font-semibold truncate text-right flex-1 min-w-0 text-xs ${hasPlayed && match.homeScore > match.awayScore ? "text-yellow-420 font-bold" : "text-slate-205"}`}>{tA}</span>
                            
                            {hasPlayed ? (
                              <div className="px-2.5 py-1 bg-slate-950 font-bold border border-slate-800 rounded-lg font-mono text-slate-200 text-[11px] sm:text-xs shrink-0 min-w-[44px] text-center">
                                {match.homeScore} - {match.awayScore}
                              </div>
                            ) : (
                              <span className="px-2 py-1 bg-slate-900 border border-slate-850 text-[9px] rounded-md text-slate-505 uppercase font-mono font-bold shrink-0">DRAWN</span>
                            )}

                            <span className={`font-semibold truncate text-left flex-1 min-w-0 text-xs ${hasPlayed && match.awayScore > match.homeScore ? "text-yellow-420 font-bold" : "text-slate-205"}`}>{tB}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quarter finals displays */}
              <div>
                <span className="text-xs uppercase text-yellow-405 font-mono font-bold block mb-4 border-b border-slate-850 pb-2">
                  {isWc ? "Quarter Finals (Single leg)" : "Quarter Finals Bracket (Home / Away aggregate)"}
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(tournament.qfLegs).map(([key, legs], idx) => {
                    const l1 = legs[0];
                    const l2 = legs[1];
                    const tA = l1.homeTeam;
                    const tB = l1.awayTeam;
                    const aggA = isWc ? l1.homeScore : l1.homeScore + (l2?.awayScore || 0);
                    const aggB = isWc ? l1.awayScore : l1.awayScore + (l2?.homeScore || 0);

                    const hasPlayed = l1.isSimulated;

                    return (
                      <div key={key} className="bg-black/35 border border-slate-850 p-3 sm:p-4 rounded-xl flex gap-3 justify-between items-center text-xs">
                        <span className="text-slate-505 font-mono italic text-[10px] sm:text-xs shrink-0">QF #{idx + 1}</span>
                        
                        <div className="flex gap-2 sm:gap-3 items-center flex-1 min-w-0 justify-center">
                          <span className={`font-semibold truncate text-right flex-1 min-w-0 text-xs ${aggA > aggB ? "text-yellow-420 font-bold" : "text-slate-205"}`}>{tA}</span>
                          
                          {hasPlayed ? (
                            <div className="px-2.5 py-1 bg-slate-950 font-bold border border-slate-800 rounded-lg font-mono text-slate-200 text-[11px] sm:text-xs shrink-0 min-w-[44px] text-center">
                              {isWc ? `${l1.homeScore} - ${l1.awayScore}` : `${aggA} - ${aggB}`}
                              {!isWc && l2 && (
                                <span className="text-[8px] block text-slate-500 mt-0.5 font-normal">({l1.homeScore}-{l1.awayScore} / {l2.homeScore}-{l2.awayScore})</span>
                              )}
                            </div>
                          ) : (
                            <span className="px-2 py-1 bg-slate-900 border border-slate-850 text-[9px] rounded-md text-slate-505 uppercase font-mono font-bold shrink-0">DRAWN</span>
                          )}

                          <span className={`font-semibold truncate text-left flex-1 min-w-0 text-xs ${aggB > aggA ? "text-yellow-420 font-bold" : "text-slate-205"}`}>{tB}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Semi finals Display */}
              <div>
                <span className="text-xs uppercase text-indigo-405 font-mono font-bold block mb-4 border-b border-slate-850 pb-2">
                  {isWc ? "Semi-Finals (Single leg)" : "Semi-Finals Bracket (Home / Away aggregate)"}
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(tournament.sfLegs).length === 0 ? (
                    <div className="col-span-2 text-center py-6 text-slate-600 border border-dashed border-slate-850 rounded-xl text-xs">
                      Semi-Final matches drawn after Quarter Finals solve.
                    </div>
                  ) : (
                    Object.entries(tournament.sfLegs).map(([key, legs], idx) => {
                      const l1 = legs[0];
                      const l2 = legs[1];
                      const tA = l1.homeTeam;
                      const tB = l1.awayTeam;
                      const aggA = isWc ? l1.homeScore : l1.homeScore + (l2?.awayScore || 0);
                      const aggB = isWc ? l1.awayScore : l1.awayScore + (l2?.homeScore || 0);

                      const hasPlayed = l1.isSimulated;

                      return (
                        <div key={key} className="bg-black/35 border border-slate-850 p-3 sm:p-4 rounded-xl flex gap-3 justify-between items-center text-xs">
                          <span className="text-slate-505 font-mono italic text-[10px] sm:text-xs shrink-0">SF #{idx + 1}</span>

                          <div className="flex gap-2 sm:gap-3 items-center flex-1 min-w-0 justify-center">
                            <span className={`font-semibold truncate text-right flex-1 min-w-0 text-xs ${aggA > aggB ? "text-yellow-420 font-bold" : "text-slate-205"}`}>{tA}</span>

                            {hasPlayed ? (
                              <div className="px-2.5 py-1 bg-slate-950 font-bold border border-slate-800 rounded-lg font-mono text-slate-200 text-[11px] sm:text-xs shrink-0 min-w-[44px] text-center">
                                {isWc ? `${l1.homeScore} - ${l1.awayScore}` : `${aggA} - ${aggB}`}
                                {!isWc && l2 && (
                                  <span className="text-[8px] block text-slate-500 mt-0.5 font-normal">({l1.homeScore}-{l1.awayScore} / {l2.homeScore}-{l2.awayScore})</span>
                                )}
                              </div>
                            ) : (
                              <span className="px-2 py-1 bg-slate-900 border border-slate-850 text-[9px] rounded-md text-slate-505 uppercase font-mono font-bold shrink-0">PENDING</span>
                            )}

                            <span className={`font-semibold truncate text-left flex-1 min-w-0 text-xs ${aggB > aggA ? "text-yellow-420 font-bold" : "text-slate-205"}`}>{tB}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Wembley Final Representation */}
              <div>
                <span className="text-xs uppercase text-yellow-405 font-mono font-bold block mb-4 border-b border-slate-850 pb-2">
                  {isWc ? "World Cup Grand Final (Lusail Stadium)" : "Neutral Venue Championship Final (Wembley Stadium, London)"}
                </span>
                {tournament.finalFixture ? (
                  <div className="bg-linear-to-b from-yellow-500/10 via-amber-600/5 to-slate-950 border-2 border-yellow-500/40 p-4 sm:p-6 rounded-2xl max-w-lg mx-auto text-center shadow-xl">
                    <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 mx-auto animate-bounce mb-3" />
                    <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-slate-500 block uppercase mb-2">
                      {isWc ? "WORLD CUP GRAND CHAMPION" : "CHAMPIONS LEAGUE GRAND CHAMPION"}
                    </span>
                    
                    <div className="flex items-center justify-center gap-3 sm:gap-6 mt-4">
                      <span className="font-extrabold text-white text-xs sm:text-sm text-right flex-1 min-w-0 truncate">{tournament.finalFixture.homeTeam}</span>
                      <div className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-black border border-yellow-500/30 rounded-xl text-yellow-400 font-extrabold font-mono text-base sm:text-lg shrink-0 shadow-[0_0_12px_rgba(234,179,8,0.25)]">
                        {tournament.finalFixture.homeScore} - {tournament.finalFixture.awayScore}
                      </div>
                      <span className="font-extrabold text-white text-xs sm:text-sm text-left flex-1 min-w-0 truncate">{tournament.finalFixture.awayTeam}</span>
                    </div>

                    <p className="text-[10px] text-green-400 font-mono mt-4 font-bold max-w-md mx-auto line-clamp-2">
                      {tournament.finalFixture.scoreEvents[tournament.finalFixture.scoreEvents.length - 1]?.description || "Wembley Stadium celebration!"}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-650 border border-dashed border-slate-850 rounded-xl text-xs max-w-lg mx-auto">
                    A single neutral fixture awaits the champions. Play semi-finals legs to lock the Finalists!
                  </div>
                )}
                
                {/* Social Media Sharing & Undefeated Badge Block */}
                {matchdayIndex >= (isWc ? 8 : 10) && (
                  <div className="mt-8 bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-2xl max-w-lg mx-auto text-slate-300 text-xs">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 text-slate-100 font-bold">
                        <Award className="w-5 h-5 text-yellow-405 animate-pulse" />
                        <span>Share Season Stats & Milestones</span>
                      </div>
                      
                      {(() => {
                        const perf = tournament.getUserFarthestStageReached();
                        if (perf.losses === 0) {
                          return (
                            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded animate-bounce">
                              🛡️ INVINCIBLE
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    
                    <p className="text-[11px] text-slate-400 mb-4 leading-normal">
                      Brag about your crafted legacy, undefeated streak, squad size, or dynamic chemistry ratings to your social contacts!
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5">
                      <div className="text-left w-full sm:w-auto">
                        <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 block">Squad Record Summary</span>
                        <span className="font-extrabold text-white text-xs truncate max-w-[240px] block mt-0.5">
                          {tournament.draftedSquadName} • {tournament.getUserFarthestStageReached().stageReached}
                        </span>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                        <button
                          onClick={() => {
                            const perf = tournament.getUserFarthestStageReached();
                            const isUndefeatedName = perf.losses === 0;
                            const formatName = isWc ? "Global World Cup" : "UEFA Champions League";
                            const statusText = isUndefeatedName ? "🛡️ UNDEFEATED / INVINCIBLE 🛡️" : `reached ${perf.stageReached}`;
                            const text = `🎮 Drafted a legendary 🛡️ ${tournament.draftedSquadName} squad in Undefeated XI Simulator!\n\n⚽ Tournament: ${formatName}\n📊 Avg Rating: ${tournament.draftedAvgRating} OVR | Chemistry: ${tournament.draftedChemScore}%\n🏆 Record: ${perf.wins}W - ${perf.draws}D - ${perf.losses}L (${statusText})\n\nChallenge my undefeated squad on Undefeated XI! #UndefeatedXI`;
                            
                            navigator.clipboard.writeText(text);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-2 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold rounded-lg cursor-pointer transition-colors text-[10px] uppercase font-mono shadow-md"
                        >
                          {copied ? "Copied! ✓" : "Copy results text"}
                        </button>

                        <a
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                            (() => {
                              const perf = tournament.getUserFarthestStageReached();
                              const isUndefeatedName = perf.losses === 0;
                              const formatName = isWc ? "Global World Cup" : "UEFA Champions League";
                              const statusText = isUndefeatedName ? "🛡️ UNDEFEATED / INVINCIBLE 🛡️" : `reached ${perf.stageReached}`;
                              return `🎮 Drafted a legendary 🛡️ ${tournament.draftedSquadName} squad in Undefeated XI Simulator!\n\n⚽ Tournament: ${formatName}\n📊 Stats: ${tournament.draftedAvgRating} OVR / ${tournament.draftedChemScore}% CHEM\n🏆 Record: ${perf.wins}W - ${perf.draws}D - ${perf.losses}L (${statusText})\n\nCan you build an undefeated squad on Undefeated XI? #UndefeatedXI`;
                            })()
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center p-2.5 bg-slate-950 hover:bg-black rounded-lg text-white border border-slate-800 transition-all active:scale-95 shadow-md"
                          title="Brag on X (Twitter)"
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 4: UCL PLAYER LEADERBOARDS */}
      {activeTab === "stats" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Top Scorers column */}
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-md">
            <h3 className="font-display font-medium text-slate-100 text-sm mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-400" />
              {isWc ? "World Cup Top Scorers" : "Champions League Top Scorers"}
            </h3>
            <div className="space-y-2 max-h-128 overflow-y-auto">
              {sortedScorers.map((s, idx) => (
                <div key={`${s.name}_${idx}`} className={`flex justify-between items-center p-3 rounded-xl border text-xs font-mono
                  ${s.isUserTeam ? "bg-yellow-500/5 border-yellow-500/30 font-bold" : "bg-black/30 border-slate-850 text-slate-350"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-bold w-4 text-[10px]">{idx + 1}</span>
                    <span className="font-sans text-slate-200 text-xs">{s.name}</span>
                    {s.isUserTeam && <span className="bg-yellow-500/10 text-yellow-405 font-extrabold px-1 rounded text-[8px] uppercase">YOUR STRIKER</span>}
                  </div>
                  <span className="text-yellow-404 font-extrabold font-mono text-sm">{s.goals} Goals</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Assists column */}
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-md">
            <h3 className="font-display font-medium text-slate-100 text-sm mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-sky-400" />
              {isWc ? "World Cup Top Assists" : "Champions League Top Assists"}
            </h3>
            <div className="space-y-2 max-h-128 overflow-y-auto">
              {sortedAssisters.map((s, idx) => (
                <div key={`${s.name}_${idx}`} className={`flex justify-between items-center p-3 rounded-xl border text-xs font-mono
                  ${s.isUserTeam ? "bg-sky-505/5 border-sky-500/30 font-bold" : "bg-black/30 border-slate-850 text-slate-350"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-505 font-bold w-4 text-[10px]">{idx + 1}</span>
                    <span className="font-sans text-slate-200 text-xs">{s.name}</span>
                    {s.isUserTeam && <span className="bg-sky-500/10 text-sky-405 font-extrabold px-1 rounded text-[8px] uppercase">YOUR AMOD</span>}
                  </div>
                  <span className="text-sky-400 font-extrabold font-mono text-sm">{s.assists} Assists</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT 5: PERFORMANCE ANALYTICS GRAPHS */}
      {activeTab === "analytics" && (
        <PerformanceAnalytics
          userMatchHistory={tournament.userMatchHistory}
          draftedLineup={tournament.draftedLineup}
        />
      )}

      {/* COMPLETED: MATCH SINGLE LINEUP REVEAL OVERLAY MODAL */}
      {selectedMatch && !showLiveTicker && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-40">
          <div className="absolute inset-0" onClick={() => setSelectedMatch(null)} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-2xl bg-slate-950 border border-slate-850 rounded-2xl p-6 shadow-2xl z-10"
          >
            <div className="flex justify-between items-center mb-4 border-b border-slate-900 pb-3">
              <span className="text-[10px] text-yellow-405 font-mono uppercase font-bold tracking-wider">{selectedMatch.stage} Results Detail</span>
              <button
                onClick={() => setSelectedMatch(null)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Close Logs
              </button>
            </div>

            <div className="flex gap-2 sm:gap-4 items-center justify-center text-center mt-4 w-full">
              <div className="flex-1 flex flex-col items-center min-w-0">
                <div className="mb-1.5">{renderTeamBadge(selectedMatch.homeTeam, "md")}</div>
                <span className="font-display font-medium text-slate-100 text-xs sm:text-sm truncate w-full">{selectedMatch.homeTeam}</span>
              </div>
              <div className="px-4 py-2 sm:px-5 sm:py-2.5 bg-black border border-slate-855 rounded-xl text-white font-black font-mono text-xl sm:text-2xl shrink-0 h-10 sm:h-12 flex items-center justify-center min-w-[50px]">
                {selectedMatch.homeScore} - {selectedMatch.awayScore}
              </div>
              <div className="flex-1 flex flex-col items-center min-w-0">
                <div className="mb-1.5">{renderTeamBadge(selectedMatch.awayTeam, "md")}</div>
                <span className="font-display font-medium text-slate-100 text-xs sm:text-sm truncate w-full">{selectedMatch.awayTeam}</span>
              </div>
            </div>

            {/* Simulated match shooting ratios stats details */}
            <div className="grid grid-cols-2 gap-4 mt-6 bg-black/35 p-4 rounded-xl border border-slate-900 text-xs text-slate-350">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Home Shots:</span>
                  <span className="font-mono font-bold text-white">{selectedMatch.stats.homeShots}</span>
                </div>
                <div className="flex justify-between">
                  <span>Home Possession:</span>
                  <span className="font-mono font-bold text-white">{selectedMatch.stats.homePossession}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Away Shots:</span>
                  <span className="font-mono font-bold text-white">{selectedMatch.stats.awayShots}</span>
                </div>
                <div className="flex justify-between">
                  <span>Away Possession:</span>
                  <span className="font-mono font-bold text-white">{selectedMatch.stats.awayPossession}%</span>
                </div>
              </div>
            </div>

            {/* Score Events timeline list */}
            <h4 className="text-slate-400 text-[10px] font-bold font-mono uppercase mt-6 tracking-wider">Commentary Log Highlights</h4>
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
              {selectedMatch.scoreEvents.length > 0 ? (
                selectedMatch.scoreEvents.map((ev, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-black/45 border border-slate-855 text-[11px] leading-relaxed text-slate-300">
                    <span className="text-yellow-405 font-mono font-bold mr-2">{ev.minute}'</span>
                    {ev.description}
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-slate-600 text-xs italic">A quiet tactical affair. No major timeline milestones to report.</p>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* COMPLETED: RUNNING LIVE COMMENTARY TICKER SCREEN */}
      <AnimatePresence>
        {showLiveTicker && selectedMatch && (
          <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-6xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-slate-100 space-y-6"
            >
              {/* Top Banner & Sim Speed Selectors */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-800 pb-4 gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded uppercase">
                    {isSimulatingSequential 
                      ? `${selectedMatch.stage} - Game ${currSequentialIndex + 1} of ${sequentialMatchesList.length} ${
                          (selectedMatch.homeTeam === tournament.draftedSquadName || selectedMatch.awayTeam === tournament.draftedSquadName)
                            ? "(⭐ YOUR MATCH)"
                            : "(Opponent Match)"
                        }`
                      : `${selectedMatch.stage} - Multiplex Live Sim Ticker`
                    }
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Minute: <span className="text-emerald-400 font-extrabold animate-pulse">{tickerMinute > 90 ? 90 : tickerMinute}'</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 px-2 uppercase">Tempo:</span>
                  {[
                    { label: "Slow", speed: 1000 },
                    { label: "Normal", speed: 600 },
                    { label: "Fast", speed: 300 },
                  ].map((spd) => (
                    <button
                      key={spd.label}
                      type="button"
                      onClick={() => setSimulationSpeedMs(spd.speed)}
                      className={`px-3 py-1 text-[10px] font-mono rounded-lg font-bold transition-all ${
                        simulationSpeedMs === spd.speed
                          ? "bg-emerald-500 text-slate-950"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {spd.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => skipMatchTickerRef.current?.()}
                    className="ml-2 px-3 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/20 text-[10px] font-mono rounded-lg font-bold transition-all"
                  >
                    ⚡ Skip Ticker
                  </button>
                </div>
              </div>

              {/* Centered Single Match Arena Screen (Removed other games tracking for distraction-free focus) */}
              <div className="max-w-xl mx-auto w-full">
                
                {/* SINGLE FOCUS MATCH BOX SCREEN */}
                <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800/80 space-y-6 flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.8)] backdrop-blur">
                  <div>
                    {/* Main Scoreboard */}
                    <div className="flex items-center justify-between text-center gap-2">
                      {(() => {
                        const homeTeamMeta = tournament.allTeams.find((t) => t.name === selectedMatch.homeTeam);
                        const awayTeamMeta = tournament.allTeams.find((t) => t.name === selectedMatch.awayTeam);
                        const homeChem = homeTeamMeta?.isUser ? tournament.draftedChemScore : (homeTeamMeta?.chemistry ?? 90);
                        const awayChem = awayTeamMeta?.isUser ? tournament.draftedChemScore : (awayTeamMeta?.chemistry ?? 90);
                        const homeRating = homeTeamMeta?.rating ?? 80;
                        const awayRating = awayTeamMeta?.rating ?? 80;
                        
                        return (
                           <>
                             <div className="flex-1 flex flex-col items-center min-w-0">
                               <div className="mb-1.5 transition-transform duration-300 hover:scale-115 scale-90 sm:scale-100">{renderTeamBadge(selectedMatch.homeTeam, "lg")}</div>
                               <span className="font-display font-bold text-slate-100 text-xs sm:text-sm md:text-base uppercase tracking-tight block w-full truncate">{selectedMatch.homeTeam}</span>
                               <div className="mt-1 flex flex-col sm:flex-row items-center gap-1 text-[8px] sm:text-[10px] font-mono text-cyan-455 bg-cyan-950/45 px-1.5 py-0.5 rounded border border-cyan-500/15">
                                 <span>OVR: <span className="font-bold text-white">{homeRating}</span></span>
                                 <span className="hidden sm:inline text-slate-650">|</span>
                                 <span>CHEM: <span className="font-bold text-white">{homeChem}%</span></span>
                               </div>
                             </div>
                             
                             <div className="flex flex-col items-center justify-center px-2 sm:px-4 shrink-0">
                               <div className="px-3 py-1.5 sm:px-6 sm:py-3 bg-black border border-emerald-500/20 rounded-xl sm:rounded-2xl text-emerald-400 font-mono font-black text-2xl sm:text-4xl md:text-5xl shadow-[0_0_20px_rgba(16,185,129,0.15)] select-none">
                                 {liveScoreHome} - {liveScoreAway}
                               </div>
                               <div className="mt-1.5 text-[8px] sm:text-[10px] font-mono text-slate-400 tracking-wider flex items-center gap-1 uppercase">
                                 <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-red-500 animate-ping" />
                                 <span className="truncate max-w-[120px] sm:max-w-none">Live Commentary</span>
                               </div>
                             </div>

                             <div className="flex-1 flex flex-col items-center min-w-0">
                               <div className="mb-1.5 transition-transform duration-300 hover:scale-115 scale-90 sm:scale-100">{renderTeamBadge(selectedMatch.awayTeam, "lg")}</div>
                               <span className="font-display font-bold text-slate-100 text-xs sm:text-sm md:text-base uppercase tracking-tight block w-full truncate">{selectedMatch.awayTeam}</span>
                               <div className="mt-1 flex flex-col sm:flex-row items-center gap-1 text-[8px] sm:text-[10px] font-mono text-cyan-455 bg-cyan-950/45 px-1.5 py-0.5 rounded border border-cyan-500/15">
                                 <span>OVR: <span className="font-bold text-white">{awayRating}</span></span>
                                 <span className="hidden sm:inline text-slate-650">|</span>
                                 <span>CHEM: <span className="font-bold text-white">{awayChem}%</span></span>
                               </div>
                             </div>
                           </>
                        );
                      })()}
                    </div>

                    {/* Live text comments ticker list */}
                    <div className="border-t border-slate-800/60 pt-5 text-left h-56 overflow-y-auto space-y-2 mt-6">
                      {liveEvents.length > 0 ? (
                        liveEvents.map((ev, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                              ev.type === "GOAL"
                                ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200 shadow-[inset_0_0_10px_rgba(16,185,129,0.05)]"
                                : ev.type === "RED_CARD"
                                ? "bg-rose-950/20 border-rose-500/30 text-rose-200"
                                : ev.type === "SAVE"
                                ? "bg-amber-950/10 border-amber-500/20 text-amber-200"
                                : "bg-slate-900/40 border-slate-850 text-slate-350"
                            }`}
                          >
                            <span className={`font-mono font-black px-1.5 py-0.5 rounded text-[10px] shrink-0 ${
                              ev.type === "GOAL"
                                ? "bg-emerald-500 text-slate-950"
                                : ev.type === "RED_CARD"
                                ? "bg-red-500 text-white"
                                : "bg-slate-800 text-slate-300"
                            }`}>
                              {ev.minute}'
                            </span>
                            <span className="leading-relaxed">{ev.description}</span>
                          </motion.div>
                        ))
                      ) : (
                        <p className="text-center font-mono text-xs text-slate-500 italic mt-12 animate-pulse">
                          Stadium lights gleaming under the evening skies. Players exchanging handshakes. Tick... tock... Match kick-off imminent.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-center text-[10px] font-mono text-slate-500 pt-3 border-t border-slate-800/40">
                    <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>Real-Time Simulated Match Engine: UEFA Champions League Live Universe Ticker</span>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default SeasonSimulator;
