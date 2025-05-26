"use client";

import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { useState, useEffect } from "react";
import type { User } from "../mentions-plugin";
import { createPortal } from "react-dom";

interface MentionPickerProps {
  users: User[];
  onSelect: (user: User) => void;
  onSelectedUserChange: (user: User | null) => void;
  query: string;
  isLoading?: boolean;
  mentionElement: HTMLElement | null;
}

/**
 * MentionPicker component that displays a dropdown list of users for mentions
 */
export function MentionPicker({
  users,
  onSelect,
  onSelectedUserChange,
  query,
  isLoading = false,
  mentionElement,
}: MentionPickerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset selected index when users change
  useEffect(() => {
    setSelectedIndex(0);
  }, [users]);

  // Update selected user when index changes
  useEffect(() => {
    const selectedUser = users[selectedIndex] || null;
    onSelectedUserChange(selectedUser);
  }, [selectedIndex, users, onSelectedUserChange]);

  /**
   * Handle keyboard navigation
   */
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      // Don't handle keyboard events while loading
      if (isLoading) return;

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
  }, [users, selectedIndex, onSelect, isLoading]);

  /**
   * Handle user selection
   */
  function handleUserSelect(user: User): void {
    onSelect(user);
  }

  function getPosition(elementRef: HTMLElement | null) {
    if (!elementRef?.getBoundingClientRect) {
      if (elementRef?.parentElement) return getPosition(elementRef.parentElement);
      return;
    }
    const { top, left, height } = elementRef.getBoundingClientRect();

    const coords = {
      top: top + height + 10,
      left: left,
    };
    return coords;
  }

  return createPortal(
    <Card
      className="absolute z-50 min-w-64 max-w-80 shadow-lg border border-default-200"
      style={getPosition(mentionElement)}
    >
      <CardBody className="p-1">
        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <Spinner size="sm" />
            <span className="ml-2 text-sm text-default-500">Loading users...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-3">
            <div className="text-sm text-default-500 text-center">No users found for "{query}"</div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </CardBody>
    </Card>,
    document.body,
  );
}
