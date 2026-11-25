"use client";

import { useEffect } from "react";
import { incrementViews } from "@/app/actions/blog";

interface PostViewTrackerProps {
  postId: string;
}

export function PostViewTracker({ postId }: PostViewTrackerProps) {
  useEffect(() => {
    const storageKey = `ehs-post-viewed:${postId}`;

    try {
      if (window.sessionStorage.getItem(storageKey)) {
        return;
      }
    } catch {
      // Ignore storage access failures and still attempt the view update.
    }

    let cancelled = false;

    void incrementViews(postId)
      .then(() => {
        if (cancelled) return;
        try {
          window.sessionStorage.setItem(storageKey, "1");
        } catch {
          // Ignore storage write failures.
        }
      })
      .catch(() => {
        // Leave sessionStorage unset so a future navigation can retry.
      });

    return () => {
      cancelled = true;
    };
  }, [postId]);

  return null;
}
