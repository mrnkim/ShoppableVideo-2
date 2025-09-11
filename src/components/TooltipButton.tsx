'use client';

import { useState } from "react";
import { ReactNode } from "react";
import {InfoIcon} from "@/components/icons/InfoIcon";

type TooltipButtonProps = {
    children: ReactNode;
    buttonText: string;
    className?: string;
}

export const TooltipButton = ({ children, buttonText, className }: TooltipButtonProps) => {
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);

    const toggleTooltip = () => {
        setIsTooltipVisible(!isTooltipVisible);
    };

    return (
        <div 
            className={`relative inline-block ${className || ''}`}
            onMouseEnter={() => setIsTooltipVisible(true)}
            onMouseLeave={() => setIsTooltipVisible(false)}
        >
            <button
                className="px-4 py-2 bg-transparent text-global-text text-base font-normal rounded-xl border border-global-text hover:bg-[#1d1c1b1a] transition-colors flex items-center gap-2"
                onClick={toggleTooltip}
            >
                {buttonText}
                <InfoIcon />
            </button>
            
            {isTooltipVisible && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1 z-50 min-w-[480px] animate-fadeIn">
                    <div className="bg-gray-600 rounded-lg shadow-xl p-3">
                            {children}
                    </div>
                </div>
            )}
        </div>
    );
}