import React from "react";
import { Easing, interpolate } from "remotion";
import { GroundShadow } from "../SceneBackdropKit";
import { CuteCat, CuteOctopus, CuteShark } from "../AnimalSpriteKit";
import type {
  BalconyDetailId,
  ClassroomDetailId,
  HostBoardHighlightId,
  KitchenDetailId,
  LivingRoomDetailId,
  OceanDetailId,
} from "../../lib/v7/episodeJsonSchema";

const INK = "#141414";
const FONT = "'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif";

/* ============================================================================
 * 1. HOST_EXPLAIN_OVERLAY Whiteboard: labBoard = "MIRROR_NEURONS_YAWN"
 *    - Locked cleanly to x=680..1800, y=90..640 (width=1120, height=550)
 *    - Guaranteed >= 90px gap from left Host speech bubble (x <= 590)
 *    - 100% flat 2D SVG, zero blur/shadow filters, React.memo static core
 * ========================================================================== */

const HostMirrorNeuronsBoardStaticCore: React.FC<{
  activePanel?: "LEFT" | "CENTER" | "RIGHT";
}> = React.memo(({ activePanel }) => {
  const leftBorder = activePanel === "LEFT" ? "#EA580C" : "#0284C7";
  const centerBorder = activePanel === "CENTER" ? "#EA580C" : "#F59E0B";
  const rightBorder = activePanel === "RIGHT" ? "#EA580C" : "#0D9488";
  const leftW = activePanel === "LEFT" ? 4.5 : 2.8;
  const centerW = activePanel === "CENTER" ? 4.5 : 2.8;
  const rightW = activePanel === "RIGHT" ? 4.5 : 2.8;

  return (
    <g id="host-board-mirror-neurons-static">
      {/* Subtle grounding shadow below whiteboard frame */}
      <GroundShadow cx={1240} cy={654} rx={545} ry={12} />

      {/* Main Whiteboard Frame (x=680..1800, y=90..640) */}
      <rect
        x={680}
        y={90}
        width={1120}
        height={550}
        rx={22}
        fill="#FFFFFF"
        stroke="#64748B"
        strokeWidth={10}
      />
      <rect
        x={680}
        y={90}
        width={1120}
        height={550}
        rx={22}
        fill="none"
        stroke={INK}
        strokeWidth={3.2}
      />

      {/* 4 corner whiteboard pins */}
      <circle cx={706} cy={116} r={6} fill="#EF4444" stroke={INK} strokeWidth={2} />
      <circle cx={1774} cy={116} r={6} fill="#EF4444" stroke={INK} strokeWidth={2} />
      <circle cx={706} cy={614} r={6} fill="#0284C7" stroke={INK} strokeWidth={2} />
      <circle cx={1774} cy={614} r={6} fill="#0284C7" stroke={INK} strokeWidth={2} />

      {/* Top Title Banner */}
      <rect
        x={728}
        y={108}
        width={1024}
        height={48}
        rx={12}
        fill="#EFF6FF"
        stroke="#0284C7"
        strokeWidth={2.6}
      />
      <text
        x={1240}
        y={140}
        textAnchor="middle"
        fill="#0369A1"
        fontSize={23}
        fontWeight={900}
        fontFamily={FONT}
      >
        NGHIÊN CỨU NÃO BỘ • NƠ-RON GƯƠNG &amp; HIỆU ỨNG LÂY NGÁP
      </text>

      {/* ============================================================
       * Ô TRÁI (x=710..1046, y=172..546): Mắt nhìn người ngáp -> Hệ thống phản chiếu (Nơ-ron gương)
       * ============================================================ */}
      <g id="board-panel-mirror-left" transform="translate(710, 172)">
        <rect
          x={0}
          y={0}
          width={336}
          height={374}
          rx={16}
          fill={activePanel === "LEFT" ? "#FFF7ED" : "#F0F9FF"}
          stroke={leftBorder}
          strokeWidth={leftW}
        />
        <text x={168} y={36} textAnchor="middle" fill="#0369A1" fontSize={19} fontWeight={900} fontFamily={FONT}>
          1. Hệ thống phản chiếu
        </text>

        {/* Eye icon seeing a yawning face on top-left */}
        <g transform="translate(86, 120)">
          <circle cx={0} cy={0} r={42} fill="#FEF3C7" stroke={INK} strokeWidth={3} />
          <circle cx={-12} cy={-10} r={4.5} fill={INK} />
          <circle cx={12} cy={-10} r={4.5} fill={INK} />
          {/* Cute wide yawn mouth */}
          <ellipse cx={0} cy={12} rx={12} ry={16} fill="#9F1239" stroke={INK} strokeWidth={2.8} />
          <ellipse cx={0} cy={21} rx={7} ry={4} fill="#FB7185" />
          <text x={0} y={62} textAnchor="middle" fill="#9A3412" fontSize={15} fontWeight={800} fontFamily={FONT}>
            Nhìn người ngáp
          </text>
        </g>

        {/* Blue-orange signal arrow into brain */}
        <path
          d="M 136 120 L 188 120"
          fill="none"
          stroke="#0284C7"
          strokeWidth={6}
          strokeLinecap="round"
        />
        <polygon points="198,120 180,110 180,130" fill="#0284C7" />

        {/* Glowing Mirror Neuron Brain on right */}
        <g transform="translate(254, 120)">
          <circle cx={0} cy={0} r={54} fill="#FFEDD5" opacity={0.9} />
          <path
            d="M -38 6 C -48 -10 -38 -36 -18 -40 C -8 -50 14 -50 24 -38 C 44 -34 50 -8 38 10 C 34 24 20 34 4 30 C -4 34 -16 34 -22 28 C -34 26 -40 16 -38 6 Z"
            fill="#FBCFE8"
            stroke={INK}
            strokeWidth={3.2}
            strokeLinejoin="round"
          />
          <circle cx={-10} cy={-10} r={9} fill="#F97316" stroke="#FFFFFF" strokeWidth={2} />
          <circle cx={14} cy={-6} r={9} fill="#EA580C" stroke="#FFFFFF" strokeWidth={2} />
          <circle cx={2} cy={12} r={8} fill="#F59E0B" stroke="#FFFFFF" strokeWidth={2} />
          <text x={0} y={62} textAnchor="middle" fill="#C2410C" fontSize={15} fontWeight={900} fontFamily={FONT}>
            Nơ-ron gương
          </text>
        </g>

        {/* Bottom summary box inside left panel */}
        <rect x={22} y={226} width={292} height={124} rx={12} fill="#FFFFFF" stroke="#BAE6FD" strokeWidth={2.4} />
        <text x={168} y={260} textAnchor="middle" fill="#0F172A" fontSize={17} fontWeight={900} fontFamily={FONT}>
          Mắt nhìn thấy → Não bật sáng
        </text>
        <text x={168} y={292} textAnchor="middle" fill="#334155" fontSize={15.5} fontWeight={700} fontFamily={FONT}>
          Mô phỏng tự động cử chỉ ngáp
        </text>
        <text x={168} y={322} textAnchor="middle" fill="#C2410C" fontSize={15.5} fontWeight={800} fontFamily={FONT}>
          → Kéo mở miệng theo phản xạ!
        </text>
      </g>

      {/* ============================================================
       * Ô GIỮA (x=1066..1414, y=172..546): Thang gắn kết xã hội
       * ============================================================ */}
      <g id="board-panel-social-center" transform="translate(1066, 172)">
        <rect
          x={0}
          y={0}
          width={348}
          height={374}
          rx={16}
          fill={activePanel === "CENTER" ? "#FEF3C7" : "#FFFBEB"}
          stroke={centerBorder}
          strokeWidth={centerW}
        />
        <text x={174} y={36} textAnchor="middle" fill="#B45309" fontSize={19} fontWeight={900} fontFamily={FONT}>
          2. Thang gắn kết xã hội
        </text>

        {/* Baseline */}
        <line x1={32} y1={286} x2={316} y2={286} stroke="#475569" strokeWidth={3.2} strokeLinecap="round" />

        {/* Bar 1: Người thân (Tallest, Coral-Red) */}
        <rect x={44} y={96} width={78} height={190} rx={12} fill="#EF4444" stroke={INK} strokeWidth={2.8} />
        <text x={83} y={84} textAnchor="middle" fill="#B91C1C" fontSize={15} fontWeight={900} fontFamily={FONT}>
          Lây mạnh
        </text>
        <text x={83} y={314} textAnchor="middle" fill="#991B1B" fontSize={16} fontWeight={900} fontFamily={FONT}>
          Người thân
        </text>

        {/* Bar 2: Bạn bè (Medium, Amber) */}
        <rect x={135} y={156} width={78} height={130} rx={12} fill="#F59E0B" stroke={INK} strokeWidth={2.8} />
        <text x={174} y={144} textAnchor="middle" fill="#B45309" fontSize={15} fontWeight={800} fontFamily={FONT}>
          Khá cao
        </text>
        <text x={174} y={314} textAnchor="middle" fill="#92400E" fontSize={16} fontWeight={900} fontFamily={FONT}>
          Bạn bè
        </text>

        {/* Bar 3: Người lạ (Shortest, Soft Slate-Blue) */}
        <rect x={226} y={214} width={78} height={72} rx={12} fill="#94A3B8" stroke={INK} strokeWidth={2.8} />
        <text x={265} y={202} textAnchor="middle" fill="#475569" fontSize={15} fontWeight={800} fontFamily={FONT}>
          Thấp hơn
        </text>
        <text x={265} y={314} textAnchor="middle" fill="#475569" fontSize={16} fontWeight={800} fontFamily={FONT}>
          Người lạ
        </text>

        <text x={174} y={352} textAnchor="middle" fill="#78350F" fontSize={15} fontWeight={800} fontFamily={FONT}>
          Càng thân thiết → Lây càng nhanh!
        </text>
      </g>

      {/* ============================================================
       * Ô PHẢI (x=1434..1770, y=172..546): Trẻ 4-5 tuổi + Chó cưng / Tinh tinh
       * ============================================================ */}
      <g id="board-panel-species-right" transform="translate(1434, 172)">
        <rect
          x={0}
          y={0}
          width={336}
          height={374}
          rx={16}
          fill={activePanel === "RIGHT" ? "#CCFBF1" : "#F0FDFA"}
          stroke={rightBorder}
          strokeWidth={rightW}
        />
        <text x={168} y={36} textAnchor="middle" fill="#0F766E" fontSize={19} fontWeight={900} fontFamily={FONT}>
          3. Độ tuổi &amp; Loài vật
        </text>

        {/* Top card: Trẻ từ 4–5 tuổi */}
        <g transform="translate(22, 60)">
          <rect x={0} y={0} width={292} height={126} rx={14} fill="#FFFFFF" stroke="#14B8A6" strokeWidth={2.4} />
          {/* Cute child icon */}
          <g transform="translate(56, 64)">
            <circle cx={0} cy={0} r={32} fill="#FEF3C7" stroke={INK} strokeWidth={2.8} />
            <path d="M -26 -14 Q 0 -42 26 -14 Q 10 -24 -26 -14 Z" fill="#1E293B" stroke={INK} strokeWidth={2} />
            <circle cx={-10} cy={-4} r={3.5} fill={INK} />
            <circle cx={10} cy={-4} r={3.5} fill={INK} />
            <ellipse cx={0} cy={12} rx={8} ry={10} fill="#9F1239" stroke={INK} strokeWidth={2} />
          </g>
          <text x={186} y={54} textAnchor="middle" fill="#0F766E" fontSize={18} fontWeight={900} fontFamily={FONT}>
            Trẻ từ 4–5 tuổi
          </text>
          <text x={186} y={84} textAnchor="middle" fill="#334155" fontSize={14.5} fontWeight={700} fontFamily={FONT}>
            Não xã hội phát triển
          </text>
          <text x={186} y={108} textAnchor="middle" fill="#0D9488" fontSize={14.5} fontWeight={800} fontFamily={FONT}>
            → Bắt đầu lây ngáp!
          </text>
        </g>

        {/* Bottom card: Chó cưng & Tinh tinh */}
        <g transform="translate(22, 206)">
          <rect x={0} y={0} width={292} height={144} rx={14} fill="#FFFFFF" stroke="#F59E0B" strokeWidth={2.4} />
          {/* Cute mini dog face */}
          <g transform="translate(64, 62)">
            <ellipse cx={-26} cy={-6} rx={11} ry={22} transform="rotate(14, -26, -6)" fill="#92400E" stroke={INK} strokeWidth={2.4} />
            <ellipse cx={26} cy={-6} rx={11} ry={22} transform="rotate(-14, 26, -6)" fill="#92400E" stroke={INK} strokeWidth={2.4} />
            <circle cx={0} cy={0} r={28} fill="#FBBF24" stroke={INK} strokeWidth={2.6} />
            <circle cx={-10} cy={-6} r={3.5} fill={INK} />
            <circle cx={10} cy={-6} r={3.5} fill={INK} />
            <ellipse cx={0} cy={2} rx={5.5} ry={4} fill={INK} />
            <ellipse cx={0} cy={14} rx={7} ry={8} fill="#9F1239" stroke={INK} strokeWidth={2} />
          </g>
          {/* Cute mini chimp face */}
          <g transform="translate(152, 62)">
            <circle cx={-26} cy={-2} r={10} fill="#D97706" stroke={INK} strokeWidth={2.2} />
            <circle cx={26} cy={-2} r={10} fill="#D97706" stroke={INK} strokeWidth={2.2} />
            <circle cx={0} cy={0} r={26} fill="#78350F" stroke={INK} strokeWidth={2.6} />
            <ellipse cx={0} cy={6} rx={19} ry={16} fill="#FDE68A" />
            <circle cx={-8} cy={-4} r={3.2} fill={INK} />
            <circle cx={8} cy={-4} r={3.2} fill={INK} />
            <ellipse cx={0} cy={12} rx={6.5} ry={7.5} fill="#9F1239" stroke={INK} strokeWidth={2} />
          </g>
          <text x={242} y={54} textAnchor="middle" fill="#B45309" fontSize={16} fontWeight={900} fontFamily={FONT}>
            Chó cưng
          </text>
          <text x={242} y={78} textAnchor="middle" fill="#B45309" fontSize={16} fontWeight={900} fontFamily={FONT}>
            Tinh tinh
          </text>
          <text x={146} y={124} textAnchor="middle" fill="#334155" fontSize={15} fontWeight={800} fontFamily={FONT}>
            Cùng có phản xạ lây ngáp bầy đàn!
          </text>
        </g>
      </g>
    </g>
  );
});
HostMirrorNeuronsBoardStaticCore.displayName = "HostMirrorNeuronsBoardStaticCore";

export const HostMirrorNeuronsBoard: React.FC<{
  highlight?: HostBoardHighlightId;
  frame?: number;
}> = ({ highlight = "NONE", frame = 0 }) => {
  const activePanel: "LEFT" | "CENTER" | "RIGHT" | undefined =
    highlight === "LEFT" || highlight === "TWO_TYPES" || highlight === "LAUGH_YAWN"
      ? "LEFT"
      : highlight === "CENTER" || highlight === "NOT_COLD"
      ? "CENTER"
      : highlight === "RIGHT"
      ? "RIGHT"
      : undefined;

  const badgePulse = 0.5 + 0.5 * Math.sin(frame * 0.16);

  const renderContextFooter = () => {
    switch (highlight) {
      case "YAWN_TAG":
        return (
          <g transform="translate(1240, 592)">
            <rect x={-350} y={-25} width={700} height={50} rx={25} fill="#FEF3C7" stroke="#D97706" strokeWidth={3} />
            <text x={0} y={8} textAnchor="middle" fill="#92400E" fontSize={20} fontWeight={900} fontFamily={FONT}>
              “Ngáp...” — Chỉ nghe hoặc đọc chữ cũng đủ kích thích não!
            </text>
          </g>
        );
      case "OXYGEN_MYTH":
        return (
          <g transform="translate(1240, 592)">
            <rect x={-365} y={-25} width={730} height={50} rx={25} fill="#FEF2F2" stroke="#EF4444" strokeWidth={3} />
            <circle cx={-322} cy={0} r={17} fill="#EF4444" />
            <text x={-322} y={7} textAnchor="middle" fill="#FFFFFF" fontSize={20} fontWeight={900} fontFamily={FONT}>
              ✕
            </text>
            <text x={16} y={8} textAnchor="middle" fill="#B91C1C" fontSize={20} fontWeight={900} fontFamily={FONT}>
              Bình khí O2 gạch chéo: Ngáp KHÔNG phải vì thiếu ô-xy!
            </text>
          </g>
        );
      case "TWO_TYPES":
        return (
          <g transform="translate(1240, 592)">
            <rect x={-365} y={-25} width={730} height={50} rx={25} fill="#EFF6FF" stroke="#0284C7" strokeWidth={3} />
            <text x={0} y={8} textAnchor="middle" fill="#0369A1" fontSize={20} fontWeight={900} fontFamily={FONT}>
              Phân biệt rõ: 1. Ngáp tự nhiên  ≠  2. Ngáp lây xã hội
            </text>
          </g>
        );
      case "LAUGH_YAWN":
        return (
          <g transform="translate(1240, 592)">
            <rect x={-360} y={-25} width={720} height={50} rx={25} fill="#FFF7ED" stroke="#EA580C" strokeWidth={3} />
            <text x={0} y={8} textAnchor="middle" fill="#9A3412" fontSize={20} fontWeight={900} fontFamily={FONT}>
              Lây cười  &amp;  Lây ngáp  →  Phản xạ vọng lại của bộ não
            </text>
          </g>
        );
      case "NOT_COLD":
        return (
          <g transform="translate(1240, 592)">
            <rect x={-355} y={-25} width={710} height={50} rx={25} fill="#ECFDF5" stroke="#10B981" strokeWidth={3} />
            <text x={0} y={8} textAnchor="middle" fill="#065F46" fontSize={20} fontWeight={900} fontFamily={FONT}>
              Không lây ngáp  ≠  Vô cảm — Hoàn toàn bình thường!
            </text>
          </g>
        );
      case "BRAKE":
        return (
          <g transform="translate(1240, 592)">
            <rect x={-370} y={-25} width={740} height={50} rx={25} fill="#ECFDF5" stroke="#059669" strokeWidth={3} />
            <circle cx={-328} cy={0} r={16} fill="#10B981" />
            <path d="M -335 0 L -330 5 L -320 -6" fill="none" stroke="#FFFFFF" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
            <text x={14} y={8} textAnchor="middle" fill="#065F46" fontSize={20} fontWeight={900} fontFamily={FONT}>
              Mẹo phanh cơn ngáp: Đổi ánh mắt • Hít mũi • Nhấp nước mát
            </text>
          </g>
        );
      case "SUMMARY":
        return (
          <g transform="translate(1240, 592)">
            <rect x={-350} y={-25} width={700} height={50} rx={25} fill="#EFF6FF" stroke="#2563EB" strokeWidth={3} />
            <text x={0} y={8} textAnchor="middle" fill="#1D4ED8" fontSize={20} fontWeight={900} fontFamily={FONT}>
              Chốt nhanh 3 bí mật khoa học thú vị nhất hôm nay!
            </text>
          </g>
        );
      default:
        return (
          <g transform="translate(1240, 592)">
            <rect x={-340} y={-23} width={680} height={46} rx={23} fill="#F8FAFC" stroke="#CBD5E1" strokeWidth={2.4} />
            <text x={0} y={7} textAnchor="middle" fill="#475569" fontSize={18.5} fontWeight={800} fontFamily={FONT}>
              Khoa học giải mã: Cơ chế phản chiếu &amp; đồng bộ xã hội trong não
            </text>
          </g>
        );
    }
  };

  return (
    <g id="host-explain-whiteboard-layer">
      <HostMirrorNeuronsBoardStaticCore activePanel={activePanel} />
      <g opacity={(0.92 + badgePulse * 0.08).toFixed(2)}>{renderContextFooter()}</g>
    </g>
  );
};

