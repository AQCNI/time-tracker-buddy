import { TimerEntry } from "@/types/timer";
import { Play, Square, Pin, PinOff, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TimerCardProps {
  timer: TimerEntry;
  elapsed: number;
  onStart: () => void;
  onStop: () => void;
  onRemove: () => void;
  onToggleFixed: () => void;
  onUpdate: (name: string, description: string) => void;
}

function formatTime(ms: number) {
  const hours = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  const centis = Math.floor((ms % 1000) / 10);
  return {
    display: `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`,
    centis: String(centis).padStart(2, "0"),
  };
}

export function TimerCard({
  timer,
  elapsed,
  onStart,
  onStop,
  onRemove,
  onToggleFixed,
  onUpdate,
}: TimerCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(timer.name);
  const [editDesc, setEditDesc] = useState(timer.description);
  const time = formatTime(elapsed);

  const handleSave = () => {
    onUpdate(editName, editDesc);
    setEditing(false);
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-all duration-300",
        timer.isRunning
          ? "border-success/50 bg-success/5 shadow-[0_0_20px_-5px_hsl(var(--success)/0.2)]"
          : "border-border bg-card",
        timer.isFixed && "ring-1 ring-fixed/40"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Play/Stop */}
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "h-10 w-10 shrink-0 rounded-full",
            timer.isRunning
              ? "bg-success/20 text-success hover:bg-success/30"
              : "bg-secondary text-secondary-foreground hover:bg-muted"
          )}
          onClick={timer.isRunning ? onStop : onStart}
        >
          {timer.isRunning ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </Button>

        {/* Name & Time */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              className="bg-secondary rounded px-2 py-1 text-sm text-foreground w-full outline-none focus:ring-1 focus:ring-primary"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
          ) : (
            <h3
              className="text-sm font-medium truncate cursor-pointer hover:text-primary transition-colors"
              onClick={() => {
                setEditName(timer.name);
                setEditDesc(timer.description);
                setEditing(true);
              }}
            >
              {timer.name}
            </h3>
          )}
          {timer.isRunning && (
            <span className="text-xs text-success animate-pulse-glow">● Running</span>
          )}
          {timer.isFixed && !timer.isRunning && (
            <span className="text-xs text-fixed">📌 Fixed</span>
          )}
        </div>

        {/* Timer Display */}
        <div className="font-mono text-xl font-semibold tabular-nums tracking-wider text-foreground">
          {time.display}
          <span className="text-xs text-muted-foreground">.{time.centis}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-8 w-8",
              timer.isFixed ? "text-fixed" : "text-muted-foreground"
            )}
            onClick={onToggleFixed}
            title={timer.isFixed ? "Unpin timer" : "Pin timer (keeps running)"}
          >
            {timer.isFixed ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Expanded description */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-border">
          {editing ? (
            <div className="space-y-2">
              <textarea
                className="bg-secondary rounded px-3 py-2 text-sm text-foreground w-full outline-none focus:ring-1 focus:ring-primary min-h-[100px] resize-y"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Description (up to 1024+ characters)..."
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p
              className="text-sm text-muted-foreground whitespace-pre-wrap cursor-pointer hover:text-foreground transition-colors"
              onClick={() => {
                setEditName(timer.name);
                setEditDesc(timer.description);
                setEditing(true);
              }}
            >
              {timer.description || "Click to add a description..."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
