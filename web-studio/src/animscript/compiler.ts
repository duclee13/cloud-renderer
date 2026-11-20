/**
 * AnimScript v0.1 Compiler
 * Compiles parsed AST into deterministic intermediate representation (IR).
 * Performs symbol checking, anchor validation, cycle detection, and action conflict verification.
 */

import {
  ProgramNode,
  StatementNode,
  WithSceneStatementNode,
  WithSequenceStatementNode,
  WithParallelStatementNode,
  AssignmentStatementNode,
  ExpressionStatementNode,
  ExpressionNode,
  CallExpressionNode,
  PropertyAccessNode,
  IdentifierNode,
  CoordinateLiteralNode,
  BinaryExpressionNode,
} from "./ast";
import {
  AnimScriptIR,
  SceneIR,
  SceneObjectIR,
  ActionClipIR,
  ActionType,
  CompilerDiagnostic,
  VideoConfig,
  Vector2,
} from "./types";
import {
  PROP_REGISTRY,
  HUMANOID_RIG,
  calculateCharacterAnchors,
} from "./registry/assetRegistry";

const VALID_COMMANDS = new Set([
  "video",
  "place",
  "align",
  "narrate",
  "say",
  "label_prop",
  "camera_focus",
  "camera_reset",
  "wait",
  "move",
  "rotate",
  "follow",
  "unfollow",
  "walk",
  "jump",
  "look_at",
  "reach",
  "grab",
  "release",
  "put_down",
  "sit",
  "stand",
  "run",
  "pickup",
]);

export class Compiler {
  private diagnostics: CompilerDiagnostic[] = [];
  private videoConfig: VideoConfig = { width: 1920, height: 1080, fps: 60 };

  constructor() {}

  public compile(program: ProgramNode): AnimScriptIR {
    this.diagnostics = [];
    const scenes: SceneIR[] = [];

    // 1. First pass: look for top-level video(...) configuration
    for (const stmt of program.body) {
      if (stmt.type === "ExpressionStatement" && stmt.expression.type === "CallExpression") {
        if (stmt.expression.callee === "video") {
          this.compileVideoConfig(stmt.expression);
        }
      }
    }

    // 2. Second pass: compile scenes
    let currentStartFrame = 0;
    let sceneIndex = 1;

    for (const stmt of program.body) {
      if (stmt.type === "WithSceneStatement") {
        const scene = this.compileScene(stmt, `scene_${sceneIndex}`, currentStartFrame);
        scenes.push(scene);
        currentStartFrame += scene.durationFrames;
        sceneIndex++;
      } else if (stmt.type === "ExpressionStatement" && stmt.expression.type === "CallExpression") {
        if (stmt.expression.callee !== "video") {
          this.diagnostics.push({
            code: "ERR_STATEMENT_OUTSIDE_SCENE",
            message: `Lệnh '${stmt.expression.callee}(...)' phải nằm bên trong khối 'with scene(...)'.`,
            line: stmt.span.start.line,
            column: stmt.span.start.column,
            severity: "error",
            fixSuggestion: "Đưa lệnh này vào trong một khối 'with scene(...):'.",
          });
        }
      }
    }

    if (scenes.length === 0) {
      this.diagnostics.push({
        code: "ERR_NO_SCENES",
        message: "Không tìm thấy khối 'with scene(...):' nào trong kịch bản.",
        line: 1,
        column: 1,
        severity: "error",
        fixSuggestion: "Bổ sung ít nhất một khối 'with scene(\"name\"):'.",
      });
    }

    return {
      video: this.videoConfig,
      scenes,
      totalDurationFrames: currentStartFrame,
      diagnostics: this.diagnostics,
    };
  }

  private compileVideoConfig(call: CallExpressionNode): void {
    for (const arg of call.args) {
      if (arg.name === "width" && arg.value.type === "NumberLiteral") {
        this.videoConfig.width = arg.value.value;
      } else if (arg.name === "height" && arg.value.type === "NumberLiteral") {
        this.videoConfig.height = arg.value.value;
      } else if (arg.name === "fps" && arg.value.type === "NumberLiteral") {
        this.videoConfig.fps = arg.value.value;
      }
    }
  }

