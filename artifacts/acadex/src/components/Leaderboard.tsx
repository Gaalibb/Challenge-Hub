import React, { useEffect, useState } from "react";

interface User {
  name: string;
  score: number;
}

export default function Leaderboard() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "1rem", background: "#f8f8f8", borderRadius: "8px" }}>
      <h3>🏆 Top Helpers</h3>
      {users.length === 0 && <p>No helpers yet.</p>}
      <ul>
        {users.map((u, i) => (
          <li key={i}>
            <strong>{u.name}</strong> — {u.score} points
          </li>
        ))}
      </ul>
    </div>
  );
}
