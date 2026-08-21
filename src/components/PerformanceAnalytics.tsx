import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { Player, UserMatchHistoryEntry } from "../types";
import { TrendingUp, Activity, Award, BarChart3, Users } from "lucide-react";

interface PerformanceAnalyticsProps {
  userMatchHistory: UserMatchHistoryEntry[];
  draftedLineup: Player[];
}

export const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({
  userMatchHistory,
  draftedLineup,
}) => {
  const [teamMetricTab, setTeamMetricTab] = useState<"goals" | "possession">("goals");
  const [selectedPlayerName, setSelectedPlayerName] = useState<string>(
    draftedLineup[0]?.shortName || ""
  );

  // Helper to shorten match stage names for better chart readability (e.g. "Group A - Matchday 1" -> "MD 1")
  const formatMatchLabel = (label: string) => {
    if (label.includes("Matchday")) {
      const match = label.match(/Matchday\s+(\d+)/);
      return match ? `MD ${match[1]}` : label;
    }
    if (label.includes("Quarter-Finals")) {
      return label.includes("Leg 1") ? "QF L1" : "QF L2";
    }
    if (label.includes("Semi-Finals")) {
      return label.includes("Leg 1") ? "SF L1" : "SF L2";
    }
    if (label.includes("Final")) {
      return "Final";
    }
    return label;
  };

  // Map history data for recharts
  const chartData = userMatchHistory.map((entry, index) => {
    const label = formatMatchLabel(entry.matchdayLabel);
    
    // Extract ratings for current step
    const ratingsObj: { [key: string]: number } = {};
    Object.entries(entry.playerRatings).forEach(([pName, val]) => {
      const rating = val as string | number;
      ratingsObj[pName] = typeof rating === "string" ? parseFloat(rating) : rating;
    });

    return {
      index: index + 1,
      fullLabel: entry.matchdayLabel,
      label,
      goalsScored: entry.goalsScored,
      goalsConceded: entry.goalsConceded,
      possession: entry.possession,
      ...ratingsObj,
    };
  });

  const selectedPlayerRatingsList = chartData.map((d) => ({
    label: d.label,
    fullLabel: d.fullLabel,
    rating: d[selectedPlayerName] !== undefined ? d[selectedPlayerName] : 6.0,
  }));

  const hasHistory = userMatchHistory.length > 0;

  // Compute calculated metrics for selected player
  const playerRatingsCount = selectedPlayerRatingsList.filter((r) => r.rating > 0).length;
  const avgPlayerRating = playerRatingsCount > 0
    ? (selectedPlayerRatingsList.reduce((sum, r) => sum + r.rating, 0) / playerRatingsCount).toFixed(2)
    : "N/A";
  const maxPlayerRating = playerRatingsCount > 0
    ? Math.max(...selectedPlayerRatingsList.map((r) => r.rating)).toFixed(1)
    : "N/A";
  const minPlayerRating = playerRatingsCount > 0
    ? Math.min(...selectedPlayerRatingsList.map((r) => r.rating)).toFixed(1)
    : "N/A";

  // Form calculation (W, D, L)
  const teamForm = userMatchHistory.map((item) => {
    if (item.goalsScored > item.goalsConceded) return "W";
    if (item.goalsScored === item.goalsConceded) return "D";
    return "L";
  });

  if (!hasHistory) {
    return (
      <div className="flex flex-col items-center justify-center py-20 p-6 bg-slate-950 border border-white/5 rounded-3xl text-center">
        <Activity className="w-12 h-12 text-cyan-500/40 animate-pulse mb-4" />
        <h4 id="no_data_title" className="text-white font-display font-bold text-lg">No Season Performance Logs Yet</h4>
        <p className="text-white/50 text-xs max-w-sm mt-2">
          Your analytical progression dashboard is ready! Simulate group matchdays and knockout stages to view live performance graphs, team trends, and individual match rating curves.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* High-level dynamic summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-[#0A0D14]/80 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-xl">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <span className="text-[10px] text-white/40 block font-mono uppercase tracking-wider">Matches Simulated</span>
            <span id="stat_matches_sim" className="text-xl font-black text-white">{userMatchHistory.length}</span>
          </div>
        </div>

        <div className="bg-[#0A0D14]/80 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] text-white/40 block font-mono uppercase tracking-wider">Total Goals Scored</span>
            <span id="stat_total_goals" className="text-xl font-black text-white">
              {userMatchHistory.reduce((sum, item) => sum + item.goalsScored, 0)}
            </span>
          </div>
        </div>

        <div className="bg-[#0A0D14]/80 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 rounded-xl">
            <TrendingUp className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <span className="text-[10px] text-white/40 block font-mono uppercase tracking-wider">Total Goals Conceded</span>
            <span id="stat_conceded_goals" className="text-xl font-black text-white">
              {userMatchHistory.reduce((sum, item) => sum + item.goalsConceded, 0)}
            </span>
          </div>
        </div>

        <div className="bg-[#0A0D14]/80 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 rounded-xl">
            <Users className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <span className="text-[10px] text-white/40 block font-mono uppercase tracking-wider">Squad Form</span>
            <div id="stat_form_list" className="flex gap-1.5 mt-1">
              {teamForm.slice(-5).map((result, i) => (
                <span
                  key={i}
                  className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-extrabold text-[10px] select-none
                    ${result === "W" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : ""}
                    ${result === "D" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : ""}
                    ${result === "L" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : ""}
                  `}
                >
                  {result}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Two-Column Grid: Team Metrics & Player Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* GRAPH 1: Team Metrics over Time */}
        <div className="lg:col-span-6 bg-[#0A0D14]/60 border border-white/5 rounded-3xl p-5 md:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <h4 className="font-display font-bold text-white text-sm">Squad Campaign Trends</h4>
              </div>
              <div className="flex rounded-lg bg-black/40 border border-white/5 p-1 text-[10px] font-bold">
                <button
                  onClick={() => setTeamMetricTab("goals")}
                  className={`px-3 py-1 rounded-md transition-all ${teamMetricTab === "goals" ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20" : "text-white/60 hover:text-white"}`}
                >
                  Goals Scored/Conceded
                </button>
                <button
                  onClick={() => setTeamMetricTab("possession")}
                  className={`px-3 py-1 rounded-md transition-all ${teamMetricTab === "possession" ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20" : "text-white/60 hover:text-white"}`}
                >
                  Possession (%)
                </button>
              </div>
            </div>

            <p className="text-white/50 text-[11px] mb-4">
              Tracking your tactical progression match-by-match from the opening Group Stage matchdays up to the prestigious Wembley Finals.
            </p>
          </div>

          <div className="h-64 md:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {teamMetricTab === "goals" ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGoals" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorConceded" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis
                    dataKey="label"
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={10}
                    fontFamily="monospace"
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={10}
                    fontFamily="monospace"
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#05070A",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      fontSize: "11px",
                      color: "#fff",
                      fontFamily: "sans-serif",
                    }}
                    labelStyle={{ color: "#22d3ee", fontWeight: "bold", marginBottom: "4px" }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "10px", marginTop: "10px" }}
                    verticalAlign="bottom"
                    height={16}
                  />
                  <Area
                    type="monotone"
                    name="Goals Scored"
                    dataKey="goalsScored"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorGoals)"
                  />
                  <Area
                    type="monotone"
                    name="Goals Conceded"
                    dataKey="goalsConceded"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorConceded)"
                  />
                </AreaChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis
                    dataKey="label"
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={10}
                    fontFamily="monospace"
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={10}
                    fontFamily="monospace"
                    domain={[30, 70]}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#05070A",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      fontSize: "11px",
                      color: "#fff",
                    }}
                    labelStyle={{ color: "#22d3ee", fontWeight: "bold", marginBottom: "4px" }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "10px", marginTop: "10px" }}
                    verticalAlign="bottom"
                    height={16}
                  />
                  <Line
                    type="monotone"
                    name="Team Possession"
                    dataKey="possession"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    dot={{ fill: "#0891b2", strokeWidth: 1 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH 2: Player Rating curve over matches */}
        <div className="lg:col-span-6 bg-[#0A0D14]/60 border border-white/5 rounded-3xl p-5 md:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h4 className="font-display font-bold text-white text-sm">Squad Player Progression</h4>
              </div>
              <div>
                <select
                  id="analytics_player_select"
                  value={selectedPlayerName}
                  onChange={(e) => setSelectedPlayerName(e.target.value)}
                  className="bg-black/60 border border-white/10 hover:border-white/20 rounded-lg text-xs text-white py-1 px-3 focus:outline-none cursor-pointer"
                >
                  {draftedLineup.map((p) => (
                    <option key={p.id} value={p.shortName}>
                      {p.shortName} ({p.primaryPosition})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-white/50 text-[11px] mb-4">
              View how individual tactical performances fluctuate. Ratings are calculated dynamically based on scorelines and position duties.
            </p>
          </div>

          {/* Quick Player Stat Info-banner */}
          <div className="grid grid-cols-3 gap-2 bg-black/35 border border-white/5 p-2 rounded-xl mb-4 text-center font-mono">
            <div>
              <span className="text-[9px] text-white/40 block uppercase">Avg Rating</span>
              <span id="player_avg_rating" className="text-xs font-black text-cyan-400">{avgPlayerRating}</span>
            </div>
            <div>
              <span className="text-[9px] text-white/40 block uppercase">Peak Rating</span>
              <span id="player_peak_rating" className="text-xs font-black text-emerald-400">{maxPlayerRating}</span>
            </div>
            <div>
              <span className="text-[9px] text-white/40 block uppercase">Low Rating</span>
              <span id="player_low_rating" className="text-xs font-black text-rose-450">{minPlayerRating}</span>
            </div>
          </div>

          <div className="h-56 md:h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedPlayerRatingsList} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis
                  dataKey="label"
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={10}
                  fontFamily="monospace"
                />
                <YAxis
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={10}
                  fontFamily="monospace"
                  domain={[4, 10]}
                  ticks={[4, 5, 6, 7, 8, 9, 10]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#05070A",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "11px",
                    color: "#fff",
                  }}
                  labelStyle={{ color: "#22d3ee", fontWeight: "bold", marginBottom: "4px" }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "10px", marginTop: "10px" }}
                  verticalAlign="bottom"
                  height={16}
                />
                <Line
                  type="monotone"
                  name={`${selectedPlayerName} (Match Rating)`}
                  dataKey="rating"
                  stroke="#fbbf24"
                  strokeWidth={2.5}
                  dot={{ fill: "#d97706", strokeWidth: 1 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