  private compileScene(
    sceneStmt: WithSceneStatementNode,
    sceneId: string,
    startFrame: number
  ): SceneIR {
    const sceneName = sceneStmt.sceneName;
    const objects: Record<string, SceneObjectIR> = {};
    const actionClips: ActionClipIR[] = [];
    const subtitles: SceneIR["subtitles"] = [];
    const speechBubbles: SceneIR["speechBubbles"] = [];
    const propLabels: SceneIR["propLabels"] = [];
    const cameraKeyframes: SceneIR["cameraKeyframes"] = [];

    // Context for compiling blocks
    let currentFrame = 0;
    const clipChannels: Record<string, { start: number; end: number; clipId: string }[]> = {};

    // Helper to evaluate expressions to values or Vector2
    const evalExpr = (expr: ExpressionNode): any => {
      if (expr.type === "NumberLiteral") return expr.value;
      if (expr.type === "StringLiteral") return expr.value;
      if (expr.type === "BooleanLiteral") return expr.value;
      if (expr.type === "CoordinateLiteral") {
        return expr.elements.map((el) => evalExpr(el));
      }
      if (expr.type === "Identifier") {
        return expr.name;
      }
      if (expr.type === "PropertyAccess") {
        return this.resolvePropertyAccess(expr, objects);
      }
      if (expr.type === "BinaryExpression") {
        const leftVal = evalExpr(expr.left);
        const rightVal = evalExpr(expr.right);
        if (typeof leftVal === "number" && typeof rightVal === "number") {
          return expr.operator === "+" ? leftVal + rightVal : leftVal - rightVal;
        }
        if (Array.isArray(leftVal) && Array.isArray(rightVal)) {
          return [
            expr.operator === "+" ? leftVal[0] + rightVal[0] : leftVal[0] - rightVal[0],
            expr.operator === "+" ? leftVal[1] + rightVal[1] : leftVal[1] - rightVal[1],
          ];
        }
      }
      return null;
    };

    // Helper to resolve an anchor string e.g. "desk.surface.right" or "person.right_hand"
    const resolveAnchor = (expr: ExpressionNode): { objectId: string; anchorName: string } | null => {
      if (expr.type === "PropertyAccess") {
        const parts: string[] = [];
        let curr: ExpressionNode = expr;
        while (curr.type === "PropertyAccess") {
          parts.unshift(curr.property);
          curr = curr.object;
        }
        if (curr.type === "Identifier") {
          parts.unshift(curr.name);
          const objId = parts[0];
          const anchorName = parts.slice(1).join(".");
          return { objectId: objId, anchorName };
        }
      }
      return null;
    };

    // Process statements in scene body
    const compileStatements = (stmts: StatementNode[], isParallel = false, isSequence = false): number => {
      let maxDuration = 0;
      const initialFrame = currentFrame;

      for (const stmt of stmts) {
        if (isParallel) {
          currentFrame = initialFrame;
        }

        if (stmt.type === "AssignmentStatement") {
          // Object declaration: obj = character(...) or obj = prop(...)
          this.compileObjectDeclaration(stmt, objects);
        } else if (stmt.type === "ExpressionStatement" && stmt.expression.type === "CallExpression") {
          const call = stmt.expression;
          const callee = call.callee;

          if (!VALID_COMMANDS.has(callee)) {
            this.diagnostics.push({
              code: "ERR_UNKNOWN_COMMAND",
              message: `Lệnh '${callee}' không được hỗ trợ trong AnimScript v0.1.`,
              line: call.span.start.line,
              column: call.span.start.column,
              severity: "error",
              fixSuggestion: `Các lệnh hợp lệ: ${Array.from(VALID_COMMANDS).join(", ")}.`,
            });
            continue;
          }

          if (callee === "place") {
            this.compilePlace(call, objects);
          } else if (callee === "align") {
            this.compileAlign(call, objects);
          } else if (callee === "narrate") {
            const clipDur = this.compileNarrate(call, isSequence ? currentFrame : 0, subtitles);
            if (isSequence) {
              currentFrame += clipDur;
              maxDuration = Math.max(maxDuration, currentFrame - initialFrame);
            }
          } else if (callee === "say") {
            const clipDur = this.compileSay(call, currentFrame, speechBubbles, objects);
            currentFrame += clipDur;
            maxDuration = Math.max(maxDuration, currentFrame - initialFrame);
          } else if (callee === "label_prop") {
            this.compileLabelProp(call, currentFrame, propLabels, objects);
          } else if (callee === "camera_focus") {
            const clipDur = this.compileCameraFocus(call, currentFrame, cameraKeyframes, objects);
            currentFrame += clipDur;
            maxDuration = Math.max(maxDuration, currentFrame - initialFrame);
          } else if (callee === "camera_reset") {
            const clipDur = this.compileCameraReset(call, currentFrame, cameraKeyframes);
            currentFrame += clipDur;
            maxDuration = Math.max(maxDuration, currentFrame - initialFrame);
          } else if (callee === "wait") {
            const durMs = this.getNamedNumber(call, "duration_ms", 1000);
            const frames = Math.round((durMs / 1000) * this.videoConfig.fps);
            currentFrame += frames;
            maxDuration = Math.max(maxDuration, currentFrame - initialFrame);
          } else {
            // Motion or interaction clip
            const clip = this.compileActionClip(call, currentFrame, objects, evalExpr);
            if (clip) {
              this.checkActionConflicts(clip, clipChannels);

              // Multi-Channel Overlapping Action & Anticipatory Co-Articulation:
              // Mặc định gối đầu overlapRatio = 0.35 cho các chuỗi hành động trong with sequence()
              // trừ khi có tham số strict_wait=True
              const strictWait = this.getNamedBoolean(call, "strict_wait", false);

              const overlapRatio = (isSequence && !strictWait) ? 0.35 : 0.0;
              clip.overlapRatio = overlapRatio;
              actionClips.push(clip);

              const advanceFrames = Math.max(1, Math.round(clip.durationFrames * (1.0 - overlapRatio)));
              currentFrame += advanceFrames;
              maxDuration = Math.max(maxDuration, currentFrame - initialFrame);
            }
          }
        } else if (stmt.type === "WithSequenceStatement") {
          const seqDur = compileStatements(stmt.body, false, true);
          maxDuration = Math.max(maxDuration, currentFrame - initialFrame);
        } else if (stmt.type === "WithParallelStatement") {
          const parDur = compileStatements(stmt.body, true, false);
          currentFrame = initialFrame + parDur;
          maxDuration = Math.max(maxDuration, currentFrame - initialFrame);
        }
      }

      return isParallel ? maxDuration : currentFrame - initialFrame;
    };

    compileStatements(sceneStmt.body, false, false);

    // Calculate total duration
    let sceneDuration = currentFrame;
    if (sceneStmt.options.duration_ms && sceneStmt.options.duration_ms.type === "NumberLiteral") {
      const explicitFrames = Math.round(
        (sceneStmt.options.duration_ms.value / 1000) * this.videoConfig.fps
      );
      sceneDuration = Math.max(sceneDuration, explicitFrames);
    }
    sceneDuration = Math.max(sceneDuration, 60); // Minimum 1 second

    return {
      id: sceneId,
      name: sceneName,
      startFrame,
      durationFrames: sceneDuration,
      objects,
      actionClips,
      cameraKeyframes,
      subtitles,
      speechBubbles,
      propLabels,
    };
  }

