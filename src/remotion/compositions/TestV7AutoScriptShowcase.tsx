/**
 * TestV7AutoScriptShowcase.tsx: KIỂM CHỨNG TỰ ĐỘNG HÓA TỪ KỊCH BẢN (ZERO HARDCODED FRAMES)
 * 18.0s (1080 frames @ 60fps) - 3 Phông nền đa lớp + 6 Hành động mới
 * Tuyệt đối không tính toán FK/IK thủ công theo số frame trong component,
 * gọi compileScriptBeats(SCRIPT_BEATS, frame) để chứng minh tự động hóa 100%!
 */

import React from "react";
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { StickmanRig } from "../components/character/StickmanRig";
import { BackgroundStage } from "../components/backgrounds/BackgroundStage";
import { compileScriptBeats, ScriptBeat } from "../../animscript/actionLibrary";

export const SCRIPT_BEATS: ScriptBeat[] = [
  // =========================================================================
  // CẢNH 1: STUDY_ROOM (F0 -> F360 | 6.0s)
  // =========================================================================
  {
    id: "beat_1_walk_to_desk",
    type: "WALK",
    startFrame: 0,
    durationFrames: 90,
    theme: "STUDY_ROOM",
    startX: 680,
    targetX: 915,
    title: "CẢNH 1: PHÒNG HỌC & LÀM VIỆC SÁNG TẠO (STUDY_ROOM)",
    sub: "Hành động 1: Bước đi khoan thai 3 bước tới ghế (X: 680 -> 915, vx = 2.6 px/f, 30f/bước)",
  },
  {
    id: "beat_2_sit_and_type",
    type: "SIT_AND_TYPE",
    startFrame: 90,
    durationFrames: 150,
    theme: "STUDY_ROOM",
    seatX: 915,
    title: "CẢNH 1: PHÒNG HỌC & LÀM VIỆC SÁNG TẠO (STUDY_ROOM)",
    sub: "Hành động 2: Ngồi ghế (seatY = 755px, hipY = -85px) & Gõ laptop (2.1 Hz, biên độ ±2.5px, khuỷu tay chữ L)",
  },
  {
    id: "beat_3_shock_celebrate",
    type: "SHOCK_CELEBRATE",
    startFrame: 240,
    durationFrames: 120,
    theme: "STUDY_ROOM",
    startX: 915,
    title: "CẢNH 1: PHÒNG HỌC & LÀM VIỆC SÁNG TẠO (STUDY_ROOM)",
    sub: "Hành động 3: Đứng dậy lùi về X=835 -> Bật nảy lift 55px giơ tay V ăn mừng -> Bóng đèn trên đỉnh mũ 45px",
  },

  // =========================================================================
  // CẢNH 2: SUNSET_PARK (F360 -> F720 | 6.0s)
  // =========================================================================
  {
    id: "beat_4_run_and_kick",
    type: "RUN_AND_KICK_BALL",
    startFrame: 360,
    durationFrames: 160,
    theme: "SUNSET_PARK",
    startX: 430,
    ballStartX: 760,
    title: "CẢNH 2: CÔNG VIÊN ĐƯỜNG PHỐ HOÀNG HÔN (SUNSET_PARK)",
    sub: "Hành động 4: Chạy đà 4 bước (X: 430 -> 722) -> Cắm trụ -> Sút vung chân duỗi thẳng tại F485 -> Bóng bay parabol",
  },
  {
    id: "beat_5_wave_and_drink",
    type: "WAVE_AND_DRINK",
    startFrame: 520,
    durationFrames: 200,
    theme: "SUNSET_PARK",
    startX: 760,
    title: "CẢNH 2: CÔNG VIÊN ĐƯỜNG PHỐ HOÀNG HÔN (SUNSET_PARK)",
    sub: "Hành động 5: Xoay chính diện nhìn rõ cả 2 tay (tay trái chống sườn, tay phải vẫy 1.5 Hz & uống nước)",
  },

  // =========================================================================
  // CẢNH 3: DARK_STUDIO (F720 -> F1080 | 6.0s)
  // =========================================================================
  {
    id: "beat_6_push_heavy",
    type: "PUSH_HEAVY_OBJECT",
    startFrame: 720,
    durationFrames: 120,
    theme: "DARK_STUDIO",
    startX: 420,
    targetX: 580,
    crateStartX: 490,
    title: "CẢNH 3: PHÒNG STUDIO TỐI EXPLAINER (DARK_STUDIO)",
    sub: "Hành động 6: Ghì người đẩy thùng nặng (40f/bước, X: 420 -> 580), thùng dừng hẳn tại boxX = 650px",
  },
  {
    id: "beat_7_jump_over_crate",
    type: "JUMP_OVER",
    startFrame: 840,
    durationFrames: 60,
    theme: "DARK_STUDIO",
    startX: 580,
    targetX: 760,
    obstacleHeight: 140,
    title: "CẢNH 3: PHÒNG STUDIO TỐI EXPLAINER (DARK_STUDIO)",
    sub: "Nhảy vọt qua thùng: Bật cao lift 165px bay qua đỉnh thùng 140px (X: 580 -> 760, không xuyên thùng)",
  },
  {
    id: "beat_8_walk_to_board",
    type: "WALK",
    startFrame: 900,
    durationFrames: 40,
    theme: "DARK_STUDIO",
    startX: 760,
    targetX: 1045,
    title: "CẢNH 3: PHÒNG STUDIO TỐI EXPLAINER (DARK_STUDIO)",
    sub: "Đi bộ tới bảng: Bước đi khoan thai từ X = 760 -> 1045 (hoàn toàn bên phải thùng, 0% va chạm)",
  },
  {
    id: "beat_9_point_board",
    type: "POINT_BOARD_EXPLAIN",
    startFrame: 940,
    durationFrames: 140,
    theme: "DARK_STUDIO",
    boardX: 1350,
    title: "CẢNH 3: PHÒNG STUDIO TỐI EXPLAINER (DARK_STUDIO)",
    sub: "Hành động 7: Đứng cách bảng 135px (X=1045), que chỉ 140px lướt Node 1 -> 2 -> Giữ yên Node 3",
  },
];

