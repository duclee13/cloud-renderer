/**
 * AnimScript Remotion Composition
 * Generic renderer executing any AnimScript IR through the runtime evaluator.
 * Completely deterministic, camera-aware, multi-layer depth occlusion, Vietnamese typography.
 */

import React from "react";
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { AnimScriptIR, EvaluatedObjectState } from "../../animscript/types";
import { evaluateFrame } from "../../animscript/runtime";
import { calculateCharacterAnchors, PROP_REGISTRY } from "../../animscript/registry/assetRegistry";
import { StickmanRig } from "../components/character/StickmanRig";
import { SpeechBubble } from "../components/ui/SpeechBubble";
import { DynamicBackground } from "../components/backgrounds/DynamicBackground";

export interface AnimScriptSceneProps {
  ir: AnimScriptIR;
  showDebugMarkers?: boolean;
}

export const AnimScriptScene: React.FC<AnimScriptSceneProps> = ({ ir, showDebugMarkers = false }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  if (!ir || !ir.scenes || ir.scenes.length === 0) {
    return (
      <AbsoluteFill style={{ backgroundColor: "#1e1e24", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
        AnimScript: Không có dữ liệu cảnh để hiển thị.
      </AbsoluteFill>
    );
  }

  // Pure function evaluation per frame
  const state = evaluateFrame(ir, frame, fps);

  // Camera transform calculations
  const cx = state.camera.x;
  const cy = state.camera.y;
  const zoom = state.camera.zoom;
  const stageTranslateX = width / 2 - cx * zoom;
  const stageTranslateY = height / 2 - cy * zoom;

  // Separate objects into depth layers
  const objectsList = Object.values(state.objects);
  const bgObj = objectsList.find((obj) => obj.kind === "background");
  const backObjects = objectsList.filter((obj) => obj.layerSplits?.behindDesk && obj.kind !== "background");
  const midObjects = objectsList.filter((obj) => !obj.layerSplits?.behindDesk && obj.kind === "prop");
  const frontCharacters = objectsList.filter((obj) => !obj.layerSplits?.behindDesk && obj.kind === "character");

  return (
    <AbsoluteFill style={{ backgroundColor: "#F7F3EE", overflow: "hidden", fontFamily: "system-ui, sans-serif" }}>
      {/* Camera Rigged Stage Layer */}
      <div
        style={{
          position: "absolute",
          width,
          height,
          transform: `translate(${stageTranslateX}px, ${stageTranslateY}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {/* Layer 0: Background & Floor */}
        {bgObj ? (
          <DynamicBackground preset={bgObj.assetType} />
        ) : (
          <svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
            {/* Base Floor Line at y=850 */}
            <line x1={-1000} y1={850} x2={width + 1000} y2={850} stroke="#D4C5B0" strokeWidth={3} />
            <rect x={-1000} y={852} width={width + 2000} height={400} fill="#ECE5DA" />
          </svg>
        )}

        {/* Layer 1: Behind-desk Objects (e.g. Chair, Seated Character Body & Full 2-segment Legs) */}
        {backObjects.map((obj) => (
          <RenderSceneObject
            key={`back_${obj.id}`}
            obj={obj}
            frame={frame}
            renderPart={obj.layerSplits?.handsFront ? "bodyOnly" : "all"}
            showDebugMarkers={showDebugMarkers}
          />
        ))}

        {/* Layer 2: Props (Desk, Floor Props) */}
        {midObjects.map((obj) => (
          <RenderSceneObject key={`mid_${obj.id}`} obj={obj} frame={frame} showDebugMarkers={showDebugMarkers} />
        ))}

        {/* Layer 3: Front Characters (Standing Characters) */}
        {frontCharacters.map((obj) => (
          <RenderSceneObject key={`front_${obj.id}`} obj={obj} frame={frame} renderPart="all" showDebugMarkers={showDebugMarkers} />
        ))}

        {/* Layer 3B: Front Arms for Seated Character (Exact 2-segment arms with shoulder, elbow, wrist/hand) */}
        {backObjects.map((obj) => {
          if (obj.kind === "character" && obj.layerSplits?.handsFront) {
            return (
              <RenderSceneObject
                key={`hands_${obj.id}`}
                obj={obj}
                frame={frame}
                renderPart="armsOnly"
                showDebugMarkers={showDebugMarkers}
              />
            );
          }
          return null;
        })}

        {/* Physical Prop Labels attached to objects */}
        {state.activePropLabels.map((lbl) => {
          const propObj = state.objects[lbl.propId];
          if (!propObj) return null;
          const lx = propObj.transform.x;
          const ly = propObj.transform.y - (propObj.props?.height || 200) * 0.5;
          return (
            <div
              key={lbl.id}
              style={{
                position: "absolute",
                left: lx,
                top: ly,
                transform: "translate(-50%, -50%)",
                backgroundColor: "#ffffff",
                border: "2px solid #E11D48",
                borderRadius: 6,
                padding: "3px 14px",
                fontSize: 22,
                fontWeight: 800,
                color: "#E11D48",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                pointerEvents: "none",
                zIndex: 35,
              }}
            >
              {lbl.text}
            </div>
          );
        })}

        {/* Speech Bubbles */}
        {state.activeSpeechBubbles.length > 0 && (
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              overflow: "visible",
              pointerEvents: "none",
              zIndex: 50,
            }}
          >
            {state.activeSpeechBubbles.map((bubble) => {
              const char = state.objects[bubble.characterId];
              const isFacingLeft = char?.pose?.facing === "left";
              const bx = (char?.transform.x ?? width / 2) + (isFacingLeft ? -220 : 220);
              const by = (char?.transform.y ?? 850) - 700;
              return (
                <SpeechBubble
                  key={bubble.id}
                  text={bubble.text}
                  x={bx}
                  y={by}
                  tailAnchor={{ x: isFacingLeft ? 120 : -120, y: 140 }}
                />
              );
            })}
          </svg>
        )}
        {/* Debug Markers Layer (Active when showDebugMarkers=true) */}
        {showDebugMarkers && (
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              overflow: "visible",
              pointerEvents: "none",
              zIndex: 90,
            }}
          >
            {/* Markers for characters */}
            {objectsList
              .filter((obj) => obj.kind === "character")
              .map((char) => {
                const anchors = calculateCharacterAnchors(
                  char.transform.x,
                  char.transform.y,
                  char.props?.height || 600,
                  char.pose?.facing || "right",
                  char.pose
                );
                return (
                  <g key={`dbg_char_${char.id}`}>
                    {Object.entries(anchors).map(([name, pt]) => {
                      const isKey = ["right_hand", "left_hand", "pelvis", "right_knee", "left_knee", "right_ankle", "left_ankle"].includes(name);
                      const color = isKey ? "#EF4444" : "#3B82F6";
                      return (
                        <g key={name} transform={`translate(${pt.x}, ${pt.y})`}>
                          <circle r={isKey ? 5 : 3} fill="none" stroke={color} strokeWidth={2} />
                          <line x1={-7} y1={0} x2={7} y2={0} stroke={color} strokeWidth={1} />
                          <line x1={0} y1={-7} x2={0} y2={7} stroke={color} strokeWidth={1} />
                          {isKey && (
                            <text
                              x={8}
                              y={4}
                              fontSize={11}
                              fill={color}
                              fontWeight="bold"
                              fontFamily="monospace"
                              style={{ textShadow: "1px 1px 2px #fff, -1px -1px 2px #fff" }}
                            >
                              {name} ({pt.x.toFixed(0)}, {pt.y.toFixed(0)})
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </g>
                );
              })}

            {/* Markers for props */}
            {objectsList
              .filter((obj) => obj.kind === "prop")
              .map((prop) => {
                const def = PROP_REGISTRY[prop.assetType];
                const w = prop.props?.width || def?.defaultWidth || 100;
                const h = prop.props?.height || def?.defaultHeight || 100;
                const anchors = def?.anchors || {};
                return (
                  <g key={`dbg_prop_${prop.id}`}>
                    {/* Bounding box outline */}
                    <rect
                      x={prop.transform.x - w / 2}
                      y={prop.transform.y - h}
                      width={w}
                      height={h}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                      opacity={0.6}
                    />
                    {Object.entries(anchors).map(([name, fn]) => {
                      const offset = fn(w, h);
                      const ax = prop.transform.x + offset.x;
                      const ay = prop.transform.y + offset.y;
                      return (
                        <g key={name} transform={`translate(${ax}, ${ay})`}>
                          <circle r={4} fill="#10B981" stroke="#FFFFFF" strokeWidth={1.5} />
                          <line x1={-6} y1={0} x2={6} y2={0} stroke="#059669" strokeWidth={1} />
                          <line x1={0} y1={-6} x2={0} y2={6} stroke="#059669" strokeWidth={1} />
                          <text
                            x={7}
                            y={-3}
                            fontSize={11}
                            fill="#065F46"
                            fontWeight="bold"
                            fontFamily="monospace"
                            style={{ textShadow: "1px 1px 2px #fff, -1px -1px 2px #fff" }}
                          >
                            {prop.id}.{name} ({ax.toFixed(0)}, {ay.toFixed(0)})
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
          </svg>
        )}
      </div>

      {/* Screen Space Layer (Fixed, Unaffected by Camera Zoom) */}
      {/* Subtitles: Max 2 lines, Safe bottom area */}
      {state.activeSubtitles.map((sub) => (
        <div
          key={sub.id}
          style={{
            position: "absolute",
            bottom: 48,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(18, 18, 22, 0.88)",
            color: "#FFFFFF",
            padding: "14px 32px",
            borderRadius: 14,
            fontSize: 27,
            fontWeight: 600,
            lineHeight: 1.4,
            textAlign: "center",
            maxWidth: 1200,
            boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
            border: "1px solid rgba(255,255,255,0.15)",
            zIndex: 100,
          }}
        >
          {sub.text}
        </div>
      ))}

      {/* Debug HUD (Screen-space overlay) */}
      {showDebugMarkers && (
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            backgroundColor: "rgba(15, 23, 42, 0.85)",
            color: "#38BDF8",
            fontFamily: "monospace",
            fontSize: 16,
            padding: "10px 18px",
            borderRadius: 8,
            border: "1px solid rgba(56, 189, 248, 0.4)",
            zIndex: 200,
            lineHeight: 1.5,
          }}
        >
          <div><strong>DEBUG HUD</strong></div>
          <div>Frame: {frame} | Time: {(frame / fps).toFixed(2)}s</div>
          <div>Camera: ({cx.toFixed(0)}, {cy.toFixed(0)}) @ {zoom.toFixed(2)}x</div>
          <div>Objects: {objectsList.length}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ============================================================================
// OBJECT RENDERERS
// ============================================================================

const RenderSceneObject: React.FC<{
  obj: EvaluatedObjectState;
  frame: number;
  renderPart?: "all" | "bodyOnly" | "armsOnly";
  showDebugMarkers?: boolean;
}> = ({ obj, frame, renderPart = "all", showDebugMarkers = false }) => {
  const { transform, kind, assetType, pose, props } = obj;

  if (kind === "character") {
    const isSitting = Boolean(pose?.isSitting);
    const scale = ((props?.height || 600) / 600) * (transform.scaleX || 1.0);
    return (
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
          pointerEvents: "none",
          opacity: transform.opacity,
        }}
      >
        <StickmanRig
          renderPart={renderPart}
          showDebugMarkers={showDebugMarkers}
          state={{
            x: transform.x,
            y: transform.y,
            facing: pose?.facing || "right",
            scale,
            pose: isSitting ? "sittingBehindDesk" : "standing",
            seatedHipY: pose?.sittingHipY !== undefined 
              ? pose.sittingHipY 
              : (pose?.crouchDepth ? -310 + pose.crouchDepth : (isSitting ? -180 : undefined)),
            isSpeaking: pose?.mouthOpen,
            eyes: (pose as any)?.eyes,
            eyebrows: (pose as any)?.eyebrows,
            mouth: (pose as any)?.mouth,
            pupilGaze: pose?.eyeGaze,
            limbAngles: pose?.limbAngles,
            hat: props?.hat !== undefined ? props.hat : true,
            archetype: props?.archetype || (pose as any)?.archetype,
            showDebugMarkers,
          }}
        />
      </svg>
    );
  }

  // Render Prop by assetType
  return (
    <div
      style={{
        position: "absolute",
        left: transform.x,
        top: transform.y,
        transform: `translate(-50%, -100%) rotate(${transform.rotationDeg}deg) scale(${transform.scaleX}, ${transform.scaleY})`,
        opacity: transform.opacity,
        pointerEvents: "none",
      }}
    >
      <PropGraphic assetType={assetType} width={props?.width} height={props?.height} frame={frame} />
    </div>
  );
};

const PropGraphic: React.FC<{ assetType: string; width?: number; height?: number; frame: number }> = ({
  assetType,
  width = 200,
  height = 200,
  frame,
}) => {
  switch (assetType) {
    case "desk": {
      const w = width || 800;
      const h = height || 450;
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          {/* Back legs */}
          <rect x={w * 0.12} y={h * 0.4} width={18} height={h * 0.6} fill="#78350F" />
          <rect x={w * 0.85} y={h * 0.4} width={18} height={h * 0.6} fill="#78350F" />
          {/* Front Apron */}
          <rect x={w * 0.08} y={h * 0.4} width={w * 0.84} height={28} fill="#92400E" rx={4} />
          {/* Front legs */}
          <rect x={w * 0.08} y={h * 0.4} width={22} height={h * 0.6} fill="#B45309" />
          <rect x={w * 0.89} y={h * 0.4} width={22} height={h * 0.6} fill="#B45309" />
          {/* Top Surface */}
          <rect x={0} y={h * 0.35} width={w} height={24} fill="#D97706" rx={6} stroke="#78350F" strokeWidth={3} />
        </svg>
      );
    }

    case "chair": {
      const w = width || 220;
      const h = height || 400;
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          {/* Profile Chair (Nhìn nghiêng chuẩn xác, tựa lưng bên trái, mặt ngồi thoáng) */}
          {/* Back leg (chân sau) */}
          <rect x={w * 0.12} y={h * 0.56} width={16} height={h * 0.44} fill="#78350F" />
          {/* Front leg (chân trước) */}
          <rect x={w * 0.78} y={h * 0.56} width={16} height={h * 0.44} fill="#B45309" />
          {/* Lower horizontal stretcher (thanh giằng ngang nối 2 chân) */}
          <rect x={w * 0.14} y={h * 0.75} width={w * 0.66} height={10} fill="#78350F" rx={2} />
          {/* Seat slab (Mặt ngồi phẳng nhìn nghiêng) */}
          <rect x={w * 0.1} y={h * 0.53} width={w * 0.76} height={18} fill="#D97706" rx={4} stroke="#78350F" strokeWidth={2.5} />
          {/* Vertical backrest post (Cột tựa lưng đứng độc lập bên trái, không cắt ngang thân) */}
          <rect x={w * 0.12} y={h * 0.08} width={16} height={h * 0.47} fill="#92400E" rx={3} />
          <rect x={w * 0.08} y={h * 0.06} width={24} height={16} fill="#B45309" rx={3} stroke="#78350F" strokeWidth={1.5} />
        </svg>
      );
    }

    case "tray": {
      const w = width || 240;
      const h = height || 40;
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          {/* Tray base platter */}
          <rect x={w * 0.08} y={h * 0.45} width={w * 0.84} height={h * 0.45} rx={6} fill="#D97706" stroke="#78350F" strokeWidth={3} />
          {/* Inner surface inlay */}
          <rect x={w * 0.12} y={h * 0.48} width={w * 0.76} height={h * 0.22} rx={3} fill="#FDE68A" />
          {/* Left handle */}
          <path d={`M ${w * 0.08} ${h * 0.55} Q ${w * 0.01} ${h * 0.4} ${w * 0.08} ${h * 0.25}`} fill="none" stroke="#78350F" strokeWidth={4} strokeLinecap="round" />
          {/* Right handle */}
          <path d={`M ${w * 0.92} ${h * 0.55} Q ${w * 0.99} ${h * 0.4} ${w * 0.92} ${h * 0.25}`} fill="none" stroke="#78350F" strokeWidth={4} strokeLinecap="round" />
        </svg>
      );
    }

    case "apple": {
      const w = width || 40;
      const h = height || 40;
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          {/* Apple stem */}
          <path d={`M ${w * 0.5} ${h * 0.25} Q ${w * 0.55} ${h * 0.1} ${w * 0.65} ${h * 0.05}`} fill="none" stroke="#78350F" strokeWidth={2.5} strokeLinecap="round" />
          {/* Green leaf */}
          <path d={`M ${w * 0.55} ${h * 0.15} Q ${w * 0.75} ${h * 0.12} ${w * 0.7} ${h * 0.22} Z`} fill="#22C55E" />
          {/* Apple body */}
          <ellipse cx={w * 0.4} cy={h * 0.6} rx={w * 0.32} ry={h * 0.35} fill="#EF4444" />
          <ellipse cx={w * 0.6} cy={h * 0.6} rx={w * 0.32} ry={h * 0.35} fill="#DC2626" />
          <circle cx={w * 0.32} cy={h * 0.48} r={3} fill="#FCA5A5" opacity={0.6} />
        </svg>
      );
    }

    case "cup": {
      const w = width || 60;
      const h = height || 90;
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          {/* Handle */}
          <path d={`M ${w * 0.75} ${h * 0.3} Q ${w * 1.05} ${h * 0.55} ${w * 0.75} ${h * 0.8}`} fill="none" stroke="#0284C7" strokeWidth={7} strokeLinecap="round" />
          {/* Body */}
          <rect x={w * 0.15} y={h * 0.2} width={w * 0.65} height={h * 0.75} rx={8} fill="#38BDF8" stroke="#0369A1" strokeWidth={3} />
          {/* Coffee line inside */}
          <ellipse cx={w * 0.475} cy={h * 0.25} rx={w * 0.28} ry={5} fill="#78350F" />
        </svg>
      );
    }

    case "jar": {
      const w = width || 140;
      const h = height || 200;
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          {/* Cap */}
          <rect x={w * 0.15} y={h * 0.05} width={w * 0.7} height={h * 0.12} rx={6} fill="#F97316" stroke="#C2410C" strokeWidth={3} />
          {/* Glass body */}
          <rect x={w * 0.08} y={h * 0.17} width={w * 0.84} height={h * 0.8} rx={14} fill="rgba(224, 242, 254, 0.55)" stroke="#38BDF8" strokeWidth={4} />
          {/* Glass shine highlights */}
          <path d={`M ${w * 0.16} ${h * 0.25} L ${w * 0.16} ${h * 0.85}`} stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" opacity={0.7} />
        </svg>
      );
    }

    case "laptop": {
      const w = width || 180;
      const h = height || 110;
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          {/* Screen */}
          <rect x={w * 0.1} y={0} width={w * 0.8} height={h * 0.75} rx={6} fill="#1E293B" stroke="#0F172A" strokeWidth={3} />
          <rect x={w * 0.14} y={h * 0.06} width={w * 0.72} height={h * 0.62} rx={3} fill="#0284C7" />
          {/* Keyboard base */}
          <rect x={0} y={h * 0.75} width={w} height={h * 0.22} rx={4} fill="#475569" stroke="#334155" strokeWidth={2} />
          <rect x={w * 0.15} y={h * 0.8} width={w * 0.7} height={h * 0.1} rx={2} fill="#0F172A" />
        </svg>
      );
    }

    case "lamp": {
      const w = width || 140;
      const h = height || 220;
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          {/* Base */}
          <ellipse cx={w * 0.4} cy={h * 0.95} rx={w * 0.3} ry={10} fill="#EAB308" stroke="#CA8A04" strokeWidth={3} />
          {/* Arm */}
          <path d={`M ${w * 0.4} ${h * 0.9} Q ${w * 0.2} ${h * 0.5} ${w * 0.7} ${h * 0.25}`} fill="none" stroke="#CA8A04" strokeWidth={6} strokeLinecap="round" />
          {/* Shade */}
          <path d={`M ${w * 0.6} ${h * 0.15} L ${w * 0.95} ${h * 0.32} L ${w * 0.65} ${h * 0.42} Z`} fill="#FACC15" stroke="#A16207" strokeWidth={3} />
          {/* Warm volumetric glow */}
          <polygon points={`${w * 0.75},${h * 0.32} ${w * 0.4},${h * 0.98} ${w * 1.4},${h * 0.98}`} fill="rgba(254, 240, 138, 0.22)" />
        </svg>
      );
    }

    case "metabolic_clock":
    case "clock": {
      const w = width || 260;
      const h = height || 260;
      // Needle rotation logic: oscillates gently or rotates down
      const needleDeg = -35 + Math.sin(frame * 0.05) * 20;
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          <circle cx={w / 2} cy={h / 2} r={w * 0.46} fill="#FFFFFF" stroke="#0F172A" strokeWidth={7} />
          {/* Gauge arcs */}
          <path d={`M ${w * 0.15} ${h * 0.5} A ${w * 0.35} ${h * 0.35} 0 0 1 ${w * 0.5} ${h * 0.15}`} fill="none" stroke="#22C55E" strokeWidth={12} strokeLinecap="round" />
          <path d={`M ${w * 0.5} ${h * 0.15} A ${w * 0.35} ${h * 0.35} 0 0 1 ${w * 0.85} ${h * 0.5}`} fill="none" stroke="#EF4444" strokeWidth={12} strokeLinecap="round" />
          {/* Needle */}
          <g transform={`translate(${w / 2}, ${h / 2}) rotate(${needleDeg})`}>
            <line x1={0} y1={0} x2={0} y2={-w * 0.34} stroke="#DC2626" strokeWidth={5} strokeLinecap="round" />
            <circle cx={0} cy={0} r={9} fill="#0F172A" />
          </g>
        </svg>
      );
    }

    case "spider": {
      const w = width || 70;
      const h = height || 50;
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          {/* Spider 8 legs */}
          <path d="M 15 25 Q 5 10 0 25 M 18 25 Q 10 5 8 35 M 52 25 Q 60 5 62 35 M 55 25 Q 65 10 70 25" fill="none" stroke="#854D0E" strokeWidth={3.5} strokeLinecap="round" />
          {/* Body */}
          <circle cx={35} cy={25} r={14} fill="#A16207" stroke="#713F12" strokeWidth={3} />
          {/* Big cute eyes */}
          <circle cx={30} cy={22} r={3.5} fill="#FFFFFF" />
          <circle cx={30} cy={22} r={1.8} fill="#000000" />
          <circle cx={40} cy={22} r={3.5} fill="#FFFFFF" />
          <circle cx={40} cy={22} r={1.8} fill="#000000" />
        </svg>
      );
    }

    case "window": {
      const w = width || 400;
      const h = height || 320;
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          {/* Outer Frame */}
          <rect x={0} y={0} width={w} height={h} fill="#0F172A" stroke="#334155" strokeWidth={8} rx={6} />
          {/* Moon & Stars */}
          <circle cx={w * 0.72} cy={h * 0.3} r={28} fill="#FDE047" />
          <circle cx={w * 0.78} cy={h * 0.28} r={24} fill="#0F172A" />
          <circle cx={w * 0.25} cy={h * 0.2} r={2.5} fill="#FFFFFF" opacity={0.8} />
          <circle cx={w * 0.4} cy={h * 0.45} r={2} fill="#FFFFFF" opacity={0.7} />
          {/* Window pane crosses */}
          <line x1={w / 2} y1={0} x2={w / 2} y2={h} stroke="#475569" strokeWidth={6} />
          <line x1={0} y1={h / 2} x2={w} y2={h / 2} stroke="#475569" strokeWidth={6} />
        </svg>
      );
    }

    case "meadow": {
      const w = width || 1920;
      const h = height || 200;
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          <rect x={0} y={0} width={w} height={h} fill="#16A34A" />
          {/* Grass blade tufts */}
          <path d={`M 100 0 L 110 -15 L 120 0 M 350 0 L 360 -18 L 370 0 M 700 0 L 712 -16 L 724 0 M 1100 0 L 1110 -20 L 1120 0 M 1500 0 L 1515 -17 L 1530 0`} stroke="#15803D" strokeWidth={4} strokeLinecap="round" />
        </svg>
      );
    }

    default:
      return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <rect x={0} y={0} width={width} height={height} fill="#94A3B8" stroke="#475569" strokeWidth={3} rx={8} />
          <text x={width / 2} y={height / 2} textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize={16} fontWeight="bold">
            {assetType}
          </text>
        </svg>
      );
  }
};
