"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";

interface DashboardPanelProps {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const DashboardPanel: React.FC<DashboardPanelProps> = ({
  title,
  icon: Icon,
  badgeCount,
  children,
  defaultOpen = true,
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-2xl shadow-md overflow-hidden transition-all duration-300",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-t-2xl transition-colors hover:bg-muted/40"
      >
        <h3 className="text-base font-bold flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-primary/80" />}
          <span>{title}</span>
          {badgeCount !== undefined && (
            <span className="text-[10px] bg-muted border border-border text-muted-foreground px-2 py-0.5 rounded-full font-bold ml-1">
              {badgeCount}
            </span>
          )}
        </h3>
        <span className="text-muted-foreground/80">
          {isOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </span>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 border-t border-border/60 pt-4 animate-fade-in-up">
          {children}
        </div>
      )}
    </div>
  );
};
