import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronsLeftRight } from "lucide-react";

interface ImageCompareProps {
    original: string;
    formal: string;
    className?: string;
}

export const ImageCompare = ({ original, formal, className = "" }: ImageCompareProps) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = useCallback(
        (clientX: number) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
            const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
            setSliderPosition(percent);
        },
        []
    );

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        handleMove(e.clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        handleMove(e.touches[0].clientX);
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative w-full max-w-lg mx-auto aspect-[3/4] overflow-hidden select-none shadow-2xl cursor-col-resize",
                className
            )}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
        >
            {/* Original Image (Left side - Full background) */}
            <img
                src={original}
                alt="Original"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                draggable={false}
            />

            {/* Formal Image (Right side - Revealed from right) */}
            <div
                className="absolute inset-0 overflow-hidden select-none pointer-events-none"
                style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
            >
                <img
                    src={formal}
                    alt="Formal"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                    draggable={false}
                />
            </div>

            {/* Slider Line */}
            <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,10,0.3)] z-10 pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
            >
                {/* Slider Handle with Center Arrows */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-col-resize border border-neutral-200/50 transition-transform hover:scale-110 active:scale-95"
                >
                    <ChevronsLeftRight className="w-5 h-5 text-neutral-800" />
                </div>
            </div>

            {/* Labels - Top corners */}
            <div
                className={cn(
                    "absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg text-xs font-bold text-white uppercase tracking-wider transition-opacity duration-300 z-20 pointer-events-none",
                    sliderPosition < 15 ? "opacity-0" : "opacity-100"
                )}
            >
                Original
            </div>
            <div
                className={cn(
                    "absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-lg text-xs font-bold text-neutral-900 border border-white/20 uppercase tracking-wider transition-opacity duration-300 z-20 pointer-events-none",
                    sliderPosition > 85 ? "opacity-0" : "opacity-100"
                )}
            >
                Formal.AI
            </div>
        </div>
    );
};

export default ImageCompare;
