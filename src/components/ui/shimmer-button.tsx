import React from "react";
import { Check } from "lucide-react";

export const WaitlistMark = () => {
    return (
        <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse" />
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center shadow-lg border border-white/20">
                <Check className="w-6 h-6 text-white" />
            </div>
        </div>
    );
};

export const ShimmerButton = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    return (
        <button className={`relative overflow-hidden group px-6 py-2 rounded-full bg-neutral-900 text-white border border-white/10 ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
            <span className="relative z-10">{children}</span>
        </button>
    );
};
