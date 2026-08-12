import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBar from "./SearchBar";

describe("SearchBar", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        players: [{ id: "p1", name: "Harry Kane", slug: "harry-kane-1", position: "Centre-Forward", imageUrl: "https://example.com/kane.png" }],
        clubs: [{ id: "c1", name: "Tottenham", slug: "tottenham-148", logoUrl: null }],
        leagues: [],
      }),
    });
  });

  afterEach(() => jest.useRealTimers());

  it("submits searches to the search page", () => {
    render(<SearchBar />);
    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("name", "q");
    expect(input.closest("form")).toHaveAttribute("action", "/search");
    expect(input).toHaveAttribute("placeholder", "Search players, clubs and leagues");
  });

  it("uses a compact mobile label", () => {
    render(<SearchBar mobile />);
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
  });

  it("loads dynamic suggestions after a debounce", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchBar />);
    await user.type(screen.getByRole("combobox"), "kan");
    await act(async () => jest.advanceTimersByTime(250));

    expect(global.fetch).toHaveBeenCalledWith("/api/search?q=kan", expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(await screen.findByRole("option", { name: /Harry Kane/ })).toHaveAttribute("href", "/players/harry-kane-1");
    expect(screen.getByRole("link", { name: "View all results" })).toHaveAttribute("href", "/search?q=kan");
  });

  it("does not request results for a one-character query", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchBar />);
    await user.type(screen.getByRole("combobox"), "k");
    act(() => jest.advanceTimersByTime(300));
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
