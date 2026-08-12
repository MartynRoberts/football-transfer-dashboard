import { getClubLogoUrl } from "./club-logo-url";
import { normalizeRemoteImageUrl } from "./normalize-remote-image-url";

describe("image URL handling", () => {
  it("normalizes duplicated path separators", () => {
    expect(normalizeRemoteImageUrl("https://tmssl.akamaized.net//images//405.png")).toBe("https://tmssl.akamaized.net/images/405.png");
  });

  it("leaves non-URL fallback values unchanged", () => {
    expect(normalizeRemoteImageUrl("not-a-url")).toBe("not-a-url");
  });

  it("builds a same-origin encoded badge URL", () => {
    expect(getClubLogoUrl("https://tmssl.akamaized.net//images/405.png")).toBe("/api/images/club-logo?url=https%3A%2F%2Ftmssl.akamaized.net%2Fimages%2F405.png");
  });
});
