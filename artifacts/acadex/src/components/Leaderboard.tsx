import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";

interface User {
  name: string;
  score: number;
}

export default function Leaderboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Top Helpers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No responses posted yet.
          </p>
        ) : (
          <ol className="space-y-2">
            {users.map((u, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-sm py-1.5 border-b last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground w-4 text-right">
                    {i + 1}.
                  </span>
                  <span className="font-medium text-foreground truncate max-w-[140px]">
                    {u.name}
                  </span>
                </div>
                <span className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs text-secondary-foreground">
                  {u.score} {u.score === 1 ? "response" : "responses"}
                </span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
