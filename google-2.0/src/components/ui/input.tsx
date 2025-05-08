// Imports the entire 'react' module to access 'ButtonHTMLAttributes' and 'forwardRef' functions.
import * as React from "react";

// Imports the 'cn' function from '@/src/lib/utils' to merge and conditionally apply class names.
import { cn } from "@/src/lib/utils";

// Creating a customizable Input component with forwardRef for parent access
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
  // Destructuring props to access className, type, and remaining properties
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      // Merging base styles with custom classes using cn utility
      className={cn(
        // Base styling with Tailwind classes for consistent design:
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        // Merging custom classes passed via props
        className
      )}
      ref={ref} // Forwarding ref for direct input access
      {...props} // Spreading remaining input properties
    />
  );
});
// Setting display name for better DevTools identification
Input.displayName = "Input";

// Exporting the component for use in other parts of the application
export { Input };