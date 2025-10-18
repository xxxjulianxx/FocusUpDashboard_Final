import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import '../styles.css'


// 🔗 URL base del backend (Vercel o local)
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://focus-up-backend.vercel.app/api";

export default function Dashboard() {
  const [tab, setTab] = useState("ranking");
  const [game, setGame] = useState("reaction");
  const [ranking, setRanking] = useState([]);
  const [combinedHistory, setCombinedHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // 📊 Cargar ranking automáticamente al cambiar de juego
  useEffect(() => {
    loadRanking();
  }, [game]);

  // 🏆 Cargar ranking de un juego
  async function loadRanking() {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/scores/ranking?game=${encodeURIComponent(game)}`
      );
      const data = await res.json();
      setRanking(data?.data || []);
    } catch (e) {
      console.error("Error loading ranking:", e);
    } finally {
      setLoading(false);
    }
  }

  // 📜 Cargar historial combinado (para history y metrics)
  async function loadAllHistory() {
    setLoading(true);
    try {
      const games = ["reaction", "focus", "cups", "memory"];
      const promises = games.map((g) =>
        fetch(`${API_BASE}/scores/ranking?game=${encodeURIComponent(g)}`)
          .then((r) => r.json())
          .catch(() => ({ data: [] }))
      );
      const results = await Promise.all(promises);
      const merged = results.flatMap((r) => r.data || []);
      merged.sort(
        (a, b) =>
          new Date(b.lastPlayed || b.createdAt) -
          new Date(a.lastPlayed || a.createdAt)
      );
      setCombinedHistory(merged);
    } catch (e) {
      console.error("Error loading history:", e);
    } finally {
      setLoading(false);
    }
  }

  // 📈 Calcular métricas por juego
  function computeMetrics() {
    const games = ["reaction", "focus", "cups", "memory"];
    return games.map((g) => {
      const items = combinedHistory.filter((i) => i.game === g);
      const avgScore = items.length
        ? items.reduce((s, x) => s + Number(x.score || 0), 0) / items.length
        : 0;
      return {
        game: g,
        avg: Number(avgScore.toFixed(2)),
        count: items.length,
      };
    });
  }

  return (
    <div>
      {/* 🔝 Menú superior fijo */}
      <header className="header">
        <div className="wrap">
          <div className="brand">FocusUp Dashboard</div>
          <nav className="nav">
            <button
              className={tab === "ranking" ? "active" : ""}
              onClick={() => setTab("ranking")}
            >
              Ranking
            </button>
            <button
              className={tab === "history" ? "active" : ""}
              onClick={() => {
                setTab("history");
                loadAllHistory();
              }}
            >
              History
            </button>
            <button
              className={tab === "metrics" ? "active" : ""}
              onClick={() => {
                setTab("metrics");
                loadAllHistory();
              }}
            >
              Metrics
            </button>
          </nav>
        </div>
      </header>

      {/* 📄 Contenido principal */}
      <main className="container">
        {/* 🏆 TAB: Ranking */}
        {tab === "ranking" && (
          <section>
            <div
              style={{
                display: "flex",
                gap: 12,
                marginBottom: 12,
                alignItems: "center",
              }}
            >
              <label>Juego:</label>
              <select value={game} onChange={(e) => setGame(e.target.value)}>
                <option value="reaction">Reaction</option>
                <option value="focus">Focus</option>
                <option value="cups">Cups</option>
                <option value="memory">Memory</option>
              </select>
              <button onClick={loadRanking}>Actualizar</button>
            </div>

            <div className="grid">
              <div className="card">
                <h4>Top - {game}</h4>
                {loading ? (
                  <div>Loading...</div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Player</th>
                        <th>Score</th>
                        <th>Time</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ranking.map((r, i) => (
                        <tr key={r._id || i}>
                          <td>{r.rank || i + 1}</td>
                          <td>
                            {r.playerName ||
                              (r.userId && r.userId.name) ||
                              "Invitado"}
                          </td>
                          <td>{r.score}</td>
                          <td>{r.timeMs || "—"}</td>
                          <td>
                            {r.lastPlayed
                              ? new Date(r.lastPlayed).toLocaleString()
                              : r.createdAt
                              ? new Date(r.createdAt).toLocaleString()
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="card">
                <h4>Quick Stats</h4>
                <p>Entries fetched: {ranking.length}</p>
                <p>Source: {API_BASE}/scores/ranking</p>
              </div>

              <div className="card full">
                <h4>Visualization - Top {game}</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={ranking.map((r) => ({
                      name:
                        r.playerName ||
                        (r.userId && r.userId.name) ||
                        "Invitado",
                      value: Number(r.score),
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}

        {/* 📜 TAB: History */}
        {tab === "history" && (
          <section>
            <div style={{ marginBottom: 12 }}>
              <button onClick={loadAllHistory}>Actualizar Historial</button>
            </div>
            <div className="card">
              <h4>Recent combined history</h4>
              {loading ? (
                <div>Loading...</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Game</th>
                      <th>Player</th>
                      <th>Score</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {combinedHistory.map((s, i) => (
                      <tr key={s._id || i}>
                        <td>{i + 1}</td>
                        <td>{s.game}</td>
                        <td>
                          {s.playerName ||
                            (s.userId && s.userId.name) ||
                            "Invitado"}
                        </td>
                        <td>{s.score}</td>
                        <td>
                          {s.lastPlayed
                            ? new Date(s.lastPlayed).toLocaleString()
                            : s.createdAt
                            ? new Date(s.createdAt).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}

        {/* 📊 TAB: Metrics */}
        {tab === "metrics" && (
          <section>
            <div className="grid">
              <div className="card">
                <h4>Average score per game</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={computeMetrics()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="game" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avg" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <h4>Plays distribution</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={computeMetrics()}
                      dataKey="count"
                      nameKey="game"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                    >
                      {computeMetrics().map((entry, index) => (
                        <Cell
                          key={entry.game}
                          fill={
                            ["#2563eb", "#34d399", "#f59e0b", "#ef4444"][
                              index % 4
                            ]
                          }
                        />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="card full">
                <h4>Notes</h4>
                <p>
                  This dashboard uses the `/scores/ranking` endpoints from your
                  Vercel backend.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
