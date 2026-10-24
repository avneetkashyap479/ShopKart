import React, { useState, useEffect } from 'react';

const DealCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 42,
    seconds: 19
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const format = (num) => String(num).padStart(2, '0');

  return (
    <div className="d-flex align-items-center gap-2">
      <span className="text-muted small fw-semibold d-none d-sm-inline">Ends in:</span>
      <div className="timer-pill">
        <i className="bi bi-clock-history text-warning"></i>
        <span>{format(timeLeft.hours)}h : {format(timeLeft.minutes)}m : {format(timeLeft.seconds)}s</span>
      </div>
    </div>
  );
};

export default DealCountdown;
