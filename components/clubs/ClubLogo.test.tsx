import { fireEvent, render, screen } from "@testing-library/react";
import ClubLogo from "./ClubLogo";

describe("ClubLogo", () => {
  it("renders nothing without a URL", () => {
    const { container } = render(<ClubLogo name="Aston Villa" size={24} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("stays invisible until it loads", () => {
    render(<ClubLogo name="Aston Villa" url="https://tmssl.akamaized.net/logo.png" size={24} />);
    const image = screen.getByRole("img", { name: "Aston Villa badge" });
    expect(image).toHaveClass("opacity-0");
    fireEvent.load(image);
    expect(image).toHaveClass("opacity-100");
    expect(image).toHaveAttribute("src", expect.stringContaining("/api/images/club-logo?url="));
  });

  it("removes both image and reserved space after failure", () => {
    const { container } = render(<ClubLogo name="Missing" url="https://tmssl.akamaized.net/missing.png" size={24} />);
    fireEvent.error(screen.getByRole("img"));
    expect(container).toBeEmptyDOMElement();
  });
});