  // --- Sub-compilers ---

  private compileObjectDeclaration(
    stmt: AssignmentStatementNode,
    objects: Record<string, SceneObjectIR>
  ): void {
    const varName = stmt.target;
    if (stmt.value.type !== "CallExpression") {
      this.diagnostics.push({
        code: "ERR_INVALID_OBJECT_DECL",
        message: `Biến '${varName}' phải được khởi tạo bằng hàm character(...) hoặc prop(...).`,
        line: stmt.span.start.line,
        column: stmt.span.start.column,
        severity: "error",
      });
      return;
    }

    const call = stmt.value;
    const kind = call.callee;

    if (kind === "character") {
      const charType = (call.args[0]?.value as any)?.value || "human";
      const height = this.getNamedNumber(call, "height", 600);
      const x = this.getNamedNumber(call, "x", 960);
      const y = this.getNamedNumber(call, "y", 850);
      const facing = (this.getNamedString(call, "facing", "right") as "left" | "right");

      objects[varName] = {
        id: varName,
        name: varName,
        kind: "character",
        assetType: charType,
        initialTransform: { x, y, rotationDeg: 0, scaleX: 1, scaleY: 1, opacity: 1, zIndex: 10 },
        initialPose: { x, y, facing, isSitting: false },
        props: { height, facing },
      };
    } else if (kind === "prop") {
      const propType = (call.args[0]?.value as any)?.value || "desk";
      const propDef = PROP_REGISTRY[propType];

      if (!propDef) {
        this.diagnostics.push({
          code: "ERR_UNKNOWN_PROP_TYPE",
          message: `Không tìm thấy loại đạo cụ '${propType}' trong registry.`,
          line: stmt.span.start.line,
          column: stmt.span.start.column,
          severity: "error",
          fixSuggestion: `Chọn một trong các loại có sẵn: ${Object.keys(PROP_REGISTRY).join(", ")}.`,
        });
        return;
      }

      const width = this.getNamedNumber(call, "width", propDef.defaultWidth);
      const height = this.getNamedNumber(call, "height", propDef.defaultHeight);
      const x = this.getNamedNumber(call, "x", 960);
      const y = this.getNamedNumber(call, "y", 850);

      objects[varName] = {
        id: varName,
        name: varName,
        kind: "prop",
        assetType: propType,
        initialTransform: { x, y, rotationDeg: 0, scaleX: 1, scaleY: 1, opacity: 1, zIndex: 5 },
        props: { width, height },
      };
    }
  }

