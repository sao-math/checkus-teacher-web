import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface TimelineSegment {
  start: number; // 0-100 percentage of the timeline
  end: number;   // 0-100 percentage of the timeline
  status: "connected" | "not-connected";
  source?: string; // 실제 공부시간의 source
}

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  segments?: TimelineSegment[];
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, segments, ...props }, ref) => {
  if (segments) {
    // Timeline mode with segments
    return (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
          className
        )}
        {...props}
      >
        <div className="relative h-full w-full">
          {segments.map((segment, index) => (
            <div 
              key={index}
              className={cn(
                "absolute h-full",
                segment.status === "connected" ? "bg-emerald-500" : "bg-gray-200"
              )}
              style={{
                left: `${segment.start}%`,
                width: `${segment.end - segment.start}%`
              }}
            />
          ))}
        </div>
      </ProgressPrimitive.Root>
    )
  }
  
  // Default progress bar for backward compatibility
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress, type TimelineSegment }
