import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Sparkles, RefreshCw, Trophy, Globe, Lock, Check } from "lucide-react";
import { UserCareerState, CustomBadge } from "../types";

interface BadgeBuilderProps {
  careerState: UserCareerState;
  saveCareer: (nextState: UserCareerState) => void;
}

const PRESET_GRADIENTS = [
  { name: "Cyan Spark", class: "from-cyan-500 to-blue-900", accent: "#22d3ee" },
  { name: "Imperial Gold", class: "from-amber-400 via-amber-600 to-zinc-950", accent: "#fbbf24" },
  { name: "Crimson Glory", class: "from-rose-600 via-red-800 to-zinc-900", accent: "#f43f5e" },
  { name: "Emerald Laser", class: "from-emerald-500 via-emerald-800 to-slate-950", accent: "#10b981" },
  { name: "Neon Cosmic", class: "from-pink-500 via-purple-700 to-blue-950", accent: "#ec4899" },
  { name: "Titanium Metal", class: "from-slate-400 via-slate-600 to-slate-950", accent: "#94a3b8" },
  { name: "Samba Sun", class: "from-yellow-400 via-emerald-555 to-blue-950", accent: "#10b981" },
  { name: "Classic Royal", class: "from-blue-600 via-indigo-800 to-neutral-950", accent: "#3b82f6" },
  { name: "Vintage Maroon", class: "from-amber-900 via-red-950 to-stone-950", accent: "#b45309" },
  { name: "Fierce Amber", class: "from-amber-500 via-orange-600 to-zinc-950", accent: "#f59e0b" },
  { name: "Midnight Mint", class: "from-teal-400 via-emerald-900 to-zinc-950", accent: "#2dd4bf" },
  { name: "Gothic Purple", class: "from-purple-800 via-fuchsia-950 to-black", accent: "#d946ef" },
];

const MASCOT_EMOJIS = [
  { emoji: "🦁", label: "Lion (Royalty)" },
  { emoji: "👑", label: "Crown (Kings)" },
  { emoji: "🐉", label: "Dragon (Fury)" },
  { emoji: "🦅", label: "Eagle (Force)" },
  { emoji: "⭐", label: "Star (Legends)" },
  { emoji: "👿", label: "Devil (Fiery)" },
  { emoji: "🦈", label: "Shark (Predators)" },
  { emoji: "⚡", label: "Bolt (Strikers)" },
  { emoji: "🔫", label: "Cannon (Gunners)" },
  { emoji: "🏆", label: "Cup (Victory)" },
  { emoji: "🦄", label: "Unicorn (Magic)" },
  { emoji: "🦖", label: "T-Rex (Dominance)" },
  { emoji: "🛡️", label: "Shield (Defenders)" },
  { emoji: "☄️", label: "Meteor (Strikers)" },
  { emoji: "⚔️", label: "Swords (Gladiators)" },
  { emoji: "🏹", label: "Archer (Precision)" },
  { emoji: "🔥", label: "Fire (On Fire)" },
  { emoji: "🐺", label: "Wolf (Pack)" },
  { emoji: "🪐", label: "Planet (Universal)" },
  { emoji: "💀", label: "Skull (Fearless)" },
];

