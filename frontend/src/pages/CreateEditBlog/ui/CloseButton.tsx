import React from "react";
import { cn } from "../../../utils/utils";
interface CloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

/**
 * Standardized "Close" button with neutral gray background
 */
export const CloseButton = ({ className, children = "Close", ...props }: CloseButtonProps) => (
  <button
    type="button"
    {...props}
    className={cn(
      "h-11 px-6 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition-all active:scale-95 shadow-none",
      className
    )}
  >
    {children}
  </button>
);
