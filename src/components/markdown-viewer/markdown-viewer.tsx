import { CodeBlock } from "@/components/ui/code-block";
import { Image } from "@heroui/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownViewer({ markdown, postId }: { markdown: string; postId: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        code: ({ node, ...props }) => {
          const { children, className } = props;
          const language = className?.replace("language-", "");
          return <CodeBlock code={children as string} language={language} />;
        },
        img: ({ node, ...props }) => {
          const { src, alt } = props;

          // Append postId as a query parameter
          const imageUrl = `${src}?postId=${postId}`;

          return <Image src={imageUrl} alt={alt} />;
        },
      }}
    >
      {markdown}
    </Markdown>
  );
}
