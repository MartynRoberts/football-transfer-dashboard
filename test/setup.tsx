/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import "@testing-library/jest-dom";
import { toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

class IntersectionObserverMock implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "0px";
  readonly thresholds = [0];
  disconnect = jest.fn();
  observe = jest.fn();
  takeRecords = jest.fn(() => []);
  unobserve = jest.fn();
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: IntersectionObserverMock,
});
Object.defineProperty(window, "scrollTo", { writable: true, value: jest.fn() });
Object.defineProperty(Element.prototype, "scrollIntoView", {
  writable: true,
  value: jest.fn(),
});
Object.defineProperty(Element.prototype, "scrollTo", {
  writable: true,
  value: jest.fn(),
});

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    preload,
    fetchPriority,
    unoptimized,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    preload?: boolean;
    fetchPriority?: "high" | "low" | "auto";
    unoptimized?: boolean;
  }) => {
    void preload;
    void fetchPriority;
    void unoptimized;
    return <img {...props} />;
  },
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    onClick,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a
      href={href}
      {...props}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
    >
      {children}
    </a>
  ),
}));
