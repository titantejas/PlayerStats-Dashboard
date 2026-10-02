import { AuthProvider } from "./auth/AuthContext";
import { Leaderboard } from "./components/Leaderboard";
import { Analytics } from "./components/Analytics";
import { Login } from "./components/Login";
import { SubmitStat } from "./components/SubmitStat";
import { useState } from "react";
import "./styles.css";

export default function App() {
  const [tick, setTick] = useState(0);
  return (
    <AuthProvider>
      <div className="wrap">
        <header><h1>PlayerStats Dashboard</h1><p>Real-time leaderboard + analytics (MVP)</p></header>
        <Login />
        <SubmitStat key={tick} onDone={() => setTick((t) => t + 1)} />
        <div className="grid">
          <Leaderboard />
          <Analytics />
        </div>
      </div>
    </AuthProvider>
  );
}
