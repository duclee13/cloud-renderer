import React from "react";

export type CharacterPreset =
  | "BOY"
  | "GRANDPA"
  | "GRANDMA"
  | "DOCTOR"
  | "NEIGHBOR"
  | "CUSTOM";

export type CharacterArchetype =
  | "default"
  | "oldMan"
  | "girl"
  | "scientist"
  | "boyCrown"
  | "grandpa"
  | "explorerOrange"
  | CharacterPreset;

export type StickmanHairStyle =
  | "NONE"
  | "CURLY_SHORT"
  | "NEAT_SHORT"
  | "BOB"
  | "BUN"
  | "PONYTAIL"
  | "SIDE_GRAY";

export type StickmanOutfitStyle =
  | "STICK"
  | "TSHIRT"
  | "POLO"
  | "CARDIGAN"
  | "VEST"
  | "LAB_COAT"
  | "SCHOOL_UNIFORM";

export type StickmanGlassesStyle = "NONE" | "ROUND" | "RECT";

export type StickmanAppearanceProp = "NONE" | "NOTEBOOK" | "BOOK" | "PHONE";

export interface StickmanAppearance {
  scale?: number;
  hairStyle?: StickmanHairStyle;
  hairColor?: string;
  outfitStyle?: StickmanOutfitStyle;
  outfitColor?: string;
  glasses?: StickmanGlassesStyle;
  mustache?: boolean;
  prop?: StickmanAppearanceProp;
}

export interface ResolvedStickmanAppearance {
  scale: number;
  hairStyle: StickmanHairStyle;
  hairColor: string;
  outfitStyle: StickmanOutfitStyle;
  outfitColor: string;
  glasses: StickmanGlassesStyle;
  mustache: boolean;
  prop: StickmanAppearanceProp;
}

const DEFAULT_OUTFIT_COLORS: Record<StickmanOutfitStyle, string> = {
  STICK: "#141414",
  TSHIRT: "#3B82F6",
  POLO: "#0284C7",
  CARDIGAN: "#EC4899",
  VEST: "#92400E",
  LAB_COAT: "#FFFFFF",
  SCHOOL_UNIFORM: "#FFFFFF",
};

function sanitizeHexColor(raw: string | undefined, fallback: string): string {
  if (typeof raw === "string" && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(raw.trim())) {
    return raw.trim();
  }
  return fallback;
}

export function hasStickmanAppearanceOverrides(appearance?: StickmanAppearance | null): boolean {
  if (!appearance || typeof appearance !== "object") return false;
  return (
    appearance.scale !== undefined ||
    appearance.hairStyle !== undefined ||
    appearance.hairColor !== undefined ||
    appearance.outfitStyle !== undefined ||
    appearance.outfitColor !== undefined ||
    appearance.glasses !== undefined ||
    appearance.mustache !== undefined ||
    appearance.prop !== undefined
  );
}

export function resolvePresetAppearanceDefaults(
  archetype?: CharacterArchetype
): ResolvedStickmanAppearance {
  switch (archetype) {
    case "BOY":
      return {
        scale: 0.76,
        hairStyle: "CURLY_SHORT",
        hairColor: "#1E293B",
        outfitStyle: "STICK",
        outfitColor: "#141414",
        glasses: "NONE",
        mustache: false,
        prop: "NONE",
      };
    case "GRANDPA":
      return {
        scale: 1.0,
        hairStyle: "SIDE_GRAY",
        hairColor: "#E5E7EB",
        outfitStyle: "VEST",
        outfitColor: "#92400E",
        glasses: "NONE",
        mustache: true,
        prop: "NONE",
      };
    case "GRANDMA":
      return {
        scale: 1.0,
        hairStyle: "BUN",
        hairColor: "#E5E7EB",
        outfitStyle: "CARDIGAN",
        outfitColor: "#A855F7",
        glasses: "ROUND",
        mustache: false,
        prop: "NONE",
      };
    case "DOCTOR":
      return {
        scale: 1.0,
        hairStyle: "NEAT_SHORT",
        hairColor: "#1F2937",
        outfitStyle: "LAB_COAT",
        outfitColor: "#FFFFFF",
        glasses: "ROUND",
        mustache: false,
        prop: "NONE",
      };
    default:
      return {
        scale: 1.0,
        hairStyle: "NEAT_SHORT",
        hairColor: "#1E293B",
        outfitStyle: "STICK",
        outfitColor: "#3B82F6",
        glasses: "NONE",
        mustache: false,
        prop: "NONE",
      };
  }
}

export function resolveStickmanAppearance(
  archetype?: CharacterArchetype,
  appearance?: StickmanAppearance | null
): ResolvedStickmanAppearance {
  const base = resolvePresetAppearanceDefaults(archetype);
  if (!appearance) return base;

  const outfitStyle: StickmanOutfitStyle = appearance.outfitStyle ?? base.outfitStyle;
  const fallbackOutfitColor =
    appearance.outfitStyle && appearance.outfitStyle !== base.outfitStyle
      ? DEFAULT_OUTFIT_COLORS[outfitStyle]
      : base.outfitColor;

  return {
    scale:
      appearance.scale !== undefined && Number.isFinite(appearance.scale)
        ? Math.max(0.5, Math.min(1.4, appearance.scale))
        : base.scale,
    hairStyle: appearance.hairStyle ?? base.hairStyle,
    hairColor: sanitizeHexColor(appearance.hairColor, base.hairColor),
    outfitStyle,
    outfitColor: sanitizeHexColor(appearance.outfitColor, fallbackOutfitColor),
    glasses: appearance.glasses ?? base.glasses,
    mustache: appearance.mustache !== undefined ? Boolean(appearance.mustache) : base.mustache,
    prop: appearance.prop ?? base.prop,
  };
}

