import React from "react";
import { motion } from "motion/react";
import { Player, Position } from "../types";
import { ICON_CARD_THEMES } from "../data/players";

// Position-specific curated real-world soccer action backgrounds
function getPlayerFallbackImage(player: Player): string {
  if (player.actionImageUrl && player.actionImageUrl.startsWith("http") && !player.actionImageUrl.includes("unsplash.com")) {
    return player.actionImageUrl;
  }
  return `/api/player-image?name=${encodeURIComponent(player.name)}&pos=${player.primaryPosition}`;
}

interface ProCardProps {
  player: Player | null;
  positionLabel: Position;
  onClick?: () => void;
  chemistryBoost?: number;
  eraAdjustment?: number;
  isSelected?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  isLocked?: boolean;
  tournamentMode?: "ucl" | "worldcup";
}

export const ProCard: React.FC<ProCardProps> = ({
  player,
  positionLabel,
  onClick,
  chemistryBoost = 0,
  eraAdjustment = 0,
  isSelected = false,
  size = "md",
  className = "",
  isLocked = false,
  tournamentMode = "ucl",
}) => {
  const [badgeImgError, setBadgeImgError] = React.useState(false);

  React.useEffect(() => {
    setBadgeImgError(false);
  }, [player?.id, player?.club]);

  // Size classes
  const sizeStyles = {
    sm: {
      card: "w-24 h-36 border text-[9px] rounded-md",
      badge: "w-4 h-4 text-xs",
      rating: "text-base font-bold",
      name: "text-[10px] font-bold tracking-tight uppercase",
      stats: "gap-x-1.5 leading-[9px]",
      pos: "text-[7px] font-medium opacity-80",
    },
    md: {
      card: "w-36 h-52 border text-[11px] rounded-lg shadow-md",
      badge: "w-6 h-6 text-base",
      rating: "text-2xl font-black",
      name: "text-[11px] font-semibold tracking-tight uppercase",
      stats: "grid grid-cols-2 gap-x-3 text-[9px] leading-[10px] p-1.5",
      pos: "text-[9px] font-medium opacity-85",
    },
    lg: {
      card: "w-48 h-64 border text-xs rounded-xl shadow-lg",
      badge: "w-8 h-8 text-xl",
      rating: "text-3xl font-extrabold",
      name: "text-sm font-bold tracking-tight uppercase mb-0.5",
      stats: "grid grid-cols-2 gap-x-4 text-[10px] leading-relaxed p-2 border-t border-yellow-500/10",
      pos: "text-xs font-semibold opacity-90",
    },
    xl: {
      card: "w-64 h-88 border text-sm rounded-2xl shadow-xl",
      badge: "w-12 h-12 text-3xl",
      rating: "text-5xl font-black tracking-tighter",
      name: "text-lg font-bold tracking-normal uppercase py-1",
      stats: "grid grid-cols-2 gap-x-6 text-xs leading-relaxed p-3.5 border-t border-yellow-500/20 bg-black/20",
      pos: "text-sm font-semibold opacity-90",
    },
  };

  const activeSize = sizeStyles[size];

  // If slot is empty (blank card)
  if (!player) {
    return (
      <motion.div
        id={`blank_card_${positionLabel}`}
        onClick={isLocked ? undefined : onClick}
        whileHover={isLocked ? {} : { scale: 1.04 }}
        whileTap={isLocked ? {} : { scale: 0.98 }}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed cursor-pointer transition-all duration-300
          ${isSelected 
            ? "border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] animate-pulse" 
            : "border-white/10 hover:border-cyan-500/35 bg-white/2 hover:bg-cyan-500/5 text-white/25 hover:text-cyan-300"
          } 
          ${activeSize.card} ${className}`}
      >
        <span className="text-[9px] uppercase font-mono tracking-widest opacity-60">SELECT</span>
        <div className={`mt-1 font-bold ${size === "sm" ? "text-xs" : "text-base"} border-b border-current px-1.5 pb-0.5`}>
          {positionLabel}
        </div>
        {size !== "sm" && (
          <span className="text-[9px] opacity-40 mt-1.5 font-mono tracking-tight animate-pulse text-cyan-400">⚡ CLICK TO DRAFT</span>
        )}
        {!isLocked && (
          <div className="absolute top-2 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </div>
        )}
      </motion.div>
    );
  }

  // Active player exists
  const isWcHero = !!(player.isWcHero || player.id.startsWith("wc_"));
  const themeClass = isWcHero
    ? "bg-gradient-to-b from-[#120024] via-[#5b15be] to-[#04000b] text-yellow-300 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.5)] ring-1 ring-yellow-400/50"
    : (tournamentMode === "worldcup"
        ? "bg-gradient-to-br from-amber-900 via-[#1c1404] to-zinc-950 text-amber-50 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
        : (ICON_CARD_THEMES[player.imageTheme] || "bg-radial from-slate-800 to-black text-slate-100 border-zinc-600"));
  const finalRating = player.originalRating + chemistryBoost + eraAdjustment;

  // Render stats
  const renderStatsBody = () => {
    const statsDef = [
      { label: "PAC", val: player.stats.pac },
      { label: "SHO", val: player.stats.sho },
      { label: "PAS", val: player.stats.pas },
      { label: "DRI", val: player.stats.dri },
      { label: "DEF", val: player.stats.def },
      { label: "PHY", val: player.stats.phy },
    ];

    if (size === "sm") {
      return (
        <div className="flex flex-wrap justify-center mt-1 text-[8px] gap-x-1 font-mono opacity-80">
          <div>P: {player.stats.pac}</div>
          <div>S: {player.stats.sho}</div>
          <div>D: {player.stats.def}</div>
        </div>
      );
    }

    return (
      <div className={activeSize.stats}>
        {statsDef.map((s) => (
          <div key={s.label} className="flex justify-between items-center font-mono">
            <span className="opacity-75">{s.label}</span>
            <span className="font-bold text-white">{s.val}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      id={`player_card_${player.id}`}
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -4, rotateY: 2 }}
      whileTap={{ scale: 0.98 }}
      className={`relative flex flex-col justify-between overflow-hidden cursor-pointer select-none border-2 transition-all 
        ${themeClass} ${isSelected ? "ring-2 ring-yellow-400 border-yellow-400" : ""} ${activeSize.card} ${className}`}
    >
      {/* Light glow effects */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/10 to-transparent pointer-events-none" />

      {/* Header Info: Rating & Position */}
      <div className="flex justify-between items-start p-2 leading-none relative z-20">
        <div>
          <div className="flex items-center gap-1">
            <span className={activeSize.rating}>{finalRating}</span>
            {chemistryBoost > 0 && (
              <span className="text-[10px] text-green-400 font-black font-mono animate-bounce" title="Chemistry Power Boost">
                +{chemistryBoost}
              </span>
            )}
            {eraAdjustment !== 0 && (
              <span className="text-[10px] text-indigo-400 font-extrabold font-mono" title="Era Normalization Balancing">
                {eraAdjustment > 0 ? `+${eraAdjustment}` : eraAdjustment}
              </span>
            )}
          </div>
          <div className={`${activeSize.pos} tracking-wider font-bold text-yellow-400 font-mono flex items-center gap-1`}>
            {player.primaryPosition}
            {isWcHero && (
              <span className="text-[7px] text-amber-300 font-black tracking-widest animate-pulse px-1 py-0.2 bg-purple-950/90 border border-yellow-500/50 rounded-sm leading-none uppercase">HERO</span>
            )}
          </div>
          {/* Tag if placed out of position */}
          {player.primaryPosition !== positionLabel && (
            <div className="text-[6px] text-orange-400 font-bold border border-orange-400/30 px-0.5 rounded mt-0.5 font-mono" title="Playing out of primary position">
              {positionLabel} Sub
            </div>
          )}
        </div>

        {/* Club/Nation crest */}
        <div className={`overflow-hidden bg-black/45 rounded-full flex items-center justify-center border border-yellow-500/20 shadow-xs relative ${activeSize.badge}`} title={tournamentMode === "worldcup" ? player.nation : player.club}>
          {tournamentMode === "worldcup" ? (
            <span className="leading-none text-base filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
              {getNationFlag(player.nation)}
            </span>
          ) : !badgeImgError ? (
            <img
              src={`/api/club-badge?club=${encodeURIComponent(player.club)}`}
              alt={player.club}
              referrerPolicy="no-referrer"
              onError={() => setBadgeImgError(true)}
              className="w-full h-full object-contain p-0.5"
            />
          ) : (
            <span className="leading-none">{getClubShortIcon(player.club)}</span>
          )}
        </div>
      </div>

      {/* Player Action Portrait Area */}
      <div className="relative flex-1 flex items-end justify-center min-h-[64px] overflow-hidden select-none pointer-events-none z-10 mx-1 rounded-md">
        {/* Gradients to fade photo nicely into card */}
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/80 to-transparent z-15" />
        <div className="absolute inset-0 bg-black/5 z-5" />
        
        <img
          src={getPlayerFallbackImage(player)}
          alt={player.name}
          referrerPolicy="no-referrer"
          className="absolute inset-x-0 -top-1 bottom-0 w-full h-[104%] object-cover object-top brightness-95 contrast-[1.05] transition-transform duration-500 scale-100 hover:scale-105"
        />

        {/* Large backronym */}
        <div className={`font-black tracking-widest text-white/5 absolute select-none pointer-events-none z-2 ${size === "xl" ? "text-8xl" : size === "lg" ? "text-6xl" : "text-4xl"}`}>
          {player.shortName.substring(0, 3).toUpperCase()}
        </div>

        {/* National Flag Emblem */}
        <div className="absolute right-1 bottom-1 text-base filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.8)] leading-none z-20">
          {getNationFlag(player.nation)}
        </div>
      </div>

      {/* Footer Info: Name & Stats */}
      <div className="text-center pb-2 relative z-20 mt-1">
        <div className="px-1 truncate">
          <h4 className={`${activeSize.name} text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.95)]`}>
            {player.shortName}
          </h4>
          {size !== "sm" && (
            <p className="text-[7.5px] opacity-80 font-bold uppercase tracking-widest text-amber-400">
              {tournamentMode === "worldcup" ? player.nation : player.club}
            </p>
          )}
        </div>

        {renderStatsBody()}
      </div>

      {/* Card Ribbon Accent lines */}
      <div className="absolute bottom-0 inset-x-0 h-0.5 bg-linear-to-r from-transparent via-yellow-500/30 to-transparent pointer-events-none" />
    </motion.div>
  );
};

// Map clubs to small representation emojis
export function getClubShortIcon(club: string): string {
  switch (club) {
    case "Real Madrid": return "👑";
    case "Barcelona": return "🔵";
    case "Bayern Munich": return "🔴";
    case "Manchester United": return "👹";
    case "AC Milan": return "👿";
    case "Juventus": return "🦓";
    case "Benfica": return "🦅";
    case "Ajax": return "❌";
    case "Arsenal": return "🔫";
    case "Manchester City": return "🦈";
    case "Liverpool": return "🔴";
    case "Inter Milan": return "🔵";
    case "Atlético Madrid": return "📐";
    case "Canada": return "🍁";
    default: return "⚽";
  }
}

// Map Nations to Emoji Flags
export function getNationFlag(nation: string): string {
  switch (nation) {
    case "Netherlands": return "🇳🇱";
    case "Germany": return "🇩🇪";
    case "Spain": return "🇪🇸";
    case "Portugal": return "🇵🇹";
    case "Northern Ireland": return "🇬🇧";
    case "France": return "🇫🇷";
    case "Italy": return "🇮🇹";
    case "Brazil": return "🇧🇷";
    case "England": return "🏴󠁧󠁢󠁥󠁮󠁧󠁿";
    case "Argentina": return "🇦🇷";
    case "Uruguay": return "🇺🇾";
    case "Norway": return "🇳🇴";
    case "Belgium": return "🇧🇪";
    case "Croatia": return "🇭🇷";
    case "Egypt": return "🇪🇬";
    case "Canada": return "🇨🇦";
    case "Poland": return "🇵🇱";
    case "Hungary": return "🇭🇺";
    case "South Korea": return "🇰🇷";
    case "Georgia": return "🇬🇪";
    case "Morocco": return "🇲🇦";
    case "Sweden": return "🇸🇪";
    case "Russia": return "🇷🇺";
    case "Serbia": return "🇷🇸";
    case "Czech Republic": return "🇨🇿";
    case "Denmark": return "🇩🇰";
    case "United States": return "🇺🇸";
    case "USA": return "🇺🇸";
    case "Trinidad and Tobago": return "🇹🇹";
    case "Zimbabwe": return "🇿🇼";
    case "Mali": return "🇲🇱";
    case "Cameroon": return "🇨🇲";
    case "Switzerland": return "🇨🇭";
    case "Ukraine": return "🇺🇦";
    case "Republic of Ireland": return "🇮🇪";
    case "Scotland": return "🏴󠁧󠁢󠁳󠁣󠁴󠁿";
    case "Senegal": return "🇸🇳";
    case "Slovakia": return "🇸🇰";
    case "Greece": return "🇬🇷";
    case "Japan": return "🇯🇵";
    case "Nigeria": return "🇳🇬";
    case "Wales": return "🏴󠁧󠁢󠁷󠁬󠁳󠁿";
    case "Colombia": return "🇨🇴";
    case "Mexico": return "🇲🇽";
    case "Australia": return "🇦🇺";
    case "Paraguay": return "🇵🇾";
    case "Ecuador": return "🇪🇨";
    case "Bosnia and Herzegovina": return "🇧🇦";
    case "Qatar": return "🇶🇦";
    default: return "🌍";
  }
}
export default ProCard;
