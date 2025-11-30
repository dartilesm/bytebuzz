import { useContext } from "react";
import { PostContext } from "@/context/post-provider";

export function usePostContext() {
  const postContext = useContext(PostContext);

  if (!postContext) {
    throw new Error("usePost must be used within a PostProvider");
  }

  return postContext;
}