  private compilePlace(call: CallExpressionNode, objects: Record<string, SceneObjectIR>): void {
    const targetVar = (call.args[0]?.value as any)?.name;
    const obj = objects[targetVar];
    if (!obj) {
      this.diagnostics.push({
        code: "ERR_UNKNOWN_OBJECT",
        message: `Đối tượng '${targetVar}' chưa được khai báo.`,
        line: call.span.start.line,
        column: call.span.start.column,
        severity: "error",
      });
      return;
    }

    const atArg = call.args.find((a) => a.name === "at")?.value;
    if (atArg && atArg.type === "CoordinateLiteral" && atArg.elements.length >= 2) {
      const x = (atArg.elements[0] as any).value;
      const y = (atArg.elements[1] as any).value;
      obj.initialTransform.x = x;
      obj.initialTransform.y = y;
      if (obj.initialPose) {
        obj.initialPose.x = x;
        obj.initialPose.y = y;
      }
    }
  }

  private compileAlign(call: CallExpressionNode, objects: Record<string, SceneObjectIR>): void {
    const sourcePropAccess = call.args[0]?.value;
    const targetPropAccess = call.args.find((a) => a.name === "to")?.value;

    if (!sourcePropAccess || !targetPropAccess) return;

    const srcAnchor = this.parseAnchorPath(sourcePropAccess);
    const tgtAnchor = this.parseAnchorPath(targetPropAccess);

    if (!srcAnchor || !tgtAnchor) {
      this.diagnostics.push({
        code: "ERR_INVALID_ANCHOR",
        message: "Lệnh align(...) yêu cầu điểm neo hợp lệ dạng object.anchor (ví dụ: cup.bottommid, desk.surface.right).",
        line: call.span.start.line,
        column: call.span.start.column,
        severity: "error",
      });
      return;
    }

    const srcObj = objects[srcAnchor.objectId];
    const tgtObj = objects[tgtAnchor.objectId];

    if (!srcObj || !tgtObj) {
      this.diagnostics.push({
        code: "ERR_UNKNOWN_OBJECT",
        message: `Đối tượng trong align không tồn tại (${!srcObj ? srcAnchor.objectId : tgtAnchor.objectId}).`,
        line: call.span.start.line,
        column: call.span.start.column,
        severity: "error",
      });
      return;
    }

    // Validate anchor names
    this.validateAnchorName(srcObj, srcAnchor.anchorName, call.span.start.line, call.span.start.column);
    this.validateAnchorName(tgtObj, tgtAnchor.anchorName, call.span.start.line, call.span.start.column);

    // Compute alignment position
    const tgtWorldPos = this.calculateAnchorWorldPos(tgtObj, tgtAnchor.anchorName, objects);
    const srcLocalOffset = this.calculateAnchorLocalOffset(srcObj, srcAnchor.anchorName);

    // Offset argument if present
    const offsetArg = call.args.find((a) => a.name === "offset")?.value;
    let dx = 0;
    let dy = 0;
    if (offsetArg && offsetArg.type === "CoordinateLiteral" && offsetArg.elements.length >= 2) {
      dx = (offsetArg.elements[0] as any).value || 0;
      dy = (offsetArg.elements[1] as any).value || 0;
    }

    srcObj.initialTransform.x = tgtWorldPos.x - srcLocalOffset.x + dx;
    srcObj.initialTransform.y = tgtWorldPos.y - srcLocalOffset.y + dy;
    if (srcObj.initialPose) {
      srcObj.initialPose.x = srcObj.initialTransform.x;
      srcObj.initialPose.y = srcObj.initialTransform.y;
    }

    // Set supportedBy relationship if aligning to surface
    if (tgtAnchor.anchorName.startsWith("surface") && srcObj.kind === "prop") {
      srcObj.props = {
        ...srcObj.props,
        supportedBy: tgtAnchor.objectId,
        supportOffsetX: dx,
      };
    }
  }

