"use client";

import { startTransition, useEffect } from "react";
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

            window.sessionStorage.setItem(storageKey, "1");
        } catch {
            // Ignore storage access failures and still attempt the view update.
        }

        startTransition(() => {
            void incrementViews(postId);
        });
    }, [postId]);

    return null;
}
