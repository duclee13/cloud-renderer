import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { StickmanRig } from "../components/character/StickmanRig";
import { DynamicBackground } from "../components/backgrounds/DynamicBackground";
import { Point2D } from "../types/character";
import {
  resolvePendulumLegs,
  cosineSmooth,
  lerp,
} from "../../animscript/motionGraph";

/**
 * Hàm xác định vị trí rootX(f) C1-liên tục trên toàn bộ 960 frames (16.0s @ 60fps)
 * Áp dụng Adaptive Overlap & Dwell Times:
 * - f0 - f200: Walk -> Run -> Takeoff preparation (overlap = 0.35)
 * - f200 - f340: Jump Parabola (f200-f285) -> Landing Cushion 15f dwell (f285-f300, đứng yên tại 1280px) -> Stand 15f (f300-f315) -> Approach apple (f315-f340, 1280 -> 1320px)
 * - f340 - f600: Cúi nhặt (340-375) -> Dwell chạm giữ 15f (375-390 tại 1320px) -> Nhấc & đứng dậy (390-425) -> Dwell đứng thẳng 15f (425-440 tại 1320px) -> Bước tới thùng (440-530, 1320 -> 1430px) -> Đặt táo lên nắp (530-570) -> Dwell giữ nắp 12f (570-582 tại 1430px) -> Tiếp cận quai thùng (582-600 tại 1430px)
 * - f600 - f960: Nâng thùng (600-650 tại 1430px) -> Vừa xoay vừa bước chân (645-710, 1430 -> 1340px) -> Bê thùng bước đều sang trái (710-960, 1340 -> 820px)
 */
export function getShowcaseRootX(f: number): number {
  if (f < 200) {
    const vWalk = 3.6;
    const vRun = 5.2;
    if (f <= 25) {
      const p = f / 25.0;
      return 240.0 + vWalk * (f / 2.0 - (12.5 * Math.sin(p * Math.PI)) / Math.PI);
    } else if (f <= 95) {
      return 240.0 + 45.0 + (f - 25) * vWalk;
    } else if (f <= 125) {
      const p = (f - 95) / 30.0;
      const baseDist = 240.0 + 45.0 + 70 * vWalk;
      const delta = vWalk * (f - 95) + (vRun - vWalk) * ((f - 95) / 2.0 - (15.0 * Math.sin(p * Math.PI)) / Math.PI);
      return baseDist + delta;
    } else if (f <= 180) {
      const baseDist = 240.0 + 45.0 + 70 * vWalk + (125 - 95) * ((vWalk + vRun) / 2.0);
      return baseDist + (f - 125) * vRun;
    } else {
      // f180-f200 (20 frames): Dậm đà bật nhảy tại Takeoff X = 990px!
      const p = (f - 180) / 20.0;
      const startX = 240.0 + 45.0 + 70 * vWalk + (125 - 95) * ((vWalk + vRun) / 2.0) + 55 * vRun;
      return lerp(startX, 990.0, cosineSmooth(p));
    }
  } else if (f < 340) {
    const localF = f - 200;
    if (localF < 85) {
      // f200 - f285: Bay Parabol từ Takeoff X = 990px -> Landing X = 1280px (vượt qua cọc 1150px)
      const t = localF / 85.0;
      return lerp(990.0, 1280.0, t);
    } else if (localF < 115) {
      // f285 - f315: Dwell Time 15f tiếp đất hấp thụ lực + 15f đứng thẳng (đứng yên 100% tại 1280px)
      return 1280.0;
    } else {
      // f315 - f340: Bước tiến lại gần quả táo (1280px -> 1320px)
      const p = (localF - 115) / 25.0;
      return lerp(1280.0, 1320.0, cosineSmooth(p));
    }
  } else if (f < 600) {
    const localF = f - 340;
    if (localF < 100) {
      // f340 - f440: Cúi nhặt (35f) -> Dwell chạm giữ (15f) -> Nhấc đứng lên (35f) -> Dwell đứng thẳng (15f) tại 1320px
      return 1320.0;
    } else if (localF < 190) {
      // f440 - f530 (90 frames): Vừa ôm táo trước ngực vừa bước chân khoan thai tới sát cạnh thùng các-tông (1320px -> 1468px)
      const p = (localF - 100) / 90.0;
      return lerp(1320.0, 1468.0, cosineSmooth(p));
    } else if (localF < 242) {
      // f530 - f582 (52 frames): Đặt táo lên nắp (40f) -> Dwell giữ nắp (12f) tại 1468px
      return 1468.0;
    } else {
      // f582 - f600 (18 frames): Dịch nhẹ vào 1480px khi hạ người nắm quai thùng
      const p = (localF - 242) / 18.0;
      return lerp(1468.0, 1480.0, cosineSmooth(p));
    }
  } else {
    const localF = f - 600;
    if (localF < 45) {
      // f600 - f645: Nâng thùng thẳng đứng tại 1480px
      return 1480.0;
    } else if (localF < 110) {
      // f645 - f710: Vừa xoay người vừa bắt đầu dịch chuyển (1480px -> 1340px)
      const p = (localF - 45) / 65.0;
      return lerp(1480.0, 1340.0, cosineSmooth(p));
    } else {
      // f710 - f960 (250 frames): Bê thùng bước đều đặn, từ tốn sang trái (1340px -> 820px)
      const p = (localF - 110) / 250.0;
      return lerp(1340.0, 820.0, cosineSmooth(p));
    }
  }
}

