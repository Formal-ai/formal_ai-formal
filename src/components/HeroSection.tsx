import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set slow playback rate
    video.playbackRate = 0.4;

    // Handle video ready states
    const handleCanPlay = () => {
      setIsVideoLoaded(true);
    };

    const handlePlaying = () => {
      setIsVideoPlaying(true);
    };

    video.addEventListener("canplaythrough", handleCanPlay);
    video.addEventListener("playing", handlePlaying);

    // Check if already loaded (cached)
    if (video.readyState >= 3) {
      setIsVideoLoaded(true);
      setIsVideoPlaying(true);
    }

    return () => {
      video.removeEventListener("canplaythrough", handleCanPlay);
      video.removeEventListener("playing", handlePlaying);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative rounded-[3.5rem] ios-glass-hero liquid-glass-section mb-12 animate-fade-in overflow-hidden transition-all duration-500"
      style={{
        '--mouse-x': `${mousePosition.x}px`,
        '--mouse-y': `${mousePosition.y}px`,
        '--light-opacity': '1',
      } as React.CSSProperties}
    >
      <div className="grid md:grid-cols-2 gap-4 md:gap-12 p-4 pt-2 pb-14 md:pb-0 md:p-12 lg:p-16 items-center">
        {/* Left side - Animated Video with Loading State */}
        <div className="relative aspect-square max-w-[220px] sm:max-w-[320px] md:max-w-[400px] lg:max-w-[500px] mx-auto md:ml-0 md:-mt-4 rounded-[2rem] overflow-hidden group flex items-center justify-center bg-black/5 animate-scale-in shadow-2xl">

          {/* Poster Image - Shows immediately */}
          <img
            src="/hero-poster.png"
            alt="Formal.AI Hero"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 scale-[1.02] ${isVideoPlaying ? "opacity-0" : "opacity-100"
              }`}
          />

          {/* Loading Shimmer Overlay - Shows while video is loading */}
          {!isVideoLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"
              style={{ backgroundSize: '200% 100%' }}
            />
          )}

          {/* Video - Fades in when ready - Added slight scale to prevent sub-pixel line gaps */}
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster="/hero-poster.png"
            className={`w-[101%] h-[101%] object-cover pointer-events-none select-none transition-opacity duration-700 scale-[1.02] ${isVideoPlaying ? "opacity-100" : "opacity-0"
              }`}
            onContextMenu={(e) => e.preventDefault()}
          >
            <source src="/animated-hero.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Premium Gradient Overlay/Vignette */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none" />
          <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[2rem] pointer-events-none" />
        </div>

        {/* Right side - Content */}
        <div className="flex flex-col justify-center space-y-3 md:space-y-8">
          <div className="space-y-2 md:space-y-6">
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight animate-slide-down hover:text-primary transition-colors duration-300 cursor-default">
              <span className="inline-block animate-glow-pulse">AI-Powered</span>{" "}
              <span className="inline-block hover:animate-pulse animation-delay-100">Professional</span>{" "}
              <span className="inline-block hover:animate-pulse animation-delay-200">Appearance</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-xl leading-relaxed max-w-xl animate-slide-up stagger-1 hover:text-foreground transition-colors duration-300">
              Instantly generate, refine, or modify formal attire and corporate looks with cutting-edge AI stylist intelligence.
            </p>
          </div>

          <div className="flex justify-end md:justify-start -mt-8 md:mt-0 animate-scale-in stagger-2">
            <Link to="/waitlist">
              <Button className="ios-glass-button px-8 py-6 text-lg rounded-full hover:scale-105 transition-all duration-300 shadow-lg">
                Join The Waitlist
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
