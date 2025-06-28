import { CodeBlock } from "@/components/ui/code-block";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownViewer({ markdown }: { markdown: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        code: ({ node, ...props }) => {
          const { children, className, ...rest } = props;
          const language = className?.replace("language-", "");
          console.log({ children, language, rest });
          return <CodeBlock code={children as string} language={language} />;
        },
      }}
    >
      {markdown}
    </Markdown>
  );
}