/* ============================================================================
 * 2. SCHOOL_CLASSROOM Seated Furniture Layers (Chairs Behind + Desks In Front!)
 *    - Guarantees seated students sit flush on chair behind wooden desktop
 *    - Zero floating, zero leg-through-desk overlap, flat opacity="0.12" shadow
 * ========================================================================== */

export const ClassroomSeatedChairsBack: React.FC<{
  positions: number[];
  groundY?: number;
}> = React.memo(({ positions, groundY = 840 }) => (
  <g id="classroom-seated-chairs-back" stroke={INK} strokeWidth={2.8} strokeLinejoin="round">
    {positions.map((cx, idx) => (
      <g key={`chair_b_${idx}`} transform={`translate(${cx}, ${groundY})`}>
        {/* Chair backrest & back legs rising cleanly behind seated student */}
        <rect x={-48} y={-216} width={96} height={58} rx={10} fill="#B45309" />
        <rect x={-40} y={-206} width={80} height={38} rx={6} fill="#D97706" stroke="none" opacity={0.75} />
        <rect x={-42} y={-158} width={12} height={156} rx={3} fill="#64748B" />
        <rect x={30} y={-158} width={12} height={156} rx={3} fill="#64748B" />
        {/* Wooden chair seat at y = groundY - 118 */}
        <rect x={-56} y={-124} width={112} height={18} rx={6} fill="#D97706" />
      </g>
    ))}
  </g>
));
ClassroomSeatedChairsBack.displayName = "ClassroomSeatedChairsBack";

export const ClassroomSeatedDesksForeground: React.FC<{
  desks: Array<{ x: number; hasWaterBottle?: boolean }>;
  groundY?: number;
}> = React.memo(({ desks, groundY = 840 }) => (
  <g id="classroom-seated-desks-foreground" stroke={INK} strokeWidth={2.8} strokeLinejoin="round">
    {desks.map((d, idx) => (
      <g key={`desk_fg_${idx}`} transform={`translate(${d.x}, ${groundY})`}>
        {/* Ground shadow under desk */}
        <GroundShadow cx={0} cy={5} rx={138} ry={10} />
        {/* Steel desk legs touching groundY cleanly */}
        <rect x={-114} y={-158} width={14} height={158} rx={3} fill="#64748B" />
        <rect x={100} y={-158} width={14} height={158} rx={3} fill="#64748B" />
        {/* Front wooden modesty panel hiding student's lower torso/legs completely behind desk */}
        <rect x={-118} y={-156} width={236} height={118} rx={6} fill="#B45309" />
        <rect x={-106} y={-144} width={212} height={94} rx={4} fill="#D97706" stroke="none" opacity={0.55} />
        {/* Wide wooden desktop slab at y = groundY - 178 */}
        <rect x={-132} y={-178} width={264} height={24} rx={7} fill="#F59E0B" />
        <line x1={-124} y1={-168} x2={124} y2={-168} stroke="#FEF3C7" strokeWidth={2.5} opacity={0.6} />

        {/* Open student notebook + yellow pencil on desktop */}
        <g transform="translate(-14, -178)">
          <path d="M -52,0 L -46,-10 L 0,-7 L 46,-10 L 52,0 Z" fill="#FFFFFF" stroke={INK} strokeWidth={2.2} />
          <line x1={0} y1={-7} x2={0} y2={0} stroke="#64748B" strokeWidth={2} />
          <line x1={-34} y1={-5} x2={-10} y2={-4} stroke="#94A3B8" strokeWidth={1.8} />
          <line x1={10} y1={-4} x2={34} y2={-5} stroke="#94A3B8" strokeWidth={1.8} />
          {/* Pencil */}
          <rect x={58} y={-6} width={34} height={6} rx={2} fill="#FACC15" stroke={INK} strokeWidth={1.8} />
        </g>

        {/* Optional cool blue water bottle on BOY's desk (Beats 45–47) */}
        {d.hasWaterBottle && (
          <g id="classroom-desk-water-bottle" transform="translate(88, -178)">
            <rect x={-14} y={-54} width={28} height={54} rx={8} fill="#BAE6FD" stroke="#0284C7" strokeWidth={2.6} />
            <rect x={-11} y={-34} width={22} height={31} rx={5} fill="#38BDF8" stroke="none" opacity={0.75} />
            <rect x={-9} y={-64} width={18} height={11} rx={3} fill="#0284C7" stroke={INK} strokeWidth={2.2} />
            <line x1={-6} y1={-46} x2={-6} y2={-14} stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" opacity={0.75} />
          </g>
        )}
      </g>
    ))}
  </g>
));
ClassroomSeatedDesksForeground.displayName = "ClassroomSeatedDesksForeground";

/* ============================================================================
 * 3. CITY_LIVING_ROOM Cute 2D Animated Pet Dog on Cozy Rug
 *    - Supports DOG_REST, DOG_YAWN (Beat 32), DAD_PET_DOG (Beat 39), DOG_WAG (Beat 53)
 * ========================================================================== */

export const LivingRoomPetDog: React.FC<{
  mode: LivingRoomDetailId;
  frame: number;
  x?: number;
  y?: number;
}> = ({ mode, frame, x = 1280, y = 808 }) => {
  if (mode === "NONE") return null;

  const isYawning = mode === "DOG_YAWN";
  const isPetted = mode === "DAD_PET_DOG";
  const isWagging = mode === "DOG_WAG" || isPetted;
  const breath = Math.sin(frame * 0.08) * 1.8;
  const tailWag = Math.sin(frame * (isWagging ? 0.42 : 0.14)) * (isWagging ? 22 : 6);
  const headTilt = isYawning ? -16 : isPetted ? -6 : -4 + Math.sin(frame * 0.06) * 3;
  const yawnCycle = isYawning ? 0.55 + 0.45 * Math.sin(frame * 0.14) : 0;

  return (
    <g id="living-room-pet-dog" transform={`translate(${x}, ${y})`}>
      {/* Cozy woven rug under puppy */}
      <ellipse cx={-6} cy={14} rx={128} ry={28} fill="#FEF3C7" stroke="#D97706" strokeWidth={3} />
      <ellipse cx={-6} cy={14} rx={104} ry={20} fill="#FDE68A" stroke="none" opacity={0.65} />
      <GroundShadow cx={-4} cy={10} rx={78} ry={13} />

      {/* Wagging Tail */}
      <g transform={`translate(56, -24) rotate(${tailWag.toFixed(1)})`}>
        <path
          d="M 0,0 Q 26,-24 38,-48"
          fill="none"
          stroke={INK}
          strokeWidth={14}
          strokeLinecap="round"
        />
        <path
          d="M 0,0 Q 26,-24 38,-48"
          fill="none"
          stroke="#D97706"
          strokeWidth={8.5}
          strokeLinecap="round"
        />
      </g>

      {/* Curled Golden-Tan Body */}
      <g transform={`translate(0, ${breath.toFixed(1)})`} stroke={INK} strokeWidth={3.2} strokeLinejoin="round">
        <ellipse cx={12} cy={-24} rx={58} ry={34} fill="#F59E0B" />
        <ellipse cx={4} cy={-16} rx={36} ry={18} fill="#FDE68A" stroke="none" />
        {/* Front tucked paws */}
        <ellipse cx={-42} cy={-2} rx={18} ry={10} fill="#FBBF24" />
        <ellipse cx={-12} cy={4} rx={18} ry={10} fill="#FBBF24" />
        {/* Red collar with gold tag */}
        <path d="M -32,-48 Q -18,-36 -4,-44" fill="none" stroke="#DC2626" strokeWidth={8} strokeLinecap="round" />
        <circle cx={-20} cy={-35} r={5.5} fill="#FACC15" stroke={INK} strokeWidth={2} />

        {/* Expressive Puppy Head (facing LEFT toward BOY & Dad on sofa) */}
        <g transform={`translate(-34, -56) rotate(${headTilt.toFixed(1)})`}>
          {/* Back floppy ear */}
          <ellipse cx={-22} cy={-4} rx={11} ry={22} transform="rotate(18, -22, -4)" fill="#92400E" />
          {/* Head circle + cute muzzle */}
          <circle cx={0} cy={0} r={32} fill="#FBBF24" />
          <ellipse cx={-22} cy={8} rx={18} ry={14} fill="#FEF3C7" />
          {/* Front floppy ear */}
          <ellipse cx={18} cy={0} rx={12} ry={24} transform="rotate(-14, 18, 0)" fill="#92400E" />
          {/* Cute dark nose */}
          <ellipse cx={-34} cy={3} rx={6.5} ry={4.8} fill={INK} />

          {/* Eyes */}
          {isPetted ? (
            <path d="M -16,-6 Q -10,-12 -4,-6" fill="none" stroke={INK} strokeWidth={3.2} strokeLinecap="round" />
          ) : isYawning ? (
            <path d="M -17,-6 Q -10,-2 -3,-6" fill="none" stroke={INK} strokeWidth={3.2} strokeLinecap="round" />
          ) : (
            <g>
              <circle cx={-11} cy={-7} r={5.5} fill="#FFFFFF" stroke={INK} strokeWidth={2.2} />
              <circle cx={-12} cy={-7} r={2.8} fill={INK} />
            </g>
          )}

          {/* Mouth: Wide cute pink-tongued yawn in DOG_YAWN, happy smile otherwise */}
          {isYawning ? (
            <g id="living-room-dog-yawn-mouth">
              <ellipse
                cx={-22}
                cy={16}
                rx={11 + yawnCycle * 4}
                ry={10 + yawnCycle * 6}
                fill="#9F1239"
                stroke={INK}
                strokeWidth={2.6}
              />
              <ellipse cx={-22} cy={22 + yawnCycle * 2} rx={8} ry={5} fill="#FB7185" stroke="none" />
            </g>
          ) : (
            <path d="M -28,13 Q -20,20 -13,13" fill="none" stroke={INK} strokeWidth={2.8} strokeLinecap="round" />
          )}
        </g>
      </g>

      {/* Cute Yawn Wave Arcs when DOG_YAWN */}
      {isYawning && (
        <g id="living-room-dog-yawn-waves" transform="translate(-82, -88)" fill="none" stroke="#F97316" strokeLinecap="round">
          {[0, 1].map((wi) => {
            const p = (frame * 0.035 + wi * 0.5) % 1;
            return (
              <path
                key={wi}
                d={`M ${(-8 - p * 22).toFixed(1)},${(-6 - p * 26).toFixed(1)} Q ${(-22 - p * 22).toFixed(1)},${(-18 - p * 26).toFixed(1)} ${(-12 - p * 22).toFixed(1)},${(-32 - p * 26).toFixed(1)}`}
                strokeWidth={3.2}
                opacity={(Math.sin(p * Math.PI) * 0.85).toFixed(2)}
              />
            );
          })}
        </g>
      )}

      {/* Happy floating heart when DAD_PET_DOG */}
      {isPetted && (
        <g transform={`translate(-34, ${(-118 - Math.sin(frame * 0.12) * 8).toFixed(1)})`}>
          <path
            d="M 0,10 C -14,-2 -14,-14 -4,-14 C 0,-14 0,-8 0,-8 C 0,-8 0,-14 4,-14 C 14,-14 14,-2 0,10 Z"
            fill="#FB7185"
            stroke="#BE123C"
            strokeWidth={2}
          />
        </g>
      )}
    </g>
  );
};

/* ============================================================================
 * 4. ActorYawnWavesOverlay — Soft animated yawn arcs floating near yawning actor
 * ========================================================================== */

export const ActorYawnWavesOverlay: React.FC<{
  x: number;
  y: number;
  facingDir: 1 | -1;
  frame: number;
}> = ({ x, y, facingDir, frame }) => (
  <g transform={`translate(${x.toFixed(1)}, ${y.toFixed(1)}) scale(${facingDir}, 1)`} fill="none" stroke="#F59E0B" strokeLinecap="round">
    {[0, 1].map((wi) => {
      const p = (frame * 0.04 + wi * 0.5) % 1;
      const dx = 28 + p * 28;
      const dy = -8 - p * 34;
      return (
        <path
          key={wi}
          d={`M ${dx.toFixed(1)},${(dy + 12).toFixed(1)} Q ${(dx + 14).toFixed(1)},${dy.toFixed(1)} ${(dx + 4).toFixed(1)},${(dy - 12).toFixed(1)}`}
          strokeWidth={3.6}
          opacity={(Math.sin(p * Math.PI) * 0.9).toFixed(2)}
        />
      );
    })}
  </g>
);

/* ============================================================================
 * 5. HOST_EXPLAIN_OVERLAY Whiteboard: labBoard = "ACOUSTICS_CRINGE_ALARM" (Episode 8)
 *    - Locked cleanly to x=680..1800, y=90..640 (width=1120, height=550)
 *    - Guaranteed >= 90px gap from left Host speech bubble (x <= 590)
 *    - 100% flat 2D SVG, zero blur/shadow filters, React.memo static core
 * ========================================================================== */

const HostAcousticsCringeBoardStaticCore: React.FC<{
  activePanel?: "LEFT" | "CENTER" | "RIGHT";
  greenTipsTheme?: boolean;
}> = React.memo(({ activePanel, greenTipsTheme = false }) => {
  const leftBorder = activePanel === "LEFT" ? "#EA580C" : "#0284C7";
  const centerBorder = activePanel === "CENTER" ? "#DC2626" : "#F59E0B";
  const rightBorder = activePanel === "RIGHT" ? "#059669" : "#7C3AED";
  const leftW = activePanel === "LEFT" ? 4.5 : 2.8;
  const centerW = activePanel === "CENTER" ? 4.5 : 2.8;
  const rightW = activePanel === "RIGHT" ? 4.5 : 2.8;

  return (
    <g id="host-board-acoustics-cringe-static">
      <GroundShadow cx={1240} cy={654} rx={545} ry={12} />

      {/* Main Whiteboard Frame (x=680..1800, y=90..640) */}
      <rect
        x={680}
        y={90}
        width={1120}
        height={550}
        rx={22}
        fill="#FFFFFF"
        stroke={greenTipsTheme ? "#10B981" : "#64748B"}
        strokeWidth={10}
      />
      <rect
        x={680}
        y={90}
        width={1120}
        height={550}
        rx={22}
        fill="none"
        stroke={INK}
        strokeWidth={3.2}
      />

      {/* 4 corner whiteboard pins */}
      <circle cx={706} cy={116} r={6} fill="#EF4444" stroke={INK} strokeWidth={2} />
      <circle cx={1774} cy={116} r={6} fill="#EF4444" stroke={INK} strokeWidth={2} />
      <circle cx={706} cy={614} r={6} fill="#0284C7" stroke={INK} strokeWidth={2} />
      <circle cx={1774} cy={614} r={6} fill="#0284C7" stroke={INK} strokeWidth={2} />

      {/* Top Title Banner */}
      <rect
        x={724}
        y={108}
        width={1032}
        height={48}
        rx={12}
        fill={greenTipsTheme ? "#ECFDF5" : "#FEF2F2"}
        stroke={greenTipsTheme ? "#059669" : "#DC2626"}
        strokeWidth={2.6}
      />
      <text
        x={1240}
        y={139}
        textAnchor="middle"
        fill={greenTipsTheme ? "#065F46" : "#991B1B"}
        fontSize={20}
        fontWeight={900}
        fontFamily={FONT}
      >
        NGHIÊN CỨU ÂM HỌC &amp; NÃO BỘ • TẦN SỐ 2.000–4.000 Hz &amp; BÁO ĐỘNG RÙNG MÌNH
      </text>

      {/* ============================================================
       * Ô TRÁI (x=710..1046, y=172..546): Ống tai cộng hưởng 2.000–4.000 Hz
       * ============================================================ */}
      <g id="board-panel-cringe-left" transform="translate(710, 172)">
        <rect
          x={0}
          y={0}
          width={336}
          height={374}
          rx={16}
          fill={activePanel === "LEFT" ? "#FFF7ED" : "#F0F9FF"}
          stroke={leftBorder}
          strokeWidth={leftW}
        />
        <text x={168} y={36} textAnchor="middle" fill="#0369A1" fontSize={18.5} fontWeight={900} fontFamily={FONT}>
          1. Loa cộng hưởng ống tai
        </text>

        {/* Ear canal tube + megaphone amplification */}
        <g transform="translate(168, 128)">
          {/* Outer ear shell */}
          <path
            d="M -112,-38 C -138,-38 -144,34 -108,42 C -90,46 -80,22 -84,4 C -88,-16 -96,-38 -112,-38 Z"
            fill="#FDE68A"
            stroke={INK}
            strokeWidth={3}
          />
          {/* Ear canal corridor (~2.5 cm) */}
          <path
            d="M -88,-18 L 62,-26 L 62,26 L -88,18 Z"
            fill="#FED7AA"
            stroke={INK}
            strokeWidth={3}
          />
          {/* Eardrum oval */}
          <ellipse cx={66} cy={0} rx={12} ry={28} fill="#EF4444" stroke={INK} strokeWidth={3} />
          {/* Amplifying jagged wave inside ear canal */}
          <path
            d="M -78,0 L -64,-8 L -50,8 L -34,-12 L -16,14 L 4,-18 L 24,20 L 44,-22 L 54,0"
            fill="none"
            stroke="#DC2626"
            strokeWidth={3.6}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Speaker badge on right */}
          <g transform="translate(108, 0)">
            <polygon points="-20,-10 -8,-10 8,-22 8,22 -8,10 -20,10" fill="#0284C7" stroke={INK} strokeWidth={2.5} />
            <path d="M 16,-12 Q 26,0 16,12" fill="none" stroke="#EA580C" strokeWidth={3.2} strokeLinecap="round" />
            <path d="M 24,-20 Q 38,0 24,20" fill="none" stroke="#DC2626" strokeWidth={3.2} strokeLinecap="round" />
          </g>
        </g>

        {/* Bottom summary box inside left panel */}
        <rect x={20} y={214} width={296} height={138} rx={12} fill="#FFFFFF" stroke="#BAE6FD" strokeWidth={2.4} />
        <rect x={54} y={228} width={228} height={36} rx={18} fill="#DC2626" />
        <text x={168} y={252} textAnchor="middle" fill="#FFFFFF" fontSize={16.5} fontWeight={900} fontFamily={FONT}>
          2.000 – 4.000 Hz
        </text>
        <text x={168} y={294} textAnchor="middle" fill="#0F172A" fontSize={16} fontWeight={800} fontFamily={FONT}>
          Ống tai dài ~2,5 cm tự phóng đại
        </text>
        <text x={168} y={324} textAnchor="middle" fill="#C2410C" fontSize={15.5} fontWeight={800} fontFamily={FONT}>
          → Nghe sắc &amp; chói gấp đôi!
        </text>
      </g>

      {/* ============================================================
       * Ô GIỮA (x=1066..1414, y=172..546): Vỏ não thính giác <-> Hạch hạnh nhân
       * ============================================================ */}
      <g id="board-panel-cringe-center" transform="translate(1066, 172)">
        <rect
          x={0}
          y={0}
          width={348}
          height={374}
          rx={16}
          fill={activePanel === "CENTER" ? "#FEF2F2" : "#FFFBEB"}
          stroke={centerBorder}
          strokeWidth={centerW}
        />
        <text x={174} y={36} textAnchor="middle" fill="#B45309" fontSize={18.5} fontWeight={900} fontFamily={FONT}>
          2. Vòng báo động não bộ
        </text>

        {/* Brain diagram with Auditory Cortex (blue) <-> Amygdala (red) loop */}
        <g transform="translate(174, 134)">
          <path
            d="M -92,14 C -110,-22 -88,-66 -42,-72 C -18,-90 28,-90 48,-68 C 94,-60 108,-14 88,18 C 80,44 46,60 12,54 C -6,62 -30,62 -46,52 C -74,50 -90,34 -92,14 Z"
            fill="#FDE2E4"
            stroke={INK}
            strokeWidth={3.4}
            strokeLinejoin="round"
          />
          {/* Auditory Cortex node */}
          <circle cx={-38} cy={-16} r={24} fill="#0284C7" stroke="#FFFFFF" strokeWidth={3} />
          <text x={-38} y={-11} textAnchor="middle" fill="#FFFFFF" fontSize={13} fontWeight={900} fontFamily={FONT}>
            Thính
          </text>
          {/* Amygdala alarm node */}
          <circle cx={38} cy={8} r={24} fill="#DC2626" stroke="#FFFFFF" strokeWidth={3} />
          <text x={38} y={14} textAnchor="middle" fill="#FFFFFF" fontSize={18} fontWeight={900} fontFamily={FONT}>
            !
          </text>
          {/* Two-way feedback arrows */}
          <path d="M -12,-22 Q 16,-34 32,-16" fill="none" stroke="#EA580C" strokeWidth={4} strokeLinecap="round" />
          <polygon points="36,-11 23,-14 31,-24" fill="#EA580C" />
          <path d="M 14,22 Q -14,34 -30,12" fill="none" stroke="#DC2626" strokeWidth={4} strokeLinecap="round" />
          <polygon points="-34,6 -22,10 -31,19" fill="#DC2626" />
        </g>

        {/* Legend & summary box */}
        <rect x={20} y={214} width={308} height={138} rx={12} fill="#FFFFFF" stroke="#FDE68A" strokeWidth={2.4} />
        <text x={174} y={248} textAnchor="middle" fill="#0369A1" fontSize={16} fontWeight={900} fontFamily={FONT}>
          Vỏ não thính giác  ↔  Hạch hạnh nhân
        </text>
        <text x={174} y={282} textAnchor="middle" fill="#334155" fontSize={15} fontWeight={700} fontFamily={FONT}>
          Sóng răng cưa giống tiếng hét cảnh báo
        </text>
        <rect x={44} y={300} width={260} height={36} rx={18} fill="#FEE2E2" stroke="#DC2626" strokeWidth={2.2} />
        <text x={174} y={324} textAnchor="middle" fill="#991B1B" fontSize={15.5} fontWeight={900} fontFamily={FONT}>
          Vòng xoáy phóng đại khó chịu!
        </text>
      </g>

      {/* ============================================================
       * Ô PHẢI (x=1434..1770, y=172..546): Giao cảm -> Cơ dựng lông -> Nổi da gà
       * ============================================================ */}
      <g id="board-panel-cringe-right" transform="translate(1434, 172)">
        <rect
          x={0}
          y={0}
          width={336}
          height={374}
          rx={16}
          fill={activePanel === "RIGHT" ? "#ECFDF5" : "#F5F3FF"}
          stroke={rightBorder}
          strokeWidth={rightW}
        />
        <text x={168} y={36} textAnchor="middle" fill="#6D28D9" fontSize={18.5} fontWeight={900} fontFamily={FONT}>
          3. Phản xạ nổi da gà
        </text>

        {/* Mini skin cross-section showing contracted muscle + raised hair bumps */}
        <g transform="translate(26, 66)">
          <rect x={0} y={0} width={284} height={134} rx={14} fill="#FFFFFF" stroke="#C4B5FD" strokeWidth={2.4} />
          {/* Skin bumps */}
          <path
            d="M 14,82 Q 52,82 64,66 Q 76,82 114,82 Q 134,82 146,66 Q 158,82 196,82 Q 214,82 226,66 Q 238,82 270,82 L 270,126 L 14,126 Z"
            fill="#FDE68A"
            stroke="#D97706"
            strokeWidth={2.6}
          />
          {/* 3 standing hairs + tiny muscle bands */}
          {[64, 146, 226].map((hx, hi) => (
            <g key={hi}>
              <line x1={hx} y1={108} x2={hx} y2={28} stroke="#1E293B" strokeWidth={4} strokeLinecap="round" />
              <path d={`M ${hx + 3},98 L ${hx + 22},84`} stroke="#DC2626" strokeWidth={4.5} strokeLinecap="round" />
            </g>
          ))}
          <text x={142} y={20} textAnchor="middle" fill="#B91C1C" fontSize={14} fontWeight={900} fontFamily={FONT}>
            Lông dựng đứng + Da nổi hạt
          </text>
        </g>

        {/* Bottom summary box inside right panel */}
        <rect x={20} y={214} width={296} height={138} rx={12} fill="#FFFFFF" stroke="#DDD6FE" strokeWidth={2.4} />
        <text x={168} y={248} textAnchor="middle" fill="#6D28D9" fontSize={16.5} fontWeight={900} fontFamily={FONT}>
          Hệ thần kinh giao cảm kích hoạt
        </text>
        <text x={168} y={282} textAnchor="middle" fill="#334155" fontSize={15} fontWeight={700} fontFamily={FONT}>
          Cơ dựng lông co rút đồng loạt
        </text>
        <text x={168} y={318} textAnchor="middle" fill="#0F766E" fontSize={16} fontWeight={900} fontFamily={FONT}>
          → Rùng mình &amp; Nổi da gà!
        </text>
      </g>
    </g>
  );
});
HostAcousticsCringeBoardStaticCore.displayName = "HostAcousticsCringeBoardStaticCore";

