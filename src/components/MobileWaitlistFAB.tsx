import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const MobileWaitlistFAB = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // Show button after scrolling down a bit to not clutter the initial hero view
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    return (
        <div
            className={`fixed bottom-24 right-6 z-40 transition-all duration-500 md:hidden ${isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-10 pointer-events-none"
                }`}
        >
            <Link to="/waitlist">
                <Button className="ios-glass-button rounded-full px-6 py-7 shadow-2xl group flex flex-col items-center gap-1 border border-white/20">
                    <Sparkles className="h-5 w-5 text-white animate-pulse" />
                    <span className="text-[10px] uppercase font-black tracking-[0.1em] text-white">Join Waitlist</span>
                </Button>
            </Link>
        </div>
    );
};

export default MobileWaitlistFAB;
