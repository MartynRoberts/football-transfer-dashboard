import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SectionNav from "./SectionNav";

const items = [
  { id: "overview", label: "Overview" },
  { id: "transfers", label: "Transfers" },
];

function renderNav() {
  const result = render(
    <>
      <div id="overview" />
      <div id="transfers" />
      <SectionNav items={items} />
    </>,
  );
  Object.defineProperty(document.getElementById("transfers"), "offsetTop", { value: 1000 });
  return result;
}

describe("SectionNav", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
    Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 3000 });
  });

  it("marks the first section active initially", () => {
    renderNav();
    act(() => fireEvent.scroll(window));
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "location");
  });

  it("activates and scrolls to a clicked section while updating the hash", async () => {
    const user = userEvent.setup();
    renderNav();
    await user.click(screen.getByRole("link", { name: "Transfers" }));
    expect(screen.getByRole("link", { name: "Transfers" })).toHaveAttribute("aria-current", "location");
    expect(document.getElementById("transfers")?.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
    expect(window.location.hash).toBe("#transfers");
  });

  it("shows and operates back to top after scrolling", () => {
    renderNav();
    Object.defineProperty(window, "scrollY", { configurable: true, value: 800 });
    act(() => fireEvent.scroll(window));
    fireEvent.click(screen.getByRole("button", { name: "Back to top" }));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
