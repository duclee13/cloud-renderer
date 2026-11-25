import React from 'react';

export const INK = '#1e293b';
export const FONT = 'Inter, "Segoe UI", Arial, sans-serif';

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp01(t);

/** Clean single-line pill header (max 1 per explainer scene; never overflows) */
export const CleanLabel: React.FC<{
  x: number;
  y: number;
  text: string;
  bg?: string;
  color?: string;
  border?: string;
  fontSize?: number;
}> = ({ x, y, text, bg = '#ffffff', color = INK, border = INK, fontSize = 30 }) => {
  const estWidth = Math.max(220, text.length * fontSize * 0.58 + 72);
  const h = fontSize + 28;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={-estWidth / 2}
        y={-h / 2}
        width={estWidth}
        height={h}
        rx={h / 2}
        fill={bg}
        stroke={border}
        strokeWidth="4"
      />
      <text
        x="0"
        y={fontSize * 0.35}
        textAnchor="middle"
        fill={color}
        fontSize={fontSize}
        fontWeight="800"
        fontFamily={FONT}
      >
        {text}
      </text>
    </g>
  );
};

/** Short crisp speech bubble (supports CENTER, LEFT, RIGHT, SIDE_LEFT, SIDE_RIGHT tails) */
export const ShortSpeechBubble: React.FC<{
  x: number;
  y: number;
  text: string;
  tailDir?: 'LEFT' | 'RIGHT' | 'CENTER' | 'SIDE_LEFT' | 'SIDE_RIGHT';
}> = ({ x, y, text, tailDir = 'CENTER' }) => {
  const w = Math.max(176, text.length * 14.5 + 56);
  const h = 56;
  if (tailDir === 'SIDE_LEFT') {
    return (
      <g transform={`translate(${x}, ${y})`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="28" fill="#ffffff" stroke={INK} strokeWidth="4" />
        <path
          d={`M${-w / 2 + 2} -10 L${-w / 2 - 22} 2 L${-w / 2 + 2} 12 Z`}
          fill="#ffffff"
          stroke={INK}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <rect x={-w / 2 - 2} y="-10" width="9" height="22" fill="#ffffff" />
        <text x="0" y="9" textAnchor="middle" fill={INK} fontSize="22" fontWeight="700" fontFamily={FONT}>
          {text}
        </text>
      </g>
    );
  }
  if (tailDir === 'SIDE_RIGHT') {
    return (
      <g transform={`translate(${x}, ${y})`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="28" fill="#ffffff" stroke={INK} strokeWidth="4" />
        <path
          d={`M${w / 2 - 2} -10 L${w / 2 + 22} 2 L${w / 2 - 2} 12 Z`}
          fill="#ffffff"
          stroke={INK}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <rect x={w / 2 - 7} y="-10" width="9" height="22" fill="#ffffff" />
        <text x="0" y="9" textAnchor="middle" fill={INK} fontSize="22" fontWeight="700" fontFamily={FONT}>
          {text}
        </text>
      </g>
    );
  }
  const tailX = tailDir === 'LEFT' ? -w * 0.22 : tailDir === 'RIGHT' ? w * 0.22 : 0;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="28" fill="#ffffff" stroke={INK} strokeWidth="4" />
      <path
        d={`M${tailX - 10} ${h / 2 - 2} L${tailX} ${h / 2 + 16} L${tailX + 12} ${h / 2 - 2} Z`}
        fill="#ffffff"
        stroke={INK}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <rect x={tailX - 12} y={h / 2 - 6} width="26" height="8" fill="#ffffff" />
      <text x="0" y="9" textAnchor="middle" fill={INK} fontSize="22" fontWeight="700" fontFamily={FONT}>
        {text}
      </text>
    </g>
  );
};

/** Grounded wooden desk/table with legs touching floorY cleanly (flat shadow, zero blur) */
export const WoodenTable: React.FC<{
  x: number;
  topY: number;
  floorY: number;
  width?: number;
}> = ({ x, topY, floorY, width = 260 }) => {
  const halfW = width / 2;
  const legH = Math.max(40, floorY - topY - 22);
  return (
    <g>
      <ellipse cx={x} cy={floorY + 3} rx={halfW * 0.94} ry="10" fill="#0f172a" opacity="0.14" />
      <rect
        x={x - halfW + 20}
        y={topY + 20}
        width="18"
        height={legH}
        rx="4"
        fill="#92400e"
        stroke={INK}
        strokeWidth="3.6"
      />
      <rect
        x={x + halfW - 38}
        y={topY + 20}
        width="18"
        height={legH}
        rx="4"
        fill="#92400e"
        stroke={INK}
        strokeWidth="3.6"
      />
      <rect
        x={x - halfW + 38}
        y={topY + Math.min(legH * 0.56, 72)}
        width={width - 76}
        height="11"
        fill="#78350f"
        stroke={INK}
        strokeWidth="2.8"
      />
      <rect
        x={x - halfW}
        y={topY}
        width={width}
        height="24"
        rx="8"
        fill="#b45309"
        stroke={INK}
        strokeWidth="4"
      />
      <line
        x1={x - halfW + 14}
        y1={topY + 9}
        x2={x + halfW - 14}
        y2={topY + 9}
        stroke="#d97706"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.7"
      />
    </g>
  );
};

/** Real wooden chair with backrest & legs firmly planted on floorY */
export const WoodenChair: React.FC<{
  x: number;
  seatY: number;
  floorY: number;
  facing?: 'RIGHT' | 'LEFT';
}> = ({ x, seatY, floorY, facing = 'RIGHT' }) => {
  const dir = facing === 'RIGHT' ? 1 : -1;
  const legH = Math.max(40, floorY - seatY - 14);
  return (
    <g transform={`translate(${x}, 0)`}>
      <ellipse cx="0" cy={floorY + 2} rx="72" ry="10" fill="#0f172a" opacity="0.14" />
      <g transform={`scale(${dir}, 1)`}>
        {/* Backrest upright post & slats */}
        <rect
          x="-64"
          y={seatY - 106}
          width="18"
          height={106 + legH + 14}
          rx="4"
          fill="#92400e"
          stroke={INK}
          strokeWidth="3.8"
        />
        <rect x="-68" y={seatY - 90} width="26" height="22" rx="4" fill="#b45309" stroke={INK} strokeWidth="3.2" />
        <rect x="-68" y={seatY - 52} width="26" height="22" rx="4" fill="#b45309" stroke={INK} strokeWidth="3.2" />
        {/* Front chair leg */}
        <rect x="34" y={seatY + 14} width="16" height={legH} rx="3" fill="#92400e" stroke={INK} strokeWidth="3.6" />
        {/* Cross brace */}
        <rect x="-46" y={seatY + legH * 0.55} width="80" height="10" fill="#78350f" stroke={INK} strokeWidth="2.8" />
        {/* Chair seat */}
        <rect x="-68" y={seatY} width="124" height="18" rx="6" fill="#b45309" stroke={INK} strokeWidth="3.8" />
      </g>
    </g>
  );
};

/** Crisp 2D Smartphone prop (can be held in hand or propped solidly on a desk) */
export const SmartphoneProp: React.FC<{
  x: number;
  y: number;
  scale?: number;
  rotateDeg?: number;
  mode?: 'IDLE' | 'RECORDING' | 'PLAYING' | 'CAMERA';
  flatOnTable?: boolean;
  frame?: number;
}> = ({ x, y, scale = 1, rotateDeg = 0, mode = 'IDLE', flatOnTable = false, frame = 0 }) => {
  const pulse = 0.55 + 0.45 * Math.sin(frame * 0.25);
  if (flatOnTable) {
    // Sleek angled smartphone resting squarely on tabletop (bottom edge at local y = 0!)
    return (
      <g transform={`translate(${x}, ${y}) scale(${scale})`}>
        {/* Small fold stand / base flush with table */}
        <polygon points="-14,0 26,0 16,-24 -8,-18" fill="#475569" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        {/* Angled phone body touching tabletop at y = 0 */}
        <g transform="translate(0, -34) rotate(-18)">
          <rect x="-22" y="-36" width="44" height="72" rx="9" fill="#1e293b" stroke={INK} strokeWidth="3.5" />
          <rect x="-17" y="-29" width="34" height="56" rx="5" fill={mode === 'PLAYING' ? '#e0f2fe' : '#f8fafc'} />
          {mode === 'PLAYING' ? (
            <g>
              <circle cx="0" cy="-6" r="10" fill="#0284c7" />
              <polygon points="-3,-11 -3,-1 6,-6" fill="#ffffff" />
              <line x1="-12" y1="12" x2="12" y2="12" stroke="#0284c7" strokeWidth="3.2" strokeLinecap="round" />
              <line x1="-8" y1="19" x2="8" y2="19" stroke="#38bdf8" strokeWidth="2.8" strokeLinecap="round" />
            </g>
          ) : mode === 'RECORDING' ? (
            <g>
              <circle cx="0" cy="-6" r="8" fill="#ef4444" opacity={pulse} />
              {[-10, -4, 2, 8].map((bx, i) => (
                <line
                  key={i}
                  x1={bx}
                  y1={14 - Math.abs(Math.sin(frame * 0.25 + i)) * 8}
                  x2={bx}
                  y2={14 + Math.abs(Math.sin(frame * 0.25 + i)) * 8}
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              ))}
            </g>
          ) : (
            <rect x="-10" y="-12" width="20" height="24" rx="4" fill="#cbd5e1" />
          )}
        </g>
      </g>
    );
  }

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotateDeg}) scale(${scale})`}>
      <rect x="-18" y="-32" width="36" height="64" rx="8" fill="#1e293b" stroke={INK} strokeWidth="3.2" />
      <rect
        x="-14"
        y="-25"
        width="28"
        height="48"
        rx="4"
        fill={mode === 'RECORDING' ? '#fef2f2' : mode === 'PLAYING' ? '#e0f2fe' : '#f1f5f9'}
      />
      {mode === 'RECORDING' && (
        <g>
          <circle cx="0" cy="-10" r="6.5" fill="#ef4444" opacity={pulse} />
          {[-8, -3, 2, 7].map((bx, i) => {
            const h = 4 + Math.abs(Math.sin(frame * 0.28 + i * 1.1)) * 9;
            return (
              <line
                key={i}
                x1={bx}
                y1={9 - h / 2}
                x2={bx}
                y2={9 + h / 2}
                stroke="#ef4444"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            );
          })}
        </g>
      )}
      {mode === 'PLAYING' && (
        <g>
          <circle cx="0" cy="-4" r="8" fill="#0284c7" />
          <polygon points="-2,-8 -2,0 5,-4" fill="#ffffff" />
        </g>
      )}
      {mode === 'CAMERA' && (
        <g>
          <rect x="-10" y="-18" width="20" height="24" rx="3" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.8" />
          <circle cx="0" cy="-6" r="5" fill="#ffffff" stroke={INK} strokeWidth="1.6" />
          <circle cx="0" cy="14" r="4.5" fill="#ffffff" stroke={INK} strokeWidth="2" />
        </g>
      )}
      <line x1="-6" y1="-28.5" x2="6" y2="-28.5" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
};

/** Classic condenser studio microphone resting on a grounded base stand (bottom at local y = 0) */
export const StudioMicOnStand: React.FC<{
  x: number;
  y: number;
  scale?: number;
}> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    {/* Heavy circular weighted base flush on surface y = 0 */}
    <ellipse cx="0" cy="0" rx="56" ry="11" fill="#334155" stroke={INK} strokeWidth="4" />
    <ellipse cx="0" cy="-4" rx="44" ry="7" fill="#475569" />
    {/* Vertical steel shaft */}
    <rect x="-7" y="-128" width="14" height="124" rx="4" fill="#64748b" stroke={INK} strokeWidth="3.5" />
    {/* Shockmount U-cradle */}
    <path
      d="M -38 -170 L -38 -134 Q -38 -116 0 -116 Q 38 -116 38 -134 L 38 -170"
      fill="none"
      stroke="#334155"
      strokeWidth="7"
      strokeLinecap="round"
    />
    {/* Mic capsule body */}
    <rect x="-26" y="-232" width="52" height="102" rx="26" fill="#475569" stroke={INK} strokeWidth="4.2" />
    {/* Metallic grille top */}
    <path d="M -26 -184 L 26 -184 L 26 -206 A 26 26 0 0 0 -26 -206 Z" fill="#94a3b8" stroke={INK} strokeWidth="3.5" />
    {[-214, -202, -190].map((gy) => (
      <line key={gy} x1="-22" y1={gy} x2="22" y2={gy} stroke={INK} strokeWidth="2.5" opacity="0.65" />
    ))}
    {/* Status LED */}
    <circle cx="0" cy="-154" r="5" fill="#10b981" />
  </g>
);

/** Cozy desk lamp sitting solidly on desk top (base bottom at local y = 0) */
export const DeskLamp: React.FC<{
  x: number;
  y: number;
  scale?: number;
  lit?: boolean;
}> = ({ x, y, scale = 1, lit = true }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    {lit && (
      <polygon points="-42,-112 -140,0 10,0 -12,-112" fill="#fef08a" opacity="0.28" />
    )}
    {/* Lamp base flush with desk y = 0 */}
    <path d="M -28 0 Q -28 -16 0 -16 Q 28 -16 28 0 Z" fill="#0284c7" stroke={INK} strokeWidth="3.8" />
    {/* Articulated arm */}
    <path
      d="M 0 -16 L 26 -88 L -18 -136"
      fill="none"
      stroke="#475569"
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="26" cy="-88" r="6" fill="#94a3b8" stroke={INK} strokeWidth="2.5" />
    {/* Lamp shade */}
    <path
      d="M -48 -108 L -8 -148 L 12 -128 L -18 -96 Z"
      fill="#0ea5e9"
      stroke={INK}
      strokeWidth="3.8"
      strokeLinejoin="round"
    />
    <circle cx="-26" cy="-108" r="9" fill="#fef08a" stroke="#f59e0b" strokeWidth="2.5" />
  </g>
);

export type GhiAmStickmanRole = 'BOY' | 'DAD' | 'SCIENTIST' | 'FRIEND_A' | 'FRIEND_B';

export type GhiAmStickmanPose =
  | 'IDLE'
  | 'NOD_SMILE'
  | 'SIT_HOLD_PHONE'
  | 'SIT_TAP_DESK'
  | 'SIT_COVER_EARS'
  | 'SIT_RELAX_CHAT'
  | 'STAND_COVER_EARS'
  | 'PLUG_EARS'
  | 'HOLD_CARDBOARDS'
  | 'JOG_BONE_HEADPHONES'
  | 'HOLD_PHONE_SELFIE'
  | 'PAT_SHOULDER'
  | 'RELIEF_SIGH'
  | 'TALK_GESTURE'
  | 'POINT_UP'
  | 'HAPPY_WAVE';

export type GhiAmStickmanExpression =
  | 'HAPPY'
  | 'PROUD'
  | 'CURIOUS'
  | 'SURPRISED'
  | 'SHOCKED'
  | 'EMBARRASSED'
  | 'RELIEF'
  | 'WORRIED';

/**
 * Full-body V21.0 Stickman matching StickmanRig.tsx with episode-specific grounded poses:
 * - Feet stand at local y = +114 (standing) or +92 (seated on chair where hips sit at local y = 0).
 * - Props (phone, cardboard walls, bone-conduction headphones) attach directly with 0px floating gap!
 */
export const SharedStickman: React.FC<{
  x: number;
  y: number;
  scale?: number;
  role: GhiAmStickmanRole;
  facing?: 'LEFT' | 'RIGHT';
  pose?: GhiAmStickmanPose;
  expression?: GhiAmStickmanExpression;
  frame?: number;
  phoneMode?: 'IDLE' | 'RECORDING' | 'PLAYING' | 'CAMERA';
  hairPartSide?: 'RIGHT' | 'LEFT';
}> = ({
  x,
  y,
  scale = 1,
  role,
  facing = 'RIGHT',
  pose = 'IDLE',
  expression = 'HAPPY',
  frame = 0,
  phoneMode = 'RECORDING',
  hairPartSide,
}) => {
  const dir = facing === 'RIGHT' ? 1 : -1;
  const breath = Math.sin(frame * 0.08) * 1.5;
  const waveOffset = Math.sin(frame * 0.22) * 13;
  const patBob = pose === 'PAT_SHOULDER' ? Math.abs(Math.sin(frame * 0.18)) * 7 : 0;
  const shockX = pose === 'SIT_COVER_EARS' || pose === 'STAND_COVER_EARS' ? Math.sin(frame * 0.6) * 2.4 : 0;
  const shockY = pose === 'SIT_COVER_EARS' || pose === 'STAND_COVER_EARS' ? Math.cos(frame * 0.5) * 1.3 : 0;
  const reliefDrop = pose === 'RELIEF_SIGH' ? Math.sin(frame * 0.1) * 3 : 0;
  const jogPhase = pose === 'JOG_BONE_HEADPHONES' ? frame * 0.24 : 0;
  const jogBounce = pose === 'JOG_BONE_HEADPHONES' ? Math.abs(Math.sin(jogPhase)) * -10 : 0;
  const jogSwing = pose === 'JOG_BONE_HEADPHONES' ? Math.sin(jogPhase) * 26 : 0;

  const isSeated =
    pose === 'SIT_HOLD_PHONE' ||
    pose === 'SIT_TAP_DESK' ||
    pose === 'SIT_COVER_EARS' ||
    pose === 'SIT_RELAX_CHAT';

  const headTiltDeg =
    pose === 'NOD_SMILE' || pose === 'SIT_RELAX_CHAT'
      ? Math.sin(frame * 0.1) * 4
      : pose === 'SIT_COVER_EARS' || pose === 'STAND_COVER_EARS'
        ? -7 + Math.sin(frame * 0.45) * 2.5
        : pose === 'SIT_TAP_DESK'
          ? 7
          : pose === 'RELIEF_SIGH'
            ? -5 + Math.sin(frame * 0.09) * 2
            : pose === 'JOG_BONE_HEADPHONES'
              ? 6 + Math.sin(jogPhase) * 2
              : Math.sin(frame * 0.06) * 1.5;

  return (
    <g transform={`translate(${x}, ${y + jogBounce})`}>
      <g transform={`scale(${scale * dir}, ${scale})`}>
        {/* Legs — complete bent knees, feet grounded squarely */}
        {isSeated ? (
          <g stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M0 0 L64 0 L72 96" />
            <path d="M-4 6 L50 8 L56 96" />
          </g>
        ) : pose === 'JOG_BONE_HEADPHONES' ? (
          <g stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d={`M0 0 L${22 + jogSwing} 52 L${4 + jogSwing * 1.3} 106`} />
            <path d={`M0 0 L${-18 - jogSwing} 56 L${-34 - jogSwing * 1.1} 106`} />
          </g>
        ) : pose === 'STAND_COVER_EARS' ? (
          <g stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M0 0 L-24 54 L-34 114" />
            <path d="M0 0 L24 54 L34 114" />
          </g>
        ) : (
          <g stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M0 0 L-17 58 L-26 114" />
            <path d="M0 0 L19 58 L28 114" />
          </g>
        )}

        {/* Back Arm (behind torso) */}
        {pose === 'SIT_COVER_EARS' || pose === 'STAND_COVER_EARS' ? (
          <path
            d={`M0 ${-84 + breath} L${-48 + shockX} ${-114 + breath + shockY} L${-36 + shockX} ${-144 + breath + shockY}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'PLUG_EARS' ? (
          /* Left arm bent neatly with fingertip directly plugging back/left ear */
          <g>
            <path
              d={`M0 ${-84 + breath} L-52 ${-104 + breath} L-37 ${-140 + breath}`}
              fill="none"
              stroke={INK}
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="-37" cy={-140 + breath} r="5.5" fill="#fde68a" stroke={INK} strokeWidth="2.8" />
          </g>
        ) : pose === 'HOLD_CARDBOARDS' ? (
          /* Back arm holding rear upright cardboard wall cleanly beside ear */
          <g>
            <rect
              x="-66"
              y={-186 + breath}
              width="20"
              height="82"
              rx="5"
              fill="#f59e0b"
              stroke={INK}
              strokeWidth="3.6"
            />
            <path
              d={`M0 ${-84 + breath} L-44 ${-90 + breath} L-54 ${-124 + breath}`}
              fill="none"
              stroke={INK}
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ) : pose === 'JOG_BONE_HEADPHONES' ? (
          <path
            d={`M0 ${-84 + breath} L${-26 - jogSwing * 0.7} ${-56 + breath} L${-8 - jogSwing * 0.9} ${-34 + breath}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : isSeated ? (
          <path
            d={`M0 ${-84 + breath} L-18 ${-42 + breath} L12 ${-18 + breath}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d={`M0 ${-84 + breath} L-26 ${-50 + breath} L-18 ${-14 + breath}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Torso */}
        <line
          x1="0"
          y1="0"
          x2={pose === 'JOG_BONE_HEADPHONES' ? 10 : 0}
          y2={-104 + breath + reliefDrop}
          stroke={INK}
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Role-specific attire */}
        {role === 'DAD' ? (
          <g transform={`translate(0, ${breath + reliefDrop})`}>
            {/* Crisp Blue Polo (#2563EB) matching parametric StickmanRig POLO */}
            <path
              d="M-21 -92 Q0 -98 21 -92 L25 -8 Q0 -2 -25 -8 Z"
              fill="#2563eb"
              stroke={INK}
              strokeWidth="3.8"
              strokeLinejoin="round"
            />
            {/* Crisp White Polo Collar & Placket */}
            <polygon points="-14,-93 -3,-81 -16,-78" fill="#f8fafc" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
            <polygon points="14,-93 3,-81 16,-78" fill="#f8fafc" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
            <line x1="0" y1="-82" x2="0" y2="-56" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
            <circle cx="0" cy="-72" r="2.3" fill="#ffffff" />
            <circle cx="0" cy="-62" r="2.3" fill="#ffffff" />
          </g>
        ) : role === 'SCIENTIST' ? (
          <g transform={`translate(0, ${breath + reliefDrop})`}>
            <path
              d="M-23 -94 L-10 -100 L0 -68 L10 -100 L23 -94 L29 18 Q29 24 22 24 L-22 24 Q-29 24 -29 18 Z"
              fill="#ffffff"
              stroke={INK}
              strokeWidth="4.2"
              strokeLinejoin="round"
            />
            <path
              d="M-10 -100 L0 -68 L10 -100 Z"
              fill="#e0f2fe"
              stroke={INK}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <rect x="6" y="-50" width="14" height="14" rx="2.5" fill="#f1f5f9" stroke={INK} strokeWidth="2.4" />
            <line x1="12" y1="-56" x2="12" y2="-48" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
          </g>
        ) : role === 'FRIEND_A' ? (
          <g transform={`translate(0, ${breath})`}>
            <path
              d="M-18 -92 L18 -92 L20 -12 Q20 -6 14 -6 L-14 -6 Q-20 -6 -20 -12 Z"
              fill="#0ea5e9"
              stroke={INK}
              strokeWidth="3.6"
              strokeLinejoin="round"
            />
          </g>
        ) : role === 'FRIEND_B' ? (
          <g transform={`translate(0, ${breath})`}>
            <path
              d="M-18 -92 L18 -92 L20 -12 Q20 -6 14 -6 L-14 -6 Q-20 -6 -20 -12 Z"
              fill="#10b981"
              stroke={INK}
              strokeWidth="3.6"
              strokeLinejoin="round"
            />
          </g>
        ) : null}

        {/* Held Props directly in hand (0px gap!) */}
        {pose === 'SIT_HOLD_PHONE' && (
          <SmartphoneProp
            x={64}
            y={-100 + breath}
            scale={0.95}
            rotateDeg={-12}
            mode={phoneMode}
            frame={frame}
          />
        )}
        {pose === 'HOLD_PHONE_SELFIE' && (
          <SmartphoneProp
            x={72}
            y={-124 + breath}
            scale={0.98}
            rotateDeg={-6}
            mode={phoneMode}
            frame={frame}
          />
        )}

        {/* Front Arm (gripping prop or expressive gesture) */}
        {pose === 'SIT_COVER_EARS' || pose === 'STAND_COVER_EARS' ? (
          <path
            d={`M0 ${-84 + breath} L${48 + shockX} ${-114 + breath + shockY} L${36 + shockX} ${-144 + breath + shockY}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'PLUG_EARS' ? (
          <g>
            <path
              d={`M0 ${-84 + breath} L52 ${-104 + breath} L37 ${-140 + breath}`}
              fill="none"
              stroke={INK}
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="37" cy={-140 + breath} r="5.5" fill="#fde68a" stroke={INK} strokeWidth="2.8" />
          </g>
        ) : pose === 'SIT_HOLD_PHONE' ? (
          <path
            d={`M0 ${-84 + breath} L30 ${-64 + breath} L56 ${-94 + breath}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'SIT_TAP_DESK' ? (
          /* Reaching forward cleanly to tap phone resting on desk */
          <path
            d={`M0 ${-84 + breath} L48 ${-58 + breath} L96 ${-52 + breath + Math.sin(frame * 0.25) * 4}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'SIT_RELAX_CHAT' ? (
          <path
            d={`M0 ${-84 + breath} L28 ${-42 + breath} L54 ${-26 + breath + Math.sin(frame * 0.14) * 4}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'HOLD_PHONE_SELFIE' ? (
          <path
            d={`M0 ${-84 + breath} L34 ${-82 + breath} L64 ${-118 + breath}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'HOLD_CARDBOARDS' ? (
          /* Front arm holding upright cardboard panel right in front of the ear */
          <g>
            <rect
              x="28"
              y={-186 + breath}
              width="20"
              height="82"
              rx="5"
              fill="#fbbf24"
              stroke={INK}
              strokeWidth="3.6"
            />
            <path
              d={`M0 ${-84 + breath} L38 ${-88 + breath} L38 ${-124 + breath}`}
              fill="none"
              stroke={INK}
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ) : pose === 'JOG_BONE_HEADPHONES' ? (
          <path
            d={`M8 ${-84 + breath} L${32 + jogSwing * 0.7} ${-56 + breath} L${48 + jogSwing * 0.9} ${-80 + breath}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'PAT_SHOULDER' ? (
          <path
            d={`M0 ${-84 + breath} L52 ${-82 + breath} L112 ${-72 + patBob}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'TALK_GESTURE' ? (
          <path
            d={`M0 ${-84 + breath} L34 ${-62 + breath} L56 ${-76 + breath + Math.sin(frame * 0.2) * 8}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'POINT_UP' ? (
          <path
            d={`M0 ${-84 + breath} L34 ${-96 + breath} L56 ${-148 + breath}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'HAPPY_WAVE' ? (
          <path
            d={`M0 ${-84 + breath} L38 ${-104 + breath} L${54 + waveOffset} ${-154 + breath}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'RELIEF_SIGH' ? (
          <path
            d={`M0 ${-82 + breath + reliefDrop} L28 ${-46 + breath + reliefDrop} L20 ${-12 + breath + reliefDrop}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d={`M0 ${-84 + breath} L28 ${-52 + breath} L20 ${-14 + breath}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Head */}
        <g
          transform={`translate(${(pose === 'JOG_BONE_HEADPHONES' ? 12 : 0) + shockX * 0.6}, ${
            -142 + breath + reliefDrop + shockY * 0.5
          }) rotate(${headTiltDeg})`}
        >
          <circle cx="0" cy="0" r="38" fill="#ffffff" stroke={INK} strokeWidth="5.5" />

          {/* Hair — role matched & optional hairPartSide for mirror analogy */}
          {role === 'BOY' ? (
            hairPartSide === 'RIGHT' ? (
              <path
                d="M-36 -8 C-38 -36 -10 -46 10 -42 C24 -40 36 -26 36 -8 C28 -16 20 -24 14 -24 C6 -14 -14 -12 -36 -8 Z"
                fill="#0f172a"
              />
            ) : hairPartSide === 'LEFT' ? (
              <path
                d="M-36 -8 C-36 -26 -24 -40 -10 -42 C10 -46 38 -36 36 -8 C14 -12 -6 -14 -14 -24 C-20 -24 -28 -16 -36 -8 Z"
                fill="#0f172a"
              />
            ) : (
              <path
                d="M-36 -8 C-38 -36 -12 -46 0 -42 C8 -49 18 -44 20 -39 C34 -36 38 -22 36 -8 C26 -16 14 -14 4 -20 C-8 -12 -22 -16 -36 -8 Z"
                fill="#0f172a"
              />
            )
          ) : role === 'DAD' ? (
            /* NEAT_SHORT dark hair (#1E293B) matching parametric StickmanRig */
            <path
              d="M-34 -16 C-34 -42 8 -46 33 -20 Q14 -30 -7 -25 Q-22 -27 -34 -16 Z"
              fill="#1e293b"
              stroke="#141414"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          ) : role === 'FRIEND_A' ? (
            <path
              d="M-36 -10 C-36 -34 -18 -44 0 -44 C20 -44 37 -32 36 -10 L24 -22 L10 -16 L-4 -24 L-20 -16 Z"
              fill="#334155"
            />
          ) : role === 'FRIEND_B' ? (
            <g>
              <circle cx="-38" cy="-16" r="14" fill="#451a03" stroke={INK} strokeWidth="3" />
              <path
                d="M-36 -6 C-38 -36 -14 -44 2 -43 C24 -42 38 -28 36 -6 C24 -18 12 -20 0 -18 C-12 -20 -24 -16 -36 -6 Z"
                fill="#451a03"
              />
            </g>
          ) : (
            <path
              d="M-36 -8 C-37 -34 -16 -43 2 -42 C22 -41 37 -28 36 -8 C25 -18 14 -22 4 -18 C-8 -22 -24 -18 -36 -8 Z"
              fill="#0f172a"
            />
          )}

          {/* Bone-conduction headphone pad on cheekbone IN FRONT of open ear */}
          {pose === 'JOG_BONE_HEADPHONES' && (
            <g>
              <path d="M -38 2 C -32 -14 -16 -14 -8 4" fill="none" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
              {/* Open ear clearly visible behind pad */}
              <path d="M -22 -2 C -28 -2 -28 12 -22 12" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
              {/* Orange bone transducer pad pressing cheekbone */}
              <rect x="-12" y="2" width="14" height="10" rx="5" fill="#f97316" stroke={INK} strokeWidth="2.4" />
            </g>
          )}

          {/* Eyes */}
          {expression === 'RELIEF' ? (
            <g fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round">
              <path d="M-11 -2 Q-4 -8 3 -2" />
              <path d="M12 -2 Q19 -8 26 -2" />
            </g>
          ) : expression === 'SHOCKED' ? (
            <g>
              <circle cx="-4" cy="-2" r="8" fill="#ffffff" stroke={INK} strokeWidth="2.8" />
              <circle cx="-2" cy="-2" r="2.8" fill={INK} />
              <circle cx="19" cy="-2" r="8" fill="#ffffff" stroke={INK} strokeWidth="2.8" />
              <circle cx="21" cy="-2" r="2.8" fill={INK} />
            </g>
          ) : (
            <g>
              <circle cx="-4" cy="-2" r="6.5" fill="#ffffff" stroke={INK} strokeWidth="2.5" />
              <circle cx="-2" cy="-2" r="3.2" fill={INK} />
              <circle cx="19" cy="-2" r="6.5" fill="#ffffff" stroke={INK} strokeWidth="2.5" />
              <circle cx="21" cy="-2" r="3.2" fill={INK} />
            </g>
          )}

          {/* SCIENTIST rectangular glasses */}
          {role === 'SCIENTIST' && (
            <g fill="none" stroke={INK} strokeWidth="3">
              <rect x="-15" y="-11" width="21" height="18" rx="4" />
              <rect x="9" y="-11" width="21" height="18" rx="4" />
              <line x1="6" y1="-2" x2="9" y2="-2" />
              <line x1="-15" y1="-3" x2="-35" y2="-6" strokeWidth="2.6" />
              <line x1="30" y1="-3" x2="36" y2="-5" strokeWidth="2.6" />
            </g>
          )}

          {/* Expressions */}
          {expression === 'SHOCKED' ? (
            <g>
              <path d="M-12 -16 Q-4 -22 3 -16" fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
              <path d="M12 -16 Q19 -22 27 -16" fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
              <ellipse cx="9" cy="19" rx="7.5" ry="9.5" fill="#fca5a5" stroke={INK} strokeWidth="3.2" />
              <path d="M30 -36 L42 -46 M38 -22 L52 -26" stroke="#ef4444" strokeWidth="3.4" strokeLinecap="round" />
            </g>
          ) : expression === 'EMBARRASSED' ? (
            <g>
              <line x1="-12" y1="-12" x2="1" y2="-15" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
              <line x1="27" y1="-12" x2="14" y2="-15" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
              <ellipse cx="-14" cy="9" rx="7" ry="4" fill="#fca5a5" opacity="0.78" />
              <ellipse cx="26" cy="9" rx="7" ry="4" fill="#fca5a5" opacity="0.78" />
              <path d="M-1 19 Q4 14 9 19 T19 19" fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
              <path
                d="M-28 -18 C-33 -9 -33 0 -28 0 C-23 0 -23 -9 -28 -18 Z"
                fill="#38bdf8"
                stroke="#0284c7"
                strokeWidth="2"
              />
            </g>
          ) : expression === 'WORRIED' ? (
            <g>
              <line x1="-12" y1="-12" x2="1" y2="-15" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
              <line x1="27" y1="-12" x2="14" y2="-15" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
              <path d="M0 21 Q9 14 18 21" fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
            </g>
          ) : expression === 'SURPRISED' ? (
            <g>
              <path d="M-11 -15 Q-4 -20 3 -15" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
              <path d="M12 -15 Q19 -20 26 -15" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
              <ellipse cx="9" cy="19" rx="6" ry="8" fill="#fca5a5" stroke={INK} strokeWidth="3" />
            </g>
          ) : expression === 'CURIOUS' ? (
            <g>
              <line x1="-11" y1="-13" x2="2" y2="-13" stroke={INK} strokeWidth="3" strokeLinecap="round" />
              <path d="M13 -16 Q19 -21 26 -15" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
              <path d="M2 18 Q9 15 15 18" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
            </g>
          ) : expression === 'PROUD' || expression === 'RELIEF' ? (
            <g>
              <path d="M-11 -14 Q-4 -18 3 -14" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
              <path d="M12 -14 Q19 -18 26 -14" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
              <ellipse cx="-14" cy="9" rx="6" ry="3.5" fill="#fecdd3" opacity="0.72" />
              <ellipse cx="26" cy="9" rx="6" ry="3.5" fill="#fecdd3" opacity="0.72" />
              <path d="M-3 14 Q8 26 20 14" fill="none" stroke={INK} strokeWidth="3.8" strokeLinecap="round" />
            </g>
          ) : (
            <g>
              <path d="M-10 -14 Q-4 -17 2 -14" fill="none" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
              <path d="M13 -14 Q19 -17 25 -14" fill="none" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
              <path d="M-2 15 Q8 24 18 15" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
            </g>
          )}
        </g>
      </g>
    </g>
  );
};

/**
 * Clean 2D Anatomical Head Cutaway facing RIGHT (vocal cords → mouth on RIGHT, ear/cochlea inside skull):
 * - Air conduction (BLUE): vocal cords → exits RIGHT mouth opening → arcs cleanly outside through open air → enters outer ear → eardrum → 3 ossicles → cochlea.
 * - Bone conduction (ORANGE): vocal cords → travels strictly INSIDE jawbone & skull temporal bone → directly into cochlea (bypassing eardrum, ZERO lines poking behind neck!).
 */
export const VocalEarCutawayDiagram: React.FC<{
  x: number;
  y: number;
  scale?: number;
  frame: number;
  uid: string;
  vocalActive?: boolean;
  airStage?: 0 | 1 | 2 | 3; // 0=none, 1=out mouth & air arc, 2=hit eardrum, 3=through ossicles to cochlea
  boneStage?: 0 | 1 | 2 | 3; // 0=none, 1=through jaw/skull, 2=directly into cochlea, 3=full dual merge highlight
  boneFadeOpacity?: number;
}> = ({
  x,
  y,
  scale = 1,
  frame,
  uid,
  vocalActive = false,
  airStage = 0,
  boneStage = 0,
  boneFadeOpacity = 1,
}) => {
  const idKey = uid.replace(/[^a-zA-Z0-9_]/g, '_');
  const vocalVib = vocalActive ? Math.sin(frame * 0.55) * 4 : 0;
  const airDash = -(frame * 3.8);
  const boneDash = -(frame * 3.2);
  const drumVib = airStage >= 2 ? Math.sin(frame * 0.65) * 3.2 : 0;
  const cochleaGlow =
    airStage >= 3 || boneStage >= 2 ? 0.55 + 0.45 * Math.abs(Math.sin(frame * 0.24)) : 0;

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <defs>
        <linearGradient id={`ga_head_skin_${idKey}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffedd5" />
          <stop offset="100%" stopColor="#fed7aa" />
        </linearGradient>
        <radialGradient id={`ga_cochlea_glow_${idKey}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#f97316" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer Head & Neck Silhouette facing RIGHT */}
      <path
        d="M-78 238 L-82 162 C-158 136 -212 68 -212 -24 C-212 -148 -124 -232 4 -232 C94 -232 154 -182 162 -106 C164 -84 162 -64 166 -48 L202 -6 C207 0 204 10 194 12 L174 16 C178 26 176 36 168 42 L148 46 L148 86 L172 92 C177 100 175 114 164 126 C154 138 132 148 104 148 L78 150 L78 238 Z"
        fill={`url(#ga_head_skin_${idKey})`}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />

      {/* Cranial Skull & Jaw Bone Cutaway Layer (warm ivory) */}
      <path
        d="M-66 130 C-140 108 -186 46 -186 -30 C-186 -134 -110 -208 4 -208 C84 -208 136 -164 142 -94 C144 -70 132 -46 112 -34 L54 -20 C26 -12 8 12 6 44 L10 130 Z"
        fill="#fef9c3"
        stroke="#d97706"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      {/* Mandible / Jawbone cross-section */}
      <path
        d="M 142 96 C 144 126 118 140 76 138 L 40 124 L 22 70 L 42 54 L 62 108 L 132 104 Z"
        fill="#fef9c3"
        stroke="#d97706"
        strokeWidth="3.5"
        strokeLinejoin="round"
        opacity="0.85"
      />

      {/* Soft Pink Brain inside Cranium */}
      <path
        d="M-158 -24 C-166 -110 -98 -182 4 -182 C74 -182 124 -140 126 -80 C128 -36 98 -12 52 -8 C18 -6 -6 16 -26 24 C-66 36 -122 36 -146 12 C-156 2 -156 -10 -158 -24 Z"
        fill="#fbcfe8"
        stroke="#db2777"
        strokeWidth="3.2"
        strokeLinejoin="round"
        opacity="0.82"
      />
      <g fill="none" stroke="#be185d" strokeWidth="2.8" strokeLinecap="round" opacity="0.45">
        <path d="M-116 -68 C-88 -96 -40 -98 -12 -74" />
        <path d="M-92 -128 C-56 -148 4 -146 38 -118" />
        <path d="M12 -122 C46 -126 84 -106 90 -70" />
        <path d="M-44 -64 C-14 -48 26 -54 56 -78" />
      </g>

      {/* Oral Cavity & Throat Passageway opening clearly on RIGHT (x=+148, y=+64) */}
      <path
        d="M 152 46 C 120 38 78 40 50 56 C 32 68 24 98 24 150 L 24 228 L 56 228 L 56 134 C 60 112 78 106 110 104 L 152 100 Z"
        fill="#fda4af"
        stroke={INK}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Tongue */}
      <path
        d="M 52 106 C 64 84 92 78 122 80 C 138 82 146 88 144 96 C 134 104 98 106 52 106 Z"
        fill="#f43f5e"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Vocal Cords (Dây thanh quản) in Throat at (40, 174) */}
      <g transform="translate(40, 174)">
        <ellipse
          cx="0"
          cy="0"
          rx={18 + Math.abs(vocalVib) * 0.4}
          ry={12}
          fill={vocalActive ? '#fed7aa' : '#fecdd3'}
          stroke={vocalActive ? '#ea580c' : INK}
          strokeWidth="3.2"
        />
        <path
          d={`M -12 ${-4 + vocalVib * 0.5} Q 0 ${-1 - vocalVib} 12 ${-4 + vocalVib * 0.5}`}
          fill="none"
          stroke={vocalActive ? '#dc2626' : INK}
          strokeWidth="3.8"
          strokeLinecap="round"
        />
        <path
          d={`M -12 ${4 - vocalVib * 0.5} Q 0 ${1 + vocalVib} 12 ${4 - vocalVib * 0.5}`}
          fill="none"
          stroke={vocalActive ? '#dc2626' : INK}
          strokeWidth="3.8"
          strokeLinecap="round"
        />
      </g>

      {/* Ear System: Outer Ear Pinna (-106, 20) → Ear Canal → Eardrum (-58, 18) → 3 Ossicles → Cochlea (-12, 16) */}
      <g>
        {/* Outer Ear Pinna silhouette */}
        <path
          d="M -112 -18 C -136 -18 -144 10 -134 38 C -128 54 -114 60 -102 52"
          fill="#fed7aa"
          stroke={INK}
          strokeWidth="4.2"
          strokeLinecap="round"
        />
        <path
          d="M -114 -4 C -126 -2 -128 18 -118 34"
          fill="none"
          stroke="#b45309"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Ear Canal */}
        <path
          d="M -112 8 L -58 10 L -58 28 L -112 30 Z"
          fill="#fde68a"
          stroke={INK}
          strokeWidth="3"
        />
        {/* Eardrum (Màng nhĩ) */}
        <ellipse
          cx={-56 + drumVib * 0.4}
          cy="19"
          rx="5.5"
          ry="13"
          fill={airStage >= 2 ? '#38bdf8' : '#e2e8f0'}
          stroke={airStage >= 2 ? '#0284c7' : INK}
          strokeWidth="3.2"
        />
        {airStage >= 2 && (
          <g fill="none" stroke="#0284c7" strokeWidth="2.8" opacity="0.85">
            <path d={`M ${-66 - Math.abs(drumVib)} 10 Q ${-72 - Math.abs(drumVib)} 19 ${-66 - Math.abs(drumVib)} 28`} />
            <path d={`M ${-46 + Math.abs(drumVib)} 10 Q ${-40 + Math.abs(drumVib)} 19 ${-46 + Math.abs(drumVib)} 28`} />
          </g>
        )}

        {/* Middle Ear Cavity + 3 Ossicles (Xương búa, xương đe, xương bàn đạp) */}
        <ellipse cx="-34" cy="18" rx="18" ry="15" fill="#fff7ed" stroke="#94a3b8" strokeWidth="2.2" />
        <g
          transform={`translate(${drumVib * 0.35}, 0)`}
          stroke={airStage >= 3 ? '#0284c7' : '#64748b'}
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <path d="M -51 19 L -42 12 L -33 21 L -22 17" />
          <circle cx="-42" cy="12" r="2.5" fill={airStage >= 3 ? '#0284c7' : '#64748b'} />
          <circle cx="-33" cy="21" r="2.5" fill={airStage >= 3 ? '#0284c7' : '#64748b'} />
        </g>

        {/* Cochlea (Ốc tai spiral) at (-8, 16) */}
        {cochleaGlow > 0.05 && (
          <circle cx="-6" cy="16" r="34" fill={`url(#ga_cochlea_glow_${idKey})`} opacity={cochleaGlow} />
        )}
        <g transform="translate(-6, 16)">
          <path
            d="M -14 2 C -14 -14 14 -16 16 0 C 18 14 -4 18 -8 6 C -10 -4 4 -6 6 2 C 6 6 0 7 -1 4"
            fill="none"
            stroke={airStage >= 3 && boneStage >= 2 ? '#7c3aed' : boneStage >= 2 ? '#ea580c' : airStage >= 3 ? '#0284c7' : INK}
            strokeWidth="4.4"
            strokeLinecap="round"
          />
        </g>
      </g>

      {/* === AIR CONDUCTION PATH (BLUE): Throat → RIGHT mouth opening → exterior air arc → outer ear === */}
      {airStage >= 1 && (
        <g>
          {/* Inside throat exiting RIGHT mouth opening */}
          <path
            d="M 42 162 C 44 126 56 82 96 74 L 154 70"
            fill="none"
            stroke="#0284c7"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray="14 10"
            strokeDashoffset={airDash}
          />
          {/* Expanding ripples shooting OUT of the right mouth opening */}
          {[0, 1, 2].map((i) => {
            const r = 16 + ((frame * 1.4 + i * 16) % 48);
            const op = Math.max(0.12, 1 - r / 64);
            return (
              <path
                key={i}
                d={`M ${164 + r * 0.85} ${70 - r * 0.55} Q ${176 + r} 70 ${164 + r * 0.85} ${70 + r * 0.55}`}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="4.5"
                strokeLinecap="round"
                opacity={op}
              />
            );
          })}
          {/* Exterior Air Arc curving OUTSIDE above/around the head directly into outer ear pinna (-120, 18) */}
          <path
            d="M 164 68 C 254 58 258 -196 108 -254 C -68 -314 -248 -178 -238 -20 C -234 26 -178 24 -124 19"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.26"
          />
          <path
            d="M 164 68 C 254 58 258 -196 108 -254 C -68 -314 -248 -178 -238 -20 C -234 26 -178 24 -124 19"
            fill="none"
            stroke="#0284c7"
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeDasharray="18 12"
            strokeDashoffset={airDash}
          />
          {/* Directional arrow entering outer ear */}
          <polygon points="-112,19 -132,9 -128,29" fill="#0284c7" />

          {/* Inside Ear Canal to Eardrum */}
          {airStage >= 2 && (
            <line
              x1="-112"
              y1="19"
              x2="-60"
              y2="19"
              stroke="#0284c7"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeDasharray="8 8"
              strokeDashoffset={airDash}
            />
          )}
        </g>
      )}

      {/* === BONE CONDUCTION PATH (WARM ORANGE): 100% INSIDE jawbone & skull → directly into cochlea === */}
      {boneStage >= 1 && (
        <g opacity={boneFadeOpacity}>
          {/* Soft internal resonance glow strictly inside jaw/skull */}
          <path
            d="M 38 164 C 46 132 58 106 38 78 C 24 58 4 44 -4 26"
            fill="none"
            stroke="#fb923c"
            strokeWidth="18"
            strokeLinecap="round"
            opacity="0.34"
          />
          {/* Internal skull conduction branch */}
          <path
            d="M 38 164 C 46 132 58 106 38 78 C 24 58 4 44 -4 26"
            fill="none"
            stroke="#ea580c"
            strokeWidth="7.5"
            strokeLinecap="round"
            strokeDasharray="16 11"
            strokeDashoffset={boneDash}
          />
          {/* Secondary resonance wave strictly inside cranial skull wall (never outside head silhouette!) */}
          <path
            d="M 36 86 C 84 62 114 4 106 -68 C 98 -134 38 -178 -36 -174 C -106 -170 -158 -114 -158 -42"
            fill="none"
            stroke="#f97316"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="14 14"
            strokeDashoffset={boneDash}
            opacity="0.62"
          />
          {boneStage >= 2 && (
            <g>
              <polygon points="-6,20 -16,38 4,34" fill="#ea580c" />
              <circle
                cx="-6"
                cy="16"
                r={16 + (frame % 22) * 1.1}
                fill="none"
                stroke="#f97316"
                strokeWidth="3.5"
                opacity={1 - (frame % 22) / 22}
              />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

/** Sunny late-afternoon city neighborhood park backdrop (unique ga_ IDs, flat shadows opacity=0.12, paved walkway <= 830) */
export const CityParkPracticeBackdrop: React.FC<{ frame: number; uid: string }> = ({ frame, uid }) => {
  const idKey = uid.replace(/[^a-zA-Z0-9_]/g, '_');
  const cloudShift = (frame * 0.28) % 1920;
  const breeze = Math.sin(frame * 0.04) * 1.8;

  const buildings = [
    { x: 52, w: 155, h: 245, fill: '#cbd5e1', roof: '#64748b' },
    { x: 222, w: 175, h: 295, fill: '#dbeafe', roof: '#3b82f6' },
    { x: 412, w: 148, h: 215, fill: '#fef3c7', roof: '#d97706' },
    { x: 575, w: 165, h: 255, fill: '#e0e7ff', roof: '#6366f1' },
    { x: 1185, w: 168, h: 270, fill: '#e0f2fe', roof: '#0284c7' },
    { x: 1368, w: 158, h: 225, fill: '#ffedd5', roof: '#ea580c' },
    { x: 1542, w: 180, h: 305, fill: '#cbd5e1', roof: '#475569' },
    { x: 1738, w: 145, h: 240, fill: '#dcfce7', roof: '#16a34a' },
  ];

  return (
    <g>
      <defs>
        <linearGradient id={`ga_park_sky_${idKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="56%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
        <linearGradient id={`ga_park_walk_${idKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>

      {/* Sunny Afternoon Sky */}
      <rect x="0" y="0" width="1920" height="685" fill={`url(#ga_park_sky_${idKey})`} />
      <circle cx="290" cy="168" r="108" fill="#fef08a" opacity="0.34" />
      <circle cx="290" cy="168" r="52" fill="#fde047" stroke="#f59e0b" strokeWidth="4" />

      {/* Drifting Clouds */}
      <g opacity="0.9" transform={`translate(${-cloudShift * 0.16}, 0)`}>
        <path d="M 520 185 C 550 148 618 142 662 166 C 702 135 776 140 812 174 C 852 162 892 178 902 200 L 520 200 Z" fill="#ffffff" />
        <path d="M 1180 156 C 1210 122 1275 118 1318 140 C 1358 112 1430 118 1465 148 C 1500 136 1538 152 1546 172 L 1180 172 Z" fill="#ffffff" />
      </g>

      {/* Distant City Townhouses & Apartments Silhouette (y = 355..670) */}
      <g opacity="0.88">
        {buildings.map((b, idx) => {
          const topY = 665 - b.h;
          return (
            <g key={`city_b_${idx}`}>
              <rect x={b.x} y={topY} width={b.w} height={b.h} rx="6" fill={b.fill} stroke={INK} strokeWidth="3.2" />
              <rect x={b.x - 6} y={topY - 12} width={b.w + 12} height="16" rx="4" fill={b.roof} stroke={INK} strokeWidth="2.8" />
              {[0, 1, 2].map((r) =>
                [0, 1].map((c) => {
                  const wy = topY + 28 + r * 58;
                  if (wy + 34 > 635) return null;
                  return (
                    <rect
                      key={`bw_${r}_${c}`}
                      x={b.x + 24 + c * (b.w * 0.44)}
                      y={wy}
                      width="34"
                      height="34"
                      rx="4"
                      fill="#ffffff"
                      stroke="#64748b"
                      strokeWidth="2.2"
                      opacity="0.9"
                    />
                  );
                })
              )}
            </g>
          );
        })}
      </g>

      {/* Park Lawn Strip (y = 635..735) */}
      <path d="M 0 658 Q 480 622 960 650 T 1920 644 L 1920 735 L 0 735 Z" fill="#4ade80" stroke={INK} strokeWidth="3.2" />
      <path d="M 0 692 Q 520 668 1040 692 T 1920 682 L 1920 735 L 0 735 Z" fill="#22c55e" />

      {/* Row of Park Trees (grounded at y = 730, gentle breeze sway, flat shadow opacity=0.12) */}
      {[
        { x: 140, y: 545, r: 64 },
        { x: 465, y: 558, r: 56 },
        { x: 1410, y: 552, r: 60 },
        { x: 1775, y: 538, r: 68 },
      ].map((t, idx) => (
        <g key={`pk_tree_${idx}`}>
          <ellipse cx={t.x} cy="730" rx="52" ry="9" fill="#0f172a" opacity="0.12" />
          <rect x={t.x - 12} y={t.y + 18} width="24" height={730 - (t.y + 18)} fill="#78350f" stroke={INK} strokeWidth="3.4" />
          <g transform={`rotate(${(breeze * (idx % 2 === 0 ? 1 : -1)).toFixed(2)}, ${t.x}, ${t.y + 18})`}>
            <circle cx={t.x} cy={t.y} r={t.r} fill="#15803d" stroke={INK} strokeWidth="3.8" />
            <circle cx={t.x - t.r * 0.52} cy={t.y + 18} r={t.r * 0.62} fill="#16a34a" stroke={INK} strokeWidth="3.4" />
            <circle cx={t.x + t.r * 0.52} cy={t.y + 18} r={t.r * 0.6} fill="#22c55e" stroke={INK} strokeWidth="3.4" />
          </g>
        </g>
      ))}

      {/* Bright Brick-Paved City Park Sidewalk (curb at y = 735, inner line at y = 824 <= 830) */}
      <rect x="0" y="735" width="1920" height="345" fill={`url(#ga_park_walk_${idKey})`} stroke={INK} strokeWidth="4" />
      <line x1="0" y1="824" x2="1920" y2="824" stroke="#94a3b8" strokeWidth="3" opacity="0.55" />
      <g stroke="#94a3b8" strokeWidth="2.2" opacity="0.34">
        {[120, 260, 400, 540, 680, 820, 960, 1100, 1240, 1380, 1520, 1660, 1800].map((bx) => (
          <line key={`pave_${bx}`} x1={bx} y1="735" x2={bx - 24} y2="824" />
        ))}
      </g>

      {/* Two City Park Benches on Far Left & Far Right (grounded at y = 772 <= 830, flat shadow opacity=0.12) */}
      {[295, 1620].map((bx, idx) => (
        <g key={`pk_bench_${idx}`} transform={`translate(${bx}, 700)`}>
          <ellipse cx="0" cy="74" rx="116" ry="10" fill="#0f172a" opacity="0.12" />
          <rect x="-88" y="38" width="16" height="34" rx="3" fill="#64748b" stroke={INK} strokeWidth="3.2" />
          <rect x="72" y="38" width="16" height="34" rx="3" fill="#64748b" stroke={INK} strokeWidth="3.2" />
          <rect x="-102" y="-10" width="204" height="24" rx="6" fill="#d97706" stroke={INK} strokeWidth="3.4" />
          <rect x="-108" y="22" width="216" height="18" rx="6" fill="#b45309" stroke={INK} strokeWidth="3.4" />
        </g>
      ))}
    </g>
  );
};

/** Warm late-afternoon urban townhouse living room backdrop with sunset skyline window (unique ga_ IDs, flat shadows opacity=0.12) */
export const CityLivingRoomEveningBackdrop: React.FC<{ frame: number; uid: string }> = ({ frame, uid }) => {
  const idKey = uid.replace(/[^a-zA-Z0-9_]/g, '_');
  const cloudDrift = (frame * 0.22) % 380;
  const plantSway = Math.sin(frame * 0.036) * 1.5;

  return (
    <g>
      <defs>
        <linearGradient id={`ga_lr_wall_${idKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
        <linearGradient id={`ga_lr_sunset_${idKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="52%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
        <linearGradient id={`ga_lr_floor_${idKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e5c7a3" />
          <stop offset="100%" stopColor="#cfa476" />
        </linearGradient>
      </defs>

      {/* Warm Living Room Wall & Baseboard */}
      <rect x="0" y="0" width="1920" height="760" fill={`url(#ga_lr_wall_${idKey})`} />
      <rect x="0" y="742" width="1920" height="18" fill="#d6b38e" stroke={INK} strokeWidth="3" />

      {/* Large Glass City Window overlooking Golden Sunset Skyline (x = 420..1460, y = 128..458) */}
      <g transform="translate(420, 128)">
        <rect x="0" y="0" width="1040" height="330" rx="14" fill={`url(#ga_lr_sunset_${idKey})`} />
        {/* Warm Setting Sun */}
        <circle cx="845" cy="108" r="68" fill="#fef08a" opacity="0.34" />
        <circle cx="845" cy="108" r="34" fill="#fef08a" stroke="#f59e0b" strokeWidth="3" />
        {/* Soft Sunset Clouds */}
        <g opacity="0.82" transform={`translate(${(cloudDrift * 0.25) % 90}, 0)`}>
          <path d="M 110 92 C 138 66 196 62 232 82 C 266 56 330 62 358 88 L 110 96 Z" fill="#ffedd5" />
          <path d="M 520 76 C 546 54 598 52 630 70 C 660 48 712 54 736 78 L 520 82 Z" fill="#fed7aa" />
        </g>
        {/* City Apartment & Townhouse Skyline inside Window */}
        {[
          { x: 24, w: 112, h: 165, fill: '#94a3b8' },
          { x: 148, w: 138, h: 210, fill: '#64748b' },
          { x: 300, w: 120, h: 155, fill: '#94a3b8' },
          { x: 434, w: 152, h: 225, fill: '#475569' },
          { x: 602, w: 128, h: 175, fill: '#64748b' },
          { x: 744, w: 146, h: 198, fill: '#94a3b8' },
          { x: 904, w: 112, h: 150, fill: '#64748b' },
        ].map((sb, idx) => (
          <g key={`sky_b_${idx}`}>
            <rect x={sb.x} y={330 - sb.h} width={sb.w} height={sb.h} fill={sb.fill} stroke="#334155" strokeWidth="2.5" />
            {[0, 1, 2].map((r) =>
              [0, 1].map((c) => {
                const wy = 330 - sb.h + 22 + r * 42;
                if (wy + 20 > 318) return null;
                return (
                  <rect
                    key={`sw_${r}_${c}`}
                    x={sb.x + 22 + c * (sb.w * 0.44)}
                    y={wy}
                    width="22"
                    height="20"
                    rx="3"
                    fill="#fef08a"
                    opacity={0.78}
                  />
                );
              })
            )}
          </g>
        ))}
        {/* Crisp Window Mullions & Frame */}
        <line x1="346" y1="0" x2="346" y2="330" stroke="#475569" strokeWidth="6" />
        <line x1="694" y1="0" x2="694" y2="330" stroke="#475569" strokeWidth="6" />
        <rect x="0" y="0" width="1040" height="330" rx="14" fill="none" stroke="#475569" strokeWidth="10" />
        <rect x="0" y="0" width="1040" height="330" rx="14" fill="none" stroke={INK} strokeWidth="3.8" />
        {/* Warm Side Curtains */}
        <rect x="-24" y="-10" width="52" height="350" rx="10" fill="#fdba74" stroke={INK} strokeWidth="3.6" />
        <rect x="1012" y="-10" width="52" height="350" rx="10" fill="#fdba74" stroke={INK} strokeWidth="3.6" />
        {/* Window Sill */}
        <rect x="-32" y="328" width="1104" height="20" rx="6" fill="#b45309" stroke={INK} strokeWidth="3.5" />
      </g>

      {/* Wall Clock on Left Wall */}
      <g transform="translate(215, 225)">
        <circle cx="0" cy="0" r="52" fill="#ffffff" stroke={INK} strokeWidth="4.2" />
        <line x1="0" y1="0" x2="0" y2="-28" stroke={INK} strokeWidth="4.2" strokeLinecap="round" />
        <line x1="0" y1="0" x2="22" y2="12" stroke="#ea580c" strokeWidth="3.4" strokeLinecap="round" />
        <circle cx="0" cy="0" r="5" fill={INK} />
      </g>

      {/* Framed Minimalist Landscape Art on Right Wall */}
      <g transform="translate(1595, 195)">
        <rect x="0" y="0" width="185" height="132" rx="10" fill="#ffffff" stroke={INK} strokeWidth="4" />
        <rect x="14" y="14" width="157" height="104" rx="4" fill="#e0f2fe" stroke="#94a3b8" strokeWidth="2.5" />
        <path d="M 22 108 L 72 56 L 114 94 L 142 68 L 166 108 Z" fill="#86efac" stroke={INK} strokeWidth="2.5" />
        <circle cx="136" cy="40" r="13" fill="#fde047" stroke="#f59e0b" strokeWidth="2.4" />
      </g>

      {/* Warm Wood Floor (y = 760..1080) */}
      <rect x="0" y="760" width="1920" height="320" fill={`url(#ga_lr_floor_${idKey})`} stroke={INK} strokeWidth="4.5" />
      <g stroke="#92400e" strokeWidth="2.2" opacity="0.22">
        <line x1="0" y1="812" x2="1920" y2="812" />
        <line x1="0" y1="876" x2="1920" y2="876" />
        {[240, 560, 880, 1200, 1520].map((fx) => (
          <line key={`fl_${fx}`} x1={fx} y1="760" x2={fx} y2="812" />
        ))}
      </g>

      {/* Potted Indoor Plant on Far Left (grounded at y = 786 <= 830, flat shadow opacity=0.12) */}
      <g transform="translate(195, 786)">
        <ellipse cx="0" cy="4" rx="52" ry="10" fill="#0f172a" opacity="0.12" />
        <g transform={`rotate(${plantSway.toFixed(2)}, 0, -82)`}>
          <path d="M -4 -80 C -44 -118 -58 -164 -28 -180 C -6 -164 -2 -124 0 -80 Z" fill="#16a34a" stroke={INK} strokeWidth="3.2" />
          <path d="M 4 -80 C 44 -118 58 -164 28 -180 C 6 -164 2 -124 0 -80 Z" fill="#22c55e" stroke={INK} strokeWidth="3.2" />
          <path d="M 0 -80 C -18 -134 -16 -186 0 -204 C 16 -186 18 -134 0 -80 Z" fill="#4ade80" stroke={INK} strokeWidth="3.2" />
        </g>
        <path d="M -38 -80 L -28 0 L 28 0 L 38 -80 Z" fill="#f97316" stroke={INK} strokeWidth="3.6" />
        <rect x="-44" y="-92" width="88" height="16" rx="5" fill="#ea580c" stroke={INK} strokeWidth="3.6" />
      </g>

      {/* Tidy Low Wooden Sideboard on Far Right (grounded at y = 786 <= 830, flat shadow opacity=0.12) */}
      <g transform="translate(1545, 650)">
        <ellipse cx="125" cy="138" rx="132" ry="10" fill="#0f172a" opacity="0.12" />
        <rect x="20" y="106" width="16" height="30" rx="3" fill="#78350f" stroke={INK} strokeWidth="3.2" />
        <rect x="214" y="106" width="16" height="30" rx="3" fill="#78350f" stroke={INK} strokeWidth="3.2" />
        <rect x="0" y="0" width="250" height="110" rx="10" fill="#b45309" stroke={INK} strokeWidth="3.8" />
        <line x1="125" y1="12" x2="125" y2="98" stroke={INK} strokeWidth="3" />
        <circle cx="106" cy="54" r="5" fill="#fde047" stroke={INK} strokeWidth="2.2" />
        <circle cx="144" cy="54" r="5" fill="#fde047" stroke={INK} strokeWidth="2.2" />
        {/* Small stack of books resting on sideboard */}
        <rect x="34" y="-18" width="84" height="18" rx="4" fill="#2563eb" stroke={INK} strokeWidth="2.8" />
        <rect x="44" y="-34" width="66" height="16" rx="4" fill="#10b981" stroke={INK} strokeWidth="2.8" />
      </g>
    </g>
  );
};

/** Soft, unobtrusive indoor study/living room architectural layer to add depth behind explainer scenes (flat shadows opacity=0.12, y <= 830) */
export const CozyStudyRoomSoftBackdrop: React.FC<{
  tone?: 'MINT' | 'WARM';
  showSideDesk?: boolean;
  showDeskPhone?: boolean;
  showRightBookshelf?: boolean;
  frame?: number;
}> = ({
  tone = 'MINT',
  showSideDesk = true,
  showDeskPhone = false,
  showRightBookshelf = true,
  frame = 0,
}) => {
  const isMint = tone === 'MINT';
  const baseboardFill = isMint ? '#bbf7d0' : '#fde68a';
  const floorFill = isMint ? '#dcfce7' : '#fef3c7';
  const floorEdge = isMint ? '#86efac' : '#f59e0b';
  const wallAccent = isMint ? '#d1fae5' : '#fef08a';

  return (
    <g>
      {/* Subtle architectural wall baseboard & floor grounded at y = 795 <= 830 */}
      <rect x="0" y="775" width="1920" height="20" fill={baseboardFill} opacity="0.72" />
      <line x1="0" y1="775" x2="1920" y2="775" stroke={floorEdge} strokeWidth="2.5" opacity="0.6" />
      <rect x="0" y="795" width="1920" height="285" fill={floorFill} opacity="0.75" />
      <line x1="0" y1="795" x2="1920" y2="795" stroke={floorEdge} strokeWidth="4" />
      {/* Subtle floorboard horizontal guide line */}
      <line x1="0" y1="846" x2="1920" y2="846" stroke={floorEdge} strokeWidth="2" opacity="0.28" />

      {/* Soft sunlit study window on far left (x=96..356, y=172..402) */}
      <g transform="translate(96, 172)" opacity="0.78">
        <polygon points="0,230 260,0 445,623 95,623" fill={wallAccent} opacity="0.24" />
        <rect x="0" y="0" width="260" height="230" rx="12" fill="#bae6fd" stroke="#94a3b8" strokeWidth="7" />
        <polygon points="12,12 126,12 68,218 12,218" fill="#ffffff" opacity="0.42" />
        <line x1="130" y1="0" x2="130" y2="230" stroke="#94a3b8" strokeWidth="5.5" />
        <line x1="0" y1="115" x2="260" y2="115" stroke="#94a3b8" strokeWidth="5.5" />
        <rect x="0" y="0" width="260" height="230" rx="12" fill="none" stroke={INK} strokeWidth="3" opacity="0.65" />
        <rect x="-16" y="226" width="292" height="16" rx="5" fill="#d97706" stroke={INK} strokeWidth="2.8" opacity="0.85" />
      </g>

      {/* Soft muted wall bookshelf on far right (optional so right cards stay clean) */}
      {showRightBookshelf && (
        <g transform="translate(1515, 195)" opacity="0.68">
          <rect x="0" y="96" width="290" height="16" rx="5" fill="#b45309" stroke={INK} strokeWidth="2.8" />
          <rect x="22" y="28" width="28" height="68" rx="4" fill="#60a5fa" stroke={INK} strokeWidth="2.4" />
          <rect x="54" y="18" width="30" height="78" rx="4" fill="#34d399" stroke={INK} strokeWidth="2.4" />
          <rect x="88" y="34" width="26" height="62" rx="4" fill="#fbbf24" stroke={INK} strokeWidth="2.4" />
          <rect x="118" y="24" width="32" height="72" rx="4" fill="#f87171" stroke={INK} strokeWidth="2.4" />
          {/* Tiny potted succulent on shelf */}
          <path d="M 196 96 L 204 62 L 242 62 L 250 96 Z" fill="#f97316" stroke={INK} strokeWidth="2.4" />
          <circle cx="223" cy="48" r="18" fill="#22c55e" stroke={INK} strokeWidth="2.4" />
        </g>
      )}

      {/* Grounded compact wooden study side desk on far left (x=275, topY=672, floorY=795 <= 830) */}
      {showSideDesk && (
        <g opacity="0.92">
          <WoodenTable x={285} topY={672} floorY={795} width={285} />
          {/* Open study notebook resting solidly on tabletop */}
          <g transform="translate(222, 672)">
            <polygon points="-42,0 -6,-11 36,-11 50,0" fill="#ffffff" stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
            <line x1="0" y1="-11" x2="2" y2="0" stroke="#94a3b8" strokeWidth="2.2" />
          </g>
          {showDeskPhone && (
            <SmartphoneProp x={342} y={672} scale={0.96} mode="IDLE" flatOnTable={true} frame={frame} />
          )}
        </g>
      )}
    </g>
  );
};
