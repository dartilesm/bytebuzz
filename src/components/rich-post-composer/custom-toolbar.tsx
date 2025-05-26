"use client";

import { MentionPickerWrapper } from "@/components/rich-post-composer/plugins/components/mention-picker-wrapper";
import { Button } from "@heroui/button";
import { insertCodeBlock$, insertImage$, usePublisher } from "@mdxeditor/editor";
import { Code, Image } from "lucide-react";

/**
 * Custom toolbar component with Insert Code Block button
 */
export function CustomToolbar() {
  const insertCodeBlock = usePublisher(insertCodeBlock$);
  const insertImage = usePublisher(insertImage$);

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

  /**
   * Convert file to base64 string
   */
  function convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Handle inserting a new image from user's device
   */
  function handleInsertImage(): void {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";

    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        // Convert image to base64
        const base64String = await convertFileToBase64(file);

        // Use filename as alt text, or prompt for custom alt text
        const altText = prompt("Enter alt text (optional):", file.name.split(".")[0]) || file.name;

        insertImage({
          src: base64String,
          altText: altText,
          title: altText,
        });
      } catch (error) {
        console.error("Error converting image to base64:", error);
        alert("Failed to process the image. Please try again.");
      }
    };

    // Trigger file selection
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  return (
    <div className="flex items-center gap-2 p-2 border dark:border-0 border-default-200 bg-default-50 rounded-b-xl relative">
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

      <Button
        size="sm"
        variant="flat"
        startContent={<Image size={16} />}
        onPress={handleInsertImage}
        aria-label="Insert image"
        className="cursor-pointer"
      >
        Insert Image
      </Button>

      <MentionPickerWrapper />
    </div>
  );
}
