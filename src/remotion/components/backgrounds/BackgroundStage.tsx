/**
 * BackgroundStage V7.0: Phông nền đa lớp chất lượng cao (1080p)
 * Hỗ trợ 3 Theme: STUDY_ROOM, SUNSET_PARK, DARK_STUDIO
 * Chuẩn mặt sàn tiếp xúc Y = 840px đồng bộ vật lý 100%
 */

import React from "react";
import { NightGardenBackdrop } from "./FlashlightNightStage";
import {
  CountrysideYardBackdrop,
  BedroomIndoorBackdrop,
  UndergroundCrossSectionStage,
  ExplainerPolkaDotBackdrop,
  SimpleGrassFieldBackdrop,
  LotusPondBackdrop,
} from "../../../components/v7/KassStageLibrary";

export type StageTheme =
  | "STUDY_ROOM"
  | "SUNSET_PARK"
  | "STREET_SOCCER"
  | "DARK_STUDIO"
  | "WAREHOUSE"
  | "BEACH_SUNNY"
  | "GARDEN_DAY"
  | "LIVING_ROOM"
  | "LINED_PAPER"
  | "DOTTED_CREAM"
  | "RADIAL_SUNBURST"
  | "GRID_PAPER"
  | "SOFT_GRAPH_GRID"
  | "WINDOW_SILL_BOKEH"
  | "PASTEL_BRANCH_GARDEN"
  | "DARK_STAGE_FLOOR"
  | "EARTH_BURROW_FLOOR"
  | "NIGHT_GARDEN_FLASHLIGHT"
  | "COUNTRYSIDE_YARD"
  | "BEDROOM_INDOOR"
  | "UNDERGROUND_CROSS_SECTION"
  | "EXPLAINER_POLKA_DOT"
  | "SIMPLE_GRASS_FIELD"
  | "LOTUS_POND_STAGE"
  | "BEDROOM_TANK_STAGE";

export interface BackgroundStageProps {
  theme: StageTheme;
  frame?: number;
  groundY?: number;
}

