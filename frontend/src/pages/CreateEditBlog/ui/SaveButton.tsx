import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../../utils/utils";


interface SaveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

/**
 * Standardized "Save" button with brand gradient and loading state
 */
export const SaveButton = ({ loading, children = "Save", className, ...props }: SaveButtonProps) => (
  <button
    {...props}
    disabled={loading || props.disabled}
    className={cn(
      "h-11 px-10 bg-brand-gradient hover:opacity-90 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60",
      className
    )}
  >
    {loading && <Loader2 className="animate-spin" size={20} />}
    {loading ? "Processing..." : children}
  </button>
);
