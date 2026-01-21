import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {/* Icon */}
            <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0" role="img" aria-label="MPLP Protocol Logo">
                <Image
                    src="/brand/mplp-icon-only-transparent.png"
                    alt=""
                    width={32}
                    height={32}
                    className="object-contain"
                    priority
                />
            </div>
            {/* Wordmark */}
            {showText && (
                <span className="font-sans font-bold text-xl tracking-normal text-mplp-text">
                    MPLP
                </span>
            )}
        </div>
    );
}
