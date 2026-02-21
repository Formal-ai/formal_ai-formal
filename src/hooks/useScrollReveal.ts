import { useEffect } from "react";

/**
 * Hook to initialize IntersectionObserver for elements with 'reveal-on-scroll' 
 * or 'typing-effect' classes.
 */
export const useScrollReveal = () => {
    useEffect(() => {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px",
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("revealed");

                    if (entry.target.classList.contains("typing-effect-trigger")) {
                        const typingTarget = entry.target.querySelector(".typing-effect");
                        if (typingTarget) {
                            typingTarget.classList.add("active");
                        }
                        // One-shot for typing
                        observer.unobserve(entry.target);
                    }

                    const staggerChildren = entry.target.querySelectorAll(".reveal-stagger-child");
                    staggerChildren.forEach((child, index) => {
                        (child as HTMLElement).classList.add("revealed");
                        (child as HTMLElement).classList.add(`stagger-delay-${(index % 4) + 1}`);
                    });
                } else {
                    // Remove classes when out of view
                    entry.target.classList.remove("revealed");
                    const staggerChildren = entry.target.querySelectorAll(".reveal-stagger-child");
                    staggerChildren.forEach((child) => {
                        (child as HTMLElement).classList.remove("revealed");
                    });
                }
            });
        }, observerOptions);

        // Find all elements to observe
        const revealElements = document.querySelectorAll(".reveal-on-scroll, .typing-effect-trigger, .typing-effect");
        revealElements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);
};
