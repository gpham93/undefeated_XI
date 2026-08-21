import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Coins, ShoppingBag, Eye, Lock, ArrowUpRight, CheckCircle, RefreshCcw, Award } from "lucide-react";
import { Player, UserCareerState, Era } from "../types";
import { PLAYERS } from "../data/players";
import { ProCard } from "./ProCard";

interface PackOpenerProps {
  careerState: UserCareerState;
  saveCareer: (nextState: UserCareerState) => void;
}

interface PackType {
  id: string;
  name: string;
  cost: number;
  description: string;
  themeColor: string;
  bgGradient: string;
  icon: string;
}

export const PackOpener: React.FC<PackOpenerProps> = ({ careerState, saveCareer }) => {
  // Ensure we have coins and unlocked player ids initialized
  const coins = typeof careerState.coins === "number" ? careerState.coins : 1500;
  const unlockedIds = useMemo(() => {
    return new Set(careerState.unlockedPlayerIds || []);
  }, [careerState.unlockedPlayerIds]);

  const [activeTab, setActiveTab] = useState<"shop" | "collection">("shop");
  const [isOpening, setIsOpening] = useState(false);
  const [activePack, setActivePack] = useState<PackType | null>(null);
  const [openedPlayers, setOpenedPlayers] = useState<Player[]>([]);
  const [openedStatus, setOpenedStatus] = useState<{ player: Player; isNew: boolean; refundValue: number }[]>([]);
  const [revealIndex, setRevealIndex] = useState(0);

  const packs: PackType[] = [
    {
      id: "retro",
      name: "Classic Retro Pack",
      cost: 600,
      description: "Guarantees classic 1950s-1980s retro legends like Pelé, Gerd Müller, Platini, Cruyff, or Bobby Charlton.",
      themeColor: "text-amber-400 border-amber-500/50",
      bgGradient: "from-amber-950/80 via-yellow-950/30 to-slate-950",
      icon: "⏳",
    },
    {
      id: "rising_wc_stars",
      name: "Rising World Cup Stars",
      cost: 800,
      description: "Features the hottest prospects and up-and-coming young stars in the tournament like Irankunda, Enciso, Brown, Bouaddi, Comenencia, and El Aynaoui.",
      themeColor: "text-emerald-400 border-emerald-500/50",
      bgGradient: "from-emerald-950/80 via-teal-950/30 to-slate-950",
      icon: "🌟",
    },
    {
      id: "champions",
      name: "Modern Champions",
      cost: 1000,
      description: "Focuses on high-tier modern (2010s) and present (2020s) superstars like Messi, Ronaldo, Yamal, Mbappe, and De Bruyne.",
      themeColor: "text-cyan-400 border-cyan-500/50",
      bgGradient: "from-cyan-950/80 via-blue-950/30 to-slate-950",
      icon: "⚡",
    },
    {
      id: "wc_hero",
      name: "World Cup Hero Pack",
      cost: 1400,
      description: "Special release! Guarantees high-tier present era world-cup stars (Yamal, Mbappe, Bellingham, etc.) styled as golden-twilight cosmic heroes.",
      themeColor: "text-yellow-400 border-yellow-400/50",
      bgGradient: "from-purple-950 border border-yellow-400/40 bg-radial",
      icon: "🏆",
    },
    {
      id: "elite_icon",
      name: "Elite Icon Pack",
      cost: 1800,
      description: "The ultimate tier. Guarantees 3 elite superstars with at least one guaranteed 92+ OVR all-time legend in history.",
      themeColor: "text-purple-400 border-purple-500/50",
      bgGradient: "from-purple-950/80 via-fuchsia-950/30 to-slate-950",
      icon: "👑",
    },
  ];

  const handleBuyPack = (pack: PackType) => {
    if (coins < pack.cost) {
      alert("Insufficient Dynasty Coins! Simulate seasons, win matches, or conquer the Champions League to earn more coins!");
      return;
    }

    setIsOpening(true);
    setActivePack(pack);
    setRevealIndex(0);

    // Filter players based on pack criteria
    let pool: Player[] = [...PLAYERS];

    if (pack.id === "retro") {
      pool = PLAYERS.filter((p) => p.era === Era.Classic || p.era === Era.Legend);
    } else if (pack.id === "rising_wc_stars") {
      const risingWcStarsIds = [
        "wc_nathaniel_brown",
        "wc_livano_comenencia",
        "wc_neil_el_aynaoui",
        "wc_ayyoub_bouaddi",
        "wc_nestory_irankunda",
        "wc_julio_enciso"
      ];
      pool = PLAYERS.filter((p) => risingWcStarsIds.includes(p.id));
      if (pool.length === 0) {
        pool = PLAYERS.filter((p) => p.era === Era.Present && p.originalRating < 82);
      }
    } else if (pack.id === "champions") {
      pool = PLAYERS.filter((p) => p.era === Era.Modern || p.era === Era.Present);
    } else if (pack.id === "wc_hero") {
      // Top World Cup performers strictly matching the official FotMob rating leaderboards (including Messi, Haaland, Mbappe, etc.)
      const topWcHeroIds = [
        "wc_messi",
        "wc_haaland",
        "wc_mbappe",
        "wc_ndiaye",
        "wc_dembele",
        "wc_brobbey",
        "wc_vinicius",
        "wc_porro",
        "wc_chavez",
        "wc_saliba_n",
        "wc_munoz",
        "wc_hwang",
        "wc_balogun",
        "wc_quinones",
        "wc_katic",
        "wc_lee",
        "wc_muharemovic",
        "wc_alvarado",
        "wc_laryea",
        "wc_freeman",
        "wc_jimenez",
        "wc_lukic",
        "wc_kolasinac",
        "wc_tillman",
        "wc_lira",
        "wc_pulisic"
      ];
      pool = PLAYERS.filter((p) => topWcHeroIds.includes(p.id));
      if (pool.length === 0) {
        pool = PLAYERS.filter((p) => p.isWcHero);
      }
    } else if (pack.id === "elite_icon") {
      // 92+ OVR guaranteed in elite pack
      pool = PLAYERS;
    }

    // Pull 3 random players
    const chosen: Player[] = [];
    const poolCopy = [...pool];

    // Guarantee the elite requirement
    if (pack.id === "elite_icon") {
      const highIcons = poolCopy.filter((p) => p.originalRating >= 92);
      if (highIcons.length > 0) {
        const firstIcon = highIcons[Math.floor(Math.random() * highIcons.length)];
        chosen.push(firstIcon);
        // Remove from pool copy
        const idx = poolCopy.findIndex((p) => p.id === firstIcon.id);
        if (idx > -1) poolCopy.splice(idx, 1);
      }
    }

    // Pull remaining
    while (chosen.length < 3 && poolCopy.length > 0) {
      const randIdx = Math.floor(Math.random() * poolCopy.length);
      chosen.push(poolCopy.splice(randIdx, 1)[0]);
    }

    // Sort rating high to low so the big reveal is epic
    chosen.sort((a, b) => a.originalRating - b.originalRating);

    // Apply isWcHero flag if from wc_hero pack
    const decoratedChosen = chosen.map(p => {
      if (pack.id === "wc_hero") {
        return { ...p, isWcHero: true };
      }
      return p;
    });

    // Calculate duplicates, new status, and refunds
    const currentUnlocked = [...(careerState.unlockedPlayerIds || [])];
    const newUnlockedList = [...currentUnlocked];
    let finalRefundAmount = 0;

    const statuses = decoratedChosen.map((player) => {
      const isAlreadyUnlocked = unlockedIds.has(player.id);
      let isNew = !isAlreadyUnlocked;

      // Duplicate cash back!
      let refundValue = 0;
      if (!isNew) {
        refundValue = Math.round(player.originalRating * 1.5 + 50); // e.g. 90 rating = 185 coins back
        finalRefundAmount += refundValue;
      } else {
        newUnlockedList.push(player.id);
      }

      return {
        player,
        isNew,
        refundValue,
      };
    });

    setOpenedPlayers(decoratedChosen);
    setOpenedStatus(statuses);

    // Update career state (deduct cost, apply trade-in value, save unlocked characters list)
    const nextCoins = coins - pack.cost + finalRefundAmount;
    saveCareer({
      ...careerState,
      coins: nextCoins,
      unlockedPlayerIds: newUnlockedList,
    });
  };

  const handleNextReveal = () => {
    if (revealIndex < 2) {
      setRevealIndex((prev) => prev + 1);
    } else {
      // Done with pack! Reset state
      setIsOpening(false);
      setActivePack(null);
      setOpenedPlayers([]);
      setOpenedStatus([]);
    }
  };

  // Group players by era/type for the Album
  const groupedPlayers = useMemo(() => {
    const groups: Record<string, Player[]> = {};
    
    const risingWcStarsIds = [
      "wc_nathaniel_brown",
      "wc_livano_comenencia",
      "wc_neil_el_aynaoui",
      "wc_ayyoub_bouaddi",
      "wc_nestory_irankunda",
      "wc_julio_enciso"
    ];

    const risingStars = PLAYERS.filter((p) => risingWcStarsIds.includes(p.id)).sort((a, b) => b.originalRating - a.originalRating);
    if (risingStars.length > 0) {
      groups["Rising World Cup Stars 🌟"] = risingStars;
    }

    // First group is the World Cup Heroes from FotMob leaderboards
    const wcHeroes = PLAYERS.filter((p) => (p.isWcHero || p.id.startsWith("wc_")) && !risingWcStarsIds.includes(p.id)).sort((a, b) => b.originalRating - a.originalRating);
    if (wcHeroes.length > 0) {
      groups["World Cup Heroes 🏆"] = wcHeroes;
    }

    // Now group other eras, excluding the direct "wc_" prefixed players to keep the clean collection separation
    Object.values(Era).forEach((era) => {
      groups[era] = PLAYERS.filter((p) => p.era === era && !p.id.startsWith("wc_") && !risingWcStarsIds.includes(p.id)).sort((a, b) => b.originalRating - a.originalRating);
    });

    return groups;
  }, []);

  const totalCollectedCount = useMemo(() => {
    return PLAYERS.filter((p) => unlockedIds.has(p.id)).length;
  }, [unlockedIds]);

  const collectionPercentage = Math.round((totalCollectedCount / PLAYERS.length) * 100);

  return (
    <div className="bg-[#0b0e14]/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md relative z-10" id="pack_opener_view">
      {/* Top statistics overview bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            LEGENDS PACK OPENER
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Spend Dynasty Coins to acquire packs, unlock premium players, and collect all {PLAYERS.length} historical superstars.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Dynamic Coins tally */}
          <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl flex items-center gap-2" id="coins_balance_widget">
            <Coins className="w-5 h-5 text-amber-400 animate-bounce" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-mono tracking-widest text-amber-400/70">Club Balance</span>
              <span className="text-lg font-black text-white font-mono leading-none mt-0.5">
                {coins.toLocaleString()} <span className="text-xs text-amber-400">COINS</span>
              </span>
            </div>
          </div>

          {/* Collection completeness tracker */}
          <div className="bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-mono tracking-widest text-cyan-400/70">Dynasty Album</span>
              <span className="text-sm font-black text-white font-mono leading-none mt-0.5">
                {totalCollectedCount} / {PLAYERS.length} <span className="text-[10px] text-cyan-300">({collectionPercentage}%)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab("shop")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "shop"
              ? "bg-cyan-600 text-white shadow-lg"
              : "bg-white/5 hover:bg-white/10 text-slate-300"
          }`}
          id="tab_shop_btn"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          PACK STORE
        </button>
        <button
          onClick={() => setActiveTab("collection")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "collection"
              ? "bg-cyan-600 text-white shadow-lg"
              : "bg-white/5 hover:bg-white/10 text-slate-300"
          }`}
          id="tab_collection_btn"
        >
          <Eye className="w-3.5 h-3.5" />
          MY CLUB GALLERY
        </button>
      </div>

      {/* Ripping Pack Interactive overlay */}
      <AnimatePresence>
        {isOpening && activePack && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 select-none"
            id="pack_ripping_modal"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.12)_0%,transparent_70%)] pointer-events-none" />
            
            <div className="text-center max-w-lg w-full relative">
              <div className="text-6xl mb-4 animate-bounce shrink-0">{activePack.icon}</div>
              <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
                Ripping {activePack.name}
              </h3>
              <p className="text-slate-400 text-xs mb-8">
                Analyzing historical statistics and unboxing legendary football superstars...
              </p>

              {/* Individual Revel Stage */}
              <div className="flex flex-col items-center justify-center min-h-[380px] mb-8 relative">
                <AnimatePresence mode="wait">
                  {openedPlayers.length > 0 && (
                    <motion.div
                      key={`reveal_player_${revealIndex}_${openedPlayers[revealIndex].id}`}
                      initial={{ scale: 0.3, rotateY: -180, opacity: 0 }}
                      animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                      exit={{ scale: 0.7, rotateY: 180, opacity: 0 }}
                      transition={{ type: "spring", damping: 15, stiffness: 100 }}
                      className="flex flex-col items-center"
                    >
                      <div className="relative">
                        {/* Glow and fireworks depending on rating */}
                        {openedPlayers[revealIndex].originalRating >= 90 && (
                          <div className="absolute -inset-4 bg-yellow-500/20 rounded-full blur-2xl animate-pulse" />
                        )}
                        <ProCard player={openedPlayers[revealIndex]} positionLabel={openedPlayers[revealIndex].primaryPosition} size="lg" />
                      </div>

                      {/* Card meta text status */}
                      <div className="mt-4 text-center">
                        <h4 className="text-lg font-bold text-white">{openedPlayers[revealIndex].name}</h4>
                        <div className="flex items-center gap-2 justify-center mt-1">
                          <span className="text-xs text-slate-400 font-medium">OVR: {openedPlayers[revealIndex].originalRating}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-xs text-amber-400 uppercase font-mono font-black">{openedPlayers[revealIndex].primaryPosition}</span>
                        </div>

                        {/* Duplicates / Collect cash rewards banner */}
                        {openedStatus[revealIndex] && (
                          <div className="mt-3">
                            {openedStatus[revealIndex].isNew ? (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 uppercase tracking-widest animate-pulse">
                                <CheckCircle className="w-3.5 h-3.5" />
                                New Signature Collected!
                              </div>
                            ) : (
                              <div className="inline-flex flex-col items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
                                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                                  Duplicate Card Exchanged!
                                </span>
                                <span className="text-[11px] font-mono font-black text-white">
                                  +{openedStatus[revealIndex].refundValue} Trade Coins Returned
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Progression Tracker */}
              <div className="flex items-center justify-center gap-2.5 mb-8">
                {[0, 1, 2].map((i) => (
                  <div
                    key={`dot_${i}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === revealIndex 
                        ? "w-8 bg-cyan-400" 
                        : i < revealIndex 
                        ? "w-2 bg-slate-600" 
                        : "w-2 bg-slate-800"
                    }`}
                  />
                ))}
              </div>

              {/* Button controllers */}
              <button
                onClick={handleNextReveal}
                className="w-full md:w-auto px-12 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all text-center cursor-pointer"
                id="pack_reveal_next_btn"
              >
                {revealIndex < 2 ? "Reveal Next Player" : "Store & Close Pack"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content views */}
      {activeTab === "shop" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {packs.map((pack) => {
            const hasEnough = coins >= pack.cost;
            return (
              <div
                key={pack.id}
                className={`border rounded-2xl p-5 flex flex-col justify-between transition-all relative overflow-hidden group ${
                  hasEnough 
                    ? "border-white/10 bg-slate-900/40 hover:border-cyan-500/30 shadow-md" 
                    : "border-white/5 bg-slate-950/20 opacity-75"
                }`}
                style={{
                  backgroundImage: `linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.85)), radial-gradient(circle at top right, rgba(56,189,248,0.02), transparent)`
                }}
              >
                {/* Pack decorative ribbon */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-cyan-500/10 to-transparent pointer-events-none group-hover:scale-125 transition-transform" />

                <div>
                  <div className="text-4xl mb-3">{pack.icon}</div>
                  <h3 className="text-base font-bold text-white uppercase group-hover:text-cyan-400 transition-colors">
                    {pack.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span className="text-base font-black font-mono text-amber-400">{pack.cost.toLocaleString()} COINS</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-3 leading-relaxed">
                    {pack.description}
                  </p>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => handleBuyPack(pack)}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      hasEnough
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md active:scale-98"
                        : "bg-white/5 text-white/30 border border-white/5 cursor-not-allowed"
                    }`}
                    id={`buy_pack_${pack.id}_btn`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Buy & Rip Pack
                  </button>
                  {!hasEnough && (
                    <p className="text-[10px] text-center text-red-400/80 mt-1.5 font-mono">
                      Needed: {(pack.cost - coins).toLocaleString()} more coins
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "collection" && (
        <div className="space-y-8" id="collection_album_container">
          {/* Header completion statistics info */}
          <div className="bg-slate-900/35 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Completion Roster Status</span>
              <h4 className="text-lg font-black text-white mt-0.5">Dynasty Club Historic Card Registry</h4>
              <p className="text-xs text-slate-400 mt-1">
                Your unlocked superstars can be searched, requested, and fielded in drafts. Duplicate copies of cards yield cashback.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono">LOCKED</span>
              <div className="w-24 h-5 bg-white/5 border border-white/10 rounded overflow-hidden flex items-center justify-center text-[10px] text-slate-500 font-bold select-none">
                <Lock className="w-2.5 h-2.5 mr-1" /> Grayscale
              </div>
              <span className="text-xs text-amber-400 font-mono">UNLOCKED</span>
              <div className="w-24 h-5 bg-amber-500/10 border border-amber-500/20 rounded overflow-hidden flex items-center justify-center text-[10px] text-amber-400 font-bold select-none">
                ✨ Hologram
              </div>
            </div>
          </div>

          {/* Group sections */}
          {(Object.entries(groupedPlayers) as [string, Player[]][]).map(([era, players]) => {
            const eraUnlockedCount = players.filter((p) => unlockedIds.has(p.id)).length;
            return (
              <div key={era} className="space-y-4">
                <div className={`flex items-center justify-between border-b pb-2 ${
                  era.includes("World Cup Heroes") 
                    ? "border-yellow-500/30 bg-gradient-to-r from-purple-950/40 via-transparent to-transparent -mx-2 px-2 py-1 rounded-lg" 
                    : "border-white/5"
                }`}>
                  <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
                    era.includes("World Cup Heroes") 
                      ? "bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent font-black drop-shadow-[0_0_6px_rgba(234,179,8,0.2)]" 
                      : "text-white"
                  }`}>
                    <span className="text-xs">{era.includes("World Cup Heroes") ? "👑" : "📂"}</span> 
                    <span>{era}</span>
                    {era.includes("World Cup Heroes") && (
                      <span className="text-[8px] tracking-normal font-mono px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 font-black animate-pulse">FOTMOB TOP 15</span>
                    )}
                  </h3>
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md ${
                    era.includes("World Cup Heroes") 
                      ? "text-yellow-300 bg-yellow-500/10 border border-yellow-400/20" 
                      : "text-slate-400 bg-white/5"
                  }`}>
                    Unlocked: {eraUnlockedCount} / {players.length}
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {players.map((player) => {
                    const isUnlocked = unlockedIds.has(player.id);
                    return (
                      <div
                        key={player.id}
                        className={`relative group transition-all duration-300 ${
                          isUnlocked 
                            ? "hover:-translate-y-1 hover:rotate-1" 
                            : "opacity-40 filter saturate-0 grayscale"
                        }`}
                        title={`${player.name} (${player.primaryPosition} - ${player.originalRating} OVR) - ${isUnlocked ? 'Unlocked' : 'Locked (Find in packs!)'}`}
                      >
                        {/* Mini preview card construct */}
                        <div className={`border rounded-xl p-1.5 flex flex-col items-center justify-center text-center select-none relative overflow-hidden transition-all duration-300 ${
                          isUnlocked 
                            ? (player.isWcHero || player.id.startsWith("wc_")
                                ? "bg-gradient-to-b from-[#1c0836]/90 to-[#04000b]/90 border-yellow-500/80 shadow-[0_0_8px_rgba(234,179,8,0.3)]"
                                : "bg-slate-900/60 border-yellow-500/20")
                            : 'bg-black/40 border-slate-900'
                        }`}>
                          {/* Mini rating indicators */}
                          <div className="flex items-center justify-between w-full text-[9px] font-mono font-bold leading-none mb-1 px-1">
                            <span className={isUnlocked 
                              ? (player.isWcHero || player.id.startsWith("wc_") ? "text-yellow-300" : "text-amber-400") 
                              : "text-slate-500"}>
                              {player.originalRating}
                            </span>
                            <span className="text-white/60">{player.primaryPosition}</span>
                          </div>

                          {/* Face Avatar mockup */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 overflow-hidden relative ${
                            isUnlocked && (player.isWcHero || player.id.startsWith("wc_"))
                              ? "bg-purple-950/85 border border-yellow-400/40"
                              : "bg-slate-800/80"
                          }`}>
                            {isUnlocked ? (
                              <img
                                src={`/api/player-image?name=${encodeURIComponent(player.name)}&pos=${player.primaryPosition}`}
                                alt={player.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-slate-600" />
                            )}
                          </div>

                          <span className={`text-[10px] font-semibold truncate w-full px-0.5 flex items-center justify-center gap-0.5 ${
                            isUnlocked && (player.isWcHero || player.id.startsWith("wc_"))
                              ? "text-yellow-300 font-extrabold"
                              : "text-slate-200"
                          }`}>
                            {player.shortName}
                            {isUnlocked && (player.isWcHero || player.id.startsWith("wc_")) && (
                              <span className="text-[7px] text-amber-300 scale-90 font-black px-0.5 bg-yellow-950/80 rounded leading-none border border-yellow-400/30">H</span>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PackOpener;
