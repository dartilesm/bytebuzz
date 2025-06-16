import type { Tables } from "database.types";

export interface NestedPost extends Partial<Tables<"posts">> {
  user: Partial<Tables<"users">>;
  replies?: NestedPost[];
  repost?: NestedPost;
  level?: number;
  reaction?: Partial<Tables<"reactions">>;
}
