"use client";

import { useId, useState } from 'react';

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
        We combine technical excellence with cutting-edge visual aesthetics. Unlike standard agencies, we don&apos;t just write code—we engineer scalable, high-performance digital products that load lightning-fast, rank high on search engines, and captivate your customers.
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

type AboutAccordionProps = {
  items?: AccordionItemData[];
  /** Light text on a dark background. */
  dark?: boolean;
  /** Item open on first render; nothing is open until a visitor clicks. */
  defaultOpenId?: string;
};

export function AboutAccordion({ items = defaultAccordionItems, dark = false, defaultOpenId = '' }: AboutAccordionProps) {
  const [openId, setOpenId] = useState<string>(defaultOpenId);
  const baseId = useId();

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? '' : id));
  };

  return (
    <div className={`ks-faq${dark ? ' ks-faq--dark' : ''}`}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        const panelId = `${baseId}-${item.id}`;
        return (
          <div key={item.id} className={`ks-faq__item${isOpen ? ' is-open' : ''}`}>
            <h3 style={{ margin: 0 }}>
              <button
                type="button"
                className="ks-faq__q"
                onClick={() => toggleItem(item.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                <span>{item.question}</span>
                <span className="ks-faq__icon" aria-hidden="true"><i className="fa fa-plus"></i></span>
              </button>
            </h3>
            {/* Collapsed with a grid-row transition (ks-design.css), and hidden from screen readers while closed. */}
            <div id={panelId} className="ks-faq__panel" aria-hidden={!isOpen}>
              <div>
                <div className="ks-faq__a">{item.answer}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
