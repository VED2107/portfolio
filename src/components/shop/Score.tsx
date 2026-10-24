"use client";

import { useEffect, useState } from "react";
import { nextCue, onScore, scoreState, toggleScore } from "@/lib/score";

/** The shop's turntable for the score: play/stop, and the cue name as a skip button. */
export function Score() {
  const [s, setS] = useState(scoreState);
  useEffect(() => onScore(() => setS(scoreState())), []);
  return (
    <div className="score" data-playing={s.playing || undefined}>
      <button type="button" className="sign-switch" aria-pressed={s.playing} onClick={toggleScore} title="Original score, synthesised live">
        <span className="score-disc" aria-hidden />
        <span>Score</span>
      </button>
      {s.playing && (
        <button type="button" className="score-cue" onClick={nextCue} aria-label={`Now playing ${s.cue.title}. Next cue.`} title={s.cue.note}>
          <span className="pk">{s.cue.title}</span>
        </button>
      )}
    </div>
  );
}
