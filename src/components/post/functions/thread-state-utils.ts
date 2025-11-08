import type { NestedPost } from "@/types/nested-posts";

export interface ThreadState {
  renderAsThread: boolean;
  isFirstInThread: boolean;
  isLastInThread: boolean;
}

export interface ThreadStateOptions {
  post?: NestedPost;
  isThread?: boolean;
  isFirstInThread?: boolean;
  isLastInThread?: boolean;
}

/**
 * Calculates whether a post should render as part of a thread
 * @param post - The post to evaluate
 * @param isThread - Optional explicit thread flag
 * @returns true if the post should render as part of a thread
 */
export function shouldRenderAsThread(post: NestedPost | undefined, isThread?: boolean): boolean {
  if (isThread !== undefined) {
    return isThread;
  }

  if (!post?.level) {
    return false;
  }

  const isFirstLevel = post.level === 1;
  const hasReplies = !!post.replies?.length;

  return !isFirstLevel || hasReplies;
}

/**
 * Determines if a post is the first in a thread
 * @param post - The post to evaluate
 * @param isFirstInThread - Optional explicit first flag
 * @returns true if the post is the first in the thread
 */
export function isFirstPostInThread(
  post: NestedPost | undefined,
  isFirstInThread?: boolean
): boolean {
  if (isFirstInThread !== undefined) {
    return isFirstInThread;
  }

  if (!post?.level) {
    return false;
  }

  return post.level === 1;
}

/**
 * Determines if a post is the last in a thread
 * @param post - The post to evaluate
 * @param isLastInThread - Optional explicit last flag
 * @returns true if the post is the last in the thread
 */
export function isLastPostInThread(
  post: NestedPost | undefined,
  isLastInThread?: boolean
): boolean {
  if (isLastInThread !== undefined) {
    return isLastInThread;
  }

  if (!post?.replies?.length) {
    return true;
  }

  return false;
}

/**
 * Calculates the complete thread state for a post
 * @param options - Thread state calculation options
 * @returns Thread state object with renderAsThread, isFirstInThread, and isLastInThread flags
 */
export function calculateThreadState(options: ThreadStateOptions): ThreadState {
  const { post, isThread, isFirstInThread, isLastInThread } = options;

  return {
    renderAsThread: shouldRenderAsThread(post, isThread),
    isFirstInThread: isFirstPostInThread(post, isFirstInThread),
    isLastInThread: isLastPostInThread(post, isLastInThread),
  };
}
