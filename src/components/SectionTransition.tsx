"use client";

export function SectionTransition() {
  return (
    <div className="flex items-center justify-center py-4" aria-hidden="true">
      <div className="flex items-center gap-2">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#00F5FF]/20 sm:w-24" />
        <div className="flex gap-1">
          <div className="h-1 w-1 bg-[#00F5FF]/30" />
          <div className="h-1 w-1 bg-[#FF00E5]/30" />
          <div className="h-1 w-1 bg-[#FFE600]/30" />
        </div>
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#FF00E5]/20 sm:w-24" />
      </div>
    </div>
  );
}