  private compileNarrate(
    call: CallExpressionNode,
    startFrame: number,
    subtitles: SceneIR["subtitles"]
  ): number {
    const textArg = call.args[0]?.value;
    const text = textArg && textArg.type === "StringLiteral" ? textArg.value : "";
    const durMs = this.getNamedNumber(call, "duration_ms", 2500);
    const frames = Math.max(30, Math.round((durMs / 1000) * this.videoConfig.fps));

    subtitles.push({
      id: `sub_${subtitles.length + 1}`,
      text,
      startFrame,
      durationFrames: frames,
    });

    return frames;
  }

  private compileSay(
    call: CallExpressionNode,
    startFrame: number,
    speechBubbles: SceneIR["speechBubbles"],
    objects: Record<string, SceneObjectIR>
  ): number {
    const charVar = (call.args[0]?.value as any)?.name;
    const text = (call.args.find((a) => a.name === "text" || !a.name && a !== call.args[0])?.value as any)?.value || "";
    const durMs = this.getNamedNumber(call, "duration_ms", 2000);
    const frames = Math.max(30, Math.round((durMs / 1000) * this.videoConfig.fps));

    speechBubbles.push({
      id: `bubble_${speechBubbles.length + 1}`,
      characterId: charVar,
      text,
      startFrame,
      durationFrames: frames,
    });

    return frames;
  }

  private compileLabelProp(
    call: CallExpressionNode,
    startFrame: number,
    propLabels: SceneIR["propLabels"],
    objects: Record<string, SceneObjectIR>
  ): void {
    const propVar = (call.args[0]?.value as any)?.name;
    const text = (call.args.find((a) => a.name === "text" || !a.name && a !== call.args[0])?.value as any)?.value || "";
    const slot = this.getNamedString(call, "slot", "label_slot");

    propLabels.push({
      id: `label_${propLabels.length + 1}`,
      propId: propVar,
      text,
      slot,
      startFrame,
      durationFrames: 99999, // Permanent on prop
    });
  }

