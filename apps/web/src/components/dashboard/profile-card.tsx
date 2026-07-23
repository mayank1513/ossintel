"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import type React from "react";
import { useState } from "react";
import {
  FaBuilding,
  FaEnvelope,
  FaGithub,
  FaGlobe,
  FaLinkedin,
  FaMapMarkerAlt,
  FaNpm,
  FaStackOverflow,
  FaTwitter,
} from "react-icons/fa";
import { Readme } from "./readme";

interface ProfileCardProps {
  avatarUrl: string;
  name?: string | null;
  login: string;
  bio?: string | null;
  company?: string | null;
  location?: string | null;
  email?: string | null;
  htmlUrl: string;
  twitterUsername?: string | null;
  blog?: string | null;
  readme?: string | null;
  npmUrl?: string | null;
  stackoverflowUrl?: string | null;
  linkedinUrl?: string | null;
  type?: "user" | "org";
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  avatarUrl,
  name,
  login,
  bio,
  company,
  location,
  email,
  htmlUrl,
  twitterUsername,
  blog,
  readme,
  npmUrl,
  stackoverflowUrl,
  linkedinUrl,
  type = "user",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-6 bg-card border border-border rounded-2xl flex flex-col gap-4 shadow-sm">
      <h3 className="text-base font-bold flex items-center gap-2 text-primary">
        <FaGithub className="h-5 w-5" />{" "}
        {type === "org" ? "GitHub Organization" : "GitHub Profile"}
      </h3>
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {/* biome-ignore lint/performance/noImgElement: avatar is loaded dynamically from external github domain */}
        <img
          src={avatarUrl || "https://avatar.url"}
          alt={name || login}
          className="h-14 w-14 rounded-2xl border border-border object-cover shadow-inner"
        />
        <div>
          <h3 className="font-extrabold text-base text-foreground leading-tight">
            {name || login}
          </h3>
          <p className="text-xs text-muted-foreground/80 font-bold">@{login}</p>
        </div>
      </div>

      {bio && (
        <p className="text-xs text-muted-foreground font-semibold leading-relaxed border-t border-border/80 pt-3">
          {bio}
        </p>
      )}

      {(company || location || email) && (
        <div className="flex flex-col gap-2 border-t border-border/80 pt-3 text-muted-foreground font-medium">
          {company && (
            <span className="text-xs flex items-center gap-2">
              <FaBuilding className="text-primary h-3.5 w-3.5" /> {company}
            </span>
          )}
          {location && (
            <span className="text-xs flex items-center gap-2">
              <FaMapMarkerAlt className="text-primary h-3.5 w-3.5" /> {location}
            </span>
          )}
          {email && (
            <span className="text-xs flex items-center gap-2">
              <FaEnvelope className="text-primary h-3.5 w-3.5" /> {email}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-t border-border/80 pt-3">
        <a
          href={htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-muted/40 border border-border hover:border-primary/45 text-muted-foreground hover:text-primary rounded-xl transition-all"
          title="GitHub Profile"
        >
          <FaGithub className="h-4 w-4" />
        </a>
        {twitterUsername && (
          <a
            href={`https://twitter.com/${twitterUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-muted/40 border border-border hover:border-primary/45 text-muted-foreground hover:text-primary rounded-xl transition-all"
            title="Twitter Account"
          >
            <FaTwitter className="h-4 w-4" />
          </a>
        )}
        {blog && (
          <a
            href={blog.startsWith("http") ? blog : `https://${blog}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-muted/40 border border-border hover:border-primary/45 text-muted-foreground hover:text-primary rounded-xl transition-all"
            title="Website/Blog"
          >
            <FaGlobe className="h-4 w-4" />
          </a>
        )}
        {linkedinUrl && (
          <a
            href={
              linkedinUrl.startsWith("http")
                ? linkedinUrl
                : `https://${linkedinUrl}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-muted/40 border border-border hover:border-primary/45 text-muted-foreground hover:text-primary rounded-xl transition-all"
            title="LinkedIn Profile"
          >
            <FaLinkedin className="h-4 w-4" />
          </a>
        )}
        {stackoverflowUrl && (
          <a
            href={stackoverflowUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-muted/40 border border-border hover:border-primary/45 text-muted-foreground hover:text-primary rounded-xl transition-all"
            title="Stack Overflow Profile"
          >
            <FaStackOverflow className="h-4 w-4" />
          </a>
        )}
        {npmUrl && (
          <a
            href={npmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-muted/40 border border-border hover:border-primary/45 text-muted-foreground hover:text-primary rounded-xl transition-all"
            title="npm Profile"
          >
            <FaNpm className="h-4 w-4" />
          </a>
        )}
      </div>
      {readme && (
        <div className="border-t border-border/80 pt-4 mt-1">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between py-2 px-3 bg-muted/40 border border-border/80 hover:border-primary/20 rounded-xl text-xs font-bold text-muted-foreground hover:text-primary transition-all cursor-pointer shadow-inner"
          >
            <span className="flex items-center gap-2">
              <FaGithub className="h-3.5 w-3.5" />
              {isOpen ? "Hide Profile README" : "Show Profile README"}
            </span>
            <span>
              {isOpen ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </span>
          </button>
          {isOpen && (
            <div className="mt-4 max-h-80 overflow-y-auto pr-2 bg-muted/40 p-5 rounded-xl border border-border/80 animate-fade-in-up">
              <Readme readme={readme} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
