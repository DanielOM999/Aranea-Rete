// Imports the entire 'react' module to access HTML attributes and 'forwardRef' function for forwarding refs.
import * as React from "react";

// Imports the 'cn' function from '@/src/lib/utils' to merge and conditionally apply class names.
import { cn } from "@/src/lib/utils";

// Defines the 'Card' component that forwards its ref to the child element.
// Adds all the default props for a 'div' element and supports the 'className' prop with the default 'card' styling.
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
// Sets the display name of the 'Card' component for easier debugging and development in React DevTools.
Card.displayName = "Card";

// Defines the 'CardHeader' component that forwards its ref to the child element.
// Adds all the default props for a 'div' element and supports the 'className' prop with the default 'CardHeader' styling.
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
// Sets the display name of the 'CardHeader' component for easier debugging and development in React DevTools.
CardHeader.displayName = "CardHeader";

// Defines the 'CardTitle' component that forwards its ref to the child element.
// Adds all the default props for a 'div' element and supports the 'className' prop with the default 'CardTitle' styling.
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
// Sets the display name of the 'CardTitle' component for easier debugging and development in React DevTools.
CardTitle.displayName = "CardTitle";

// Defines the 'CardDescription' component that forwards its ref to the child element.
// Adds all the default props for a 'div' element and supports the 'className' prop with the default 'CardDescription' styling.
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
// Sets the display name of the 'CardDescription' component for easier debugging and development in React DevTools.
CardDescription.displayName = "CardDescription";

// Defines the 'CardContent' component that forwards its ref to the child element.
// Adds all the default props for a 'div' element and supports the 'className' prop with the default 'CardContent' styling.
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
// Sets the display name of the 'CardContent' component for easier debugging and development in React DevTools.
CardContent.displayName = "CardContent";

// Defines the 'CardFooter' component that forwards its ref to the child element.
// Adds all the default props for a 'div' element and supports the 'className' prop with the default 'CardFooter' styling.
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
// Sets the display name of the 'CardFooter' component for easier debugging and development in React DevTools.
CardFooter.displayName = "CardFooter";

// Exports all the card-related components for use in other parts of the application.
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};