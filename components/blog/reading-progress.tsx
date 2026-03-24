"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
 const [progress, setProgress] = useState(0);

 useEffect(() => {
 const update = () => {
 const el = document.documentElement;
 const scrollTop = el.scrollTop || document.body.scrollTop;
 const scrollHeight = el.scrollHeight - el.clientHeight;
 setProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
 };
 window.addEventListener("scroll", update, { passive: true });
 return () => window.removeEventListener("scroll", update);
 }, []);

 return <div className="reading-progress" style={{ width: `${progress}%` }} />;
}
