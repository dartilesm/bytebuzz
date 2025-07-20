"use client";

import { useProfileContext } from "@/hooks/use-profile-context";
import { Link, Chip } from "@heroui/react";
import { getTechnologyById } from "@/lib/technologies";
import { Link2Icon, MapPinIcon } from "lucide-react";

export function UserProfileDescription() {
  const profile = useProfileContext();

  /**
   * Get selected technologies
   */
  function getSelectedTechnologies() {
    if (!profile.top_technologies || profile.top_technologies.length === 0) {
      return [];
    }
    return profile.top_technologies
      .map((id) => getTechnologyById(id))
      .filter((tech): tech is NonNullable<typeof tech> => tech !== undefined);
  }

  const selectedTechnologies = getSelectedTechnologies();

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
              <Chip key={tech.id} variant="flat" size="sm" className="text-xs font-medium">
                {tech.name}
              </Chip>
            ))}
          </div>
        </div>
      )}

      <p className="text-default-700">{profile.bio}</p>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap text-sm text-default-500">
          {profile.location && (
            <div className="flex items-center gap-1.5 min-w-fit">
              <MapPinIcon size={14} className="text-default-400 flex-shrink-0" />
              <span className="truncate">{profile.location}</span>
            </div>
          )}
          {profile.website && (
            <Link
              href={
                profile.website.startsWith("http") ? profile.website : `https://${profile.website}`
              }
              isExternal
              showAnchorIcon
              className="text-sm"
              size="sm"
            >
              <span className="flex items-center gap-1.5">
                <Link2Icon size={14} className="text-default-400 flex-shrink-0" />
                <span className="truncate max-w-[200px]">
                  {profile.website.replace(/^https?:\/\//, "")}
                </span>
              </span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Link
            as="button"
            color="foreground"
            className="group flex items-center gap-1.5 hover:opacity-80 text-sm"
          >
            <span className="font-medium">{profile.follower_count}</span>
            <span className="text-default-400">followers</span>
          </Link>
          <div className="h-3 w-[1px] bg-default-200" />
          <Link
            as="button"
            color="foreground"
            className="group flex items-center gap-1.5 hover:opacity-80 text-sm"
          >
            <span className="font-medium">{profile.following_count}</span>
            <span className="text-default-400">following</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
