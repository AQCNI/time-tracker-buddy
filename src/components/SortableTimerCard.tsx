import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TimerCard } from "@/components/TimerCard";
import { TimerEntry } from "@/types/timer";
import { GripVertical } from "lucide-react";

interface SortableTimerCardProps {
  timer: TimerEntry;
  elapsed: number;
  onStart: () => void;
  onStop: () => void;
  onRemove: () => void;
  onToggleFixed: () => void;
  onUpdate: (name: string, description: string) => void;
  onReset: () => void;
  onAdjust: (deltaMs: number) => void;
}

export function SortableTimerCard(props: SortableTimerCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.timer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground z-10"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="pl-8">
        <TimerCard {...props} />
      </div>
    </div>
  );
}
