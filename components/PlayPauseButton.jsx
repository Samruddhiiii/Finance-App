"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

const PlayPauseButton = ({
  videoRef,
  containerRef,
  hideAfterMs = 2000,
  className = "",
}) => {
  const hideTimeoutRef = useRef(null);
  const isPlayingRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimeout();

    if (!isPlayingRef.current) {
      setIsVisible(true);
      return;
    }

    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, hideAfterMs);
  }, [clearHideTimeout, hideAfterMs]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef?.current;
    if (!video) return;

    const sync = () => {
      const playing = !video.paused && !video.ended;
      setIsPlaying(playing);
      setIsVisible(true);
    };

    sync();
    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);
    video.addEventListener("ended", sync);

    return () => {
      video.removeEventListener("play", sync);
      video.removeEventListener("pause", sync);
      video.removeEventListener("ended", sync);
    };
  }, [videoRef]);

  useEffect(() => {
    scheduleHide();
    return () => clearHideTimeout();
  }, [scheduleHide, clearHideTimeout, isPlaying]);

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;

    const onActivity = () => {
      setIsVisible(true);
      scheduleHide();
    };

    el.addEventListener("mousemove", onActivity);
    el.addEventListener("mouseenter", onActivity);
    el.addEventListener("touchstart", onActivity, { passive: true });
    el.addEventListener("focusin", onActivity);
    el.addEventListener("keydown", onActivity);

    return () => {
      el.removeEventListener("mousemove", onActivity);
      el.removeEventListener("mouseenter", onActivity);
      el.removeEventListener("touchstart", onActivity);
      el.removeEventListener("focusin", onActivity);
      el.removeEventListener("keydown", onActivity);
    };
  }, [containerRef, scheduleHide]);

  const togglePlayback = async () => {
    const video = videoRef?.current;
    if (!video) return;

    setIsVisible(true);
    clearHideTimeout();

    try {
      if (video.paused || video.ended) {
        await video.play();
      } else {
        video.pause();
      }
    } catch {
      // Ignore (autoplay restrictions, etc.)
    } finally {
      scheduleHide();
    }
  };

  const shouldBeVisible = !isPlaying || isVisible;

  return (
    <button
      type="button"
      aria-label={isPlaying ? "Pause video" : "Play video"}
      onClick={togglePlayback}
      className={
        "absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-300 " +
        (shouldBeVisible ? "opacity-100" : "opacity-0 pointer-events-none") +
        " " +
        className
      }
    >
      <span className="inline-flex items-center justify-center rounded-full bg-primary/90 text-primary-foreground border border-primary/30 shadow-lg ring-1 ring-primary-foreground/20 backdrop-blur h-14 w-14 sm:h-16 sm:w-16">
        {isPlaying ? (
          <Pause className="h-6 w-6" />
        ) : (
          <Play className="h-6 w-6" />
        )}
      </span>
    </button>
  );
};

export default PlayPauseButton;
