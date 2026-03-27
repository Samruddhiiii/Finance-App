"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import GradientText from "@/components/ui/GradientText";
import Mutebutton from "@/components/ui/Mutebutton";
import PlayPauseButton from "@/components/PlayPauseButton";

const HeroSection = () => {
  const imageRef = useRef(null);
  const videoContainerRef = useRef(null);
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const videoSrc = useMemo(() => "/herovideo.mp4", []);

  useEffect(() => {
    const imageElement = imageRef.current;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsVideoReady(false);

    const videoElement = videoRef.current;
    if (!videoElement) return;

    let isCancelled = false;

    const markReady = () => {
      if (!isCancelled) setIsVideoReady(true);
    };

    const onReady = () => markReady();
    const onError = () => markReady();

    videoElement.addEventListener("loadedmetadata", onReady);
    videoElement.addEventListener("loadeddata", onReady);
    videoElement.addEventListener("canplay", onReady);
    videoElement.addEventListener("canplaythrough", onReady);
    videoElement.addEventListener("error", onError);

    if (videoElement.readyState >= 2) {
      markReady();
    } else {
      try {
        videoElement.load();
      } catch {}
    }

    const fallbackTimer = window.setTimeout(() => {
      markReady();
    }, 5000);

    return () => {
      isCancelled = true;
      window.clearTimeout(fallbackTimer);
      videoElement.removeEventListener("loadedmetadata", onReady);
      videoElement.removeEventListener("loadeddata", onReady);
      videoElement.removeEventListener("canplay", onReady);
      videoElement.removeEventListener("canplaythrough", onReady);
      videoElement.removeEventListener("error", onError);
    };
  }, [videoSrc]);

  return (
    <section className="px-4 pt-40 pb-20">
      <div className="container mx-auto text-center">
        <GradientText
          colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
          animationSpeed={3}
          showBorder={false}
          className="
    block text-center font-semibold tracking-tight
    text-[clamp(2.25rem,6vw,5rem)]
    leading-[1.1]
    px-4 sm:px-6
    max-w-[22ch] sm:max-w-[26ch] md:max-w-[32ch]
    mx-auto
    break-words
  "
        >
          Where Intelligent Accounting
          <br className="hidden sm:block" />
          Meets Financial Clarity
        </GradientText>
        <br />
        <p className="max-w-2xl mx-auto mb-8 text-lg md:text-xl lg:text-lg text-gray-600">
          An AI-powered financial management platform that helps you track,
          analyze, and optimize your spending with real-time insights.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/dashboard">
            <Button size="lg" className="px-8">
              Get Started
            </Button>
          </Link>
          <Link href="https://www.linkedin.com/posts/rajkiranraj_softwareengineering-fullstackdeveloper-sde-activity-7408481523039031296-qdNU?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAEUSf3oBKLohrSLmEkZ6QecUV3DTeFebtVM">
            <Button size="lg" variant="outline" className="px-8">
              Watch Demo
            </Button>
          </Link>
        </div>
        <div className="mt-5 hero-image-wrapper md:mt-0">
          <div
            ref={imageRef}
            className="relative mx-auto overflow-hidden border shadow-2xl rounded-3xl hero-image"
          >
            <div
              ref={videoContainerRef}
              className="relative w-full home-video-target"
              style={{ aspectRatio: "16 / 9" }}
              tabIndex={0}
              onMouseEnter={() => {
                videoRef.current?.play?.().catch(() => {});
              }}
              onFocus={() => {
                videoRef.current?.play?.().catch(() => {});
              }}
            >
              {!isVideoReady && (
                <SkeletonTheme baseColor="#202020" highlightColor="#444">
                  <div className="absolute inset-0">
                    <Skeleton
                      width="100%"
                      height="100%"
                      className="h-full w-full rounded-3xl"
                    />
                  </div>
                </SkeletonTheme>
              )}
              <video
                ref={videoRef}
                className={`relative z-10 w-full h-full rounded-3xl object-cover transition-opacity duration-300 ${
                  isVideoReady ? "opacity-100" : "opacity-0"
                }`}
                loop
                playsInline
                muted={muted}
                preload="auto"
              >
                <source src={videoSrc} type="video/mp4" />
              </video>

              {isVideoReady && (
                <PlayPauseButton
                  videoRef={videoRef}
                  containerRef={videoContainerRef}
                />
              )}
            </div>

            {isVideoReady && (
              <div className="absolute top-6 right-8 z-10">
                <Mutebutton
                  className="text-primary-foreground bg-primary/90 border border-primary/30 rounded-full h-10 w-10 shadow-lg ring-1 ring-primary-foreground/20 backdrop-blur"
                  checked={!muted}
                  aria-label={muted ? "Unmute video" : "Mute video"}
                  onChange={(e) => {
                    const shouldBeUnmuted = e.target.checked;
                    const nextMuted = !shouldBeUnmuted;
                    setMuted(nextMuted);
                    if (videoRef.current) {
                      videoRef.current.muted = nextMuted;
                      videoRef.current.play?.().catch(() => {});
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
