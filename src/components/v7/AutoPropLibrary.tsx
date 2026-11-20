/**
 * AUTO PROP LIBRARY V17.2 — Kho 16 Đạo Cụ Vector Chuyên Nghiệp 60fps
 * Phong cách 2D phẳng nét viền đen (#141414, strokeWidth 3.5–4.5px) đồng nhất tuyệt đối với StickmanRig V16.
 * Tất cả 16 đạo cụ đều có hoạt ảnh 60fps riêng, KHÔNG dùng SVG thô do AI tự vẽ, KHÔNG dùng chữ tiếng Anh.
 */

import React from "react";
import { type AutoPropId } from "../../lib/v7/episodeJsonSchema";

function easeOutBack(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(c - 1, 3) + c1 * Math.pow(c - 1, 2);
}

export const CuratedAnimatedProp: React.FC<{
  propId: AutoPropId;
  x: number;
  y: number;
  scale?: number;
  frame: number;
  localFrame: number;
}> = ({ propId, x, y, scale = 1.0, frame, localFrame }) => {
  if (!propId || propId === "NONE") return null;

  const enter = localFrame < 14 ? easeOutBack(localFrame / 14) : 1.0;
  const floatY = Math.sin(frame * 0.065) * 7;
  const finalScale = scale * enter;

  return (
    <g
      id={`curated-prop-${propId}`}
      transform={`translate(${x.toFixed(1)}, ${(y + floatY).toFixed(1)}) scale(${finalScale.toFixed(3)})`}
    >
      {/* 1. ALARM_CLOCK_RINGING: Đồng hồ báo thức rung chuông + kim quay 60fps */}
      {propId === "ALARM_CLOCK_RINGING" && (() => {
        const ringShake = Math.sin(frame * 0.95) * 8;
        const secAngle = (frame * 6) % 360;
        return (
          <g transform={`rotate(${ringShake.toFixed(1)})`}>
            <circle cx={0} cy={0} r={84} fill="#FEF08A" opacity={0.28} />
            {/* 2 chân đồng hồ */}
            <line x1={-42} y1={52} x2={-58} y2={76} stroke="#141414" strokeWidth={9} strokeLinecap="round" />
            <line x1={42} y1={52} x2={58} y2={76} stroke="#141414" strokeWidth={9} strokeLinecap="round" />
            {/* 2 quả chuông vàng trên đỉnh + búa gõ rung */}
            <path d="M -68,-44 A 26,26 0 0,1 -24,-66 Z" fill="#FACC15" stroke="#141414" strokeWidth={4.5} strokeLinejoin="round" />
            <path d="M 24,-66 A 26,26 0 0,1 68,-44 Z" fill="#FACC15" stroke="#141414" strokeWidth={4.5} strokeLinejoin="round" />
            <line x1={0} y1={-62} x2={Math.sin(frame * 1.4) * 16} y2={-84} stroke="#141414" strokeWidth={6} strokeLinecap="round" />
            {/* Sóng rung hai bên chuông */}
            <path d="M -82,-54 Q -96,-70 -76,-84 M 82,-54 Q 96,-70 76,-84" fill="none" stroke="#EF4444" strokeWidth={4.5} strokeLinecap="round" />
            {/* Thân đồng hồ đỏ & mặt trắng */}
            <circle cx={0} cy={0} r={66} fill="#EF4444" stroke="#141414" strokeWidth={5} />
            <circle cx={0} cy={0} r={52} fill="#FFFFFF" stroke="#141414" strokeWidth={4} />
            {[0, 90, 180, 270].map((deg) => (
              <line
                key={`tk_${deg}`}
                x1={Math.sin((deg * Math.PI) / 180) * 40}
                y1={-Math.cos((deg * Math.PI) / 180) * 40}
                x2={Math.sin((deg * Math.PI) / 180) * 47}
                y2={-Math.cos((deg * Math.PI) / 180) * 47}
                stroke="#141414"
                strokeWidth={4}
                strokeLinecap="round"
              />
            ))}
            <line x1={0} y1={0} x2={22} y2={-14} stroke="#141414" strokeWidth={6} strokeLinecap="round" />
            <line
              x1={0}
              y1={0}
              x2={Math.sin((secAngle * Math.PI) / 180) * 38}
              y2={-Math.cos((secAngle * Math.PI) / 180) * 38}
              stroke="#EF4444"
              strokeWidth={4}
              strokeLinecap="round"
            />
            <circle cx={0} cy={0} r={6} fill="#141414" />
          </g>
        );
      })()}

      {/* 2. SODA_CAN_FIZZ: Lon nước ngọt có ga + bọt khí bay lên 60fps */}
      {propId === "SODA_CAN_FIZZ" && (
        <g>
          <circle cx={0} cy={0} r={86} fill="#FED7AA" opacity={0.32} />
          <rect x={-44} y={-52} width={88} height={118} rx={18} fill="#F97316" stroke="#141414" strokeWidth={5} />
          <path d="M -44,-10 Q 0,-28 44,-10 L 44,28 Q 0,10 -44,28 Z" fill="#FEF08A" stroke="#141414" strokeWidth={4} />
          <ellipse cx={0} cy={-52} rx={40} ry={11} fill="#CBD5E1" stroke="#141414" strokeWidth={4.5} />
          <ellipse cx={4} cy={-52} rx={12} ry={5} fill="#1E293B" />
          {/* Bọt ga sủi bay lên liên tục 60fps */}
          {[0, 1, 2, 3, 4, 5].map((bi) => {
            const p = (frame * 0.024 + bi * 0.17) % 1;
            const bx = -22 + (bi % 3) * 22 + Math.sin(frame * 0.12 + bi) * 8;
            const by = -58 - p * 64;
            return (
              <circle
                key={`fizz_${bi}`}
                cx={bx}
                cy={by}
                r={5 + (bi % 2) * 3}
                fill="#FFFFFF"
                stroke="#141414"
                strokeWidth={2.5}
                opacity={Math.sin(p * Math.PI)}
              />
            );
          })}
        </g>
      )}

      {/* 3. COFFEE_STEAM: Ly cà phê nóng bốc khói uốn lượn 60fps */}
      {propId === "COFFEE_STEAM" && (
        <g>
          <circle cx={0} cy={0} r={86} fill="#FEF3C7" opacity={0.35} />
          {/* Đĩa sứ & quai cốc */}
          <path d="M 46,-16 C 74,-16 74,28 44,28" fill="none" stroke="#141414" strokeWidth={12} strokeLinecap="round" />
          <path d="M 46,-16 C 74,-16 74,28 44,28" fill="none" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" />
          <ellipse cx={0} cy={54} rx={72} ry={14} fill="#E2E8F0" stroke="#141414" strokeWidth={4.5} />
          {/* Thân cốc sứ trắng & mặt cà phê nâu đậm */}
          <path d="M -50,-32 L -38,42 Q 0,56 38,42 L 50,-32 Z" fill="#FFFFFF" stroke="#141414" strokeWidth={5} strokeLinejoin="round" />
          <ellipse cx={0} cy={-32} rx={50} ry={13} fill="#78350F" stroke="#141414" strokeWidth={4.5} />
          {/* 3 làn khói thơm uốn lượn hình sin 60fps */}
          {[-24, 0, 24].map((sx, si) => {
            const wave = Math.sin(frame * 0.09 + si * 1.4) * 10;
            return (
              <path
                key={`stm_${si}`}
                d={`M ${sx},-52 Q ${sx + wave},-76 ${sx - wave * 0.8},-102`}
                fill="none"
                stroke="#94A3B8"
                strokeWidth={5}
                strokeLinecap="round"
                opacity={0.78}
              />
            );
          })}
        </g>
      )}

      {/* 4. BRAIN_GLOW: Bộ não phát sáng + tia điện chớp 60fps */}
      {propId === "BRAIN_GLOW" && (() => {
        const pulse = 1 + Math.sin(frame * 0.11) * 0.05;
        const sparkShow = Math.sin(frame * 0.25) > -0.2;
        return (
          <g transform={`scale(${pulse.toFixed(3)})`}>
            <circle cx={0} cy={0} r={92} fill="#FEF08A" opacity={0.34 + Math.sin(frame * 0.11) * 0.12} />
            <path
              d="M -38,38 C -72,32 -78,-8 -56,-30 C -60,-60 -28,-74 0,-58 C 28,-74 60,-60 56,-30 C 78,-8 72,32 38,38 C 22,56 -22,56 -38,38 Z"
              fill="#FDA4AF"
              stroke="#141414"
              strokeWidth={5}
              strokeLinejoin="round"
            />
            <line x1={0} y1={-56} x2={0} y2={46} stroke="#141414" strokeWidth={4} strokeLinecap="round" />
            <path
              d="M -42,-18 Q -22,-28 -14,-8 M 42,-18 Q 22,-28 14,-8 M -36,14 Q -18,4 -10,20 M 36,14 Q 18,4 10,20"
              fill="none"
              stroke="#9F1239"
              strokeWidth={4}
              strokeLinecap="round"
            />
            {sparkShow && (
              <g stroke="#FACC15" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" fill="none">
                <polyline points="-74,-48 -92,-62 -80,-74 -98,-88" />
                <polyline points="74,-48 92,-62 80,-74 98,-88" />
                <polyline points="0,-74 8,-94 -6,-102 4,-118" />
              </g>
            )}
          </g>
        );
      })()}

      {/* 5. NEURON_SIGNAL: Tế bào thần kinh bắn xung điện chạy dọc sợi trục 60fps */}
      {propId === "NEURON_SIGNAL" && (
        <g>
          <circle cx={0} cy={0} r={92} fill="#E0F2FE" opacity={0.32} />
          {/* Tua gai & thân tế bào neuron bên trái */}
          <g stroke="#141414" strokeWidth={4.5} strokeLinecap="round" fill="none">
            <path d="M -52,0 L -88,-38 M -52,0 L -94,6 M -52,0 L -82,44 M -52,0 L -42,-52 M -52,0 L -38,52" />
            <path d="M -22,0 L 78,0" strokeWidth={10} stroke="#7C3AED" />
            <path d="M -22,0 L 78,0" strokeWidth={4.5} stroke="#141414" />
            <path d="M 78,0 L 104,-24 M 78,0 L 106,4 M 78,0 L 102,26" />
          </g>
          <circle cx={-52} cy={0} r={28} fill="#A78BFA" stroke="#141414" strokeWidth={4.5} />
          <circle cx={-52} cy={0} r={11} fill="#4C1D95" />
          {/* 3 hạt xung điện vàng phóng dọc sợi trục 60fps */}
          {[0, 1, 2].map((pi) => {
            const p = (frame * 0.028 + pi * 0.33) % 1;
            const px = -22 + p * 100;
            return (
              <circle
                key={`imp_${pi}`}
                cx={px}
                cy={0}
                r={9}
                fill="#FACC15"
                stroke="#141414"
                strokeWidth={3}
              />
            );
          })}
        </g>
      )}

      {/* 6. BATTERY_LOW: Pin cạn năng lượng nhấp nháy đỏ 60fps (không chữ tiếng Anh) */}
      {propId === "BATTERY_LOW" && (() => {
        const blink = Math.sin(frame * 0.22) > -0.15;
        return (
          <g>
            <circle cx={0} cy={0} r={88} fill="#FEE2E2" opacity={0.35} />
            <rect x={-64} y={-40} width={118} height={80} rx={14} fill="#FFFFFF" stroke="#141414" strokeWidth={5.5} />
            <rect x={54} y={-18} width={14} height={36} rx={5} fill="#141414" />
            {/* 1 vạch đỏ duy nhất nhấp nháy báo cạn pin */}
            {blink && (
              <rect x={-50} y={-26} width={24} height={52} rx={6} fill="#EF4444" stroke="#141414" strokeWidth={3.5} />
            )}
            {/* Dấu chấm than cảnh báo gọn ở giữa */}
            <line x1={12} y1={-18} x2={12} y2={6} stroke="#DC2626" strokeWidth={7} strokeLinecap="round" />
            <circle cx={12} cy={20} r={4.5} fill="#DC2626" />
          </g>
        );
      })()}

      {/* 7. BUG_SWARM: Đàn côn trùng/bọ/muỗi bay vòng lượn 60fps */}
      {propId === "BUG_SWARM" && (
        <g>
          {Array.from({ length: 6 }).map((_, bi) => {
            const ang = frame * (0.07 + (bi % 3) * 0.015) + bi * 1.1;
            const bx = Math.cos(ang) * (34 + (bi % 3) * 22);
            const by = Math.sin(ang * 1.3) * (24 + (bi % 2) * 20);
            const wingY = 4 + Math.abs(Math.sin(frame * 0.9 + bi)) * 6;
            return (
              <g key={`swbug_${bi}`} transform={`translate(${bx.toFixed(1)}, ${by.toFixed(1)})`}>
                <ellipse cx={-3} cy={-6} rx={8} ry={wingY} fill="#E0F2FE" stroke="#141414" strokeWidth={2} />
                <ellipse cx={4} cy={-6} rx={8} ry={wingY} fill="#E0F2FE" stroke="#141414" strokeWidth={2} />
                <ellipse cx={0} cy={0} rx={9} ry={5.5} fill="#DC2626" stroke="#141414" strokeWidth={2.5} />
                <circle cx={8} cy={-1} r={4} fill="#141414" />
              </g>
            );
          })}
        </g>
      )}

      {/* 8. HEART_BEAT: Trái tim đập sinh học + sóng điện tâm đồ 60fps */}
      {propId === "HEART_BEAT" && (() => {
        const beatScale = 1 + Math.pow(Math.max(0, Math.sin(frame * 0.22)), 4) * 0.18;
        return (
          <g>
            <circle cx={0} cy={0} r={90} fill="#FFE4E6" opacity={0.38} />
            <g transform={`scale(${beatScale.toFixed(3)})`}>
              <path
                d="M 0,54 C -18,38 -66,4 -66,-28 C -66,-54 -44,-70 -22,-70 C -8,-70 0,-58 0,-46 C 0,-58 8,-70 22,-70 C 44,-70 66,-54 66,-28 C 66,4 18,38 0,54 Z"
                fill="#EF4444"
                stroke="#141414"
                strokeWidth={5}
                strokeLinejoin="round"
              />
            </g>
            {/* Đường xung nhịp tim trắng sáng chạy ngang */}
            <polyline
              points="-58,2 -24,2 -14,-22 -2,28 12,-32 24,14 34,2 58,2"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        );
      })()}

      {/* 9. THERMOMETER_HOT: Nhiệt kế thủy ngân đỏ dâng cao + sóng nhiệt */}
      {propId === "THERMOMETER_HOT" && (() => {
        const mercuryH = 52 + Math.sin(frame * 0.12) * 10;
        return (
          <g>
            <circle cx={0} cy={0} r={88} fill="#FFEDD5" opacity={0.38} />
            <rect x={-16} y={-76} width={32} height={110} rx={16} fill="#FFFFFF" stroke="#141414" strokeWidth={5} />
            <circle cx={0} cy={46} r={30} fill="#EF4444" stroke="#141414" strokeWidth={5} />
            <rect x={-8} y={34 - mercuryH - 40} width={16} height={mercuryH + 46} rx={8} fill="#EF4444" />
            {[-52, -32, -12, 8].map((ty) => (
              <line key={`tmk_${ty}`} x1={16} y1={ty} x2={28} y2={ty} stroke="#141414" strokeWidth={3.5} strokeLinecap="round" />
            ))}
          </g>
        );
      })()}

      {/* 10. GHOST_SHADOW: Bóng ảo giác chập chờn lơ lửng khi thiếu ngủ/hoa mắt */}
      {propId === "GHOST_SHADOW" && (() => {
        const swayX = Math.sin(frame * 0.08) * 12;
        return (
          <g transform={`translate(${swayX.toFixed(1)}, 0)`} opacity={0.86}>
            <path
              d="M -52,52 L -52,-14 A 52,52 0 0,1 52,-14 L 52,52 Q 35,36 18,52 Q 0,36 -18,52 Q -35,36 -52,52 Z"
              fill="#C4B5FD"
              stroke="#141414"
              strokeWidth={4.5}
              strokeLinejoin="round"
            />
            <circle cx={-18} cy={-12} r={10} fill="#FFFFFF" stroke="#141414" strokeWidth={3} />
            <circle cx={18} cy={-12} r={10} fill="#FFFFFF" stroke="#141414" strokeWidth={3} />
            <circle cx={-18} cy={-12} r={4} fill="#141414" />
            <circle cx={18} cy={-12} r={4} fill="#141414" />
            <ellipse cx={0} cy={14} rx={10} ry={14} fill="#1E1B4B" />
          </g>
        );
      })()}

      {/* 11. SOUND_WAVES: Sóng âm thanh đồng tâm lan tỏa 60fps */}
      {propId === "SOUND_WAVES" && (
        <g>
          <polygon points="-48,-18 -22,-18 6,-42 6,42 -22,18 -48,18" fill="#38BDF8" stroke="#141414" strokeWidth={4.5} strokeLinejoin="round" />
          {[0, 1, 2].map((wi) => {
            const p = ((frame * 0.03) + wi * 0.33) % 1;
            const r = 24 + p * 68;
            return (
              <path
                key={`snd_${wi}`}
                d={`M ${(16 + r * 0.4).toFixed(1)},${(-r * 0.7).toFixed(1)} A ${r},${r} 0 0,1 ${(16 + r * 0.4).toFixed(1)},${(r * 0.7).toFixed(1)}`}
                fill="none"
                stroke="#0284C7"
                strokeWidth={6}
                strokeLinecap="round"
                opacity={1 - p}
              />
            );
          })}
        </g>
      )}

      {/* 12. EARTH_CUTAWAY: Mặt cắt Trái Đất 3 lớp quay nhẹ 60fps */}
      {propId === "EARTH_CUTAWAY" && (
        <g transform={`rotate(${(Math.sin(frame * 0.05) * 8).toFixed(1)})`}>
          <circle cx={0} cy={0} r={76} fill="#38BDF8" stroke="#141414" strokeWidth={5} />
          <path d="M -48,-28 Q -15,-56 18,-32 Q 34,-8 6,18 Q -32,26 -48,-28 Z" fill="#22C55E" stroke="#141414" strokeWidth={3} />
          {/* Góc cắt 1/4 lộ lớp phủ cam & lõi vàng */}
          <path d="M 0,0 L 76,0 A 76,76 0 0,0 0,-76 Z" fill="#F97316" stroke="#141414" strokeWidth={4.5} />
          <path d="M 0,0 L 48,0 A 48,48 0 0,0 0,-48 Z" fill="#EF4444" stroke="#141414" strokeWidth={3.5} />
          <circle cx={0} cy={0} r={22} fill="#FEF08A" stroke="#141414" strokeWidth={4} />
        </g>
      )}

      {/* 13. NOTEBOOK_OPEN: Cuốn sổ mở đôi trang + bút chì lướt viết 60fps */}
      {propId === "NOTEBOOK_OPEN" && (() => {
        const penX = 14 + Math.sin(frame * 0.18) * 18;
        const penY = -10 + Math.cos(frame * 0.09) * 14;
        return (
          <g>
            <rect x={-72} y={-52} width={70} height={104} rx={8} fill="#FEF9C3" stroke="#141414" strokeWidth={4.5} />
            <rect x={-2} y={-52} width={70} height={104} rx={8} fill="#FFFFFF" stroke="#141414" strokeWidth={4.5} />
            {[-28, -8, 12, 32].map((ly) => (
              <React.Fragment key={`nbl_${ly}`}>
                <line x1={-56} y1={ly} x2={-16} y2={ly} stroke="#94A3B8" strokeWidth={3.5} strokeLinecap="round" />
                <line x1={12} y1={ly} x2={52} y2={ly} stroke="#94A3B8" strokeWidth={3.5} strokeLinecap="round" />
              </React.Fragment>
            ))}
            <g transform={`translate(${penX.toFixed(1)}, ${penY.toFixed(1)}) rotate(-32)`}>
              <rect x={0} y={-6} width={52} height={12} fill="#FACC15" stroke="#141414" strokeWidth={3} />
              <polygon points="0,-6 -14,0 0,6" fill="#FDE68A" stroke="#141414" strokeWidth={3} />
            </g>
          </g>
        );
      })()}

      {/* 14. MOON_STARS: Trăng lưỡi liềm & sao lấp lánh 60fps */}
      {propId === "MOON_STARS" && (
        <g>
          <path d="M 14,-52 A 54,54 0 1,0 14,52 A 40,40 0 1,1 14,-52 Z" fill="#FEF08A" stroke="#141414" strokeWidth={4} />
          {[
            [-58, -36, 1.0],
            [52, -28, 0.85],
            [64, 24, 0.9],
            [-48, 38, 0.75],
          ].map(([sx, sy, sc], si) => {
            const tw = 0.55 + Math.abs(Math.sin(frame * 0.1 + si * 1.3)) * 0.55;
            return (
              <path
                key={`mst_${si}`}
                transform={`translate(${sx}, ${sy}) scale(${(sc * tw).toFixed(2)})`}
                d="M 0,-14 L 4,-4 L 14,0 L 4,4 L 0,14 L -4,4 L -14,0 L -4,-4 Z"
                fill="#FEF08A"
                stroke="#141414"
                strokeWidth={2.2}
              />
            );
          })}
        </g>
      )}

      {/* 15. WATER_RIPPLE: Giọt nước xanh & vòng sóng đồng tâm 60fps */}
      {propId === "WATER_RIPPLE" && (
        <g>
          {[0, 1, 2].map((ri) => {
            const p = ((frame * 0.024) + ri * 0.33) % 1;
            return (
              <ellipse
                key={`wrp_${ri}`}
                cx={0}
                cy={30}
                rx={20 + p * 68}
                ry={7 + p * 22}
                fill="none"
                stroke="#0284C7"
                strokeWidth={4}
                opacity={1 - p}
              />
            );
          })}
          <path
            d="M 0,-54 C 24,-18 32,2 0,18 C -32,2 -24,-18 0,-54 Z"
            fill="#38BDF8"
            stroke="#141414"
            strokeWidth={4.5}
            strokeLinejoin="round"
          />
        </g>
      )}

      {/* 16. TROPHY_STAR: Ngôi sao vàng lớn lấp lánh 60fps */}
      {propId === "TROPHY_STAR" && (() => {
        const rot = Math.sin(frame * 0.07) * 10;
        return (
          <g transform={`rotate(${rot.toFixed(1)})`}>
            <circle cx={0} cy={0} r={88} fill="#FEF08A" opacity={0.34} />
            <polygon
              points="0,-68 18,-22 66,-18 28,14 40,62 0,36 -40,62 -28,14 -66,-18 -18,-22"
              fill="#FACC15"
              stroke="#141414"
              strokeWidth={5}
              strokeLinejoin="round"
            />
            <circle cx={-14} cy={-8} r={6} fill="#141414" />
            <circle cx={14} cy={-8} r={6} fill="#141414" />
            <path d="M -12,10 Q 0,20 12,10" fill="none" stroke="#141414" strokeWidth={4} strokeLinecap="round" />
          </g>
        );
      })()}
    </g>
  );
};
