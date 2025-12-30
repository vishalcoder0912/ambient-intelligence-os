import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Search as SearchIcon, FileText, Github, Music2, Calendar, Sparkles } from "lucide-react";

const mockResults = [
  {
    type: "note",
    title: "Vector Embeddings Research",
    snippet: "Local embedding generation using transformers.js for semantic search...",
    date: "2 days ago",
    icon: FileText,
  },
  {
    type: "github",
    title: "Implement semantic search pipeline",
    snippet: "Added chunking and embedding generation for local notes",
    date: "3 days ago",
    icon: Github,
  },
  {
    type: "spotify",
    title: "Focus Playlist Analysis",
    snippet: "Your most productive sessions correlate with ambient electronic music",
    date: "1 week ago",
    icon: Music2,
  },
];

const Search = () => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsSearching(true);
      setTimeout(() => setIsSearching(false), 1000);
    }
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
          >
            <SearchIcon className="h-8 w-8 text-primary" />
          </motion.div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Semantic Search
          </h1>
          <p className="text-muted-foreground">
            Search across your notes, commits, and activity by meaning
          </p>
        </div>

        {/* Search Input */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSearch}
          className="mb-8"
        >
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What are you looking for?"
              className="w-full rounded-xl border border-border bg-card/50 py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 backdrop-blur-sm"
            />
            {isSearching && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <Sparkles className="h-5 w-5 animate-pulse text-primary" />
              </motion.div>
            )}
          </div>
        </motion.form>

        {/* Quick Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex flex-wrap gap-2"
        >
          {[
            { label: "All", icon: Sparkles },
            { label: "Notes", icon: FileText },
            { label: "GitHub", icon: Github },
            { label: "Spotify", icon: Music2 },
            { label: "Calendar", icon: Calendar },
          ].map((filter, index) => (
            <button
              key={filter.label}
              className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <filter.icon className="h-4 w-4" />
              {filter.label}
            </button>
          ))}
        </motion.div>

        {/* Results */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Recent searches & suggestions</p>
          {mockResults.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="glass-card-glow cursor-pointer p-4 transition-all hover:scale-[1.01]"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50">
                  <result.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{result.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {result.snippet}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{result.date}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default Search;