/**
 * Bộ lọc mượt vận tốc di chuyển 12 frames (Smooth Velocity Filter)
 * Giúp biên độ sải chân và nhấc chân tăng/giảm dần trong 12 frames, triệt tiêu gãy vận tốc
 */
export function getSmoothedSpeed(f: number): number {
  const windowSize = 12;
  const startF = Math.max(0, f - windowSize + 1);
  let sum = 0;
  let count = 0;
  for (let k = startF; k <= f; k++) {
    const prev = k > 0 ? getShowcaseRootX(k - 1) : getShowcaseRootX(0);
    const curr = getShowcaseRootX(k);
    sum += Math.abs(curr - prev);
    count++;
  }
  return count > 0 ? sum / count : 0;
}

/**
 * TestV5ActionsShowcase:
 * Video showcase kiểm thử toàn diện 4 hành động vật lý trên Người Que 6 bộ phận
 * 1. Chân con lắc 1 đoạn thẳng (True 1-Segment Pendulum Gait L = 175px 100%).
 * 2. Tích lũy pha phi liên tục từ |vx|: delta_phi = (|vx| / 42) * PI triệt tiêu hoàn toàn trượt ván.
 * 3. Quỹ đạo nhảy qua hẳn vật cản: Takeoff 1020px -> Apex 1150px (lift 160px) -> Landing 1280px (Vật cản 1150px).
 * 4. Tầm bê thùng hạ ngang bụng: boxBottomY = groundY - 55px (tay không bao giờ đè lên táo).
 */
