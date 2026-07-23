import { AlertTriangle, Award } from "lucide-react";
import type React from "react";
import { DashboardPanel } from "@/components/ui/dashboard-panel";

interface Finding {
  id: string;
  type: "highlight" | "warning";
  category: string;
  title: string;
  description: string;
  score?: number;
}

interface FindingsListProps {
  findings: Finding[];
}

export const FindingsList: React.FC<FindingsListProps> = ({ findings }) => {
  return (
    <DashboardPanel
      title="Audit Findings"
      icon={Award}
      badgeCount={findings ? findings.length : undefined}
    >
      {findings && findings.length > 0 ? (
        <div className="space-y-4">
          {findings.map((f) => (
            <div
              key={f.id}
              className="p-4 bg-muted/40 border border-border/80 rounded-2xl flex gap-4 items-start"
            >
              <span
                className={`p-2 rounded-xl border shrink-0 ${
                  f.type === "warning"
                    ? "bg-rose-500/10 border-rose-500/20 text-destructive"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
              </span>
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-bold text-sm text-foreground">
                    {f.title}
                  </h4>
                  <span
                    className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      f.type === "warning"
                        ? "bg-rose-500/10 border-rose-500/20 text-destructive"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                    }`}
                  >
                    {f.type}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  {f.description}
                </p>
                <span className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-wider block">
                  Category: {f.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground/60 italic text-center py-4">
          No significant findings reported.
        </p>
      )}
    </DashboardPanel>
  );
};
