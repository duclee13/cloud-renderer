import React from "react";

export interface LocationCardProps {
  x?: number;
  y?: number;
  title: string;
  width?: number;
  height?: number;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  x = 0,
  y = 0,
  title,
  width = 440,
  height = 100,
}) => {
  return (
    <g transform={`translate(${x}, ${y})`} id="infographic-location-card">
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        rx={18}
        fill="#FEF3C7"
        stroke="#141414"
        strokeWidth={8}
      />
      <text
        x={0}
        y={10}
        textAnchor="middle"
        fontFamily="sans-serif"
        fontSize={32}
        fontWeight="900"
        fill="#141414"
        letterSpacing={2}
      >
        {title}
      </text>
    </g>
  );
};

export interface ProfileCardProps {
  x?: number;
  y?: number;
  headerTitle: string;
  attributes: string[]; // e.g. ["Tuổi thọ: 60 năm", "Nặng: ~4 kg"]
  width?: number;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  x = 0,
  y = 0,
  headerTitle,
  attributes,
  width = 460,
}) => {
  const headerHeight = 48;
  const bodyHeight = 56;
  const totalHeight = headerHeight + bodyHeight;

  return (
    <g transform={`translate(${x}, ${y})`} id="infographic-profile-card">
      {/* Khung thân dưới màu trắng viền đen */}
      <rect
        x={-width / 2}
        y={-totalHeight / 2}
        width={width}
        height={totalHeight}
        rx={14}
        fill="#FFFFFF"
        stroke="#141414"
        strokeWidth={8}
      />
      {/* Khung tiêu đề xanh dương trên cùng */}
      <path
        d={`M ${-width / 2} ${-totalHeight / 2 + 14} A 14 14 0 0 1 ${-width / 2 + 14} ${-totalHeight / 2} L ${width / 2 - 14} ${-totalHeight / 2} A 14 14 0 0 1 ${width / 2} ${-totalHeight / 2 + 14} L ${width / 2} ${-totalHeight / 2 + headerHeight} L ${-width / 2} ${-totalHeight / 2 + headerHeight} Z`}
        fill="#2563EB"
        stroke="#141414"
        strokeWidth={8}
      />
      {/* Tiêu đề hồ sơ */}
      <text
        x={0}
        y={-totalHeight / 2 + 32}
        textAnchor="middle"
        fontFamily="sans-serif"
        fontSize={20}
        fontWeight="900"
        fill="#FFFFFF"
        letterSpacing={1.5}
      >
        {headerTitle}
      </text>
      {/* Nội dung thông số */}
      <text
        x={0}
        y={totalHeight / 2 - 20}
        textAnchor="middle"
        fontFamily="sans-serif"
        fontSize={16}
        fontWeight="700"
        fill="#1E293B"
      >
        {attributes.join("   |   ")}
      </text>
    </g>
  );
};

export interface PodiumRankingProps {
  x?: number;
  y?: number;
  scale?: number;
  firstLabel?: string;
  secondLabel?: string;
  thirdLabel?: string;
}

export const PodiumRanking: React.FC<PodiumRankingProps> = ({
  x = 0,
  y = 0,
  scale = 1,
  firstLabel = "1",
  secondLabel = "2",
  thirdLabel = "3",
}) => {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} id="infographic-podium-ranking">
      {/* Bục hạng 2 (Bên trái, Bạc, Chiều cao 160) */}
      <rect
        x={-190}
        y={-160}
        width={120}
        height={160}
        fill="#94A3B8"
        stroke="#141414"
        strokeWidth={8}
        strokeLinejoin="round"
      />
      <text
        x={-130}
        y={-90}
        textAnchor="middle"
        fontFamily="sans-serif"
        fontSize={44}
        fontWeight="900"
        fill="#FFFFFF"
      >
        {secondLabel}
      </text>

      {/* Bục hạng 3 (Bên phải, Đồng, Chiều cao 120) */}
      <rect
        x={70}
        y={-120}
        width={120}
        height={120}
        fill="#D97706"
        stroke="#141414"
        strokeWidth={8}
        strokeLinejoin="round"
      />
      <text
        x={130}
        y={-55}
        textAnchor="middle"
        fontFamily="sans-serif"
        fontSize={44}
        fontWeight="900"
        fill="#FFFFFF"
      >
        {thirdLabel}
      </text>

      {/* Bục hạng 1 (Ở giữa, Vàng, Chiều cao 240) */}
      <rect
        x={-70}
        y={-240}
        width={140}
        height={240}
        fill="#F59E0B"
        stroke="#141414"
        strokeWidth={8}
        strokeLinejoin="round"
      />
      <text
        x={0}
        y={-145}
        textAnchor="middle"
        fontFamily="sans-serif"
        fontSize={54}
        fontWeight="900"
        fill="#141414"
      >
        {firstLabel}
      </text>
    </g>
  );
};
