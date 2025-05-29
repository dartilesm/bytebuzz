"use client";

import { MentionPicker } from "@/components/rich-editor/plugins/components/mention-picker";
import {
  type User,
  getDefaultUsers,
  insertMention$,
  mentionElement$,
  mentionMaxSuggestions$,
  mentionPickerPosition$,
  mentionQuery$,
  selectedMentionUser$,
  showMentionPicker$,
} from "@/components/rich-editor/plugins/mentions-plugin";
import { useCellValue, usePublisher } from "@mdxeditor/editor";
import { useEffect, useState } from "react";

export function MentionPickerWrapper() {
  const showPicker = useCellValue(showMentionPicker$);
  const position = useCellValue(mentionPickerPosition$);
  const query = useCellValue(mentionQuery$);
  const maxSuggestions = useCellValue(mentionMaxSuggestions$);
  const mentionElement = useCellValue(mentionElement$);
  const insertMention = usePublisher(insertMention$);
  const setSelectedUser = usePublisher(selectedMentionUser$);

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load users based on query
  useEffect(() => {
    if (!showPicker) {
      setUsers([]);
      return;
    }

    setIsLoading(true);

    const fetchedUsers = getDefaultUsers(query);

    setUsers(fetchedUsers.slice(0, maxSuggestions));
    setIsLoading(false);
  }, [query, showPicker, maxSuggestions]);

  if (!showPicker || !position) {
    return null;
  }

  if (!mentionElement) {
    return null;
  }

  /* return null; */
  return (
    <MentionPicker
      users={users}
      onSelect={insertMention}
      onSelectedUserChange={setSelectedUser}
      query={query}
      isLoading={isLoading}
      mentionElement={mentionElement}
    />
  );
}