  private compileCameraFocus(
    call: CallExpressionNode,
    startFrame: number,
    cameraKeyframes: SceneIR["cameraKeyframes"],
    objects: Record<string, SceneObjectIR>
  ): number {
    const targetsArg = call.args.find((a) => a.name === "targets")?.value;
    const padding = this.getNamedNumber(call, "padding", 140);
    const durMs = this.getNamedNumber(call, "duration_ms", 1000);
    const frames = Math.max(1, Math.round((durMs / 1000) * this.videoConfig.fps));

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    if (targetsArg && targetsArg.type === "CoordinateLiteral") {
      for (const el of targetsArg.elements) {
        const objName = (el as any).name;
        const obj = objects[objName];
        if (obj) {
          const ox = obj.initialTransform.x;
          const oy = obj.initialTransform.y;
          const w = obj.props?.width || 200;
          const h = obj.props?.height || 400;
          minX = Math.min(minX, ox - w / 2);
          maxX = Math.max(maxX, ox + w / 2);
          minY = Math.min(minY, oy - h);
          maxY = Math.max(maxY, oy);
        }
      }
    }

    if (!isFinite(minX)) {
      minX = 700; maxX = 1220; minY = 400; maxY = 800;
    }

    const boundW = Math.max(200, maxX - minX + padding * 2);
    const boundH = Math.max(200, maxY - minY + padding * 2);
    const zoomX = this.videoConfig.width / boundW;
    const zoomY = this.videoConfig.height / boundH;
    const zoom = Math.min(2.5, Math.max(1.0, Math.min(zoomX, zoomY)));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    cameraKeyframes.push({
      frame: startFrame,
      x: centerX,
      y: centerY,
      zoom,
      easing: "ease_in_out",
    });

    return frames;
  }

  private compileCameraReset(
    call: CallExpressionNode,
    startFrame: number,
    cameraKeyframes: SceneIR["cameraKeyframes"]
  ): number {
    const durMs = this.getNamedNumber(call, "duration_ms", 800);
    const frames = Math.max(1, Math.round((durMs / 1000) * this.videoConfig.fps));

    cameraKeyframes.push({
      frame: startFrame,
      x: this.videoConfig.width / 2,
      y: this.videoConfig.height / 2,
      zoom: 1.0,
      easing: "ease_in_out",
    });

    return frames;
  }

