import type React from "react";

interface LanguageItem {
  name: string;
  bytes: number;
}

interface LanguagesChartProps {
  languages: LanguageItem[];
}

export const LanguagesChart: React.FC<LanguagesChartProps> = ({
  languages,
}) => {
  if (!languages || languages.length === 0) return null;

  const totalBytes = languages.reduce((acc, l) => acc + l.bytes, 0);
  const colors = [
    "bg-indigo-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-emerald-500",
    "bg-amber-500",
  ];
  const bulletColors = [
    "bg-indigo-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-emerald-500",
    "bg-amber-500",
  ];

  return (
    <div className="p-6 bg-card border border-border rounded-2xl flex flex-col gap-4 shadow-sm">
      <h4 className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest">
        Language Breakdown
      </h4>
      <div className="space-y-3">
        <div className="h-3.5 rounded-full overflow-hidden flex bg-muted">
          {languages.slice(0, 5).map((lang, i) => {
            const pct = (lang.bytes / (totalBytes || 1)) * 100;
            return (
              <div
                key={lang.name}
                className={`${colors[i % colors.length]} h-full`}
                style={{ width: `${pct}%` }}
                title={`${lang.name}: ${pct.toFixed(1)}%`}
              />
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          {languages.slice(0, 4).map((lang, i) => {
            const pct = (lang.bytes / (totalBytes || 1)) * 100;
            return (
              <div
                key={lang.name}
                className="flex items-center gap-1.5 text-muted-foreground font-semibold"
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${bulletColors[i % bulletColors.length]}`}
                />
                <span>
                  {lang.name} ({pct.toFixed(1)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
