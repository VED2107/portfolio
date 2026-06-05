"use client";

import { useEffect, useState, useCallback } from "react";
import { BOOT_SEQUENCE } from "@/lib/data";

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [showStart, setShowStart] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    const totalSteps = BOOT_SEQUENCE.length;

    BOOT_SEQUENCE.forEach(({ text, delay }, index) => {
      timeouts.push(
        setTimeout(() => {
          if (text === "") {
            setShowStart(true);
            setProgress(100);
          } else {
            setLines((prev) => [...prev, text]);
            setProgress(Math.round(((index + 1) / totalSteps) * 100));
          }
        }, delay)
      );
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  const handleStart = useCallback(() => {
    setExiting(true);
    setTimeout(onComplete, 800);
  }, [onComplete]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showStart && !exiting) {
        if (e.key === "Enter" || e.key === " ") {
          handleStart();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showStart, exiting, handleStart]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#050816] transition-all duration-700 ${
        exiting ? "opacity-0 scale-110" : "opacity-100 scale-100"
      }`}
    >
      {/* Ambient glow */}
      <div
        className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00F5FF]/[0.02] blur-[100px]"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl px-6">
        <div className="pixel-border rounded-none bg-[#050816]/90 p-8">
          {/* Terminal header bar */}
          <div className="mb-4 flex items-center gap-2">
            <div className="h-2 w-2 bg-[#FF4D4D]" />
            <div className="h-2 w-2 bg-[#FFE600]" />
            <div className="h-2 w-2 bg-[#00FF88]" />
            <span className="ml-2 font-[family-name:var(--font-pixel)] text-[8px] text-[#A0A0A0]/50">
              ved.exe — boot sequence
            </span>
          </div>

          <div className="mb-4 font-[family-name:var(--font-pixel)] text-xs text-[#00F5FF]">
            C:\USERS\VED&gt; ved.exe
          </div>

          <div className="space-y-1.5 font-[family-name:var(--font-body)] text-sm text-[#A0A0A0]">
            {lines.map((line, i) => (
              <div
                key={i}
                className={`boot-line ${
                  line.startsWith(">")
                    ? line.includes("deployed")
                      ? "text-[#FF4D4D]"
                      : "text-[#FFE600]"
                    : line === "System Ready."
                      ? "text-[#00FF88] font-bold"
                      : "text-[#A0A0A0]"
                }`}
                style={{
                  animation: "fadeSlideIn 0.3s ease-out forwards",
                }}
              >
                {line.startsWith("INITIALIZING") ? (
                  <span className="font-[family-name:var(--font-pixel)] text-xs text-[#00F5FF]">
                    {line}
                  </span>
                ) : (
                  <span>
                    {!line.startsWith(">") && (
                      <span className="text-[#00F5FF]/40">{">"} </span>
                    )}
                    {line}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-6 mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="font-[family-name:var(--font-pixel)] text-[8px] text-[#A0A0A0]/60">
                LOADING
              </span>
              <span className="font-[family-name:var(--font-pixel)] text-[8px] text-[#00F5FF]">
                {progress}%
              </span>
            </div>
            <div className="h-2 w-full bg-[#0a0f2e] border border-white/5">
              <div
                className="h-full transition-all duration-500 ease-out"
                style={{
                  width: `${progress}%`,
                  background:
                    progress === 100
                      ? "#00FF88"
                      : "linear-gradient(90deg, #00F5FF, #FF00E5)",
                  boxShadow:
                    progress === 100
                      ? "0 0 10px #00FF8840"
                      : "0 0 10px #00F5FF40",
                }}
              />
            </div>
          </div>

          {showStart && !exiting && (
            <button
              onClick={handleStart}
              className="mt-6 w-full border-2 border-[#00F5FF] bg-transparent px-8 py-4 font-[family-name:var(--font-pixel)] text-sm text-[#00F5FF] transition-all duration-300 hover:bg-[#00F5FF] hover:text-[#050816] hover:shadow-[0_0_40px_rgba(0,245,255,0.4)] focus:outline-none focus:ring-2 focus:ring-[#00F5FF] active:scale-95"
              style={{
                animation: "pulse 2s ease-in-out infinite",
              }}
            >
              [ PRESS START ]
            </button>
          )}

          <div className="mt-6 flex justify-between font-[family-name:var(--font-pixel)] text-[7px] text-[#A0A0A0]/30">
            <span>VED.EXE v2.1.07</span>
            <span>MEM: 64KB FREE</span>
            <span>© 2026 VED CHAUHAN</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(0, 245, 255, 0.3);
          }
          50% {
            box-shadow: 0 0 20px 4px rgba(0, 245, 255, 0.15);
          }
        }
      `}</style>
    </div>
  );
}
