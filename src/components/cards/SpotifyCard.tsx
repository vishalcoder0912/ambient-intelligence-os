import { motion } from "framer-motion";
import { Music2, Headphones, BarChart3 } from "lucide-react";

const recentTracks = [
  { title: "Weightless", artist: "Marconi Union", mood: "Focus" },
  { title: "Sunset Lover", artist: "Petit Biscuit", mood: "Chill" },
  { title: "Awake", artist: "Tycho", mood: "Creative" },
];

export function SpotifyCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card-glow p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1DB954]/10">
            <Music2 className="h-5 w-5 text-[#1DB954]" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Spotify</h3>
            <p className="text-xs text-muted-foreground">Listening patterns</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1">
          <Headphones className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">3.2h today</span>
        </div>
      </div>

      {/* Mood Visualization */}
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Mood today:</span>
        <span className="gradient-text font-medium">Focused & Calm</span>
      </div>

      {/* Track List */}
      <div className="space-y-2">
        {recentTracks.map((track, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary/20">
                <Music2 className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{track.title}</p>
                <p className="text-xs text-muted-foreground">{track.artist}</p>
              </div>
            </div>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {track.mood}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