export const BackgroundStage: React.FC<BackgroundStageProps> = ({
  theme: rawTheme,
  frame = 0,
  groundY = 840,
}) => {
  const width = 1920;
  const height = 1080;
  const theme =
    rawTheme === "STREET_SOCCER"
      ? "SUNSET_PARK"
      : rawTheme === "WAREHOUSE" || rawTheme === "DARK_STAGE_FLOOR" || rawTheme === "EARTH_BURROW_FLOOR"
      ? "DARK_STUDIO"
      : rawTheme;

  if (theme === "NIGHT_GARDEN_FLASHLIGHT") {
    return (
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <NightGardenBackdrop frame={frame} groundY={groundY} />
      </svg>
    );
  }

  if (theme === "COUNTRYSIDE_YARD") {
    return (
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <CountrysideYardBackdrop timeOfDay="DAY" frame={frame} groundY={groundY} />
      </svg>
    );
  }

  if (theme === "BEDROOM_INDOOR" || theme === "BEDROOM_TANK_STAGE") {
    return (
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <BedroomIndoorBackdrop timeOfDay="DAY" frame={frame} groundY={groundY} />
      </svg>
    );
  }

  if (theme === "LOTUS_POND_STAGE") {
    return (
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <LotusPondBackdrop timeOfDay="DAY" frame={frame} groundY={groundY} />
      </svg>
    );
  }

  if (theme === "UNDERGROUND_CROSS_SECTION") {
    return (
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <UndergroundCrossSectionStage frame={frame} localFrame={frame} showAnts={true} />
      </svg>
    );
  }

  if (theme === "EXPLAINER_POLKA_DOT") {
    return (
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <ExplainerPolkaDotBackdrop palette="mint" />
      </svg>
    );
  }

  if (theme === "SIMPLE_GRASS_FIELD") {
    return (
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <SimpleGrassFieldBackdrop timeOfDay="DAY" frame={frame} groundY={groundY} />
      </svg>
    );
  }

  if (theme === "STUDY_ROOM") {
    return (
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <defs>
          <linearGradient id="wall-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FAF7F2" />
            <stop offset="100%" stopColor="#EDE5D8" />
          </linearGradient>
          <linearGradient id="floor-wood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#CDB296" />
            <stop offset="100%" stopColor="#A88B6E" />
          </linearGradient>
          <linearGradient id="sunbeam" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FEF08A" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* 1. Tường phòng học màu kem ấm */}
        <rect x={0} y={0} width={width} height={groundY} fill="url(#wall-grad)" />

        {/* Khung cửa sổ lớn bên trái chiếu nắng */}
        <g id="window-sunlight" transform="translate(180, 220)">
          {/* Khung ngoài */}
          <rect x={0} y={0} width={340} height={420} rx={16} fill="#F8FAFC" stroke="#334155" strokeWidth={10} />
          {/* Bầu trời xanh ngoài cửa sổ */}
          <rect x={16} y={16} width={308} height={388} rx={10} fill="#BAE6FD" />
          {/* Đám mây trắng trôi chậm */}
          <ellipse cx={100 + (frame * 0.2) % 150} cy={120} rx={50} ry={22} fill="#FFFFFF" opacity={0.85} />
          <ellipse cx={130 + (frame * 0.2) % 150} cy={110} rx={40} ry={26} fill="#FFFFFF" opacity={0.85} />
          {/* Khung chữ thập gỗ */}
          <line x1={170} y1={16} x2={170} y2={404} stroke="#334155" strokeWidth={8} />
          <line x1={16} y1={210} x2={324} y2={210} stroke="#334155" strokeWidth={8} />
        </g>

        {/* Luồng nắng chiếu xiên qua cửa sổ */}
        <polygon points="280,360 480,240 1150,840 550,840" fill="url(#sunbeam)" />

        {/* Giá sách trên tường bên phải */}
        <g id="bookshelf" transform="translate(1380, 260)">
          <rect x={0} y={120} width={420} height={20} rx={6} fill="#78350F" stroke="#1E293B" strokeWidth={6} />
          <rect x={0} y={280} width={420} height={20} rx={6} fill="#78350F" stroke="#1E293B" strokeWidth={6} />
          {/* Sách tầng 1 */}
          <rect x={30} y={35} width={28} height={85} rx={4} fill="#EF4444" stroke="#1E293B" strokeWidth={5} />
          <rect x={62} y={20} width={32} height={100} rx={4} fill="#3B82F6" stroke="#1E293B" strokeWidth={5} />
          <rect x={98} y={45} width={24} height={75} rx={4} fill="#10B981" stroke="#1E293B" strokeWidth={5} />
          <rect x={126} y={15} width={36} height={105} rx={4} fill="#F59E0B" stroke="#1E293B" strokeWidth={5} />
          {/* Chậu cây mọng nước nhỏ tầng 1 */}
          <path d="M 320,120 L 330,75 L 365,75 L 375,120 Z" fill="#D97706" stroke="#1E293B" strokeWidth={5} />
          <ellipse cx={348} cy={60} rx={22} ry={18} fill="#22C55E" stroke="#1E293B" strokeWidth={5} />
          <ellipse cx={335} cy={48} rx={16} ry={14} fill="#16A34A" stroke="#1E293B" strokeWidth={4} />
          <ellipse cx={360} cy={50} rx={15} ry={14} fill="#15803D" stroke="#1E293B" strokeWidth={4} />
          {/* Sách tầng 2 */}
          <rect x={40} y={195} width={35} height={85} rx={4} fill="#8B5CF6" stroke="#1E293B" strokeWidth={5} />
          <rect x={80} y={210} width={30} height={70} rx={4} fill="#EC4899" stroke="#1E293B" strokeWidth={5} />
          <rect x={115} y={180} width={26} height={100} rx={4} fill="#06B6D4" stroke="#1E293B" strokeWidth={5} />
          {/* Đồng hồ để bàn nhỏ */}
          <circle cx={320} cy={235} r={32} fill="#F1F5F9" stroke="#1E293B" strokeWidth={6} />
          <line x1={320} y1={235} x2={320} y2={215} stroke="#1E293B" strokeWidth={4} strokeLinecap="round" />
          <line x1={320} y1={235} x2={335} y2={235} stroke="#EF4444" strokeWidth={3} strokeLinecap="round" />
        </g>

        {/* 2. Sàn gỗ ấm áp dưới Y = 840px */}
        <rect x={0} y={groundY} width={width} height={height - groundY} fill="url(#floor-wood)" />
        {/* Phào chỉ chân tường */}
        <rect x={0} y={groundY - 26} width={width} height={26} fill="#E2D9CC" stroke="#1E293B" strokeWidth={4} />
        {/* Đường rãnh ván sàn gỗ */}
        <line x1={0} y1={groundY + 70} x2={width} y2={groundY + 70} stroke="#8B6F50" strokeWidth={3} opacity={0.6} />
        <line x1={0} y1={groundY + 145} x2={width} y2={groundY + 145} stroke="#8B6F50" strokeWidth={3} opacity={0.6} />
        <line x1={320} y1={groundY} x2={320} y2={groundY + 70} stroke="#8B6F50" strokeWidth={3} opacity={0.4} />
        <line x1={850} y1={groundY} x2={850} y2={groundY + 70} stroke="#8B6F50" strokeWidth={3} opacity={0.4} />
        <line x1={1420} y1={groundY} x2={1420} y2={groundY + 70} stroke="#8B6F50" strokeWidth={3} opacity={0.4} />
        <line x1={580} y1={groundY + 70} x2={580} y2={groundY + 145} stroke="#8B6F50" strokeWidth={3} opacity={0.4} />
        <line x1={1150} y1={groundY + 70} x2={1150} y2={groundY + 145} stroke="#8B6F50" strokeWidth={3} opacity={0.4} />

        {/* Đường tiếp xúc sàn chính xác */}
        <line x1={0} y1={groundY} x2={width} y2={groundY} stroke="#1E293B" strokeWidth={5} />
      </svg>
    );
  }

  if (theme === "SUNSET_PARK") {
    return (
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <defs>
          <linearGradient id="sunset-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="45%" stopColor="#FB923C" />
            <stop offset="80%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#FEF08A" />
          </linearGradient>
          <linearGradient id="park-grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#65A30D" />
            <stop offset="100%" stopColor="#4D7C0F" />
          </linearGradient>
          <linearGradient id="sun-glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FDE047" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* 1. Bầu trời hoàng hôn cam hồng rực rỡ */}
        <rect x={0} y={0} width={width} height={groundY} fill="url(#sunset-sky)" />

        {/* Mặt trời lặn to tròn xa xa */}
        <circle cx={1420} cy={520} r={120} fill="url(#sun-glow)" />
        <circle cx={1420} cy={520} r={80} fill="#FFFBEB" />

        {/* Dãy skyline thành phố xa xa (silhouette) */}
        <g id="city-skyline" fill="#7C2D12" opacity={0.35}>
          <rect x={120} y={540} width={70} height={300} />
          <rect x={170} y={490} width={90} height={350} />
          <rect x={240} y={520} width={60} height={320} />
          <rect x={380} y={560} width={110} height={280} />
          <rect x={750} y={510} width={80} height={330} />
          <rect x={810} y={480} width={100} height={360} />
          <rect x={1080} y={530} width={95} height={310} />
          <rect x={1250} y={570} width={120} height={270} />
          <rect x={1580} y={500} width={85} height={340} />
          <rect x={1650} y={530} width={110} height={310} />
        </g>

        {/* Hàng cây công viên lớp giữa (parallax silhouette) */}
        <g id="park-trees-mid" fill="#15803D" opacity={0.75} stroke="#0F172A" strokeWidth={5}>
          <circle cx={280} cy={720} r={75} />
          <circle cx={420} cy={700} r={95} />
          <circle cx={540} cy={730} r={65} />
          <circle cx={980} cy={710} r={85} />
          <circle cx={1100} cy={690} r={90} />
          <circle cx={1680} cy={710} r={105} />
          <circle cx={1800} cy={725} r={80} />
        </g>

        {/* Cột đèn đường cổ điển kiểu công viên ở x = 240 */}
        <g id="park-lamp" transform="translate(240, 520)">
          <line x1={0} y1={320} x2={0} y2={40} stroke="#1E293B" strokeWidth={12} strokeLinecap="round" />
          <path d="M 0,40 C 0,0 45,-15 45,-15" fill="none" stroke="#1E293B" strokeWidth={10} strokeLinecap="round" />
          <polygon points="35,-15 55,-15 50,20 40,20" fill="#FEF08A" stroke="#1E293B" strokeWidth={4} />
          <circle cx={45} cy={5} r={28} fill="#FEF08A" opacity={0.35} />
        </g>

        {/* Ghế đá công viên ở x = 1580 */}
        <g id="park-bench" transform="translate(1580, 750)">
          <rect x={-80} y={40} width={160} height={16} rx={6} fill="#9A3412" stroke="#1E293B" strokeWidth={6} />
          <rect x={-80} y={15} width={160} height={16} rx={6} fill="#9A3412" stroke="#1E293B" strokeWidth={6} />
          <line x1={-60} y1={56} x2={-60} y2={90} stroke="#1E293B" strokeWidth={10} strokeLinecap="round" />
          <line x1={60} y1={56} x2={60} y2={90} stroke="#1E293B" strokeWidth={10} strokeLinecap="round" />
          <line x1={-70} y1={10} x2={-60} y2={56} stroke="#1E293B" strokeWidth={8} />
          <line x1={70} y1={10} x2={60} y2={56} stroke="#1E293B" strokeWidth={8} />
        </g>

        {/* 2. Thảm cỏ công viên và vỉa hè lát đá tại Y = 840px */}
        <rect x={0} y={groundY} width={width} height={height - groundY} fill="url(#park-grass)" />
        {/* Vỉa hè đá lát mỏng */}
        <rect x={0} y={groundY} width={width} height={32} fill="#CBD5E1" stroke="#1E293B" strokeWidth={5} />
        {/* Vạch kẻ chia gạch vỉa hè */}
        {Array.from({ length: 16 }).map((_, i) => (
          <line
            key={`curb_${i}`}
            x1={i * 125}
            y1={groundY}
            x2={i * 125}
            y2={groundY + 32}
            stroke="#64748B"
            strokeWidth={3}
          />
        ))}

        {/* Đường sàn vật lý tiếp xúc Y = 840px */}
        <line x1={0} y1={groundY} x2={width} y2={groundY} stroke="#1E293B" strokeWidth={5} />
      </svg>
    );
  }

  // 4. THEME: BEACH_SUNNY (Bãi biển nắng vàng nhiệt đới)
  if (theme === "BEACH_SUNNY") {
    return (
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <defs>
          <linearGradient id="beach-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="65%" stopColor="#BAE6FD" />
            <stop offset="100%" stopColor="#E0F2FE" />
          </linearGradient>
          <linearGradient id="beach-sand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#EAB308" />
          </linearGradient>
          <linearGradient id="sea-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>

        {/* Bầu trời & Biển xanh */}
        <rect x={0} y={0} width={width} height={groundY} fill="url(#beach-sky)" />
        <circle cx={1550} cy={220} r={75} fill="#FDE047" opacity={0.9} />
        <circle cx={1550} cy={220} r={110} fill="#FEF08A" opacity={0.35} />

        {/* Biển xanh ở xa */}
        <rect x={0} y={groundY - 260} width={width} height={260} fill="url(#sea-water)" />
        {/* Dải sóng biển trắng nhấp nhô */}
        <path
          d={`M 0,${groundY - 140} Q 480,${groundY - 160} 960,${groundY - 140} T 1920,${groundY - 140} L 1920,${groundY} L 0,${groundY} Z`}
          fill="#38BDF8"
          opacity={0.6}
        />
        <path
          d={`M 0,${groundY - 45} Q 400,${groundY - 60} 800,${groundY - 45} T 1600,${groundY - 45} T 1920,${groundY - 45} L 1920,${groundY} L 0,${groundY} Z`}
          fill="#F8FAFC"
          opacity={0.7}
        />

        {/* Cây dừa nghiêng bóng ở góc trái */}
        <g id="palm-tree" transform="translate(180, 480)">
          <path d="M 0,360 Q 40,160 110,0 Q 85,160 40,360 Z" fill="#78350F" stroke="#1E293B" strokeWidth={5} />
          {/* Tán dừa xanh */}
          <path d="M 110,0 Q 40,-80 -60,-40 Q 20,-20 110,0 Z" fill="#15803D" stroke="#1E293B" strokeWidth={4} />
          <path d="M 110,0 Q 80,-120 10,-110 Q 70,-40 110,0 Z" fill="#16A34A" stroke="#1E293B" strokeWidth={4} />
          <path d="M 110,0 Q 180,-120 220,-80 Q 160,-30 110,0 Z" fill="#22C55E" stroke="#1E293B" strokeWidth={4} />
          <path d="M 110,0 Q 220,-40 250,30 Q 170,0 110,0 Z" fill="#15803D" stroke="#1E293B" strokeWidth={4} />
        </g>

        {/* Bãi cát vàng mịn màng tại Y = 840px */}
        <rect x={0} y={groundY} width={width} height={height - groundY} fill="url(#beach-sand)" />
        <line x1={0} y1={groundY} x2={width} y2={groundY} stroke="#1E293B" strokeWidth={5} />
      </svg>
    );
  }

  // 5. THEME: GARDEN_DAY (Khu vườn ban ngày tươi mát)
  if (theme === "GARDEN_DAY") {
    return (
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <defs>
          <linearGradient id="garden-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="60%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#BAE6FD" />
          </linearGradient>
          <linearGradient id="garden-lawn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>
        </defs>

        <rect x={0} y={0} width={width} height={groundY} fill="url(#garden-sky)" />
        {/* Mặt trời & Mây */}
        <circle cx={1480} cy={180} r={65} fill="#FACC15" />
        <ellipse cx={320 + (frame * 0.15) % 200} cy={160} rx={60} ry={25} fill="#FFFFFF" opacity={0.9} />
        <ellipse cx={360 + (frame * 0.15) % 200} cy={150} rx={50} ry={30} fill="#FFFFFF" opacity={0.9} />

        {/* Rặng đồi xanh xa xa */}
        <path d={`M 0,${groundY - 180} Q 500,${groundY - 320} 1050,${groundY - 200} T 1920,${groundY - 260} L 1920,${groundY} L 0,${groundY} Z`} fill="#166534" opacity={0.4} />
        <path d={`M 0,${groundY - 90} Q 600,${groundY - 220} 1300,${groundY - 110} T 1920,${groundY - 160} L 1920,${groundY} L 0,${groundY} Z`} fill="#15803D" opacity={0.7} />

        {/* Hàng rào gỗ trắng xinh xắn */}
        <g id="wooden-fence" transform={`translate(0, ${groundY - 110})`}>
          <line x1={0} y1={40} x2={width} y2={40} stroke="#F8FAFC" strokeWidth={10} />
          <line x1={0} y1={80} x2={width} y2={80} stroke="#F8FAFC" strokeWidth={10} />
          {Array.from({ length: 24 }).map((_, i) => (
            <polygon key={`picket_${i}`} points={`${i * 85},110 ${i * 85},15 ${i * 85 + 10},0 ${i * 85 + 20},15 ${i * 85 + 20},110`} fill="#F8FAFC" stroke="#334155" strokeWidth={2} />
          ))}
        </g>

        {/* Thảm cỏ xanh mát tại Y = 840px */}
        <rect x={0} y={groundY} width={width} height={height - groundY} fill="url(#garden-lawn)" />
        <line x1={0} y1={groundY} x2={width} y2={groundY} stroke="#1E293B" strokeWidth={5} />
      </svg>
    );
  }

  // 6. THEME: LIVING_ROOM (Phòng khách ấm cúng)
  if (theme === "LIVING_ROOM") {
    return (
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <defs>
          <linearGradient id="living-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FEF9C3" />
            <stop offset="100%" stopColor="#FEF08A" />
          </linearGradient>
          <linearGradient id="living-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#92400E" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
        </defs>

        <rect x={0} y={0} width={width} height={groundY} fill="url(#living-wall)" />
        {/* Tranh treo tường gia đình */}
        <g id="wall-art" transform="translate(820, 220)">
          <rect x={0} y={0} width={280} height={190} rx={8} fill="#FFFFFF" stroke="#1E293B" strokeWidth={8} />
          <rect x={18} y={18} width={244} height={154} fill="#BAE6FD" />
          <circle cx={140} cy={80} r={35} fill="#FDE047" />
          <polygon points="35,172 110,95 185,172" fill="#15803D" />
          <polygon points="135,172 195,115 255,172" fill="#166534" />
        </g>

        {/* Cửa sổ phòng khách với rèm rủ */}
        <g id="living-window" transform="translate(180, 200)">
          <rect x={0} y={0} width={360} height={450} rx={12} fill="#F8FAFC" stroke="#1E293B" strokeWidth={8} />
          <rect x={16} y={16} width={328} height={418} fill="#BAE6FD" />
          <line x1={180} y1={16} x2={180} y2={434} stroke="#1E293B" strokeWidth={6} />
          {/* Rèm cửa mềm mại */}
          <path d="M 0,0 Q 60,220 15,450 L 0,450 Z" fill="#FB7185" opacity={0.85} />
          <path d="M 360,0 Q 300,220 345,450 L 360,450 Z" fill="#FB7185" opacity={0.85} />
        </g>

        {/* Sàn gỗ phòng khách Y = 840px */}
        <rect x={0} y={groundY} width={width} height={height - groundY} fill="url(#living-floor)" />
        {/* Thảm trải sàn lớn êm ái */}
        <ellipse cx={960} cy={groundY + 80} rx={540} ry={48} fill="#E11D48" stroke="#1E293B" strokeWidth={5} />
        <ellipse cx={960} cy={groundY + 80} rx={480} ry={38} fill="#FB7185" stroke="#FFFFFF" strokeWidth={3} strokeDasharray="14 10" />
        <line x1={0} y1={groundY} x2={width} y2={groundY} stroke="#1E293B" strokeWidth={5} />
      </svg>
    );
  }

  // 7. THEME: LINED_PAPER (Giấy vở học sinh / giải thích khoa học)
  if (theme === "LINED_PAPER") {
    return (
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <rect x={0} y={0} width={width} height={height} fill="#FAF5E8" />
        {/* Dòng kẻ ngang màu lam nhạt */}
        {Array.from({ length: 24 }).map((_, i) => (
          <line key={`line_${i}`} x1={0} y1={i * 45 + 30} x2={width} y2={i * 45 + 30} stroke="#CBD5E1" strokeWidth={2} />
        ))}
        {/* Đường lề đỏ đứng bên trái */}
        <line x1={200} y1={0} x2={200} y2={height} stroke="#F87171" strokeWidth={4} />
        {/* Đường sàn tiếp xúc Y = 840px */}
        <line x1={0} y1={groundY} x2={width} y2={groundY} stroke="#1E293B" strokeWidth={5} />
      </svg>
    );
  }

  // 8. THEME: DOTTED_CREAM (Chấm bi kem tối giản cho cận cảnh)
  if (theme === "DOTTED_CREAM") {
    return (
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <defs>
          <pattern id="v8Dots" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
            <circle cx="24" cy="24" r="3" fill="#CBD5E1" />
          </pattern>
        </defs>
        <rect x={0} y={0} width={width} height={height} fill="#FAF5E8" />
        <rect x={0} y={0} width={width} height={height} fill="url(#v8Dots)" />
        <line x1={0} y1={groundY} x2={width} y2={groundY} stroke="#1E293B" strokeWidth={5} />
      </svg>
    );
  }

  // 8B. THEME: SOFT_GRAPH_GRID & GRID_PAPER (Nền giấy kỹ thuật kẻ ô vuông 44x44px + Vignette 4 góc chuẩn Storytime)
  if (theme === "GRID_PAPER" || theme === "SOFT_GRAPH_GRID") {
    return (
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <defs>
          <pattern id="v9SoftGraphGrid" width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M 44 0 L 0 0 0 44" fill="none" stroke="#E7E3D8" strokeWidth="1.2" />
          </pattern>
          <radialGradient id="v9CornerVignette" cx="50%" cy="50%" r="72%">
            <stop offset="0%" stopColor="#0F172A" stopOpacity="0" />
            <stop offset="68%" stopColor="#0F172A" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0.15" />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={width} height={height} fill="#FAF8F2" />
        <rect x={0} y={0} width={width} height={height} fill="url(#v9SoftGraphGrid)" />
        <rect x={0} y={0} width={width} height={height} fill="url(#v9CornerVignette)" />
      </svg>
    );
  }

  // 8C. THEME: WINDOW_SILL_BOKEH (Bệ Cửa Sổ Gỗ Ấm + Kính Mờ Bokeh Vườn + Khung Lưới Chắn Côn Trùng)
  if (theme === "WINDOW_SILL_BOKEH") {
    const sillTopY = 800;
    return (
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <defs>
          <linearGradient id="windowFrostedSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DDF2FD" />
            <stop offset="65%" stopColor="#ECF8F2" />
            <stop offset="100%" stopColor="#F4F9F5" />
          </linearGradient>
          <pattern id="insectMeshPattern" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#94A3B8" strokeWidth="1.1" opacity="0.38" />
          </pattern>
          <linearGradient id="woodSillTop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EBC396" />
            <stop offset="100%" stopColor="#E6B98A" />
          </linearGradient>
          <linearGradient id="woodSillFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D9A773" />
            <stop offset="100%" stopColor="#C48F5A" />
          </linearGradient>
        </defs>

        {/* 1. Phía sau: Kính mờ nhìn ra khu vườn với vòm cây & chấm hoa Bokeh phẳng (0 blur) */}
        <rect x={0} y={0} width={width} height={sillTopY} fill="url(#windowFrostedSky)" />
        <g opacity={0.72}>
          {/* Vòm cây xanh lá dịu phẳng */}
          <circle cx={210} cy={560} r={220} fill="#86EFAC" opacity={0.42} />
          <circle cx={520} cy={610} r={250} fill="#4ADE80" opacity={0.36} />
          <circle cx={880} cy={590} r={230} fill="#A7F3D0" opacity={0.42} />
          <circle cx={1180} cy={540} r={210} fill="#86EFAC" opacity={0.38} />
          <circle cx={1620} cy={580} r={240} fill="#6EE7B7" opacity={0.34} />
          {/* Các chấm hoa đỏ cam & nắng vàng bokeh phẳng */}
          <circle cx={310} cy={470} r={36} fill="#FB7185" opacity={0.38} />
          <circle cx={420} cy={530} r={26} fill="#F97316" opacity={0.35} />
          <circle cx={670} cy={430} r={44} fill="#FDE047" opacity={0.45} />
          <circle cx={1050} cy={460} r={34} fill="#FB7185" opacity={0.36} />
          <circle cx={1160} cy={380} r={48} fill="#FEF08A" opacity={0.48} />
          <circle cx={1520} cy={440} r={32} fill="#F97316" opacity={0.34} />
        </g>

        {/* 2. Bên phải (X >= 1340px): Khung thanh nhôm dọc & Tấm lưới chắn côn trùng kẻ caro vuông nhỏ */}
        <rect
          x={1382}
          y={0}
          width={width - 1382}
          height={sillTopY}
          fill="rgba(241, 245, 249, 0.25)"
        />
        <rect
          x={1382}
          y={0}
          width={width - 1382}
          height={sillTopY}
          fill="url(#insectMeshPattern)"
        />
        {/* Thanh nhôm đứng phân cách cửa kính & cửa lưới (X = 1340..1384) */}
        <rect
          x={1340}
          y={-6}
          width={44}
          height={sillTopY + 6}
          fill="#CBD5E1"
          stroke="#1E293B"
          strokeWidth={3.5}
        />
        <line x1={1354} y1={0} x2={1354} y2={sillTopY} stroke="#F8FAFC" strokeWidth={3} opacity={0.8} />
        {/* Thanh nẹp ngang dưới chân khung cửa sổ */}
        <rect
          x={0}
          y={sillTopY - 18}
          width={width}
          height={18}
          fill="#E2E8F0"
          stroke="#1E293B"
          strokeWidth={3.5}
        />

        {/* 3. Phía dưới (Y >= 800px): Mặt sàn bệ cửa gỗ màu cam đất ấm (#E6B98A) có viền đen 3.5px */}
        <rect
          x={0}
          y={sillTopY}
          width={width}
          height={groundY - sillTopY + 18}
          fill="url(#woodSillTop)"
          stroke="#1E293B"
          strokeWidth={3.5}
        />
        <rect
          x={0}
          y={groundY + 18}
          width={width}
          height={height - (groundY + 18)}
          fill="url(#woodSillFront)"
          stroke="#1E293B"
          strokeWidth={3.5}
        />
        {/* Đường vân gỗ tinh tế trên bệ cửa */}
        <line x1={140} y1={groundY - 4} x2={520} y2={groundY - 4} stroke="#C48F5A" strokeWidth={2.5} strokeLinecap="round" opacity={0.6} />
        <line x1={780} y1={groundY + 6} x2={1240} y2={groundY + 6} stroke="#C48F5A" strokeWidth={2.5} strokeLinecap="round" opacity={0.6} />
        <line x1={1480} y1={groundY - 2} x2={1810} y2={groundY - 2} stroke="#C48F5A" strokeWidth={2.5} strokeLinecap="round" opacity={0.6} />
        <line x1={0} y1={groundY + 18} x2={width} y2={groundY + 18} stroke="#1E293B" strokeWidth={3.5} />
      </svg>
    );
  }

  // 8D. THEME: PASTEL_BRANCH_GARDEN (Khu Vườn Pastel Đồi Cỏ, Mây & Mặt Trời Có Viền Đen + Cành Cây Hoa)
  if (theme === "PASTEL_BRANCH_GARDEN") {
    return (
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <defs>
          <linearGradient id="pastelGardenSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A5D8FF" />
            <stop offset="65%" stopColor="#E0F2FE" />
            <stop offset="100%" stopColor="#FEFCE8" />
          </linearGradient>
        </defs>

        {/* 1. Bầu trời xanh pastel dịu chuyển sang kem sáng */}
        <rect x={0} y={0} width={width} height={height} fill="url(#pastelGardenSky)" />

        {/* 2. Mặt trời vàng nhạt có viền đen 3.5px */}
        <circle
          cx={1560}
          cy={185}
          r={68}
          fill="#FEF08A"
          stroke="#1E293B"
          strokeWidth={3.5}
        />

        {/* 3. Ba đám mây trắng bồng bềnh có viền đen 3.5px */}
        {[
          { x: 260, y: 175, s: 1.0 },
          { x: 610, y: 165, s: 0.88 },
          { x: 1290, y: 215, s: 0.92 },
        ].map((cl, idx) => (
          <g key={`cloud_${idx}`} transform={`translate(${cl.x}, ${cl.y}) scale(${cl.s})`}>
            <path
              d="M -75,20 C -95,20 -105,-8 -82,-22 C -78,-48 -42,-58 -22,-38 C -4,-62 38,-58 48,-30 C 75,-30 92,-4 72,20 Z"
              fill="#FFFFFF"
              stroke="#1E293B"
              strokeWidth={3.5}
              strokeLinejoin="round"
            />
          </g>
        ))}

        {/* 4. Hai đồi cỏ xanh lá non uốn lượn phía sau có viền đen 3.5px */}
        <path
          d={`M -20,${groundY + 20} Q 460,${groundY - 250} 1060,${groundY - 90} T 1940,${groundY - 180} L 1940,${height} L -20,${height} Z`}
          fill="#86EFAC"
          stroke="#1E293B"
          strokeWidth={3.5}
        />
        <path
          d={`M -20,${groundY + 30} Q 580,${groundY - 120} 1240,${groundY - 190} T 1940,${groundY - 70} L 1940,${height} L -20,${height} Z`}
          fill="#A3E635"
          stroke="#1E293B"
          strokeWidth={3.5}
        />

        {/* 5. Cành cây gỗ nâu + lá xanh + bông hoa 5 cánh hồng cam có viền đen */}
        <g id="pastel-branch" transform="translate(0, 0)">
          {/* Thân cành cây vươn ngang tạo bệ đứng tự nhiên tại Y = groundY */}
          <path
            d={`M -20,${groundY + 35} Q 480,${groundY - 12} 980,${groundY + 4} Q 1380,${groundY + 16} 1680,${groundY - 8} Q 1420,${groundY + 42} 960,${groundY + 36} Q 450,${groundY + 28} -20,${groundY + 95} Z`}
            fill="#92400E"
            stroke="#1E293B"
            strokeWidth={4}
            strokeLinejoin="round"
          />
          {/* Nhánh nhỏ bên trái mang lá & hoa */}
          <path
            d={`M 380,${groundY + 2} Q 330,${groundY - 65} 260,${groundY - 95}`}
            fill="none"
            stroke="#1E293B"
            strokeWidth={12}
            strokeLinecap="round"
          />
          <path
            d={`M 380,${groundY + 2} Q 330,${groundY - 65} 260,${groundY - 95}`}
            fill="none"
            stroke="#92400E"
            strokeWidth={6}
            strokeLinecap="round"
          />
          {/* Các chiếc lá xanh viền đen */}
          <path
            d={`M 260,${groundY - 95} C 220,${groundY - 135} 185,${groundY - 105} 215,${groundY - 75} C 235,${groundY - 65} 255,${groundY - 80} 260,${groundY - 95} Z`}
            fill="#4ADE80"
            stroke="#1E293B"
            strokeWidth={3.5}
          />
          <path
            d={`M 325,${groundY - 52} C 345,${groundY - 95} 385,${groundY - 85} 365,${groundY - 48} Z`}
            fill="#22C55E"
            stroke="#1E293B"
            strokeWidth={3.5}
          />
          <path
            d={`M 1460,${groundY - 2} C 1500,${groundY - 48} 1545,${groundY - 35} 1515,${groundY + 4} Z`}
            fill="#4ADE80"
            stroke="#1E293B"
            strokeWidth={3.5}
          />
          {/* Bông hoa 5 cánh hồng cam trên cành bên trái */}
          <g transform={`translate(255, ${groundY - 102})`}>
            {[0, 72, 144, 216, 288].map((deg, i) => (
              <circle
                key={`petal_${i}`}
                cx={Math.cos((deg * Math.PI) / 180) * 16}
                cy={Math.sin((deg * Math.PI) / 180) * 16}
                r={13}
                fill="#FB7185"
                stroke="#1E293B"
                strokeWidth={3}
              />
            ))}
            <circle cx={0} cy={0} r={9} fill="#FACC15" stroke="#1E293B" strokeWidth={3} />
          </g>
        </g>
      </svg>
    );
  }

  // 9. THEME: RADIAL_SUNBURST (Tia mặt trời xoay nhẹ ấn tượng)
  if (theme === "RADIAL_SUNBURST") {
    const rays = [];
    const numRays = 18;
    for (let i = 0; i < numRays; i++) {
      const a1 = ((i * 360) / numRays) * (Math.PI / 180);
      const a2 = (((i + 0.5) * 360) / numRays) * (Math.PI / 180);
      const r = 2400;
      const x1 = 960 + Math.cos(a1) * r;
      const y1 = 540 + Math.sin(a1) * r;
      const x2 = 960 + Math.cos(a2) * r;
      const y2 = 540 + Math.sin(a2) * r;
      rays.push(
        <polygon key={`ray_${i}`} points={`960,540 ${x1},${y1} ${x2},${y2}`} fill="#FDE68A" opacity={0.55} />
      );
    }
    return (
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <rect x={0} y={0} width={width} height={height} fill="#FEF3C7" />
        <g transform={`rotate(${frame * 0.12}, 960, 540)`}>{rays}</g>
        <line x1={0} y1={groundY} x2={width} y2={groundY} stroke="#1E293B" strokeWidth={5} />
      </svg>
    );
  }
  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
    >
      <defs>
        <linearGradient id="dark-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="60%" stopColor="#1E1B4B" />
          <stop offset="100%" stopColor="#0B0F19" />
        </linearGradient>
        <linearGradient id="spotlight-left" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
        </linearGradient>
        <linearGradient id="spotlight-right" x1="1" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#A855F7" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#A855F7" stopOpacity="0.0" />
        </linearGradient>
        <linearGradient id="dark-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
      </defs>

      {/* 1. Nền xanh đen sâu thẳm công nghệ */}
      <rect x={0} y={0} width={width} height={groundY} fill="url(#dark-bg)" />

      {/* Lưới tọa độ studio trừu tượng mờ mờ */}
      {Array.from({ length: 19 }).map((_, i) => (
        <line
          key={`grid_v_${i}`}
          x1={i * 100}
          y1={0}
          x2={i * 100}
          y2={groundY}
          stroke="#334155"
          strokeWidth={1}
          opacity={0.25}
        />
      ))}
      {Array.from({ length: 9 }).map((_, i) => (
        <line
          key={`grid_h_${i}`}
          x1={0}
          y1={i * 95}
          x2={width}
          y2={i * 95}
          stroke="#334155"
          strokeWidth={1}
          opacity={0.25}
        />
      ))}

      {/* 2 luồng đèn Spotlight chiếu từ trần xuống sân khấu */}
      <polygon points="400,0 520,0 950,840 250,840" fill="url(#spotlight-left)" />
      <polygon points="1520,0 1640,0 1780,840 1080,840" fill="url(#spotlight-right)" />

      {/* 2. Sàn tối bóng phản chiếu dưới Y = 840px (Làm sáng #475569 -> #1E293B) */}
      <rect x={0} y={groundY} width={width} height={height - groundY} fill="url(#dark-floor)" />

      {/* Vệt sáng sàn phản chiếu đèn spotlight */}
      <ellipse cx={600} cy={groundY + 12} rx={320} ry={20} fill="#38BDF8" opacity={0.35} />
      <ellipse cx={1430} cy={groundY + 12} rx={320} ry={20} fill="#A855F7" opacity={0.35} />

      {/* Đường vạch sàn phát sáng neon cyan */}
      <line x1={0} y1={groundY} x2={width} y2={groundY} stroke="#38BDF8" strokeWidth={5} opacity={0.9} />
    </svg>
  );
};
