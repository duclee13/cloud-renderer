/**
 * KASS STAGE LIBRARY V14.0 (Thư Viện 5 Bối Cảnh Đời Sống Tái Sử Dụng + Kính Lúp Soi Khoa Học)
 * Chuẩn nét vẽ vector sạch (strokeWidth = 3px, #141414), phong cách hoạt hình kể chuyện đời sống tự nhiên (1920x1080 @ 60fps):
 * 1. COUNTRYSIDE_YARD (Sân nhà quê): Sân đất vàng có sỏi nhỏ, nhà mái ngói đỏ, hàng rào gỗ, cánh đồng lúa vàng, timeOfDay ('DAY' | 'SUNSET' | 'NIGHT')
 * 2. BEDROOM_INDOOR (Phòng ngủ): Tường kem ấm, giường, tủ đầu giường + đèn ngủ nhỏ, cửa sổ ngày/chiều/đêm
 * 3. UNDERGROUND_CROSS_SECTION (Mặt cắt lòng đất): Cỏ xanh trên mặt + đất phân tầng + hệ thống đường hầm & hang ổ kiến đỏ bò qua lại
 * 4. EXPLAINER_POLKA_DOT (Phông giải thích khoa học): Nền pastel chấm bi nhẹ (#DCFCE7 / #FEF9C3 / #EDE9FE) + MagnifyingGlassOverlay
 * 5. SIMPLE_GRASS_FIELD (Bãi cỏ / Cánh đồng thoáng): Cỏ xanh rì, cây xoài sai quả, mây trôi, hỗ trợ timeOfDay
 */

import React from "react";
import { GroundShadow } from "../SceneBackdropKit";
import { StickmanRig, ComicSpeechBubble, isComicBubbleActive } from "./StickmanRig";
import { smoothstep, lerpNum } from "../../lib/v7/universalAnimationStandard";
import { FireAntV15SceneLayer, type FireAntV15SceneMode } from "./FireAntMovieStages";
import {
  TadpoleV16SceneLayer,
  isTadpoleV16SceneMode,
  LotusPondBackdrop,
  type TadpoleV16SceneMode,
} from "./TadpoleMovieStages";

export type { FireAntV15SceneMode, TadpoleV16SceneMode };
export { LotusPondBackdrop };
export type KassTimeOfDay = "DAY" | "SUNSET" | "NIGHT";
export type PolkaPalette = "mint" | "cream" | "lavender";

export type KassStageName =
  | "COUNTRYSIDE_YARD"
  | "BEDROOM_INDOOR"
  | "UNDERGROUND_CROSS_SECTION"
  | "EXPLAINER_POLKA_DOT"
  | "SIMPLE_GRASS_FIELD"
  | "LOTUS_POND_STAGE"
  | "BEDROOM_TANK_STAGE";

export type KassStoryDemoMode =
  | "YARD_SUMMER_GREET"
  | "GARDEN_CHASE_DRAGONFLY"
  | "GARDEN_FIND_MOUND"
  | "EXPLAIN_BUN_COMPARE"
  | "GARDEN_POKE_MOUND"
  | "GARDEN_ANTS_BOIL"
  | "YARD_GRANDPA_LAUGH"
  | "UNDERGROUND_ANT_CITY"
  | "EXPLAIN_SEVEN_DAYS_OUTRO"
  | FireAntV15SceneMode
  | TadpoleV16SceneMode;

function easeOutBack(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(c - 1, 3) + c1 * Math.pow(c - 1, 2);
}