export const HostAcousticsCringeBoard: React.FC<{
  highlight?: HostBoardHighlightId;
  frame?: number;
}> = ({ highlight = "NONE", frame = 0 }) => {
  const activePanel: "LEFT" | "CENTER" | "RIGHT" | undefined =
    highlight === "LEFT" || highlight === "EAR_AMPLIFIER" || highlight === "WHY_IMMUNE"
      ? "LEFT"
      : highlight === "CENTER" || highlight === "BRAIN_ALARM" || highlight === "MUSIC_TRICK"
      ? "CENTER"
      : highlight === "RIGHT" || highlight === "CRINGE_TIPS"
      ? "RIGHT"
      : undefined;

  const greenTipsTheme = highlight === "CRINGE_TIPS";
  const badgePulse = 0.5 + 0.5 * Math.sin(frame * 0.16);

  const renderContextFooter = () => {
    switch (highlight) {
      case "CRINGE_IMAGINE":
        return (
          <g transform="translate(1240, 592)">
            <rect x={-385} y={-25} width={770} height={50} rx={25} fill="#FFF7ED" stroke="#EA580C" strokeWidth={3} />
            {/* Mini thought-cloud + chalkboard emblem on left */}
            <circle cx={-344} cy={0} r={17} fill="#14532D" stroke="#92400E" strokeWidth={2.5} />
            <path d="M -352,-4 L -336,4 M -350,5 L -338,-5" stroke="#FDE047" strokeWidth={2.5} strokeLinecap="round" />
            <text x={16} y={8} textAnchor="middle" fill="#9A3412" fontSize={19.5} fontWeight={900} fontFamily={FONT}>
              Chỉ cần nghĩ tới móng tay cào bảng là não đã sởn gai ốc!
            </text>
          </g>
        );
      case "EAR_AMPLIFIER":
        return (
          <g transform="translate(1240, 592)">
            <rect x={-375} y={-25} width={750} height={50} rx={25} fill="#EFF6FF" stroke="#0284C7" strokeWidth={3} />
            <text x={0} y={8} textAnchor="middle" fill="#0369A1" fontSize={19.5} fontWeight={900} fontFamily={FONT}>
              Ống tai dài ~2,5 cm cộng hưởng cực mạnh đúng dải 2.000–4.000 Hz!
            </text>
          </g>
        );
      case "BRAIN_ALARM":
        return (
          <g transform="translate(1240, 592)">
            <rect x={-375} y={-25} width={750} height={50} rx={25} fill="#FEE2E2" stroke="#DC2626" strokeWidth={3} />
            <circle cx={-334} cy={0} r={16} fill="#DC2626" />
            <text x={-334} y={6} textAnchor="middle" fill="#FFFFFF" fontSize={19} fontWeight={900} fontFamily={FONT}>
              !
            </text>
            <text x={14} y={8} textAnchor="middle" fill="#991B1B" fontSize={19.5} fontWeight={900} fontFamily={FONT}>
              Tai chỉ phóng to — chính Hạch hạnh nhân bật còi rùng mình!
            </text>
          </g>
        );
      case "MUSIC_TRICK":
        return (
          <g transform="translate(1240, 592)">
            <rect x={-375} y={-25} width={750} height={50} rx={25} fill="#F5F3FF" stroke="#7C3AED" strokeWidth={3} />
            <circle cx={-334} cy={0} r={16} fill="#7C3AED" />
            <text x={-334} y={6} textAnchor="middle" fill="#FFFFFF" fontSize={18} fontWeight={900} fontFamily={FONT}>
              ♪
            </text>
            <text x={14} y={8} textAnchor="middle" fill="#5B21B6" fontSize={19.5} fontWeight={900} fontFamily={FONT}>
              Cú lừa tâm lý: Não bộ + Ký ức phóng đại cảm giác khó chịu!
            </text>
          </g>
        );
      case "WHY_IMMUNE":
        return (
          <g transform="translate(1240, 592)">
            <rect x={-375} y={-25} width={750} height={50} rx={25} fill="#FEF3C7" stroke="#D97706" strokeWidth={3} />
            <circle cx={-334} cy={0} r={16} fill="#D97706" />
            <text x={-334} y={6} textAnchor="middle" fill="#FFFFFF" fontSize={19} fontWeight={900} fontFamily={FONT}>
              ?
            </text>
            <text x={14} y={8} textAnchor="middle" fill="#92400E" fontSize={19.5} fontWeight={900} fontFamily={FONT}>
              Vì sao có người nghe cào bảng vẫn tỉnh bơ không rùng mình?
            </text>
          </g>
        );
      case "CRINGE_TIPS":
        return (
          <g transform="translate(1240, 592)">
            <rect x={-385} y={-25} width={770} height={50} rx={25} fill="#ECFDF5" stroke="#059669" strokeWidth={3} />
            <circle cx={-344} cy={0} r={16} fill="#10B981" />
            <path d="M -351 0 L -346 5 L -336 -6" fill="none" stroke="#FFFFFF" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
            <text x={14} y={8} textAnchor="middle" fill="#065F46" fontSize={19.5} fontWeight={900} fontFamily={FONT}>
              3 Mẹo cắt rùng mình: Nghiêng phấn 45° • Lót thức ăn • Thả lỏng vai
            </text>
          </g>
        );
      case "SUMMARY":
        return (
          <g transform="translate(1240, 592)">
            <rect x={-360} y={-25} width={720} height={50} rx={25} fill="#EFF6FF" stroke="#2563EB" strokeWidth={3} />
            <text x={0} y={8} textAnchor="middle" fill="#1D4ED8" fontSize={20} fontWeight={900} fontFamily={FONT}>
              Chốt gọn 3 bí mật khoa học đằng sau cơn rùng mình nổi da gà!
            </text>
          </g>
        );
      default:
        return (
          <g transform="translate(1240, 592)">
            <rect x={-360} y={-23} width={720} height={46} rx={23} fill="#F8FAFC" stroke="#CBD5E1" strokeWidth={2.4} />
            <text x={0} y={7} textAnchor="middle" fill="#475569" fontSize={18.5} fontWeight={800} fontFamily={FONT}>
              Giải mã âm học: Ma sát dính–trượt → Loa ống tai → Báo động não bộ
            </text>
          </g>
        );
    }
  };

  return (
    <g id="host-explain-whiteboard-acoustics-layer">
      <HostAcousticsCringeBoardStaticCore activePanel={activePanel} greenTipsTheme={greenTipsTheme} />
      <g opacity={(0.92 + badgePulse * 0.08).toFixed(2)}>{renderContextFooter()}</g>
    </g>
  );
};

/* ============================================================================
 * 6. SCHOOL_CLASSROOM Chalkboard Action Overlays (Episode 8 Beats 2 & 48)
 *    - CHALK_SCRATCH_WAVE: jagged orange-red screech waves + crisp "Kéttt!" tag
 *    - CHALK_WRITE_45DEG: clean 45-degree chalk stroke + smooth green sparkles
 * ========================================================================== */

export const ClassroomBoardScreechOverlay: React.FC<{
  mode: ClassroomDetailId;
  frame: number;
}> = ({ mode, frame }) => {
  if (mode !== "CHALK_SCRATCH_WAVE" && mode !== "CHALK_WRITE_45DEG") return null;

  if (mode === "CHALK_SCRATCH_WAVE") {
    const pulse = 0.5 + 0.5 * Math.sin(frame * 0.45);
    const shift = Math.sin(frame * 0.55) * 5;
    return (
      <g id="classroom-chalk-scratch-wave" transform="translate(1075, 292)">
        {/* Long nail scratch mark down the green chalkboard */}
        <path
          d="M 18,-56 L 26,64"
          fill="none"
          stroke="#FEF08A"
          strokeWidth={4.8}
          strokeLinecap="round"
          strokeDasharray="10 6"
        />
        {/* Jagged red-orange acoustic screech arcs radiating left toward BOY & Linh */}
        {[0, 1, 2].map((ri) => {
          const rOff = -28 - ri * 46 - pulse * 10;
          const h = 36 + ri * 22;
          return (
            <path
              key={ri}
              d={`M ${rOff.toFixed(1)},${(-h).toFixed(1)} L ${(rOff - 16).toFixed(1)},${(-h * 0.45).toFixed(1)} L ${(rOff + 6).toFixed(1)},0 L ${(rOff - 18).toFixed(1)},${(h * 0.48).toFixed(1)} L ${rOff.toFixed(1)},${h.toFixed(1)}`}
              fill="none"
              stroke={ri === 0 ? "#EF4444" : "#F97316"}
              strokeWidth={5.5 - ri * 0.8}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={(0.95 - ri * 0.18).toFixed(2)}
            />
          );
        })}
        {/* Crisp high-contrast "Kéttt!" comic sound pill clearly visible on chalkboard */}
        <g transform={`translate(-92, ${(-76 + shift).toFixed(1)}) rotate(-8)`}>
          <rect x={-64} y={-24} width={128} height={46} rx={16} fill="#DC2626" stroke={INK} strokeWidth={3.2} />
          <text x={0} y={8} textAnchor="middle" fill="#FFFFFF" fontSize={26} fontWeight={900} fontFamily={FONT}>
            Kéttt!
          </text>
        </g>
      </g>
    );
  }

  // CHALK_WRITE_45DEG: Smooth tilted 45° chalk glide on Beat 48
  const glide = (frame * 1.6) % 48;
  return (
    <g id="classroom-chalk-write-45deg" transform="translate(1225, 330)">
      {/* Clean tilted 45-degree white chalk gliding smoothly */}
      <g transform={`translate(${(glide * 0.6).toFixed(1)}, ${(-18 + Math.sin(frame * 0.14) * 5).toFixed(1)}) rotate(45)`}>
        <rect x={-26} y={-7} width={52} height={14} rx={4} fill="#FFFFFF" stroke={INK} strokeWidth={2.6} />
        <rect x={-24} y={-4} width={18} height={8} rx={2} fill="#BAE6FD" stroke="none" />
      </g>
      {/* Smooth green-tinted gliding arcs */}
      <path d="M -92,16 Q -44,-4 10,14" fill="none" stroke="#86EFAC" strokeWidth={4} strokeLinecap="round" opacity={0.9} />
      <g transform="translate(-76, -68)">
        <rect x={-62} y={-20} width={124} height={38} rx={14} fill="#ECFDF5" stroke="#059669" strokeWidth={2.8} />
        <text x={0} y={6} textAnchor="middle" fill="#065F46" fontSize={19} fontWeight={900} fontFamily={FONT}>
          45° • Êm ru!
        </text>
      </g>
    </g>
  );
};

/* ============================================================================
 * 7. HOME_KITCHEN 3-Layer Seated Family Dining Table Kit (Episode 8 Beats 29–31, 46–47)
 *    - Chairs BEHIND seated family members (Bố, BOY, Mẹ)
 *    - Foreground wooden dining table in FRONT with 3 steak plates, forks & knives
 *    - Optional FORK_SCRAPE_WAVE jagged soundwaves + "KÉTTT!" off BOY's plate (Beat 30)
 * ========================================================================== */

export const KitchenDiningChairsBack: React.FC<{
  positions: number[];
  groundY?: number;
}> = React.memo(({ positions, groundY = 840 }) => (
  <g id="kitchen-dining-chairs-back" stroke={INK} strokeWidth={2.8} strokeLinejoin="round">
    {positions.map((cx, idx) => (
      <g key={`kchair_${idx}`} transform={`translate(${cx}, ${groundY})`}>
        {/* Warm wooden dining chair backrest behind seated family member */}
        <rect x={-52} y={-236} width={104} height={104} rx={12} fill="#92400E" />
        <rect x={-40} y={-222} width={80} height={22} rx={6} fill="#B45309" stroke="none" />
        <rect x={-40} y={-188} width={80} height={22} rx={6} fill="#B45309" stroke="none" />
        <rect x={-44} y={-136} width={13} height={136} rx={3} fill="#78350F" />
        <rect x={31} y={-136} width={13} height={136} rx={3} fill="#78350F" />
        {/* Cushion seat at y = groundY - 122 */}
        <rect x={-58} y={-126} width={116} height={20} rx={8} fill="#D97706" />
      </g>
    ))}
  </g>
));
KitchenDiningChairsBack.displayName = "KitchenDiningChairsBack";

