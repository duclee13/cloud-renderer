import React from "react";
import { GroundShadow } from "../SceneBackdropKit";
import type {
  ClassroomDetailId,
  HostBoardHighlightId,
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