export interface ArchetypeAccessoryProps {
  archetype?: CharacterArchetype;
  headRadius: number;
  neckY: number;
  hipY: number;
  outlineColor?: string;
}

export const HeadBackAccessories: React.FC<{
  archetype?: CharacterArchetype;
  appearance?: StickmanAppearance;
  headCenterY: number;
  headRadius: number;
  facingDir: 1 | -1;
}> = ({ archetype = "default", appearance, headCenterY, headRadius, facingDir }) => {
  const useParametric = archetype === "CUSTOM" || hasStickmanAppearanceOverrides(appearance);
  if (useParametric) {
    const resolved = resolveStickmanAppearance(archetype, appearance);
    if (resolved.hairStyle === "PONYTAIL") {
      // StickmanRig wrapper already applies horizontal flip by facing, so local -X is ALWAYS behind the head!
      const px = -(headRadius + 16);
      const py = headCenterY - 8;
      return (
        <g id="appearance-hair-ponytail-back">
          <path
            d={`M ${-headRadius + 4} ${headCenterY - 14} C ${px - 8} ${py - 22}, ${px - 22} ${py + 8}, ${px + 4} ${py + 28} C ${px + 18} ${py + 24}, ${-headRadius + 8} ${headCenterY + 6}, ${-headRadius + 4} ${headCenterY - 14} Z`}
            fill={resolved.hairColor}
            stroke="#141414"
            strokeWidth={3.8}
            strokeLinejoin="round"
          />
          <circle
            cx={-(headRadius - 2)}
            cy={headCenterY - 12}
            r={8.5}
            fill="#F472B6"
            stroke="#141414"
            strokeWidth={3.4}
          />
        </g>
      );
    }
    if (resolved.hairStyle === "BOB") {
      return (
        <g id="appearance-hair-bob-back">
          <path
            d={`M ${-headRadius * 1.06} ${headCenterY - 12} C ${-headRadius * 1.16} ${headCenterY + 26}, ${-headRadius * 0.96} ${headCenterY + headRadius * 0.96}, ${-headRadius * 0.42} ${headCenterY + headRadius * 0.92} L ${headRadius * 0.34} ${headCenterY + headRadius * 0.88} C ${headRadius * 0.62} ${headCenterY + headRadius * 0.82}, ${headRadius * 0.72} ${headCenterY + 28}, ${headRadius * 0.64} ${headCenterY} Z`}
            fill={resolved.hairColor}
            stroke="#141414"
            strokeWidth={3.8}
            strokeLinejoin="round"
          />
        </g>
      );
    }
    return null;
  }

  if (archetype === "girl") {
    const px = -facingDir * (headRadius + 18);
    const py = headCenterY - 8;
    return (
      <g id="girl-ponytail">
        <ellipse
          cx={px}
          cy={py}
          rx={28}
          ry={18}
          transform={`rotate(${-20 * facingDir}, ${px}, ${py})`}
          fill="#141414"
        />
        <circle
          cx={-facingDir * (headRadius - 2)}
          cy={headCenterY - 12}
          r={10}
          fill="#F472B6"
          stroke="#141414"
          strokeWidth={5}
        />
      </g>
    );
  }
  return null;
};

