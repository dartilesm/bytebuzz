"use client";

import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { useState, useEffect } from "react";
import type { User } from "./mentions-plugin";

interface MentionPickerProps {
  users: User[];
  position: { x: number; y: number };
  onSelect: (user: User) => void;
  query: string;
}

/**
 * MentionPicker component that displays a dropdown list of users for mentions
 */
export function MentionPicker({ users, position, onSelect, query }: MentionPickerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset selected index when users change
  useEffect(() => {
    setSelectedIndex(0);
  }, [users]);

  /**
   * Handle keyboard navigation
   */
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % users.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + users.length) % users.length);
      } else if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        if (users[selectedIndex]) {
          onSelect(users[selectedIndex]);
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [users, selectedIndex, onSelect]);

  /**
   * Handle user selection
   */
  function handleUserSelect(user: User): void {
    onSelect(user);
  }

  if (users.length === 0) {
    return (
      <Card
        className="absolute z-50 min-w-64 max-w-80 shadow-lg border border-default-200"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <CardBody className="p-3">
          <div className="text-sm text-default-500 text-center">No users found for "{query}"</div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card
      className="absolute z-50 min-w-64 max-w-80 shadow-lg border border-default-200"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <CardBody className="p-1">
        <div className="max-h-60 overflow-y-auto">
          {users.map((user, index) => (
            <Button
              key={user.id}
              variant={index === selectedIndex ? "flat" : "light"}
              color={index === selectedIndex ? "primary" : "default"}
              className="w-full justify-start p-3 h-auto"
              onPress={() => handleUserSelect(user)}
            >
              <div className="flex items-center gap-3 w-full">
                <Avatar
                  src={user.avatar}
                  name={user.displayName}
                  size="sm"
                  className="flex-shrink-0"
                />
                <div className="flex flex-col items-start text-left">
                  <div className="font-medium text-sm">{user.displayName}</div>
                  {user.username && (
                    <div className="text-xs text-default-500">@{user.username}</div>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </div>
        <div className="px-3 py-2 border-t border-default-200 mt-1">
          <div className="text-xs text-default-500">
            Use ↑↓ to navigate, Enter to select, Esc to cancel
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
