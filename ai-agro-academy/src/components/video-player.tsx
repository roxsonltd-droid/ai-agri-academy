"use client";

import { Stream } from "@cloudflare/stream-react";

interface VideoPlayerProps {
  videoId: string;
  title?: string;
  controls?: boolean;
  autoplay?: boolean;
  muted?: boolean;
}

export function VideoPlayer({ 
  videoId, 
  title, 
  controls = true, 
  autoplay = false, 
  muted = false 
}: VideoPlayerProps) {
  // We use the NEXT_PUBLIC_CF_STREAM_CUSTOMER_CODE if available for the iframe builder,
  // but the React component primarily needs the video id (src).
  const customerCode = process.env.NEXT_PUBLIC_CF_STREAM_CUSTOMER_CODE;

  if (!videoId) {
    return (
      <div className="w-full aspect-video bg-slate-900 rounded-xl flex items-center justify-center border border-white/10">
        <p className="text-slate-500">Видеото не е намерено</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl shadow-teal-900/20 border border-white/10 relative group bg-black">
      <Stream
        controls={controls}
        src={videoId}
        autoplay={autoplay}
        muted={muted}
        responsive={true}
        title={title}
        customerCode={customerCode}
        className="w-full h-full absolute top-0 left-0"
      />
    </div>
  );
}
