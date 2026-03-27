"use client";

import { cn } from "@/lib/utils";

export default function PlayToggle({ className, ...props }) {
  return (
    <label
      className={cn(
        "relative flex items-center justify-center w-[150px] h-[60px] rounded-[24px] bg-black/5 cursor-pointer select-none [perspective:150px]",
        className
      )}
      {...props}
    >
      <input
        type="checkbox"
        className="absolute inset-0 opacity-0 z-10 cursor-pointer peer"
      />

      <div
        className="relative z-[2] flex items-center justify-start gap-1
                   w-[calc(100%-16px)] h-[calc(100%-16px)]
                   pl-4 pr-[60px] rounded-[16px]
                   bg-black
                   shadow-[1px_1px_2px_-1px_#fff_inset,0_2px_1px_#00000010,0_4px_2px_#00000010,0_8px_4px_#00000010,0_16px_8px_#00000010]
                   transition-all duration-150 ease-elastic
                   peer-hover:-translate-y-0.5 peer-active:translate-y-0.5"
      >
        {/* Button Text */}
        <span
          className="absolute text-[16px] font-medium text-white
                     transition-opacity duration-200"
        >
          Signup
        </span>

        {/* Green blinking LED */}
        <span
          className="absolute top-1/2 right-[26px] w-2 h-2 rounded-full
                     bg-green-500 border border-green-400
                     -translate-y-1/2
                     animate-pulse
                     shadow-[0_0_6px_1px_#22c55e,0_0_20px_5px_rgba(34,197,94,0.4)]"
        />
      </div>
    </label>
  );
}
