"use client";

import { useEffect, useRef, useState } from "react";

export interface SectionNavItem {
  id: string;
  label: string;
}

export default function SectionNav({ items }: { items: SectionNavItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const navigationTargetRef = useRef<string | null>(null);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    const getAvailableSections = () =>
      items
        .map((item) => document.getElementById(item.id))
        .filter((section): section is HTMLElement => section !== null);

    const updateActiveSection = () => {
      const sections = getAvailableSections();

      if (sections.length === 0) return;

      const atPageBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 4;
      const navigationTarget = navigationTargetRef.current;

      if (navigationTarget) {
        const target = document.getElementById(navigationTarget);
        const targetReached =
          target && Math.abs(target.getBoundingClientRect().top - 120) <= 12;
        const targetIsLast =
          sections[sections.length - 1]?.id === navigationTarget;

        if (!targetReached && !(atPageBottom && targetIsLast)) {
          setActiveId(navigationTarget);
          return;
        }

        navigationTargetRef.current = null;
      }

      if (atPageBottom) {
        setActiveId(sections[sections.length - 1].id);
        return;
      }

      const activationLine = window.scrollY + 130;
      const activeSection = [...sections]
        .reverse()
        .find((section) => section.offsetTop <= activationLine);

      setActiveId(activeSection?.id ?? sections[0].id);
    };

    const observer = new IntersectionObserver(
      updateActiveSection,
      { rootMargin: "-112px 0px -65% 0px", threshold: [0, 0.1] },
    );

    const observedSections = new Set<HTMLElement>();
    const observeAvailableSections = () => {
      items.forEach((item) => {
        const section = document.getElementById(item.id);

        if (section && !observedSections.has(section)) {
          observedSections.add(section);
          observer.observe(section);
        }
      });
    };
    observeAvailableSections();

    const mutationObserver = new MutationObserver(observeAvailableSections);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    const updateNavigationState = () => {
      setShowBackToTop(window.scrollY > 700);
      updateActiveSection();
    };
    updateNavigationState();
    window.addEventListener("scroll", updateNavigationState, { passive: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("scroll", updateNavigationState);

      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [items]);

  useEffect(() => {
    const list = navRef.current?.querySelector<HTMLElement>(
      ".section-nav-list",
    );
    const activeLink = list?.querySelector<HTMLElement>(
      `[href="#${activeId}"]`,
    );

    if (!list || !activeLink) return;

    const left =
      activeLink.offsetLeft - (list.clientWidth - activeLink.offsetWidth) / 2;

    list.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [activeId]);

  function navigateTo(id: string) {
    navigationTargetRef.current = id;

    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    navigationTimeoutRef.current = setTimeout(() => {
      navigationTargetRef.current = null;
    }, 2000);

    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    window.history.replaceState(null, "", `#${id}`);
  }

  return (
    <>
      <nav
        ref={navRef}
        aria-label="On this page"
        className="section-nav"
      >
        <div className="section-nav-list">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={activeId === item.id ? "location" : undefined}
              className="section-nav-link"
              onClick={(event) => {
                event.preventDefault();
                navigateTo(item.id);
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      {showBackToTop && (
        <button
          type="button"
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
        >
          ↑ <span className="hidden sm:inline">Top</span>
        </button>
      )}
    </>
  );
}
