import { Button } from "@heroui/button";
import { Code } from "lucide-react";
import { insertCodeBlock$ } from "@mdxeditor/editor";
import { usePublisher } from "@mdxeditor/editor";

export function CodeBlockButton() {
  const insertCodeBlock = usePublisher(insertCodeBlock$);

  function handleInsertCodeBlock(): void {
    insertCodeBlock({
      code: "// Start typing your code here...",
      language: "javascript",
      meta: "",
    });
  }
  return (
    <Button
      size="sm"
      variant="light"
      startContent={<Code size={16} />}
      onPress={handleInsertCodeBlock}
      aria-label="Insert code block"
      className="cursor-pointer dark:hover:bg-default-300"
      isIconOnly
    />
  );
}