  private compileActionClip(
    call: CallExpressionNode,
    startFrame: number,
    objects: Record<string, SceneObjectIR>,
    evalExpr?: (expr: ExpressionNode) => any
  ): ActionClipIR | null {
    const action = call.callee as ActionType;
    const durMs = this.getNamedNumber(call, "duration_ms", 1000);
    const durationFrames = Math.max(1, Math.round((durMs / 1000) * this.videoConfig.fps));
    const endFrame = startFrame + durationFrames;

    // First argument is usually the target object or anchor
    const targetExpr = call.args[0]?.value;
    let targetId = "";
    if (targetExpr?.type === "Identifier") {
      targetId = targetExpr.name;
    } else if (targetExpr?.type === "PropertyAccess") {
      const anchor = this.parseAnchorPath(targetExpr);
      targetId = anchor ? `${anchor.objectId}.${anchor.anchorName}` : "";
    }

    if (action === "move" && targetId.includes(".")) {
      this.diagnostics.push({
        code: "ERR_INVALID_TARGET",
        message: `Lệnh 'move' chỉ áp dụng cho toàn bộ đối tượng (root), không áp dụng trực tiếp cho điểm neo hoặc chi '${targetId}'. Dùng lệnh 'reach' để di chuyển tay.`,
        line: call.span.start.line,
        column: call.span.start.column,
        severity: "error",
        fixSuggestion: `Sử dụng reach(${targetId}, to=...) hoặc move(${targetId.split(".")[0]}, to=...).`,
      });
      return null;
    }

    const params: Record<string, any> = {};
    for (const arg of call.args) {
      if (arg.name) {
        if (arg.value.type === "NumberLiteral") params[arg.name] = arg.value.value;
        else if (arg.value.type === "StringLiteral") params[arg.name] = arg.value.value;
        else if (arg.value.type === "BooleanLiteral") params[arg.name] = arg.value.value;
        else if (arg.value.type === "Identifier") params[arg.name] = arg.value.name;
        else if (arg.value.type === "CoordinateLiteral") {
          params[arg.name] = evalExpr ? evalExpr(arg.value) : arg.value.elements.map((el) => (el as any).value ?? 0);
        } else if (arg.value.type === "PropertyAccess") {
          if (arg.value.property === "x" || arg.value.property === "y") {
            params[arg.name] = this.resolvePropertyAccess(arg.value, objects);
          } else {
            const anchor = this.parseAnchorPath(arg.value);
            if (anchor) {
              const tgtObj = objects[anchor.objectId];
              if (tgtObj) {
                this.validateAnchorName(tgtObj, anchor.anchorName, call.span.start.line, call.span.start.column);
              }
              params[arg.name] = anchor;
            }
          }
        }
      }
    }

    return {
      id: `clip_${action}_${startFrame}`,
      targetId,
      action,
      startFrame,
      durationFrames,
      endFrame,
      params,
    };
  }

  private checkActionConflicts(
    clip: ActionClipIR,
    channels: Record<string, { start: number; end: number; clipId: string }[]>
  ): void {
    let channelKey = clip.targetId;
    if (clip.action === "walk" || clip.action === "run" || clip.action === "jump") {
      channelKey = `${clip.targetId}.legs`;
    } else if (clip.action === "reach" || clip.action === "grab" || clip.action === "release" || clip.action === "pickup") {
      let hand = clip.params.hand || (clip.targetId.includes("left") ? "leftHand" : "rightHand");
      if (hand === "left" || hand === "left_hand" || hand === "leftHand") hand = "leftHand";
      if (hand === "right" || hand === "right_hand" || hand === "rightHand") hand = "rightHand";
      channelKey = `${clip.targetId.split(".")[0]}.${hand}`;
    }

    const existing = channels[channelKey] || [];
    for (const entry of existing) {
      // Overlap condition
      if (Math.max(clip.startFrame, entry.start) < Math.min(clip.endFrame, entry.end)) {
        this.diagnostics.push({
          code: "ERR_ACTION_CONFLICT",
          message: `Xung đột hành động: '${clip.action}' và clip trước cùng điều khiển '${channelKey}' trong khoảng frame ${clip.startFrame} -> ${clip.endFrame}.`,
          line: 1,
          column: 1,
          severity: "error",
          fixSuggestion: "Đặt các hành động cùng chi vào khối 'sequence()' hoặc dùng các tay/chân khác nhau.",
        });
      }
    }

    existing.push({ start: clip.startFrame, end: clip.endFrame, clipId: clip.id });
    channels[channelKey] = existing;
  }

  // --- Helper Methods ---

  private getNamedBoolean(call: CallExpressionNode, name: string, defVal: boolean): boolean {
    const arg = call.args.find((a) => a.name === name)?.value;
    return arg && arg.type === "BooleanLiteral" ? arg.value : defVal;
  }

  private getNamedNumber(call: CallExpressionNode, name: string, defVal: number): number {
    const arg = call.args.find((a) => a.name === name)?.value;
    return arg && arg.type === "NumberLiteral" ? arg.value : defVal;
  }

  private getNamedString(call: CallExpressionNode, name: string, defVal: string): string {
    const arg = call.args.find((a) => a.name === name)?.value;
    return arg && arg.type === "StringLiteral" ? arg.value : defVal;
  }

