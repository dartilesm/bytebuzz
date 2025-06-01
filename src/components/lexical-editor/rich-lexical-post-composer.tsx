"use client";

import { editorStateToMarkdown } from "@/components/lexical-editor/functions/markdown-utils";
import { useMarkdownContext } from "@/components/lexical-editor/markdown-provider";
import { Button } from "@heroui/button";
import { Send } from "lucide-react";

/**
 * Custom submit button component that uses the markdown context
 */
function SubmitButton() {
  const { editorRef } = useMarkdownContext();
  function handleSubmit() {
    let markdown = "";
    editorRef?.current?.getEditorState().read(() => {
      const editor = editorRef.current;
      if (editor) {
        markdown = editorStateToMarkdown(editor.getEditorState());
      }
    });
    console.log("Submitting markdown:", markdown);

    // Here you would typically send the markdown to your API
    // For demo purposes, we'll just log it
    if (markdown.trim()) {
      alert(`Post content:\n\n${markdown}`);
    } else {
      alert("Please write something before posting!");
    }
  }

  return (
    <Button
      color="primary"
      size="sm"
      onPress={handleSubmit}
      className="ml-auto"
      startContent={<Send size={16} />}
      type="submit"
    >
      Post
    </Button>
  );
}
