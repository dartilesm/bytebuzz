"use client";

import type { Tables } from "database.types";
import { CalendarIcon, Link2Icon, MapPinIcon } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTechnologyById } from "@/lib/technologies";

export interface UserProfileDescriptionProps {
  profilePromise: Promise<Tables<"users">>;
}

export function UserProfileDescription({ profilePromise }: UserProfileDescriptionProps) {
  const profile = use(profilePromise);

  function getSelectedTechnologies() {
    if (!profile.top_technologies || profile.top_technologies.length === 0) {
      return [];
    }
    return profile.top_technologies
      .map((id) => getTechnologyById(id))
      .filter((tech): tech is NonNullable<typeof tech> => tech !== undefined);
  }

  function formatJoinDate(date: string | null): string | null {
    if (!date) return null;
    const dateObj = new Date(date);
    if (Number.isNaN(dateObj.getTime())) return null;
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(dateObj);
  }

  const selectedTechnologies = getSelectedTechnologies();
  const formattedJoinDate = formatJoinDate(profile.join_date);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-start w-full">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{profile.display_name}</h1>
          <p className="text-default-500">@{profile.username}</p>
        </div>
      </div>

      {/* Top Technologies Section */}
      {selectedTechnologies.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {selectedTechnologies.map((tech) => (
              <Badge key={tech.id} variant="flat" className="text-xs font-medium">
                {tech.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <p className="text-default-700">{profile.bio}</p>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap text-sm text-default-500">
          {profile.location && (
            <div className="flex items-center gap-1.5 min-w-fit">
              <MapPinIcon size={14} className="text-default-400 shrink-0" />
              <span className="truncate">{profile.location}</span>
            </div>
          )}
          {profile.website && (
            <Button asChild variant="link" className="text-sm h-auto p-0 text-primary">
              <Link
                href={
                  (profile.website.startsWith("http")
                    ? profile.website
                    : `https://${profile.website}`) as any
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="flex items-center gap-1.5">
                  <Link2Icon size={14} className="text-muted-foreground shrink-0" />
                  <span className="truncate max-w-[200px]">
                    {profile.website.replace(/^https?:\/\//, "")}
                  </span>
                </span>
              </Link>
            </Button>
          )}
          {formattedJoinDate && (
            <div className="flex items-center gap-1.5 min-w-fit">
              <CalendarIcon size={14} className="text-default-400 shrink-0" />
              <span className="truncate">Joined {formattedJoinDate}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Button
            variant="ghost"
            className="group flex items-center gap-1.5 hover:opacity-80 text-sm h-auto p-0 hover:bg-transparent"
          >
            <span className="font-medium">{profile.follower_count}</span>
            <span className="text-muted-foreground">followers</span>
          </Button>
          <div className="h-3 w-px bg-border" />
          <Button
            variant="ghost"
            className="group flex items-center gap-1.5 hover:opacity-80 text-sm h-auto p-0 hover:bg-transparent"
          >
            <span className="font-medium">{profile.following_count}</span>
            <span className="text-muted-foreground">following</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
