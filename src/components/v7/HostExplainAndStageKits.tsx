import React from "react";
import { GroundShadow } from "../SceneBackdropKit";
import type {
  ClassroomDetailId,
  HostBoardHighlightId,
  KitchenDetailId,
  LivingRoomDetailId,
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

export const HostNatureFieldBoard: React.FC<{
  highlight?: HostBoardHighlightId;
  frame?: number;
  title?: string;
}> = ({ highlight = "NONE", frame = 0, title }) => {
  const activePanel: "LEFT" | "CENTER" | "RIGHT" | undefined =
    highlight === "LEFT"
      ? "LEFT"
      : highlight === "CENTER"
      ? "CENTER"
      : highlight === "RIGHT"
      ? "RIGHT"
      : undefined;

  const normalizedTitle = title && title.trim()
    ? title.trim().toUpperCase().startsWith("SỔ TAY THIÊN NHIÊN")
      ? title.trim()
      : `SỔ TAY THIÊN NHIÊN • ${title.trim()}`
    : "SỔ TAY THIÊN NHIÊN • KHÁM PHÁ THẾ GIỚI ĐỘNG VẬT & TỰ NHIÊN";

  const badgePulse = 0.5 + 0.5 * Math.sin(frame * 0.16);

  return (
    <g id="host-explain-nature-field-board-layer">
      <HostNatureFieldBoardStaticCore activePanel={activePanel} boardTitle={normalizedTitle} />
      <g opacity={(0.92 + badgePulse * 0.08).toFixed(2)} transform="translate(1240, 592)">
        <rect
          x={-370}
          y={-24}
          width={740}
          height={48}
          rx={24}
          fill={highlight === "SUMMARY" ? "#DCFCE7" : "#FEF3C7"}
          stroke={highlight === "SUMMARY" ? "#15803D" : "#B45309"}
          strokeWidth={2.8}
        />
        <text
          x={0}
          y={8}
          textAnchor="middle"
          fill={highlight === "SUMMARY" ? "#14532D" : "#92400E"}
          fontSize={19.5}
          fontWeight={900}
          fontFamily={FONT}
        >
          {highlight === "SUMMARY"
            ? "Tổng kết ghi chép điền dã: 3 bí mật thú vị nhất của thế giới tự nhiên!"
            : "Ghi chép điền dã: Quan sát đời thực → Giải mã khoa học → Hiểu thiên nhiên"}
        </text>
      </g>
    </g>
  );
};
