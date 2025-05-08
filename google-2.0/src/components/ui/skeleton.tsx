// Imports type definitions from 'react' to type the component props.
import type React from "react";

// Imports the 'cn' function from '@/src/lib/utils' to merge and conditionally apply class names.
import { cn } from "@/src/lib/utils";

// Defines the 'Skeleton' component that accepts HTML div element attributes.
// Applies default skeleton styles including a pulse animation, rounded corners, and a muted background.
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// Exports the 'Skeleton' component for use in other parts of the application.
export { Skeleton };