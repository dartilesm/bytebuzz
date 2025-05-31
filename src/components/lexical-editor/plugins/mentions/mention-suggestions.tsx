"use client";

import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { cn } from "@/lib/utils";
import type { User } from "./mention-node";

interface MentionSuggestionsProps {
  /**
   * List of user suggestions to display
   */
  suggestions: User[];
  /**
   * Index of the currently selected suggestion
   */
  selectedIndex: number;
  /**
   * Position to display the dropdown
   */
  position: { top: number; left: number };
  /**
   * Callback when a user is selected
   */
  onSelect: (user: User) => void;
  /**
   * Callback when the dropdown should be closed
   */
  onClose: () => void;
}

/**
 * Dropdown component showing user mention suggestions
 *
 * Features:
 * - Displays user list with avatars and display names
 * - Keyboard navigation support
 * - Click to select functionality
 * - Positioned absolutely based on caret position
 */
export function MentionSuggestions({
  suggestions,
  selectedIndex,
  position,
  onSelect,
}: MentionSuggestionsProps) {
  /**
   * Handles user selection via click
   */
  function handleUserClick(user: User) {
    onSelect(user);
  }

  /**
   * Handles keyboard selection for accessibility
   */
  function handleUserKeyDown(event: React.KeyboardEvent, user: User) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(user);
    }
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed z-50"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <Card className="w-64 max-h-64 overflow-auto shadow-lg">
        <CardBody className="p-2">
          <div className="space-y-1">
            {suggestions.map((user, index) => (
              <Button
                key={user.id}
                variant={index === selectedIndex ? "flat" : "light"}
                className={cn(
                  "w-full justify-start p-2 h-auto",
                  "hover:bg-default-100 focus:bg-default-100",
                  {
                    "bg-primary-100": index === selectedIndex,
                  },
                )}
                onClick={() => handleUserClick(user)}
                onKeyDown={(event) => handleUserKeyDown(event, user)}
                tabIndex={index === selectedIndex ? 0 : -1}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <div className="flex items-center gap-3 w-full">
                  <Avatar
                    src={user.avatarUrl}
                    alt={user.displayName}
                    size="sm"
                    className="flex-shrink-0"
                    showFallback
                    name={user.displayName}
                  />
                  <div className="flex flex-col items-start text-left min-w-0 flex-1">
                    <span className="font-medium text-sm truncate w-full">{user.displayName}</span>
                    <span className="text-xs text-default-500 truncate w-full">
                      @{user.username}
                    </span>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
