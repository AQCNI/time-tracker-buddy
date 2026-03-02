import { useTimers } from "@/hooks/useTimers";
import { TimerCard } from "@/components/TimerCard";
import { AddTimerDialog } from "@/components/AddTimerDialog";
import { Button } from "@/components/ui/button";
import { StopCircle, ClipboardCopy, Timer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const Index = () => {
  const {
    timers,
    addTimer,
    removeTimer,
    startTimer,
    stopTimer,
    stopAllTimers,
    resetTimer,
    adjustTimer,
    toggleFixed,
    updateTimer,
    getElapsed,
    exportToClipboard,
  } = useTimers();
  const { toast } = useToast();

  const hasRunning = timers.some((t) => t.isRunning);

  const handleExport = () => {
    const data = exportToClipboard();
    navigator.clipboard.writeText(data).then(() => {
      toast({ title: "Exported!", description: "All timer data copied to clipboard." });
    });
  };

  // Keyboard shortcut: Ctrl+Shift+T to focus window (works for tab restore)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "T") {
        window.focus();
      }
      // Ctrl+Shift+S to stop all
      if (e.ctrlKey && e.shiftKey && e.key === "S") {
        e.preventDefault();
        stopAllTimers();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [stopAllTimers]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container max-w-3xl mx-auto flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Timer className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Time Tracker</h1>
          </div>
          <div className="flex items-center gap-2">
            {hasRunning && (
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={stopAllTimers}
              >
                <StopCircle className="h-4 w-4" />
                Stop All
              </Button>
            )}
            {timers.length > 0 && (
              <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
                <ClipboardCopy className="h-4 w-4" />
                Export
              </Button>
            )}
            <AddTimerDialog onAdd={addTimer} />
          </div>
        </div>
      </header>

      {/* Timer List */}
      <main className="container max-w-3xl mx-auto py-6 px-4">
        {timers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Timer className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-medium text-foreground mb-1">No timers yet</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Create your first timer to start tracking time.
            </p>
            <AddTimerDialog onAdd={addTimer} />
          </div>
        ) : (
          <div className="space-y-3">
            {timers.map((timer) => (
              <TimerCard
                key={timer.id}
                timer={timer}
                elapsed={getElapsed(timer)}
                onStart={() => startTimer(timer.id)}
                onStop={() => stopTimer(timer.id)}
                onRemove={() => removeTimer(timer.id)}
                onToggleFixed={() => toggleFixed(timer.id)}
                onUpdate={(name, desc) => updateTimer(timer.id, name, desc)}
                onReset={() => resetTimer(timer.id)}
                onAdjust={(delta) => adjustTimer(timer.id, delta)}
              />
            ))}
          </div>
        )}

        {/* Keyboard shortcuts hint */}
        {timers.length > 0 && (
          <div className="mt-8 text-center text-xs text-muted-foreground">
            <span className="bg-secondary px-2 py-1 rounded">Ctrl+Shift+S</span> Stop all timers
            {" · "}
            <span className="bg-secondary px-2 py-1 rounded">Ctrl+Shift+T</span> Focus window
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
