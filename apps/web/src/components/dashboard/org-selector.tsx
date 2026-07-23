"use client";

import type React from "react";

interface Organization {
  login: string;
  avatarUrl: string;
}

interface OrgSelectorProps {
  organizations: Organization[];
  selectedOrgs: string[];
  onChangeSelectedOrgs: (orgs: string[]) => void;
}

export const OrgSelector: React.FC<OrgSelectorProps> = ({
  organizations,
  selectedOrgs,
  onChangeSelectedOrgs,
}) => {
  if (!organizations || organizations.length === 0) return null;

  const handleCheckboxChange = (orgLogin: string, checked: boolean) => {
    if (checked) {
      onChangeSelectedOrgs([...selectedOrgs, orgLogin]);
    } else {
      onChangeSelectedOrgs(selectedOrgs.filter((o) => o !== orgLogin));
    }
  };

  return (
    <div className="p-6 bg-card border border-border rounded-2xl space-y-4 shadow-sm">
      <h4 className="text-sm font-bold text-foreground">
        Include Organization Repositories
      </h4>
      <p className="text-xs text-muted-foreground">
        Select which organizations' repositories should contribute to score
        calculations.
      </p>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
        {organizations.map((org) => (
          <label
            key={org.login}
            className="flex items-center gap-3 p-2.5 bg-muted/40 border border-border/80 rounded-xl cursor-pointer hover:border-border transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedOrgs.includes(org.login)}
              onChange={(e) =>
                handleCheckboxChange(org.login, e.target.checked)
              }
              className="rounded border-border text-primary focus:ring-primary focus:ring-offset-background bg-muted"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {/* biome-ignore lint/performance/noImgElement: avatar is loaded dynamically from external github domain */}
            <img
              src={org.avatarUrl}
              alt={org.login}
              className="h-6 w-6 rounded-md object-cover border border-border"
            />
            <span className="text-xs font-semibold text-foreground">
              @{org.login}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};
