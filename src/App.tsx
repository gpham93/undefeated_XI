/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Users, Award, HelpCircle, Gamepad2, Settings, ShieldCheck, Heart, LogIn, LogOut, Cloud, RefreshCw, Coins } from "lucide-react";
import { Era, Position, LineupSetup, Formation, UserCareerState, Player, Difficulty, GlobalStats } from "./types";
import { DraftGrid, FORMATIONS } from "./components/DraftGrid";
import { SeasonSimulator } from "./components/SeasonSimulator";
import { StatsDashboard } from "./components/StatsDashboard";
import { BadgeBuilder } from "./components/BadgeBuilder";
import { PackOpener } from "./components/PackOpener";

// Firebase imports
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./lib/firebase";
import { loadAndSeedPlayers, saveUserCareer, fetchUserCareer, savePlayerToDb, fetchGlobalStats, incrementGlobalPlayersCount, incrementGlobalSeasonsCount } from "./utils/db";
import { PLAYERS } from "./data/players";
import { chemistryGraphInstance } from "./utils/chemistryGraph";

export default function App() {
  const [activeView, setActiveView] = useState<"draft" | "simulate" | "career" | "packs">("draft");
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({ totalPlayers: 0, totalSeasonsCompleted: 0 });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch global game statistics and handle unique visitor register
  useEffect(() => {
    async function loadStats() {
      const currentStats = await fetchGlobalStats();
      setGlobalStats(currentStats);

      // Unique device Visitor check
      const visitorCounted = localStorage.getItem("undefeated_xi_visitor_counted_v1");
      if (visitorCounted !== "true") {
        try {
          await incrementGlobalPlayersCount();
          localStorage.setItem("undefeated_xi_visitor_counted_v1", "true");
          const updated = await fetchGlobalStats();
          setGlobalStats(updated);
        } catch (err) {
          console.error("Failed to register global visitor count", err);
        }
      }
    }
    loadStats();
  }, []);

  // Core Game Config states
  const [formation, setFormation] = useState<Formation>(FORMATIONS[0]); // Default 4-3-3
  const [activeEras, setActiveEras] = useState<Era[]>([Era.Classic, Era.Legend, Era.Modern, Era.Present]); // All on by default
  const [eraBalance, setEraBalance] = useState<"balanced" | "retro_boost" | "modern_boost" | "raw">("balanced");

  // Selected player slots
  const [lineup, setLineup] = useState<LineupSetup>({});

  // Players list state (starts with hardcoded PLAYERS, updates from Firestore)
  const [playersList, setPlayersList] = useState<Player[]>(PLAYERS);
  const [isDbLoading, setIsDbLoading] = useState(true);

  // Authentication states
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Career Tracker persisting in client storage & Firestore cloud
  const [careerState, setCareerState] = useState<UserCareerState>({
    seasonsCount: 0,
    trophies: [],
    historicalSeasons: [],
    squadName: "Elite FC",
    currentEraBalance: "balanced",
    currentActiveEras: [Era.Classic, Era.Legend, Era.Modern, Era.Present],
    difficulty: Difficulty.Amateur,
    tournamentMode: "ucl",
    coins: 1500,
    unlockedPlayerIds: [],
  });

  // Track Auth & Load/Seed Players catalog on app mount
  useEffect(() => {
    async function initPlayersDb() {
      try {
        const dbPlayers = await loadAndSeedPlayers();
        setPlayersList(dbPlayers);
        // Force chemistryGraph to be aware of the real live DB catalog
        chemistryGraphInstance.setPlayers(dbPlayers);
      } catch (err) {
        console.error("Failed to load players from database", err);
      } finally {
        setIsDbLoading(false);
      }
    }
    initPlayersDb();

    // Standard client load
    const saved = localStorage.getItem("ucl_draft_career_state_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCareerState({
          tournamentMode: "ucl", // default fallback
          ...parsed
        });
      } catch (err) {
        console.error("Failed to load career logs", err);
      }
    }

    // Auth sync
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      if (currentUser) {
        try {
          const cloudCareer = await fetchUserCareer(currentUser.uid);
          if (cloudCareer) {
            setCareerState(cloudCareer);
          } else {
            // Push active local career state to cloud
            await saveUserCareer(currentUser.uid, careerState);
          }
          
          // Seed the database now that the user is authenticated
          const dbPlayers = await loadAndSeedPlayers();
          setPlayersList(dbPlayers);
          chemistryGraphInstance.setPlayers(dbPlayers);
        } catch (err) {
          console.error("Failed to sync cloud career on auth change", err);
        }
      }
    });

    // Initialize blank lineup keys for active formation
    const initialLineup: LineupSetup = {};
    FORMATIONS[0].positions.forEach((pos) => {
      initialLineup[pos.key] = null;
    });
    setLineup(initialLineup);

    return () => unsubscribe();
  }, []);

  // Sync / write changes to local storage and Firestore if authenticated
  const saveCareer = async (nextState: UserCareerState, currentUser?: User | null) => {
    setCareerState(nextState);
    localStorage.setItem("ucl_draft_career_state_v1", JSON.stringify(nextState));

    const activeUser = currentUser !== undefined ? currentUser : user;
    if (activeUser) {
      try {
        await saveUserCareer(activeUser.uid, nextState);
      } catch (err) {
        console.error("Failed to persist user career to Firestore cloud", err);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        const cloudCareer = await fetchUserCareer(result.user.uid);
        if (cloudCareer) {
          setCareerState(cloudCareer);
        } else {
          await saveUserCareer(result.user.uid, careerState);
        }
      }
    } catch (err) {
      console.error("Google login failed", err);
      alert("Sign in failed. Be sure you configured the Firestore rules and are not blocking popups in your browser.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Fallback revert to local cache
      const saved = localStorage.getItem("ucl_draft_career_state_v1");
      if (saved) {
        setCareerState(JSON.parse(saved));
      }
    } catch (err) {
      console.error("Sign out failed", err);
    }
  };

  const handleDraftCompleted = () => {
    setActiveView("simulate");
  };

  const handleSeasonCompleted = (seasonResult: any) => {
    const nextYear = 2026 + careerState.seasonsCount;
    const isChampion = seasonResult.stageReached === "Champion";

    const nextTrophies = [...careerState.trophies];
    if (isChampion) {
      nextTrophies.push(`${nextYear}`);
    }

    // Dynamic Coin Calculation
    let earnedCoins = 300; // base reward
    const stage = seasonResult.stageReached;
    
    if (stage === "Champion") {
      earnedCoins += 2000;
    } else if (stage === "F_RunnerUp" || stage === "Runner-Up") {
      earnedCoins += 1000;
    } else if (stage === "SF") {
      earnedCoins += 750;
    } else if (stage === "QF") {
      earnedCoins += 500;
    } else {
      earnedCoins += 150; // Group Stage exit
    }

    // Add record bonuses
    const rw = seasonResult.record?.wins || 0;
    const rd = seasonResult.record?.draws || 0;
    earnedCoins += (rw * 120) + (rd * 50);

    const currentCoins = typeof careerState.coins === "number" ? careerState.coins : 1500;
    const nextCoins = currentCoins + earnedCoins;

    const updatedResult = {
      ...seasonResult,
      year: nextYear,
      tournamentMode: careerState.tournamentMode || "ucl",
      earnedCoins,
    };

    const nextState: UserCareerState = {
      ...careerState,
      seasonsCount: careerState.seasonsCount + 1,
      historicalSeasons: [updatedResult, ...careerState.historicalSeasons],
      trophies: nextTrophies,
      coins: nextCoins,
    };

    saveCareer(nextState);

    // Increment global seasons counter in Firestore
    try {
      incrementGlobalSeasonsCount().then(() => {
        fetchGlobalStats().then((updated) => setGlobalStats(updated));
      });
    } catch (err) {
      console.error("Failed to increment global season count", err);
    }

    alert(`🏆 Season Simulation Complete! You reached: ${stage}.\n💰 Coins Earned: +${earnedCoins} Dynasty Coins!\nGo spend them opening packs in the LEGENDS PACKS tab!`);
    
    // Automatically reset draft squad lineup so returning to draft gets a fresh palette
    const cleared: LineupSetup = {};
    formation.positions.forEach((p) => {
      cleared[p.key] = null;
    });
    setLineup(cleared);

    setActiveView("career");
  };

  const handleResetCareer = () => {
    if (window.confirm("Are you sure you want to reset your manager career history, career wins, and trophies?")) {
      const resetState: UserCareerState = {
        seasonsCount: 0,
        trophies: [],
        historicalSeasons: [],
        squadName: careerState.squadName || "Elite FC",
        currentEraBalance: "balanced",
        currentActiveEras: [Era.Classic, Era.Legend, Era.Modern, Era.Present],
        difficulty: Difficulty.Amateur,
      };
      saveCareer(resetState);
    }
  };

  const handleStartNewDraft = () => {
    // Clear lineup slots matching current formation
    const cleared: LineupSetup = {};
    formation.positions.forEach((p) => {
      cleared[p.key] = null;
    });
    setLineup(cleared);
    setActiveView("draft");
  };

  const handlePlayerScouted = async (newPlayer: Player) => {
    try {
      if (user) {
        await savePlayerToDb(newPlayer);
      }
      const nextPlayers = [newPlayer, ...playersList];
      setPlayersList(nextPlayers);
      chemistryGraphInstance.setPlayers(nextPlayers);
    } catch (err) {
      console.error("Failed to persist scouted player to Firestore", err);
      const nextPlayers = [newPlayer, ...playersList];
      setPlayersList(nextPlayers);
      chemistryGraphInstance.setPlayers(nextPlayers);
    }
  };

  // Compute average and chemistry parameters dynamically for header indicators
  const calculateAggregateHeaderStats = () => {
    const activeMembers = Object.values(lineup).filter((p): p is Player => p !== null);
    if (activeMembers.length === 0) return { ovr: 0, chem: 0 };

    const sum = activeMembers.reduce((acc, curr) => acc + curr.originalRating, 0);
    const ovr = Math.round(sum / activeMembers.length);
    return { ovr, chem: activeMembers.length * 9 }; // simple representation
  };

  const hStats = calculateAggregateHeaderStats();

  const isWc = careerState.tournamentMode === "worldcup";

  const renderHeaderBadge = () => {
    const badge = careerState.customBadge;
    if (!badge) {
      return (
        <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
          <span className="font-black text-xl text-white">CL</span>
        </div>
      );
    }

    const isWiki = !!badge.wikiIcon;
    const shapePath = {
      classic: "polygon(50% 0%, 100% 15%, 100% 75%, 50% 100%, 0% 75%, 0% 15%)",
      round: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
      diamond: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
      spiky: "polygon(50% 0%, 95% 10%, 85% 75%, 50% 100%, 15% 75%, 5% 10%)",
    }[badge.shieldShape || "classic"];

    return (
      <div 
        className={`w-10 h-12 relative flex flex-col items-center justify-center shadow-lg shrink-0 transition-transform hover:scale-105 border ${
          isWiki ? "bg-slate-900 border-white/10 rounded-lg" : badge.customBgColor ? "" : `bg-gradient-to-br ${badge.bgColor}`
        }`}
        style={{
          clipPath: isWiki ? undefined : shapePath,
          borderColor: isWiki ? undefined : badge.accentColor,
          background: (!isWiki && badge.customBgColor) ? badge.customBgColor : undefined
        }}
      >
        {isWiki ? (
          <img src={badge.wikiIcon} alt="Custom Logo" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
        ) : (
          <span className="text-xl select-none leading-none">{badge.symbol || "🦁"}</span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-slate-100 flex flex-col font-sans select-none relative overflow-x-hidden pb-12">
      
      {/* Immersive Ambient BG Glow Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] transition-all duration-700" 
          style={{ backgroundColor: isWc ? "rgba(245, 158, 11, 0.12)" : "rgba(30, 58, 138, 0.2)" }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] transition-all duration-700" 
          style={{ backgroundColor: isWc ? "rgba(217, 119, 6, 0.08)" : "rgba(22, 78, 99, 0.1)" }} />
      </div>

      {/* Main navigation header */}
      <header className="relative z-10 overflow-hidden border-b border-white/10 bg-[#060a13] transition-all">
        {/* Stadium Background Layer - matches user attached image (stadium atmosphere under blue/teal floodlights) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none opacity-45">
          {/* Dark gradient for shadow overlay */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#060a13] to-transparent z-10" />
          
          {/* Pitch Green Field simulation shine radiating from center-bottom */}
          <div className="absolute bottom-[-60px] left-1/2 -translate-x-1/2 w-[130%] h-[160px] bg-emerald-950/40 rounded-[50%] blur-2xl opacity-40 border border-emerald-500/10" />
          
          {/* Glowing Floodlights from top corners rendering the stadium atmosphere beam lights requested */}
          <div className="absolute -top-10 left-[8%] w-[130px] h-[340px] bg-gradient-to-b from-cyan-400/40 via-cyan-500/10 to-transparent blur-md transform -rotate-45" />
          <div className="absolute -top-10 left-[18%] w-[90px] h-[380px] bg-gradient-to-b from-teal-400/30 via-teal-500/5 to-transparent blur-lg transform -rotate-30" />
          <div className="absolute -top-10 right-[8%] w-[130px] h-[340px] bg-gradient-to-b from-cyan-400/40 via-cyan-500/10 to-transparent blur-md transform rotate-45" />
          <div className="absolute -top-10 right-[18%] w-[90px] h-[380px] bg-gradient-to-b from-teal-400/30 via-teal-500/5 to-transparent blur-lg transform rotate-30" />

          {/* Central Blue Beam Halo Ambient */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[220px] bg-cyan-400/20 rounded-full blur-[70px]" />
          
          {/* Curved Stadium Roof arches of typical elite arenas */}
          <svg className="absolute inset-0 w-full h-full stroke-cyan-500/10 fill-none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100,-60 Q1200,110 2500,-60" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M-100,-30 Q1200,140 2500,-30" strokeWidth="1" strokeDasharray="6,6" />
            <line x1="180" y1="0" x2="180" y2="60" strokeWidth="0.5" />
            <line x1="380" y1="0" x2="380" y2="80" strokeWidth="0.5" />
            <line x1="580" y1="0" x2="580" y2="90" strokeWidth="0.5" />
            <line x1="780" y1="0" x2="780" y2="90" strokeWidth="0.5" />
            <line x1="980" y1="0" x2="980" y2="80" strokeWidth="0.5" />
            <line x1="1180" y1="0" x2="1180" y2="60" strokeWidth="0.5" />
          </svg>

          {/* Hand-raising/Cheering crowded fans dynamic silhouettes */}
          <svg className="absolute bottom-0 inset-x-0 w-full h-[65px] fill-cyan-950 stroke-cyan-500/15 opacity-80" viewBox="0 0 1200 100" preserveAspectRatio="none">
            <path d="
              M0,100 L0,50 L6,43 L12,49 L15,38 Q22,28 28,46 L34,40 L40,49 L44,32 L49,42 L55,38 L60,49
              L66,43 L72,49 L76,38 Q82,28 88,46 L94,40 L100,49 L104,32 L109,42 L115,38 L120,49
              L126,43 L132,49 L136,38 Q142,28 148,46 L154,40 L160,49 L164,32 L169,42 L175,38 L180,49
              L186,43 L192,49 L196,38 Q202,28 208,46 L214,40 L220,49 L224,32 L229,42 L235,38 L240,49
              L246,43 L252,49 L256,38 Q262,28 268,46 L274,40 L280,49 L284,32 L289,42 L295,38 L300,49
              L306,43 L312,49 L316,38 Q322,28 328,46 L334,40 L340,49 L344,32 L349,42 L355,38 L360,49
              L366,43 L372,49 L376,38 Q382,28 388,46 L394,40 L400,49 L404,32 L409,42 L415,38 L420,49
              L426,43 L432,49 L436,38 Q442,28 448,46 L454,40 L460,49 L464,32 L469,42 L475,38 L480,49
              L486,43 L492,49 L496,38 Q502,28 508,46 L514,40 L520,49 L524,32 L529,42 L535,38 L540,49
              L546,43 L552,49 L556,38 Q562,28 568,46 L574,40 L580,49 L584,32 L589,42 L595,38 L600,49
              L606,43 L612,49 L616,38 Q622,28 628,46 L634,40 L640,49 L644,32 L649,42 L655,38 L660,49
              L666,43 L672,49 L676,38 Q682,28 688,46 L694,40 L700,49 L704,32 L709,42 L715,38 L720,49
              L726,43 L732,49 L736,38 Q742,28 748,46 L754,40 L760,49 L764,32 L769,42 L775,38 L780,49
              L786,43 L792,49 L796,38 Q802,28 808,46 L814,40 L820,49 L824,32 L829,42 L835,38 L840,49
              L846,43 L852,49 L856,38 Q862,28 868,46 L874,40 L880,49 L884,32 L889,42 L895,38 L900,49
              L906,43 L912,49 L916,38 Q922,28 928,46 L934,40 L940,49 L944,32 L949,42 L955,38 L960,49
              L966,43 L972,49 L976,38 Q982,28 988,46 L994,40 L1000,49 L1004,32 L1009,42 L1015,38 L1020,49
              L1026,43 L1032,49 L1036,38 Q1042,28 1048,46 L1054,40 L1060,49 L1064,32 L1069,42 L1075,38 L1080,49
              L1086,43 L1092,49 L1096,38 Q1102,28 1108,46 L1114,40 L1120,49 L1124,32 L1129,42 L1135,38 L1140,49
              L1146,43 L1152,49 L1156,38 Q1162,28 1168,46 L1174,40 L1180,49 L1184,32 L1189,42 L1195,38 L1200,100 Z
            " />
          </svg>
        </div>
        {isMobile ? (
          /* ULTRA COMPACT MOBILE HEADER: Sits as a clean status HUD with secondary tactical parameter draft togglers */
          <div className="flex flex-col border-b border-white/5 bg-[#060B12]/85 backdrop-blur-md">
            <div className="relative z-10 px-4 py-2.5 flex items-center justify-between">
              {/* Minimal Brand Logo Group */}
              <div className="flex items-center gap-2">
                <div className="scale-75 shrink-0 origin-center">
                  {renderHeaderBadge()}
                </div>
                <div className="leading-none">
                  <h1 className={`text-base font-black tracking-tight uppercase font-display text-transparent bg-clip-text bg-gradient-to-r ${
                    isWc 
                      ? "from-amber-200 via-yellow-400 to-amber-500 drop-shadow-[0_1px_5px_rgba(245,158,11,0.2)]" 
                      : "from-white via-cyan-150 to-cyan-400 drop-shadow-[0_1px_5px_rgba(6,182,212,0.2)]"
                  }`}>
                    UNDEFEATED XI
                  </h1>
                  <span className="text-[8px] font-mono uppercase tracking-wider text-slate-400 block mt-0.5">
                    {isWc ? "🏆 World Cup Mode" : "🇪🇺 UCL Mode"}
                  </span>
                </div>
              </div>

              {/* Config & Info Pill */}
              <div className="flex items-center gap-2">
                {/* Mobile Rules Button */}
                <button
                  onClick={() => setShowRulesModal(true)}
                  className="p-1 px-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white cursor-pointer active:scale-95 transition-all shrink-0"
                  title="How to Play & Rules Guide"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                </button>

                {/* Coins Pill */}
                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 py-1 px-2 rounded-lg font-mono text-[9.5px] font-bold text-amber-400">
                  <Coins className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{(typeof careerState.coins === "number" ? careerState.coins : 1500).toLocaleString()}</span>
                </div>

                {/* Minimal Sign In / Logged Indicator */}
                {user ? (
                  <button
                    onClick={handleSignOut}
                    title="Sign out"
                    className="p-1 bg-white/5 border border-white/10 text-white/40 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleGoogleSignIn}
                    title="Link with Google"
                    className="p-1 px-2 bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 text-[9px] font-bold font-mono leading-none rounded-lg cursor-pointer"
                  >
                    Cloud
                  </button>
                )}
              </div>
            </div>

            {/* Row 2 Mobile: Mode Switcher & Difficulty Selector */}
            <div className="relative z-10 px-4 py-1.5 flex items-center justify-between border-t border-white/5 bg-[#03060a]/90 text-[10px] gap-2">
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-slate-400 font-bold uppercase text-[9px]">MODE:</span>
                <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5 font-bold">
                  <button
                    onClick={() => saveCareer({ ...careerState, tournamentMode: "ucl" })}
                    className={`px-2 py-0.5 rounded text-[8px] transition-all cursor-pointer ${
                      !isWc ? "bg-cyan-600 text-white font-black" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    🇪🇺 UCL
                  </button>
                  <button
                    onClick={() => saveCareer({ ...careerState, tournamentMode: "worldcup" })}
                    className={`px-2 py-0.5 rounded text-[8px] transition-all cursor-pointer ${
                      isWc ? "bg-amber-600 text-white font-black" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    🏆 WC
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-slate-400 font-bold uppercase text-[9px]">DIFF:</span>
                <select
                  value={careerState.difficulty || Difficulty.Amateur}
                  onChange={(e) => {
                    // Reset current draft roster when altering difficulty pool chances
                    const cleared: LineupSetup = {};
                    formation.positions.forEach((p) => { cleared[p.key] = null; });
                    setLineup(cleared);
                    saveCareer({ ...careerState, difficulty: e.target.value as Difficulty });
                  }}
                  className={`bg-white/5 border border-white/10 rounded-lg text-white/90 text-[8px] font-semibold px-2 py-0.5 cursor-pointer outline-none ${
                    isWc ? "focus:border-amber-500/50 text-amber-300" : "focus:border-cyan-500/50 text-cyan-300"
                  }`}
                >
                  {Object.values(Difficulty).map((d) => (
                    <option key={d} value={d} className="bg-[#0b1426] text-white font-bold">{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : (
          /* FULL DESKTOP SIZED PREMIUM ATMOSPHERIC HEADER */
          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-5 flex flex-col lg:flex-row justify-between items-center gap-6">
            
            {/* Logo brand */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="scale-110 sm:scale-125 transition-transform origin-center duration-300">
                {renderHeaderBadge()}
              </div>
              <div>
                <div className="flex items-baseline sm:items-center gap-3 flex-wrap">
                  <h1 className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none font-display text-transparent bg-clip-text bg-gradient-to-r ${
                    isWc 
                      ? "from-amber-100 via-yellow-400 to-amber-500 drop-shadow-[0_2px_10px_rgba(245,158,11,0.35)]" 
                      : "from-white via-cyan-200 to-cyan-400 drop-shadow-[0_2px_10px_rgba(6,182,212,0.3)]"
                  }`}>
                    UNDEFEATED XI
                  </h1>
                  <button
                    id="rules_button"
                    onClick={() => setShowRulesModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 hover:text-white text-[10px] text-slate-300 border border-white/15 transition-all cursor-pointer font-bold font-mono uppercase"
                    title="How to play & Rules"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Rules</span>
                  </button>
                </div>
                <p className={`text-[10px] font-mono uppercase tracking-[0.2em] mt-1.5 font-bold transition-all ${isWc ? "text-amber-400" : "text-cyan-400"} flex flex-wrap items-center gap-2`}>
                  <span>{isWc ? "🏆 Draft Phase: World Cup Mode" : "🇪🇺 Draft Phase: UCL Mode"} {isDbLoading && " (Syncing...)"}</span>
                  <span className="h-3.5 w-[1px] bg-white/20 hidden sm:inline" />
                  <span className="text-[9px] tracking-normal bg-purple-950/80 border border-yellow-500/50 text-yellow-300 font-black px-2 py-0.5 rounded-md shadow-[0_0_8px_rgba(168,85,247,0.3)] animate-pulse inline-flex items-center gap-1">
                    👑 NEW: WC HEROES RELEASED
                  </span>
                </p>
              </div>
            </div>

            {/* Dynasty Name input styled like immersive console */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Dynasty Name:</span>
              <input
                type="text"
                id="squad_name_input"
                value={careerState.squadName}
                onChange={(e) => saveCareer({ ...careerState, squadName: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-cyan-400 font-bold outline-hidden focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 text-center max-w-[140px] uppercase tracking-wider"
                maxLength={16}
                title="Edit your club dynasty name"
              />
            </div>

            <div className="flex flex-wrap items-center gap-6">
              {/* Active Eras Display in Header */}
              <div className="hidden xl:flex flex-col items-end leading-tight">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Active Eras</span>
                <span className="text-xs font-semibold text-white/90 mt-0.5">
                  {activeEras.length === Era.Classic && activeEras.length === 4 ? "All Legend Eras" : activeEras.join(" + ")}
                </span>
              </div>
              
              <div className="h-10 w-[1px] bg-white/10 hidden xl:block"></div>

              {/* Squad Rating progress widget (card rating block) */}
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono mb-1">Squad Rating</span>
                <div className="flex items-center gap-2.5">
                  <span className={`text-2xl font-black italic font-mono leading-none transition-colors ${isWc ? "text-amber-400" : "text-cyan-400"}`}>{hStats.ovr || "00"}</span>
                  <div className="w-24 md:w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 bg-linear-to-r ${isWc ? "from-amber-600 to-yellow-402" : "from-cyan-600 to-cyan-400"}`} 
                      style={{ width: `${Math.max(10, Math.min(100, hStats.ovr || 50))}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cloud Sign In & View Navigation Row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Creator Coffee Support Link */}
              <a
                href="https://buymeacoffee.com/gphamjg"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all font-mono text-[10px] uppercase font-bold tracking-wider border cursor-pointer ${
                  isWc 
                    ? "bg-amber-500/10 hover:bg-amber-500/20 border-amber-400/30 text-amber-300" 
                    : "bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-400/30 text-yellow-300"
                }`}
                title="Support the Creator on Buy Me A Coffee!"
              >
                <span>☕</span>
                <span>Buy me a coffee</span>
              </a>

              {/* Cloud Sync State Indicators */}
              {user ? (
                <div className={`flex items-center gap-2 px-3 py-1 rounded-xl border ${
                  isWc ? "bg-amber-950/20 border-amber-500/10 text-amber-300" : "bg-cyan-950/30 border-cyan-500/20 text-cyan-300"
                }`}>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || "Manager"} className={`w-5 h-5 rounded-full border ${isWc ? "border-amber-400/30" : "border-cyan-400/30"}`} referrerPolicy="no-referrer" />
                  ) : (
                    <div className={`w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center ${isWc ? "bg-amber-600" : "bg-cyan-600"}`}>
                      M
                    </div>
                  )}
                  <div className="flex flex-col text-left">
                    <span className={`text-[8px] font-semibold uppercase tracking-wider leading-none ${isWc ? "text-amber-450" : "text-cyan-455"}`}>Cloud backup</span>
                    <span className="text-[10px] text-white/80 font-bold truncate max-w-[85px] leading-tight mt-0.5">
                      {user.displayName?.split(" ")[0] || "Manager"}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    title="Sign out from Cloud Database"
                    className="p-1 hover:bg-white/5 rounded-lg text-white/40 hover:text-red-400 transition-colors ml-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all font-mono text-[10px] uppercase font-bold tracking-wider border cursor-pointer ${
                    isWc 
                      ? "bg-amber-955/20 hover:bg-amber-900/30 border-amber-500/20 text-amber-400 hover:border-amber-400/40" 
                      : "bg-cyan-950/40 hover:bg-cyan-900/40 border-cyan-500/20 text-cyan-400 hover:border-cyan-400/40"
                  }`}
                >
                  <Cloud className="w-3.5 h-3.5 animate-pulse" />
                  Cloud Backup
                </button>
              )}

              {/* Tournament Theme Toggle Pill */}
              <div className="flex items-center bg-white/5 border border-white/10 p-1 rounded-xl font-mono text-[10px] font-bold gap-1">
                <button
                  id="toggle_ucl_mode"
                  onClick={() => saveCareer({ ...careerState, tournamentMode: "ucl" })}
                  className={`py-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                    !isWc
                      ? "bg-cyan-600 text-white shadow-md shadow-cyan-500/20 font-black"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  🇪🇺 UCL
                </button>
                <button
                  id="toggle_wc_mode"
                  onClick={() => saveCareer({ ...careerState, tournamentMode: "worldcup" })}
                  className={`py-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                    isWc
                      ? "bg-amber-600 text-white shadow-md shadow-amber-500/20 font-black"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  🏆 WORLDCUP
                </button>
              </div>

              {/* Global Difficulty Selector Pill */}
              <div className="flex items-center bg-white/5 border border-white/10 p-1 rounded-xl font-mono text-[10px] font-bold gap-1">
                <span className="text-[9px] uppercase text-white/35 px-1.5 select-none tracking-tight">Difficulty:</span>
                {Object.values(Difficulty).map((d) => {
                  const isSelected = (careerState.difficulty || Difficulty.Amateur) === d;
                  return (
                    <button
                      key={d}
                      onClick={() => {
                        // Clear draft lineup to keep integrity when difficulty drop weights transition
                        const cleared: LineupSetup = {};
                        formation.positions.forEach((p) => { cleared[p.key] = null; });
                        setLineup(cleared);
                        saveCareer({ ...careerState, difficulty: d });
                      }}
                      className={`py-1 px-2.5 rounded-lg transition-all text-[9.5px] cursor-pointer ${
                        isSelected
                          ? isWc 
                            ? "bg-amber-600 text-white shadow-md font-black"
                            : "bg-cyan-600 text-white shadow-md font-black"
                          : "text-white/40 hover:text-white"
                      }`}
                      title={`${d} level`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>

              {/* Navigation view options */}
              <nav className="flex items-center bg-white/5 border border-white/10 p-1 rounded-xl font-display font-medium text-xs">
                <button
                  id="view_draft_tab"
                  onClick={() => setActiveView("draft")}
                  className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-all font-bold cursor-pointer ${
                    activeView === "draft"
                      ? `${isWc ? "bg-amber-600 border border-amber-400/30" : "bg-cyan-600 border border-cyan-400/30"} text-white shadow-md`
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  SQUAD DRAFT
                </button>
                <button
                  id="view_simulate_tab"
                  disabled={Object.values(lineup).filter((p) => p !== null).length === 0}
                  onClick={() => setActiveView("simulate")}
                  className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-all font-bold cursor-pointer disabled:opacity-[0.2] ${
                    activeView === "simulate"
                      ? `${isWc ? "bg-amber-600 border border-amber-400/30" : "bg-cyan-600 border border-cyan-400/30"} text-white shadow-md`
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  SIMULATION
                </button>
                <button
                  id="view_career_tab"
                  onClick={() => setActiveView("career")}
                  className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-all font-bold cursor-pointer ${
                    activeView === "career"
                      ? `${isWc ? "bg-amber-600 border border-amber-400/30" : "bg-cyan-600 border border-cyan-400/30"} text-white shadow-md`
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  DYNASTY LOGS
                </button>
                <button
                  id="view_packs_tab"
                  onClick={() => setActiveView("packs")}
                  className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-all font-bold cursor-pointer ${
                    activeView === "packs"
                      ? `${isWc ? "bg-amber-600 border border-amber-400/30" : "bg-cyan-600 border border-cyan-400/30"} text-white shadow-md`
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <Coins className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  LEGENDS PACKS
                  <span className="text-[10px] bg-amber-500/10 text-amber-300 font-mono px-1 rounded ml-1 leading-none font-black self-center">
                    {(typeof careerState.coins === "number" ? careerState.coins : 1500).toLocaleString()}
                  </span>
                </button>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Main Container Stage */}
      <main className="relative z-20 max-w-7xl mx-auto px-4 md:px-8 flex-1 w-full pt-6">
        <AnimatePresence mode="wait">
          {activeView === "draft" && (
            <motion.div
              key="draft_zone"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <DraftGrid
                playersList={playersList}
                lineup={lineup}
                setLineup={setLineup}
                formation={formation}
                setFormation={setFormation}
                activeEras={activeEras}
                setActiveEras={setActiveEras}
                eraBalance={eraBalance}
                setEraBalance={setEraBalance}
                onDraftComplete={handleDraftCompleted}
                difficulty={careerState.difficulty || Difficulty.Amateur}
                setDifficulty={(dif) => saveCareer({ ...careerState, difficulty: dif })}
                onPlayerScouted={handlePlayerScouted}
                userAuthenticated={!!user}
                careerState={careerState}
                saveCareer={saveCareer}
              />
            </motion.div>
          )}

          {activeView === "simulate" && (
            <motion.div
              key="sim_zone"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <SeasonSimulator
                squadName={careerState.squadName}
                lineup={lineup}
                averageRating={hStats.ovr}
                chemistryScore={hStats.chem}
                onSeasonComplete={handleSeasonCompleted}
                onExit={handleStartNewDraft}
                difficulty={careerState.difficulty || Difficulty.Amateur}
                tournamentMode={careerState.tournamentMode || "ucl"}
                customBadge={careerState.customBadge}
                tournamentYear={careerState.tournamentYear || 2014}
              />
            </motion.div>
          )}

          {activeView === "career" && (
            <motion.div
              key="career_zone"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <StatsDashboard
                careerState={careerState}
                lineup={lineup}
                formation={formation}
                onResetCareer={handleResetCareer}
                onStartNewDraft={handleStartNewDraft}
              />
            </motion.div>
          )}

          {activeView === "packs" && (
            <motion.div
              key="packs_zone"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <PackOpener
                careerState={careerState}
                saveCareer={saveCareer}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Immersive UI Bottom Data Bar Footer */}
      <footer className="relative z-10 bg-[#0A0D12] border-t border-white/10 px-8 py-5 mt-20 flex flex-col md:flex-row items-center justify-between text-[11px] text-white/50 font-mono uppercase tracking-widest gap-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_5px_#22c55e]"></div>
            <span>Simulator Engine: Live</span>
          </div>
          <div className="hidden sm:block text-white/25">|</div>
          <div className="flex items-center gap-1.5" title="Total unique players across all devices">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-white/35">Total Players:</span>
            <span className="text-cyan-400 font-bold">{globalStats.totalPlayers > 0 ? globalStats.totalPlayers.toLocaleString() : "..."}</span>
          </div>
          <div className="hidden sm:block text-white/25">|</div>
          <div className="flex items-center gap-1.5" title="Total completed seasons simulated globally">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-white/35">Global Campaigns:</span>
            <span className="text-amber-400 font-bold">{globalStats.totalSeasonsCompleted > 0 ? globalStats.totalSeasonsCompleted.toLocaleString() : "..."}</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 items-center">
          <a
            href="https://buymeacoffee.com/gphamjg"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-yellow-300 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-all cursor-pointer text-[10px]"
            title="Support the creator on Buy Me A Coffee"
          >
            <span>☕ Support the Creator</span>
          </a>
          <div>Dynasty: <span className="text-white font-bold">{careerState.squadName}</span></div>
          <div>Chemistry: <span className="text-emerald-400 font-bold">{hStats.chem || 0}%</span></div>
          <div>ERA Balance: <span className="text-cyan-400 font-bold">{eraBalance}</span></div>
        </div>
      </footer>

      {/* FIXED BOTTOM FLOATING NAVIGATION BAR FOR MOBILE VIEWPORTS */}
      {isMobile && (
        <div className="fixed bottom-0 inset-x-0 bg-[#060A13]/95 backdrop-blur-lg border-t border-white/10 py-1 px-2 z-[90] flex justify-around items-center shadow-[0_-8px_30px_rgba(0,0,0,0.7)]">
          <button
            onClick={() => setActiveView("draft")}
            className={`flex flex-col items-center gap-1.5 py-1.5 px-3.5 rounded-2xl transition-all cursor-pointer ${
              activeView === "draft"
                ? "text-cyan-405 font-black scale-105"
                : "text-slate-450 hover:text-white"
            }`}
          >
            <Gamepad2 className="w-5 h-5 shrink-0" />
            <span className="text-[9px] font-bold tracking-wider uppercase font-display">Draft</span>
          </button>

          <button
            disabled={Object.values(lineup).filter((p) => p !== null).length === 0}
            onClick={() => setActiveView("simulate")}
            className={`flex flex-col items-center gap-1.5 py-1.5 px-3.5 rounded-2xl transition-all disabled:opacity-20 disabled:scale-95 cursor-pointer ${
              activeView === "simulate"
                ? "text-cyan-405 font-black scale-105"
                : "text-slate-450 hover:text-white"
            }`}
          >
            <Users className="w-5 h-5 shrink-0" />
            <span className="text-[9px] font-bold tracking-wider uppercase font-display">Simulate</span>
          </button>

          <button
            onClick={() => setActiveView("career")}
            className={`flex flex-col items-center gap-1.5 py-1.5 px-3.5 rounded-2xl transition-all cursor-pointer ${
              activeView === "career"
                ? "text-cyan-405 font-black scale-105"
                : "text-slate-450 hover:text-white"
            }`}
          >
            <Award className="w-5 h-5 shrink-0" />
            <span className="text-[9px] font-bold tracking-wider uppercase font-display">Dynasty</span>
          </button>

          <button
            onClick={() => setActiveView("packs")}
            className={`flex flex-col items-center gap-1.5 py-1.5 px-3.5 rounded-2xl transition-all cursor-pointer ${
              activeView === "packs"
                ? "text-amber-400 font-black scale-105"
                : "text-slate-450 hover:text-white"
            }`}
          >
            <div className="relative">
              <Coins className={`w-5 h-5 shrink-0 ${activeView === "packs" ? "text-amber-400 animate-pulse" : "text-amber-500/80"}`} />
              <div className="absolute -top-1.5 -right-3.5 bg-amber-500 text-black text-[8px] px-1 rounded-full font-black scale-90 select-none">
                {(typeof careerState.coins === "number" ? careerState.coins : 1500)}
              </div>
            </div>
            <span className="text-[9px] font-bold tracking-wider uppercase font-display">Packs</span>
          </button>
        </div>
      )}

      {/* Rules & How to Play Immersive Dialog Modal */}
      <AnimatePresence>
        {showRulesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#09101b] border border-cyan-500/25 rounded-2xl p-6 sm:p-8 text-left shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden"
            >
              {/* Decorative stadium backdrop inside rules modal */}
              <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent pointer-events-none select-none" />

              <div className="relative z-10 flex flex-col h-full">
                {/* Modal Title Banner */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                  <div className="flex items-center gap-2.5">
                    <Trophy className="w-6 h-6 text-cyan-400 shrink-0" />
                    <h3 className="font-display font-black text-xl text-white uppercase tracking-wider">
                      Manager's Guide & Rules
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowRulesModal(false)}
                    className="p-1 px-2.5 bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-xs text-white/50 border border-white/10 hover:border-red-500/20 rounded-lg transition-all"
                  >
                    ✕ CLOSE
                  </button>
                </div>

                <div className="space-y-5 text-sm leading-relaxed overflow-y-auto max-h-[60vh] pr-2 scrollbar-thin">
                  <div>
                    <h4 className="font-bold text-cyan-400 flex items-center gap-2 font-mono text-xs uppercase tracking-wider">
                      <span>1.</span> Building Your Undefeated squad
                    </h4>
                    <p className="text-slate-300 mt-1 pl-5">
                      Select players for your active tactic <span className="text-white font-semibold">{formation.name}</span>. Click on empty card slots to trigger the scouted choosing drafts. Players encompass classic retrospective eras (Legend, Classic, Modern, Present). Mix and match past models to engineer absolute synergy!
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-cyan-400 flex items-center gap-2 font-mono text-xs uppercase tracking-wider">
                      <span>2.</span> Chemistry Graph Connectivity
                    </h4>
                    <p className="text-slate-300 mt-1 pl-5">
                      Succeeding is all about **Links**. Placing players together triggers active connection graphs. Connect stars from matching **Clubs**, **Nations**, or **Active Eras**. Dynamic Chemistry multiplier boosts your roll power during simulation offsets!
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-cyan-400 flex items-center gap-2 font-mono text-xs uppercase tracking-wider">
                      <span>3.</span> Tournament Simulating Modes
                    </h4>
                    <p className="text-slate-300 mt-1 pl-5">
                      Toggle between <span className="text-amber-400 font-bold">Global World Cup</span> (representing multi-legged brackets) and the <span className="text-cyan-400 font-bold">UEFA Champions League</span> formats in the top menu. Simulate rounds instantly via **Quick Sim**, or enjoy a meticulous **Live Ticker** matchday showing commentary in real-time.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-cyan-400 flex items-center gap-2 font-mono text-xs uppercase tracking-wider">
                      <span>4.</span> Coins & Packs Progression
                    </h4>
                    <p className="text-slate-300 mt-1 pl-5">
                      Complete campaigns to receive **Dynasty Coins**! Higher tournament finishes and match wins earn substantial bonuses. Navigate to the **Legends Packs** tab to buy legacy boxes and unlock pristine elite classic giants (such as Pelé or Maradona) for future drafting pulls!
                    </p>
                  </div>
                </div>

                {/* Footer and Close Button */}
                <div className="border-t border-white/10 pt-4 mt-6 flex justify-end">
                  <button
                    onClick={() => setShowRulesModal(false)}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl uppercase shadow-md shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all cursor-pointer"
                  >
                    Got it, Let's Play!
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
