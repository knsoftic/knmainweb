"use client";

import { useState } from 'react';

export type AccordionItemData = {
  id: string;
  question: string;
  answer: React.ReactNode;
};

const defaultAccordionItems: AccordionItemData[] = [
  {
    id: 'one',
    question: 'Where shall we begin?',
    answer: (
      <>
        At <strong>KN Softic</strong>, we begin by understanding your core business goals and target audience. Whether you need custom web development, intuitive mobile applications, or high-converting digital branding, we map out a clear, transparent strategy tailored specifically to bring your vision to life.
      </>
    ),
  },
  {
    id: 'two',
    question: 'How do we work together?',
    answer: (
      <>
        We believe in close collaboration and complete transparency. Our team adopts Agile development methodologies with regular milestone reviews, direct communication channels, and responsive feedback loops so you stay informed and in control at every step of the project lifecycle.
      </>
    ),
  },
  {
    id: 'three',
    question: 'Why KN Softic is the best choice?',
    answer: (
      <>
        We combine technical excellence with cutting-edge visual aesthetics. Unlike standard agencies, we don't just write code—we engineer scalable, high-performance digital products that load lightning-fast, rank high on search engines, and captivate your customers.
      </>
    ),
  },
  {
    id: 'four',
    question: 'Do we get continuous post-launch support?',
    answer: (
      <>
        Absolutely! We provide comprehensive post-launch maintenance, performance monitoring, security updates, and dedicated technical support. Your digital product is built to evolve and grow right alongside your business.
      </>
    ),
  },
];

export function AboutAccordion({ items = defaultAccordionItems }: { items?: AccordionItemData[] }) {
  const [openId, setOpenId] = useState<string>('');

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? '' : id));
  };

  return (
    <div className="about-accordion-box">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className={`about-accordion-item ${isOpen ? 'is-open' : ''}`}>
            <button
              type="button"
              className="about-accordion-header d-flex justify-content-between align-items-center w-100"
              onClick={() => toggleItem(item.id)}
              aria-expanded={isOpen}
            >
              <span className="question-text">{item.question}</span>
              <span className="accordion-toggle-icon d-flex align-items-center justify-content-center">
                {isOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}
              </span>
            </button>
            {isOpen && (
              <div className="about-accordion-body">
                <div className="body-content">{item.answer}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
