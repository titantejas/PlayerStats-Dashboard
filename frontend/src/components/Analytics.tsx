import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api, Summary } from "../api";

export function Analytics() {
  const [data, setData] = useState<Summary | null>(null);

  useEffect(() => {
    api<Summary>("/api/analytics/summary").then(setData).catch(() => undefined);
  }, []);

  if (!data) return <div className="card"><h2>Analytics</h2><p>Loading…</p></div>;

  return (
    <div className="card">
      <h2>Analytics</h2>
      <div className="stats">
        <div><b>{data.totalPlayers}</b><span>Players</span></div>
        <div><b>{data.totalMatches}</b><span>Matches</span></div>
        <div><b>{data.avgScore}</b><span>Avg score</span></div>
        <div><b>{data.maxScore}</b><span>Best avg</span></div>
      </div>
      <h3>Top teams by avg rating</h3>
      <div style={{ height: 220 }}>
        <ResponsiveContainer>
          <BarChart data={data.topTeams}>
            <XAxis dataKey="team" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="avgRating" fill="#4f7cff" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
