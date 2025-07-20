"use client";

import { useProfileContext } from "@/hooks/use-profile-context";
import { Link } from "@heroui/react";
import { getTechnologyById } from "@/lib/technologies";
import { Link2Icon, MapPinIcon } from "lucide-react";
import * as ReactIcons from "@icons-pack/react-simple-icons";

export function UserProfileDescription() {
  const profile = useProfileContext();

  /**
   * Get icon component by name
   */
  function getIconComponent(iconName: string) {
    const IconComponent = (
      ReactIcons as unknown as Record<
        string,
        React.ComponentType<{ size?: number; color?: string; className?: string }>
      >
    )[iconName];
    return IconComponent ? <IconComponent size={16} /> : null;
  }

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
          <h1 className="text-2xl font-bold flex flex-row items-center">
            <span>{profile.display_name}</span>
            {selectedTechnologies.length > 0 && (
              <span className="flex flex-row gap-2 rounded-2xl p-1.5 px-2 w-fit">
                {selectedTechnologies.map((tech) => (
                  <div
                    key={tech.id}
                    style={{ color: tech.color }}
                    className="size-4 dark:text-default-900"
                  >
                    {getIconComponent(tech.icon)}
                  </div>
                ))}
              </span>
            )}
          </h1>
          <p className="text-default-500">@{profile.username}</p>
        </div>
      </div>

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
