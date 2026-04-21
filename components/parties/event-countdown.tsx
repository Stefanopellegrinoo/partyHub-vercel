"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function EventCountdown({ targetDate }: { targetDate: string | Date }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.isExpired) {
    return (
      <div className="flex items-center gap-2 text-primary font-bold animate-pulse">
        <Clock className="h-4 w-4" />
        <span>¡La fiesta ya empezó! 🚀</span>
      </div>
    );
  }

  return (
    <div className="flex gap-4 items-center">
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold">{timeLeft.days}</span>
        <span className="text-[10px] uppercase text-muted-foreground">Días</span>
      </div>
      <span className="text-xl font-light text-muted-foreground/50">:</span>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold">{timeLeft.hours}</span>
        <span className="text-[10px] uppercase text-muted-foreground">Hs</span>
      </div>
      <span className="text-xl font-light text-muted-foreground/50">:</span>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold">{timeLeft.minutes}</span>
        <span className="text-[10px] uppercase text-muted-foreground">Min</span>
      </div>
      <span className="text-xl font-light text-muted-foreground/50">:</span>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold text-primary">{timeLeft.seconds}</span>
        <span className="text-[10px] uppercase text-muted-foreground">Seg</span>
      </div>
    </div>
  );
}
