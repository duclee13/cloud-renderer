import React from "react";

export type CharacterPreset =
  | "BOY"
  | "GRANDPA"
  | "GRANDMA"
  | "DOCTOR"
  | "NEIGHBOR";

export type CharacterArchetype =
  | "default"
  | "oldMan"
  | "girl"
  | "scientist"
  | "boyCrown"
  | "grandpa"
  | "explorerOrange"
  | CharacterPreset;

export interface ArchetypeAccessoryProps {
  archetype?: CharacterArchetype;
  headRadius: number;
  neckY: number;
  hipY: number;
  outlineColor?: string;
}

export const HeadBackAccessories: React.FC<{
  archetype?: CharacterArchetype;
  headCenterY: number;
  headRadius: number;
  facingDir: 1 | -1;
}> = ({ archetype = "default", headCenterY, headRadius, facingDir }) => {
  if (archetype === "girl") {
    // Tóc buộc đuôi ngựa phía sau đầu
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
  headCenterY: number;
  headRadius: number;
}> = ({ archetype = "default", headCenterY, headRadius }) => {
  switch (archetype) {
    case "oldMan":
      return (
        <g id="old-man-accessories">
          {/* Mũ rơm vàng vành rộng có đai đỏ */}
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
          {/* Tóc nâu lịch lãm */}
          <path
            d={`M ${-headRadius * 0.95} ${headCenterY - headRadius * 0.45} A ${headRadius} ${headRadius * 0.75} 0 0 1 ${headRadius * 0.95} ${headCenterY - headRadius * 0.45} Z`}
            fill="#78350F"
            stroke="#141414"
            strokeWidth={8}
          />
          {/* Cặp kính tròn tri thức */}
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
          {/* Chùm tóc bạc hai bên thái dương */}
          <ellipse cx={-headRadius * 0.92} cy={headCenterY - 12} rx={16} ry={22} fill="#E5E7EB" stroke="#141414" strokeWidth={6} />
          <ellipse cx={headRadius * 0.92} cy={headCenterY - 12} rx={16} ry={22} fill="#E5E7EB" stroke="#141414" strokeWidth={6} />
        </g>
      );

    case "explorerOrange":
      return (
        <g id="explorer-orange-hair">
          {/* Chỏm tóc đen năng động giống nhân vật Tèo trong video mẫu */}
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
          {/* V14.0 BOY: 4 chỏm tóc nhọn năng động trên đỉnh đầu người que thuần */}
          <path
            d={`M ${-headRadius * 0.62} ${headCenterY - headRadius * 0.78}
                Q ${-headRadius * 0.44} ${headCenterY - headRadius * 1.36} ${-headRadius * 0.18} ${headCenterY - headRadius * 0.96}
                Q ${-headRadius * 0.02} ${headCenterY - headRadius * 1.50} ${headRadius * 0.16} ${headCenterY - headRadius * 0.98}
                Q ${headRadius * 0.38} ${headCenterY - headRadius * 1.40} ${headRadius * 0.46} ${headCenterY - headRadius * 0.92}
                Q ${headRadius * 0.68} ${headCenterY - headRadius * 1.18} ${headRadius * 0.66} ${headCenterY - headRadius * 0.76}
                Q 0 ${headCenterY - headRadius * 0.88} ${-headRadius * 0.62} ${headCenterY - headRadius * 0.78} Z`}
            fill="#141414"
            stroke="#141414"
            strokeWidth={3.5}
            strokeLinejoin="round"
          />
        </g>
      );

    case "GRANDPA":
      return (
        <g id="preset-grandpa-features">
          {/* 2 chỏm tóc bạc mềm hai bên thái dương */}
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
          {/* Râu mép trắng hiền hậu ôm trên khóe miệng */}
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
          {/* Búi tóc bạc tròn trên đỉnh đầu */}
          <circle
            cx={0}
            cy={headCenterY - headRadius - 14}
            r={20}
            fill="#E5E7EB"
            stroke="#141414"
            strokeWidth={4}
          />
          {/* Tóc mái rẽ ngôi mềm mại màu bạc */}
          <path
            d={`M ${-headRadius * 0.94} ${headCenterY - headRadius * 0.34} A ${headRadius} ${headRadius * 0.82} 0 0 1 ${headRadius * 0.94} ${headCenterY - headRadius * 0.34} Q ${headRadius * 0.3} ${headCenterY - headRadius * 0.72} 0 ${headCenterY - headRadius * 0.56} Q ${-headRadius * 0.3} ${headCenterY - headRadius * 0.72} ${-headRadius * 0.94} ${headCenterY - headRadius * 0.34} Z`}
            fill="#E5E7EB"
            stroke="#141414"
            strokeWidth={3.8}
            strokeLinejoin="round"
          />
          {/* Cặp kính tròn hiền hậu */}
          <circle cx={-16} cy={headCenterY - 4} r={14} fill="rgba(255,255,255,0.28)" stroke="#141414" strokeWidth={3.5} />
          <circle cx={18} cy={headCenterY - 4} r={14} fill="rgba(255,255,255,0.28)" stroke="#141414" strokeWidth={3.5} />
          <line x1={-2} y1={headCenterY - 4} x2={4} y2={headCenterY - 4} stroke="#141414" strokeWidth={3.5} />
        </g>
      );

    case "DOCTOR":
      return (
        <g id="preset-doctor-features">
          {/* Tóc gọn gàng & kính tròn bác sĩ */}
          <path
            d={`M ${-headRadius * 0.86} ${headCenterY - headRadius * 0.55} Q ${-headRadius * 0.2} ${headCenterY - headRadius * 1.18} ${headRadius * 0.78} ${headCenterY - headRadius * 0.62} Q ${headRadius * 0.2} ${headCenterY - headRadius * 0.82} ${-headRadius * 0.86} ${headCenterY - headRadius * 0.55} Z`}
            fill="#1F2937"
            stroke="#141414"
            strokeWidth={3.5}
            strokeLinejoin="round"
          />
          <circle cx={-16} cy={headCenterY - 4} r={13} fill="rgba(224,242,254,0.32)" stroke="#141414" strokeWidth={3.2} />
          <circle cx={18} cy={headCenterY - 4} r={13} fill="rgba(224,242,254,0.32)" stroke="#141414" strokeWidth={3.2} />
          <line x1={-3} y1={headCenterY - 4} x2={5} y2={headCenterY - 4} stroke="#141414" strokeWidth={3.2} />
        </g>
      );

    case "NEIGHBOR":
      return (
        <g id="preset-neighbor-cap">
          {/* Mũ lưỡi trai xanh năng động hướng về phía trước (+X) */}
          <path
            d={`M ${-headRadius * 0.94} ${headCenterY - headRadius * 0.44} A ${headRadius * 0.95} ${headRadius * 0.72} 0 0 1 ${headRadius * 0.92} ${headCenterY - headRadius * 0.44} Z`}
            fill="#2563EB"
            stroke="#141414"
            strokeWidth={4}
            strokeLinejoin="round"
          />
          {/* Vành lưỡi trai vươn về phía mặt */}
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
  neckX: number;
  neckY: number;
  hipX: number;
  hipY: number;
  strokeWidth?: number;
}> = ({ archetype, neckX, neckY, hipX, hipY, strokeWidth = 12 }) => {
  if (archetype === "BOY" || archetype === "NEIGHBOR") {
    // V14.0: Người que thuần — chỉ 1 nét thân đen đặc tròn gọn (strokeWidth = 6px), không hình khối áo chữ nhật thô!
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
    // Áo bà ba / áo nâu dài đơn giản thân thiện của Ông Nội
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
        {/* Hàng cúc nhỏ đơn giản trước ngực */}
        <line x1={neckX + 2} y1={neckY + 16} x2={hipX + 2} y2={hipY + 10} stroke="#78350F" strokeWidth={2.5} />
        <circle cx={neckX + 2} cy={neckY + 34} r={2.8} fill="#FEF3C7" />
        <circle cx={neckX + 2} cy={neckY + 58} r={2.8} fill="#FEF3C7" />
        <circle cx={neckX + 2} cy={neckY + 82} r={2.8} fill="#FEF3C7" />
      </g>
    );
  }

  if (archetype === "GRANDMA") {
    // Áo bà ngoại dáng mềm mại hiền hậu (tím hoa cà nhạt)
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
    // Áo blouse trắng đơn giản + ống nghe đeo cổ
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
        {/* Cổ áo V + ống nghe y tế */}
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
    // Áo thun cam nổi bật (Tèo áo cam chuẩn video mẫu) với bóng đổ cel-shading & viền đen đậm
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
        {/* Thân áo thun cam phủ từ vai xuống hông */}
        <path
          d={`M ${neckX - 24} ${neckY + 14} Q ${neckX} ${neckY + 6} ${neckX + 24} ${neckY + 14} L ${
            hipX + 30
          } ${hipY + 4} Q ${hipX} ${hipY + 12} ${hipX - 30} ${hipY + 4} Z`}
          fill="#F97316"
          stroke="#141414"
          strokeWidth={6}
          strokeLinejoin="round"
        />
        {/* Vệt bóng cel-shading cam đậm bên trái thân áo */}
        <path
          d={`M ${neckX - 20} ${neckY + 16} L ${hipX - 26} ${hipY + 2} L ${hipX - 10} ${hipY + 6} L ${
            neckX - 8
          } ${neckY + 14} Z`}
          fill="#EA580C"
          opacity={0.75}
        />
        {/* Cổ áo tròn trắng nhẹ */}
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

  // Thân người que LUÔN LUÔN chỉ là 1 đường thẳng duy nhất (chuẩn 6 bộ phận cơ bản)
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
