import { motion } from "framer-motion";
import { Calendar, Clock, Users, Video } from "lucide-react";

const todayEvents = [
  { title: "Team Standup", time: "9:00 AM", type: "meeting", duration: "30m" },
  { title: "Deep Work Block", time: "10:00 AM", type: "focus", duration: "2h" },
  { title: "Product Review", time: "2:00 PM", type: "meeting", duration: "1h" },
  { title: "Code Review", time: "4:00 PM", type: "async", duration: "45m" },
];

export function CalendarCard() {
  const meetingCount = todayEvents.filter((e) => e.type === "meeting").length;
  const focusTime = todayEvents
    .filter((e) => e.type === "focus")
    .reduce((acc, e) => {
      const hours = parseInt(e.duration) || 0;
      return acc + hours;
    }, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card-glow p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-glow-accent/10">
            <Calendar className="h-5 w-5 text-glow-accent" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Calendar</h3>
            <p className="text-xs text-muted-foreground">Today's schedule</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-4 flex gap-4">
        <div className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
          <Users className="h-4 w-4 text-secondary" />
          <span className="text-sm text-foreground">{meetingCount} meetings</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-sm text-foreground">{focusTime}h focus</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        {todayEvents.map((event, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="flex items-center gap-3 rounded-lg bg-muted/30 p-3"
          >
            <div
              className={`h-2 w-2 rounded-full ${
                event.type === "meeting"
                  ? "bg-secondary"
                  : event.type === "focus"
                  ? "bg-primary"
                  : "bg-muted-foreground"
              }`}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{event.title}</p>
                {event.type === "meeting" && (
                  <Video className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {event.time} • {event.duration}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
