import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Network, History, Award, CheckCircle, Info, ExternalLink, Calendar, PlusCircle } from "lucide-react";
import { UserCareerState, Player, LineupSetup, Formation } from "../types";
import { chemistryGraphInstance } from "../utils/chemistryGraph";
import { getNationFlag, getClubShortIcon } from "./ProCard";

interface StatsDashboardProps {
  careerState: UserCareerState;
  lineup: LineupSetup;
  formation: Formation;
  onResetCareer: () => void;
  onStartNewDraft: () => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  careerState,
  lineup,
  formation,
  onResetCareer,
  onStartNewDraft,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"cabinet" | "graph">("cabinet");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Social Share states
  const [shareSeason, setShareSeason] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const handleOpenShareModal = (season: any) => {
    setShareSeason(season);
    setCopied(false);
  };

  const getShareText = (season: any) => {
    const isUndefeated = season.record?.losses === 0;
    const isWc = season.tournamentMode === "worldcup" || season.year % 2 === 0;
    const formatName = isWc ? "Global World Cup" : "UEFA Champions League";
    const statusText = isUndefeated ? "🛡️ UNDEFEATED / INVINCIBLE 🛡️" : `reached the ${season.stageReached}`;

    return `🎮 Drafted a legendary 🪐 ${season.draftedSquadName || careerState.squadName} dynasty in Undefeated XI!\n\n⚽ Format: ${formatName}\n📊 Rating: ${season.squadAverageRating} OVR | Chemistry: ${season.chemistryScore}%\n🏆 Record: ${season.record?.wins}W - ${season.record?.draws}D - ${season.record?.losses}L (${statusText})\n\nDraft your squad here and challenge my career record! #UndefeatedXI`;
  };

  const handleCopyShare = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // Parse direct active network elements
  const network = chemistryGraphInstance.getNetworkVisualization(lineup, formation);

  const selectedNodeDetails = network.nodes.find((n) => n.id === selectedNodeId);

  // Calculate links for selected player in graph details drawer
  const getSelectedNodeConnections = (nodeId: string) => {
    return network.edges.filter((e) => e.source === nodeId || e.target === nodeId).map((e) => {
      const otherId = e.source === nodeId ? e.target : e.source;
      const otherNode = network.nodes.find((n) => n.id === otherId);
      return {
        edge: e,
        partnerName: otherNode ? otherNode.label : "Legend partner",
        partnerClub: otherNode ? otherNode.club : "",
        partnerNation: otherNode ? otherNode.nation : "",
      };
    });
  };

  const totalWins = careerState.historicalSeasons.reduce((acc, curr) => acc + curr.record.wins, 0);
  const totalLosses = careerState.historicalSeasons.reduce((acc, curr) => acc + curr.record.losses, 0);
  const totalDraws = careerState.historicalSeasons.reduce((acc, curr) => acc + curr.record.draws, 0);

