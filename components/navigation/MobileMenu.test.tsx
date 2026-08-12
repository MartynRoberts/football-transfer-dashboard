import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import MobileMenu from "./MobileMenu";

describe("MobileMenu", () => {
  it("opens, exposes navigation, and closes after choosing a link", async () => {
    const user = userEvent.setup();
    render(<MobileMenu />);
    expect(screen.queryByRole("link", { name: "Leagues" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Toggle menu" }));
    expect(screen.getByRole("link", { name: "Leagues" })).toHaveAttribute("href", "/leagues");
    expect(screen.getByRole("searchbox")).toHaveAttribute("name", "q");
    await user.click(screen.getByRole("link", { name: "Leagues" }));
    expect(screen.queryByRole("link", { name: "Leagues" })).not.toBeInTheDocument();
  });

  it("has no basic accessibility violations when open", async () => {
    const user = userEvent.setup();
    const { container } = render(<MobileMenu />);
    await user.click(screen.getByRole("button", { name: "Toggle menu" }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
