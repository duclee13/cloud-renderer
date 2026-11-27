import React from "react";
import { staticFile } from "remotion";

const WEIGHTS = [400, 600, 700, 800, 900] as const;

const SUBSETS = [
  {
    key: "vietnamese",
    range:
      "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB",
  },
  {
    key: "latin-ext",
    range:
      "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF",
  },
  {
    key: "latin",
    range:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  },
] as const;

/**
 * Generates 100% offline @font-face declarations served from `public/fonts/` via Remotion `staticFile()`.
 * Zero external requests to Google Fonts — prevents 20-VM NAT rate-limiting & font network timeouts!
 */
export function buildLocalBeVietnamProCss(): string {
  const rules: string[] = [];
  for (const w of WEIGHTS) {
    for (const s of SUBSETS) {
      const url = staticFile(`fonts/be-vietnam-pro-${w}-${s.key}.woff2`);
      rules.push(
        `@font-face{font-family:'Be Vietnam Pro';font-style:normal;font-weight:${w};font-display:block;src:local('Be Vietnam Pro'),url('${url}') format('woff2');unicode-range:${s.range};}`
      );
    }
  }
  return rules.join("\n");
}

export const LocalBeVietnamProFontStyle: React.FC = React.memo(() => {
  const css = React.useMemo(() => buildLocalBeVietnamProCss(), []);
  return React.createElement("style", null, css);
});
LocalBeVietnamProFontStyle.displayName = "LocalBeVietnamProFontStyle";
