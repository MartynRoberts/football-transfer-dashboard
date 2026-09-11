import { render, screen } from "@testing-library/react";
import ClubLogo from "./ClubLogo";

describe("ClubLogo", () => {
  it("renders nothing without a URL", () => {
    const { container } = render(<ClubLogo name="Aston Villa" size={24} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders an optimized image through the logo proxy", () => {
    render(
      <ClubLogo
        name="Aston Villa"
        url="https://tmssl.akamaized.net/logo3.png"
        size={24}
      />,
    );
    const image = screen.getByRole("img", { name: "Aston Villa badge" });
    expect(image).toHaveAttribute(
      "src",
      expect.stringContaining("/api/images/club-logo?url="),
    );
    expect(image).toHaveAttribute("sizes", "24px");
  });
});
