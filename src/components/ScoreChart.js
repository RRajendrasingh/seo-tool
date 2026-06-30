"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

export default function ScoreChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-500 text-xs">
        Not enough data to display trend
      </div>
    );
  }

  // Format data
  const chartData = data.map(d => ({
    ...d,
    formattedDate: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    score: Number(d.score)
  })).reverse(); // Oldest to newest for the chart left-to-right

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="formattedDate" 
            stroke="#64748b" 
            fontSize={10} 
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={10} 
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
            itemStyle={{ color: '#c4b5fd' }}
            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey="score" 
            stroke="#8b5cf6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorScore)" 
            activeDot={{ r: 6, fill: "#c084fc", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