  private parseAnchorPath(expr: ExpressionNode): { objectId: string; anchorName: string } | null {
    if (expr.type === "PropertyAccess") {
      const parts: string[] = [];
      let curr: ExpressionNode = expr;
      while (curr.type === "PropertyAccess") {
        parts.unshift(curr.property);
        curr = curr.object;
      }
      if (curr.type === "Identifier") {
        parts.unshift(curr.name);
        return { objectId: parts[0], anchorName: parts.slice(1).join(".") };
      }
    }
    return null;
  }

  private validateAnchorName(
    obj: SceneObjectIR,
    anchorName: string,
    line: number,
    column: number
  ): void {
    if (obj.kind === "prop") {
      const propDef = PROP_REGISTRY[obj.assetType];
      if (propDef && !propDef.anchors[anchorName]) {
        this.diagnostics.push({
          code: "ERR_UNKNOWN_ANCHOR",
          message: `Điểm neo '${anchorName}' không tồn tại trên đạo cụ '${obj.id}' (${obj.assetType}).`,
          line,
          column,
          severity: "error",
          fixSuggestion: `Các điểm neo hợp lệ cho '${obj.assetType}': ${Object.keys(propDef.anchors).join(", ")}.`,
        });
      }
    }
  }

  private calculateAnchorLocalOffset(obj: SceneObjectIR, anchorName: string): Vector2 {
    if (obj.kind === "prop") {
      const propDef = PROP_REGISTRY[obj.assetType];
      if (propDef && propDef.anchors[anchorName]) {
        const w = obj.props?.width || propDef.defaultWidth;
        const h = obj.props?.height || propDef.defaultHeight;
        return propDef.anchors[anchorName](w, h);
      }
    }
    return { x: 0, y: 0 };
  }

  private calculateAnchorWorldPos(
    obj: SceneObjectIR,
    anchorName: string,
    allObjects: Record<string, SceneObjectIR>
  ): Vector2 {
    if (obj.kind === "prop") {
      const offset = this.calculateAnchorLocalOffset(obj, anchorName);
      return {
        x: obj.initialTransform.x + offset.x,
        y: obj.initialTransform.y + offset.y,
      };
    } else if (obj.kind === "character") {
      const height = obj.props?.height || 600;
      const facing = obj.props?.facing || "right";
      const anchors = calculateCharacterAnchors(
        obj.initialTransform.x,
        obj.initialTransform.y,
        height,
        facing,
        obj.initialPose
      );
      return anchors[anchorName] || { x: obj.initialTransform.x, y: obj.initialTransform.y };
    }
    return { x: obj.initialTransform.x, y: obj.initialTransform.y };
  }

  private resolvePropertyAccess(
    expr: PropertyAccessNode,
    objects?: Record<string, SceneObjectIR>
  ): any {
    const parts: string[] = [];
    let curr: ExpressionNode = expr;
    while (curr.type === "PropertyAccess") {
      parts.unshift(curr.property);
      curr = curr.object;
    }
    if (curr.type === "Identifier") {
      parts.unshift(curr.name);
    } else {
      return 0;
    }

    const objId = parts[0];
    const obj = objects ? objects[objId] : undefined;
    if (!obj) {
      return 0;
    }

    const lastPart = parts[parts.length - 1];
    if (lastPart === "x" || lastPart === "y") {
      const anchorName = parts.slice(1, -1).join(".");
      if (anchorName) {
        const worldPos = this.calculateAnchorWorldPos(obj, anchorName, objects || {});
        return lastPart === "x" ? worldPos.x : worldPos.y;
      } else {
        return lastPart === "x" ? obj.initialTransform.x : obj.initialTransform.y;
      }
    }

    const anchorName = parts.slice(1).join(".");
    if (anchorName) {
      const worldPos = this.calculateAnchorWorldPos(obj, anchorName, objects || {});
      return [worldPos.x, worldPos.y];
    }

    return 0;
  }
}
