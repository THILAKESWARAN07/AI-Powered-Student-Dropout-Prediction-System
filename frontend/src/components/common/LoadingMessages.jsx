import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGES = [
  "🧠 Initializing DropGuard AI",
  "🏫 Preparing your school workspace",
  "📊 Analyzing student insights",
  "📈 Building your dashboard",
  "🔒 Verifying secure access",
  "✨ Almost Ready"
];

const INSIGHTS = [
  "💡 Early identification enables timely intervention for students at risk of dropping out.",
  "📊 DropGuard analyzes attendance, academics, behaviour, health, family, and technology factors.",
  "🎯 AI predictions support educators in making informed decisions—they complement professional judgment.",
  "📚 Every prediction helps schools identify students who may benefit from additional support."
];

export default function LoadingMessages() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [showInsights, setShowInsights] = useState(false);
  const [insightIndex, setInsightIndex] = useState(0);

  // Message sequence timer
  useEffect(() => {
    if (showInsights) return;

    const interval = setInterval(() => {
      setMsgIndex((prev) => {
        if (prev === MESSAGES.length - 1) {
          // If we reached the end, stay on "Almost Ready"
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1400); // 1.4s per message, total of 7 seconds to reach the last one

    return () => clearInterval(interval);
  }, [showInsights]);

  // Insight transition timer (at 8.4 seconds)
  useEffect(() => {
    const insightsTimer = setTimeout(() => {
      setShowInsights(true);
    }, 8400);

    return () => clearTimeout(insightsTimer);
  }, []);

  // Insight rotation timer
  useEffect(() => {
    if (!showInsights) return;

    const interval = setInterval(() => {
      setInsightIndex((prev) => (prev + 1) % INSIGHTS.length);
    }, 3800); // Rotate insights every 3.8s

    return () => clearInterval(interval);
  }, [showInsights]);

  return (
    <div className="min-h-[52px] flex items-center justify-center my-4 px-4 overflow-hidden relative w-full select-none">
      <AnimatePresence mode="wait">
        {!showInsights ? (
          <motion.p
            key={`msg-${msgIndex}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-slate-750 dark:text-slate-200 text-sm font-bold tracking-wide text-center flex items-center justify-center leading-relaxed"
          >
            {MESSAGES[msgIndex]}
            <span className="inline-flex w-5 text-left ml-0.5">
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.5, 1] }}
              >.</motion.span>
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: 0.3, times: [0, 0.5, 1] }}
              >.</motion.span>
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: 0.6, times: [0, 0.5, 1] }}
              >.</motion.span>
            </span>
          </motion.p>
        ) : (
          <motion.div
            key={`insight-${insightIndex}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-slate-650 dark:text-slate-350 text-xs font-semibold text-center leading-relaxed max-w-sm flex flex-col items-center gap-1.5"
          >
            <span className="text-[10px] uppercase font-bold tracking-widest text-primary/80 dark:text-indigo-400/80 mb-0.5">
              💡 AI Insights
            </span>
            <p>{INSIGHTS[insightIndex]}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
