// Imports the entire 'react' module to access 'ButtonHTMLAttributes' and 'forwardRef' functions.
import * as React from "react";

// Imports the 'Slot' component from '@radix-ui/react-slot' to render either a button or a custom component based on the 'asChild' prop.
import { Slot } from "@radix-ui/react-slot";

// Imports the 'cva' function and 'VariantProps' type from 'class-variance-authority' to define button variants and styles.
import { cva, type VariantProps } from "class-variance-authority";

// Imports the 'cn' function from '@/src/lib/utils' to merge and conditionally apply class names.
import { cn } from "@/src/lib/utils";

// Defines button variants and styles using 'cva'.
const buttonVariants = cva(
  // Default button styles.
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    // Specifies button variants and their corresponding styles.
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      // Specifies button sizes.
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    // Sets default variants for the button.
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Exports 'ButtonProps' interface, extending default button properties and adding 'asChild' prop for custom element rendering.
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

// Defines the 'Button' component that forwards its ref to the child element.
// Renders either a 'button' or a custom component based on the 'asChild' prop.
// Applies styles and class names based on variant, size, and other props.
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

// Sets the display name of the 'Button' component for better debugging and development experience.
Button.displayName = "Button";

// Exports the 'Button' component and its variants for use in other parts of the application.
export { Button, buttonVariants };
