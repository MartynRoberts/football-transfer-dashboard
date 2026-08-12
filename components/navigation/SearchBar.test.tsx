import { render, screen } from "@testing-library/react";
import SearchBar from "./SearchBar";

describe("SearchBar", () => {
  it("submits searches to the search page", () => {
    render(<SearchBar />);
    const input = screen.getByRole("searchbox");
    expect(input).toHaveAttribute("name", "q");
    expect(input.closest("form")).toHaveAttribute("action", "/search");
    expect(input).toHaveAttribute("placeholder", "Search players, clubs and leagues");
  });

  it("uses a compact mobile label", () => {
    render(<SearchBar mobile />);
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
  });
});