const SHIELD_SHAPES = [
  { id: "classic", name: "Champ Shield", path: "polygon(50% 0%, 100% 15%, 100% 75%, 50% 100%, 0% 75%, 0% 15%)" },
  { id: "round", name: "Rondelle", path: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" },
  { id: "diamond", name: "Diamond", path: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" },
  { id: "spiky", name: "Gothic", path: "polygon(50% 0%, 95% 10%, 85% 75%, 50% 100%, 15% 75%, 5% 10%)" },
];

export const BadgeBuilder: React.FC<BadgeBuilderProps> = ({ careerState, saveCareer }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Fallback default custom badge initialization
  const defaultBadge: CustomBadge = {
    shieldShape: "classic",
    bgColor: "from-cyan-500 to-blue-900",
    accentColor: "#22d3ee",
    symbol: "🦁",
    stars: careerState.trophies?.length || 0,
    wikiIcon: "",
  };

  const badge: CustomBadge = careerState.customBadge || defaultBadge;

  // Sync states
  const [wikiSearching, setWikiSearching] = useState(false);
  const [wikiError, setWikiError] = useState("");
  const [wikiNotice, setWikiNotice] = useState("");
  const [useWikiOverride, setUseWikiOverride] = useState(!!badge.wikiIcon);

  // Sync stars Count automatically with real club victories if user opens the badge editor!
  useEffect(() => {
    const realStarsCount = careerState.trophies?.length || 0;
    if (realStarsCount !== badge.stars) {
      updateBadgeProperty("stars", realStarsCount);
    }
  }, [careerState.trophies?.length]);

  const updateBadgeProperty = (property: keyof CustomBadge, value: any) => {
    const updatedBadge: CustomBadge = {
      ...badge,
      [property]: value,
    };
    saveCareer({
      ...careerState,
      customBadge: updatedBadge,
    });
  };

  const triggerWikipediaBadgeSync = async () => {
    const query = careerState.squadName.trim();
    if (!query) {
      setWikiError("Be sure to enter your Dynasty Name above before syncing.");
      return;
    }

    setWikiSearching(true);
    setWikiError("");
    setWikiNotice("");

    try {
      // call our cached server proxy URL
      const response = await fetch(`/api/club-badge?club=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`Could not locate a Wikipedia football badge matching "${query}"`);
      }

      // Check if it returned a real sports badge or fallback custom vector
      const isCustomGenerated = response.headers.get("x-badge-found") === "false";
      const finalImgUrl = `/api/club-badge?club=${encodeURIComponent(query)}`;

      if (isCustomGenerated) {
        setWikiNotice(`Wikipedia has no exact match for custom club "${query}", so we generated a beautiful custom vector crest!`);
      } else {
        setWikiNotice(`Successfully synced official Wikipedia crest for "${query}"!`);
      }
      
      const updatedBadge: CustomBadge = {
        ...badge,
        wikiIcon: finalImgUrl,
      };

      saveCareer({
        ...careerState,
        customBadge: updatedBadge,
      });

      setUseWikiOverride(true);
      setWikiSearching(false);
    } catch (err: any) {
      console.error(err);
      setWikiError(err.message || "Wikipedia search failed. Try standard clubs like Arsenal, Chelsea etc.");
      setWikiSearching(false);
    }
  };

  const handleWikiOverrideToggle = (active: boolean) => {
    setUseWikiOverride(active);
    if (!active) {
      // Clear the wikiIcon from state when disabled to preserve custom styling
      updateBadgeProperty("wikiIcon", "");
    } else if (badge.wikiIcon) {
      updateBadgeProperty("wikiIcon", badge.wikiIcon);
    } else {
      triggerWikipediaBadgeSync();
    }
  };

  // Helper styles matching chosen shape
  const activeShapeDef = SHIELD_SHAPES.find((s) => s.id === badge.shieldShape) || SHIELD_SHAPES[0];

  return (
    <div id="badge_builder_container" className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col gap-4">
      
      {/* Tiny decorative header beam */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-yellow-500/50 via-cyan-500/50 to-transparent" />

      {/* Accordion header clicker */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer group"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 group-hover:scale-105 transition-transform">
            <Shield className="w-4.5 h-4.5 stroke-[2.5px]" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm tracking-wide text-white group-hover:text-yellow-400 transition-colors uppercase">
              Club Crest Studio
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {useWikiOverride ? "Syncing official Crest from Wikipedia" : "Customizing hand-modeled crest shield"}
            </p>
          </div>
        </div>

        {/* Live Mini Preview */}
        <div className="flex items-center gap-3">
          <div 
            style={{ 
              clipPath: useWikiOverride ? undefined : activeShapeDef.path,
              borderColor: useWikiOverride ? "rgba(255,255,255,0.1)" : badge.accentColor,
            }}
            className={`w-10 h-11 flex items-center justify-center relative border shadow-md ${useWikiOverride ? "bg-slate-900 border-white/10 rounded-lg" : `bg-gradient-to-br ${badge.bgColor}`}`}
          >
            {useWikiOverride && badge.wikiIcon ? (
              <img src={badge.wikiIcon} alt="Crest override" className="w-7 h-7 object-contain" />
            ) : (
              <span className="text-sm select-none">{badge.symbol}</span>
            )}
          </div>
          <button 
            className="text-[11px] text-cyan-400 font-mono font-bold uppercase tracking-wider py-1 px-2.5 bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/20 rounded-lg transition-colors"
          >
            {isOpen ? "Collapse" : "Design"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden flex flex-col gap-5 border-t border-white/5 pt-4"
          >
            {/* Live Interactive Canvas Workspace */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/2 p-4 rounded-xl border border-white/5">
              
              {/* Left Column: Huge Preview Stage with Championship Stars */}
              <div className="flex flex-col items-center justify-center relative py-6">
                
                {/* Floating Champ Stars */}
                <div className="flex justify-center gap-1.5 mb-2.5 h-5">
                  {Array.from({ length: Math.max(0, badge.stars) }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.25, 1], rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    >
                      <Trophy className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 filter drop-shadow-[0_0_4px_#f59e0b]" />
                    </motion.div>
                  ))}
                  {badge.stars === 0 && (
                    <span className="text-[8px] uppercase tracking-widest font-mono text-slate-500">No UCL Trophies Yet</span>
                  )}
                </div>

                {/* Ultimate Shield Base */}
                <div 
                  className={`w-28 h-36 relative flex flex-col items-center justify-center shadow-2xl transition-all duration-300 ${
                    useWikiOverride 
                      ? "bg-[#090C12] border-2 border-white/10 rounded-2xl" 
                      : `bg-gradient-to-br ${badge.bgColor} border-2`
                  }`}
                  style={{ 
                    clipPath: useWikiOverride ? undefined : activeShapeDef.path,
                    borderColor: useWikiOverride ? "rgba(255,255,255,0.1)" : badge.accentColor,
                  }}
                >
                  {/* Neon radial backdrop shine */}
                  <div className="absolute inset-0 bg-radial from-white/10 to-transparent pointer-events-none" />

                  {/* Inner lining rim decoration */}
                  {!useWikiOverride && (
                    <div 
                      className="absolute inset-[3px] opacity-40 pointer-events-none"
                      style={{ 
                        clipPath: activeShapeDef.path, 
                        border: `1.5px solid ${badge.accentColor}` 
                      }}
                    />
                  )}

                  {/* Logo Center */}
                  {useWikiOverride && badge.wikiIcon ? (
                    <motion.img 
                      key={badge.wikiIcon}
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      src={badge.wikiIcon} 
                      alt="Squad Wikipedia badge" 
                      className="w-16 h-16 object-contain z-10"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-4xl select-none z-10 filter drop-shadow-[0_2.5px_4px_rgba(0,0,0,0.5)]">
                      {badge.symbol}
                    </div>
                  )}

                  {/* Dynasty Abbreviation bottom tag */}
                  <div className="absolute bottom-3 font-mono text-[9px] uppercase tracking-[0.2em] font-black py-0.5 px-2 bg-black/60 rounded-full border border-white/10 text-white z-10">
                    {careerState.squadName ? careerState.squadName.substring(0, 3) : "ELT"}
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 mt-4 text-center leading-normal">
                  Fits {careerState.squadName || "Elite FC"}'s campaign logs
                </span>
              </div>

              {/* Right Column: Toggle Tabs and Controls */}
              <div className="flex flex-col gap-4">
                
                {/* Mode Selector: Custom design or Wikipedia Sync */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5">
                  <button
                    onClick={() => handleWikiOverrideToggle(false)}
                    className={`py-2 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-colors ${
                      !useWikiOverride 
                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/20" 
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Custom Shield
                  </button>
                  <button
                    onClick={() => handleWikiOverrideToggle(true)}
                    className={`py-2 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
                      useWikiOverride 
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/20" 
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Globe className="w-3 h-3" />
                    Wikipedia Real
                  </button>
                </div>

                {/* Sub Controls Panel */}
                <AnimatePresence mode="wait">
                  {useWikiOverride ? (
                    <motion.div
                      key="wiki_controls"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex flex-col gap-3 justify-center h-full"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[9px] uppercase font-bold text-white/40 tracking-wider">
                            Wikipedia Crest Link
                          </label>
                          {badge.wikiIcon && (
                            <span className="text-[8px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-sm font-bold flex items-center gap-1 font-mono">
                              <Check className="w-2.5 h-2.5" />
                              ACTUAL BRAND LOADED
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            disabled
                            value={badge.wikiIcon || "Click Sync below to fetch..."}
                            className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2 text-[9px] font-mono text-slate-450 truncate"
                          />
                        </div>
                      </div>

                      <button
                        onClick={triggerWikipediaBadgeSync}
                        disabled={wikiSearching}
                        className="py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-white/5 disabled:text-white/25 active:scale-97 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        {wikiSearching ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Fetching real shield...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                            Fetch "{careerState.squadName}" Crest
                          </>
                        )}
                      </button>

                      {wikiError && (
                        <p className="text-[9px] text-rose-400/90 leading-tight">
                          ⚠️ {wikiError}
                        </p>
                      )}

                      {wikiNotice && (
                        <p className="text-[9px] text-emerald-400/95 leading-tight">
                          ✨ {wikiNotice}
                        </p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="custom_controls"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex flex-col gap-3 py-1.5"
                    >
                      {/* Shield shapes selector */}
                      <div>
                        <label className="text-[9px] uppercase font-bold text-white/40 tracking-wider block mb-2">
                          Shield Shape
                        </label>
                        <div className="grid grid-cols-4 gap-1">
                          {SHIELD_SHAPES.map((shape) => (
                            <button
                              key={shape.id}
                              onClick={() => updateBadgeProperty("shieldShape", shape.id)}
                              className={`py-1 px-1 rounded-md text-[9px] truncate font-medium border text-center transition-colors ${
                                badge.shieldShape === shape.id
                                  ? "bg-yellow-500/15 border-yellow-500/40 text-yellow-400 font-bold"
                                  : "bg-white/5 border-white/5 hover:bg-white/10 text-slate-300"
                              }`}
                            >
                              {shape.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Mascot Emojis selector */}
                      <div>
                        <label className="text-[9px] uppercase font-bold text-white/40 tracking-wider block mb-2">
                          Focal Mascot
                        </label>
                        <div className="grid grid-cols-5 gap-1 max-h-[85px] overflow-y-auto pr-1">
                          {MASCOT_EMOJIS.map((m) => (
                            <button
                              key={m.emoji}
                              onClick={() => updateBadgeProperty("symbol", m.emoji)}
                              className={`py-1.5 rounded-lg text-lg border transition-all hover:scale-110 ${
                                badge.symbol === m.emoji
                                  ? "bg-yellow-500/25 border-yellow-500/50"
                                  : "bg-black/30 border-white/5"
                              }`}
                              title={m.label}
                            >
                              {m.emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Colors selector */}
                      <div className="flex flex-col gap-4 border-t border-white/5 pt-3">
                        {/* 1. Main Background Gradient Theme */}
                        <div>
                          <label className="text-[9px] uppercase font-bold text-white/40 tracking-wider block mb-2">
                            Visual Themes (Main Background Gradient)
                          </label>
                          <div className="grid grid-cols-3 gap-1">
                            {PRESET_GRADIENTS.map((p) => (
                              <button
                                key={p.name}
                                type="button"
                                onClick={() => {
                                  // ONLY change the main background color gradient
                                  updateBadgeProperty("bgColor", p.class);
                                }}
                                className={`py-1.5 px-1 bg-gradient-to-br ${p.class} border rounded-md text-[8px] uppercase font-bold text-white/90 text-center tracking-tighter truncate transition-all ${
                                  badge.bgColor === p.class
                                    ? "border-yellow-400 ring-2 ring-yellow-400/30 font-black scale-102"
                                    : "border-black/50 hover:border-white/30"
                                }`}
                              >
                                {p.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 2. Separate Crest Accent Highlight Color Section */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-[9px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-cyan-400" />
                              Crest Accent Highlight
                            </label>
                            
                            <div className="flex items-center gap-1.5 bg-black/50 px-2 py-0.5 rounded border border-white/10">
                              <span className="text-[8px] font-mono text-white/40">{badge.accentColor}</span>
                              <input
                                type="color"
                                value={badge.accentColor}
                                onChange={(e) => {
                                  updateBadgeProperty("accentColor", e.target.value);
                                }}
                                className="w-4 h-4 cursor-pointer bg-transparent border-0 p-0 rounded-sm"
                                title="Click to open full color dialog"
                              />
                            </div>
                          </div>

                          <p className="text-[8px] text-slate-400 mb-2.5 leading-normal">
                            Customizes the borders, stars, neon shadow glows, and detailed inner lining of your customized shield.
                          </p>

                          {/* Quick color preset circles for easier tap/selection */}
                          <div className="flex flex-wrap gap-2 items-center">
                            {[
                              { label: "Gold", hex: "#fbbf24", bg: "bg-amber-400" },
                              { label: "Cyan", hex: "#22d3ee", bg: "bg-cyan-400" },
                              { label: "Ruby", hex: "#f43f5e", bg: "bg-rose-500" },
                              { label: "Emerald", hex: "#10b981", bg: "bg-emerald-500" },
                              { label: "Neon Pink", hex: "#ec4899", bg: "bg-pink-500" },
                              { label: "Solar Orange", hex: "#f97316", bg: "bg-orange-500" },
                              { label: "White/Silver", hex: "#f1f5f9", bg: "bg-slate-200" },
                              { label: "Midnight Black", hex: "#0c0a09", bg: "bg-zinc-900 border border-white/20" },
                            ].map((preset) => (
                              <button
                                key={preset.hex}
                                type="button"
                                onClick={() => updateBadgeProperty("accentColor", preset.hex)}
                                className={`w-5 h-5 rounded-full ${preset.bg} relative transition-transform hover:scale-115 active:scale-95 ${
                                  badge.accentColor.toLowerCase() === preset.hex.toLowerCase()
                                    ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-110 shadow-lg"
                                    : "opacity-80 hover:opacity-100"
                                }`}
                                title={preset.label}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default BadgeBuilder;