const CountrysideYardStaticLayer = React.memo<{
  timeOfDay: KassTimeOfDay;
  groundY: number;
  chongTreCentered: boolean;
}>(({ timeOfDay, groundY, chongTreCentered }) => {
  const isSunset = timeOfDay === "SUNSET";
  const isNight = timeOfDay === "NIGHT";

  // BẮT BUỘC: Cảnh chiều muộn SUNSET dùng tông trời hoàng hôn ấm sáng (#FDE68A / #FED7AA / #FFFBEB), không dùng nền tối đen!
  const skyTop = isNight ? "#1E293B" : isSunset ? "#FED7AA" : "#60A5FA";
  const skyMid = isNight ? "#0F172A" : isSunset ? "#FDE68A" : "#BAE6FD";
  const skyBot = isNight ? "#090E1A" : isSunset ? "#FFFBEB" : "#F0F9FF";

  const riceFill = isNight ? "#4D4618" : isSunset ? "#EAB308" : "#FACC15";
  const riceShade = isNight ? "#3A3512" : isSunset ? "#CA8A04" : "#EAB308";
  const yardTop = isNight ? "#4B3F28" : isSunset ? "#E8B97E" : "#F3D393";
  const yardBot = isNight ? "#352C1B" : isSunset ? "#D29A5B" : "#E5BC70";
  const houseWall = isNight ? "#94A3B8" : isSunset ? "#FEF3C7" : "#FEF9C3";
  const roofFill = isNight ? "#7F1D1D" : isSunset ? "#C2410C" : "#DC2626";
  const treeFill = isNight ? "#14532D" : isSunset ? "#16A34A" : "#22C55E";
  const treeDark = isNight ? "#052E16" : isSunset ? "#15803D" : "#16A34A";
  const distantGrove = isNight ? "#0F291E" : isSunset ? "#86EFAC" : "#86EFAC";
  const distantPalm = isNight ? "#14532D" : isSunset ? "#4ADE80" : "#4ADE80";

  // Chõng tre đặt chính giữa-trái thoáng tán cây (x=610..1210) khi có nhân vật ngồi, hoặc gọn sát hiên phải cho tập cũ
  const benchX = chongTreCentered ? 610 : 1320;
  const benchW = chongTreCentered ? 600 : 320;
  const seatY = groundY - 108;
  const legH = groundY - (seatY + 18);
  const teaTrayX = chongTreCentered ? 910 : 1480;

  return (
    <g>
      <defs>
        <linearGradient id={`yard-sky-${timeOfDay}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyTop} />
          <stop offset="56%" stopColor={skyMid} />
          <stop offset="100%" stopColor={skyBot} />
        </linearGradient>
        <linearGradient id={`yard-ground-${timeOfDay}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={yardTop} />
          <stop offset="100%" stopColor={yardBot} />
        </linearGradient>
      </defs>

      {/* LỚP 1 — HẬU CẢNH: Bầu trời hoàng hôn ấm sáng, mặt trời dịu, rặng cau & lũy tre xa */}
      <rect x={0} y={0} width={1920} height={groundY} fill={`url(#yard-sky-${timeOfDay})`} />

      {isNight ? (
        <g transform="translate(260, 175)">
          <path
            d="M 10,-46 A 48,48 0 1,0 10,46 A 36,36 0 1,1 10,-46 Z"
            fill="#FEF08A"
            stroke="#141414"
            strokeWidth={3}
          />
        </g>
      ) : (
        <g transform={`translate(${isSunset ? 340 : 280}, ${isSunset ? 285 : 165})`}>
          <circle cx={0} cy={0} r={isSunset ? 115 : 82} fill="#FEF08A" opacity={0.22} />
          <circle cx={0} cy={0} r={isSunset ? 78 : 58} fill="#FEF08A" opacity={0.35} />
          <circle
            cx={0}
            cy={0}
            r={isSunset ? 48 : 42}
            fill={isSunset ? "#FBBF24" : "#FDE047"}
            stroke="#141414"
            strokeWidth={2.8}
          />
        </g>
      )}

      {/* Rặng cau & lũy tre xa lớp hậu cảnh mềm (y=365..565) */}
      <g opacity={isNight ? 0.65 : 0.72}>
        <path
          d="M -20,560 Q 150,475 330,525 Q 520,455 720,515 Q 920,460 1120,520 Q 1290,465 1440,540 L 1440,620 L -20,620 Z"
          fill={distantGrove}
        />
        {/* 5 cây cau mảnh mai đặc trưng làng quê Việt Nam */}
        {[175, 245, 595, 650, 965].map((px, idx) => {
          const topY = 390 + (idx % 3) * 26;
          return (
            <g key={`areca_${idx}`} transform={`translate(${px}, ${topY})`}>
              <path
                d={`M 0,0 Q ${idx % 2 === 0 ? -8 : 8},85 0,175`}
                fill="none"
                stroke={isNight ? "#1E3A2F" : "#65A30D"}
                strokeWidth={5.5}
                strokeLinecap="round"
              />
              <path
                d="M 0,0 Q -32,-16 -52,6 M 0,0 Q -26,-26 -36,-38 M 0,0 Q 28,-22 48,4 M 0,0 Q 22,-28 34,-36 M 0,0 Q 0,-28 -4,-44"
                fill="none"
                stroke={distantPalm}
                strokeWidth={5}
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </g>

      {/* Lũy tre xanh trung-hậu cảnh */}
      <path
        d="M -20,568 Q 120,465 280,528 Q 450,445 650,522 Q 840,468 1040,528 Q 1220,462 1420,545 L 1420,660 L -20,660 Z"
        fill={treeDark}
        stroke="#141414"
        strokeWidth={2.8}
      />

      {/* LỚP 2 — TRUNG CẢNH: Cánh đồng lúa vàng, hàng rào gỗ, nhà mái ngói đỏ, đèn hiên vàng dịu, sân gạch & chõng tre */}
      <path
        d={`M -20,572 Q 340,552 700,572 T 1340,582 L 1340,${groundY - 110} L -20,${groundY - 110} Z`}
        fill={riceFill}
        stroke="#141414"
        strokeWidth={2.8}
      />
      <path
        d={`M -20,635 Q 380,618 760,640 T 1340,650 L 1340,${groundY - 110} L -20,${groundY - 110} Z`}
        fill={riceShade}
        opacity={0.48}
      />

      {/* Hàng rào gỗ mộc ngăn sân và ruộng lúa */}
      <g id="wooden-fence" stroke="#141414" strokeWidth={2.8} strokeLinejoin="round">
        <rect x={-10} y={668} width={1320} height={14} fill="#B45309" />
        <rect x={-10} y={712} width={1320} height={14} fill="#92400E" />
        {[40, 145, 250, 355, 460, 565, 670, 775, 880, 985, 1090, 1195].map((fx) => (
          <path
            key={`fence_p_${fx}`}
            d={`M ${fx},760 L ${fx},648 L ${fx + 14},632 L ${fx + 28},648 L ${fx + 28},760 Z`}
            fill="#C26A27"
          />
        ))}
      </g>

      {/* Thân cây xanh hông nhà (tán lá đung đưa nằm ở lớp động) */}
      <rect x={1207} y={560} width={36} height={210} fill="#78350F" stroke="#141414" strokeWidth={3} />

      {/* Ngôi nhà quê mái ngói đỏ ấm cúng bên phải */}
      <g id="countryside-red-roof-house" stroke="#141414" strokeWidth={3} strokeLinejoin="round">
        <rect x={1285} y={465} width={580} height={315} fill={houseWall} />
        <rect x={1285} y={465} width={580} height={26} fill="#0F172A" opacity={0.14} stroke="none" />
        <rect x={1265} y={752} width={620} height={30} rx={4} fill="#D6D3D1" />
        <rect x={1380} y={555} width={145} height={198} rx={4} fill="#451A03" />
        <rect x={1380} y={555} width={22} height={198} fill="#92400E" />
        <rect x={1503} y={555} width={22} height={198} fill="#92400E" />
        <rect x={1610} y={568} width={150} height={116} rx={6} fill={isNight || isSunset ? "#FEF08A" : "#38BDF8"} />
        <line x1={1685} y1={568} x2={1685} y2={684} stroke="#141414" strokeWidth={3} />
        <line x1={1610} y1={626} x2={1760} y2={626} stroke="#141414" strokeWidth={3} />
        <rect x={1584} y={568} width={26} height={116} rx={3} fill="#15803D" />
        <rect x={1760} y={568} width={26} height={116} rx={3} fill="#15803D" />
        <polygon points="1225,478 1345,322 1890,322 1925,478" fill={roofFill} />
        {[360, 400, 440].map((ry) => (
          <line
            key={`tile_row_${ry}`}
            x1={1245 + (478 - ry) * 0.72}
            y1={ry}
            x2={1915}
            y2={ry}
            stroke="#7F1D1D"
            strokeWidth={3}
          />
        ))}
        <rect x={1335} y={310} width={565} height={18} rx={6} fill="#991B1B" />

        {/* Đèn hiên vàng dịu treo dưới mái ngói (bật sáng ấm áp vào cảnh chiều tà SUNSET / NIGHT, không blur) */}
        <g id="yard-porch-lamp" transform="translate(1452, 478)">
          <line x1={0} y1={0} x2={0} y2={24} stroke="#334155" strokeWidth={3.5} />
          <path d="M -18,24 Q 0,14 18,24 Z" fill="#475569" stroke="#141414" strokeWidth={2.4} />
          {(isSunset || isNight) && (
            <polygon
              points="-14,34 14,34 125,274 -125,274"
              fill="#FEF08A"
              opacity={isNight ? 0.24 : 0.18}
              stroke="none"
            />
          )}
          <circle
            cx={0}
            cy={31}
            r={10}
            fill={isSunset || isNight ? "#FEF08A" : "#E2E8F0"}
            stroke="#141414"
            strokeWidth={2.4}
          />
        </g>
      </g>

      {/* Thân cây góc phải cạnh nhà */}
      <rect x={1860} y={599} width={24} height={165} fill="#78350F" stroke="#141414" strokeWidth={3} />

      {/* Mặt sân gạch quê ấm áp + đường mạch gạch mảnh nhẹ (vùng y > 830 dịu sạch cho phụ đề) */}
      <rect x={0} y={760} width={1920} height={1080 - 760} fill={`url(#yard-ground-${timeOfDay})`} />
      <line x1={0} y1={760} x2={1920} y2={760} stroke="#141414" strokeWidth={3} />
      <g stroke="#9A3412" strokeWidth={1.8} opacity={0.16}>
        {[796, 836, 882, 934, 992].map((by, rowIdx) => (
          <g key={`brick_r_${by}`}>
            <line x1={0} y1={by} x2={1920} y2={by} />
            {[120, 320, 520, 720, 920, 1120, 1320, 1520, 1720].map((bx) => (
              <line
                key={`brick_v_${bx}`}
                x1={bx + (rowIdx % 2) * 100}
                y1={by - 36}
                x2={bx + (rowIdx % 2) * 100}
                y2={by}
              />
            ))}
          </g>
        ))}
      </g>

      {/* Chõng tre + khay ấm trà quê grounded 0px tại groundY với GroundShadow phẳng opacity="0.12" */}
      <g id="yard-bamboo-chong-tre">
        <GroundShadow cx={benchX + benchW / 2} cy={groundY + 4} rx={benchW * 0.52} ry={13} />
        {/* 4 chân tre chống chắc xuống mặt sân gạch */}
        <rect x={benchX + 28} y={seatY + 14} width={16} height={legH} rx={4} fill="#A16207" stroke="#141414" strokeWidth={2.8} />
        <rect x={benchX + benchW - 44} y={seatY + 14} width={16} height={legH} rx={4} fill="#A16207" stroke="#141414" strokeWidth={2.8} />
        <rect x={benchX + 86} y={seatY + 18} width={13} height={legH - 12} rx={3} fill="#854D0E" stroke="#141414" strokeWidth={2.4} />
        <rect x={benchX + benchW - 99} y={seatY + 18} width={13} height={legH - 12} rx={3} fill="#854D0E" stroke="#141414" strokeWidth={2.4} />
        {/* Thanh giằng ngang dưới gầm chõng */}
        <rect x={benchX + 36} y={seatY + legH * 0.58} width={benchW - 72} height={10} rx={4} fill="#B45309" stroke="#141414" strokeWidth={2.4} />
        {/* Mặt nan tre đan ấm áp (top edge nằm chính xác tại seatY = groundY - 108) */}
        <rect x={benchX} y={seatY} width={benchW} height={22} rx={7} fill="#D97706" stroke="#141414" strokeWidth={3.2} />
        <rect x={benchX + 8} y={seatY + 4} width={benchW - 16} height={6} rx={3} fill="#F59E0B" opacity={0.75} />
        {/* Các đốt nan tre dọc tinh tế */}
        {Array.from({ length: Math.floor(benchW / 44) }).map((_, si) => (
          <line
            key={`slat_${si}`}
            x1={benchX + 26 + si * 44}
            y1={seatY + 2}
            x2={benchX + 26 + si * 44}
            y2={seatY + 20}
            stroke="#92400E"
            strokeWidth={2}
            opacity={0.55}
          />
        ))}

        {/* Khay ấm trà gốm & 2 chén nhỏ đặt ngay trên mặt chõng tre */}
        <g id="yard-teapot-set" transform={`translate(${teaTrayX}, ${seatY})`}>
          <rect x={-56} y={-8} width={112} height={9} rx={4} fill="#78350F" stroke="#141414" strokeWidth={2.2} />
          {/* Ấm trà đất nung */}
          <path d="M -26,-8 C -30,-32 -14,-44 0,-44 C 14,-44 26,-32 22,-8 Z" fill="#B45309" stroke="#141414" strokeWidth={2.6} />
          <path d="M 20,-26 Q 35,-30 33,-16 Q 31,-10 21,-12" fill="none" stroke="#92400E" strokeWidth={4} strokeLinecap="round" />
          <path d="M -24,-22 L -36,-32" fill="none" stroke="#92400E" strokeWidth={4.5} strokeLinecap="round" />
          <ellipse cx={-2} cy={-44} rx={12} ry={4.5} fill="#D97706" stroke="#141414" strokeWidth={2.2} />
          <circle cx={-2} cy={-50} r={4} fill="#78350F" stroke="#141414" strokeWidth={2} />
          {/* 2 chén trà nhỏ */}
          <rect x={-48} y={-20} width={14} height={12} rx={3} fill="#FEF3C7" stroke="#141414" strokeWidth={2.2} />
          <rect x={34} y={-20} width={14} height={12} rx={3} fill="#FEF3C7" stroke="#141414" strokeWidth={2.2} />
        </g>
      </g>
    </g>
  );
});
CountrysideYardStaticLayer.displayName = "CountrysideYardStaticLayer";

/**
 * 1. COUNTRYSIDE_YARD: Sân nhà quê Việt Nam 3 lớp chiều sâu (trời hoàng hôn ấm sáng, mây trôi, rặng cau/tre xa, sân gạch, chõng tre + ấm trà, đèn hiên, tùy chọn quạt máy nhỏ)
 */
export const CountrysideYardBackdrop: React.FC<{
  timeOfDay?: KassTimeOfDay;
  frame?: number;
  groundY?: number;
  chongTreCentered?: boolean;
  showPorchFan?: boolean;
}> = ({
  timeOfDay = "DAY",
  frame = 0,
  groundY = 840,
  chongTreCentered = false,
  showPorchFan = false,
}) => {
  const isSunset = timeOfDay === "SUNSET";
  const isNight = timeOfDay === "NIGHT";
  const cloudDriftPx = frame * 0.14;
  const breezeDeg = Math.sin(frame * 0.04) * 1.6;
  const fanSpinDeg = (frame * 24) % 360;

  const treeFill = isNight ? "#14532D" : isSunset ? "#16A34A" : "#22C55E";
  const treeDark = isNight ? "#052E16" : isSunset ? "#15803D" : "#16A34A";

  return (
    <g id="stage-countryside-yard">
      <CountrysideYardStaticLayer
        timeOfDay={timeOfDay}
        groundY={groundY}
        chongTreCentered={chongTreCentered}
      />

      {/* Mây 2 tầng trôi chậm mượt theo frame (y >= 175 thoáng tiêu đề trên cùng) */}
      {!isNight &&
        [
          { bx: 180, y: 185, s: 1.0 },
          { bx: 740, y: 175, s: 1.06 },
          { bx: 1290, y: 205, s: 0.92 },
          { bx: 1790, y: 182, s: 0.96 },
        ].map((c, idx) => {
          const cx = ((c.bx + cloudDriftPx * (0.85 + idx * 0.12) + 140) % 2200) - 140;
          return (
            <g key={`yard_cloud_${idx}`} transform={`translate(${cx.toFixed(1)}, ${c.y}) scale(${c.s})`} opacity={0.9}>
              <path
                d="M -68,18 C -86,18 -92,-6 -68,-12 C -62,-38 -22,-44 -6,-24 C 12,-44 54,-36 58,-10 C 82,-6 80,18 58,18 Z"
                fill={isSunset ? "#FFF7ED" : "#FFFFFF"}
                stroke="#141414"
                strokeWidth={2.6}
                strokeLinejoin="round"
              />
            </g>
          );
        })}

      {/* Bông lúa đung đưa nhẹ theo gió 45/60fps */}
      {[110, 240, 390, 520, 680, 830, 980, 1120].map((rx, idx) => {
        const stalkDeg = Math.sin(frame * 0.04 + idx * 0.55) * 3.5;
        return (
          <g key={`rice_${idx}`} transform={`translate(${rx}, 620) rotate(${stalkDeg.toFixed(2)})`}>
            <path
              d="M 0,0 Q 2,-25 9,-37"
              fill="none"
              stroke="#92400E"
              strokeWidth={2.4}
              strokeLinecap="round"
              opacity={0.55}
            />
          </g>
        );
      })}

      {/* Tán cây vườn quê hông nhà đung đưa nhẹ theo gió */}
      <g transform="translate(1225, 520)">
        <g transform={`rotate(${breezeDeg.toFixed(2)}, 0, 40)`}>
          <circle cx={-48} cy={10} r={62} fill={treeDark} stroke="#141414" strokeWidth={3} />
          <circle cx={45} cy={18} r={58} fill={treeDark} stroke="#141414" strokeWidth={3} />
          <circle cx={0} cy={-38} r={74} fill={treeFill} stroke="#141414" strokeWidth={3} />
        </g>
      </g>

      {/* Tán cây nhỏ góc phải cạnh nhà */}
      <g id="yard-right-corner-tree" transform="translate(1872, 575)">
        <g transform={`rotate(${(-breezeDeg * 0.9).toFixed(2)}, 0, 28)`}>
          <circle cx={-28} cy={8} r={42} fill={treeDark} stroke="#141414" strokeWidth={3} />
          <circle cx={26} cy={12} r={38} fill={treeDark} stroke="#141414" strokeWidth={3} />
          <circle cx={-4} cy={-26} r={50} fill={treeFill} stroke="#141414" strokeWidth={3} />
        </g>
      </g>

      {/* Cụm cỏ xanh rung rinh nhẹ ven chân hàng rào */}
      <g id="yard-fence-grass-tufts">
        {[85, 255, 430, 615, 810, 995, 1165].map((gx, idx) => {
          const grassSway = Math.sin(frame * 0.042 + idx * 0.85) * 2.4;
          return (
            <g key={`yard_grass_${idx}`} transform={`rotate(${grassSway.toFixed(2)}, ${gx + 3}, 760)`}>
              <path
                d={`M ${gx},760 Q ${gx - 8},736 ${gx - 17},741 Q ${gx - 4},748 ${gx + 4},760 Q ${gx + 11},734 ${gx + 19},739 Q ${gx + 12},750 ${gx + 22},760 Z`}
                fill={idx % 2 === 0 ? treeFill : treeDark}
                stroke="#141414"
                strokeWidth={2.5}
              />
            </g>
          );
        })}
      </g>

      {/* Quạt máy nhỏ cạnh hiên nhà quay nhẹ thổi gió đuổi muỗi (Beat 53) */}
      {showPorchFan && (
        <g id="yard-porch-small-fan" transform={`translate(1515, ${groundY})`}>
          <GroundShadow cx={0} cy={3} rx={48} ry={9} />
          {/* Đế & thân quạt máy 2D sạch */}
          <ellipse cx={0} cy={-4} rx={36} ry={10} fill="#334155" stroke="#141414" strokeWidth={3} />
          <rect x={-7} y={-118} width={14} height={114} rx={5} fill="#CBD5E1" stroke="#141414" strokeWidth={2.8} />
          {/* Lồng quạt hướng sang trái về phía chõng tre */}
          <g transform="translate(-8, -142)">
            <circle cx={0} cy={0} r={48} fill="#E0F2FE" fillOpacity={0.62} stroke="#0284C7" strokeWidth={4} />
            <g transform={`rotate(${fanSpinDeg.toFixed(1)})`}>
              <ellipse cx={0} cy={-22} rx={9} ry={20} fill="#38BDF8" stroke="#0369A1" strokeWidth={2} />
              <ellipse cx={19} cy={12} rx={9} ry={20} transform="rotate(120, 19, 12)" fill="#38BDF8" stroke="#0369A1" strokeWidth={2} />
              <ellipse cx={-19} cy={12} rx={9} ry={20} transform="rotate(240, -19, 12)" fill="#38BDF8" stroke="#0369A1" strokeWidth={2} />
            </g>
            <circle cx={0} cy={0} r={10} fill="#0284C7" stroke="#141414" strokeWidth={2.4} />
            <circle cx={0} cy={0} r={48} fill="none" stroke="#141414" strokeWidth={2.8} />
            {/* Làn gió mát thổi sang trái */}
            {[0, 1, 2].map((wi) => {
              const t = (frame * 0.03 + wi * 0.33) % 1;
              const wx = -62 - t * 145;
              const wy = -24 + wi * 24 + Math.sin(frame * 0.14 + wi) * 5;
              return (
                <path
                  key={`wind_${wi}`}
                  d={`M ${wx.toFixed(1)},${wy.toFixed(1)} Q ${(wx - 28).toFixed(1)},${(wy - 9).toFixed(1)} ${(wx - 56).toFixed(1)},${wy.toFixed(1)}`}
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  opacity={(Math.sin(t * Math.PI) * 0.85).toFixed(2)}
                />
              );
            })}
          </g>
        </g>
      )}
    </g>
  );
};

/**
 * 2. BEDROOM_INDOOR: Phòng ngủ ấm áp (tường kem, giường, tủ đầu giường + đèn ngủ, cửa sổ ngày/đêm)
 */
export const BedroomIndoorBackdrop: React.FC<{
  timeOfDay?: KassTimeOfDay;
  frame?: number;
  groundY?: number;
  rainOutside?: boolean;
}> = ({ timeOfDay = "DAY", frame = 0, groundY = 840, rainOutside = false }) => {
  const isNight = timeOfDay === "NIGHT";
  const isSunset = timeOfDay === "SUNSET";
  const wallFill = isNight ? "#334155" : isSunset ? "#FDE68A" : "#FEF9C3";
  const winSky = rainOutside ? "#1E293B" : isNight ? "#0F172A" : isSunset ? "#FB923C" : "#7DD3FC";
  const winCloudX = ((40 + frame * 0.18) % 340) - 20;

  return (
    <g id="stage-bedroom-indoor" stroke="#141414" strokeWidth={3} strokeLinejoin="round">
      {/* Tường kem ấm */}
      <rect x={0} y={0} width={1920} height={770} fill={wallFill} stroke="none" />
      {/* Đường len tường gỗ */}
      <rect x={0} y={745} width={1920} height={26} fill="#B45309" />
      {/* Sàn gỗ ấm */}
      <rect x={0} y={770} width={1920} height={310} fill={isNight ? "#475569" : "#D6A874"} stroke="none" />
      <line x1={0} y1={770} x2={1920} y2={770} stroke="#141414" strokeWidth={3} />
      {[845, 925, 1005].map((fy) => (
        <line key={`plank_${fy}`} x1={0} y1={fy} x2={1920} y2={fy} stroke="#92400E" strokeWidth={2} opacity={0.35} />
      ))}

      {/* Cửa sổ nhìn ra bầu trời ngày/chiều/đêm hoặc cơn mưa rào (V17.2: nâng đỉnh lên y=108, đáy ở y=336 để đầu nhân vật đứng dưới sàn không bao giờ chạm viền cửa sổ!) */}
      <g transform="translate(260, 108)">
        <rect x={0} y={0} width={360} height={228} rx={12} fill={winSky} />
        {rainOutside ? (
          <g stroke="#93C5FD" strokeWidth={2.5} strokeLinecap="round" opacity={0.85}>
            {Array.from({ length: 16 }).map((_, ri) => {
              const rx = 20 + ((ri * 37) % 320);
              const ry = ((ri * 53 + frame * 11) % 205) + 5;
              return <line key={`win_rain_${ri}`} x1={rx} y1={ry} x2={rx - 8} y2={Math.min(220, ry + 22)} />;
            })}
          </g>
        ) : isNight ? (
          <>
            <path d="M 85,48 A 28,28 0 1,0 85,103 A 21,21 0 1,1 85,48 Z" fill="#FEF08A" stroke="none" />
            <circle cx={240} cy={62} r={3.5} fill="#FEF9C3" stroke="none" />
            <circle cx={290} cy={112} r={2.8} fill="#FEF9C3" stroke="none" />
          </>
        ) : (
          <>
            <circle cx={265} cy={68} r={34} fill="#FDE047" stroke="#141414" strokeWidth={2.5} />
            <ellipse cx={Math.max(48, Math.min(310, winCloudX))} cy={86} rx={36} ry={16} fill="#FFFFFF" stroke="none" opacity={0.85} />
          </>
        )}
        <line x1={180} y1={0} x2={180} y2={228} stroke="#141414" strokeWidth={3} />
        <line x1={0} y1={114} x2={360} y2={114} stroke="#141414" strokeWidth={3} />
        <rect x={0} y={0} width={360} height={228} rx={12} fill="none" stroke="#92400E" strokeWidth={10} />
        <rect x={0} y={0} width={360} height={228} rx={12} fill="none" stroke="#141414" strokeWidth={3} />
      </g>

      {/* Giường ngủ ấm cúng bên phải */}
      <g transform="translate(1150, 560)">
        <rect x={445} y={-65} width={45} height={275} rx={8} fill="#92400E" />
        <rect x={0} y={40} width={35} height={170} rx={8} fill="#92400E" />
        <rect x={22} y={80} width={440} height={105} rx={12} fill="#FFFFFF" />
        {/* Gối trắng mềm */}
        <ellipse cx={395} cy={68} rx={58} ry={24} fill="#F8FAFC" />
        {/* Chăn xanh pastel */}
        <path d="M 22,82 L 325,82 Q 345,120 335,185 L 22,185 Z" fill="#93C5FD" />
        <rect x={15} y={168} width={460} height={36} rx={8} fill="#B45309" />
      </g>

      {/* Tủ đầu giường + Đèn ngủ nhỏ */}
      <g transform="translate(970, 620)">
        <rect x={0} y={35} width={145} height={135} rx={10} fill="#C26A27" />
        <rect x={16} y={54} width={113} height={42} rx={6} fill="#D97706" />
        <circle cx={72} cy={75} r={5} fill="#FEF3C7" />
        <rect x={16} y={108} width={113} height={42} rx={6} fill="#D97706" />
        <circle cx={72} cy={129} r={5} fill="#FEF3C7" />
        {/* Đèn ngủ nhỏ */}
        {isNight && <circle cx={72} cy={-26} r={115} fill="#FEF08A" opacity={0.22} stroke="none" />}
        <rect x={54} y={16} width={36} height={19} rx={5} fill="#64748B" />
        <line x1={72} y1={-8} x2={72} y2={16} stroke="#141414" strokeWidth={4} />
        <polygon points="36,-8 108,-8 92,-56 52,-56" fill={isNight ? "#FEF08A" : "#FDE68A"} />
      </g>
    </g>
  );
};

/**
 * 3. UNDERGROUND_CROSS_SECTION: Mặt cắt lòng đất (cỏ xanh + mô đất nhỏ phía trên + thành phố đường hầm & hang kiến đỏ bên dưới)
 */
export const UndergroundCrossSectionStage: React.FC<{
  frame?: number;
  localFrame?: number;
  showAnts?: boolean;
  evacuateEggs?: boolean;
}> = ({ frame = 0, localFrame = 0, showAnts = true, evacuateEggs = false }) => {
  // Các tuyến đường hầm Bezier bậc 2 từ miệng mô đất (960, 250) tỏa xuống 6 khoang hang (nâng cao 45px để không bao giờ bị phụ đề chạm!)
  const tunnelCurves = [
    { x0: 960, y0: 250, cx: 952, cy: 390, x1: 964, y1: 525, w: 34 },
    { x0: 964, y0: 525, cx: 970, cy: 655, x1: 950, y1: 785, w: 34 },
    { x0: 956, y0: 360, cx: 780, cy: 392, x1: 625, y1: 438, w: 28 },
    { x0: 625, y0: 438, cx: 510, cy: 468, x1: 415, y1: 518, w: 28 },
    { x0: 962, y0: 405, cx: 1145, cy: 432, x1: 1315, y1: 486, w: 28 },
    { x0: 1315, y0: 486, cx: 1435, cy: 525, x1: 1535, y1: 572, w: 28 },
    { x0: 964, y0: 545, cx: 800, cy: 588, x1: 650, y1: 655, w: 30 },
    { x0: 650, y0: 655, cx: 560, cy: 695, x1: 475, y1: 742, w: 30 },
    { x0: 966, y0: 575, cx: 1160, cy: 615, x1: 1325, y1: 688, w: 30 },
    { x0: 1325, y0: 688, cx: 1415, cy: 728, x1: 1490, y1: 762, w: 30 },
    { x0: 645, y0: 438, cx: 662, cy: 545, x1: 652, y1: 655, w: 24 },
    { x0: 1315, y0: 486, cx: 1290, cy: 588, x1: 1322, y1: 688, w: 24 },
  ];

  const chambers = [
    { cx: 410, cy: 520, rx: 92, ry: 44, kind: "eggs" as const },
    { cx: 1545, cy: 575, rx: 98, ry: 46, kind: "food" as const },
    { cx: 475, cy: 745, rx: 102, ry: 46, kind: "workers" as const },
    { cx: 1495, cy: 765, rx: 104, ry: 46, kind: "guards" as const },
    { cx: 950, cy: 802, rx: 138, ry: 52, kind: "queen" as const },
    { cx: 655, cy: 542, rx: 64, ry: 32, kind: "workers" as const },
  ];

  const evalQuadBezier = (c: (typeof tunnelCurves)[number], t: number) => {
    const mt = 1 - t;
    const x = mt * mt * c.x0 + 2 * mt * t * c.cx + t * t * c.x1;
    const y = mt * mt * c.y0 + 2 * mt * t * c.cy + t * t * c.y1;
    const dx = 2 * mt * (c.cx - c.x0) + 2 * t * (c.x1 - c.cx);
    const dy = 2 * mt * (c.cy - c.y0) + 2 * t * (c.y1 - c.cy);
    return { x, y, angleDeg: (Math.atan2(dy, dx) * 180) / Math.PI };
  };

  return (
    <g id="stage-underground-cross-section">
      <defs>
        <linearGradient id="ug-sky-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#E0F2FE" />
        </linearGradient>
        <linearGradient id="ug-soil-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#92400E" />
          <stop offset="35%" stopColor="#78350F" />
          <stop offset="75%" stopColor="#5C2D12" />
          <stop offset="100%" stopColor="#3B1A08" />
        </linearGradient>
      </defs>

      {/* Bầu trời xanh nhẹ trên mặt đất */}
      <rect x={0} y={0} width={1920} height={265} fill="url(#ug-sky-grad)" />
      {/* Lớp đất phân tầng sâu bên dưới */}
      <rect x={0} y={265} width={1920} height={815} fill="url(#ug-soil-grad)" />

      {/* Các dải tầng đất uốn lượn tự nhiên */}
      <path d="M 0,430 Q 480,400 960,435 T 1920,420 L 1920,640 Q 1440,670 960,635 T 0,655 Z" fill="#6D2F0E" opacity={0.45} />
      <path d="M 0,720 Q 520,695 960,730 T 1920,710 L 1920,1080 L 0,1080 Z" fill="#451A03" opacity={0.42} />

      {/* Thân & rễ cây xoài ăn sâu bên mép trái và phải */}
      <g stroke="#141414" strokeWidth={3} strokeLinejoin="round">
        <path d="M 180,265 Q 245,355 290,460 Q 315,520 355,565" fill="none" stroke="#573216" strokeWidth={16} strokeLinecap="round" />
        <path d="M 180,265 Q 245,355 290,460 Q 315,520 355,565" fill="none" stroke="#141414" strokeWidth={3} strokeLinecap="round" />
        <path d="M 1735,265 Q 1680,365 1620,465 Q 1585,525 1545,560" fill="none" stroke="#573216" strokeWidth={15} strokeLinecap="round" />
      </g>

      {/* Lớp cỏ xanh mặt trên */}
      <path
        d="M 0,235 Q 240,224 480,235 T 960,232 T 1440,236 T 1920,230 L 1920,275 L 0,275 Z"
        fill="#22C55E"
        stroke="#141414"
        strokeWidth={3}
      />

      {/* Mô đất nhỏ xíu trên mặt cỏ (phần nổi!) */}
      <path
        d="M 885,252 Q 912,188 960,185 Q 1008,188 1035,252 Z"
        fill="#B45309"
        stroke="#141414"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path d="M 915,212 Q 945,196 985,204" fill="none" stroke="#D97706" strokeWidth={5} strokeLinecap="round" opacity={0.65} />

      {/* Viên đá sỏi nằm rải rác trong tầng đất */}
      {[
        { x: 250, y: 690, rx: 28, ry: 16 },
        { x: 785, y: 505, rx: 20, ry: 12 },
        { x: 1165, y: 375, rx: 22, ry: 13 },
        { x: 1695, y: 715, rx: 30, ry: 17 },
        { x: 1185, y: 815, rx: 24, ry: 14 },
        { x: 765, y: 810, rx: 22, ry: 12 },
      ].map((st, idx) => (
        <ellipse
          key={`ug_stone_${idx}`}
          cx={st.x}
          cy={st.y}
          rx={st.rx}
          ry={st.ry}
          fill="#64748B"
          stroke="#141414"
          strokeWidth={2.5}
          opacity={0.75}
        />
      ))}

      {/* HỆ THỐNG ĐƯỜNG HẦM & HANG KIẾN (Vẽ lớp viền đen trước -> lớp lõi tối rỗng sau để nối thông mượt 100%) */}
      <g id="ant-tunnel-network">
        {tunnelCurves.map((tc, idx) => (
          <path
            key={`tun_outer_${idx}`}
            d={`M ${tc.x0},${tc.y0} Q ${tc.cx},${tc.cy} ${tc.x1},${tc.y1}`}
            fill="none"
            stroke="#141414"
            strokeWidth={tc.w + 8}
            strokeLinecap="round"
          />
        ))}
        {chambers.map((ch, idx) => (
          <ellipse
            key={`ch_outer_${idx}`}
            cx={ch.cx}
            cy={ch.cy}
            rx={ch.rx + 4}
            ry={ch.ry + 4}
            fill="#141414"
          />
        ))}
        {tunnelCurves.map((tc, idx) => (
          <path
            key={`tun_inner_${idx}`}
            d={`M ${tc.x0},${tc.y0} Q ${tc.cx},${tc.cy} ${tc.x1},${tc.y1}`}
            fill="none"
            stroke="#2D1508"
            strokeWidth={tc.w}
            strokeLinecap="round"
          />
        ))}
        {chambers.map((ch, idx) => (
          <ellipse
            key={`ch_inner_${idx}`}
            cx={ch.cx}
            cy={ch.cy}
            rx={ch.rx}
            ry={ch.ry}
            fill="#281107"
          />
        ))}

        {/* Kiến thợ, trứng & hạt thức ăn đông vui bên trong CẢ 6 khoang hang */}
        {showAnts &&
          chambers.map((ch, cIdx) => {
            if (ch.kind === "queen") return null;
            const localCount = ch.rx > 80 ? 6 : 4;
            return (
              <g key={`ch_life_${cIdx}`} transform={`translate(${ch.cx}, ${ch.cy})`}>
                {/* Trứng kiến hoặc hạt thức ăn tích trữ trong khoang */}
                {ch.kind === "eggs" &&
                  [-34, -22, -12, 8, 22, 34].map((ex, ei) => (
                    <ellipse
                      key={`ch_egg_${ei}`}
                      cx={ex}
                      cy={12 + (ei % 2) * 6}
                      rx={6}
                      ry={3.8}
                      fill="#FEF9C3"
                      stroke="#78350F"
                      strokeWidth={1.4}
                    />
                  ))}
                {ch.kind === "food" &&
                  [-36, -16, 6, 26, 42].map((fx, fi) => (
                    <circle
                      key={`ch_food_${fi}`}
                      cx={fx}
                      cy={14 + (fi % 2) * 5}
                      r={5.5}
                      fill={fi % 2 === 0 ? "#FACC15" : "#84CC16"}
                      stroke="#141414"
                      strokeWidth={1.5}
                    />
                  ))}
                {/* Đàn kiến đỏ tụ tập hoạt động bên trong từng khoang */}
                {Array.from({ length: localCount }).map((_, k) => {
                  const phase = localFrame * (0.04 + (k % 3) * 0.012) + k * 1.4 + cIdx * 0.9;
                  const ax = Math.cos(phase) * (ch.rx * 0.56);
                  const ay = Math.sin(phase * 1.2) * (ch.ry * 0.42) - 4;
                  const rot = (Math.atan2(Math.cos(phase * 1.2) * ch.ry, -Math.sin(phase) * ch.rx) * 180) / Math.PI;
                  return (
                    <g key={`ch_ant_${k}`} transform={`translate(${ax.toFixed(1)}, ${ay.toFixed(1)}) rotate(${rot.toFixed(0)})`}>
                      <ellipse cx={-4.5} cy={0} rx={4.6} ry={2.8} fill="#EF4444" />
                      <circle cx={1.2} cy={0} r={2.5} fill="#DC2626" />
                      <circle cx={5} cy={0} r={2.2} fill="#FCA5A5" />
                    </g>
                  );
                })}
              </g>
            );
          })}

        {/* Kiến chúa lớn hơn một chút + kiến thợ chăm sóc ở phòng trung tâm đáy hang (y=802, thoáng sạch trên phụ đề!) */}
        <g transform="translate(950, 804)">
          <ellipse cx={-16} cy={0} rx={16} ry={9.5} fill="#B91C1C" stroke="#141414" strokeWidth={2.5} />
          <ellipse cx={4} cy={-2} rx={9.5} ry={6.5} fill="#DC2626" stroke="#141414" strokeWidth={2.2} />
          <circle cx={17} cy={-3} r={6.2} fill="#991B1B" stroke="#141414" strokeWidth={2} />
          {/* Trứng kiến trắng nhỏ xung quanh */}
          {[-54, -42, -30, 34, 46, 58].map((ex, i) => (
            <ellipse key={`egg_${i}`} cx={ex} cy={12 + (i % 2) * 5} rx={6.2} ry={4} fill="#FEF9C3" stroke="#78350F" strokeWidth={1.5} />
          ))}
          {[-72, -48, 52, 78].map((wx, wi) => (
            <g
              key={`queen_guard_${wi}`}
              transform={`translate(${(wx + Math.sin(localFrame * 0.06 + wi) * 6).toFixed(1)}, ${(-14 + (wi % 2) * 18).toFixed(1)})`}
            >
              <ellipse cx={-4} cy={0} rx={4.5} ry={2.7} fill="#EF4444" />
              <circle cx={1} cy={0} r={2.4} fill="#DC2626" />
              <circle cx={4.6} cy={0} r={2.0} fill="#FCA5A5" />
            </g>
          ))}
        </g>

        {/* Đàn kiến đỏ bám CHÍNH XÁC từng đường cong Bezier bên trong đường hầm (có thể tha trứng di tản khi evacuateEggs=true!) */}
        {showAnts &&
          tunnelCurves.map((curve, cIdx) =>
            [0, 1, 2, 3].map((aIdx) => {
              const dir = evacuateEggs ? 1 : aIdx % 2 === 0 ? 1 : -1;
              const speedMul = evacuateEggs ? 1.55 : 1.0;
              const rawP = (localFrame * (0.0052 + (aIdx % 3) * 0.0014) * speedMul + aIdx * 0.24 + cIdx * 0.13) % 1;
              const t = dir > 0 ? rawP : 1 - rawP;
              const pt = evalQuadBezier(curve, t);
              const angle = pt.angleDeg + (dir < 0 ? 180 : 0);
              return (
                <g key={`ug_ant_${cIdx}_${aIdx}`} transform={`translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)}) rotate(${angle.toFixed(0)})`}>
                  <ellipse cx={-4.4} cy={0} rx={4.5} ry={2.7} fill="#EF4444" />
                  <circle cx={1.2} cy={0} r={2.4} fill="#DC2626" />
                  <circle cx={4.8} cy={0} r={2.1} fill="#FCA5A5" />
                  {evacuateEggs && aIdx % 2 === 0 && (
                    <ellipse cx={9.5} cy={-1} rx={4.2} ry={2.8} fill="#FEF9C3" stroke="#78350F" strokeWidth={1.1} />
                  )}
                </g>
              );
            })
          )}
      </g>

      {/* Thước đo chiều sâu trực quan bên trái (~1.2 MÉT, nâng chân lên 835px sạch trên phụ đề) */}
      <g transform="translate(115, 275)">
        <line x1={0} y1={0} x2={0} y2={560} stroke="#FEF08A" strokeWidth={4} strokeDasharray="12 8" strokeLinecap="round" />
        <line x1={-16} y1={0} x2={16} y2={0} stroke="#FEF08A" strokeWidth={4} strokeLinecap="round" />
        <line x1={-16} y1={560} x2={16} y2={560} stroke="#FEF08A" strokeWidth={4} strokeLinecap="round" />
        <rect x={-52} y={258} width={116} height={44} rx={12} fill="#FEF08A" stroke="#141414" strokeWidth={3} />
        <text
          x={6}
          y={287}
          textAnchor="middle"
          fill="#141414"
          fontSize={20}
          fontWeight={900}
          fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
        >
          &gt; 1 MÉT
        </text>
      </g>
    </g>
  );
};

/**
 * 4. EXPLAINER_POLKA_DOT: Phông nền pastel chấm bi nhẹ cho cảnh so sánh / kính lúp / giải thích khoa học
 */
export const ExplainerPolkaDotBackdrop: React.FC<{ palette?: PolkaPalette }> = ({
  palette = "cream",
}) => {
  const colors =
    palette === "mint"
      ? { bg: "#DCFCE7", dot: "#86EFAC" }
      : palette === "lavender"
      ? { bg: "#EDE9FE", dot: "#C4B5FD" }
      : { bg: "#FEF9C3", dot: "#FDE047" };
  const patternId = `kass-polka-${palette}`;
  return (
    <g id="stage-explainer-polka-dot">
      <defs>
        <pattern id={patternId} width={56} height={56} patternUnits="userSpaceOnUse">
          <circle cx={14} cy={14} r={5.5} fill={colors.dot} opacity={0.42} />
          <circle cx={42} cy={42} r={5.5} fill={colors.dot} opacity={0.42} />
        </pattern>
      </defs>
      <rect x={0} y={0} width={1920} height={1080} fill={colors.bg} />
      <rect x={0} y={0} width={1920} height={1080} fill={`url(#${patternId})`} />
    </g>
  );
};

/**
 * Đạo cụ Kính Lúp Soi Khoa Học tái sử dụng (MagnifyingGlassOverlay)
 */
export const MagnifyingGlassOverlay: React.FC<{
  x: number;
  y: number;
  radius?: number;
  handleAngleDeg?: number;
  localFrame?: number;
}> = ({ x, y, radius = 96, handleAngleDeg = 42, localFrame = 0 }) => {
  const swayX = Math.sin(localFrame * 0.05) * 8;
  const swayY = Math.cos(localFrame * 0.04) * 6;
  const rad = (handleAngleDeg * Math.PI) / 180;
  const hx1 = Math.cos(rad) * (radius + 6);
  const hy1 = Math.sin(rad) * (radius + 6);
  const hx2 = Math.cos(rad) * (radius + 98);
  const hy2 = Math.sin(rad) * (radius + 98);

  return (
    <g transform={`translate(${(x + swayX).toFixed(1)}, ${(y + swayY).toFixed(1)})`}>
      {/* Tay cầm kính lúp */}
      <line x1={hx1} y1={hy1} x2={hx2} y2={hy2} stroke="#141414" strokeWidth={24} strokeLinecap="round" />
      <line x1={hx1} y1={hy1} x2={hx2} y2={hy2} stroke="#78350F" strokeWidth={15} strokeLinecap="round" />
      {/* Mặt kính trong nhẹ + vệt phản sáng */}
      <circle cx={0} cy={0} r={radius} fill="#E0F2FE" fillOpacity={0.22} />
      <path
        d={`M ${-radius * 0.58},${-radius * 0.42} A ${radius * 0.72},${radius * 0.72} 0 0,1 ${radius * 0.25},${-radius * 0.68}`}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={7}
        strokeLinecap="round"
        opacity={0.78}
      />
      {/* Viền kim loại xám đậm */}
      <circle cx={0} cy={0} r={radius} fill="none" stroke="#141414" strokeWidth={16} />
      <circle cx={0} cy={0} r={radius} fill="none" stroke="#94A3B8" strokeWidth={8} />
    </g>
  );
};

/**
 * 5. SIMPLE_GRASS_FIELD: Bãi cỏ xanh rì có cây xoài sai quả & mây trôi (hỗ trợ DAY / SUNSET / NIGHT)
 */
export const SimpleGrassFieldBackdrop: React.FC<{
  timeOfDay?: KassTimeOfDay;
  frame?: number;
  groundY?: number;
  weather?: "CLEAR" | "RAIN" | "FLOOD";
  showRainbow?: boolean;
}> = ({ timeOfDay = "SUNSET", frame = 0, groundY = 840, weather = "CLEAR", showRainbow = false }) => {
  const isSunset = timeOfDay === "SUNSET";
  const isNight = timeOfDay === "NIGHT";
  const isRain = weather === "RAIN";
  const isFlood = weather === "FLOOD";
  // V14.1 / V15.0 Living Scene Rule: Mây trôi chậm đều sang phải (cloudX += frame * 0.18) & tán cây đung đưa theo gió
  const cloudDriftPx = frame * (isRain ? 0.55 : 0.18);
  const breezeDeg = Math.sin(frame * (isRain ? 0.08 : 0.04)) * (isRain ? 3.2 : 1.5);

  const skyTop = isRain ? "#334155" : isNight ? "#1E293B" : isSunset ? "#F97316" : isFlood ? "#7DD3FC" : "#60A5FA";
  const skyMid = isRain ? "#475569" : isNight ? "#0F172A" : isSunset ? "#FDBA74" : isFlood ? "#BAE6FD" : "#BAE6FD";
  const skyBot = isRain ? "#64748B" : isNight ? "#090E1A" : isSunset ? "#FEF3C7" : "#F0F9FF";
  const hillBack = isNight ? "#111C2E" : isSunset ? "#65A30D" : "#86EFAC";
  const grassTop = isNight ? "#14382A" : isSunset ? "#4D7C0F" : "#4ADE80";
  const grassBot = isNight ? "#091D15" : isSunset ? "#365314" : "#22C55E";
  const canopyMain = isNight ? "#14532D" : isSunset ? "#15803D" : "#22C55E";
  const canopyDark = isNight ? "#052E16" : isSunset ? "#166534" : "#16A34A";

  return (
    <g id="stage-simple-grass-field">
      <defs>
        <linearGradient id={`field-sky-${timeOfDay}-${weather}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyTop} />
          <stop offset="56%" stopColor={skyMid} />
          <stop offset="100%" stopColor={skyBot} />
        </linearGradient>
        <linearGradient id={`field-grass-${timeOfDay}-${weather}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={grassTop} />
          <stop offset="100%" stopColor={grassBot} />
        </linearGradient>
      </defs>

      <rect x={0} y={0} width={1920} height={groundY} fill={`url(#field-sky-${timeOfDay}-${weather})`} />

      {/* Mặt trời chiều dịu / ban ngày */}
      {!isNight && (
        <g transform={`translate(${isSunset ? 285 : 320}, ${isSunset ? 470 : 175})`}>
          <circle cx={0} cy={0} r={isSunset ? 115 : 80} fill="#FEF08A" opacity={0.34} />
          <circle
            cx={0}
            cy={0}
            r={isSunset ? 60 : 46}
            fill={isSunset ? "#FB923C" : "#FDE047"}
            stroke="#141414"
            strokeWidth={3}
          />
        </g>
      )}

      {/* Cầu vồng rực rỡ sau cơn mưa (khi showRainbow=true) */}
      {showRainbow && (
        <g opacity={0.55}>
          {[
            { r: 540, color: "#EF4444" },
            { r: 522, color: "#F97316" },
            { r: 504, color: "#FACC15" },
            { r: 486, color: "#22C55E" },
            { r: 468, color: "#38BDF8" },
            { r: 450, color: "#8B5CF6" },
          ].map((arc, i) => (
            <path
              key={`rb_${i}`}
              d={`M ${960 - arc.r},740 A ${arc.r},${arc.r} 0 0,1 ${960 + arc.r},740`}
              fill="none"
              stroke={arc.color}
              strokeWidth={16}
            />
          ))}
        </g>
      )}

      {/* Mây trôi chậm đều sang phải (cloudX += frame * 0.18, y>=195 thoáng tiêu đề nổi) */}
      {(!isNight || isRain) &&
        [
          { bx: 240, y: 195, s: isRain ? 1.35 : 1.0 },
          { bx: 880, y: 208, s: isRain ? 1.45 : 1.08 },
          { bx: 1520, y: 195, s: isRain ? 1.3 : 0.92 },
        ].map((c, idx) => {
          const cx = ((c.bx + cloudDriftPx * (0.9 + idx * 0.12) + 120) % 2160) - 120;
          return (
            <g key={`field_cloud_${idx}`} transform={`translate(${cx.toFixed(1)}, ${c.y}) scale(${c.s})`}>
              <path
                d="M -68,18 C -86,18 -92,-6 -68,-12 C -62,-38 -22,-44 -6,-24 C 12,-44 54,-36 58,-10 C 82,-6 80,18 58,18 Z"
                fill={isRain ? "#475569" : isSunset ? "#FFEDD5" : "#FFFFFF"}
                stroke="#141414"
                strokeWidth={3}
                strokeLinejoin="round"
              />
            </g>
          );
        })}

      {/* Đồi cỏ thoai thoải phía xa */}
      <path
        d={`M -20,${groundY - 40} Q 340,605 720,685 T 1460,655 T 1940,680 L 1940,${groundY} L -20,${groundY} Z`}
        fill={hillBack}
        stroke="#141414"
        strokeWidth={3}
      />

      {/* Mặt bãi cỏ xanh rì */}
      <rect x={0} y={760} width={1920} height={320} fill={`url(#field-grass-${timeOfDay}-${weather})`} />
      <line x1={0} y1={760} x2={1920} y2={760} stroke="#141414" strokeWidth={3} />

      {/* Cây xoài cổ thụ rợp bóng bên phải với những quả xoài chín vàng */}
      <g id="mango-tree" transform="translate(1515, 790)" stroke="#141414" strokeWidth={3} strokeLinejoin="round">
        {/* Bóng râm dưới gốc cây xoài */}
        <ellipse cx={-60} cy={52} rx={275} ry={28} fill="#0F172A" opacity={0.18} stroke="none" />
        {/* Thân & rễ cây xoài bám đất */}
        <path
          d="M -95,50 Q -50,24 -44,-65 L -36,-380 L 42,-380 L 52,-65 Q 64,24 110,50 Z"
          fill="#78350F"
        />
        {/* Cành lớn vươn trái & phải */}
        <path d="M -38,-295 Q -150,-365 -245,-385 L -230,-415 Q -135,-395 -28,-335 Z" fill="#78350F" />
        <path d="M 38,-305 Q 155,-365 240,-380 L 230,-412 Q 145,-395 28,-342 Z" fill="#78350F" />
        {/* Tán lá xanh rậm + những quả xoài chín vàng đung đưa nhẹ theo gió (Math.sin(frame * 0.04) * 1.5°) */}
        <g transform={`rotate(${breezeDeg.toFixed(2)}, 0, -340)`}>
          <circle cx={-195} cy={-445} r={118} fill={canopyDark} />
          <circle cx={195} cy={-440} r={120} fill={canopyDark} />
          <circle cx={-65} cy={-515} r={145} fill={canopyMain} />
          <circle cx={85} cy={-505} r={138} fill={canopyMain} />
          <circle cx={0} cy={-430} r={125} fill={canopyMain} />
          {[
            { x: -165, y: -385, rot: 12 },
            { x: -65, y: -425, rot: -8 },
            { x: 58, y: -395, rot: 15 },
            { x: 155, y: -415, rot: -10 },
          ].map((m, i) => (
            <g
              key={`mango_${i}`}
              transform={`translate(${m.x}, ${m.y}) rotate(${(m.rot + Math.sin(frame * 0.05 + i) * 2.5).toFixed(1)})`}
            >
              <line x1={0} y1={-22} x2={0} y2={-6} stroke="#141414" strokeWidth={2.5} />
              <ellipse cx={0} cy={8} rx={13} ry={18} fill={i % 2 === 0 ? "#FACC15" : "#A3E635"} stroke="#141414" strokeWidth={2.8} />
            </g>
          ))}
        </g>
      </g>

      {/* Lớp nước mưa dâng ngập khu vườn (weather === "FLOOD") với sóng gợn lăn tăn 60fps */}
      {isFlood && (
        <g id="flood-water-layer">
          <rect x={0} y={786} width={1920} height={294} fill="#38BDF8" opacity={0.62} />
          <line x1={0} y1={786} x2={1920} y2={786} stroke="#0369A1" strokeWidth={3.5} />
          {[220, 560, 910, 1280, 1640].map((wx, wi) => {
            const shift = Math.sin(frame * 0.06 + wi) * 24;
            return (
              <path
                key={`flood_wave_${wi}`}
                d={`M ${wx + shift},820 Q ${wx + 55 + shift},810 ${wx + 110 + shift},820`}
                fill="none"
                stroke="#E0F2FE"
                strokeWidth={3.5}
                strokeLinecap="round"
                opacity={0.78}
              />
            );
          })}
        </g>
      )}

      {/* Hiệu ứng mưa rào xối xả 60fps (weather === "RAIN") — phân bổ đều toàn màn hình 1920x1080 */}
      {isRain && (
        <g id="heavy-rain-layer" stroke="#BAE6FD" strokeLinecap="round">
          {Array.from({ length: 64 }).map((_, ri) => {
            const baseX = ((ri * 197 + (ri % 5) * 43) % 2160) - 40;
            const y = ((ri * 293 + frame * 24) % 1180) - 90;
            const x = baseX - y * 0.18;
            return (
              <line
                key={`rain_streak_${ri}`}
                x1={x.toFixed(1)}
                y1={y.toFixed(1)}
                x2={(x - 12).toFixed(1)}
                y2={(y + 40).toFixed(1)}
                strokeWidth={ri % 3 === 0 ? 3.2 : 2.2}
                opacity={ri % 3 === 0 ? 0.78 : 0.52}
              />
            );
          })}
          {/* Vòng nước bắn khi mưa rơi xuống mặt cỏ */}
          {[320, 720, 1080, 1460].map((px, pi) => {
            const p = (frame * 0.08 + pi * 0.27) % 1;
            return (
              <ellipse
                key={`splash_${pi}`}
                cx={px}
                cy={848}
                rx={12 + p * 34}
                ry={4 + p * 8}
                fill="none"
                stroke="#E0F2FE"
                strokeWidth={2.5}
                opacity={1 - p}
              />
            );
          })}
        </g>
      )}
    </g>
  );
};

/**
 * Mô đất kiến lửa tròn xoe dưới gốc xoài (có thể ở trạng thái yên tĩnh / mới trào ra / sôi lên!)
 */
export const FireAntMound: React.FC<{
  x: number;
  y: number;
  scale?: number;
  swarmLevel?: "calm" | "emerging" | "boiling";
  localFrame: number;
  u: number;
}> = ({ x, y, scale = 1, swarmLevel = "calm", localFrame, u }) => {
  const boilShakeX = swarmLevel === "boiling" ? Math.sin(localFrame * 0.7) * 2.2 : 0;
  const antCount = swarmLevel === "boiling" ? 34 : swarmLevel === "emerging" ? 18 : 0;
  const emergeT = swarmLevel === "emerging" ? smoothstep(0.40, 0.95, u) : swarmLevel === "boiling" ? 1 : 0;

  return (
    <g transform={`translate(${(x + boilShakeX).toFixed(1)}, ${y}) scale(${scale})`}>
      {/* Bóng đổ dưới mô đất */}
      <ellipse cx={0} cy={6} rx={118} ry={16} fill="#0F172A" opacity={0.22} />
      {/* Mô đất tròn xoe mịn màng giống chiếc bánh bao (không có lỗ trên đỉnh!) */}
      <path
        d="M -108,4 Q -94,-96 0,-102 Q 94,-96 108,4 Z"
        fill="#B45309"
        stroke="#141414"
        strokeWidth={3.5}
        strokeLinejoin="round"
      />
      {/* Điểm nhấn khối tròn 3D */}
      <path d="M -68,-44 Q -24,-86 42,-78" fill="none" stroke="#D97706" strokeWidth={8} strokeLinecap="round" opacity={0.58} />
      {/* Các hạt đất li ti trên bề mặt mô */}
      {[
        { cx: -52, cy: -22 },
        { cx: -18, cy: -54 },
        { cx: 28, cy: -40 },
        { cx: 64, cy: -18 },
        { cx: 4, cy: -20 },
      ].map((d, i) => (
        <circle key={`dirt_${i}`} cx={d.cx} cy={d.cy} r={3.5} fill="#78350F" opacity={0.75} />
      ))}

      {/* Chấm kiến đỏ lửa bắt đầu trào ra / sôi sục trên mặt mô đất */}
      {antCount > 0 &&
        emergeT > 0.02 &&
        Array.from({ length: antCount }).map((_, idx) => {
          const angle = ((idx * 137.5) % 180) * (Math.PI / 180);
          const speed = 0.06 + (idx % 5) * 0.018;
          const dist =
            swarmLevel === "boiling"
              ? 14 + ((localFrame * (1.8 + (idx % 4) * 0.5) + idx * 17) % 115)
              : 10 + emergeT * (18 + (idx % 6) * 14);
          const ax = Math.cos(angle) * dist * 0.95;
          const ay = -Math.sin(angle) * dist * 0.78 - 10;
          const jitter = Math.sin(localFrame * speed * 8 + idx) * 2.5;
          return (
            <g key={`mound_ant_${idx}`} transform={`translate(${(ax + jitter).toFixed(1)}, ${ay.toFixed(1)})`}>
              <ellipse cx={0} cy={0} rx={4.5} ry={2.8} fill="#DC2626" stroke="#141414" strokeWidth={1.2} />
              <circle cx={-3.5} cy={-0.5} r={2} fill="#991B1B" />
            </g>
          );
        })}
    </g>
  );
};

/**
 * Sân khấu diễn xuất hoàn chỉnh cho V14.0 ("Mô Đất Kỳ Lạ Dưới Gốc Xoài") kết hợp 5 Bối Cảnh + 5 Preset Người Que Thuần
 */
export const KassStorySceneLayer: React.FC<{
  mode: KassStoryDemoMode;
  frame: number;
  localFrame: number;
  durationFrames: number;
  u: number;
  groundY?: number;
}> = ({ mode, frame, localFrame, durationFrames, u, groundY = 840 }) => {
  const STRIDE_CYCLE_PX = 160;

  // =========================================================================
  // BEAT 1 (V14.1 Living Scene): COUNTRYSIDE_YARD (DAY)
  // - 55% đầu cảnh: BOY bước đi vui vẻ từ bên trái tiến lại giữa sân (resolvePendulumLegs + nhún hông),
  //   tay phải vừa đi vừa vẫy mượt 60fps (-115°, -150° + sin(frame*0.28)*28°), tới giữa sân dừng lại cười tươi!
  // - GRANDPA trước cửa nhà ngói đỏ: mỉm cười gật gù nhẹ (Math.sin(frame*0.12)*4°) & giơ tay vẫy chào đáp lại mượt 60fps!
  // =========================================================================
  if (mode === "YARD_SUMMER_GREET") {
    const startBoyX = 240;
    const stopBoyX = 760;
    const walkT = smoothstep(0.02, 0.55, u);
    const boyX = lerpNum(startBoyX, stopBoyX, walkT);
    const deltaX = Math.abs(boyX - startBoyX);
    const rampIn = smoothstep(0.02, 0.09, u);
    const rampOut = 1 - smoothstep(0.47, 0.55, u);
    const boyWalkWeight = u <= 0.56 ? Math.min(rampIn, rampOut) : 0;
    const boyWalkCycle = (deltaX / STRIDE_CYCLE_PX) % 1;
    const grandpaY = groundY - 26;

    return (
      <g id="v14-beat1-yard-greet">
        <CountrysideYardBackdrop timeOfDay="DAY" frame={frame} groundY={groundY} />
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: boyX,
            y: groundY,
            scale: 0.96,
            facing: "right",
            pose: boyWalkWeight > 0.04 ? "walking" : "standing",
            torsoTiltDeg: boyWalkWeight * 7,
            walkCycleProgress: boyWalkCycle,
            walkWeight: boyWalkWeight,
            waveRightArm: true,
            wavePhaseOffset: 0,
            nodAmplitudeDeg: boyWalkWeight > 0.04 ? 2.5 : 3.2,
            nodFreq: 0.14,
            eyes: "happy",
            eyebrows: "raised",
            mouth: "smile",
            blush: true,
          }}
        />
        <StickmanRig
          characterPreset="GRANDPA"
          frame={frame}
          state={{
            x: 1415,
            y: grandpaY,
            scale: 0.96,
            facing: "left",
            pose: "standing",
            torsoTiltDeg: 3,
            walkWeight: 0,
            waveRightArm: true,
            wavePhaseOffset: 1.35,
            nodAmplitudeDeg: 4,
            nodFreq: 0.12,
            eyes: "happy",
            eyebrows: "neutral",
            mouth: "smile",
          }}
        />
      </g>
    );
  }

  // =========================================================================
  // V16.0: GARDEN_CHASE_DRAGONFLY — BOY cầm cành cây nhỏ chạy vui vẻ 60fps
  // đuổi theo 2 con chuồn chuồn (xanh dương & cam) + 1 con bướm vàng bay lượn hình sin mượt mà!
  // =========================================================================
  if (mode === "GARDEN_CHASE_DRAGONFLY") {
    const startX = 240;
    const endX = 1110;
    const runT = smoothstep(0.0, 0.96, u);
    const boyX = lerpNum(startX, endX, runT);
    // Nhịp chạy hoạt bát 60fps (~2.1 bước/giây = 28 frames/bước) khớp độ nghiêng thân vui vẻ
    const runCycle = (localFrame / 28) % 1;
    const rampIn = smoothstep(0.0, 0.06, u);
    const rampOut = 1 - smoothstep(0.92, 1.0, u);
    const runWeight = Math.min(rampIn, rampOut);
    const airBounce = Math.max(0, Math.sin(runCycle * Math.PI * 2)) * 10 * runWeight;

    // Tay phải cầm cành cây nhỏ vung nhẹ 60fps — neo CHÍNH XÁC 0px lệch tại cổ tay phải (nằm trong tầm IK & dưới vùng an toàn đầu!)
    const twigSwing = Math.sin(localFrame * 0.22);
    const handX = boyX + 86 + twigSwing * 10;
    const handY = groundY - 212 - airBounce + twigSwing * 14;
    const twigAngleDeg = -34 + twigSwing * 18;

    // Quỹ đạo bay lượn hình sin mượt mà 60fps cho 2 chuồn chuồn + 1 bướm vàng tách thoáng phía trước cành cây
    const bfX = Math.min(1620, boyX + 270 + Math.sin(frame * 0.062 + 2.1) * 32);
    const bfY = 515 + Math.sin(frame * 0.11 + 0.7) * 40;
    const bfRot = Math.cos(frame * 0.11 + 0.7) * 12;
    const bfWingScaleY = 0.36 + Math.abs(Math.sin(frame * 0.34)) * 0.64;

    const df1X = Math.min(1700, boyX + 355 + Math.sin(frame * 0.055) * 38);
    const df1Y = 395 + Math.sin(frame * 0.095) * 46;
    const df1Rot = Math.cos(frame * 0.095) * 15;

    const df2X = Math.min(1760, boyX + 485 + Math.cos(frame * 0.048) * 40);
    const df2Y = 475 + Math.cos(frame * 0.088 + 1.1) * 42;
    const df2Rot = -Math.sin(frame * 0.088 + 1.1) * 14;

    const renderDragonfly = (
      key: string,
      cx: number,
      cy: number,
      rotDeg: number,
      bodyColor: string,
      tailColor: string,
      wingColor: string,
      phaseOffset: number,
      scaleVal: number
    ) => {
      const wingFlapA = 4.5 + Math.sin(frame * 1.15 + phaseOffset) * 3.4;
      const wingFlapB = 4.5 + Math.cos(frame * 1.15 + phaseOffset) * 3.4;
      return (
        <g key={key} transform={`translate(${cx.toFixed(1)}, ${cy.toFixed(1)}) rotate(${rotDeg.toFixed(1)}) scale(${scaleVal})`}>
          {/* 2 cặp cánh trong suốt đập rung 60fps */}
          <ellipse cx={-2} cy={-11} rx={17} ry={wingFlapA} transform="rotate(-14, -2, -11)" fill={wingColor} fillOpacity={0.82} stroke="#141414" strokeWidth={2.0} />
          <ellipse cx={-12} cy={-9} rx={14} ry={wingFlapB} transform="rotate(-24, -12, -9)" fill={wingColor} fillOpacity={0.76} stroke="#141414" strokeWidth={1.8} />
          <ellipse cx={-2} cy={11} rx={17} ry={wingFlapB} transform="rotate(14, -2, 11)" fill={wingColor} fillOpacity={0.82} stroke="#141414" strokeWidth={2.0} />
          <ellipse cx={-12} cy={9} rx={14} ry={wingFlapA} transform="rotate(24, -12, 9)" fill={wingColor} fillOpacity={0.76} stroke="#141414" strokeWidth={1.8} />
          {/* Đuôi phân đốt mảnh + thân + đầu tròn mắt sáng */}
          <line x1={-38} y1={0} x2={-4} y2={0} stroke="#141414" strokeWidth={7} strokeLinecap="round" />
          <line x1={-37} y1={0} x2={-5} y2={0} stroke={tailColor} strokeWidth={3.6} strokeLinecap="round" />
          <ellipse cx={4} cy={0} rx={11} ry={6.5} fill={bodyColor} stroke="#141414" strokeWidth={2.4} />
          <circle cx={16} cy={-1} r={6.5} fill={bodyColor} stroke="#141414" strokeWidth={2.4} />
          <circle cx={19} cy={-3} r={2.8} fill="#FFFFFF" stroke="#141414" strokeWidth={1.2} />
          <circle cx={20} cy={-3} r={1.2} fill="#141414" />
        </g>
      );
    };

    return (
      <g id="v16-garden-chase-dragonfly">
        <SimpleGrassFieldBackdrop timeOfDay="DAY" frame={frame} groundY={groundY} />

        {/* Vài khóm cỏ xanh & hoa dại trắng/vàng nhỏ trên bãi cỏ tạo sức sống tự nhiên */}
        {[
          { x: 185, y: 816, c: "#FEF08A" },
          { x: 430, y: 868, c: "#FFFFFF" },
          { x: 690, y: 808, c: "#FDE047" },
          { x: 960, y: 874, c: "#FFFFFF" },
          { x: 1215, y: 814, c: "#FEF08A" },
          { x: 1480, y: 862, c: "#FFFFFF" },
        ].map((fl, i) => (
          <g key={`meadow_flower_${i}`} transform={`translate(${fl.x}, ${fl.y})`}>
            <path d="M -10,6 Q -14,-8 -8,-16 M 0,6 Q 2,-10 0,-18 M 10,6 Q 14,-8 10,-14" fill="none" stroke="#15803D" strokeWidth={3} strokeLinecap="round" />
            <circle cx={0} cy={-18} r={5.5} fill={fl.c} stroke="#141414" strokeWidth={1.8} />
            <circle cx={0} cy={-18} r={2.2} fill="#F59E0B" />
          </g>
        ))}

        {/* Đường nét đứt mềm mại biểu thị quỹ đạo bay lượn hình sin của chuồn chuồn & bướm vàng */}
        <path
          d={`M ${(df1X - 165).toFixed(1)},${(df1Y + 28).toFixed(1)} Q ${(df1X - 95).toFixed(1)},${(df1Y - 46).toFixed(1)} ${(df1X - 36).toFixed(1)},${(df1Y + 6).toFixed(1)}`}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={3.2}
          strokeDasharray="7 9"
          strokeLinecap="round"
          opacity={0.72}
        />
        <path
          d={`M ${(bfX - 135).toFixed(1)},${(bfY - 22).toFixed(1)} Q ${(bfX - 75).toFixed(1)},${(bfY + 42).toFixed(1)} ${(bfX - 28).toFixed(1)},${(bfY - 4).toFixed(1)}`}
          fill="none"
          stroke="#FEF08A"
          strokeWidth={3.2}
          strokeDasharray="6 9"
          strokeLinecap="round"
          opacity={0.78}
        />

        {/* Cành cây nhỏ cầm trên tay cậu bé vung vui vẻ theo nhịp chạy */}
        <g transform={`translate(${handX.toFixed(1)}, ${handY.toFixed(1)}) rotate(${twigAngleDeg.toFixed(1)})`}>
          <path d="M -14,2 L 122,-4" stroke="#141414" strokeWidth={11} strokeLinecap="round" />
          <path d="M -14,2 L 122,-4" stroke="#92400E" strokeWidth={6.5} strokeLinecap="round" />
          <path d="M 68,-2 L 96,-24" stroke="#141414" strokeWidth={7} strokeLinecap="round" />
          <path d="M 68,-2 L 96,-24" stroke="#92400E" strokeWidth={4} strokeLinecap="round" />
          {/* Chiếc lá xanh nhỏ trên đầu cành cây */}
          <ellipse cx={104} cy={-26} rx={12} ry={6.5} transform="rotate(-18, 104, -26)" fill="#4ADE80" stroke="#141414" strokeWidth={2.4} />
        </g>

        {/* Cậu bé BOY chạy hào hứng 60fps với khuôn mặt thân thiện V16.0 */}
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: boyX,
            y: groundY,
            scale: 0.98,
            facing: "right",
            pose: runWeight > 0.05 ? "running" : "standing",
            torsoTiltDeg: 14 * runWeight,
            flightLift: airBounce,
            walkCycleProgress: runCycle,
            walkWeight: runWeight,
            nodAmplitudeDeg: 3.4,
            nodFreq: 0.20,
            eyes: "happy",
            eyebrows: "neutral",
            mouth: "smile",
            blush: true,
            pupilGaze: { x: 0.78, y: -0.22 },
            holdingTarget: { rightGrip: { x: handX, y: handY } },
          }}
        />

        {/* 2 chú chuồn chuồn xanh dương & cam đỏ bay lượn mượt mà */}
        {renderDragonfly("v16_df_blue", df1X, df1Y, df1Rot, "#0284C7", "#38BDF8", "#E0F2FE", 0, 1.18)}
        {renderDragonfly("v16_df_orange", df2X, df2Y, df2Rot, "#EA580C", "#FB923C", "#FEF3C7", 1.7, 1.08)}

        {/* 1 chú bướm vàng rực rỡ vỗ cánh hình sin 60fps */}
        <g transform={`translate(${bfX.toFixed(1)}, ${bfY.toFixed(1)}) rotate(${bfRot.toFixed(1)}) scale(1.16)`}>
          <g transform={`scale(1, ${bfWingScaleY.toFixed(3)})`}>
            {/* Cánh trên vàng sáng */}
            <path
              d="M 0,0 C -10,-32 -36,-28 -30,-4 C -26,8 -10,8 0,0 Z"
              fill="#FACC15"
              stroke="#141414"
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
            <path
              d="M 0,0 C 10,-32 36,-28 30,-4 C 26,8 10,8 0,0 Z"
              fill="#FDE047"
              stroke="#141414"
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
            {/* Cánh dưới vàng ấm + chấm cam trang trí */}
            <path
              d="M 0,2 C -12,4 -28,22 -16,28 C -4,32 0,16 0,2 Z"
              fill="#F59E0B"
              stroke="#141414"
              strokeWidth={2.4}
              strokeLinejoin="round"
            />
            <path
              d="M 0,2 C 12,4 28,22 16,28 C 4,32 0,16 0,2 Z"
              fill="#FBBF24"
              stroke="#141414"
              strokeWidth={2.4}
              strokeLinejoin="round"
            />
            <circle cx={-16} cy={-11} r={4.2} fill="#F97316" />
            <circle cx={16} cy={-11} r={4.2} fill="#F97316" />
          </g>
          {/* Thân bướm & 2 râu cong mảnh */}
          <ellipse cx={0} cy={4} rx={3.6} ry={13} fill="#1E293B" stroke="#141414" strokeWidth={1.6} />
          <path d="M -1,-9 Q -8,-20 -13,-18 M 1,-9 Q 8,-20 13,-18" fill="none" stroke="#141414" strokeWidth={2} strokeLinecap="round" />
        </g>
      </g>
    );
  }

  // =========================================================================
  // BEAT 2: SIMPLE_GRASS_FIELD (SUNSET) — BOY cầm cành cây bước tới gần mô đất + bóng thoại "Ủa, cái gì đây?"
  // =========================================================================
  if (mode === "GARDEN_FIND_MOUND") {
    const walkT = smoothstep(0.04, 0.56, u);
    const boyX = lerpNum(560, 895, walkT);
    const deltaX = Math.abs(boyX - 560);
    const rampIn = smoothstep(0.04, 0.11, u);
    const rampOut = 1 - smoothstep(0.49, 0.57, u);
    const walkWeight = u <= 0.58 ? Math.min(rampIn, rampOut) : 0;
    const walkCycleProgress = (deltaX / STRIDE_CYCLE_PX) % 1;
    const hipBob = walkWeight > 0.05 ? -Math.abs(Math.sin(walkCycleProgress * Math.PI * 2)) * 5 * walkWeight : 0;

    const handX = boyX + 74;
    const handY = groundY - 196 + hipBob;
    const bubbleAppear = 115;
    const isBoySpeaking = isComicBubbleActive(localFrame, bubbleAppear);

    return (
      <g id="v14-beat2-garden-find-mound">
        <SimpleGrassFieldBackdrop timeOfDay="SUNSET" frame={frame} groundY={groundY} />
        <FireAntMound x={1230} y={groundY} swarmLevel="calm" localFrame={localFrame} u={u} />

        {/* Cành cây nhỏ cầm trên tay BOY */}
        <g transform={`translate(${handX.toFixed(1)}, ${handY.toFixed(1)}) rotate(${lerpNum(26, 18, walkT).toFixed(1)})`}>
          <path d="M -10,0 L 145,16" stroke="#78350F" strokeWidth={8} strokeLinecap="round" />
          <path d="M -10,0 L 145,16" stroke="#141414" strokeWidth={2.5} strokeLinecap="round" />
          <path d="M 85,10 L 112,-14" stroke="#78350F" strokeWidth={5} strokeLinecap="round" />
        </g>

        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: boyX,
            y: groundY,
            scale: 0.98,
            facing: "right",
            pose: walkWeight > 0.05 ? "walking" : "standing",
            torsoTiltDeg: lerpNum(6, 12, walkT),
            walkCycleProgress,
            walkWeight,
            isSpeaking: isBoySpeaking,
            eyes: "curious",
            eyebrows: "inquisitive",
            mouth: "circleOpen",
            pupilGaze: { x: 0.8, y: 0.45 },
            holdingTarget: { rightGrip: { x: handX, y: handY } },
          }}
        />

        <ComicSpeechBubble
          x={boyX + 165}
          y={groundY - 495}
          mouthX={boyX + 35}
          mouthY={groundY - 310}
          headTopY={groundY - 405}
          text="Ủa, cái gì đây?"
          localFrame={localFrame}
          appearFrame={bubbleAppear}
        />
      </g>
    );
  }

  // =========================================================================
  // BEAT 3: EXPLAINER_POLKA_DOT (cream) — So sánh Mô Đất = Chiếc Bánh Bao + Kính Lúp Soi
  // =========================================================================
  if (mode === "EXPLAIN_BUN_COMPARE") {
    const enterScale = localFrame < 14 ? easeOutBack(localFrame / 14) : 1.0;
    const eqPop = localFrame >= 28 ? (localFrame < 42 ? easeOutBack((localFrame - 28) / 14) : 1.0) : 0;

    return (
      <g id="v14-beat3-explain-bun-compare">
        <ExplainerPolkaDotBackdrop palette="cream" />

        <g transform={`translate(960, 495) scale(${enterScale.toFixed(3)})`}>
          {/* Ô Trái: Mô đất tròn xoe dưới kính lúp */}
          <g transform="translate(-390, 0)">
            <rect x={-265} y={-225} width={530} height={430} rx={34} fill="#141414" transform="translate(8, 10)" />
            <rect x={-265} y={-225} width={530} height={430} rx={34} fill="#FFFFFF" stroke="#141414" strokeWidth={4.5} />
            {/* Cỏ nền + Mô đất tròn mịn */}
            <rect x={-220} y={56} width={440} height={36} rx={12} fill="#86EFAC" stroke="#141414" strokeWidth={3} />
            <path d="M -138,68 Q -120,-62 0,-70 Q 120,-62 138,68 Z" fill="#B45309" stroke="#141414" strokeWidth={4} />
            <path d="M -82,12 Q -25,-48 56,-36" fill="none" stroke="#D97706" strokeWidth={9} strokeLinecap="round" opacity={0.6} />
            {/* Kính lúp phóng to đỉnh mô đất trơn nhẵn không có lỗ */}
            <MagnifyingGlassOverlay x={42} y={-44} radius={76} handleAngleDeg={44} localFrame={localFrame} />
            <text
              x={0}
              y={162}
              textAnchor="middle"
              fill="#141414"
              fontSize={30}
              fontWeight={900}
              fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
            >
              MÔ ĐẤT TRÒN XOE
            </text>
          </g>

          {/* Dấu "=" nổi ở giữa */}
          {eqPop > 0.02 && (
            <g transform={`translate(0, -10) scale(${eqPop.toFixed(3)})`}>
              <circle cx={0} cy={0} r={54} fill="#FACC15" stroke="#141414" strokeWidth={4.5} />
              <rect x={-26} y={-16} width={52} height={11} rx={5} fill="#141414" />
              <rect x={-26} y={6} width={52} height={11} rx={5} fill="#141414" />
            </g>
          )}

          {/* Ô Phải: Chiếc bánh bao trắng phồng bốc khói */}
          <g transform="translate(390, 0)">
            <rect x={-265} y={-225} width={530} height={430} rx={34} fill="#141414" transform="translate(8, 10)" />
            <rect x={-265} y={-225} width={530} height={430} rx={34} fill="#FFFFFF" stroke="#141414" strokeWidth={4.5} />
            {/* Đĩa gốm xanh nhạt */}
            <ellipse cx={0} cy={74} rx={168} ry={28} fill="#BAE6FD" stroke="#141414" strokeWidth={3.5} />
            {/* Chiếc bánh bao tròn xoe có múi đỉnh */}
            <path d="M -128,64 Q -120,-62 0,-74 Q 120,-62 128,64 Z" fill="#FFFBEB" stroke="#141414" strokeWidth={4} />
            <path d="M -28,-66 Q 0,-46 28,-66" fill="none" stroke="#CBD5E1" strokeWidth={4} strokeLinecap="round" />
            <path d="M -14,-72 Q 0,-54 14,-72" fill="none" stroke="#94A3B8" strokeWidth={3.5} strokeLinecap="round" />
            {/* Làn khói ấm bay lên */}
            {[-42, 0, 42].map((sx, i) => (
              <path
                key={`steam_${i}`}
                d={`M ${sx},${-95 + Math.sin(localFrame * 0.08 + i) * 5} Q ${sx - 12},-125 ${sx + 8},-152`}
                fill="none"
                stroke="#94A3B8"
                strokeWidth={4.5}
                strokeLinecap="round"
                opacity={0.7}
              />
            ))}
            <text
              x={0}
              y={162}
              textAnchor="middle"
              fill="#141414"
              fontSize={30}
              fontWeight={900}
              fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
            >
              CHIẾC BÁNH BAO
            </text>
          </g>
        </g>
      </g>
    );
  }

  // =========================================================================
  // BEAT 4: SIMPLE_GRASS_FIELD (SUNSET) — Cành cây chọc nhẹ mô đất + "CHỌC!" + kiến đỏ bắt đầu trào ra
  // =========================================================================
  if (mode === "GARDEN_POKE_MOUND") {
    const boyX = 910;
    // Pha chọc cành cây: u < 0.30 lấy đà, u ∈ [0.30, 0.40] chọc tới mô đất, u > 0.40 hơi rút về nhẹ
    const pokeForward =
      u < 0.30
        ? -smoothstep(0.10, 0.30, u) * 20
        : u < 0.42
        ? lerpNum(-20, 68, smoothstep(0.30, 0.40, u))
        : lerpNum(68, 42, smoothstep(0.42, 0.72, u));

    const handX = boyX + 86 + pokeForward * 0.45;
    const handY = groundY - 196 + pokeForward * 0.32;
    const stickAngle = 22 + pokeForward * 0.08;
    const stickRad = (stickAngle * Math.PI) / 180;
    // V15.0 Fix 4: Tính chính xác tuyệt đối tọa độ mũi que chạm mô đất bằng lượng giác!
    const stickTipX = handX + 195 * Math.cos(stickRad) - 12 * Math.sin(stickRad);
    const stickTipY = handY + 195 * Math.sin(stickRad) + 12 * Math.cos(stickRad);
    const chocActive = u >= 0.38 && u <= 0.74;
    const chocPop = chocActive ? easeOutBack(Math.min(1, (u - 0.38) / 0.06)) : 0;
    // V15.0 Fix 4: 25% cuối Beat 4 (u >= 0.75) -> 8 chấm kiến đỏ bò tràn ra khỏi mô đất & leo lên đầu que nối mạch sang Beat 5!
    const spillT = smoothstep(0.75, 0.99, u);

    return (
      <g id="v14-beat4-garden-poke">
        <SimpleGrassFieldBackdrop timeOfDay="SUNSET" frame={frame} groundY={groundY} />
        <FireAntMound x={1230} y={groundY} swarmLevel={u >= 0.40 ? "emerging" : "calm"} localFrame={localFrame} u={u} />

        {/* Cành cây chọc thẳng vào sườn mô đất */}
        <g transform={`translate(${handX.toFixed(1)}, ${handY.toFixed(1)}) rotate(${stickAngle.toFixed(1)})`}>
          <path d="M -8,0 L 195,12" stroke="#78350F" strokeWidth={8.5} strokeLinecap="round" />
          <path d="M -8,0 L 195,12" stroke="#141414" strokeWidth={2.5} strokeLinecap="round" />
          <path d="M 110,8 L 136,-14" stroke="#78350F" strokeWidth={5} strokeLinecap="round" />
          {/* 3 chấm kiến đầu tiên bắt đầu leo ngược lên mũi que trong 25% cuối cảnh */}
          {spillT > 0.02 &&
            [0, 1, 2].map((sa) => {
              const along = lerpNum(188, 128 - sa * 24, spillT);
              return (
                <ellipse
                  key={`poke_stick_ant_${sa}`}
                  cx={along}
                  cy={along * 0.06 - 5}
                  rx={4.5}
                  ry={2.8}
                  fill="#DC2626"
                  stroke="#141414"
                  strokeWidth={1.2}
                />
              );
            })}
        </g>

        {/* 5 chấm kiến đỏ tràn khỏi chân mô đất ra bãi cỏ ở 25% cuối Beat 4 (tổng 8 chấm nối mạch mượt sang Beat 5!) */}
        {spillT > 0.02 &&
          [
            { dx: -115, dy: -6 },
            { dx: -138, dy: 4 },
            { dx: -85, dy: 10 },
            { dx: 112, dy: 2 },
            { dx: 132, dy: 8 },
          ].map((dir, i) => {
            const ax = 1230 + dir.dx * (0.65 + spillT * 0.55) + Math.sin(localFrame * 0.35 + i) * 3;
            const ay = groundY + dir.dy * (0.5 + spillT * 0.6);
            return (
              <ellipse key={`spill_ant_${i}`} cx={ax} cy={ay} rx={4.6} ry={2.8} fill="#DC2626" stroke="#141414" strokeWidth={1.2} />
            );
          })}

        {/* Chữ nổ "CHỌC!" căn chuẩn ĐÚNG tọa độ (stickTipX, stickTipY) mũi que chạm mô đất + hạt đất văng */}
        {chocActive && (
          <g transform={`translate(${stickTipX.toFixed(1)}, ${(stickTipY - 12).toFixed(1)}) scale(${chocPop.toFixed(3)}) rotate(-8)`}>
            <polygon
              points="0,-54 16,-30 46,-42 32,-14 62,0 32,14 46,42 16,30 0,54 -16,30 -46,42 -32,14 -62,0 -32,-14 -46,-42 -16,-30"
              fill="#FACC15"
              stroke="#141414"
              strokeWidth={3.5}
              strokeLinejoin="round"
              transform="scale(1.25, 0.9)"
            />
            <text
              x={0}
              y={10}
              textAnchor="middle"
              fill="#DC2626"
              stroke="#141414"
              strokeWidth={6}
              paintOrder="stroke"
              fontSize={32}
              fontWeight={900}
              fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
            >
              CHỌC!
            </text>
          </g>
        )}

        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: boyX,
            y: groundY,
            scale: 0.98,
            facing: "right",
            pose: "standing",
            torsoTiltDeg: 14 + pokeForward * 0.14,
            walkWeight: 0,
            eyes: u >= 0.44 ? "wide" : "curious",
            eyebrows: u >= 0.44 ? "raised" : "inquisitive",
            mouth: u >= 0.44 ? "circleOpen" : "smile",
            pupilGaze: { x: 0.85, y: 0.45 },
            holdingTarget: { rightGrip: { x: handX, y: handY } },
          }}
        />
      </g>
    );
  }

  // =========================================================================
  // BEAT 5: SIMPLE_GRASS_FIELD (SUNSET) — Mô đất sôi sục kiến leo lên cành cây + BOY quăng cành cây + Shiver + "ÁAA!"
  // =========================================================================
  if (mode === "GARDEN_ANTS_BOIL") {
    const recoilT = smoothstep(0.05, 0.48, u);
    const boyX = lerpNum(905, 705, recoilT);
    const deltaX = Math.abs(905 - boyX);
    const walkWeight = u <= 0.50 ? Math.min(smoothstep(0.05, 0.14, u), 1 - smoothstep(0.38, 0.50, u)) : 0;
    const walkCycleProgress = (10 - deltaX / STRIDE_CYCLE_PX) % 1;

    // Cành cây bị quăng bay xoay lên trời cùng vài chấm kiến bám trên cành
    const tossT = smoothstep(0.08, 0.72, u);
    const stickX = lerpNum(1035, 1095, tossT);
    const stickY = lerpNum(680, 520, Math.sin(tossT * Math.PI)) + tossT * 115;
    const stickRot = lerpNum(24, -145, tossT);

    return (
      <g id="v14-beat5-garden-ants-boil">
        <SimpleGrassFieldBackdrop timeOfDay="SUNSET" frame={frame} groundY={groundY} />
        <FireAntMound x={1230} y={groundY} swarmLevel="boiling" localFrame={localFrame} u={u} />

        {/* Cành cây văng lên không trung với kiến đỏ leo dọc theo */}
        <g transform={`translate(${stickX.toFixed(1)}, ${stickY.toFixed(1)}) rotate(${stickRot.toFixed(1)})`}>
          <path d="M -85,0 L 95,6" stroke="#78350F" strokeWidth={8.5} strokeLinecap="round" />
          <path d="M -85,0 L 95,6" stroke="#141414" strokeWidth={2.5} strokeLinecap="round" />
          {[-45, -18, 12, 38, 62].map((ax, i) => (
            <ellipse key={`stick_ant_${i}`} cx={ax} cy={-5} rx={4.5} ry={2.8} fill="#DC2626" stroke="#141414" strokeWidth={1.2} />
          ))}
        </g>

        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: boyX,
            y: groundY,
            scale: 0.98,
            facing: "right",
            pose: walkWeight > 0.06 ? "walking" : "standing",
            torsoTiltDeg: -14,
            walkCycleProgress,
            walkWeight,
            isSpeaking: isComicBubbleActive(localFrame, 16),
            eyes: "surprised",
            eyebrows: "worried",
            mouth: "gasp",
            pupilGaze: { x: 0.75, y: 0.2 },
            sweatDrop: true,
            shiver: true,
            shiverDarkStage: false,
            shiverFrame: frame,
            holdingTarget: {
              leftGrip: { x: boyX - 96, y: groundY - 318 + Math.sin(localFrame * 0.5) * 12 },
              rightGrip: { x: boyX + 94, y: groundY - 338 + Math.cos(localFrame * 0.5) * 12 },
            },
          }}
        />

        <ComicSpeechBubble
          x={boyX - 190}
          y={groundY - 495}
          mouthX={boyX - 28}
          mouthY={groundY - 338}
          headTopY={groundY - 405}
          text="ÁAA!"
          localFrame={localFrame}
          appearFrame={16}
        />
      </g>
    );
  }

  // =========================================================================
  // BEAT 6: COUNTRYSIDE_YARD (SUNSET) — Ông nội bước ra cười lắc đầu: "Kiến lửa đó con!"
  // =========================================================================
  if (mode === "YARD_GRANDPA_LAUGH") {
    const walkT = smoothstep(0.05, 0.52, u);
    const grandpaX = lerpNum(1425, 1135, walkT);
    const grandpaY = lerpNum(groundY - 26, groundY, walkT);
    const deltaX = Math.abs(1425 - grandpaX);
    const walkWeight = u <= 0.54 ? Math.min(smoothstep(0.05, 0.14, u), 1 - smoothstep(0.45, 0.54, u)) : 0;
    const walkCycleProgress = (deltaX / STRIDE_CYCLE_PX) % 1;
    const headShake = u > 0.52 ? Math.sin(localFrame * 0.22) * 8 : 0;

    return (
      <g id="v14-beat6-yard-grandpa">
        <CountrysideYardBackdrop timeOfDay="SUNSET" frame={frame} groundY={groundY} />
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: 750,
            y: groundY,
            scale: 0.96,
            facing: "right",
            pose: "standing",
            torsoTiltDeg: -4,
            walkWeight: 0,
            eyes: "wide",
            eyebrows: "worried",
            mouth: "circleOpen",
            sweatDrop: true,
          }}
        />
        <StickmanRig
          characterPreset="GRANDPA"
          frame={frame}
          state={{
            x: grandpaX,
            y: grandpaY,
            scale: 0.98,
            facing: "left",
            pose: walkWeight > 0.05 ? "walking" : "standing",
            torsoTiltDeg: walkWeight > 0.05 ? 9 : 3,
            limbAngles: { head: headShake },
            walkCycleProgress,
            walkWeight,
            isSpeaking: isComicBubbleActive(localFrame, 120),
            eyes: "happy",
            eyebrows: "raised",
            mouth: "smile",
          }}
        />

        <ComicSpeechBubble
          x={grandpaX - 185}
          y={grandpaY - 495}
          mouthX={grandpaX - 38}
          mouthY={grandpaY - 315}
          headTopY={grandpaY - 405}
          text="Kiến lửa đó con!"
          localFrame={localFrame}
          appearFrame={120}
        />
      </g>
    );
  }

  // =========================================================================
  // BEAT 7: UNDERGROUND_CROSS_SECTION — Mặt cắt thành phố đường hầm sâu > 1m dưới mô đất nhỏ
  // =========================================================================
  if (mode === "UNDERGROUND_ANT_CITY") {
    return (
      <g id="v14-beat7-underground-city">
        <UndergroundCrossSectionStage frame={frame} localFrame={localFrame} showAnts={true} />
      </g>
    );
  }

  // =========================================================================
  // BEAT 8: EXPLAINER_POLKA_DOT (mint) — Thẻ lịch 7 NGÀY + Kính lúp soi kiến lửa (Kết tự nhiên gợi tò mò)
  // =========================================================================
  if (mode === "EXPLAIN_SEVEN_DAYS_OUTRO") {
    const enterScale = localFrame < 14 ? easeOutBack(localFrame / 14) : 1.0;
    const activeDay = Math.min(7, 1 + Math.floor(smoothstep(0.12, 0.78, u) * 7));
    return (
      <g id="v14-beat8-seven-days-outro">
        <ExplainerPolkaDotBackdrop palette="mint" />
        <g transform={`translate(960, 485) scale(${enterScale.toFixed(3)})`}>
          {/* Thẻ lịch đơn giản 7 NGÀY bên trái */}
          <g transform="translate(-245, 0)">
            <rect x={-210} y={-195} width={420} height={380} rx={32} fill="#141414" transform="translate(8, 10)" />
            <rect x={-210} y={-195} width={420} height={380} rx={32} fill="#FFFFFF" stroke="#141414" strokeWidth={4.5} />
            <path d="M -210,-163 Q -210,-195 -178,-195 L 178,-195 Q 210,-195 210,-163 L 210,-96 L -210,-96 Z" fill="#EF4444" stroke="#141414" strokeWidth={4.5} />
            {[-120, 0, 120].map((kx) => (
              <rect key={`ring_${kx}`} x={kx - 10} y={-216} width={20} height={42} rx={9} fill="#CBD5E1" stroke="#141414" strokeWidth={3.5} />
            ))}
            <text
              x={0}
              y={-132}
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize={24}
              fontWeight={900}
              fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
            >
              TUẦN LỄ NHỚ ĐỜI
            </text>
            <text
              x={0}
              y={54}
              textAnchor="middle"
              fill="#141414"
              fontSize={124}
              fontWeight={900}
              fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
            >
              {activeDay}
            </text>
            <text
              x={0}
              y={128}
              textAnchor="middle"
              fill="#DC2626"
              fontSize={34}
              fontWeight={900}
              fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
            >
              NGÀY Ở QUÊ
            </text>
          </g>

          {/* Ô Kính lúp soi chú kiến lửa tinh nghịch bên phải */}
          <g transform="translate(275, -10)">
            <circle cx={0} cy={0} r={148} fill="#FFFFFF" stroke="#141414" strokeWidth={4.5} />
            {/* Chú kiến lửa phóng to trong kính lúp */}
            <g transform={`translate(0, 12) rotate(${(Math.sin(localFrame * 0.08) * 6).toFixed(1)})`}>
              {/* 6 chân kiến */}
              <g stroke="#141414" strokeWidth={4.5} strokeLinecap="round" fill="none">
                <path d="M -18,10 L -46,42 L -68,36" />
                <path d="M 0,12 L -12,50 L -28,54" />
                <path d="M 18,10 L 38,44 L 58,42" />
                <path d="M -18,-10 L -44,-40 L -62,-34" />
                <path d="M 0,-12 L -8,-48 L -22,-52" />
                <path d="M 18,-10 L 42,-42 L 60,-36" />
              </g>
              {/* Bụng, ngực, đầu kiến lửa */}
              <ellipse cx={-48} cy={0} rx={36} ry={26} fill="#DC2626" stroke="#141414" strokeWidth={4} />
              <ellipse cx={4} cy={0} rx={22} ry={16} fill="#EF4444" stroke="#141414" strokeWidth={4} />
              <circle cx={44} cy={-2} r={22} fill="#B91C1C" stroke="#141414" strokeWidth={4} />
              {/* 2 mắt trắng tinh nghịch */}
              <circle cx={52} cy={-9} r={7} fill="#FFFFFF" stroke="#141414" strokeWidth={2.5} />
              <circle cx={54} cy={-9} r={3} fill="#141414" />
              {/* Râu kiến */}
              <path d="M 60,-14 Q 82,-36 96,-28" fill="none" stroke="#141414" strokeWidth={3.5} strokeLinecap="round" />
              <path d="M 62,-4 Q 84,-16 98,-8" fill="none" stroke="#141414" strokeWidth={3.5} strokeLinecap="round" />
            </g>
            <MagnifyingGlassOverlay x={0} y={0} radius={148} handleAngleDeg={44} localFrame={localFrame} />
          </g>
        </g>
      </g>
    );
  }

  // =========================================================================
  // V16.1 FULL MOVIE (64 MICRO-BEATS): "50 Con Nòng Nọc Trong Phòng Ngủ"
  // =========================================================================
  if (isTadpoleV16SceneMode(mode)) {
    return (
      <TadpoleV16SceneLayer
        mode={mode}
        frame={frame}
        localFrame={localFrame}
        durationFrames={durationFrames}
        u={u}
        groundY={groundY}
        backdrops={{
          CountrysideYardBackdrop,
          BedroomIndoorBackdrop,
          UndergroundCrossSectionStage,
          ExplainerPolkaDotBackdrop,
          MagnifyingGlassOverlay,
          SimpleGrassFieldBackdrop,
          FireAntMound,
        }}
      />
    );
  }

  // =========================================================================
  // V15.0 FULL MOVIE (4 HỒI, 40 PHÂN CẢNH): "7 Ngày Với Tổ Kiến Lửa Dưới Gốc Xoài"
  // =========================================================================
  return (
    <FireAntV15SceneLayer
      mode={mode as FireAntV15SceneMode}
      frame={frame}
      localFrame={localFrame}
      durationFrames={durationFrames}
      u={u}
      groundY={groundY}
      backdrops={{
        CountrysideYardBackdrop,
        BedroomIndoorBackdrop,
        UndergroundCrossSectionStage,
        ExplainerPolkaDotBackdrop,
        MagnifyingGlassOverlay,
        SimpleGrassFieldBackdrop,
        FireAntMound,
      }}
    />
  );
};