const KitchenDiningTableStatic: React.FC<{
  plateXs: number[];
  groundY: number;
}> = React.memo(({ plateXs, groundY }) => (
  <g id="kitchen-dining-table-foreground" transform={`translate(0, ${groundY})`} stroke={INK} strokeWidth={3} strokeLinejoin="round">
    {/* Flat grounding shadow under dining table */}
    <GroundShadow cx={960} cy={8} rx={620} ry={14} />

    {/* Warm solid oak dining table legs touching groundY cleanly */}
    <rect x={392} y={-152} width={28} height={152} rx={5} fill="#78350F" />
    <rect x={1500} y={-152} width={28} height={152} rx={5} fill="#78350F" />
    {/* Modesty apron panel hiding seated lower legs cleanly behind table */}
    <rect x={386} y={-152} width={1148} height={132} rx={8} fill="#B45309" />
    <rect x={412} y={-138} width={1096} height={104} rx={6} fill="#D97706" stroke="none" opacity={0.48} />

    {/* Wide polished dining tabletop slab at y = groundY - 172 */}
    <rect x={352} y={-174} width={1216} height={28} rx={10} fill="#F59E0B" />
    <line x1={372} y1={-162} x2={1548} y2={-162} stroke="#FEF3C7" strokeWidth={3} opacity={0.62} />

    {/* Center warm table runner + water pitcher */}
    <rect x={875} y={-174} width={170} height={12} rx={4} fill="#FEF3C7" stroke="#D97706" strokeWidth={2} />
    <g transform="translate(1152, -174)">
      <path d="M -18,0 L -14,-56 L 14,-56 L 18,0 Z" fill="#E0F2FE" stroke="#0284C7" strokeWidth={2.5} />
      <path d="M -14,-28 L 14,-28 L 16,-4 L -16,-4 Z" fill="#7DD3FC" stroke="none" opacity={0.75} />
      <path d="M 14,-44 C 28,-44 28,-20 16,-18" fill="none" stroke="#0284C7" strokeWidth={3} />
    </g>

    {/* 3 Steak Porcelain Plates + Forks & Knives aligned with seated actors */}
    {plateXs.map((px, pi) => (
      <g key={`steak_plate_${pi}`} transform={`translate(${px}, -174)`}>
        {/* Porcelain plate rim */}
        <ellipse cx={0} cy={-4} rx={78} ry={16} fill="#FFFFFF" stroke="#64748B" strokeWidth={2.8} />
        <ellipse cx={0} cy={-4} rx={58} ry={10} fill="#F8FAFC" stroke="#CBD5E1" strokeWidth={1.8} />
        {/* Seared beef steak + green veggies */}
        <ellipse cx={-8} cy={-8} rx={36} ry={11} fill="#9A3412" stroke={INK} strokeWidth={2.2} />
        <path d="M -26,-10 L -14,-4 M -8,-12 L 4,-5 M 8,-10 L 18,-5" stroke="#451A03" strokeWidth={2.2} strokeLinecap="round" />
        <circle cx={32} cy={-8} r={8} fill="#22C55E" stroke="#15803D" strokeWidth={1.8} />
        <circle cx={22} cy={-14} r={6.5} fill="#4ADE80" stroke="#15803D" strokeWidth={1.6} />
        {/* Metal fork on left */}
        <g transform="translate(-94, -4)">
          <line x1={0} y1={-16} x2={0} y2={4} stroke="#64748B" strokeWidth={4} strokeLinecap="round" />
          <path d="M -5,-22 L -5,-14 M 0,-23 L 0,-14 M 5,-22 L 5,-14" stroke="#64748B" strokeWidth={2.2} strokeLinecap="round" />
        </g>
        {/* Metal knife on right */}
        <g transform="translate(94, -4)">
          <line x1={0} y1={-18} x2={0} y2={4} stroke="#64748B" strokeWidth={4.2} strokeLinecap="round" />
          <path d="M -2,-24 Q 6,-16 2,-8 L -2,-8 Z" fill="#CBD5E1" stroke="#475569" strokeWidth={1.8} />
        </g>
      </g>
    ))}
  </g>
));
KitchenDiningTableStatic.displayName = "KitchenDiningTableStatic";

export const KitchenDiningTableForeground: React.FC<{
  plateXs: number[];
  mode: KitchenDetailId;
  scrapeX?: number;
  frame: number;
  groundY?: number;
}> = ({ plateXs, mode, scrapeX = 960, frame, groundY = 840 }) => {
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.48);
  const jitterY = Math.sin(frame * 0.6) * 5;
  return (
    <g id="kitchen-dining-table-layer">
      <KitchenDiningTableStatic plateXs={plateXs} groundY={groundY} />
      {mode === "FORK_SCRAPE_WAVE" && (
        <g id="kitchen-fork-scrape-wave" transform={`translate(${scrapeX}, ${groundY - 190})`}>
          {/* Fork angled directly scraping porcelain plate */}
          <g transform="translate(30, -2) rotate(-32)">
            <rect x={-4} y={-42} width={8} height={36} rx={3} fill="#94A3B8" stroke={INK} strokeWidth={2.2} />
            <path d="M -6,-6 L -6,8 M 0,-6 L 0,10 M 6,-6 L 6,8" stroke="#475569" strokeWidth={2.4} strokeLinecap="round" />
          </g>
          {/* Jagged orange-red soundwaves shooting out cleanly beside plate without covering BOY's face */}
          {[-1, 1].map((dir) => (
            <g key={dir} transform={`scale(${dir}, 1)`}>
              {[0, 1].map((wi) => {
                const dx = 62 + wi * 38 + pulse * 8;
                const dy = -12 - wi * 20;
                return (
                  <path
                    key={wi}
                    d={`M ${dx.toFixed(1)},${(dy + 30).toFixed(1)} L ${(dx + 14).toFixed(1)},${(dy + 10).toFixed(1)} L ${(dx - 4).toFixed(1)},${(dy - 4).toFixed(1)} L ${(dx + 16).toFixed(1)},${(dy - 24).toFixed(1)}`}
                    fill="none"
                    stroke={wi === 0 ? "#EF4444" : "#F97316"}
                    strokeWidth={5 - wi * 0.8}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                );
              })}
            </g>
          ))}
          {/* High-contrast red "KÉTTT!" badge cleanly offset to right gap between BOY & Mom (0 face overlap!) */}
          <g transform={`translate(178, ${(-82 + jitterY).toFixed(1)}) rotate(-6)`}>
            <rect x={-66} y={-22} width={132} height={44} rx={15} fill="#DC2626" stroke={INK} strokeWidth={3.2} />
            <text x={0} y={8} textAnchor="middle" fill="#FFFFFF" fontSize={25} fontWeight={900} fontFamily={FONT}>
              KÉTTT!
            </text>
          </g>
        </g>
      )}
    </g>
  );
};

/* ============================================================================
 * 8. HOST_EXPLAIN_OVERLAY Board Theme: boardTheme = "NATURE_FIELD_BOARD" (V23.0)
 *    - Strictly preserves V22.0 anti-overlap coordinates: x=680..1800, y=90..640
 *      (>= 90px gap from left Host speech bubble x <= 590, BOY at x=330 y=760)
 *    - Warm wooden frame (#B45309, rx=24), soft cream paper (#FFFBEB), top corner leaves
 *    - Deep green header (#15803D) with crisp white title (#FFFFFF) "SỔ TAY THIÊN NHIÊN • ..."
 *    - 3 airy React.memo illustration panels, zero blur/dropShadow/foreignObject
 * ========================================================================== */

const HostNatureFieldBoardStaticCore: React.FC<{
  activePanel?: "LEFT" | "CENTER" | "RIGHT";
  boardTitle: string;
}> = React.memo(({ activePanel, boardTitle }) => {
  const leftBorder = activePanel === "LEFT" ? "#15803D" : "#86EFAC";
  const centerBorder = activePanel === "CENTER" ? "#15803D" : "#FCD34D";
  const rightBorder = activePanel === "RIGHT" ? "#15803D" : "#7DD3FC";
  const leftW = activePanel === "LEFT" ? 4.5 : 2.8;
  const centerW = activePanel === "CENTER" ? 4.5 : 2.8;
  const rightW = activePanel === "RIGHT" ? 4.5 : 2.8;

  return (
    <g id="host-board-nature-field-static">
      <GroundShadow cx={1240} cy={654} rx={545} ry={12} />

      {/* Warm Wooden Field-Board Outer Frame (x=680..1800, y=90..640, rx=24) */}
      <rect
        x={680}
        y={90}
        width={1120}
        height={550}
        rx={24}
        fill="#FFFBEB"
        stroke="#B45309"
        strokeWidth={12}
      />
      <rect
        x={680}
        y={90}
        width={1120}
        height={550}
        rx={24}
        fill="none"
        stroke={INK}
        strokeWidth={3.2}
      />

      {/* Subtle brass binder pins & fresh green leaf accents at top corners */}
      <g id="nature-board-corner-leaves">
        <g transform="translate(708, 114)">
          <path d="M -14,6 C -16,-12 4,-18 18,-8 C 12,10 -4,14 -14,6 Z" fill="#22C55E" stroke="#15803D" strokeWidth={2.2} />
          <circle cx={0} cy={0} r={5} fill="#F59E0B" stroke={INK} strokeWidth={1.8} />
        </g>
        <g transform="translate(1772, 114) scale(-1, 1)">
          <path d="M -14,6 C -16,-12 4,-18 18,-8 C 12,10 -4,14 -14,6 Z" fill="#22C55E" stroke="#15803D" strokeWidth={2.2} />
          <circle cx={0} cy={0} r={5} fill="#F59E0B" stroke={INK} strokeWidth={1.8} />
        </g>
        <circle cx={708} cy={614} r={5.5} fill="#D97706" stroke={INK} strokeWidth={2} />
        <circle cx={1772} cy={614} r={5.5} fill="#D97706" stroke={INK} strokeWidth={2} />
      </g>

      {/* Deep Forest-Green Header Bar (#15803D) with crisp white text (#FFFFFF) */}
      <rect
        x={734}
        y={108}
        width={1012}
        height={48}
        rx={14}
        fill="#15803D"
        stroke="#14532D"
        strokeWidth={2.6}
      />
      <text
        x={1240}
        y={140}
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize={21}
        fontWeight={900}
        fontFamily={FONT}
      >
        {boardTitle}
      </text>

      {/* Ô TRÁI (x=710..1046, y=172..546): 1. Quan sát tập tính */}
      <g id="nature-board-panel-left" transform="translate(710, 172)">
        <rect
          x={0}
          y={0}
          width={336}
          height={374}
          rx={18}
          fill={activePanel === "LEFT" ? "#ECFDF5" : "#FFFFFF"}
          stroke={leftBorder}
          strokeWidth={leftW}
        />
        <text x={168} y={36} textAnchor="middle" fill="#15803D" fontSize={19} fontWeight={900} fontFamily={FONT}>
          1. Quan sát tập tính
        </text>

        {/* Clean Paw Print + Field Magnifier Illustration */}
        <g transform="translate(168, 128)">
          <circle cx={0} cy={0} r={62} fill="#DCFCE7" stroke="#16A34A" strokeWidth={3} />
          {/* Cute animal paw */}
          <ellipse cx={0} cy={14} rx={22} ry={16} fill="#92400E" stroke={INK} strokeWidth={2.6} />
          <circle cx={-24} cy={-8} r={9} fill="#92400E" stroke={INK} strokeWidth={2.4} />
          <circle cx={-8} cy={-20} r={9} fill="#92400E" stroke={INK} strokeWidth={2.4} />
          <circle cx={10} cy={-20} r={9} fill="#92400E" stroke={INK} strokeWidth={2.4} />
          <circle cx={26} cy={-8} r={9} fill="#92400E" stroke={INK} strokeWidth={2.4} />
        </g>

        <rect x={22} y={216} width={292} height={134} rx={14} fill="#F0FDF4" stroke="#86EFAC" strokeWidth={2.4} />
        <text x={168} y={252} textAnchor="middle" fill="#14532D" fontSize={17} fontWeight={900} fontFamily={FONT}>
          Theo dõi ngoài tự nhiên
        </text>
        <text x={168} y={286} textAnchor="middle" fill="#334155" fontSize={15.5} fontWeight={700} fontFamily={FONT}>
          Ghi nhận phản xạ nhanh &amp; thói quen
        </text>
        <text x={168} y={318} textAnchor="middle" fill="#15803D" fontSize={15.5} fontWeight={800} fontFamily={FONT}>
          → Đặt câu hỏi khoa học thú vị!
        </text>
      </g>

      {/* Ô GIỮA (x=1066..1414, y=172..546): 2. Cơ chế sinh học */}
      <g id="nature-board-panel-center" transform="translate(1066, 172)">
        <rect
          x={0}
          y={0}
          width={348}
          height={374}
          rx={18}
          fill={activePanel === "CENTER" ? "#FEF3C7" : "#FFFFFF"}
          stroke={centerBorder}
          strokeWidth={centerW}
        />
        <text x={174} y={36} textAnchor="middle" fill="#B45309" fontSize={19} fontWeight={900} fontFamily={FONT}>
          2. Cơ chế sinh học &amp; vật lý
        </text>

        {/* Clean Magnifying Lens + Biological Gear/Motion Emblem */}
        <g transform="translate(174, 128)">
          <circle cx={0} cy={0} r={62} fill="#FEF9C3" stroke="#D97706" strokeWidth={3} />
          <circle cx={-8} cy={-8} r={30} fill="#E0F2FE" stroke={INK} strokeWidth={3.6} />
          <path d="M -20,-8 Q -8,-24 4,-8 T 20,-8" fill="none" stroke="#0284C7" strokeWidth={3.6} strokeLinecap="round" />
          <line x1={14} y1={14} x2={42} y2={42} stroke="#92400E" strokeWidth={10} strokeLinecap="round" />
          <line x1={14} y1={14} x2={42} y2={42} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
        </g>

        <rect x={22} y={216} width={304} height={134} rx={14} fill="#FFFBEB" stroke="#FCD34D" strokeWidth={2.4} />
        <text x={174} y={252} textAnchor="middle" fill="#92400E" fontSize={17} fontWeight={900} fontFamily={FONT}>
          Cấu tạo cơ thể siêu tinh vi
        </text>
        <text x={174} y={286} textAnchor="middle" fill="#334155" fontSize={15.5} fontWeight={700} fontFamily={FONT}>
          Xương khớp, giác quan &amp; cân bằng lực
        </text>
        <text x={174} y={318} textAnchor="middle" fill="#B45309" fontSize={15.5} fontWeight={800} fontFamily={FONT}>
          → Giải mã nguyên lý cốt lõi!
        </text>
      </g>

      {/* Ô PHẢI (x=1434..1770, y=172..546): 3. Kỳ quan thích nghi */}
      <g id="nature-board-panel-right" transform="translate(1434, 172)">
        <rect
          x={0}
          y={0}
          width={336}
          height={374}
          rx={18}
          fill={activePanel === "RIGHT" ? "#E0F2FE" : "#FFFFFF"}
          stroke={rightBorder}
          strokeWidth={rightW}
        />
        <text x={168} y={36} textAnchor="middle" fill="#0369A1" fontSize={19} fontWeight={900} fontFamily={FONT}>
          3. Kỳ quan thích nghi
        </text>

        {/* Clean Green Leaf Shield Emblem */}
        <g transform="translate(168, 128)">
          <circle cx={0} cy={0} r={62} fill="#E0F2FE" stroke="#0284C7" strokeWidth={3} />
          <path
            d="M -32,16 C -34,-26 8,-44 36,-32 C 34,8 2,36 -32,16 Z"
            fill="#22C55E"
            stroke={INK}
            strokeWidth={3.2}
            strokeLinejoin="round"
          />
          <path d="M -26,12 Q 4,-4 28,-26" fill="none" stroke="#14532D" strokeWidth={3.2} strokeLinecap="round" />
        </g>

        <rect x={22} y={216} width={292} height={134} rx={14} fill="#F0F9FF" stroke="#7DD3FC" strokeWidth={2.4} />
        <text x={168} y={252} textAnchor="middle" fill="#0369A1" fontSize={17} fontWeight={900} fontFamily={FONT}>
          Tiến hóa hàng triệu năm
        </text>
        <text x={168} y={286} textAnchor="middle" fill="#334155" fontSize={15.5} fontWeight={700} fontFamily={FONT}>
          Săn mồi, tự vệ &amp; hòa hợp môi trường
        </text>
        <text x={168} y={318} textAnchor="middle" fill="#0284C7" fontSize={15.5} fontWeight={800} fontFamily={FONT}>
          → Bài học tuyệt đẹp từ thiên nhiên!
        </text>
      </g>
    </g>
  );
});
HostNatureFieldBoardStaticCore.displayName = "HostNatureFieldBoardStaticCore";