export const TestV5ActionsShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const groundY = 840;
  const charScale = 0.95;

  // =========================================================================
  // 1. TÍCH LŨY PHA BƯỚC CHÂN LIÊN TỤC THEO QUÃNG ĐƯỜNG (|vx| / 115 * PI)
  // =========================================================================
  let gaitPhase = 0;
  for (let k = 1; k <= frame; k++) {
    const prevX = getShowcaseRootX(k - 1);
    const currX = getShowcaseRootX(k);
    const k_vx = currX - prevX;
    // Tích lũy khi di chuyển trên mặt đất (không tích lũy khi đang bay trên không f200-f285)
    if (Math.abs(k_vx) > 0.08 && !(k >= 200 && k <= 285)) {
      gaitPhase += (Math.abs(k_vx) / 115.0) * Math.PI;
    }
  }

  const rootX = getShowcaseRootX(frame);
  const prevRootX = frame > 0 ? getShowcaseRootX(frame - 1) : rootX;
  const vx = rootX - prevRootX;
  const rootY = groundY;

  let crouchDepth = 0;
  let flightLift = 0;
  let torsoTiltDeg = 0;
  let headTiltDeg = 0;
  let facingFactor = 1.0;

  // Biểu cảm và hiệu ứng bổ trợ
  let eyes: "neutral" | "wide" | "surprised" | "happy" | "closed" = "neutral";
  let eyebrows: "neutral" | "raised" | "inquisitive" | "worried" | "furrowed" = "neutral";
  let mouth: "smile" | "circleOpen" | "line" | "talking" | "gasp" = "smile";
  let pupilGaze: Point2D | undefined = undefined;
  let sweatDrop = false;
  let blush = false;
  let holdingTarget: { leftGrip?: Point2D; rightGrip?: Point2D } | undefined = undefined;

  // Quản lý đạo cụ
  const obstacleVisible = frame < 360;
  const obstacleOpacity = frame >= 320 && frame < 350 ? (350 - frame) / 30 : 1;

  // Quả táo đỏ
  const appleVisible = frame >= 280;
  let appleX = 1380;
  let appleY = groundY;

  // Thùng các-tông (đặt sẵn tại sân khấu từ frame 320)
  const boxBaseX = 1530;
  const boxBaseY = groundY;
  const boxVisible = frame >= 320;
  let boxX = boxBaseX;
  let boxY = boxBaseY;

  let hudTitle = "";
  let hudSub = "";

  // =========================================================================
  // TOÀN CỤC CHUYỂN ĐỘNG C2 & MULTI-CHANNEL CO-ARTICULATION (960 FRAMES = 16.0s)
  // =========================================================================

  // -------------------------------------------------------------------------
  // PHA 1: ĐI BỘ & TĂNG TỐC SANG CHẠY (f0 -> f200 | 0.0s - 3.33s)
  // -------------------------------------------------------------------------
  if (frame < 200) {
    hudTitle = "HÀNH ĐỘNG 1: ĐI BỘ & TĂNG TỐC CHẠY (LOCOMOTION -> LOCOMOTION)";
    hudSub = "Overlap=0.35 giữ đà liên tục, sải bước STRIDE=115px, cắt kéo qua 0° mượt mà";

    facingFactor = 1.0;

    if (frame <= 95) {
      torsoTiltDeg = 0;
    } else if (frame <= 125) {
      const p = (frame - 95) / 30.0;
      torsoTiltDeg = 15 * cosineSmooth(p);
    } else if (frame <= 184) {
      torsoTiltDeg = 15;
    } else {
      // f184-200: Nhún lấy đà (Takeoff Anticipation Squat)
      // Bắt đầu nhún trước điểm Takeoff 16 frames, đạt đỉnh nhún (28px) ĐÚNG TẠI frame Takeoff (f200)
      const t = (frame - 184) / 16.0;
      crouchDepth = 28 * Math.sin(t * (Math.PI / 2));
      torsoTiltDeg = 15 - 3 * t;
    }

    // Biểu cảm
    if (frame > 125) {
      eyes = "wide";
      mouth = "smile";
    }
  }

  // -------------------------------------------------------------------------
  // PHA 2: BẬT NHẢY PARABOL QUA CỌC & HẠ CÁNH HẤP THỤ LỰC (f200 -> f340)
  // -------------------------------------------------------------------------
  else if (frame >= 200 && frame < 340) {
    hudTitle = "HÀNH ĐỘNG 2: NHẢY QUA CỌC & TIẾP ĐẤT HẤP THỤ LỰC (JUMP -> INTERACTION)";
    hudSub = "Đỉnh 175px tại X=1135, giậm nhảy X=990px, tiếp đất 1280px nhún gối hấp thụ lực 27f (overlap=0.0), đứng dậy mới bước";

    facingFactor = 1.0;
    const takeoffFrame = 200;
    const landFrame = 285;

    if (frame < landFrame) {
      // Bay trên không (Flight Arc: f200 - f285, 85 frames)
      const t = (frame - takeoffFrame) / 85.0;
      flightLift = Math.sin(t * Math.PI) * 145; // Đỉnh nhảy 145px tại t=0.5 (vượt vật cản 66px với khoảng trống 79px, mũ không chạm mép trên)

      // torsoTiltDeg quy chuẩn V6.2: Nội suy mượt từ +12° (tại f200) về 0° (tại f235) rồi tăng lên +8° (tại f285)
      // TUYỆT ĐỐI CẤM LẬT NGỬA NGƯỜI ÂM -12°!
      if (frame <= 235) {
        torsoTiltDeg = 12 * (1 - (frame - 200) / 35.0);
      } else {
        torsoTiltDeg = 8 * Math.sin(((frame - 235) / 50.0) * (Math.PI / 2));
      }

      // crouchDepth quy chuẩn V6.2:
      // f200 -> f208: crouchDepth = 28 * Math.cos(((frame - 200) / 8) * (Math.PI / 2)) (tại f200: 28px, tại f204: 20px)
      // f208 -> f281: crouchDepth = 0
      // f281 -> f285: crouchDepth = 18 * Math.sin(((frame - 281) / 4) * (Math.PI / 2)) (tại f285: 18px)
      if (frame <= 208) {
        crouchDepth = 28 * Math.cos(((frame - 200) / 8.0) * (Math.PI / 2));
      } else if (frame >= 281) {
        crouchDepth = 18 * Math.sin(((frame - 281) / 4.0) * (Math.PI / 2));
      } else {
        crouchDepth = 0;
      }

      eyes = "wide";
      eyebrows = "raised";
      mouth = "talking";

      // Ánh mắt đón đầu sớm khi qua đỉnh
      if (frame >= 245) {
        const gt = (frame - 245) / 40.0;
        const egt = cosineSmooth(gt);
        pupilGaze = { x: lerp(0.5, 0.85, egt), y: lerp(0.0, 0.9, egt) };
        headTiltDeg = lerp(0, 6, egt);
      }
    } else if (frame <= 312) {
      // f285 - f312 (27 frames): Tiếp đất hấp thụ lực & hồi phục đứng thẳng
      flightLift = 0;

      // crouchDepth quy chuẩn V6.2:
      // f285 -> f292: crouchDepth = 18 + 18 * Math.sin(((frame - 285) / 7) * (Math.PI / 2)) (đạt đỉnh 36px tại f292)
      // f292 -> f312: crouchDepth = 36 * (0.5 * (1 + Math.cos(((frame - 292) / 20) * Math.PI))) (hồi phục về 0px tại f312)
      if (frame <= 292) {
        crouchDepth = 18 + 18 * Math.sin(((frame - 285) / 7.0) * (Math.PI / 2));
        torsoTiltDeg = 8 + 4 * Math.sin(((frame - 285) / 7.0) * (Math.PI / 2)); // 8° -> 12° tại f292
      } else {
        const rec = 0.5 * (1 + Math.cos(((frame - 292) / 20.0) * Math.PI));
        crouchDepth = 36 * rec;
        torsoTiltDeg = 12 * rec; // 12° -> 0° tại f312
      }

      headTiltDeg = 4.0 * Math.sin(Math.min(1.0, (frame - landFrame) / 27.0) * Math.PI);

      pupilGaze = { x: 0.85, y: 0.8 };
      eyes = frame <= 295 ? "wide" : "neutral";
      eyebrows = frame <= 295 ? "furrowed" : "neutral";
      mouth = frame <= 295 ? "circleOpen" : "smile";
    } else if (frame < 320) {
      // f312 - f320: DWELL TIME STAND RECOVERY - Ổn định tư thế đứng thẳng
      flightLift = 0;
      crouchDepth = 0;
      torsoTiltDeg = 0;
      headTiltDeg = 0;

      pupilGaze = { x: 0.85, y: 0.6 };
      eyes = "neutral";
      eyebrows = "neutral";
      mouth = "smile";
    } else {
      // f320 - f340 (20 frames): Bước tiến lại gần quả táo (1280px -> 1320px)
      flightLift = 0;
      crouchDepth = 0;
      torsoTiltDeg = 0;

      pupilGaze = { x: 0.85, y: 0.7 };
      eyes = "neutral";
      eyebrows = "neutral";
      mouth = "smile";
    }
  }

  // -------------------------------------------------------------------------
  // PHA 3: CÚI NHẶT (DWELL 15f) -> ĐỨNG THẲNG (DWELL 15f) -> ĐẶT TÁO (DWELL 12f) (f340 -> f600)
  // -------------------------------------------------------------------------
  else if (frame >= 340 && frame < 600) {
    hudTitle = "HÀNH ĐỘNG 3: CÚI NHẶT (DWELL 15f) -> ĐỨNG THẲNG (DWELL 15f) -> ĐẶT TÁO (DWELL 12f)";
    hudSub = "Overlap=0.0 giữa các tương tác: Chạm giữ táo 15f tạo sức nặng, đứng thẳng 15f, đặt lên nắp dừng 12f";

    facingFactor = 1.0;
    const localF = frame - 340;

    if (localF < 35) {
      // 1. Cúi người tiếp cận quả táo (f340 - f375, 35 frames)
      const p = localF / 35.0;
      const ep = cosineSmooth(p);
      crouchDepth = 55 * ep;
      torsoTiltDeg = 48 * ep;

      appleX = 1380;
      appleY = groundY;

      const reachX = lerp(1320 + 20, 1380, ep);
      const reachY = lerp(groundY - 100, groundY - 20, ep);
      holdingTarget = {
        rightGrip: { x: reachX, y: reachY },
      };
      pupilGaze = { x: 0.85, y: 0.9 };
      eyes = "neutral";
      mouth = "line";
    } else if (localF < 50) {
      // 2. DWELL TIME 15f (0.25s) CHẠM GIỮ TÁO TRÊN SÀN (f375 - f390): Tạo sức nặng & lực ma sát thực tế!
      crouchDepth = 55;
      torsoTiltDeg = 48;
      appleX = 1380;
      appleY = groundY;
      holdingTarget = {
        rightGrip: { x: appleX, y: appleY - 20 },
      };
      pupilGaze = { x: 0.85, y: 0.95 };
      eyes = "wide";
      eyebrows = "furrowed";
      mouth = "circleOpen";
    } else if (localF < 85) {
      // 3. Nhấc táo lên & Lưng nâng đứng dậy (f390 - f425, 35 frames)
      const lp = (localF - 50) / 35.0;
      const elp = cosineSmooth(lp);

      appleX = lerp(1380, 1320 + 45, elp);
      appleY = lerp(groundY, groundY - 185, elp);

      crouchDepth = 55 * (1 - elp);
      torsoTiltDeg = 48 * (1 - elp);

      holdingTarget = {
        rightGrip: { x: appleX + 12, y: appleY - 15 },
      };
      pupilGaze = { x: 0.85, y: 0.4 };
      eyes = "happy";
      mouth = "smile";
    } else if (localF < 100) {
      // 4. DWELL TIME 15f ĐỨNG THẲNG HOÀN TOÀN (f425 - f440): Ổn định trước khi bước, overlap=0.0!
      crouchDepth = 0;
      torsoTiltDeg = 0;
      appleX = 1320 + 45;
      appleY = groundY - 185;
      // Cầm táo bằng 1 tay phải (rightArm), tay trái rảnh đung đưa tự nhiên
      holdingTarget = {
        rightGrip: { x: appleX + 12, y: appleY - 15 },
      };
      pupilGaze = { x: 0.85, y: 0.2 };
      eyes = "happy";
      eyebrows = "neutral";
      mouth = "smile";
    } else if (localF < 190) {
      // 5. Bước đi khoan thai mang táo tới thùng các-tông (f440 - f530, 90 frames)
      crouchDepth = 0;
      torsoTiltDeg = 0;

      appleX = rootX + 45;
      appleY = groundY - 185 + Math.sin(gaitPhase) * 4;
      // Chỉ khóa IK tay phải cầm táo, tay trái tiếp tục đung đưa tự nhiên theo bước chân
      holdingTarget = {
        rightGrip: { x: appleX + 12, y: appleY - 15 },
      };

      pupilGaze = { x: 0.9, y: 0.2 };
      eyes = "happy";
      mouth = "smile";
    } else if (localF < 230) {
      // 6. Đặt quả táo lên nắp thùng các-tông (f530 - f570, 40 frames): chùng nhẹ gối (14px) và nghiêng thân (+14°) tiến sát nắp thùng
      const pp = (localF - 190) / 40.0;
      const epp = cosineSmooth(pp);

      crouchDepth = 14 * Math.sin(pp * (Math.PI / 2));
      torsoTiltDeg = 14 * Math.sin(pp * (Math.PI / 2));

      const targetLidX = boxBaseX;
      const targetLidY = groundY - 135;
      appleX = lerp(1468 + 45, targetLidX, epp);
      appleY = lerp(groundY - 185, targetLidY, epp);

      holdingTarget = {
        rightGrip: { x: appleX, y: appleY - 20 },
      };
      pupilGaze = { x: 0.8, y: 0.4 };
      eyes = "neutral";
      mouth = "smile";
    } else if (localF < 242) {
      // 7. DWELL TIME 12f TAY GIỮ TRÊN NẮP THÙNG (f570 - f582): Giữ gối 14px & nghiêng +14° cho khuỷu tay cong vừa tầm!
      crouchDepth = 14;
      torsoTiltDeg = 14;
      appleX = boxBaseX;
      appleY = groundY - 135;
      holdingTarget = {
        rightGrip: { x: appleX, y: appleY - 20 },
      };
      pupilGaze = { x: 0.8, y: 0.4 };
      eyes = "neutral";
      mouth = "smile";
    } else {
      // 8. Rút tay & Hạ người dịch vào 1480px tiếp cận 2 quai thùng (f582 - f600, 18 frames)
      const cp = (localF - 242) / 18.0;
      const ecp = cosineSmooth(cp);

      crouchDepth = lerp(14, 45, ecp);
      torsoTiltDeg = lerp(14, 24, ecp);

      appleX = boxBaseX;
      appleY = groundY - 135;

      const leftGripX = lerp(rootX - 20, boxBaseX - 48, ecp);
      const leftGripY = lerp(groundY - 140, boxBaseY - 52, ecp);
      const rightGripX = lerp(boxBaseX, boxBaseX + 48, ecp);
      const rightGripY = lerp(groundY - 135, boxBaseY - 52, ecp);

      holdingTarget = {
        leftGrip: { x: leftGripX, y: leftGripY },
        rightGrip: { x: rightGripX, y: rightGripY },
      };
      pupilGaze = { x: 0.8, y: 0.7 };
      eyes = "wide";
      eyebrows = "furrowed";
      mouth = "circleOpen";
    }
  }

  // -------------------------------------------------------------------------
  // PHA 4: VỪA NÂNG THÙNG + VỪA XOAY NGƯỜI + VỪA BƯỚC ĐI ĐỒNG THỜI (f600 -> f960)
  // -------------------------------------------------------------------------
  else {
    hudTitle = "HÀNH ĐỘNG 4: BÊ THÙNG TIẾN VỀ BÊN TRÁI (FORWARD WALK TO THE LEFT)";
    hudSub = "Xoay mặt sang trái (FACING = -1.00), đầu gối 2 khớp gập tiến về phía trước, bước đi đĩnh đạc về đích";

    const localF = frame - 600;

    if (localF < 110) {
      // 1. Đồng thời Nâng thùng + Xoay người + Bước chân (f600 - f710, 110 frames | Kiểm tra tại f610 & f658)
      const liftP = cosineSmooth(Math.min(1.0, localF / 50.0));
      crouchDepth = lerp(45, 0, liftP);
      torsoTiltDeg = lerp(24, 0, liftP);
      // Quy chuẩn nâng tầm bê thùng lên ngang bụng-ngực: boxBottomY = 745px, Táo trên nắp = 610px!
      const curBoxY = lerp(groundY, 745, liftP);

      // Xoay người: bắt đầu từ f625 (localF = 25, khi thùng nhấc 40%)
      const turnLocalF = Math.max(0.0, localF - 25);
      const turnP = cosineSmooth(Math.min(1.0, turnLocalF / 65.0));
      facingFactor = lerp(1.0, -1.0, turnP); // +1.0 -> 0.0 tại f658 -> -1.0 tại f690

      // Thùng bắt đầu chính xác tại 1530px (1480 + 50) rồi quét qua trước bụng (±62px)
      const boxReachOffset = lerp(50, 62, Math.min(1.0, localF / 25.0));
      boxX = rootX + facingFactor * boxReachOffset;
      boxY = curBoxY;

      // Quả táo nằm chắc trên nắp thùng!
      appleX = boxX;
      appleY = boxY - 135;

      // 2 tay ôm 2 quai cầm bên hông thùng: mở rộng ra x = boxX ± 76 khi xoay chính diện để tay ôm ngoài táo
      const isTurnCenter = Math.abs(facingFactor) <= 0.45;
      const gripSpan = isTurnCenter ? 76 : 48;
      const gripYOffset = isTurnCenter ? 45 : 52;
      holdingTarget = {
        leftGrip: { x: boxX - gripSpan, y: boxY - gripYOffset },
        rightGrip: { x: boxX + gripSpan, y: boxY - gripYOffset },
      };

      pupilGaze = { x: -0.8 * turnP, y: 0.1 };
      eyes = "neutral";
      eyebrows = "furrowed";
      mouth = "line";
    } else {
      // 2. Bê thùng và quả táo bước đi đĩnh đạc sang trái (f710 - f960, 250 frames)
      facingFactor = -1.0;
      crouchDepth = 0;
      torsoTiltDeg = -4; // Ngả nhẹ -4° đối trọng thùng nặng

      // Giảm dần rung lắc ở 40 frames cuối khi dừng lại
      const stopFactor = localF >= 210 ? Math.max(0, (250 - localF) / 40.0) : 1.0;
      const bobbing = Math.sin(gaitPhase) * 4 * stopFactor;

      boxX = rootX - 65;
      boxY = 745 + bobbing; // Đáy thùng tại 745px (cách sàn 95px, lộ rõ đùi và đầu gối 2 khớp)

      // Quả táo nhấp nhô đồng bộ trên nắp thùng!
      appleX = boxX;
      appleY = boxY - 135;

      holdingTarget = {
        leftGrip: { x: boxX - 48, y: boxY - 52 },
        rightGrip: { x: boxX + 48, y: boxY - 52 },
      };

      pupilGaze = { x: -0.9, y: 0.0 };
      eyes = "neutral";
      eyebrows = "neutral";
      mouth = localF >= 210 ? "smile" : "line";
    }
  }

  // =========================================================================
  // TÍNH TOÁN BÀN CHÂN VÀ ĐẦU GỐI CHUẨN SINH CƠ HỌC (L = 175px 100%)
  // =========================================================================
  const smoothedSpeed = getSmoothedSpeed(frame);
  const legs = resolvePendulumLegs(gaitPhase, vx, crouchDepth, flightLift, smoothedSpeed, torsoTiltDeg);
  const leftFootOffset = legs.leftFoot;
  const rightFootOffset = legs.rightFoot;
  const leftKneeOffset = legs.leftKnee;
  const rightKneeOffset = legs.rightKnee;
  const customHipY = legs.hipY;

  // =========================================================================
  // XÁC ĐỊNH POSE STATE CHO STICKMAN RIG
  // =========================================================================

  let rigPose: "standing" | "walking" | "running" | "jumping" | "crouching" = "standing";
  if (flightLift > 15) {
    rigPose = "jumping";
  } else if (crouchDepth > 5 && Math.abs(vx) <= 0.15) {
    rigPose = "crouching";
  } else if (Math.abs(vx) > 4.5) {
    rigPose = "running";
  } else if (Math.abs(vx) > 0.15) {
    rigPose = "walking";
  }

  const walkCycle = (gaitPhase / (2 * Math.PI)) % 1;
  const isCarryingBox = frame >= 600;
  const isFrontFacingTurn = isCarryingBox && Math.abs(facingFactor) <= 0.45;
  const walkWeight = Math.min(1, Math.max(0, smoothedSpeed / 2.0));

  const stickmanState = {
    x: rootX,
    y: rootY,
    scale: charScale,
    facing: (facingFactor >= 0 || isFrontFacingTurn ? "right" : "left") as "left" | "right",
    facingFactor,
    pose: rigPose,
    torsoTiltDeg,
    crouchDepth,
    flightLift,
    walkCycleProgress: walkCycle >= 0 ? walkCycle : 1 + walkCycle,
    walkWeight,
    leftFootOffset,
    rightFootOffset,
    leftKneeOffset,
    rightKneeOffset,
    customHipY,
    limbAngles: {
      head: headTiltDeg,
    },
    eyes,
    eyebrows,
    mouth,
    pupilGaze,
    blush,
    sweatDrop,
    holdingTarget,
    hat: true,
    archetype: "oldMan" as const,
  };

  // =========================================================================
  // SVG RENDER ELEMENTS: BOX & APPLE
  // =========================================================================

  const boxElement = boxVisible ? (
    <g id="prop-cardboard-box" transform={`translate(${boxX}, ${boxY})`}>
      {boxY >= groundY - 30 && (
        <ellipse
          cx={0}
          cy={2}
          rx={105}
          ry={14}
          fill="rgba(0,0,0,0.2)"
          opacity={Math.max(0, 1 - (groundY - boxY) / 120)}
        />
      )}
      {/* Thân hộp các-tông cel-shading */}
      <rect
        x={-80}
        y={-135}
        width={160}
        height={135}
        rx={10}
        fill="#D97706"
        stroke="#141414"
        strokeWidth={10}
      />
      {/* Mảng đổ bóng cel-shading bên phải */}
      <path d="M 8,-135 L 80,-135 L 80,0 L 8,0 Z" fill="#92400E" opacity={0.25} />
      {/* Đường gân nắp hộp */}
      <line x1={-80} y1={-105} x2={80} y2={-105} stroke="#141414" strokeWidth={6} />
      {/* Băng dính vàng ở chính giữa x in [-18, +18] */}
      <rect x={-18} y={-135} width={36} height={135} fill="#FDE047" stroke="#141414" strokeWidth={5} />
      {/* 2 Lỗ Tay Cầm Bên Hông chuẩn tọa độ x = -48 và x = +48, y = -52 */}
      <rect x={-48 - 9} y={-52 - 7} width={18} height={14} rx={6} fill="#78350F" stroke="#141414" strokeWidth={5} />
      <rect x={48 - 9} y={-52 - 7} width={18} height={14} rx={6} fill="#78350F" stroke="#141414" strokeWidth={5} />
      {/* Mũi tên hướng lên */}
      <path
        d="M -48,-32 L -48,-16 M -54,-24 L -48,-32 L -42,-24"
        fill="none"
        stroke="#141414"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 48,-32 L 48,-16 M 42,-24 L 48,-32 L 54,-24"
        fill="none"
        stroke="#141414"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  ) : null;

  const appleElement = appleVisible ? (
    <g id="prop-apple" transform={`translate(${appleX}, ${appleY}) scale(0.78)`}>
      {/* Bóng đổ chạm đất hoặc trên nắp thùng */}
      {appleY >= groundY - 25 && (
        <ellipse cx={0} cy={2} rx={22} ry={7} fill="rgba(0,0,0,0.22)" />
      )}
      {/* Quả táo đỏ */}
      <circle cx={0} cy={-20} r={20} fill="#EF4444" stroke="#141414" strokeWidth={8} />
      {/* Cuống và lá */}
      <path d="M 0,-40 Q 5,-48 9,-50" fill="none" stroke="#78350F" strokeWidth={5} strokeLinecap="round" />
      <path d="M 4,-46 Q 16,-48 14,-38 Q 8,-38 4,-46 Z" fill="#22C55E" stroke="#141414" strokeWidth={4} />
    </g>
  ) : null;

  return (
    <AbsoluteFill style={{ width, height, overflow: "hidden", backgroundColor: "#F7F3EE" }}>
      {/* Nạp font hỗ trợ tiếng Việt đầy đủ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@600;700;800;900&display=swap');
      `}</style>

      {/* 1. Nền Studio kẻ ngang ấm áp (Lined Paper) */}
      <DynamicBackground preset="linedPaper" />

      {/* 2. SVG Sân khấu 2D */}
      <svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0 }}>
        {/* Đường sàn tiếp xúc */}
        <line x1={0} y1={groundY} x2={width} y2={groundY} stroke="#334155" strokeWidth={4} opacity={0.35} />

        {/* =========================================================================
            ĐẠO CỤ 1: VẬT CẢN NHẢY (Đặt tại X = 1150px, vùng cấm 1100-1200px)
           ========================================================================= */}
        {obstacleVisible && (
          <g id="jump-obstacle" transform={`translate(1150, ${groundY})`} opacity={obstacleOpacity}>
            <ellipse cx={0} cy={0} rx={48} ry={12} fill="rgba(0,0,0,0.18)" />
            <path
              d="M -42,0 C -45,-38 -25,-64 0,-66 C 26,-68 48,-38 42,0 Z"
              fill="#94A3B8"
              stroke="#141414"
              strokeWidth={10}
              strokeLinejoin="round"
            />
            <path
              d="M -16,-62 C 0,-64 22,-52 28,-30 L 16,0 L -30,0 Z"
              fill="#64748B"
              opacity={0.35}
            />
            <text
              x={0}
              y={-78}
              textAnchor="middle"
              fill="#334155"
              fontSize={18}
              fontWeight="800"
              fontFamily="'Be Vietnam Pro', 'Segoe UI', Tahoma, Arial, sans-serif"
            >
              VẬT CẢN (66px)
            </text>
          </g>
        )}

        {/* =========================================================================
            PHÂN LỚP 4 TẦNG CEL-SHADING & SỬA LỖI Z-INDEX:
            - Thân (Torso), Đầu, Chân LUÔN Ở LAYER 2 (SAU THÙNG CÁC-TÔNG)
            - Thùng các-tông và Quả táo ở LAYER 3
            - Cánh tay ôm quai thùng ở LAYER 4 (TRƯỚC MẶT THÙNG)
           ========================================================================= */}
        {isCarryingBox ? (
          <>
            {/* Lớp 1 (Sau cùng): Tay xa (nếu quay nghiêng) */}
            {!isFrontFacingTurn && (
              <StickmanRig state={stickmanState} renderPart="backArmOnly" />
            )}

            {/* Lớp 2: Đầu, Thân và 2 Chân nhân vật (LUÔN Ở SAU THÙNG CÁC-TÔNG) */}
            <StickmanRig state={stickmanState} renderPart="bodyOnly" />

            {/* Lớp 3: Thùng các-tông & Quả táo trên nắp thùng */}
            {boxElement}
            {appleElement}

            {/* Lớp 4 (Trên cùng): 
                - Nếu đang xoay qua trước bụng (|facingFactor| <= 0.45): CẢ 2 TAY (frontArmsBoth) vươn từ vai ôm 2 quai cầm!
                - Nếu quay nghiêng: Chỉ vẽ Tay gần (quai gần) ở phía ngoài mặt thùng */}
            <StickmanRig
              state={stickmanState}
              renderPart={isFrontFacingTurn ? "frontArmsBoth" : "frontArmOnly"}
            />
          </>
        ) : (
          <>
            {/* Hành động 1, 2, 3: Vẽ nhân vật và các đạo cụ theo thứ tự tự nhiên */}
            <StickmanRig state={stickmanState} renderPart="all" />
            {boxElement}
            {appleElement}
          </>
        )}
      </svg>

      {/* =========================================================================
          HUD & TITLE CARD OVERLAY (Font Be Vietnam Pro chuẩn 100% tiếng Việt)
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
          maxWidth: 960,
          fontFamily: "'Be Vietnam Pro', 'Segoe UI', Tahoma, Arial, sans-serif",
        }}
      >
        <div style={{ fontSize: 26, fontWeight: 900, color: "#141414", letterSpacing: "-0.5px" }}>
          {hudTitle}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#475569", marginTop: 6, lineHeight: 1.4 }}>
          {hudSub}
        </div>
      </div>

      {/* Thông số kỹ thuật góc dưới */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          left: 50,
          background: "rgba(20, 20, 20, 0.9)",
          color: "#FFFFFF",
          padding: "10px 24px",
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "'Be Vietnam Pro', 'Courier New', monospace",
          display: "flex",
          gap: 24,
        }}
      >
        <span>FRAME: {frame} / 960</span>
        <span>ROOT_X: {Math.round(rootX)}px</span>
        <span>CROUCH: {Math.round(crouchDepth)}px</span>
        <span>LIFT: {Math.round(flightLift)}px</span>
        <span>TILT: {Math.round(torsoTiltDeg)}°</span>
        <span>FACING: {facingFactor.toFixed(2)}</span>
        <span>APPLE: ({Math.round(appleX)}, {Math.round(appleY)})</span>
        <span>BOX: ({Math.round(boxX)}, {Math.round(boxY)})</span>
      </div>
    </AbsoluteFill>
  );
};
