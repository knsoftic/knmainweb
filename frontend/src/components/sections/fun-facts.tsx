"use client";

import React, { useState, useEffect, useRef } from 'react';

export interface FunFactItem {
  id: string;
  target: number;
  label: string;
}

const defaultStats: FunFactItem[] = [
  { id: 'students', target: 150, label: 'Happy Students' },
  { id: 'hours', target: 804, label: 'Course Hours' },
  { id: 'employed', target: 50, label: 'Employed Students' },
  { id: 'experience', target: 15, label: 'Years Experience' },
];

function CounterItem({ target, label }: { target: number; label: string }) {
  const [count, setCount] = useState(0);
  const itemRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = itemRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let start = 0;
          const duration = 1500; // 1.5s count up animation
          const stepTime = Math.max(16, Math.floor(duration / target));
          const increment = Math.max(1, Math.ceil(target / (duration / stepTime)));

          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, stepTime);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div className="col-lg-3 col-md-6 col-sm-6" ref={itemRef}>
      <div className="counter">
        <h2 className="count-number">{count}</h2>
        <p className="count-text">{label}</p>
      </div>
    </div>
  );
}

export function FunFactsSection({ stats = defaultStats }: { stats?: FunFactItem[] }) {
  return (
    <div className="section fun-facts" id="fun-facts">
      <div className="container">
        <div className="row">
          {stats.map((stat) => (
            <CounterItem key={stat.id} target={stat.target} label={stat.label} />
          ))}
        </div>
      </div>
    </div>
  );
}