  return (
    <div className="space-y-8 py-4 relative z-10">
      
      {/* Career Overview Banner */}
      <div className="bg-radial from-slate-900 to-slate-950 border border-slate-850 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-[30%] aspect-square rounded-full bg-yellow-500/5 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-[10px] text-yellow-400 font-mono tracking-widest uppercase font-bold">
              User Career Statistics Tracker
            </span>
            <div className="flex items-center gap-3 mt-1">
              <h2 className="font-display font-medium text-2xl md:text-3xl text-white">
                Manager Dynasty: <span className="text-yellow-400 font-extrabold">{careerState.squadName}</span>
              </h2>
            </div>
            
            {/* Simple resume stats */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-xs font-mono text-slate-400">
              <div>Seasons Competed: <span className="font-bold text-white font-sans">{careerState.seasonsCount}</span></div>
              <div>Career Wins: <span className="font-bold text-emerald-400 font-sans">{totalWins}</span></div>
              <div>Career Losses: <span className="font-bold text-rose-400 font-sans">{totalLosses}</span></div>
              <div>Trophies Won: <span className="font-bold text-yellow-450 font-sans">{careerState.trophies.length}</span></div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              id="start_new_draft_btn"
              onClick={onStartNewDraft}
              className="flex items-center gap-2 py-3 px-5 bg-linear-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5px]" />
              DRAFT NEW EUROPEAN SQUAD
            </button>
            <button
              id="reset_career_btn"
              onClick={onResetCareer}
              className="py-3 px-4 border border-rose-950 hover:border-rose-900 bg-rose-500/5 hover:bg-rose-505/10 text-rose-400 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Reset Career Cache
            </button>
          </div>
        </div>
      </div>

      {/* Selector tabs dashboards */}
      <div className="flex border-b border-slate-900 font-display font-medium text-xs">
        <button
          onClick={() => setActiveSubTab("cabinet")}
          className={`pb-3 px-4 relative transition-colors ${activeSubTab === "cabinet" ? "text-yellow-405 font-bold" : "text-slate-450 hover:text-slate-300"}`}
        >
          <span className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-yellow-400" />
            Trophy Room & Seasonal History
          </span>
          {activeSubTab === "cabinet" && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-yellow-404" />}
        </button>
        <button
          onClick={() => setActiveSubTab("graph")}
          className={`pb-3 px-4 relative transition-colors ${activeSubTab === "graph" ? "text-yellow-405 font-bold" : "text-slate-450 hover:text-slate-300"}`}
        >
          <span className="flex items-center gap-1.5">
            <Network className="w-4 h-4 text-sky-400" />
            Active Team Chemistry Relationship Graph
          </span>
          {activeSubTab === "graph" && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-yellow-404" />}
        </button>
      </div>

      {/* DASHBOARD TAB 1: TROPHY ROOM & SEASONS */}
      {activeSubTab === "cabinet" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Trophy Case display container */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-md text-center flex flex-col justify-between">
            <div>
              <h3 className="font-display font-medium text-slate-100 text-sm mb-6 uppercase tracking-wider text-left border-b border-slate-850 pb-2">
                Silverware Cabinet
              </h3>

              {careerState.trophies.length === 0 ? (
                <div className="py-12 text-slate-500">
                  <Trophy className="w-16 h-16 mx-auto text-slate-800 opacity-20 mb-4" />
                  <p className="text-xs max-w-xs mx-auto leading-relaxed">
                    This cabinet is currently empty! Win groups, construct pristine chemistry links, and conquer the neutral Wembley finals to display legendary golden cups here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-6 py-6 justify-center">
                  {careerState.trophies.map((year, idx) => (
                    <motion.div
                      key={`${year}_${idx}`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="p-4 bg-linear-to-b from-yellow-505/10 to-transparent border border-yellow-500/25 rounded-xl text-center shadow-lg relative cursor-pointer"
                    >
                      <Trophy className="w-10 h-10 text-yellow-400 mx-auto drop-shadow-[0_0_10px_rgba(234,179,8,0.35)]" />
                      <span className="font-mono text-[10px] text-yellow-400 font-bold block mt-2">UCL GOLD</span>
                      <span className="font-semibold text-white text-xs block font-mono">{year}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-850 pt-4 text-[11px] text-slate-500 text-left">
              💡 <span className="font-bold">Fact:</span> Team Chemistry (linked by identical era, clubs, or countries) adds up to +3 to overall player statistics in simulated games.
            </div>
          </div>

          {/* Historical seasons tracker column */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-md">
            <h3 className="font-display font-medium text-slate-100 text-sm mb-4 uppercase tracking-wider border-b border-slate-850 pb-2 flex justify-between items-center">
              <span>Historical Season Logs</span>
              <span className="text-[10px] text-slate-500 font-mono">Real-time ledger updates</span>
            </h3>

            {careerState.historicalSeasons.length === 0 ? (
              <p className="text-center py-20 text-slate-500 text-xs italic">
                No seasons registered on the careers ledger yet.
              </p>
            ) : (
              <div className="space-y-4 max-h-112 overflow-y-auto pr-2">
                {careerState.historicalSeasons.map((season, idx) => {
                  const isUndefeated = season.record?.losses === 0;
                  const isWc = season.tournamentMode === "worldcup";
                  const seasonNum = careerState.historicalSeasons.length - idx;
                  const difficultyName = season.difficulty || "Amateur";
                  return (
                    <div key={season.year} className={`p-4 rounded-xl border text-xs text-slate-350 space-y-3 transition-colors ${
                      isUndefeated 
                        ? "bg-radial from-emerald-950/15 to-slate-950/45 border-emerald-500/20" 
                        : "bg-black/35 border-slate-850"
                    }`}>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                        <div className="flex flex-wrap items-center gap-2 text-slate-200 font-bold">
                          <Calendar className={`w-4 h-4 ${isWc ? "text-amber-400" : "text-sky-400"}`} />
                          <span>Season {seasonNum}</span>
                          <span className="text-[10px] text-slate-500 font-mono font-medium">({season.year})</span>
                          <span className="text-[9px] text-slate-500 font-normal">
                            ({isWc ? "🏆 World Cup" : "🇪🇺 UCL"})
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-black uppercase border flex items-center gap-0.5 
                            ${difficultyName === "Amateur" ? "bg-emerald-500/10 border-emerald-555/20 text-emerald-400" : ""}
                            ${difficultyName === "Semi-Pro" || difficultyName === "SemiPro" ? "bg-amber-500/10 border-amber-555/20 text-amber-400" : ""}
                            ${difficultyName === "Professional" ? "bg-orange-500/10 border-orange-555/20 text-orange-400" : ""}
                            ${difficultyName === "Legendary" ? "bg-red-500/10 border-red-555/20 text-red-400" : ""}
                          `}>
                            🎮 {difficultyName}
                          </span>
                          {isUndefeated && (
                            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded animate-pulse">
                              🛡️ INVINCIBLE
                            </span>
                          )}
                        </div>
                        <span className={`py-1 px-3.5 rounded-full font-black text-[9px] uppercase font-mono tracking-wider
                          ${season.stageReached === "Champion" 
                            ? "bg-yellow-505/10 text-yellow-400 border border-yellow-500/20" 
                            : "bg-slate-900 border border-slate-800 text-slate-300"}`}
                        >
                          {season.stageReached}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                        <div>
                          <span className="opacity-60 block">OVR Rating</span>
                          <span className="font-mono font-bold text-yellow-400 text-sm mt-0.5 block">{season.squadAverageRating}</span>
                        </div>
                        <div>
                          <span className="opacity-60 block">Chemistry Score</span>
                          <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5 block">{season.chemistryScore}%</span>
                        </div>
                        <div>
                          <span className="opacity-60 block">Campaign Stats</span>
                          <span className={`font-mono mt-0.5 block ${isUndefeated ? "text-emerald-400 font-bold" : "text-slate-200"}`}>
                            {season.record?.wins}W - {season.record?.draws}D - {season.record?.losses}L
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-900 mt-2">
                        <span className="text-[10px] text-slate-500">
                          Squad: <span className="text-slate-350 font-semibold">{season.draftedSquadName || careerState.squadName}</span>
                        </span>
                        <button
                          onClick={() => handleOpenShareModal(season)}
                          className="flex items-center gap-1 py-1 px-2.5 bg-white/5 hover:bg-white/10 text-white/80 font-bold rounded-lg cursor-pointer transition-colors text-[9px] tracking-wider uppercase font-mono border border-white/10 hover:border-white/20"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Share Record
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* DASHBOARD TAB 2: ACTIVE CHEMISTRY RELATIONSHIP GRAPH VISUALIZER */}
      {activeSubTab === "graph" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Network Canvas */}
          <div className="lg:col-span-8 bg-slate-950 border border-slate-850 p-6 rounded-2xl shadow-md min-h-[480px] relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-linear-to-r from-transparent via-sky-503 to-transparent" />
            
            <div>
              <h3 className="font-display font-medium text-slate-250 text-sm flex justify-between">
                <span>Active Graph Visualization Matrix</span>
                <span className="text-[10px] text-sky-400 font-mono italic">Client relationship networks</span>
              </h3>
              <p className="text-[11px] text-slate-505 mt-1">
                This graph shows players in your current lineup as networked nodes. Connecting lines (edges) represent active Chemistry Links calculated dynamically by the local graph database engine. Click any player node to query detailed link structures!
              </p>
            </div>

            {/* Simulated graph plotting inside relative container mimicking pitch positions */}
            <div className="relative w-full aspect-[4/3] bg-radial from-slate-900/60 to-black rounded-xl border border-slate-900 my-6">
              
              {/* Plot absolute SVG connecting lines first */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {network.edges.map((edge, idx) => {
                  const sourceNode = network.nodes.find((n) => n.id === edge.source);
                  const targetNode = network.nodes.find((n) => n.id === edge.target);

                  if (!sourceNode || !targetNode) return null;

                  // Resolve coordinates matches from pitch layout percentages
                  const sourceFormPos = formation.positions.find((p) => p.key === edge.sourcePos)!;
                  const targetFormPos = formation.positions.find((p) => p.key === edge.targetPos)!;

                  const x1 = `${sourceFormPos.x}%`;
                  const y1 = `${100 - sourceFormPos.y}%`;
                  const x2 = `${targetFormPos.x}%`;
                  const y2 = `${100 - targetFormPos.y}%`;

                  return (
                    <line
                      key={`${edge.source}_${edge.target}_${idx}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={edge.color}
                      strokeWidth={selectedNodeId === edge.source || selectedNodeId === edge.target ? "4" : "2"}
                      opacity={selectedNodeId && (selectedNodeId !== edge.source && selectedNodeId !== edge.target) ? "0.15" : "0.7"}
                      className="transition-all"
                    />
                  );
                })}
              </svg>

              {/* Node components */}
              {network.nodes.map((node) => {
                const formPos = formation.positions.find((p) => p.key === node.positionKey)!;
                const isSelected = selectedNodeId === node.id;

                return (
                  <motion.div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    whileHover={{ scale: 1.15 }}
                    style={{
                      left: `${formPos.x}%`,
                      top: `${100 - formPos.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    className={`absolute z-10 w-11 h-11 rounded-full border flex items-center justify-center cursor-pointer select-none transition-all
                      ${isSelected 
                        ? "bg-yellow-500 border-yellow-350 text-black shadow-[0_0_15px_#facc15]" 
                        : "bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-400"
                      }`}
                    title={`${node.label} (${node.club})`}
                  >
                    <span className="font-mono text-[9px] font-black">{node.label.substring(0,3).toUpperCase()}</span>
                    
                    {/* Tiny badge indicating position key */}
                    <span className="absolute -bottom-1 -right-1 bg-black border border-slate-800 text-[6.5px] px-0.5 rounded text-yellow-450 uppercase font-mono">
                      {formPos.label}
                    </span>
                  </motion.div>
                );
              })}

            </div>

            {/* Colors legend keys */}
            <div className="flex flex-wrap gap-4 text-[9px] font-mono text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-[#22c55e] inline-block rounded" /> Club connection
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-[#3b82f6] inline-block rounded" /> Country connection
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-[#6366f1] inline-block rounded" /> Era synergy only
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-[#facc15] inline-block rounded" /> Multi-linked relationship
              </div>
            </div>

          </div>

          {/* Connected Details Column */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-850 p-5 rounded-2xl shadow-md min-h-[480px] flex flex-col justify-between">
            <div>
              <h3 className="font-display font-medium text-slate-100 text-sm mb-4 uppercase tracking-wider border-b border-slate-850 pb-2">
                Relationship Logs
              </h3>

              {selectedNodeDetails ? (
                <div className="space-y-4">
                  {/* Selected player bio */}
                  <div className="p-4 bg-black/45 border border-slate-850 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{getNationFlag(selectedNodeDetails.nation)}</span>
                      <div>
                        <h4 className="font-bold text-slate-105 text-sm">{selectedNodeDetails.label}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{selectedNodeDetails.club}</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-505 block mt-2 font-semibold">Active Era: {selectedNodeDetails.era}</span>
                  </div>

                  {/* Node connections list query */}
                  <h4 className="text-[10px] uppercase font-bold text-slate-505 tracking-wider font-mono">
                    Direct Connections ({getSelectedNodeConnections(selectedNodeDetails.id).length})
                  </h4>

                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {getSelectedNodeConnections(selectedNodeDetails.id).map((conn, idx) => (
                      <div key={idx} className="p-3 bg-slate-850 rounded-lg text-xs border border-slate-800 flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-slate-200 block">{conn.partnerName}</span>
                          <span className="text-[9px] text-slate-450 font-mono">{conn.partnerClub}</span>
                        </div>
                        
                        {/* Tags list */}
                        <div className="flex flex-col gap-1 items-end">
                          {conn.edge.clubShared && (
                            <span className="bg-emerald-500/10 text-emerald-400 font-bold text-[7.5px] uppercase px-1 py-0.5 rounded border border-emerald-500/20">Same Club</span>
                          )}
                          {conn.edge.nationShared && (
                            <span className="bg-sky-505/10 text-sky-450 font-bold text-[7.5px] uppercase px-1 py-0.5 rounded border border-sky-500/20">Same Nation</span>
                          )}
                          {conn.edge.eraShared && (
                            <span className="bg-indigo-505/10 text-indigo-400 font-bold text-[7.5px] uppercase px-1 py-0.5 rounded border border-indigo-500/20">Same Era</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-slate-500 text-xs">
                  <Info className="w-9 h-9 mx-auto text-slate-705 mb-3" />
                  <p className="max-w-[180px] mx-auto">Click any player node in the active graph simulation to showcase exact direct connections!</p>
                </div>
              )}
            </div>

            {selectedNodeId && (
              <button
                id="close_connections_btn"
                onClick={() => setSelectedNodeId(null)}
                className="w-full py-2 bg-slate-950 text-slate-400 hover:text-slate-300 border border-slate-850 rounded-lg text-xs"
              >
                Clear Query selection
              </button>
            )}
          </div>

        </div>
      )}

      {/* Campaign Share Dialog overlay portal */}
      <AnimatePresence>
        {shareSeason && (
          <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50">
            <div className="absolute inset-0" onClick={() => setShareSeason(null)} />
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-sm bg-slate-950 border border-slate-850 rounded-3xl p-6 shadow-2xl z-10"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-900 mb-4 font-mono">
                <span className="text-[10px] text-yellow-405 uppercase font-bold tracking-wider">Share Career Milestones</span>
                <button
                  onClick={() => setShareSeason(null)}
                  className="text-xs text-slate-400 hover:text-slate-205 cursor-pointer font-bold"
                >
                  Close
                </button>
              </div>

              {/* Decorative shareable preview card */}
              <div className="bg-radial from-slate-900 to-black border border-slate-855 rounded-2xl p-5 text-center mb-5 relative overflow-hidden shadow-inner">
                <div className="absolute top-0 inset-x-0 h-[1.5px] bg-linear-to-r from-transparent via-yellow-501 to-transparent opacity-60" />
                <Trophy className="w-10 h-10 text-yellow-400 mx-auto drop-shadow-[0_0_12px_rgba(234,179,8,0.25)] mb-3 animate-pulse" />
                
                <h4 className="font-display font-black text-slate-100 text-lg uppercase tracking-tight truncate">
                  {shareSeason.draftedSquadName || careerState.squadName}
                </h4>
                <p className="text-[10px] text-yellow-450 font-mono uppercase tracking-widest mt-1">
                  {shareSeason.tournamentMode === "worldcup" ? "🏆 World Cup Squad" : "🇪🇺 Club Squad"}
                </p>

                <div className="grid grid-cols-3 gap-2 mt-4 bg-black/45 p-3 rounded-xl border border-slate-900/60 text-center text-xs">
                  <div>
                    <span className="text-[9px] text-slate-500 block">Rating</span>
                    <span className="text-yellow-402 font-bold font-mono">{shareSeason.squadAverageRating} OVR</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Chemistry</span>
                    <span className="text-emerald-400 font-bold font-mono">{shareSeason.chemistryScore}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Record</span>
                    <span className="text-white font-bold font-mono">
                      {shareSeason.record?.wins}W - {shareSeason.record?.losses}L
                    </span>
                  </div>
                </div>

                <div className="mt-4 text-[10px] font-semibold font-mono text-slate-350 leading-relaxed max-w-sm mx-auto p-1.5 rounded-lg border border-white/5 bg-white/2">
                  {shareSeason.record?.losses === 0 
                    ? "🛡️ Status: Undefeated Invincible!" 
                    : `Campaign Peak: ${shareSeason.stageReached}!`}
                </div>
              </div>

              {/* Copy share card raw content textbox */}
              <div className="space-y-4 font-sans">
                <textarea
                  readOnly
                  value={getShareText(shareSeason)}
                  className="w-full text-[10px] leading-relaxed font-mono p-3 bg-black/60 rounded-xl border border-slate-855 text-slate-205 focus:outline-none select-all h-28"
                />

                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button
                    onClick={() => handleCopyShare(getShareText(shareSeason))}
                    className="py-2.5 px-2 bg-white hover:bg-slate-200 text-black text-[10px] font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {copied ? "Copied! ✓" : "Copy Text"}
                  </button>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText(shareSeason))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-2 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white text-[10px] font-bold rounded-xl transition-all flex items-center justify-center text-center"
                  >
                    Twitter / X
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(getShareText(shareSeason))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-2 bg-[#25d366] hover:bg-[#20ba5a] text-white text-[10px] font-bold rounded-xl transition-all flex items-center justify-center text-center"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default StatsDashboard;