export const TestV7AutoScriptShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const groundY = 840;

  // =========================================================================
  // ZERO HARDCODED FRAMES: TỰ ĐỘNG HÓA 100% QUA COMPILE SCRIPT BEATS
  // =========================================================================
  const evaluated = compileScriptBeats(SCRIPT_BEATS, frame, groundY);

  const stickmanState = {
    x: evaluated.rootX,
    y: evaluated.rootY,
    scale: 1.0,
    facing: evaluated.facing,
    facingFactor: evaluated.facingFactor,
    pose: evaluated.rigPose,
    torsoTiltDeg: evaluated.torsoTiltDeg,
    crouchDepth: evaluated.crouchDepth,
    flightLift: evaluated.flightLift,
    walkCycleProgress: evaluated.walkCycleProgress,
    walkWeight: evaluated.walkWeight,
    leftFootOffset: evaluated.leftFootOffset,
    rightFootOffset: evaluated.rightFootOffset,
    leftKneeOffset: evaluated.leftKneeOffset,
    rightKneeOffset: evaluated.rightKneeOffset,
    customHipY: evaluated.customHipY,
    limbAngles: {
      head: evaluated.headTiltDeg,
    },
    eyes: evaluated.eyes,
    eyebrows: evaluated.eyebrows,
    mouth: evaluated.mouth,
    pupilGaze: evaluated.pupilGaze,
    blush: evaluated.blush,
    sweatDrop: evaluated.sweatDrop,
    holdingTarget: evaluated.holdingTarget,
    hat: true,
    archetype: "oldMan" as const,
    rimLight: evaluated.rimLight,
    rimColor: evaluated.rimColor,
  };

  const isSitting = evaluated.customHipY !== undefined && evaluated.customHipY > -100;

  return (
    <AbsoluteFill style={{ width, height, overflow: "hidden", backgroundColor: "#0F172A" }}>
      {/* Font Be Vietnam Pro */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@600;700;800;900&display=swap');
      `}</style>

      {/* 1. PHÔNG NỀN ĐA LỚP THEO THEME HIỆN TẠI (STUDY_ROOM, SUNSET_PARK, DARK_STUDIO) */}
      <BackgroundStage theme={evaluated.theme} frame={frame} groundY={groundY} />

      {/* 2. SÂN KHẤU SVG CHÍNH CHỨA ĐẠO CỤ VÀ NHÂN VẬT THEO ĐỘ SÂU CEL-SHADING */}
      <svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0 }}>
        {/* =====================================================================
            ĐẠO CỤ CẢNH 1: STUDY_ROOM (Bàn, Ghế, Laptop, Hiệu ứng Bóng đèn ý tưởng)
           ===================================================================== */}
        {evaluated.theme === "STUDY_ROOM" && (
          <g id="props-study-room">
            {/* Ghế tựa văn phòng ở X = 915, mặt ghế Y = 755 (groundY - 85), tựa lưng cao tới Y = 635 */}
            <g id="prop-chair" transform={`translate(915, ${groundY})`}>
              <ellipse cx={0} cy={2} rx={44} ry={10} fill="rgba(0,0,0,0.22)" />
              {/* Chân ghế */}
              <line x1={-28} y1={-85} x2={-35} y2={0} stroke="#1E293B" strokeWidth={8} strokeLinecap="round" />
              <line x1={28} y1={-85} x2={35} y2={0} stroke="#1E293B" strokeWidth={8} strokeLinecap="round" />
              {/* Mặt đệm ghế */}
              <rect x={-40} y={-85} width={80} height={16} rx={6} fill="#D97706" stroke="#1E293B" strokeWidth={5} />
              {/* Tựa lưng ghế cao tới Y = 635 (dy = -205px từ groundY) */}
              <rect x={-42} y={-205} width={16} height={125} rx={6} fill="#B45309" stroke="#1E293B" strokeWidth={5} />
            </g>

            {/* Bàn làm việc từ X = 955 đến X = 1135 (rộng 180px, tâm X = 1045, deskTopY = 685 tức groundY - 155) */}
            <g id="prop-desk" transform={`translate(1045, ${groundY})`}>
              <ellipse cx={0} cy={2} rx={95} ry={14} fill="rgba(0,0,0,0.22)" />
              {/* 2 Chân bàn gỗ */}
              <line x1={-75} y1={-155} x2={-75} y2={0} stroke="#78350F" strokeWidth={12} strokeLinecap="round" />
              <line x1={75} y1={-155} x2={75} y2={0} stroke="#78350F" strokeWidth={12} strokeLinecap="round" />
              {/* Mặt bàn gỗ rộng 180px, cao 18px (đỉnh bàn tại Y = 685) */}
              <rect x={-90} y={-155} width={180} height={18} rx={6} fill="#92400E" stroke="#1E293B" strokeWidth={6} />
            </g>

            {/* Laptop mở nắp nhìn nghiêng (Side-View Open Laptop) đặt tại deskTopY = 685 */}
            <g id="prop-laptop">
              {/* Đế bàn phím nằm ngang trên mặt bàn (x: 965 -> 1017, y: 677 -> 685) */}
              <rect x={965} y={677} width={52} height={8} rx={3} fill="#94A3B8" stroke="#141414" strokeWidth={4} />
              <line x1={970} y1={680} x2={1008} y2={680} stroke="#475569" strokeWidth={2} strokeLinecap="round" />
              {/* Màn hình laptop mở nghiêng 110° về phía phải với ánh sáng xanh tỏa nhẹ */}
              <polygon points="1012,677 1030,632 1038,635 1020,677" fill="#38BDF8" stroke="#141414" strokeWidth={4} />
              <line x1={1016} y1={674} x2={1032} y2={636} stroke="#FFFFFF" strokeWidth={2} opacity={0.8} />
            </g>

            {/* Hiệu ứng bóng đèn bật sáng trên đầu khi SHOCK_CELEBRATE */}
            {evaluated.vfxState.ideaSpark && (
              <g
                id="vfx-idea-spark"
                transform={`translate(${evaluated.vfxState.sparkX}, ${evaluated.vfxState.sparkY}) scale(${evaluated.vfxState.sparkScale})`}
              >
                {/* Quầng sáng vàng */}
                <circle cx={0} cy={0} r={42} fill="#FEF08A" opacity={0.45} />
                <circle cx={0} cy={0} r={28} fill="#FACC15" stroke="#1E293B" strokeWidth={6} />
                {/* Đuôi bóng đèn */}
                <rect x={-8} y={24} width={16} height={10} fill="#94A3B8" stroke="#1E293B" strokeWidth={3} />
                {/* Tia sáng phát ra xung quanh */}
                {Array.from({ length: 8 }).map((_, i) => {
                  const angle = (i * Math.PI) / 4;
                  const x1 = Math.cos(angle) * 36;
                  const y1 = Math.sin(angle) * 36;
                  const x2 = Math.cos(angle) * 48;
                  const y2 = Math.sin(angle) * 48;
                  return (
                    <line
                      key={`spark_ray_${i}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#CA8A04"
                      strokeWidth={4}
                      strokeLinecap="round"
                    />
                  );
                })}
              </g>
            )}
          </g>
        )}

        {/* =====================================================================
            ĐẠO CỤ CẢNH 2: SUNSET_PARK (Quả bóng đá bay parabol & Cốc nước)
           ===================================================================== */}
        {evaluated.theme === "SUNSET_PARK" && (
          <g id="props-sunset-park">
            {/* Quả bóng đá bay parabol & nảy đất */}
            {evaluated.propsState.ball?.visible && (
              <g
                id="prop-soccer-ball"
                transform={`translate(${evaluated.propsState.ball.x}, ${evaluated.propsState.ball.y}) rotate(${evaluated.propsState.ball.rotationDeg})`}
              >
                {/* Bóng đổ chạm đất */}
                {evaluated.propsState.ball.y >= groundY - 35 && (
                  <ellipse cx={0} cy={18} rx={18} ry={5} fill="rgba(0,0,0,0.25)" />
                )}
                {/* Quả bóng tròn trắng đen r = 18px (đường kính 36px) */}
                <circle cx={0} cy={0} r={18} fill="#F8FAFC" stroke="#1E293B" strokeWidth={5} />
                {/* Họa tiết ngũ giác đen kinh điển */}
                <polygon points="0,-8 7,-2 4,6 -4,6 -7,-2" fill="#1E293B" />
                <line x1={0} y1={-8} x2={0} y2={-18} stroke="#1E293B" strokeWidth={3} />
                <line x1={7} y1={-2} x2={16} y2={-6} stroke="#1E293B" strokeWidth={3} />
                <line x1={4} y1={6} x2={12} y2={14} stroke="#1E293B" strokeWidth={3} />
                <line x1={-4} y1={6} x2={-12} y2={14} stroke="#1E293B" strokeWidth={3} />
                <line x1={-7} y1={-2} x2={-16} y2={-6} stroke="#1E293B" strokeWidth={3} />
              </g>
            )}

            {/* Cốc nước trong tay nhân vật kích thước chuẩn 18x24px */}
            {evaluated.propsState.cup?.visible && (
              <g
                id="prop-water-cup"
                transform={`translate(${evaluated.propsState.cup.x}, ${evaluated.propsState.cup.y})`}
              >
                <rect x={-9} y={-16} width={18} height={24} rx={4} fill="#38BDF8" stroke="#1E293B" strokeWidth={4} />
                <path d="M 9,-10 C 15,-10 15,0 9,0" fill="none" stroke="#1E293B" strokeWidth={3} />
              </g>
            )}
          </g>
        )}

        {/* =====================================================================
            ĐẠO CỤ CẢNH 3: DARK_STUDIO (Khối thiết bị nặng & Bảng thuyết trình biểu đồ)
           ===================================================================== */}
        {evaluated.theme === "DARK_STUDIO" && (
          <g id="props-dark-studio">
            {/* Khối hàng lớn rộng 115px, cao 140px (đáy ở Y=840, đỉnh thùng ở Y=700) */}
            {evaluated.propsState.crate?.visible && (
              <g id="prop-heavy-crate" transform={`translate(${evaluated.propsState.crate.x}, ${groundY})`}>
                <ellipse cx={0} cy={2} rx={75} ry={14} fill="rgba(0,0,0,0.45)" />
                {/* Thân khối kim loại chắc nịch 115x140px */}
                <rect x={-58} y={-140} width={115} height={140} rx={8} fill="#475569" stroke="#1E293B" strokeWidth={8} />
                {/* Sọc vạch cảnh báo an toàn vàng-đen */}
                <g clipPath="url(#hazard-clip)">
                  <clipPath id="hazard-clip">
                    <rect x={-58} y={-95} width={115} height={36} rx={2} />
                  </clipPath>
                  <rect x={-58} y={-95} width={115} height={36} fill="#FACC15" />
                  <line x1={-65} y1={-95} x2={-45} y2={-59} stroke="#1E293B" strokeWidth={9} />
                  <line x1={-40} y1={-95} x2={-20} y2={-59} stroke="#1E293B" strokeWidth={9} />
                  <line x1={-15} y1={-95} x2={5} y2={-59} stroke="#1E293B" strokeWidth={9} />
                  <line x1={10} y1={-95} x2={30} y2={-59} stroke="#1E293B" strokeWidth={9} />
                  <line x1={35} y1={-95} x2={55} y2={-59} stroke="#1E293B" strokeWidth={9} />
                </g>
                {/* Tay cầm chịu lực */}
                <rect x={-62} y={-75} width={7} height={26} rx={3} fill="#0F172A" />
                <rect x={55} y={-75} width={7} height={26} rx={3} fill="#0F172A" />
              </g>
            )}

            {/* Bảng thuyết trình lớn phát sáng (BOARD) từ X = 1180 đến X = 1520 (tâm X = 1350) */}
            <g id="prop-presentation-board" transform={`translate(1350, ${groundY})`}>
              <ellipse cx={0} cy={2} rx={180} ry={16} fill="rgba(0,0,0,0.5)" />
              {/* 2 Chân giá đỡ bảng */}
              <line x1={-125} y1={-180} x2={-145} y2={0} stroke="#64748B" strokeWidth={10} strokeLinecap="round" />
              <line x1={125} y1={-180} x2={145} y2={0} stroke="#64748B" strokeWidth={10} strokeLinecap="round" />
              <line x1={-155} y1={0} x2={-135} y2={0} stroke="#64748B" strokeWidth={12} strokeLinecap="round" />
              <line x1={135} y1={0} x2={155} y2={0} stroke="#64748B" strokeWidth={12} strokeLinecap="round" />
              {/* Mặt bảng kính cường lực viền neon cyan (rộng 340px) */}
              <rect x={-170} y={-450} width={340} height={270} rx={12} fill="#0B132B" stroke="#38BDF8" strokeWidth={8} />
              {/* Lưới tọa độ biểu đồ */}
              <line x1={-140} y1={-220} x2={140} y2={-220} stroke="#1E293B" strokeWidth={3} />
              <line x1={-140} y1={-290} x2={140} y2={-290} stroke="#1E293B" strokeWidth={3} />
              <line x1={-140} y1={-360} x2={140} y2={-360} stroke="#1E293B" strokeWidth={3} />
              <line x1={-140} y1={-430} x2={-140} y2={-200} stroke="#1E293B" strokeWidth={4} />

              {/* Đường cong biểu đồ tăng trưởng bùng nổ (Exponential Growth Curve) */}
              <path
                d="M -130,-230 Q -30,-240 10,-310 T 110,-410"
                fill="none"
                stroke="#10B981"
                strokeWidth={7}
                strokeLinecap="round"
              />
              {/* 3 Mốc dữ liệu phát sáng: Mốc 1 (1270, 600), Mốc 2 (1360, 530), Mốc 3 (1440, 460) */}
              <circle cx={-80} cy={-240} r={8} fill="#FACC15" stroke="#FFFFFF" strokeWidth={3} />
              <circle cx={10} cy={-310} r={10} fill="#FACC15" stroke="#FFFFFF" strokeWidth={4} />
              <circle cx={90} cy={-380} r={12} fill="#EF4444" stroke="#FFFFFF" strokeWidth={4} />

              {/* Tiêu đề trên bảng */}
              <text x={0} y={-420} textAnchor="middle" fill="#38BDF8" fontSize={18} fontWeight="900" fontFamily="'Be Vietnam Pro', sans-serif">
                GROWTH PIPELINE V7.1
              </text>
            </g>

            {/* Que chỉ thuyết trình từ tay phải tới mốc dữ liệu */}
            {evaluated.propsState.pointer?.visible && (
              <line
                x1={evaluated.propsState.pointer.x1}
                y1={evaluated.propsState.pointer.y1}
                x2={evaluated.propsState.pointer.x2}
                y2={evaluated.propsState.pointer.y2}
                stroke="#FACC15"
                strokeWidth={5}
                strokeLinecap="round"
              />
            )}
          </g>
        )}

        {/* =====================================================================
            3. VẼ NHÂN VẬT QUA STICKMAN RIG (CHUẨN HOẠT HỌA V6.2)
           ===================================================================== */}
        <StickmanRig state={stickmanState} renderPart="all" />
      </svg>

      {/* =========================================================================
          4. HUD & TITLE CARD OVERLAY (Font Be Vietnam Pro chuẩn 100% tiếng Việt)
         ========================================================================= */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 50,
          background: "rgba(255, 255, 255, 0.96)",
          padding: "20px 32px",
          borderRadius: 20,
          border: "4px solid #141414",
          boxShadow: "0 8px 0 #141414",
          maxWidth: 980,
          fontFamily: "'Be Vietnam Pro', 'Segoe UI', Tahoma, Arial, sans-serif",
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 900, color: "#141414", letterSpacing: "-0.5px" }}>
          {evaluated.hudTitle}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#475569", marginTop: 6, lineHeight: 1.4 }}>
          {evaluated.hudSub}
        </div>
      </div>

      {/* Dải thông số kỹ thuật góc dưới (HUD) */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          left: 50,
          background: "rgba(15, 23, 42, 0.92)",
          color: "#FFFFFF",
          padding: "10px 24px",
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "'Be Vietnam Pro', 'Courier New', monospace",
          display: "flex",
          gap: 20,
          border: "2px solid #38BDF8",
        }}
      >
        <span>FRAME: {frame} / 1080</span>
        <span>THEME: {evaluated.theme}</span>
        <span>ROOT_X: {Math.round(evaluated.rootX)}px</span>
        <span>CROUCH: {Math.round(evaluated.crouchDepth)}px</span>
        <span>LIFT: {Math.round(evaluated.flightLift)}px</span>
        <span>TILT: {Math.round(evaluated.torsoTiltDeg)}°</span>
        <span>FACING: {evaluated.facingFactor.toFixed(2)}</span>
        <span>POSE: {evaluated.rigPose}</span>
      </div>
    </AbsoluteFill>
  );
};
