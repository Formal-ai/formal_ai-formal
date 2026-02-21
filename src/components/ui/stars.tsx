"use client"
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

export const Stars = ({
    number = 150,
    className,
}: {
    number?: number;
    className?: string;
}) => {
    const [starStyles, setStarStyles] = useState<React.CSSProperties[]>([]);

    useEffect(() => {
        const styles = [...new Array(number)].map(() => ({
            top: Math.random() * 100 + "%",
            left: Math.random() * 100 + "%",
            animationDelay: Math.random() * 5 + "s",
            animationDuration: Math.random() * 4 + 3 + "s",
            width: Math.random() * 2 + 1 + "px",
            height: Math.random() * 2 + 1 + "px",
        }));
        setStarStyles(styles);
    }, [number]);

    return (
        <div className={cn("fixed inset-0 overflow-hidden pointer-events-none z-0", className)}>
            {starStyles.map((style, idx) => (
                <span
                    key={"star" + idx}
                    className="animate-flash-effect absolute rounded-full bg-black dark:bg-white opacity-40"
                    style={style}
                ></span>
            ))}
        </div>
    );
};
