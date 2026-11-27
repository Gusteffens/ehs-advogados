"use client";

import { useArticleTracker } from "@/lib/analytics/use-article-tracker";

interface PostViewTrackerProps {
  postId: string;
}

export function PostViewTracker({ postId }: PostViewTrackerProps) {
  useArticleTracker(postId);
  return null;
}
