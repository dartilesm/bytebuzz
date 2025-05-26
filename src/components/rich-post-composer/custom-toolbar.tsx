"use client";

import { Button } from "@heroui/button";
import { insertCodeBlock$, usePublisher } from "@mdxeditor/editor";
import { Code } from "lucide-react";

/**
 * Custom toolbar component with Insert Code Block button
 */
export function CustomToolbar() {
  const insertCodeBlock = usePublisher(insertCodeBlock$);

  /**
   * Handle inserting a new code block
   */
  function handleInsertCodeBlock(): void {
    insertCodeBlock({
      code: "// Start typing your code here...",
      language: "javascript",
      meta: "",
    });
  }

  return (
    <div className="flex items-center gap-2 p-2 border dark:border-0 border-default-200 bg-default-50 rounded-b-xl">
      <Button
        size="sm"
        variant="flat"
        startContent={<Code size={16} />}
        onPress={handleInsertCodeBlock}
        aria-label="Insert code block"
        className="cursor-pointer"
      >
        Insert Code Block
      </Button>
    </div>
  );
}