const HostCatRightingNatureBoardStaticCore: React.FC<{
  activePanel?: "LEFT" | "CENTER" | "RIGHT" | "LEFT_CENTER";
  highlight?: HostBoardHighlightId;
  boardTitle: string;
}> = React.memo(({ activePanel, highlight, boardTitle }) => {
  const isLeftActive = activePanel === "LEFT" || activePanel === "LEFT_CENTER";
  const isCenterActive = activePanel === "CENTER" || activePanel === "LEFT_CENTER";
  const isRightActive = activePanel === "RIGHT";

  const leftBorder = isLeftActive ? "#15803D" : "#86EFAC";
  const centerBorder = isCenterActive ? "#15803D" : "#FCD34D";
  const rightBorder = isRightActive ? "#15803D" : "#7DD3FC";
  const leftW = isLeftActive ? 4.8 : 2.8;
  const centerW = isCenterActive ? 4.8 : 2.8;
  const rightW = isRightActive ? 4.8 : 2.8;

  return (
    <g id="host-board-cat-righting-static">
      <GroundShadow cx={1240} cy={654} rx={545} ry={12} />

      {/* Warm Wooden Field-Board Frame (x=680..1800, y=90..640) */}
      <rect
        x={680}
        y={90}
        width={1120}
        height={550}
        rx={24}
        fill="#FFFBEB"
        stroke="#B45309"
        strokeWidth={12}
      />
      <rect
        x={680}
        y={90}
        width={1120}
        height={550}
        rx={24}
        fill="none"
        stroke={INK}
        strokeWidth={3.2}
      />

      {/* Top Corner Leaves + Brass Pins */}
      <g id="cat-nature-board-corner-leaves">
        <g transform="translate(708, 114)">
          <path d="M -14,6 C -16,-12 4,-18 18,-8 C 12,10 -4,14 -14,6 Z" fill="#22C55E" stroke="#15803D" strokeWidth={2.2} />
          <circle cx={0} cy={0} r={5} fill="#F59E0B" stroke={INK} strokeWidth={1.8} />
        </g>
        <g transform="translate(1772, 114) scale(-1, 1)">
          <path d="M -14,6 C -16,-12 4,-18 18,-8 C 12,10 -4,14 -14,6 Z" fill="#22C55E" stroke="#15803D" strokeWidth={2.2} />
          <circle cx={0} cy={0} r={5} fill="#F59E0B" stroke={INK} strokeWidth={1.8} />
        </g>
        <circle cx={708} cy={614} r={5.5} fill="#D97706" stroke={INK} strokeWidth={2} />
        <circle cx={1772} cy={614} r={5.5} fill="#D97706" stroke={INK} strokeWidth={2} />
      </g>

      {/* Deep Forest-Green Header Bar (#15803D) */}
      <rect
        x={734}
        y={108}
        width={1012}
        height={48}
        rx={14}
        fill="#15803D"
        stroke="#14532D"
        strokeWidth={2.6}
      />
      <text
        x={1240}
        y={140}
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize={21}
        fontWeight={900}
        fontFamily={FONT}
      >
        {boardTitle}
      </text>

      {/* Ô TRÁI (x=710..1046, y=172..546): 1. La bàn tai trong */}
      <g id="cat-board-panel-left" transform="translate(710, 172)">
        <rect
          x={0}
          y={0}
          width={336}
          height={374}
          rx={18}
          fill={isLeftActive ? "#ECFDF5" : "#FFFFFF"}
          stroke={leftBorder}
          strokeWidth={leftW}
        />
        <text x={168} y={36} textAnchor="middle" fill="#15803D" fontSize={19} fontWeight={900} fontFamily={FONT}>
          1. La bàn tai trong
        </text>

        {/* Inner-Ear Vestibular Compass Emblem */}
        <g transform="translate(168, 128)">
          <circle cx={0} cy={0} r={60} fill="#DCFCE7" stroke="#16A34A" strokeWidth={3} />
          {/* Compass Dial */}
          <circle cx={0} cy={0} r={42} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
          <line x1={0} y1={-36} x2={0} y2={-26} stroke="#64748B" strokeWidth={3} strokeLinecap="round" />
          <line x1={0} y1={26} x2={0} y2={36} stroke="#64748B" strokeWidth={3} strokeLinecap="round" />
          <line x1={-36} y1={0} x2={-26} y2={0} stroke="#64748B" strokeWidth={3} strokeLinecap="round" />
          <line x1={26} y1={0} x2={36} y2={0} stroke="#64748B" strokeWidth={3} strokeLinecap="round" />
          {/* Gravity-seeking needle pointing down */}
          <polygon points="0,-24 -9,0 9,0" fill="#94A3B8" stroke={INK} strokeWidth={2} />
          <polygon points="0,28 -9,0 9,0" fill="#EA580C" stroke={INK} strokeWidth={2} />
          <circle cx={0} cy={0} r={5.5} fill="#FACC15" stroke={INK} strokeWidth={2} />
        </g>

        <rect x={22} y={216} width={292} height={134} rx={14} fill="#F0FDF4" stroke="#86EFAC" strokeWidth={2.4} />
        <text x={168} y={252} textAnchor="middle" fill="#14532D" fontSize={17} fontWeight={900} fontFamily={FONT}>
          Hệ tiền đình tai trong
        </text>
        <text x={168} y={286} textAnchor="middle" fill="#334155" fontSize={15.5} fontWeight={700} fontFamily={FONT}>
          Xác định trên–dưới trong tích tắc
        </text>
        <text x={168} y={318} textAnchor="middle" fill="#15803D" fontSize={15.5} fontWeight={800} fontFamily={FONT}>
          → Phản xạ nhanh chỉ vài mili giây!
        </text>
      </g>

      {/* Ô GIỮA (x=1066..1414, y=172..546): 2. Xoay 2 nửa thân */}
      <g id="cat-board-panel-center" transform="translate(1066, 172)">
        <rect
          x={0}
          y={0}
          width={348}
          height={374}
          rx={18}
          fill={isCenterActive ? "#FEF3C7" : "#FFFFFF"}
          stroke={centerBorder}
          strokeWidth={centerW}
        />
        <text x={174} y={36} textAnchor="middle" fill="#B45309" fontSize={19} fontWeight={900} fontFamily={FONT}>
          2. Xoay 2 nửa thân
        </text>

        {/* Two-Half Rotating Cylinders Emblem */}
        <g transform="translate(174, 128)">
          <circle cx={0} cy={0} r={60} fill="#FEF9C3" stroke="#D97706" strokeWidth={3} />
          {/* Left half (Front body - tucked, fast blue spin) */}
          <rect x={-52} y={-18} width={44} height={36} rx={14} fill="#38BDF8" stroke={INK} strokeWidth={2.8} />
          <path d="M -42,-28 A 20,16 0 0,1 -16,-28" fill="none" stroke="#0284C7" strokeWidth={4} strokeLinecap="round" />
          <polygon points="-12,-28 -22,-34 -20,-22" fill="#0284C7" />
          {/* Flexible spine pivot dot */}
          <circle cx={0} cy={0} r={7} fill="#F59E0B" stroke={INK} strokeWidth={2.4} />
          {/* Right half (Back body - extended, orange counter-anchor) */}
          <rect x={8} y={-18} width={44} height={36} rx={14} fill="#FB923C" stroke={INK} strokeWidth={2.8} />
          <path d="M 42,28 A 20,16 0 0,1 16,28" fill="none" stroke="#EA580C" strokeWidth={4} strokeLinecap="round" />
          <polygon points="12,28 22,34 20,22" fill="#EA580C" />
        </g>

        <rect x={22} y={216} width={304} height={134} rx={14} fill="#FFFBEB" stroke="#FCD34D" strokeWidth={2.4} />
        <text x={174} y={252} textAnchor="middle" fill="#92400E" fontSize={16.5} fontWeight={900} fontFamily={FONT}>
          Thu chân trước – Duỗi chân sau
        </text>
        <text x={174} y={286} textAnchor="middle" fill="#334155" fontSize={15.5} fontWeight={700} fontFamily={FONT}>
          Tự lật 180° không cần điểm tựa
        </text>
        <text x={174} y={318} textAnchor="middle" fill="#B45309" fontSize={15.5} fontWeight={800} fontFamily={FONT}>
          → Bảo toàn mô men động lượng!
        </text>
      </g>

      {/* Ô PHẢI (x=1434..1770, y=172..546): 3. Giảm xóc 4 chân & Dù lượn */}
      <g id="cat-board-panel-right" transform="translate(1434, 172)">
        <rect
          x={0}
          y={0}
          width={336}
          height={374}
          rx={18}
          fill={isRightActive ? "#E0F2FE" : "#FFFFFF"}
          stroke={rightBorder}
          strokeWidth={rightW}
        />
        <text x={168} y={36} textAnchor="middle" fill="#0369A1" fontSize={18} fontWeight={900} fontFamily={FONT}>
          3. Giảm xóc &amp; Dù lượn
        </text>

        {/* Spring Paw + Parachute Wind Emblem */}
        <g transform="translate(168, 128)">
          <circle cx={0} cy={0} r={60} fill="#E0F2FE" stroke="#0284C7" strokeWidth={3} />
          {/* Cute paw pad on top */}
          <ellipse cx={0} cy={-16} rx={20} ry={13} fill="#FB923C" stroke={INK} strokeWidth={2.6} />
          <circle cx={-16} cy={-32} r={6} fill="#FB923C" stroke={INK} strokeWidth={2.2} />
          <circle cx={0} cy={-37} r={6} fill="#FB923C" stroke={INK} strokeWidth={2.2} />
          <circle cx={16} cy={-32} r={6} fill="#FB923C" stroke={INK} strokeWidth={2.2} />
          {/* Spring shock coil underneath */}
          <path
            d="M -14,-2 L 14,6 L -14,14 L 14,22 L -14,30 L 14,38"
            fill="none"
            stroke="#059669"
            strokeWidth={4.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Upward air drag arrows */}
          <path d="M -38,24 L -38,-4 M -44,4 L -38,-6 L -32,4" fill="none" stroke="#0284C7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 38,24 L 38,-4 M 32,4 L 38,-6 L 44,4" fill="none" stroke="#0284C7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        </g>

        <rect x={22} y={216} width={292} height={134} rx={14} fill="#F0F9FF" stroke="#7DD3FC" strokeWidth={2.4} />
        <text x={168} y={252} textAnchor="middle" fill="#0369A1" fontSize={16.5} fontWeight={900} fontFamily={FONT}>
          Đệm lò xo 4 chân + Xòe dù
        </text>
        <text x={168} y={286} textAnchor="middle" fill="#334155" fontSize={15.5} fontWeight={700} fontFamily={FONT}>
          Hãm tốc rơi &amp; phân tán lực va chạm
        </text>
        <text x={168} y={318} textAnchor="middle" fill="#0284C7" fontSize={15.5} fontWeight={800} fontFamily={FONT}>
          → Chạm đất êm nhưng không bất tử!
        </text>
      </g>

      {/* Subtle Contextual Corner Emblem Stamp when special highlight active (zero overlap with panel text!) */}
      {(highlight === "CAT_MYSTERY_70Y" || highlight === "CAT_TAIL_QUESTION") && (
        <g transform="translate(1736, 206)">
          <circle cx={0} cy={0} r={24} fill="#F59E0B" stroke={INK} strokeWidth={3} />
          <text x={0} y={9} textAnchor="middle" fill="#FFFFFF" fontSize={28} fontWeight={900} fontFamily={FONT}>
            ?
          </text>
        </g>
      )}
      {highlight === "CAT_WARNING_9LIVES" && (
        <g transform="translate(1736, 206)">
          <circle cx={0} cy={0} r={24} fill="#DC2626" stroke={INK} strokeWidth={3} />
          <text x={0} y={9} textAnchor="middle" fill="#FFFFFF" fontSize={28} fontWeight={900} fontFamily={FONT}>
            !
          </text>
        </g>
      )}
      {highlight === "CAT_EXPLORE_OTHER" && (
        <g transform="translate(1736, 206)">
          <circle cx={0} cy={0} r={24} fill="#0284C7" stroke={INK} strokeWidth={3} />
          <circle cx={-3} cy={-3} r={9} fill="#E0F2FE" stroke="#FFFFFF" strokeWidth={2.8} />
          <line x1={4} y1={4} x2={12} y2={12} stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
});
HostCatRightingNatureBoardStaticCore.displayName = "HostCatRightingNatureBoardStaticCore";

const HostOctopusCamoNatureBoardStaticCore: React.FC<{
  activePanel?: "LEFT" | "CENTER" | "RIGHT";
  highlight?: HostBoardHighlightId;
  boardTitle: string;
}> = React.memo(({ activePanel, highlight, boardTitle }) => {
  const isLeftActive = activePanel === "LEFT";
  const isCenterActive = activePanel === "CENTER";
  const isRightActive = activePanel === "RIGHT";

  const leftBorder = isLeftActive ? "#15803D" : "#86EFAC";
  const centerBorder = isCenterActive ? "#15803D" : "#FCD34D";
  const rightBorder = isRightActive ? "#15803D" : "#7DD3FC";
  const leftW = isLeftActive ? 4.8 : 2.8;
  const centerW = isCenterActive ? 4.8 : 2.8;
  const rightW = isRightActive ? 4.8 : 2.8;

  return (
    <g id="host-board-octopus-camo-static">
      <GroundShadow cx={1240} cy={654} rx={545} ry={12} />

      {/* Warm Wooden Field-Board Frame (x=680..1800, y=90..640) */}
      <rect
        x={680}
        y={90}
        width={1120}
        height={550}
        rx={24}
        fill="#FFFBEB"
        stroke="#B45309"
        strokeWidth={12}
      />
      <rect
        x={680}
        y={90}
        width={1120}
        height={550}
        rx={24}
        fill="none"
        stroke={INK}
        strokeWidth={3.2}
      />

      {/* Top Corner Leaves + Brass Pins */}
      <g id="octo-nature-board-corner-leaves">
        <g transform="translate(708, 114)">
          <path d="M -14,6 C -16,-12 4,-18 18,-8 C 12,10 -4,14 -14,6 Z" fill="#22C55E" stroke="#15803D" strokeWidth={2.2} />
          <circle cx={0} cy={0} r={5} fill="#F59E0B" stroke={INK} strokeWidth={1.8} />
        </g>
        <g transform="translate(1772, 114) scale(-1, 1)">
          <path d="M -14,6 C -16,-12 4,-18 18,-8 C 12,10 -4,14 -14,6 Z" fill="#22C55E" stroke="#15803D" strokeWidth={2.2} />
          <circle cx={0} cy={0} r={5} fill="#F59E0B" stroke={INK} strokeWidth={1.8} />
        </g>
        <circle cx={708} cy={614} r={5.5} fill="#D97706" stroke={INK} strokeWidth={2} />
        <circle cx={1772} cy={614} r={5.5} fill="#D97706" stroke={INK} strokeWidth={2} />
      </g>

      {/* Deep Forest-Green Header Bar (#15803D) */}
      <rect
        x={734}
        y={108}
        width={1012}
        height={48}
        rx={14}
        fill="#15803D"
        stroke="#14532D"
        strokeWidth={2.6}
      />
      {(() => {
        const hasHeaderStamp =
          highlight === "OCTO_COLORBLIND_PARADOX" ||
          highlight === "OCTO_DREAM_CLOUD" ||
          highlight === "OCTO_BATTERY_DRAIN";
        return (
          <>
            <text
              x={hasHeaderStamp ? 1192 : 1240}
              y={139}
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize={hasHeaderStamp ? 19.5 : 21}
              fontWeight={900}
              fontFamily={FONT}
            >
              {boardTitle}
            </text>
            {/* Clean Contextual Stamp inside right end of green header (56px clear above Panel 3 title!) */}
            {highlight === "OCTO_COLORBLIND_PARADOX" && (
              <g id="octo-header-stamp-colorblind" transform="translate(1686, 132) scale(0.74)">
                <rect x={-52} y={-24} width={44} height={48} rx={10} fill="#F8FAFC" stroke={INK} strokeWidth={2.8} />
                <rect x={-46} y={-18} width={14} height={36} rx={3} fill="#0F172A" />
                <rect x={-28} y={-18} width={14} height={36} rx={3} fill="#94A3B8" />
                <circle cx={20} cy={0} r={24} fill="#F59E0B" stroke={INK} strokeWidth={3} />
                <text x={20} y={9} textAnchor="middle" fill="#FFFFFF" fontSize={28} fontWeight={900} fontFamily={FONT}>
                  ?
                </text>
              </g>
            )}
            {highlight === "OCTO_DREAM_CLOUD" && (
              <g id="octo-header-stamp-dream" transform="translate(1692, 132) scale(0.76)">
                <circle cx={-16} cy={4} r={16} fill="#38BDF8" stroke={INK} strokeWidth={2.6} />
                <circle cx={4} cy={-4} r={20} fill="#F472B6" stroke={INK} strokeWidth={2.6} />
                <circle cx={22} cy={4} r={15} fill="#FACC15" stroke={INK} strokeWidth={2.6} />
                <text x={4} y={6} textAnchor="middle" fill="#FFFFFF" fontSize={16} fontWeight={900} fontFamily={FONT}>
                  zZ
                </text>
              </g>
            )}
            {highlight === "OCTO_BATTERY_DRAIN" && (
              <g id="octo-header-stamp-battery" transform="translate(1692, 132) scale(0.8)">
                <rect x={-32} y={-18} width={54} height={36} rx={8} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
                <rect x={22} y={-8} width={8} height={16} rx={3} fill={INK} />
                <rect x={-25} y={-11} width={16} height={22} rx={4} fill="#EF4444" />
              </g>
            )}
          </>
        );
      })()}

      {/* Ô TRÁI (x=710..1046, y=172..546): 1. Màn hình da 3 lớp */}
      <g id="octo-board-panel-left" transform="translate(710, 172)">
        <rect
          x={0}
          y={0}
          width={336}
          height={374}
          rx={18}
          fill={isLeftActive ? "#ECFDF5" : "#FFFFFF"}
          stroke={leftBorder}
          strokeWidth={leftW}
        />
        <text x={168} y={36} textAnchor="middle" fill="#15803D" fontSize={19} fontWeight={900} fontFamily={FONT}>
          1. Màn hình da 3 lớp
        </text>

        {/* 3-Layer Skin Emblem */}
        <g transform="translate(168, 128)">
          <circle cx={0} cy={0} r={60} fill="#DCFCE7" stroke="#16A34A" strokeWidth={3} />
          {/* Layer 1: Chromatophores (yellow/red/brown dots) */}
          <rect x={-44} y={-32} width={88} height={20} rx={8} fill="#FEF3C7" stroke={INK} strokeWidth={2.4} />
          <circle cx={-24} cy={-22} r={5.5} fill="#F59E0B" />
          <circle cx={0} cy={-22} r={6} fill="#EF4444" />
          <circle cx={24} cy={-22} r={5.5} fill="#92400E" />
          {/* Layer 2: Iridescent blue/teal reflector */}
          <rect x={-44} y={-8} width={88} height={20} rx={8} fill="#38BDF8" stroke={INK} strokeWidth={2.4} />
          <line x1={-30} y1={2} x2={30} y2={2} stroke="#E0F2FE" strokeWidth={3.5} strokeLinecap="round" />
          {/* Layer 3: White mirror reflector */}
          <rect x={-44} y={16} width={88} height={20} rx={8} fill="#FFFFFF" stroke={INK} strokeWidth={2.4} />
        </g>

        <rect x={22} y={216} width={292} height={134} rx={14} fill="#F0FDF4" stroke="#86EFAC" strokeWidth={2.4} />
        <text x={168} y={252} textAnchor="middle" fill="#14532D" fontSize={16.5} fontWeight={900} fontFamily={FONT}>
          Túi sắc tố + Phản quang
        </text>
        <text x={168} y={286} textAnchor="middle" fill="#334155" fontSize={15.5} fontWeight={700} fontFamily={FONT}>
          + Gương phản xạ trắng ở đáy
        </text>
        <text x={168} y={318} textAnchor="middle" fill="#15803D" fontSize={15.5} fontWeight={800} fontFamily={FONT}>
          → Đổi màu chỉ ~0,2 giây!
        </text>
      </g>

      {/* Ô GIỮA (x=1066..1414, y=172..546): 2. Điêu khắc da 3D */}
      <g id="octo-board-panel-center" transform="translate(1066, 172)">
        <rect
          x={0}
          y={0}
          width={348}
          height={374}
          rx={18}
          fill={isCenterActive ? "#FEF3C7" : "#FFFFFF"}
          stroke={centerBorder}
          strokeWidth={centerW}
        />
        <text x={174} y={36} textAnchor="middle" fill="#B45309" fontSize={19} fontWeight={900} fontFamily={FONT}>
          2. Điêu khắc da 3D
        </text>

        {/* 3D Papillae Texture Emblem */}
        <g transform="translate(174, 128)">
          <circle cx={0} cy={0} r={60} fill="#FEF9C3" stroke="#D97706" strokeWidth={3} />
          <path
            d="M -46,24 L -46,8 Q -32,-26 -18,4 Q -4,-34 10,2 Q 26,-24 40,8 L 46,24 Z"
            fill="#C4365D"
            stroke={INK}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <path d="M -26,-22 L -26,-36 M -4,-30 L -4,-44 M 22,-18 L 22,-32" stroke="#D97706" strokeWidth={3.2} strokeLinecap="round" />
        </g>

        <rect x={22} y={216} width={304} height={134} rx={14} fill="#FFFBEB" stroke="#FCD34D" strokeWidth={2.4} />
        <text x={174} y={252} textAnchor="middle" fill="#92400E" fontSize={16.5} fontWeight={900} fontFamily={FONT}>
          Hàng nghìn nhú da cơ bắp
        </text>
        <text x={174} y={286} textAnchor="middle" fill="#334155" fontSize={15.5} fontWeight={700} fontFamily={FONT}>
          Tự phồng gai giả san hô &amp; đá sần
        </text>
        <text x={174} y={318} textAnchor="middle" fill="#B45309" fontSize={15.5} fontWeight={800} fontFamily={FONT}>
          → Biến hình cả không gian 3D!
        </text>
      </g>

      {/* Ô PHẢI (x=1434..1770, y=172..546): 3. Mắt chữ U & Da cảm biến */}
      <g id="octo-board-panel-right" transform="translate(1434, 172)">
        <rect
          x={0}
          y={0}
          width={336}
          height={374}
          rx={18}
          fill={isRightActive ? "#E0F2FE" : "#FFFFFF"}
          stroke={rightBorder}
          strokeWidth={rightW}
        />
        <text x={168} y={36} textAnchor="middle" fill="#0369A1" fontSize={18} fontWeight={900} fontFamily={FONT}>
          3. Mắt chữ U &amp; Da cảm biến
        </text>

        {/* U-Shaped Pupil + Prism Dispersion Emblem */}
        <g transform="translate(168, 128)">
          <circle cx={0} cy={0} r={60} fill="#E0F2FE" stroke="#0284C7" strokeWidth={3} />
          <ellipse cx={0} cy={0} rx={40} ry={30} fill="#FEF3C7" stroke={INK} strokeWidth={3} />
          {/* Signature U/W-shaped octopus pupil */}
          <path d="M -22,-8 C -22,18 22,18 22,-8" fill="none" stroke={INK} strokeWidth={11} strokeLinecap="round" />
          {/* RGB chromatic dispersion dots */}
          <circle cx={-16} cy={-38} r={5} fill="#EF4444" />
          <circle cx={0} cy={-42} r={5} fill="#22C55E" />
          <circle cx={16} cy={-38} r={5} fill="#3B82F6" />
        </g>

        <rect x={22} y={216} width={292} height={134} rx={14} fill="#F0F9FF" stroke="#7DD3FC" strokeWidth={2.4} />
        <text x={168} y={252} textAnchor="middle" fill="#0369A1" fontSize={16.5} fontWeight={900} fontFamily={FONT}>
          Đọc màu nhờ tán sắc ánh sáng
        </text>
        <text x={168} y={286} textAnchor="middle" fill="#334155" fontSize={15.5} fontWeight={700} fontFamily={FONT}>
          Kết hợp phân tử cảm biến trên da
        </text>
        <text x={168} y={318} textAnchor="middle" fill="#0284C7" fontSize={15.5} fontWeight={800} fontFamily={FONT}>
          → Phối màu chuẩn dù bị mù màu!
        </text>
      </g>
    </g>
  );
});
HostOctopusCamoNatureBoardStaticCore.displayName = "HostOctopusCamoNatureBoardStaticCore";

export const HostNatureFieldBoard: React.FC<{
  highlight?: HostBoardHighlightId;
  frame?: number;
  title?: string;
  labBoard?: string;
}> = ({ highlight = "NONE", frame = 0, title, labBoard }) => {
  const isCatBoard = labBoard === "CAT_RIGHTING_PHYSICS";
  const isOctoBoard = labBoard === "OCTOPUS_INVISIBLE_CAMO";
  const activePanel: "LEFT" | "CENTER" | "RIGHT" | undefined =
    highlight === "LEFT"
      ? "LEFT"
      : highlight === "CENTER"
      ? "CENTER"
      : highlight === "RIGHT"
      ? "RIGHT"
      : undefined;
  const catActivePanel: "LEFT" | "CENTER" | "RIGHT" | "LEFT_CENTER" | undefined =
    highlight === "CAT_ANGULAR_MOMENTUM"
      ? "LEFT_CENTER"
      : activePanel;

  const defaultTitle = isOctoBoard
    ? "SỔ TAY THIÊN NHIÊN • BÍ MẬT TÀNG HÌNH CỦA BẠCH TUỘC"
    : isCatBoard
    ? "SỔ TAY THIÊN NHIÊN • PHẢN XẠ LẬT NGƯỜI 180° CỦA MÈO"
    : "SỔ TAY THIÊN NHIÊN • KHÁM PHÁ THẾ GIỚI ĐỘNG VẬT & TỰ NHIÊN";

  const normalizedTitle = title && title.trim()
    ? title.trim().toUpperCase().startsWith("SỔ TAY THIÊN NHIÊN")
      ? title.trim()
      : `SỔ TAY THIÊN NHIÊN • ${title.trim()}`
    : defaultTitle;

  const badgePulse = 0.5 + 0.5 * Math.sin(frame * 0.16);

  const renderFooterContent = () => {
    if (isOctoBoard) {
      switch (highlight) {
        case "OCTO_COLORBLIND_PARADOX":
          return {
            bg: "#FEF3C7",
            border: "#D97706",
            color: "#92400E",
            text: "Nghịch lý đại dương: Mắt bị mù màu nhưng ngụy trang chuẩn 100%!",
          };
        case "LEFT":
          return {
            bg: "#ECFDF5",
            border: "#15803D",
            color: "#14532D",
            text: "Màn hình da 3 lớp: Túi sắc tố + Phản quang xanh + Gương trắng!",
          };
        case "RIGHT":
          return {
            bg: "#E0F2FE",
            border: "#0284C7",
            color: "#0369A1",
            text: "Câu đố lớn nhất: Mắt chữ U & da cảm biến tự giải mã màu sắc!",
          };
        case "OCTO_DREAM_CLOUD":
          return {
            bg: "#FCE7F3",
            border: "#DB2777",
            color: "#9D174D",
            text: "Làn da còn là bảng cảm xúc & chớp đổi màu rực rỡ ngay lúc đang ngủ!",
          };
        case "OCTO_BATTERY_DRAIN":
          return {
            bg: "#FEE2E2",
            border: "#DC2626",
            color: "#991B1B",
            text: "Cái giá năng lượng: Duy trì triệu điểm ảnh tiêu tốn cực nhiều pin!",
          };
        case "SUMMARY":
          return {
            bg: "#DCFCE7",
            border: "#15803D",
            color: "#14532D",
            text: "Chốt gọn 3 bí mật khoa học của bậc thầy tàng hình đại dương!",
          };
        default:
          return {
            bg: "#E0F2FE",
            border: "#0284C7",
            color: "#0369A1",
            text: "Ghi chép điền dã: Bạch tuộc đổi màu & biến hình 3D trong < 1 giây!",
          };
      }
    }

    if (!isCatBoard) {
      return {
        bg: highlight === "SUMMARY" ? "#DCFCE7" : "#FEF3C7",
        border: highlight === "SUMMARY" ? "#15803D" : "#B45309",
        color: highlight === "SUMMARY" ? "#14532D" : "#92400E",
        text:
          highlight === "SUMMARY"
            ? "Tổng kết ghi chép điền dã: 3 bí mật thú vị nhất của thế giới tự nhiên!"
            : "Ghi chép điền dã: Quan sát đời thực → Giải mã khoa học → Hiểu thiên nhiên",
      };
    }

    switch (highlight) {
      case "CAT_MYSTERY_70Y":
        return {
          bg: "#FEF3C7",
          border: "#D97706",
          color: "#92400E",
          text: "Bài toán con mèo rơi: Làm đau đầu các nhà vật lý suốt 70 năm!",
        };
      case "CAT_ANGULAR_MOMENTUM":
        return {
          bg: "#ECFDF5",
          border: "#15803D",
          color: "#14532D",
          text: "Định luật bảo toàn mô men động lượng: Không điểm tựa sao tự xoay?",
        };
      case "CENTER":
        return {
          bg: "#FEF3C7",
          border: "#D97706",
          color: "#92400E",
          text: "Vũ điệu 2 nửa thân: Thu chân trước xoay vút, duỗi chân sau làm mỏ neo!",
        };
      case "CAT_TAIL_QUESTION":
        return {
          bg: "#EFF6FF",
          border: "#0284C7",
          color: "#0369A1",
          text: "Giải oan cho chiếc đuôi: Đuôi có phải cánh quạt trực thăng của mèo?",
        };
      case "RIGHT":
        return {
          bg: "#E0F2FE",
          border: "#0284C7",
          color: "#0369A1",
          text: "Tuyệt chiêu chạm đất: Bộ đệm lò xo 4 chân + Tư thế dù lượn hãm tốc!",
        };
      case "CAT_WARNING_9LIVES":
        return {
          bg: "#FEE2E2",
          border: "#DC2626",
          color: "#991B1B",
          text: "Cảnh báo thú y: Mèo KHÔNG hề có 9 mạng bất tử — hãy bảo vệ chúng!",
        };
      case "CAT_EXPLORE_OTHER":
        return {
          bg: "#ECFDF5",
          border: "#059669",
          color: "#065F46",
          text: "Mở rộng thiên nhiên: Thỏ, thằn lằn, bọ que & ứng dụng cho NASA!",
        };
      case "SUMMARY":
        return {
          bg: "#DCFCE7",
          border: "#15803D",
          color: "#14532D",
          text: "Chốt gọn 3 bí mật vật lý đằng sau cú tiếp đất 4 chân huyền thoại!",
        };
      default:
        return {
          bg: "#FEF3C7",
          border: "#B45309",
          color: "#92400E",
          text: "Ghi chép điền dã: Thả ngửa chỉ 30 cm mèo vẫn xoay trọn 180°!",
        };
    }
  };

  const footer = renderFooterContent();

  return (
    <g id="host-explain-nature-field-board-layer">
      {isOctoBoard ? (
        <HostOctopusCamoNatureBoardStaticCore
          activePanel={activePanel}
          highlight={highlight}
          boardTitle={normalizedTitle}
        />
      ) : isCatBoard ? (
        <HostCatRightingNatureBoardStaticCore
          activePanel={catActivePanel}
          highlight={highlight}
          boardTitle={normalizedTitle}
        />
      ) : (
        <HostNatureFieldBoardStaticCore activePanel={activePanel} boardTitle={normalizedTitle} />
      )}
      <g opacity={(0.92 + badgePulse * 0.08).toFixed(2)} transform="translate(1240, 592)">
        <rect
          x={-385}
          y={-24}
          width={770}
          height={48}
          rx={24}
          fill={footer.bg}
          stroke={footer.border}
          strokeWidth={2.8}
        />
        <text
          x={0}
          y={8}
          textAnchor="middle"
          fill={footer.color}
          fontSize={19}
          fontWeight={900}
          fontFamily={FONT}
        >
          {footer.text}
        </text>
      </g>
    </g>
  );
};

/* ============================================================================
 * 9. BACKYARD_BALCONY_PET Cat & Safety Net Story Stage Kit (Episode 9 — V23.0)
 *    - Wooden patio chair + plush cushion for Beat 1–3, 28
 *    - Clean steel-wire balcony safety net behind picket fence for Beat 47, 48, 59, 60
 *    - Uses CuteCat from AnimalSpriteKit.tsx with matched poses & flat opacity=0.12 shadow
 * ========================================================================== */

const BalconySafetyNetStatic: React.FC = React.memo(() => (
  <g id="balcony-safety-net-mesh">
    <defs>
      <pattern id="balcony-safety-wire-mesh-pat" x={376} y={146} width={58} height={62} patternUnits="userSpaceOnUse">
        <line x1={32} y1={0} x2={32} y2={62} stroke="#475569" strokeWidth={2} opacity={0.42} />
        <line x1={0} y1={58} x2={58} y2={58} stroke="#475569" strokeWidth={2} opacity={0.42} />
      </pattern>
    </defs>
    {/* Horizontal top & mid mounting bars */}
    <rect x={366} y={136} width={1554} height={10} rx={4} fill="#64748B" stroke={INK} strokeWidth={2.4} />
    <rect x={366} y={136} width={10} height={340} rx={3} fill="#64748B" stroke={INK} strokeWidth={2.2} />
    <rect x={1135} y={136} width={10} height={340} rx={3} fill="#64748B" stroke={INK} strokeWidth={2.2} />
    <rect x={1898} y={136} width={10} height={340} rx={3} fill="#64748B" stroke={INK} strokeWidth={2.2} />
    {/* Crisp steel protective wire mesh spanning x=376..1898, y=146..476 via single <pattern> */}
    <rect x={376} y={146} width={1522} height={330} fill="url(#balcony-safety-wire-mesh-pat)" />
    {/* Small neat green safety-verified tag on top right rail */}
    <g transform="translate(1785, 190)">
      <rect x={-96} y={-22} width={192} height={44} rx={22} fill="#ECFDF5" stroke="#15803D" strokeWidth={3} />
      <circle cx={-66} cy={0} r={13} fill="#16A34A" />
      <path d="M -72,0 L -68,5 L -59,-5" fill="none" stroke="#FFFFFF" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
      <text x={14} y={6} textAnchor="middle" fill="#14532D" fontSize={16} fontWeight={900} fontFamily={FONT}>
        Lưới an toàn
      </text>
    </g>
  </g>
));
BalconySafetyNetStatic.displayName = "BalconySafetyNetStatic";

const BalconyChairAndCushionStatic: React.FC = React.memo(() => (
  <g id="balcony-chair-and-cushion" stroke={INK} strokeWidth={3.2} strokeLinejoin="round">
    {/* Thick plush turquoise-cream floor cushion at x=1185, y=812 */}
    <g transform="translate(1185, 812)">
      <GroundShadow cx={0} cy={12} rx={138} ry={16} />
      <ellipse cx={0} cy={-4} rx={130} ry={30} fill="#38BDF8" />
      <ellipse cx={0} cy={-12} rx={118} ry={22} fill="#BAE6FD" stroke="#0284C7" strokeWidth={2.6} />
      <path d="M -52,-12 Q 0,-2 52,-12" fill="none" stroke="#0284C7" strokeWidth={2.4} opacity={0.55} />
    </g>

    {/* Warm solid wooden patio chair on right at x=1475, ground y=812 */}
    <g transform="translate(1475, 812)">
      <GroundShadow cx={0} cy={8} rx={104} ry={13} />
      {/* Back legs & tall sturdy backrest (top rail spans world x=1411..1547, y=586) */}
      <rect x={46} y={-226} width={18} height={226} rx={5} fill="#92400E" />
      <rect x={-58} y={-114} width={18} height={114} rx={5} fill="#78350F" />
      <rect x={-64} y={-226} width={136} height={26} rx={7} fill="#B45309" />
      <rect x={-52} y={-186} width={112} height={22} rx={6} fill="#D97706" />
      <rect x={-52} y={-152} width={112} height={22} rx={6} fill="#D97706" />
      {/* Wooden seat slab */}
      <rect x={-78} y={-118} width={152} height={22} rx={7} fill="#D97706" />
      {/* Side brace */}
      <rect x={-46} y={-50} width={96} height={12} rx={4} fill="#78350F" />
    </g>
  </g>
));
BalconyChairAndCushionStatic.displayName = "BalconyChairAndCushionStatic";

export const BackyardBalconyCatStageKit: React.FC<{
  mode: BalconyDetailId;
  frame: number;
  localFrame?: number;
  durationFrames?: number;
}> = ({ mode, frame, localFrame, durationFrames }) => {
  if (mode === "NONE") return null;

  const showSafetyNet =
    mode === "SAFETY_NET_STAND" || mode === "SAFETY_NET_SIT" || mode === "OUTRO_OPEN_FLOOR";
  const showChairAndCushion =
    mode === "CAT_CHAIR_SLIP" ||
    mode === "CAT_MIDAIR_FLIP" ||
    mode === "CAT_CUSHION_SIT" ||
    mode === "CAT_PET_HAPPY";

  const activeLocalFrame = localFrame ?? frame;
  const activeDuration = Math.max(45, durationFrames ?? 225);
  const slipStartFrame = Math.max(0, activeDuration - 18);
  const isSlippingEndOfBeat = activeLocalFrame >= slipStartFrame;
  // Beat 1: stand 100% steady & level on all 4 paws on the chair top rail; tilt gently ONLY in the last ~18 frames!
  const slipTilt = interpolate(activeLocalFrame, [slipStartFrame, activeDuration], [0, -14], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
  const flipDeg = interpolate(activeLocalFrame, [0, 32], [180, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const dropProgress = interpolate(activeLocalFrame, [0, 36], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const midairX = 1365 - dropProgress * 180;
  const midairY = 588 + dropProgress * 164;
  const hasLandedOnCushion = activeLocalFrame >= 36;

  return (
    <g id={`balcony-cat-kit-${mode}`}>
      {showSafetyNet && <BalconySafetyNetStatic />}
      {showChairAndCushion && <BalconyChairAndCushionStatic />}

      {mode === "CAT_CHAIR_SLIP" && (
        <g id="balcony-cat-chair-slip">
          {/* All 4 paws stand squarely on wooden chair backrest (rail x=1411..1547, y=586; paws span x=1439..1516!) */}
          <g transform={`translate(1480, 587) rotate(${slipTilt.toFixed(1)}, -38, 0)`}>
            <CuteCat x={0} y={0} scale={0.82} flipX={true} frame={frame} pose="stand" />
          </g>
          {/* Slip startle lines appear ONLY during the final ~18-frame slip moment */}
          {isSlippingEndOfBeat && (
            <g stroke="#F59E0B" strokeWidth={4} strokeLinecap="round" fill="none">
              <path d="M 1396,544 Q 1384,560 1392,580" />
              <path d="M 1378,552 Q 1365,568 1373,588" opacity={0.75} />
            </g>
          )}
        </g>
      )}

      {mode === "CAT_MIDAIR_FLIP" && (
        <g id="balcony-cat-midair-flip">
          {/* Dashed curved trajectory arc from chair backrest to plush cushion */}
          <path
            d="M 1390,568 Q 1270,510 1192,664"
            fill="none"
            stroke="#0284C7"
            strokeWidth={4}
            strokeDasharray="10 8"
            strokeLinecap="round"
            opacity={0.72}
          />
          {!hasLandedOnCushion ? (
            <>
              {/* Curved 180-degree spin cue around cat while flipping once */}
              <path
                d="M 1112,626 A 84,64 0 0,1 1266,608"
                fill="none"
                stroke="#EA580C"
                strokeWidth={5}
                strokeLinecap="round"
              />
              <polygon points="1272,618 1255,610 1268,596" fill="#EA580C" />
              <g transform={`translate(${midairX.toFixed(1)}, ${midairY.toFixed(1)}) rotate(${flipDeg.toFixed(1)})`}>
                <CuteCat
                  x={0}
                  y={42}
                  scale={0.9}
                  flipX={true}
                  frame={frame}
                  pose="curl_midair"
                  disableMidairWobble={true}
                />
              </g>
            </>
          ) : (
            /* Stands firmly and calmly on all 4 paws on cushion for the rest of Beat 2 */
            <CuteCat x={1185} y={794} scale={0.92} flipX={true} frame={frame} pose="stand" />
          )}
        </g>
      )}

      {mode === "CAT_CUSHION_SIT" && (
        <CuteCat x={1185} y={794} scale={0.92} flipX={true} frame={frame} pose="sit" />
      )}

      {mode === "CAT_PET_HAPPY" && (
        <g id="balcony-cat-pet-happy">
          <CuteCat x={1185} y={794} scale={0.92} flipX={true} frame={frame} pose="sit" />
          <g transform={`translate(1185, ${(620 - Math.sin(frame * 0.14) * 8).toFixed(1)})`}>
            <path
              d="M 0,12 C -16,-2 -16,-16 -5,-16 C 0,-16 0,-9 0,-9 C 0,-9 0,-16 5,-16 C 16,-16 16,-2 0,12 Z"
              fill="#FB7185"
              stroke="#BE123C"
              strokeWidth={2.4}
            />
          </g>
        </g>
      )}

      {mode === "SAFETY_NET_STAND" && (
        <CuteCat x={1235} y={816} scale={0.95} flipX={true} frame={frame} pose="stand" />
      )}

      {mode === "SAFETY_NET_SIT" && (
        <CuteCat x={1235} y={816} scale={0.95} flipX={true} frame={frame} pose="sit" />
      )}

      {mode === "OUTRO_OPEN_FLOOR" && (
        <CuteCat x={1255} y={818} scale={0.98} flipX={false} frame={frame} pose="sit" />
      )}
    </g>
  );
};

/* ============================================================================
 * 10. CITY_LIVING_ROOM Pet Cat Overlay (Episode 9 — Mướp on Rug / Sofa Corner)
 * ========================================================================== */

export const LivingRoomPetCat: React.FC<{
  mode: LivingRoomDetailId;
  frame: number;
}> = ({ mode, frame }) => {
  if (mode !== "CAT_RUG" && mode !== "CAT_ALERT" && mode !== "CAT_STAND" && mode !== "CAT_SOFA") {
    return null;
  }

  if (mode === "CAT_SOFA") {
    return (
      <g id="living-room-pet-cat-sofa">
        <CuteCat x={1008} y={718} scale={0.74} flipX={true} frame={frame} pose="sit" />
        {/* Tiny peaceful Zzz floating gently above sleeping/cozy cat */}
        <text
          x={1048}
          y={612 - Math.sin(frame * 0.08) * 6}
          fill="#F59E0B"
          stroke={INK}
          strokeWidth={3}
          paintOrder="stroke"
          fontSize={22}
          fontWeight={900}
          fontFamily={FONT}
        >
          ♪
        </text>
      </g>
    );
  }

  return (
    <g id={`living-room-pet-cat-${mode}`}>
      {/* Cozy woven rug on living room floor cleanly between sofa and coffee table */}
      <g transform="translate(1245, 814)">
        <ellipse cx={0} cy={8} rx={124} ry={26} fill="#FEF3C7" stroke="#D97706" strokeWidth={3} />
        <ellipse cx={0} cy={8} rx={98} ry={18} fill="#FDE68A" stroke="none" opacity={0.68} />
      </g>
      <CuteCat
        x={1245}
        y={808}
        scale={0.9}
        flipX={true}
        frame={frame}
        pose={mode === "CAT_STAND" ? "stand" : "sit"}
      />
      {mode === "CAT_ALERT" && (
        <g stroke="#F59E0B" strokeWidth={3.6} strokeLinecap="round" fill="none">
          <path d="M 1192,654 Q 1180,642 1192,630" />
          <path d="M 1298,654 Q 1310,642 1298,630" />
        </g>
      )}
    </g>
  );
};

/* ============================================================================
 * 11. OCEAN_UNDERWATER Octopus & Friendly Shark Story Stage Kit (Episode 10 — V23.5)
 *     - Static reef rock & pink/teal corals wrapped in React.memo (zero frame prop)
 *     - Uses CuteOctopus & CuteShark from AnimalSpriteKit.tsx (zero body wobble)
 *     - Beat 3: smooth RGB color morph from coral (#FB923C) to rocky slate-moss (#64748B) + 3D bumps
 *     - Beat 45: playful morph from pink reef coral back to bright coral-orange
 *     - Clean auto-wrapping <=10-word speech bubble for [Tuộc nói] & [Cá mập nói]
 * ========================================================================== */

function blendOctoHex(hexA: string, hexB: string, tRaw: number): string {
  const t = Math.max(0, Math.min(1, tRaw));
  const p = (h: string): [number, number, number] => {
    const c = h.replace("#", "");
    return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
  };
  const [r1, g1, b1] = p(hexA);
  const [r2, g2, b2] = p(hexB);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

const OceanReefRocksAndCoralsStatic: React.FC = React.memo(() => (
  <g id="ocean-story-reef-rocks-static" stroke={INK} strokeWidth={3.4} strokeLinejoin="round" strokeLinecap="round">
    {/* Prominent Textured Reef Rock on Left-Center (x=470..830, ground y=818) where Tuộc camouflages! */}
    <g transform="translate(650, 818)">
      <GroundShadow cx={0} cy={10} rx={182} ry={18} />
      <path
        d="M -170,4 C -162,-76 -110,-148 -38,-156 C 24,-162 84,-126 126,-84 C 154,-56 172,-22 168,4 Z"
        fill="#64748B"
      />
      <path
        d="M -126,-16 C -114,-74 -72,-124 -18,-132 C 26,-136 68,-108 100,-72 C 42,-88 -42,-78 -126,-16 Z"
        fill="#94A3B8"
        opacity={0.42}
        stroke="none"
      />
      {/* Mossy green reef patches on rock */}
      <ellipse cx={-72} cy={-86} rx={36} ry={14} fill="#16A34A" opacity={0.55} stroke="none" />
      <ellipse cx={42} cy={-96} rx={30} ry={12} fill="#15803D" opacity={0.5} stroke="none" />
      <circle cx={-98} cy={-38} r={10} fill="#475569" stroke="none" opacity={0.6} />
      <circle cx={68} cy={-44} r={12} fill="#475569" stroke="none" opacity={0.55} />
    </g>

    {/* Colorful Pink & Teal Coral Clusters on Right-Center & Far-Left */}
    <g transform="translate(1485, 818)">
      <GroundShadow cx={0} cy={8} rx={128} ry={14} />
      {/* Pink Staghorn Coral */}
      <path
        d="M -42,0 C -46,-56 -72,-104 -92,-126 C -80,-138 -62,-126 -48,-96 C -42,-132 -22,-162 -4,-160 C 12,-158 14,-124 8,-86 C 32,-118 62,-138 78,-124 C 90,-112 68,-74 44,-46 C 58,-30 62,-14 58,0 Z"
        fill="#F472B6"
      />
      <path d="M -22,-18 C -20,-62 -10,-108 -2,-136" fill="none" stroke="#FBCFE8" strokeWidth={5} />
      {/* Warm Gold Brain Coral at Base */}
      <ellipse cx={86} cy={-18} rx={48} ry={34} fill="#FBBF24" />
      <path d="M 56,-16 Q 72,-32 88,-16 Q 104,-30 116,-16" fill="none" stroke="#D97706" strokeWidth={3.5} />
    </g>

    {/* Cute Tiny Red Crab peeking safely on far-left sand */}
    <g transform="translate(360, 814)">
      <ellipse cx={0} cy={-14} rx={22} ry={14} fill="#EF4444" stroke={INK} strokeWidth={2.8} />
      <circle cx={-8} cy={-30} r={4.5} fill="#FFFFFF" stroke={INK} strokeWidth={2} />
      <circle cx={8} cy={-30} r={4.5} fill="#FFFFFF" stroke={INK} strokeWidth={2} />
      <circle cx={-8} cy={-30} r={2} fill={INK} stroke="none" />
      <circle cx={8} cy={-30} r={2} fill={INK} stroke="none" />
    </g>
  </g>
));
OceanReefRocksAndCoralsStatic.displayName = "OceanReefRocksAndCoralsStatic";

const OceanCreatureBubble: React.FC<{
  cx: number;
  cy: number;
  tailX: number;
  tailY: number;
  text: string;
  speakerLabel?: string;
  localFrame: number;
  durationFrames: number;
}> = ({ cx, cy, tailX, tailY, text, speakerLabel, localFrame, durationFrames }) => {
  const startF = Math.round(durationFrames * 0.08);
  const endF = Math.round(durationFrames * 0.94);
  if (localFrame < startF || localFrame > endF) return null;

  const fadeIn = Math.min(1, (localFrame - startF) / 8);
  const fadeOut = Math.min(1, (endF - localFrame) / 8);
  const opacity = Math.max(0, Math.min(1, Math.min(fadeIn, fadeOut)));

  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > 26 && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);

  const longest = Math.max(...lines.map((l) => l.length));
  const boxW = Math.min(500, Math.max(250, longest * 14.5 + 56));
  const boxH = lines.length > 1 ? 94 : 64;
  const safeCx = Math.max(boxW / 2 + 40, Math.min(1920 - boxW / 2 - 40, cx));
  const safeCy = Math.max(135, Math.min(480, cy));
  const tagText = speakerLabel ? speakerLabel.trim() : undefined;
  const tagW = tagText ? Math.max(84, tagText.length * 11 + 28) : 0;

  return (
    <g id="ocean-creature-speech-bubble" opacity={opacity.toFixed(3)}>
      {/* Tail pointer */}
      <polygon
        points={`${(safeCx - 16).toFixed(1)},${(safeCy + boxH / 2 - 4).toFixed(1)} ${(safeCx + 16).toFixed(1)},${(safeCy + boxH / 2 - 4).toFixed(1)} ${tailX.toFixed(1)},${tailY.toFixed(1)}`}
        fill="#FFFFFF"
        stroke={INK}
        strokeWidth={3.5}
        strokeLinejoin="round"
      />
      <rect
        x={safeCx - boxW / 2}
        y={safeCy - boxH / 2}
        width={boxW}
        height={boxH}
        rx={28}
        fill="#FFFFFF"
        stroke={INK}
        strokeWidth={3.8}
      />
      {/* Mask tail seam cleanly */}
      <rect
        x={safeCx - 20}
        y={safeCy + boxH / 2 - 8}
        width={40}
        height={10}
        fill="#FFFFFF"
        stroke="none"
      />
      {/* Clean speaker label pill without square brackets ("Tuộc" / "Cá mập") */}
      {tagText && (
        <g transform={`translate(${(safeCx - boxW / 2 + 24).toFixed(1)}, ${(safeCy - boxH / 2 - 14).toFixed(1)})`}>
          <rect
            x={0}
            y={-15}
            width={tagW}
            height={30}
            rx={15}
            fill={speakerLabel?.includes("Cá mập") ? "#0369A1" : "#C4365D"}
            stroke={INK}
            strokeWidth={2.4}
          />
          <text
            x={tagW / 2}
            y={5}
            textAnchor="middle"
            fill="#FFFFFF"
            stroke="none"
            fontSize={16}
            fontWeight={900}
            fontFamily={FONT}
          >
            {tagText}
          </text>
        </g>
      )}
      {lines.map((line, idx) => (
        <text
          key={idx}
          x={safeCx}
          y={safeCy + (lines.length === 1 ? 8 : idx === 0 ? -7 : 23)}
          textAnchor="middle"
          fill="#0F172A"
          stroke="none"
          fontSize={23}
          fontWeight={800}
          fontFamily={FONT}
        >
          {line}
        </text>
      ))}
    </g>
  );
};

export const OceanUnderwaterStoryKit: React.FC<{
  mode: OceanDetailId;
  frame: number;
  localFrame?: number;
  durationFrames?: number;
  bubble?: string;
  speaker?: "OCTOPUS" | "SHARK";
  isHostExplain?: boolean;
}> = ({
  mode,
  frame,
  localFrame,
  durationFrames = 225,
  bubble,
  speaker = "OCTOPUS",
  isHostExplain = false,
}) => {
  if (mode === "NONE") return null;

  const activeLocal = localFrame ?? frame;
  const showBubble = Boolean(!isHostExplain && bubble && bubble.trim().length > 0);
  const speakerLabel = speaker === "SHARK" ? "Cá mập" : "Tuộc";

  // Beat 1: CuteOctopus crawls gently across bright sand toward reef rock
  const crawlT = interpolate(activeLocal, [0, durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const beat1OctoX = 760 + crawlT * 110;

  // Beat 2: CuteShark glides smoothly in from right; CuteOctopus pulls beside rock surprised
  const sharkEnterX = interpolate(activeLocal, [0, 48], [1840, 1340], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Beat 3: Instant <0.5s camouflage morph from plum-red (#C4365D) -> rocky slate-moss (#64748B) + 3D bumps; Shark swims past puzzled!
  const camoT = interpolate(activeLocal, [4, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const beat3OctoColors = {
    main: blendOctoHex("#C4365D", "#64748B", camoT),
    belly: blendOctoHex("#FCE7F3", "#94A3B8", camoT),
    spot: blendOctoHex("#FCE7F3", "#16A34A", camoT),
  };
  const sharkPassX = interpolate(activeLocal, [10, durationFrames], [1360, 420], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Beat 27: Proud unfreeze return from rock camo back to friendly plum-red (#C4365D)!
  const uncamoT = interpolate(activeLocal, [0, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const beat27OctoColors = {
    main: blendOctoHex("#64748B", "#C4365D", uncamoT),
    belly: blendOctoHex("#94A3B8", "#FCE7F3", uncamoT),
    spot: blendOctoHex("#16A34A", "#FCE7F3", uncamoT),
  };
  const farSharkX = interpolate(activeLocal, [0, durationFrames], [1480, 1780], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Beat 45: Smooth morph from pink coral (#F472B6) back to default plum-red (#C4365D) right beside the right coral bush!
  const pinkRevealT = interpolate(activeLocal, [14, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const beat45OctoColors = {
    main: blendOctoHex("#F472B6", "#C4365D", pinkRevealT),
    belly: blendOctoHex("#FCE7F3", "#FCE7F3", pinkRevealT),
    spot: blendOctoHex("#DB2777", "#FCE7F3", pinkRevealT),
  };

  // Beat 46: Friendly smiling shark glides in from upper-left toward Tuộc (who stays continuously at x=1375 beside coral!)
  const beat46SharkX = interpolate(activeLocal, [0, durationFrames], [430, 810], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <g id={`ocean-story-kit-${mode}`}>
      <OceanReefRocksAndCoralsStatic />

      {mode === "OCTO_CRAWL_REEF" && (
        <>
          <CuteOctopus x={beat1OctoX} y={796} scale={1.18} frame={frame} pose="crawl" emotion="happy" />
          {showBubble && (
            <OceanCreatureBubble
              cx={beat1OctoX}
              cy={515}
              tailX={beat1OctoX}
              tailY={645}
              text={bubble!}
              speakerLabel={speakerLabel}
              localFrame={activeLocal}
              durationFrames={durationFrames}
            />
          )}
        </>
      )}

      {mode === "OCTO_SHARK_ARRIVE" && (
        <>
          <CuteOctopus x={700} y={794} scale={1.14} frame={frame} pose="crawl" emotion="surprised" />
          <CuteShark x={sharkEnterX} y={475} scale={1.38} flipX={true} frame={frame} pose="swim" emotion="curious" />
          {showBubble && (
            <OceanCreatureBubble
              cx={690}
              cy={515}
              tailX={700}
              tailY={640}
              text={bubble!}
              speakerLabel={speakerLabel}
              localFrame={activeLocal}
              durationFrames={durationFrames}
            />
          )}
        </>
      )}

      {mode === "OCTO_ROCK_CAMO" && (
        <>
          {/* Tuộc hugs the reef rock and shifts smoothly into textured gray-moss stone! */}
          <CuteOctopus
            x={692}
            y={782}
            scale={1.08}
            frame={frame}
            pose="crawl"
            emotion="happy"
            colorOverride={beat3OctoColors}
            papillaeBumps={camoT > 0.45}
          />
          {/* Puzzled Shark swims right over the disguised octopus */}
          <CuteShark x={sharkPassX} y={425} scale={1.36} flipX={true} frame={frame} pose="swim" emotion="curious" />
          {showBubble && (
            <OceanCreatureBubble
              cx={Math.max(420, Math.min(1480, sharkPassX))}
              cy={215}
              tailX={Math.max(380, Math.min(1520, sharkPassX - 24))}
              tailY={330}
              text={bubble!}
              speakerLabel={speakerLabel}
              localFrame={activeLocal}
              durationFrames={durationFrames}
            />
          )}
        </>
      )}

      {mode === "OCTO_PROUD_RETURN" && (
        <>
          <g opacity={0.55}>
            <CuteShark x={farSharkX} y={320} scale={0.72} flipX={false} frame={frame} pose="swim" emotion="happy" />
          </g>
          <CuteOctopus
            x={940}
            y={712}
            scale={1.24}
            frame={frame}
            pose="float"
            emotion="proud"
            colorOverride={beat27OctoColors}
          />
          {showBubble && (
            <OceanCreatureBubble
              cx={940}
              cy={445}
              tailX={940}
              tailY={560}
              text={bubble!}
              speakerLabel={speakerLabel}
              localFrame={activeLocal}
              durationFrames={durationFrames}
            />
          )}
        </>
      )}

      {mode === "OCTO_CORAL_MAGIC" && (
        <>
          <CuteOctopus
            x={1375}
            y={776}
            scale={1.18}
            frame={frame}
            pose="wave"
            emotion="happy"
            colorOverride={beat45OctoColors}
          />
          {showBubble && (
            <OceanCreatureBubble
              cx={1320}
              cy={485}
              tailX={1370}
              tailY={618}
              text={bubble!}
              speakerLabel={speakerLabel}
              localFrame={activeLocal}
              durationFrames={durationFrames}
            />
          )}
        </>
      )}

      {mode === "OCTO_SHARK_FRIENDLY" && (
        <>
          {/* Spatial continuity with Beat 45: Tuộc stays right beside right pink coral (x=1375, y=776), Shark approaches smiling from left/top! */}
          <CuteShark x={beat46SharkX} y={415} scale={1.32} flipX={false} frame={frame} pose="swim" emotion="happy" />
          <CuteOctopus x={1375} y={776} scale={1.18} frame={frame} pose="wave" emotion="happy" />
          {showBubble && (
            <OceanCreatureBubble
              cx={speaker === "SHARK" ? Math.max(420, Math.min(1150, beat46SharkX)) : 1320}
              cy={speaker === "SHARK" ? 215 : 485}
              tailX={speaker === "SHARK" ? Math.max(420, Math.min(1180, beat46SharkX + 40)) : 1370}
              tailY={speaker === "SHARK" ? 328 : 618}
              text={bubble!}
              speakerLabel={speakerLabel}
              localFrame={activeLocal}
              durationFrames={durationFrames}
            />
          )}
        </>
      )}

      {mode === "OCTO_OUTRO_WAVE" && (
        <>
          <CuteShark x={1360} y={425} scale={1.18} flipX={true} frame={frame} pose="swim" emotion="happy" />
          <CuteOctopus x={920} y={740} scale={1.28} frame={frame} pose="wave" emotion="happy" />
          {showBubble && (
            <OceanCreatureBubble
              cx={920}
              cy={455}
              tailX={920}
              tailY={580}
              text={bubble!}
              speakerLabel={speakerLabel}
              localFrame={activeLocal}
              durationFrames={durationFrames}
            />
          )}
        </>
      )}

      {/* ====================================================================
          V24.0 ANIMAL_POV OCEAN_UNDERWATER SCENES (Episode 10 V24 — 20 Beats)
          - Tuộc wears accessory="bandana_green" (plum-red #C4365D)
          - Zero [Tuộc nói] / [Cá mập nói] text badges, zero body wobble!
          - All one-shot morphs & motions strictly clamped!
         ==================================================================== */}

      {/* Beat 1 (BÌNH MINH): Continuous shark glide x=1560 -> 1240, y=420 -> 475 above rock-camo Tuộc */}
      {mode === "V24_OCEAN_DAWN_SHARK_OVERHEAD" && (() => {
        const sX = interpolate(activeLocal, [0, durationFrames], [1560, 1240], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const sY = interpolate(activeLocal, [0, durationFrames], [420, 475], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <>
            <CuteOctopus
              x={692}
              y={782}
              scale={1.08}
              frame={frame}
              pose="crawl"
              emotion="happy"
              colorOverride={{ main: "#64748B", belly: "#5B6B7F", spot: "#475569" }}
              papillaeBumps={true}
              rockCamoTexture={true}
              strokeOpacity={0.45}
              hideCheeks={true}
              hideEmotionBadge={true}
            />
            <CuteShark x={sX} y={sY} scale={1.48} flipX={true} frame={frame} pose="swim" emotion="curious" />
          </>
        );
      })()}

      {/* Beat 2 (BÌNH MINH): Seamless handoff x=1240 -> 920, y=475 -> 525 right over stone Tuộc */}
      {mode === "V24_OCEAN_SHARK_CLOSE_PASS" && (() => {
        const sX = interpolate(activeLocal, [0, durationFrames], [1240, 920], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const sY = interpolate(activeLocal, [0, durationFrames], [475, 525], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <>
            <CuteOctopus
              x={692}
              y={782}
              scale={1.08}
              frame={frame}
              pose="crawl"
              emotion="scared"
              colorOverride={{ main: "#64748B", belly: "#5B6B7F", spot: "#475569" }}
              papillaeBumps={true}
              rockCamoTexture={true}
              strokeOpacity={0.45}
              hideCheeks={true}
              hideEmotionBadge={true}
            />
            <CuteShark x={sX} y={sY} scale={1.48} flipX={true} frame={frame} pose="swim" emotion="curious" />
          </>
        );
      })()}

      {/* Beat 3 (BÌNH MINH): Seamless handoff x=920 -> -120, y=525 -> 445 gliding completely past left! */}
      {mode === "V24_OCEAN_SHARK_SWIMS_PAST" && (() => {
        const sX = interpolate(activeLocal, [0, durationFrames], [920, -120], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.quad),
        });
        const sY = interpolate(activeLocal, [0, durationFrames], [525, 445], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <>
            <CuteOctopus
              x={692}
              y={782}
              scale={1.08}
              frame={frame}
              pose="crawl"
              emotion="happy"
              colorOverride={{ main: "#64748B", belly: "#5B6B7F", spot: "#475569" }}
              papillaeBumps={true}
              rockCamoTexture={true}
              strokeOpacity={0.45}
              hideCheeks={true}
              hideEmotionBadge={true}
            />
            <CuteShark x={sX} y={sY} scale={1.48} flipX={true} frame={frame} pose="swim" emotion="curious" />
          </>
        );
      })()}

      {/* Beat 4 (BÌNH MINH): Gray mossy rock dramatically bursts into vivid plum-red Tuộc (#C4365D, bandana_green) waving! */}
      {mode === "V24_OCEAN_ROCK_REVEAL_TUOC" && (() => {
        const revT = interpolate(activeLocal, [4, 28], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        return (
          <CuteOctopus
            x={725}
            y={776}
            scale={1.22}
            frame={frame}
            pose="wave"
            emotion="happy"
            accessory={revT > 0.45 ? "bandana_green" : "none"}
            colorOverride={{
              main: blendOctoHex("#64748B", "#C4365D", revT),
              belly: blendOctoHex("#5B6B7F", "#FCE7F3", revT),
              spot: blendOctoHex("#475569", "#FCE7F3", revT),
            }}
            papillaeBumps={revT < 0.45}
            rockCamoTexture={revT < 0.4}
            strokeOpacity={0.45 + 0.55 * revT}
            hideCheeks={revT < 0.4}
          />
        );
      })()}

      {/* Beat 8 (BUỔI SÁNG): Bright sunlit morning crawl along the coral reef */}
      {mode === "V24_OCEAN_MORNING_CRAWL" && (() => {
        const cx = interpolate(activeLocal, [0, durationFrames], [740, 1080], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <CuteOctopus
            x={cx}
            y={792}
            scale={1.22}
            frame={frame}
            pose="crawl"
            emotion="happy"
            accessory="bandana_green"
          />
        );
      })()}

      {/* Beat 16 (NẮNG LÊN CAO): Harsh diagonal sunlit rays on spiky reef; Tuộc pauses thoughtfully */}
      {mode === "V24_OCEAN_HARSH_SUN_REEF" && (
        <>
          <g opacity={0.22}>
            <polygon points="520,0 740,0 1020,820 790,820" fill="#FEF08A" />
            <polygon points="940,0 1160,0 1440,820 1210,820" fill="#FEF9C3" />
          </g>
          <CuteOctopus
            x={1120}
            y={786}
            scale={1.2}
            frame={frame}
            pose="crawl"
            emotion="curious"
            accessory="bandana_green"
          />
        </>
      )}

      {/* Beat 32: Lunch hunt — Tuộc glides along sand toward an expressive little orange-red crab on the right! */}
      {mode === "V24_OCEAN_LUNCH_HUNT" && (() => {
        const cx = interpolate(activeLocal, [0, durationFrames], [980, 1210], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const crabScuttleX = 1445 + Math.sin(frame * 0.16) * 14;
        const clawSnap = Math.sin(frame * 0.24) * 8;
        return (
          <>
            <CuteOctopus
              x={cx}
              y={786}
              scale={1.2}
              frame={frame}
              pose="crawl"
              emotion="happy"
              accessory="bandana_green"
            />
            {/* Cute little orange-red crab right in front of Tuộc on the sandy seabed */}
            <g
              id="v24-lunch-target-crab"
              transform={`translate(${crabScuttleX.toFixed(1)}, 808)`}
              stroke={INK}
              strokeWidth={3.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <GroundShadow cx={0} cy={8} rx={44} ry={8} />
              {/* 6 little scuttling crab legs */}
              <path d="M -26,-8 L -42,-2 L -46,8 M -22,-4 L -36,4 L -38,11 M -16,-2 L -26,8" fill="none" stroke="#C2410C" strokeWidth={3.5} />
              <path d="M 26,-8 L 42,-2 L 46,8 M 22,-4 L 36,4 L 38,11 M 16,-2 L 26,8" fill="none" stroke="#C2410C" strokeWidth={3.5} />
              {/* 2 raised snapping pincers */}
              <g transform={`translate(-26, -24) rotate(${(-14 - clawSnap).toFixed(1)})`}>
                <path d="M 0,10 L -10,-6" fill="none" stroke="#EA580C" strokeWidth={5} />
                <path d="M -18,-10 C -22,-22 -4,-26 -2,-12 L -10,-12 L -8,-4 Z" fill="#F97316" />
              </g>
              <g transform={`translate(26, -24) rotate(${(14 + clawSnap).toFixed(1)})`}>
                <path d="M 0,10 L 10,-6" fill="none" stroke="#EA580C" strokeWidth={5} />
                <path d="M 18,-10 C 22,-22 4,-26 2,-12 L 10,-12 L 8,-4 Z" fill="#F97316" />
              </g>
              {/* Round orange-red crab shell + glossy highlight */}
              <ellipse cx={0} cy={-14} rx={30} ry={19} fill="#F97316" />
              <ellipse cx={-6} cy={-21} rx={12} ry={5} fill="#FDBA74" opacity={0.7} stroke="none" />
              {/* Stalked sparkling eyes */}
              <line x1={-10} y1={-31} x2={-12} y2={-42} stroke="#EA580C" strokeWidth={3.5} />
              <line x1={10} y1={-31} x2={12} y2={-42} stroke="#EA580C" strokeWidth={3.5} />
              <circle cx={-12} cy={-44} r={6} fill="#FFFFFF" />
              <circle cx={12} cy={-44} r={6} fill="#FFFFFF" />
              <circle cx={-13} cy={-44} r={2.8} fill={INK} stroke="none" />
              <circle cx={11} cy={-44} r={2.8} fill={INK} stroke="none" />
              {/* Surprised little mouth */}
              <circle cx={0} cy={-9} r={3} fill="#9A3412" stroke="none" />
            </g>
          </>
        );
      })()}

      {/* Beat 33 (15:00): Tuộc meets bigger dark-crimson territorial octopus rival */}
      {mode === "V24_OCEAN_TERRITORIAL_RIVAL" && (
        <>
          <CuteOctopus
            x={650}
            y={786}
            scale={1.16}
            frame={frame}
            pose="crawl"
            emotion="surprised"
            accessory="bandana_green"
          />
          <CuteOctopus
            x={1240}
            y={776}
            scale={1.38}
            flipX={true}
            frame={frame + 17}
            pose="float"
            emotion="surprised"
            colorOverride={{ main: "#7F1D1D", belly: "#FCA5A5", spot: "#450A0A" }}
          />
        </>
      )}

      {/* Beat 35 (15:00): Tuộc shifts to peaceful pale pink; rival octopus relaxes & glides away */}
      {mode === "V24_OCEAN_PEACE_PALE_PASS" && (() => {
        const paleT = interpolate(activeLocal, [4, 26], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        const rivalX = interpolate(activeLocal, [18, durationFrames], [1220, 1740], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <>
            <CuteOctopus
              x={680}
              y={786}
              scale={1.16}
              frame={frame}
              pose="crawl"
              emotion="happy"
              accessory="bandana_green"
              colorOverride={{
                main: blendOctoHex("#C4365D", "#FBCFE8", paleT),
                belly: blendOctoHex("#FCE7F3", "#FFF1F2", paleT),
                spot: blendOctoHex("#FCE7F3", "#F9A8D4", paleT),
              }}
            />
            <CuteOctopus
              x={rivalX}
              y={695}
              scale={1.32}
              flipX={false}
              frame={frame + 21}
              pose="float"
              emotion="happy"
              colorOverride={{
                main: blendOctoHex("#7F1D1D", "#B91C1C", paleT),
                belly: "#FEE2E2",
                spot: "#7F1D1D",
              }}
            />
          </>
        );
      })()}

      {/* Beat 36 (15:45): Tuộc halts abruptly before tiny golden Blue-Ringed Octopus! */}
      {mode === "V24_OCEAN_BLUE_RING_STOP" && (
        <>
          <CuteOctopus
            x={640}
            y={784}
            scale={1.18}
            frame={frame}
            pose="crawl"
            emotion="surprised"
            accessory="bandana_green"
          />
          <CuteOctopus
            x={1190}
            y={798}
            scale={0.72}
            flipX={true}
            frame={frame + 9}
            pose="crawl"
            emotion="proud"
            colorOverride={{ main: "#EAB308", belly: "#FEF9C3", spot: "#CA8A04" }}
            blueRings={true}
          />
        </>
      )}

      {/* Beat 38 (16:30): Tuộc admiring famous striped sandy Mimic Octopus gliding on open sand */}
      {mode === "V24_OCEAN_ADMIRE_MIMIC" && (() => {
        const mimicX = interpolate(activeLocal, [0, durationFrames], [1180, 1410], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <>
            <CuteOctopus
              x={580}
              y={786}
              scale={1.14}
              frame={frame}
              pose="crawl"
              emotion="curious"
              accessory="bandana_green"
            />
            <CuteOctopus
              x={mimicX}
              y={712}
              scale={1.12}
              frame={frame + 27}
              pose="float"
              emotion="proud"
              colorOverride={{ main: "#D6C09E", belly: "#FEF3C7", spot: "#78350F" }}
            />
          </>
        );
      })()}

      {/* Beat 41 (18:30): Sunset fatigue — Tuộc (sleepy) slowly crawls back into reef rock crevice */}
      {mode === "V24_OCEAN_SUNSET_TIRED_CAVE" && (() => {
        const tx = interpolate(activeLocal, [0, durationFrames], [1020, 745], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <>
            <rect x={0} y={0} width={1920} height={1080} fill="#EA580C" opacity={0.14} />
            <CuteOctopus
              x={tx}
              y={788}
              scale={1.16}
              flipX={true}
              frame={frame}
              pose="crawl"
              emotion="sleepy"
              accessory="bandana_green"
            />
          </>
        );
      })()}

      {/* Beat 45 (20:00): Night descends — Tuộc tucked quietly in reef rock alcove, pale relaxed skin */}
      {mode === "V24_OCEAN_NIGHT_SLEEP_CAVE" && (() => {
        const restT = interpolate(activeLocal, [0, 36], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <>
            <rect x={0} y={0} width={1920} height={1080} fill="#0F172A" opacity={0.44} />
            <CuteOctopus
              x={725}
              y={784}
              scale={1.14}
              frame={frame}
              pose="crawl"
              emotion="sleepy"
              accessory="bandana_green"
              colorOverride={{
                main: blendOctoHex("#C4365D", "#E2E8F0", restT * 0.72),
                belly: "#F8FAFC",
                spot: "#CBD5E1",
              }}
            />
          </>
        );
      })()}

      {/* Beat 58 (05:30): Dawn breaks — golden sunbeams stream down as Tuộc steps out of cave */}
      {mode === "V24_OCEAN_DAWN_WAKE" && (() => {
        const wakeX = interpolate(activeLocal, [0, durationFrames], [720, 920], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <>
            <g opacity={0.26}>
              <polygon points="360,0 640,0 920,820 620,820" fill="#FEF08A" />
              <polygon points="880,0 1180,0 1440,820 1140,820" fill="#FDE68A" />
            </g>
            <CuteOctopus
              x={wakeX}
              y={786}
              scale={1.2}
              frame={frame}
              pose="crawl"
              emotion="happy"
              accessory="bandana_green"
            />
          </>
        );
      })()}

      {/* Beat 59 (SÁNG HÔM SAU): Mother's gift — Tuộc glowing proudly in vivid plum-red under morning rays */}
      {mode === "V24_OCEAN_MORNING_PROUD_GLOW" && (
        <>
          <circle cx={960} cy={650} r={195} fill="#FEF08A" opacity={0.18} />
          {[0, 1, 2, 3, 4, 5].map((si) => (
            <path
              key={si}
              d="M 0,-11 L 3,-3 L 11,0 L 3,3 L 0,11 L -3,3 L -11,0 L -3,-3 Z"
              transform={`translate(${740 + si * 88}, ${(540 + Math.sin(frame * 0.1 + si) * 28).toFixed(1)})`}
              fill="#FEF08A"
              opacity={0.78}
            />
          ))}
          <CuteOctopus
            x={960}
            y={728}
            scale={1.32}
            frame={frame}
            pose="float"
            emotion="proud"
            accessory="bandana_green"
          />
        </>
      )}

      {/* Beat 60: Natural underwater ocean home — Tuộc (bandana_green, happy) swimming smoothly across sunlit coral reef */}
      {mode === "V24_OCEAN_REEF_HOME_SWIM" && (() => {
        const swimX = interpolate(activeLocal, [0, durationFrames], [700, 1140], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const swimY = Number((665 + Math.sin(frame * 0.065) * 14).toFixed(1));
        return (
          <>
            <g id="v24-ocean-reef-home-sunbeams" opacity={0.22}>
              <polygon points="320,0 590,0 860,820 560,820" fill="#BAE6FD" />
              <polygon points="820,0 1120,0 1390,820 1090,820" fill="#FEF9C3" />
              <polygon points="1300,0 1540,0 1760,820 1510,820" fill="#BAE6FD" />
            </g>
            {[0, 1, 2, 3, 4].map((bi) => (
              <circle
                key={bi}
                cx={620 + bi * 175}
                cy={Number((690 - bi * 42 - Math.sin(frame * 0.07 + bi * 1.1) * 16).toFixed(1))}
                r={5.5 + (bi % 3) * 2.5}
                fill="#E0F2FE"
                fillOpacity={0.58}
                stroke="#38BDF8"
                strokeWidth={2}
              />
            ))}
            <CuteOctopus
              x={swimX}
              y={swimY}
              scale={1.26}
              frame={frame}
              pose="float"
              emotion="happy"
              accessory="bandana_green"
            />
          </>
        );
      })()}

      {/* Beat 60: Tuộc (bandana_green) chatting warmly with Cụ Tuộc (elder + glasses_round) */}
      {mode === "V24_OCEAN_ELDER_CHAT" && (
        <>
          <CuteOctopus
            x={720}
            y={786}
            scale={1.18}
            frame={frame}
            pose="wave"
            emotion="happy"
            accessory="bandana_green"
          />
          <CuteOctopus
            x={1210}
            y={782}
            scale={1.28}
            flipX={true}
            frame={frame + 31}
            pose="crawl"
            emotion="happy"
            ageVariant="elder"
            accessory="glasses_round"
          />
        </>
      )}

      {/* Beat 64 (06:00): New day begins — school of big fish silhouettes overhead; Tuộc approaches rock */}
      {mode === "V24_OCEAN_NEW_DAY_FISH" && (() => {
        const fishShift = interpolate(activeLocal, [0, durationFrames], [0, -340], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const tx = interpolate(activeLocal, [0, durationFrames], [990, 740], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <>
            <g opacity={0.34} fill="#0C4A6E" transform={`translate(${fishShift.toFixed(1)}, 0)`}>
              {[
                { x: 1120, y: 270, s: 1.0 },
                { x: 1290, y: 315, s: 0.85 },
                { x: 1440, y: 260, s: 1.08 },
                { x: 1590, y: 330, s: 0.9 },
              ].map((f, idx) => (
                <g key={idx} transform={`translate(${f.x}, ${f.y}) scale(${f.s})`}>
                  <path d="M -56,0 C -34,-24 22,-24 54,0 C 22,24 -34,24 -56,0 Z" />
                  <polygon points="50,0 78,-18 72,0 78,18" />
                </g>
              ))}
            </g>
            <CuteOctopus
              x={tx}
              y={786}
              scale={1.18}
              flipX={true}
              frame={frame}
              pose="crawl"
              emotion="happy"
              accessory="bandana_green"
            />
          </>
        );
      })()}

      {/* Beat 65: Fast morph (<0.5s) from plum-red #C4365D into seamlessly blended mossy gray stone! */}
      {mode === "V24_OCEAN_FAST_MORPH_ROCK" && (() => {
        const mT = interpolate(activeLocal, [2, 22], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        return (
          <CuteOctopus
            x={692}
            y={782}
            scale={1.12}
            frame={frame}
            pose="crawl"
            emotion="happy"
            accessory={mT < 0.45 ? "bandana_green" : "none"}
            colorOverride={{
              main: blendOctoHex("#C4365D", "#64748B", mT),
              belly: blendOctoHex("#FCE7F3", "#5B6B7F", mT),
              spot: blendOctoHex("#FCE7F3", "#475569", mT),
            }}
            papillaeBumps={mT > 0.4}
            rockCamoTexture={mT > 0.45}
            strokeOpacity={1 - 0.55 * mT}
            hideCheeks={mT > 0.45}
            hideEmotionBadge={true}
          />
        );
      })()}

      {/* Beat 66: Close-up cute rock wink — Tuộc melts into reef stone, only sparkling eyes wink! */}
      {mode === "V24_OCEAN_ROCK_CUTE_WINK" && (() => {
        // Trigger a deliberate cute blink right around localFrame 24..34!
        const winkFrame = activeLocal >= 24 && activeLocal <= 34 ? 106 : 20;
        return (
          <>
            <CuteOctopus
              x={692}
              y={782}
              scale={1.14}
              frame={winkFrame}
              pose="crawl"
              emotion="happy"
              colorOverride={{ main: "#64748B", belly: "#5B6B7F", spot: "#475569" }}
              papillaeBumps={true}
              rockCamoTexture={true}
              strokeOpacity={0.45}
              hideCheeks={true}
              hideEmotionBadge={true}
            />
            {[0, 1, 2, 3, 4].map((bi) => (
              <circle
                key={bi}
                cx={580 + bi * 74}
                cy={Number((710 - bi * 34 - Math.sin(frame * 0.08 + bi) * 16).toFixed(1))}
                r={6 + (bi % 3) * 3}
                fill="#E0F2FE"
                fillOpacity={0.62}
                stroke="#38BDF8"
                strokeWidth={2}
              />
            ))}
          </>
        );
      })()}

      {/* Beat 67: Final reveal — blended stone bursts right back to vivid plum-red Tuộc (bandana_green) waving goodbye! */}
      {mode === "V24_OCEAN_FINAL_REVEAL_WAVE" && (() => {
        const popT = interpolate(activeLocal, [4, 24], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        return (
          <CuteOctopus
            x={940}
            y={758}
            scale={1.34}
            frame={frame}
            pose="wave"
            emotion="happy"
            accessory={popT > 0.35 ? "bandana_green" : "none"}
            colorOverride={{
              main: blendOctoHex("#64748B", "#C4365D", popT),
              belly: blendOctoHex("#5B6B7F", "#FCE7F3", popT),
              spot: blendOctoHex("#475569", "#FCE7F3", popT),
            }}
            papillaeBumps={popT < 0.35}
            rockCamoTexture={popT < 0.35}
            strokeOpacity={0.45 + 0.55 * popT}
            hideCheeks={popT < 0.35}
          />
        );
      })()}
    </g>
  );
};
