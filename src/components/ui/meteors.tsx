"use client"
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

export const Meteors = ({
    number = 25,
    className,
}: {
    number?: number;
    className?: string;
}) => {
    const [meteorStyles, setMeteorStyles] = useState<React.CSSProperties[]>([]);

    useEffect(() => {
        const styles = [...new Array(number)].map(() => ({
            top: "-20px",
            left: Math.floor(Math.random() * 160) - 30 + "%",
            animationDelay: Math.random() * 20 + "s",
            animationDuration: Math.floor(Math.random() * 6 + 8) + "s",
        }));
        setMeteorStyles(styles);
    }, [number]);

    return (
        <div className={cn("fixed inset-0 overflow-hidden pointer-events-none z-[1]", className)}>
            {meteorStyles.map((style, idx) => (
                <span
                    key={"meteor" + idx}
                    className={cn(
                        "animate-meteor-effect absolute h-0.5 w-0.5 rounded-full bg-slate-500 dark:bg-slate-50 shadow-[0_0_12px_2px_#38bdf830] rotate-[215deg]",
                        "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[250px] before:h-[0.8px] before:bg-gradient-to-r before:from-sky-400/40 before:via-sky-200/20 before:to-transparent dark:before:from-sky-500/40 dark:before:via-sky-300/20"
                    )}
                    style={style}
                ></span>
            ))}
        </div>
    );
};