export const HeadFrontAccessories: React.FC<{
  archetype?: CharacterArchetype;
  appearance?: StickmanAppearance;
  headCenterY: number;
  headRadius: number;
}> = ({ archetype = "default", appearance, headCenterY, headRadius }) => {
  const useParametric = archetype === "CUSTOM" || hasStickmanAppearanceOverrides(appearance);
  if (useParametric) {
    const resolved = resolveStickmanAppearance(archetype, appearance);
    const hc = resolved.hairColor;

    return (
      <g id="parametric-head-front-accessories">
        {/* 1. Parametric Hair Front */}
        {resolved.hairStyle === "CURLY_SHORT" && (
          <g id="appearance-hair-curly-short">
            <path
              d={`M ${-headRadius * 0.86} ${headCenterY - headRadius * 0.44}
                  C ${-headRadius * 0.90} ${headCenterY - headRadius * 1.10}, ${-headRadius * 0.25} ${headCenterY - headRadius * 1.24}, ${headRadius * 0.24} ${headCenterY - headRadius * 1.14}
                  C ${headRadius * 0.56} ${headCenterY - headRadius * 1.06}, ${headRadius * 0.88} ${headCenterY - headRadius * 0.80}, ${headRadius * 0.86} ${headCenterY - headRadius * 0.44}
                  Q ${headRadius * 0.56} ${headCenterY - headRadius * 0.72} ${headRadius * 0.26} ${headCenterY - headRadius * 0.58}
                  Q ${headRadius * 0.04} ${headCenterY - headRadius * 0.82} ${-headRadius * 0.22} ${headCenterY - headRadius * 0.56}
                  Q ${-headRadius * 0.54} ${headCenterY - headRadius * 0.74} ${-headRadius * 0.86} ${headCenterY - headRadius * 0.44} Z`}
              fill={hc}
              stroke="#141414"
              strokeWidth={3.6}
              strokeLinejoin="round"
            />
            <path
              d={`M ${-headRadius * 0.06} ${headCenterY - headRadius * 1.12}
                  Q ${headRadius * 0.14} ${headCenterY - headRadius * 1.38} ${headRadius * 0.34} ${headCenterY - headRadius * 1.12}`}
              fill={hc}
              stroke="#141414"
              strokeWidth={3.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}

        {resolved.hairStyle === "NEAT_SHORT" && (
          <g id="appearance-hair-neat-short">
            <path
              d={`M ${-headRadius * 0.90} ${headCenterY - headRadius * 0.46}
                  C ${-headRadius * 0.88} ${headCenterY - headRadius * 1.12}, ${headRadius * 0.22} ${headCenterY - headRadius * 1.18}, ${headRadius * 0.86} ${headCenterY - headRadius * 0.54}
                  Q ${headRadius * 0.36} ${headCenterY - headRadius * 0.80} ${-headRadius * 0.18} ${headCenterY - headRadius * 0.68}
                  Q ${-headRadius * 0.56} ${headCenterY - headRadius * 0.72} ${-headRadius * 0.90} ${headCenterY - headRadius * 0.46} Z`}
              fill={hc}
              stroke="#141414"
              strokeWidth={3.6}
              strokeLinejoin="round"
            />
          </g>
        )}

        {resolved.hairStyle === "BOB" && (
          <g id="appearance-hair-bob">
            <path
              d={`M ${-headRadius * 0.96} ${headCenterY + 12}
                  C ${-headRadius * 1.04} ${headCenterY - headRadius * 0.98}, ${-headRadius * 0.32} ${headCenterY - headRadius * 1.16}, ${headRadius * 0.26} ${headCenterY - headRadius * 1.10}
                  C ${headRadius * 0.82} ${headCenterY - headRadius * 1.02}, ${headRadius * 1.02} ${headCenterY - headRadius * 0.48}, ${headRadius * 0.92} ${headCenterY + 6}
                  Q ${headRadius * 0.78} ${headCenterY - headRadius * 0.54} ${headRadius * 0.28} ${headCenterY - headRadius * 0.64}
                  Q ${-headRadius * 0.18} ${headCenterY - headRadius * 0.72} ${-headRadius * 0.68} ${headCenterY - headRadius * 0.44}
                  Q ${-headRadius * 0.84} ${headCenterY - 12} ${-headRadius * 0.96} ${headCenterY + 12} Z`}
              fill={hc}
              stroke="#141414"
              strokeWidth={3.6}
              strokeLinejoin="round"
            />
          </g>
        )}

        {resolved.hairStyle === "BUN" && (
          <g id="appearance-hair-bun">
            <circle
              cx={-6}
              cy={headCenterY - headRadius - 14}
              r={19}
              fill={hc}
              stroke="#141414"
              strokeWidth={3.8}
            />
            <path
              d={`M ${-headRadius * 0.94} ${headCenterY - headRadius * 0.34} A ${headRadius} ${headRadius * 0.82} 0 0 1 ${headRadius * 0.94} ${headCenterY - headRadius * 0.34} Q ${headRadius * 0.3} ${headCenterY - headRadius * 0.72} 0 ${headCenterY - headRadius * 0.56} Q ${-headRadius * 0.3} ${headCenterY - headRadius * 0.72} ${-headRadius * 0.94} ${headCenterY - headRadius * 0.34} Z`}
              fill={hc}
              stroke="#141414"
              strokeWidth={3.8}
              strokeLinejoin="round"
            />
          </g>
        )}

        {resolved.hairStyle === "PONYTAIL" && (
          <g id="appearance-hair-ponytail-front">
            <path
              d={`M ${-headRadius * 0.94} ${headCenterY - headRadius * 0.36}
                  A ${headRadius} ${headRadius * 0.82} 0 0 1 ${headRadius * 0.92} ${headCenterY - headRadius * 0.38}
                  Q ${headRadius * 0.38} ${headCenterY - headRadius * 0.74} ${-headRadius * 0.14} ${headCenterY - headRadius * 0.62}
                  Q ${-headRadius * 0.58} ${headCenterY - headRadius * 0.70} ${-headRadius * 0.94} ${headCenterY - headRadius * 0.36} Z`}
              fill={hc}
              stroke="#141414"
              strokeWidth={3.6}
              strokeLinejoin="round"
            />
          </g>
        )}

        {resolved.hairStyle === "SIDE_GRAY" && (
          <g id="appearance-hair-side-gray">
            <path
              d={`M ${-headRadius * 0.88} ${headCenterY - 26} Q ${-headRadius * 1.28} ${headCenterY - 22} ${-headRadius * 1.22} ${headCenterY - 2} Q ${-headRadius * 1.12} ${headCenterY + 14} ${-headRadius * 0.88} ${headCenterY + 6} Z`}
              fill={hc}
              stroke="#141414"
              strokeWidth={4}
              strokeLinejoin="round"
            />
            <path
              d={`M ${headRadius * 0.88} ${headCenterY - 26} Q ${headRadius * 1.28} ${headCenterY - 22} ${headRadius * 1.22} ${headCenterY - 2} Q ${headRadius * 1.12} ${headCenterY + 14} ${headRadius * 0.88} ${headCenterY + 6} Z`}
              fill={hc}
              stroke="#141414"
              strokeWidth={4}
              strokeLinejoin="round"
            />
          </g>
        )}

        {/* 2. Parametric Glasses */}
        {resolved.glasses === "ROUND" && (
          <g id="appearance-glasses-round">
            <circle cx={-21} cy={headCenterY - 5} r={15} fill="rgba(224,242,254,0.26)" stroke="#141414" strokeWidth={3.2} />
            <circle cx={21} cy={headCenterY - 5} r={15} fill="rgba(224,242,254,0.26)" stroke="#141414" strokeWidth={3.2} />
            <line x1={-6} y1={headCenterY - 5} x2={6} y2={headCenterY - 5} stroke="#141414" strokeWidth={3.2} />
          </g>
        )}
        {resolved.glasses === "RECT" && (
          <g id="appearance-glasses-rect">
            <rect x={-37} y={headCenterY - 17} width={31} height={22} rx={4.5} fill="rgba(224,242,254,0.26)" stroke="#141414" strokeWidth={3.2} />
            <rect x={6} y={headCenterY - 17} width={31} height={22} rx={4.5} fill="rgba(224,242,254,0.26)" stroke="#141414" strokeWidth={3.2} />
            <line x1={-6} y1={headCenterY - 6} x2={6} y2={headCenterY - 6} stroke="#141414" strokeWidth={3.2} />
          </g>
        )}

        {/* 3. Parametric Mustache */}
        {resolved.mustache && (
          <path
            id="appearance-mustache"
            d={`M -2 ${headCenterY + 11} Q -16 ${headCenterY + 7} -24 ${headCenterY + 17} Q -10 ${headCenterY + 22} 0 ${headCenterY + 16} Q 10 ${headCenterY + 22} 24 ${headCenterY + 17} Q 16 ${headCenterY + 7} 2 ${headCenterY + 11} Z`}
            fill={resolved.hairStyle === "SIDE_GRAY" ? "#F3F4F6" : hc}
            stroke="#141414"
            strokeWidth={3}
            strokeLinejoin="round"
          />
        )}
      </g>
    );
  }

  switch (archetype) {
    case "oldMan":
      return (
        <g id="old-man-accessories">
          <path
            d={`M ${-headRadius * 1.05} ${headCenterY - headRadius * 0.55} A ${headRadius * 1.05} ${headRadius * 0.85} 0 0 1 ${headRadius * 1.05} ${headCenterY - headRadius * 0.55} Z`}
            fill="#FACC15"
            stroke="#141414"
            strokeWidth={9}
            strokeLinejoin="round"
          />
          <rect
            x={-headRadius * 1.02}
            y={headCenterY - headRadius * 0.68}
            width={headRadius * 2.04}
            height={12}
            rx={4}
            fill="#EF4444"
            stroke="#141414"
            strokeWidth={6}
          />
          <ellipse
            cx={0}
            cy={headCenterY - headRadius * 0.52}
            rx={headRadius * 1.75}
            ry={11}
            fill="#FACC15"
            stroke="#141414"
            strokeWidth={9}
          />
        </g>
      );

    case "scientist":
      return (
        <g id="scientist-accessories">
          <path
            d={`M ${-headRadius * 0.95} ${headCenterY - headRadius * 0.45} A ${headRadius} ${headRadius * 0.75} 0 0 1 ${headRadius * 0.95} ${headCenterY - headRadius * 0.45} Z`}
            fill="#78350F"
            stroke="#141414"
            strokeWidth={8}
          />
          <circle cx={-22} cy={headCenterY - 4} r={16} fill="rgba(255,255,255,0.25)" stroke="#141414" strokeWidth={6} />
          <circle cx={22} cy={headCenterY - 4} r={16} fill="rgba(255,255,255,0.25)" stroke="#141414" strokeWidth={6} />
          <line x1={-6} y1={headCenterY - 4} x2={6} y2={headCenterY - 4} stroke="#141414" strokeWidth={6} />
        </g>
      );

    case "boyCrown":
      return (
        <path
          d={`M ${-headRadius * 0.9} ${headCenterY - headRadius * 0.45} L ${-headRadius * 0.75} ${headCenterY - headRadius * 1.45} L ${-headRadius * 0.28} ${headCenterY - headRadius * 0.9} L 0 ${headCenterY - headRadius * 1.55} L ${headRadius * 0.28} ${headCenterY - headRadius * 0.9} L ${headRadius * 0.75} ${headCenterY - headRadius * 1.45} L ${headRadius * 0.9} ${headCenterY - headRadius * 0.45} Z`}
          fill="#141414"
          stroke="#141414"
          strokeWidth={6}
          strokeLinejoin="round"
        />
      );

    case "girl":
      return (
        <path
          d={`M ${-headRadius * 0.96} ${headCenterY - headRadius * 0.38} A ${headRadius} ${headRadius * 0.8} 0 0 1 ${headRadius * 0.96} ${headCenterY - headRadius * 0.38} Q 0 ${headCenterY - headRadius * 0.6} ${-headRadius * 0.96} ${headCenterY - headRadius * 0.38} Z`}
          fill="#141414"
        />
      );

    case "grandpa":
      return (
        <g id="grandpa-accessories">
          <ellipse cx={-headRadius * 0.92} cy={headCenterY - 12} rx={16} ry={22} fill="#E5E7EB" stroke="#141414" strokeWidth={6} />
          <ellipse cx={headRadius * 0.92} cy={headCenterY - 12} rx={16} ry={22} fill="#E5E7EB" stroke="#141414" strokeWidth={6} />
        </g>
      );

    case "explorerOrange":
      return (
        <g id="explorer-orange-hair">
          <path
            d={`M ${-headRadius * 0.58} ${headCenterY - headRadius * 0.78} Q ${-headRadius * 0.25} ${
              headCenterY - headRadius * 1.38
            } ${-headRadius * 0.04} ${headCenterY - headRadius * 0.96} Q ${headRadius * 0.2} ${
              headCenterY - headRadius * 1.44
            } ${headRadius * 0.34} ${headCenterY - headRadius * 0.94} Q ${headRadius * 0.62} ${
              headCenterY - headRadius * 1.24
            } ${headRadius * 0.66} ${headCenterY - headRadius * 0.74} Z`}
            fill="#141414"
            stroke="#141414"
            strokeWidth={5}
            strokeLinejoin="round"
          />
        </g>
      );

    case "BOY":
      return (
        <g id="preset-boy-hair">
          <path
            d={`M ${-headRadius * 0.86} ${headCenterY - headRadius * 0.44}
                C ${-headRadius * 0.90} ${headCenterY - headRadius * 1.10}, ${-headRadius * 0.25} ${headCenterY - headRadius * 1.24}, ${headRadius * 0.24} ${headCenterY - headRadius * 1.14}
                C ${headRadius * 0.56} ${headCenterY - headRadius * 1.06}, ${headRadius * 0.88} ${headCenterY - headRadius * 0.80}, ${headRadius * 0.86} ${headCenterY - headRadius * 0.44}
                Q ${headRadius * 0.56} ${headCenterY - headRadius * 0.72} ${headRadius * 0.26} ${headCenterY - headRadius * 0.58}
                Q ${headRadius * 0.04} ${headCenterY - headRadius * 0.82} ${-headRadius * 0.22} ${headCenterY - headRadius * 0.56}
                Q ${-headRadius * 0.54} ${headCenterY - headRadius * 0.74} ${-headRadius * 0.86} ${headCenterY - headRadius * 0.44} Z`}
            fill="#1E293B"
            stroke="#141414"
            strokeWidth={3.6}
            strokeLinejoin="round"
          />
          <path
            d={`M ${-headRadius * 0.06} ${headCenterY - headRadius * 1.12}
                Q ${headRadius * 0.14} ${headCenterY - headRadius * 1.38} ${headRadius * 0.34} ${headCenterY - headRadius * 1.12}`}
            fill="#1E293B"
            stroke="#141414"
            strokeWidth={3.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );

    case "GRANDPA":
      return (
        <g id="preset-grandpa-features">
          <path
            d={`M ${-headRadius * 0.88} ${headCenterY - 26} Q ${-headRadius * 1.28} ${headCenterY - 22} ${-headRadius * 1.22} ${headCenterY - 2} Q ${-headRadius * 1.12} ${headCenterY + 14} ${-headRadius * 0.88} ${headCenterY + 6} Z`}
            fill="#E5E7EB"
            stroke="#141414"
            strokeWidth={4}
            strokeLinejoin="round"
          />
          <path
            d={`M ${headRadius * 0.88} ${headCenterY - 26} Q ${headRadius * 1.28} ${headCenterY - 22} ${headRadius * 1.22} ${headCenterY - 2} Q ${headRadius * 1.12} ${headCenterY + 14} ${headRadius * 0.88} ${headCenterY + 6} Z`}
            fill="#E5E7EB"
            stroke="#141414"
            strokeWidth={4}
            strokeLinejoin="round"
          />
          <path
            d={`M -2 ${headCenterY + 11} Q -16 ${headCenterY + 7} -24 ${headCenterY + 17} Q -10 ${headCenterY + 22} 0 ${headCenterY + 16} Q 10 ${headCenterY + 22} 24 ${headCenterY + 17} Q 16 ${headCenterY + 7} 2 ${headCenterY + 11} Z`}
            fill="#F3F4F6"
            stroke="#141414"
            strokeWidth={3}
            strokeLinejoin="round"
          />
        </g>
      );

    case "GRANDMA":
      return (
        <g id="preset-grandma-features">
          <circle
            cx={0}
            cy={headCenterY - headRadius - 14}
            r={20}
            fill="#E5E7EB"
            stroke="#141414"
            strokeWidth={4}
          />
          <path
            d={`M ${-headRadius * 0.94} ${headCenterY - headRadius * 0.34} A ${headRadius} ${headRadius * 0.82} 0 0 1 ${headRadius * 0.94} ${headCenterY - headRadius * 0.34} Q ${headRadius * 0.3} ${headCenterY - headRadius * 0.72} 0 ${headCenterY - headRadius * 0.56} Q ${-headRadius * 0.3} ${headCenterY - headRadius * 0.72} ${-headRadius * 0.94} ${headCenterY - headRadius * 0.34} Z`}
            fill="#E5E7EB"
            stroke="#141414"
            strokeWidth={3.8}
            strokeLinejoin="round"
          />
          <circle cx={-21} cy={headCenterY - 5} r={15.5} fill="rgba(255,255,255,0.25)" stroke="#141414" strokeWidth={3.4} />
          <circle cx={21} cy={headCenterY - 5} r={15.5} fill="rgba(255,255,255,0.25)" stroke="#141414" strokeWidth={3.4} />
          <line x1={-5.5} y1={headCenterY - 5} x2={5.5} y2={headCenterY - 5} stroke="#141414" strokeWidth={3.4} />
        </g>
      );

    case "DOCTOR":
      return (
        <g id="preset-doctor-features">
          <path
            d={`M ${-headRadius * 0.86} ${headCenterY - headRadius * 0.55} Q ${-headRadius * 0.2} ${headCenterY - headRadius * 1.18} ${headRadius * 0.78} ${headCenterY - headRadius * 0.62} Q ${headRadius * 0.2} ${headCenterY - headRadius * 0.82} ${-headRadius * 0.86} ${headCenterY - headRadius * 0.55} Z`}
            fill="#1F2937"
            stroke="#141414"
            strokeWidth={3.5}
            strokeLinejoin="round"
          />
          <circle cx={-21} cy={headCenterY - 5} r={15} fill="rgba(224,242,254,0.28)" stroke="#141414" strokeWidth={3.2} />
          <circle cx={21} cy={headCenterY - 5} r={15} fill="rgba(224,242,254,0.28)" stroke="#141414" strokeWidth={3.2} />
          <line x1={-6} y1={headCenterY - 5} x2={6} y2={headCenterY - 5} stroke="#141414" strokeWidth={3.2} />
        </g>
      );

    case "NEIGHBOR":
      return (
        <g id="preset-neighbor-cap">
          <path
            d={`M ${-headRadius * 0.94} ${headCenterY - headRadius * 0.44} A ${headRadius * 0.95} ${headRadius * 0.72} 0 0 1 ${headRadius * 0.92} ${headCenterY - headRadius * 0.44} Z`}
            fill="#2563EB"
            stroke="#141414"
            strokeWidth={4}
            strokeLinejoin="round"
          />
          <path
            d={`M ${headRadius * 0.15} ${headCenterY - headRadius * 0.46} Q ${headRadius * 1.05} ${headCenterY - headRadius * 0.52} ${headRadius * 1.48} ${headCenterY - headRadius * 0.34} Q ${headRadius * 0.95} ${headCenterY - headRadius * 0.24} ${headRadius * 0.15} ${headCenterY - headRadius * 0.38} Z`}
            fill="#1D4ED8"
            stroke="#141414"
            strokeWidth={3.8}
            strokeLinejoin="round"
          />
          <circle cx={0} cy={headCenterY - headRadius * 1.12} r={5} fill="#1E3A8A" stroke="#141414" strokeWidth={2.5} />
        </g>
      );

    default:
      return null;
  }
};

export const TorsoOutfitRenderer: React.FC<{
  archetype?: CharacterArchetype;
  appearance?: StickmanAppearance;
  neckX: number;
  neckY: number;
  hipX: number;
  hipY: number;
  strokeWidth?: number;
}> = ({ archetype, appearance, neckX, neckY, hipX, hipY, strokeWidth = 12 }) => {
  const useParametric = archetype === "CUSTOM" || hasStickmanAppearanceOverrides(appearance);
  if (useParametric) {
    const resolved = resolveStickmanAppearance(archetype, appearance);
    const oc = resolved.outfitColor;

    if (resolved.outfitStyle === "STICK") {
      return (
        <line
          id="appearance-outfit-stick"
          x1={neckX}
          y1={neckY}
          x2={hipX}
          y2={hipY}
          stroke="#141414"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      );
    }

    if (resolved.outfitStyle === "TSHIRT") {
      return (
        <g id="appearance-outfit-tshirt">
          <line x1={neckX} y1={neckY} x2={hipX} y2={hipY} stroke="#141414" strokeWidth={strokeWidth} strokeLinecap="round" />
          <path
            d={`M ${neckX - 18} ${neckY + 14} Q ${neckX} ${neckY + 8} ${neckX + 18} ${neckY + 14} L ${hipX + 24} ${hipY + 8} Q ${hipX} ${hipY + 14} ${hipX - 24} ${hipY + 8} Z`}
            fill={oc}
            stroke="#141414"
            strokeWidth={3.8}
            strokeLinejoin="round"
          />
          <path
            d={`M ${neckX - 11} ${neckY + 14} Q ${neckX} ${neckY + 23} ${neckX + 11} ${neckY + 14}`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.85}
          />
        </g>
      );
    }

    if (resolved.outfitStyle === "POLO") {
      return (
        <g id="appearance-outfit-polo">
          <line x1={neckX} y1={neckY} x2={hipX} y2={hipY} stroke="#141414" strokeWidth={strokeWidth} strokeLinecap="round" />
          <path
            d={`M ${neckX - 18} ${neckY + 14} Q ${neckX} ${neckY + 8} ${neckX + 18} ${neckY + 14} L ${hipX + 25} ${hipY + 10} Q ${hipX} ${hipY + 15} ${hipX - 25} ${hipY + 10} Z`}
            fill={oc}
            stroke="#141414"
            strokeWidth={3.8}
            strokeLinejoin="round"
          />
          {/* Crisp Polo Collar & Placket */}
          <polygon
            points={`${neckX - 13},${neckY + 13} ${neckX - 3},${neckY + 24} ${neckX - 15},${neckY + 27}`}
            fill="#F8FAFC"
            stroke="#141414"
            strokeWidth={2.4}
            strokeLinejoin="round"
          />
          <polygon
            points={`${neckX + 13},${neckY + 13} ${neckX + 3},${neckY + 24} ${neckX + 15},${neckY + 27}`}
            fill="#F8FAFC"
            stroke="#141414"
            strokeWidth={2.4}
            strokeLinejoin="round"
          />
          <line x1={neckX} y1={neckY + 22} x2={neckX} y2={neckY + 48} stroke="#141414" strokeWidth={2.5} strokeLinecap="round" />
          <circle cx={neckX} cy={neckY + 32} r={2.2} fill="#FFFFFF" />
          <circle cx={neckX} cy={neckY + 42} r={2.2} fill="#FFFFFF" />
        </g>
      );
    }

    if (resolved.outfitStyle === "CARDIGAN") {
      return (
        <g id="appearance-outfit-cardigan">
          <line x1={neckX} y1={neckY} x2={hipX} y2={hipY} stroke="#141414" strokeWidth={strokeWidth} strokeLinecap="round" />
          <path
            d={`M ${neckX - 17} ${neckY + 15} Q ${neckX} ${neckY + 9} ${neckX + 17} ${neckY + 15} L ${hipX + 27} ${hipY + 12} Q ${hipX} ${hipY + 18} ${hipX - 27} ${hipY + 12} Z`}
            fill={oc}
            stroke="#141414"
            strokeWidth={3.8}
            strokeLinejoin="round"
          />
          {/* Inner cream blouse panel */}
          <path
            d={`M ${neckX - 7} ${neckY + 14} L ${neckX + 7} ${neckY + 14} L ${hipX + 6} ${hipY + 13} L ${hipX - 6} ${hipY + 13} Z`}
            fill="#FFFBEB"
            stroke="#141414"
            strokeWidth={2.4}
            strokeLinejoin="round"
          />
        </g>
      );
    }

    if (resolved.outfitStyle === "VEST") {
      return (
        <g id="appearance-outfit-vest">
          <line x1={neckX} y1={neckY} x2={hipX} y2={hipY} stroke="#141414" strokeWidth={strokeWidth} strokeLinecap="round" />
          <path
            d={`M ${neckX - 18} ${neckY + 14} Q ${neckX} ${neckY + 8} ${neckX + 18} ${neckY + 14} L ${hipX + 26} ${hipY + 12} Q ${hipX} ${hipY + 18} ${hipX - 26} ${hipY + 12} Z`}
            fill={oc}
            stroke="#141414"
            strokeWidth={3.8}
            strokeLinejoin="round"
          />
          <line x1={neckX + 2} y1={neckY + 16} x2={hipX + 2} y2={hipY + 10} stroke="#141414" strokeWidth={2.4} opacity={0.55} />
          <circle cx={neckX + 2} cy={neckY + 34} r={2.8} fill="#FEF3C7" />
          <circle cx={neckX + 2} cy={neckY + 58} r={2.8} fill="#FEF3C7" />
          <circle cx={neckX + 2} cy={neckY + 82} r={2.8} fill="#FEF3C7" />
        </g>
      );
    }

    if (resolved.outfitStyle === "LAB_COAT") {
      return (
        <g id="appearance-outfit-lab-coat">
          <line x1={neckX} y1={neckY} x2={hipX} y2={hipY} stroke="#141414" strokeWidth={strokeWidth} strokeLinecap="round" />
          <path
            d={`M ${neckX - 18} ${neckY + 14} Q ${neckX} ${neckY + 8} ${neckX + 18} ${neckY + 14} L ${hipX + 27} ${hipY + 16} Q ${hipX} ${hipY + 20} ${hipX - 27} ${hipY + 16} Z`}
            fill={oc}
            stroke="#141414"
            strokeWidth={3.8}
            strokeLinejoin="round"
          />
          <path
            d={`M ${neckX - 10} ${neckY + 14} L ${neckX} ${neckY + 34} L ${neckX + 10} ${neckY + 14}`}
            fill="#BAE6FD"
            stroke="#141414"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          <path
            d={`M ${neckX - 11} ${neckY + 18} Q ${neckX - 14} ${neckY + 52} ${neckX - 6} ${neckY + 60}`}
            fill="none"
            stroke="#334155"
            strokeWidth={3.5}
            strokeLinecap="round"
          />
          <circle cx={neckX - 6} cy={neckY + 62} r={5.5} fill="#94A3B8" stroke="#141414" strokeWidth={2.2} />
        </g>
      );
    }

    if (resolved.outfitStyle === "SCHOOL_UNIFORM") {
      return (
        <g id="appearance-outfit-school-uniform">
          <line x1={neckX} y1={neckY} x2={hipX} y2={hipY} stroke="#141414" strokeWidth={strokeWidth} strokeLinecap="round" />
          <path
            d={`M ${neckX - 17} ${neckY + 14} Q ${neckX} ${neckY + 8} ${neckX + 17} ${neckY + 14} L ${hipX + 24} ${hipY + 9} Q ${hipX} ${hipY + 14} ${hipX - 24} ${hipY + 9} Z`}
            fill={oc}
            stroke="#141414"
            strokeWidth={3.8}
            strokeLinejoin="round"
          />
          {/* Red student neckerchief (Khăn quàng đỏ học sinh Việt Nam) */}
          <polygon
            points={`${neckX - 15},${neckY + 14} ${neckX + 15},${neckY + 14} ${neckX},${neckY + 32}`}
            fill="#EF4444"
            stroke="#141414"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          <polygon
            points={`${neckX - 3},${neckY + 29} ${neckX + 4},${neckY + 29} ${neckX + 6},${neckY + 52} ${neckX - 2},${neckY + 48}`}
            fill="#DC2626"
            stroke="#141414"
            strokeWidth={2.2}
            strokeLinejoin="round"
          />
        </g>
      );
    }
  }

  if (archetype === "BOY" || archetype === "NEIGHBOR") {
    return (
      <line
        x1={neckX}
        y1={neckY}
        x2={hipX}
        y2={hipY}
        stroke="#141414"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    );
  }

  if (archetype === "GRANDPA") {
    return (
      <g id="preset-grandpa-tunic">
        <line x1={neckX} y1={neckY} x2={hipX} y2={hipY} stroke="#141414" strokeWidth={strokeWidth} strokeLinecap="round" />
        <path
          d={`M ${neckX - 18} ${neckY + 14} Q ${neckX} ${neckY + 8} ${neckX + 18} ${neckY + 14} L ${hipX + 26} ${hipY + 12} Q ${hipX} ${hipY + 18} ${hipX - 26} ${hipY + 12} Z`}
          fill="#92400E"
          stroke="#141414"
          strokeWidth={3.8}
          strokeLinejoin="round"
        />
        <line x1={neckX + 2} y1={neckY + 16} x2={hipX + 2} y2={hipY + 10} stroke="#78350F" strokeWidth={2.5} />
        <circle cx={neckX + 2} cy={neckY + 34} r={2.8} fill="#FEF3C7" />
        <circle cx={neckX + 2} cy={neckY + 58} r={2.8} fill="#FEF3C7" />
        <circle cx={neckX + 2} cy={neckY + 82} r={2.8} fill="#FEF3C7" />
      </g>
    );
  }

  if (archetype === "GRANDMA") {
    return (
      <g id="preset-grandma-blouse">
        <line x1={neckX} y1={neckY} x2={hipX} y2={hipY} stroke="#141414" strokeWidth={strokeWidth} strokeLinecap="round" />
        <path
          d={`M ${neckX - 16} ${neckY + 15} Q ${neckX} ${neckY + 9} ${neckX + 16} ${neckY + 15} L ${hipX + 28} ${hipY + 12} Q ${hipX} ${hipY + 19} ${hipX - 28} ${hipY + 12} Z`}
          fill="#A855F7"
          stroke="#141414"
          strokeWidth={3.8}
          strokeLinejoin="round"
        />
        <path
          d={`M ${neckX - 11} ${neckY + 15} Q ${neckX} ${neckY + 25} ${neckX + 11} ${neckY + 15}`}
          fill="none"
          stroke="#F3E8FF"
          strokeWidth={3.2}
          strokeLinecap="round"
        />
      </g>
    );
  }

  if (archetype === "DOCTOR") {
    return (
      <g id="preset-doctor-coat">
        <line x1={neckX} y1={neckY} x2={hipX} y2={hipY} stroke="#141414" strokeWidth={strokeWidth} strokeLinecap="round" />
        <path
          d={`M ${neckX - 18} ${neckY + 14} Q ${neckX} ${neckY + 8} ${neckX + 18} ${neckY + 14} L ${hipX + 27} ${hipY + 16} Q ${hipX} ${hipY + 20} ${hipX - 27} ${hipY + 16} Z`}
          fill="#FFFFFF"
          stroke="#141414"
          strokeWidth={3.8}
          strokeLinejoin="round"
        />
        <path
          d={`M ${neckX - 10} ${neckY + 14} L ${neckX} ${neckY + 34} L ${neckX + 10} ${neckY + 14}`}
          fill="#BAE6FD"
          stroke="#141414"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        <path
          d={`M ${neckX - 11} ${neckY + 18} Q ${neckX - 14} ${neckY + 52} ${neckX - 6} ${neckY + 60}`}
          fill="none"
          stroke="#334155"
          strokeWidth={3.5}
          strokeLinecap="round"
        />
        <circle cx={neckX - 6} cy={neckY + 62} r={5.5} fill="#94A3B8" stroke="#141414" strokeWidth={2.2} />
      </g>
    );
  }

  if (archetype === "explorerOrange") {
    return (
      <g id="explorer-orange-shirt">
        <line
          x1={neckX}
          y1={neckY}
          x2={hipX}
          y2={hipY}
          stroke="#141414"
          strokeWidth={12}
          strokeLinecap="round"
        />
        <path
          d={`M ${neckX - 24} ${neckY + 14} Q ${neckX} ${neckY + 6} ${neckX + 24} ${neckY + 14} L ${
            hipX + 30
          } ${hipY + 4} Q ${hipX} ${hipY + 12} ${hipX - 30} ${hipY + 4} Z`}
          fill="#F97316"
          stroke="#141414"
          strokeWidth={6}
          strokeLinejoin="round"
        />
        <path
          d={`M ${neckX - 20} ${neckY + 16} L ${hipX - 26} ${hipY + 2} L ${hipX - 10} ${hipY + 6} L ${
            neckX - 8
          } ${neckY + 14} Z`}
          fill="#EA580C"
          opacity={0.75}
        />
        <path
          d={`M ${neckX - 13} ${neckY + 13} Q ${neckX} ${neckY + 24} ${neckX + 13} ${neckY + 13}`}
          fill="none"
          stroke="#FEF3C7"
          strokeWidth={4}
          strokeLinecap="round"
        />
      </g>
    );
  }

  return (
    <line
      x1={neckX}
      y1={neckY}
      x2={hipX}
      y2={hipY}
      stroke="#141414"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  );
};

export const BuiltInAppearancePropRenderer: React.FC<{
  prop?: StickmanAppearanceProp;
  wristX: number;
  wristY: number;
}> = ({ prop, wristX, wristY }) => {
  if (!prop || prop === "NONE") return null;
  return (
    <g id={`appearance-prop-${prop.toLowerCase()}`} transform={`translate(${wristX.toFixed(1)}, ${wristY.toFixed(1)})`}>
      {prop === "NOTEBOOK" && (
        <g transform="translate(18, -8) rotate(-8)">
          <rect x={-20} y={-26} width={40} height={52} rx={5} fill="#FEF9C3" stroke="#141414" strokeWidth={3} />
          <line x1={-12} y1={-11} x2={12} y2={-11} stroke="#64748B" strokeWidth={2.4} />
          <line x1={-12} y1={2} x2={11} y2={2} stroke="#64748B" strokeWidth={2.4} />
          <line x1={-12} y1={15} x2={9} y2={15} stroke="#64748B" strokeWidth={2.4} />
        </g>
      )}
      {prop === "BOOK" && (
        <g transform="translate(18, -8) rotate(-10)">
          <rect x={-22} y={-28} width={44} height={54} rx={5} fill="#2563EB" stroke="#141414" strokeWidth={3.2} />
          <rect x={-22} y={-28} width={9} height={54} rx={3} fill="#1E40AF" stroke="#141414" strokeWidth={2.8} />
          <rect x={-7} y={-16} width={20} height={12} rx={2} fill="#FEF08A" stroke="#141414" strokeWidth={2} />
        </g>
      )}
      {prop === "PHONE" && (
        <g transform="translate(14, -14) rotate(-14)">
          <rect x={-14} y={-24} width={28} height={48} rx={5} fill="#1E293B" stroke="#141414" strokeWidth={3} />
          <rect x={-10} y={-18} width={20} height={34} rx={2} fill="#38BDF8" />
        </g>
      )}
    </g>
  );
};
