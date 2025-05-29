import { Button } from "@heroui/button";
import { ImageIcon } from "lucide-react";
import { insertImage$ } from "@mdxeditor/editor";
import { usePublisher } from "@mdxeditor/editor";

export function ImageButton() {
  const insertImage = usePublisher(insertImage$);

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

        insertImage({
          src: base64String,
          altText: file.name,
          title: file.name,
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
    <Button
      size="sm"
      variant="light"
      startContent={<ImageIcon size={16} />}
      onPress={handleInsertImage}
      aria-label="Insert image"
      className="cursor-pointer dark:hover:bg-default-300"
      isIconOnly
    />
  );
}
