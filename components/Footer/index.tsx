"use client";

import Image from "next/image";

export default function Footer() {
  return (
    <footer
      style={{ fontFamily: "Akatab, sans-serif" }}
      className="fixed bottom-0 text-white/50 w-full text-[8px] lg:text-[10px] z-[99999999] uppercase opacity-80 flex flex-col gap-2 px-8 pb-3"
    >
      <div className="flex items-center justify-center gap-2 text-center">
        <span className="text-white/60 normal-case text-[10px] lg:text-xs">
          Built for YouTube — Watch the full tutorial series on{" "}
          <a
            className="text-[#67e4e4] hover:text-[#67e4e4]/80 underline transition-colors"
            href="https://www.youtube.com/playlist?list=PLA-Yd8pF2sxa5ZbajPLnstGwbxmv2xaJ6"
            target="_blank"
            rel="noopener noreferrer"
          >
            this playlist
          </a>
          . If you find this useful, please{" "}
          <a
            className="text-[#67e4e4] hover:text-[#67e4e4]/80 underline transition-colors"
            href="https://www.youtube.com/@cortizdev?sub_confirmation=1"
            target="_blank"
            rel="noopener noreferrer"
          >
            subscribe
          </a>{" "}
          & share so I can keep creating projects like this. Thanks!
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-white/80 font-akatab text-xs">v 2.1</span>
        <span className="flex items-center justify-center gap-2">
          Created by{" "}
          <a
            className="underline text-white/80 flex items-center gap-1"
            href="https://www.cortiz.dev/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/logo-cortiz.svg"
              alt="Christian Ortiz"
              width={60}
              height={20}
              className="opacity-80 hover:opacity-100 transition-opacity mt-[-5px]"
            />
          </a>
        </span>
      </div>
    </footer>
  );
}
