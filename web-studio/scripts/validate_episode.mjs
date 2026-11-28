#!/usr/bin/env node
/**
 * EPISODE VALIDATOR V21.0 — Script kiểm định kịch bản JSON tự động trước khi render
 * Chạy bằng:
 *   node scripts/validate_episode.mjs episodes/<ten_file>.json
 *
 * Tự động phát hiện:
 *   [LỖI NGHIÊM TRỌNG — exit code 1]:
 *     1. WALK / RUN nhưng Math.abs(endX - startX) < 10 (đi bộ / chạy tại chỗ - moonwalk).
 *     2. stageType === "EXPLAINER_POLKA_DOT" nhưng thiếu cả customVisual lẫn visualProp.
 *     3. Tên customVisual không tồn tại trong EPISODE_VISUAL_REGISTRY (src/components/v7/episodeVisuals/index.ts).
 *     4. ttsText có chứa chữ 'z' hoặc 'Z' (gây lỗi phát âm VieNeu-TTS tiếng Việt).
 *   [CẢNH BÁO — exit code 0 nếu không có lỗi nghiêm trọng]:
 *     5. Mảng actors có 2 nhân vật kết thúc cách nhau < 200px (đứng quá sát nhau).
 *     6. fullScreenVisual === true nhưng thiếu customVisual hợp lệ.
 *     7. Beat sân khấu (fullScreenVisual !== true) có actor ở pose TALK_GESTURE / SCRATCH_HEAD hoặc text chứa '?' nhưng không có actor nào gắn bubble.
 *     8. transitionFrames < 18.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const WEB_STUDIO_ROOT = path.resolve(__dirname, '..');
export const DEFAULT_VISUAL_REGISTRY_PATH = path.join(
  WEB_STUDIO_ROOT,
  'src',
  'components',
  'v7',
  'episodeVisuals',
  'index.ts'
);

/**
 * Thay thế toàn bộ nội dung comment và chuỗi bằng khoảng trắng (giữ nguyên độ dài & chỉ số ký tự)
 * để tìm đúng khai báo `const EPISODE_VISUAL_REGISTRY` mà không bị đánh lừa bởi comment/JSDoc/type.
 */
function maskCommentsAndStrings(source) {
  const chars = Array.from(source);
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const next = chars[i + 1];

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      else chars[i] = ' ';
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        chars[i] = ' ';
        chars[i + 1] = ' ';
        inBlockComment = false;
        i++;
      } else if (ch !== '\n') {
        chars[i] = ' ';
      }
      continue;
    }
    if (inSingle) {
      if (ch === '\\' && i + 1 < chars.length) {
        chars[i] = ' ';
        chars[i + 1] = ' ';
        i++;
      } else {
        if (ch === "'") inSingle = false;
        if (ch !== '\n') chars[i] = ' ';
      }
      continue;
    }
    if (inDouble) {
      if (ch === '\\' && i + 1 < chars.length) {
        chars[i] = ' ';
        chars[i + 1] = ' ';
        i++;
      } else {
        if (ch === '"') inDouble = false;
        if (ch !== '\n') chars[i] = ' ';
      }
      continue;
    }
    if (inTemplate) {
      if (ch === '\\' && i + 1 < chars.length) {
        chars[i] = ' ';
        chars[i + 1] = ' ';
        i++;
      } else {
        if (ch === '`') inTemplate = false;
        if (ch !== '\n') chars[i] = ' ';
      }
      continue;
    }

    if (ch === '/' && next === '/') {
      chars[i] = ' ';
      chars[i + 1] = ' ';
      inLineComment = true;
      i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      chars[i] = ' ';
      chars[i + 1] = ' ';
      inBlockComment = true;
      i++;
      continue;
    }
    if (ch === "'") {
      chars[i] = ' ';
      inSingle = true;
      continue;
    }
    if (ch === '"') {
      chars[i] = ' ';
      inDouble = true;
      continue;
    }
    if (ch === '`') {
      chars[i] = ' ';
      inTemplate = true;
      continue;
    }
  }
  return chars.join('');
}

/**
 * Đọc và phân tích danh sách khóa hợp lệ trong EPISODE_VISUAL_REGISTRY từ file TypeScript
 * mà không cần loader TSX/React bên ngoài.
 */
export function loadRegisteredCustomVisuals(registryPath = DEFAULT_VISUAL_REGISTRY_PATH) {
  if (!fs.existsSync(registryPath)) {
    throw new Error(`Không tìm thấy file registry customVisual: ${registryPath}`);
  }
  const source = fs.readFileSync(registryPath, 'utf8');
  const masked = maskCommentsAndStrings(source);
  const declMatch = masked.match(/\b(?:const|let|var)\s+EPISODE_VISUAL_REGISTRY\b/);
  if (!declMatch || declMatch.index === undefined) {
    throw new Error(`Không tìm thấy khai báo EPISODE_VISUAL_REGISTRY trong ${registryPath}`);
  }

  // Quét từ sau tên biến ở độ sâu ngoặc 0 để tìm dấu '=' gán giá trị (bỏ qua '=>' hoặc '=' bên trong type annotation)
  const scanStart = declMatch.index + declMatch[0].length;
  let eqIdx = -1;
  let braceD = 0;
  let parenD = 0;
  let bracketD = 0;
  let angleD = 0;
  for (let i = scanStart; i < masked.length; i++) {
    const ch = masked[i];
    const next = masked[i + 1];
    if (ch === '{') braceD++;
    else if (ch === '}') braceD = Math.max(0, braceD - 1);
    else if (ch === '(') parenD++;
    else if (ch === ')') parenD = Math.max(0, parenD - 1);
    else if (ch === '[') bracketD++;
    else if (ch === ']') bracketD = Math.max(0, bracketD - 1);
    else if (ch === '<') angleD++;
    else if (ch === '>' && masked[i - 1] !== '=') angleD = Math.max(0, angleD - 1);
    else if (ch === '=' && next === '>') {
      i++; // bỏ qua toán tử hàm mũi tên '=>' trong kiểu TS
    } else if (
      ch === '=' &&
      next !== '=' &&
      masked[i - 1] !== '!' &&
      masked[i - 1] !== '=' &&
      braceD === 0 &&
      parenD === 0 &&
      bracketD === 0 &&
      angleD === 0
    ) {
      eqIdx = i;
      break;
    }
  }
  if (eqIdx === -1) {
    throw new Error(`Không tìm thấy dấu '=' của EPISODE_VISUAL_REGISTRY trong ${registryPath}`);
  }
  const openBraceIdx = masked.indexOf('{', eqIdx + 1);
  if (openBraceIdx === -1) {
    throw new Error(`Không tìm thấy thân object EPISODE_VISUAL_REGISTRY trong ${registryPath}`);
  }

  // Quét ngoặc nhọn cân bằng (bỏ qua comment và chuỗi) để trích trọn thân object
  let depth = 0;
  let closeBraceIdx = -1;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = openBraceIdx; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (inSingle) {
      if (ch === '\\') {
        i++;
      } else if (ch === "'") {
        inSingle = false;
      }
      continue;
    }
    if (inDouble) {
      if (ch === '\\') {
        i++;
      } else if (ch === '"') {
        inDouble = false;
      }
      continue;
    }
    if (inTemplate) {
      if (ch === '\\') {
        i++;
      } else if (ch === '`') {
        inTemplate = false;
      }
      continue;
    }

    if (ch === '/' && next === '/') {
      inLineComment = true;
      i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true;
      i++;
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      continue;
    }
    if (ch === '`') {
      inTemplate = true;
      continue;
    }

    if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        closeBraceIdx = i;
        break;
      }
    }
  }

  if (closeBraceIdx === -1) {
    throw new Error(`EPISODE_VISUAL_REGISTRY trong ${registryPath} không đóng ngoặc nhọn hợp lệ.`);
  }

  const rawBody = source.slice(openBraceIdx + 1, closeBraceIdx);

  // Tách các entry ở cấp top-level của object literal (depth=0) để miễn nhiễm với dấu phẩy/ngoặc lồng nhau
  const entries = [];
  let entryStart = 0;
  let braceDepth = 0;
  let parenDepth = 0;
  let bracketDepth = 0;
  inSingle = false;
  inDouble = false;
  inTemplate = false;
  inLineComment = false;
  inBlockComment = false;

  for (let i = 0; i < rawBody.length; i++) {
    const ch = rawBody[i];
    const next = rawBody[i + 1];

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (inSingle) {
      if (ch === '\\') i++;
      else if (ch === "'") inSingle = false;
      continue;
    }
    if (inDouble) {
      if (ch === '\\') i++;
      else if (ch === '"') inDouble = false;
      continue;
    }
    if (inTemplate) {
      if (ch === '\\') i++;
      else if (ch === '`') inTemplate = false;
      continue;
    }

    if (ch === '/' && next === '/') {
      inLineComment = true;
      i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true;
      i++;
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      continue;
    }
    if (ch === '`') {
      inTemplate = true;
      continue;
    }

    if (ch === '{') braceDepth++;
    else if (ch === '}') braceDepth--;
    else if (ch === '(') parenDepth++;
    else if (ch === ')') parenDepth--;
    else if (ch === '[') bracketDepth++;
    else if (ch === ']') bracketDepth--;
    else if (ch === ',' && braceDepth === 0 && parenDepth === 0 && bracketDepth === 0) {
      entries.push(rawBody.slice(entryStart, i));
      entryStart = i + 1;
    }
  }
  entries.push(rawBody.slice(entryStart));

  const keys = new Set();
  for (const rawEntry of entries) {
    const cleanedEntry = rawEntry
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .trim();
    if (!cleanedEntry || cleanedEntry.startsWith('...')) continue;
    const keyMatch = cleanedEntry.match(/^(?:['"]([^'"]+)['"]|([A-Za-z_$][A-Za-z0-9_$]*))\s*(?::|$)/);
    if (keyMatch) {
      const key = (keyMatch[1] ?? keyMatch[2] ?? '').trim();
      if (key) keys.add(key);
    }
  }
  return keys;
}

const WALK_RUN_POSE_ALIASES = {
  WALK: 'WALK',
  WALK_IN: 'WALK',
  STROLL: 'WALK',
  RUN: 'RUN',
  RUN_CHASE: 'RUN',
  SPRINT: 'RUN',
};

export const VALID_STAGE_TYPE_SET = new Set([
  'COUNTRYSIDE_YARD',
  'SIMPLE_GRASS_FIELD',
  'BEDROOM_INDOOR',
  'CITY_STREET',
  'CITY_LIVING_ROOM',
  'CITY_STREET_PARK',
  'SCHOOL_CLASSROOM',
  'HOME_KITCHEN',
  'FOREST_PARK',
  'FOREST_WINTER_STAGE',
  'OCEAN_UNDERWATER',
  'BACKYARD_BALCONY_PET',
  'SCIENCE_LAB_ROOM',
  'DOCTOR_CLINIC',
  'WATER_POND_OCEAN',
  'UNDERGROUND_EARTH_CUTAWAY',
  'SPACE_COSMOS',
  'ANECHOIC_CHAMBER',
  'EXPLAINER_POLKA_DOT',
  'HOST_EXPLAIN_OVERLAY',
  'CLEAN_EXPLAINER',
]);

export const VALID_ACTOR_PRESET_SET = new Set([
  'BOY',
  'GRANDPA',
  'GRANDMA',
  'DOCTOR',
  'NEIGHBOR',
  'CUSTOM',
  // Legacy aliases accepted by episodeJsonSchema.ts
  'KID',
  'CHILD',
  'PROTAGONIST',
  'NARRATOR',
  'OLD_MAN',
  'GRANDFATHER',
  'OLD_WOMAN',
  'GRANDMOTHER',
  'SCIENTIST',
  'MEDIC',
  'FRIEND',
  'MAN',
]);

export const VALID_HAIR_STYLE_SET = new Set([
  'NONE',
  'CURLY_SHORT',
  'NEAT_SHORT',
  'BOB',
  'BUN',
  'PONYTAIL',
  'SIDE_GRAY',
]);

export const VALID_OUTFIT_STYLE_SET = new Set([
  'STICK',
  'TSHIRT',
  'POLO',
  'CARDIGAN',
  'VEST',
  'LAB_COAT',
  'SCHOOL_UNIFORM',
]);

export const VALID_GLASSES_STYLE_SET = new Set(['NONE', 'ROUND', 'RECT']);
export const VALID_APPEARANCE_PROP_SET = new Set(['NONE', 'NOTEBOOK', 'BOOK', 'PHONE']);
const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function normalizeWalkRunPose(rawPose) {
  const key = String(rawPose ?? '').trim().toUpperCase();
  return WALK_RUN_POSE_ALIASES[key] ?? null;
}

function parseFiniteNum(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : NaN;
  if (typeof v === 'string') {
    const trimmed = v.trim();
    if (!trimmed) return NaN;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
}

function resolveActorSlotDefaultX(actor, actorIndex = 0, totalActors = 1) {
  const rawSlot = String(actor?.slot ?? '').trim().toUpperCase();
  if (rawSlot === 'LEFT') return 490;
  if (rawSlot === 'RIGHT') return 1390;
  if (rawSlot === 'CENTER') return 960;

  // Khớp logic defaultSlot của sanitizeActor trong episodeJsonSchema.ts
  if (totalActors >= 3) {
    return actorIndex === 0 ? 490 : actorIndex === 1 ? 960 : 1390;
  }
  if (totalActors === 2) {
    return actorIndex === 0 ? 490 : 1390;
  }
  return 960;
}

function resolveActorEndX(actor, actorIndex = 0, totalActors = 1) {
  if (Array.isArray(actor?.timeline) && actor.timeline.length > 0) {
    const sorted = [...actor.timeline].sort((a, b) => {
      const fa = parseFiniteNum(a?.fromPct);
      const fb = parseFiniteNum(b?.fromPct);
      const fromDiff = (Number.isFinite(fa) ? fa : 0) - (Number.isFinite(fb) ? fb : 0);
      if (fromDiff !== 0) return fromDiff;
      const ta = parseFiniteNum(a?.toPct);
      const tb = parseFiniteNum(b?.toPct);
      return (Number.isFinite(ta) ? ta : 0) - (Number.isFinite(tb) ? tb : 0);
    });
    const lastKf = sorted[sorted.length - 1];
    const endX = parseFiniteNum(lastKf?.endX);
    if (Number.isFinite(endX)) return endX;
    const startX = parseFiniteNum(lastKf?.startX);
    if (Number.isFinite(startX)) return startX;
  }

  const topEndX = parseFiniteNum(actor?.endX);
  if (Number.isFinite(topEndX)) return topEndX;
  const topStartX = parseFiniteNum(actor?.startX);
  if (Number.isFinite(topStartX)) return topStartX;

  return resolveActorSlotDefaultX(actor, actorIndex, totalActors);
}

/**
 * Kiểm định đối tượng episode JSON đã parse và trả về danh sách errors (lỗi nghiêm trọng) + warnings (cảnh báo).
 */
export function validateEpisodeData(episode, registeredVisuals) {
  const errors = [];
  const warnings = [];

  if (!episode || typeof episode !== 'object' || Array.isArray(episode)) {
    errors.push({
      code: 'INVALID_ROOT',
      beatId: '-',
      beatIndex: -1,
      message: 'Root JSON không phải là một object hợp lệ.',
    });
    return { errors, warnings, totalBeats: 0 };
  }

  if (!Array.isArray(episode.beats) || episode.beats.length === 0) {
    errors.push({
      code: 'EMPTY_BEATS',
      beatId: '-',
      beatIndex: -1,
      message: 'Thiếu mảng beats[] hoặc mảng beats[] đang rỗng.',
    });
    return { errors, warnings, totalBeats: 0 };
  }

  for (let bIdx = 0; bIdx < episode.beats.length; bIdx++) {
    const beat = episode.beats[bIdx];
    if (!beat || typeof beat !== 'object' || Array.isArray(beat)) {
      errors.push({
        code: 'INVALID_BEAT',
        beatId: `beat_${String(bIdx + 1).padStart(2, '0')}`,
        beatIndex: bIdx,
        message: 'Phần tử beat không phải là object hợp lệ.',
      });
      continue;
    }

    const beatId =
      typeof beat?.id === 'string' && beat.id.trim()
        ? beat.id.trim()
        : `beat_${String(bIdx + 1).padStart(2, '0')}`;

    const actors = Array.isArray(beat?.actors) ? beat.actors : [];

    // 1. Kiểm tra WALK / RUN (và các alias WALK_IN / STROLL / RUN_CHASE / SPRINT) đi bộ tại chỗ: Math.abs(endX - startX) < 10
    for (let aIdx = 0; aIdx < actors.length; aIdx++) {
      const actor = actors[aIdx];
      const preset = String(actor?.preset ?? `actor#${aIdx + 1}`);
      const normalizedPreset = String(actor?.preset ?? '')
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, '_');

      if (normalizedPreset && !VALID_ACTOR_PRESET_SET.has(normalizedPreset)) {
        errors.push({
          code: 'INVALID_ACTOR_PRESET',
          beatId,
          beatIndex: bIdx,
          message: `Nhân vật #${aIdx + 1} dùng preset không hợp lệ "${actor?.preset}". Hỗ trợ: BOY, GRANDPA, GRANDMA, DOCTOR, NEIGHBOR, CUSTOM.`,
        });
      }

      if (actor?.appearance !== undefined && actor?.appearance !== null) {
        if (typeof actor.appearance !== 'object' || Array.isArray(actor.appearance)) {
          errors.push({
            code: 'INVALID_APPEARANCE',
            beatId,
            beatIndex: bIdx,
            message: `Nhân vật #${aIdx + 1} (${preset}) có thuộc tính appearance không phải object hợp lệ.`,
          });
        } else {
          const app = actor.appearance;
          if (app.scale !== undefined) {
            const sc = parseFiniteNum(app.scale);
            if (!Number.isFinite(sc) || sc < 0.5 || sc > 1.4) {
              errors.push({
                code: 'INVALID_APPEARANCE',
                beatId,
                beatIndex: bIdx,
                message: `Nhân vật #${aIdx + 1} (${preset}) có appearance.scale = ${app.scale} nằm ngoài khoảng hợp lệ [0.5, 1.4].`,
              });
            }
          }
          if (app.hairStyle !== undefined) {
            const hs = String(app.hairStyle).trim().toUpperCase();
            if (!VALID_HAIR_STYLE_SET.has(hs)) {
              errors.push({
                code: 'INVALID_APPEARANCE',
                beatId,
                beatIndex: bIdx,
                message: `Nhân vật #${aIdx + 1} (${preset}) có appearance.hairStyle không hợp lệ "${app.hairStyle}".`,
              });
            }
          }
          if (app.hairColor !== undefined && !HEX_COLOR_RE.test(String(app.hairColor).trim())) {
            errors.push({
              code: 'INVALID_APPEARANCE',
              beatId,
              beatIndex: bIdx,
              message: `Nhân vật #${aIdx + 1} (${preset}) có appearance.hairColor không phải mã hex hợp lệ "${app.hairColor}".`,
            });
          }
          if (app.outfitStyle !== undefined) {
            const os = String(app.outfitStyle).trim().toUpperCase();
            if (!VALID_OUTFIT_STYLE_SET.has(os)) {
              errors.push({
                code: 'INVALID_APPEARANCE',
                beatId,
                beatIndex: bIdx,
                message: `Nhân vật #${aIdx + 1} (${preset}) có appearance.outfitStyle không hợp lệ "${app.outfitStyle}".`,
              });
            }
          }
          if (app.outfitColor !== undefined && !HEX_COLOR_RE.test(String(app.outfitColor).trim())) {
            errors.push({
              code: 'INVALID_APPEARANCE',
              beatId,
              beatIndex: bIdx,
              message: `Nhân vật #${aIdx + 1} (${preset}) có appearance.outfitColor không phải mã hex hợp lệ "${app.outfitColor}".`,
            });
          }
          if (app.glasses !== undefined) {
            const gl = String(app.glasses).trim().toUpperCase();
            if (!VALID_GLASSES_STYLE_SET.has(gl)) {
              errors.push({
                code: 'INVALID_APPEARANCE',
                beatId,
                beatIndex: bIdx,
                message: `Nhân vật #${aIdx + 1} (${preset}) có appearance.glasses không hợp lệ "${app.glasses}".`,
              });
            }
          }
          if (app.mustache !== undefined && typeof app.mustache !== 'boolean') {
            errors.push({
              code: 'INVALID_APPEARANCE',
              beatId,
              beatIndex: bIdx,
              message: `Nhân vật #${aIdx + 1} (${preset}) có appearance.mustache phải là boolean.`,
            });
          }
          if (app.prop !== undefined) {
            const pr = String(app.prop).trim().toUpperCase();
            if (!VALID_APPEARANCE_PROP_SET.has(pr)) {
              errors.push({
                code: 'INVALID_APPEARANCE',
                beatId,
                beatIndex: bIdx,
                message: `Nhân vật #${aIdx + 1} (${preset}) có appearance.prop không hợp lệ "${app.prop}".`,
              });
            }
          }
        }
      }
      const actorFallbackX = resolveActorSlotDefaultX(actor, aIdx, actors.length);
      const hasTimeline = Array.isArray(actor?.timeline) && actor.timeline.length > 0;

      if (hasTimeline) {
        for (let kIdx = 0; kIdx < actor.timeline.length; kIdx++) {
          const kf = actor.timeline[kIdx];
          const normalizedPose = normalizeWalkRunPose(kf?.pose);
          if (normalizedPose) {
            const rawStartX = parseFiniteNum(kf?.startX);
            const startX = Number.isFinite(rawStartX) ? rawStartX : actorFallbackX;
            const rawEndX = parseFiniteNum(kf?.endX);
            const endX = Number.isFinite(rawEndX) ? rawEndX : startX;
            const dist = Math.abs(endX - startX);
            if (dist < 10) {
              errors.push({
                code: 'MOONWALK',
                beatId,
                beatIndex: bIdx,
                message: `Nhân vật #${aIdx + 1} (${preset}) timeline[${kIdx}] dùng pose "${normalizedPose}" nhưng |endX - startX| = ${dist}px < 10px (startX=${kf?.startX}, endX=${kf?.endX}) -> lỗi đi bộ tại chỗ!`,
              });
            }
          }
        }
      } else {
        const normalizedPose = normalizeWalkRunPose(actor?.pose);
        if (normalizedPose) {
          const rawStartX = parseFiniteNum(actor?.startX);
          const startX = Number.isFinite(rawStartX) ? rawStartX : actorFallbackX;
          const rawEndX = parseFiniteNum(actor?.endX);
          const endX = Number.isFinite(rawEndX) ? rawEndX : startX;
          const dist = Math.abs(endX - startX);
          if (dist < 10) {
            errors.push({
              code: 'MOONWALK',
              beatId,
              beatIndex: bIdx,
              message: `Nhân vật #${aIdx + 1} (${preset}) dùng pose "${normalizedPose}" nhưng |endX - startX| = ${dist}px < 10px (startX=${actor?.startX}, endX=${actor?.endX}) -> lỗi đi bộ tại chỗ!`,
            });
          }
        }
      }
    }

    // 2. Kiểm tra stageType hợp lệ, labBoard (nếu có) & EXPLAINER_POLKA_DOT không trống
    const stageType = String(beat?.stageType ?? '')
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, '_');
    if (stageType && !VALID_STAGE_TYPE_SET.has(stageType)) {
      errors.push({
        code: 'INVALID_STAGE_TYPE',
        beatId,
        beatIndex: bIdx,
        message: `stageType "${beat?.stageType}" không nằm trong danh sách sân khấu hợp lệ V22.0.`,
      });
    }
    if (beat?.labBoard !== undefined && beat?.labBoard !== null) {
      if (typeof beat.labBoard !== 'string' || !/^[A-Za-z0-9_\-\s]{1,48}$/.test(beat.labBoard.trim())) {
        errors.push({
          code: 'INVALID_LAB_BOARD',
          beatId,
          beatIndex: bIdx,
          message: `labBoard không hợp lệ "${beat.labBoard}" (cần chuỗi mã chủ đề hợp lệ vd: "ACOUSTICS_VOICE").`,
        });
      }
    }
    const rawCustomVisual = typeof beat?.customVisual === 'string' ? beat.customVisual.trim() : '';
    const hasCustomVisual = rawCustomVisual.length > 0;
    const rawVisualProp = typeof beat?.visualProp === 'string' ? beat.visualProp.trim().toUpperCase() : '';
    const hasVisualProp = rawVisualProp.length > 0 && rawVisualProp !== 'NONE';

    if (stageType === 'EXPLAINER_POLKA_DOT' && !hasCustomVisual && !hasVisualProp) {
      errors.push({
        code: 'EMPTY_EXPLAINER',
        beatId,
        beatIndex: bIdx,
        message:
          'stageType === "EXPLAINER_POLKA_DOT" nhưng thiếu cả customVisual lẫn visualProp (hoặc visualProp="NONE").',
      });
    }

    // 3. Kiểm tra tên customVisual có tồn tại trong EPISODE_VISUAL_REGISTRY hay không
    if (beat?.customVisual !== undefined && beat?.customVisual !== null) {
      if (typeof beat.customVisual !== 'string') {
        errors.push({
          code: 'UNKNOWN_CUSTOM_VISUAL',
          beatId,
          beatIndex: bIdx,
          message: `customVisual phải là chuỗi tên component hợp lệ (nhận ${typeof beat.customVisual}).`,
        });
      } else if (hasCustomVisual && !registeredVisuals.has(rawCustomVisual)) {
        errors.push({
          code: 'UNKNOWN_CUSTOM_VISUAL',
          beatId,
          beatIndex: bIdx,
          message: `customVisual "${rawCustomVisual}" không tồn tại trong EPISODE_VISUAL_REGISTRY (src/components/v7/episodeVisuals/index.ts).`,
        });
      }
    }

    if (beat?.fullScreenVisual === true && !hasCustomVisual) {
      warnings.push({
        code: 'FULLSCREEN_WITHOUT_VISUAL',
        beatId,
        beatIndex: bIdx,
        message: 'Bật fullScreenVisual=true nhưng không khai báo customVisual -> sẽ quay về sân khấu mặc định.',
      });
    }

    // 4. Kiểm tra ttsText có chứa chữ 'z' hoặc 'Z'
    const effectiveTtsText =
      typeof beat?.ttsText === 'string' && beat.ttsText.trim().length > 0
        ? beat.ttsText
        : typeof beat?.text === 'string' && beat.text.trim().length > 0
        ? beat.text
        : typeof beat?.narrationText === 'string'
        ? beat.narrationText
        : '';

    if (/[zZ]/.test(effectiveTtsText)) {
      const badTokens = [
        ...new Set(
          (effectiveTtsText.match(/[^\s,.;:!?()[\]{}"'“”‘’]*?[zZ][^\s,.;:!?()[\]{}"'“”‘’]*/g) || []).filter(Boolean)
        ),
      ];
      errors.push({
        code: 'TTS_CONTAINS_Z',
        beatId,
        beatIndex: bIdx,
        message: `ttsText chứa chữ 'z'/'Z' (${badTokens.map((t) => `"${t}"`).join(', ') || 'ký tự z/Z'}) -> cần phiên âm Việt hóa để VieNeu-TTS đọc chuẩn.`,
      });
    }

    // 5. Cảnh báo mảng actors có 2 nhân vật kết thúc cách nhau < 200px
    if (actors.length >= 2) {
      const endPositions = actors.map((actor, idx) => ({
        idx,
        preset: String(actor?.preset ?? `actor#${idx + 1}`),
        endX: resolveActorEndX(actor, idx, actors.length),
      }));

      for (let i = 0; i < endPositions.length; i++) {
        for (let j = i + 1; j < endPositions.length; j++) {
          const a = endPositions[i];
          const b = endPositions[j];
          const dist = Math.abs(a.endX - b.endX);
          if (dist < 200) {
            warnings.push({
              code: 'ACTORS_TOO_CLOSE',
              beatId,
              beatIndex: bIdx,
              message: `2 nhân vật kết thúc cách nhau ${Math.round(dist)}px < 200px: #${a.idx + 1} ${a.preset} (endX=${a.endX}) & #${b.idx + 1} ${b.preset} (endX=${b.endX}) -> cảnh báo đứng quá sát!`,
            });
          }
        }
      }
    }

    // 6. V21.0 Cảnh báo: beat sân khấu (fullScreenVisual !== true) có actor ở pose TALK_GESTURE / SCRATCH_HEAD
    //    hoặc text chứa dấu "?" mà không có actor nào gắn bubble
    if (beat?.fullScreenVisual !== true && actors.length > 0) {
      const hasAnyActorBubble = actors.some(
        (actor) => typeof actor?.bubble === 'string' && actor.bubble.trim().length > 0
      );
      if (!hasAnyActorBubble) {
        const isBubbleWorthyPose = (rawPose) => {
          const key = String(rawPose ?? '').trim().toUpperCase();
          return key === 'TALK_GESTURE' || key === 'SCRATCH_HEAD';
        };
        const hasTalkOrScratchActor = actors.some(
          (actor) =>
            isBubbleWorthyPose(actor?.pose) ||
            (Array.isArray(actor?.timeline) &&
              actor.timeline.some((kf) => isBubbleWorthyPose(kf?.pose)))
        );
        const displayText =
          typeof beat?.text === 'string'
            ? beat.text
            : typeof beat?.narrationText === 'string'
            ? beat.narrationText
            : '';
        const hasQuestionInText = displayText.includes('?');

        if (hasTalkOrScratchActor || hasQuestionInText) {
          const reasons = [];
          if (hasTalkOrScratchActor) reasons.push('actor dùng TALK_GESTURE/SCRATCH_HEAD');
          if (hasQuestionInText) reasons.push('text chứa dấu "?"');
          warnings.push({
            code: 'MISSING_SPEECH_BUBBLE',
            beatId,
            beatIndex: bIdx,
            message: `Beat sân khấu (${reasons.join(' & ')}) nhưng chưa có actor nào gắn bubble thoại ngắn.`,
          });
        }
      }
    }

    // 7. V21.0 Cảnh báo: transitionFrames < 18
    if (beat?.transitionFrames !== undefined && beat?.transitionFrames !== null) {
      const tf = parseFiniteNum(beat.transitionFrames);
      if (!Number.isFinite(tf) || tf < 18) {
        warnings.push({
          code: 'SHORT_TRANSITION',
          beatId,
          beatIndex: bIdx,
          message: `transitionFrames = ${beat.transitionFrames} (< 18 frames) -> chuyển cảnh hơi gấp, nên đặt >= 18 frames.`,
        });
      }
    }
  }

  return { errors, warnings, totalBeats: episode.beats.length };
}

export function resolveEpisodeFilePath(rawArg) {
  if (!rawArg || typeof rawArg !== 'string') return null;
  const cleaned = rawArg.trim();
  if (!cleaned) return null;
  if (path.isAbsolute(cleaned)) return cleaned;
  const fromCwd = path.resolve(process.cwd(), cleaned);
  if (fs.existsSync(fromCwd)) return fromCwd;
  const fromStudio = path.resolve(WEB_STUDIO_ROOT, cleaned);
  if (fs.existsSync(fromStudio)) return fromStudio;
  return fromCwd;
}

function parseEpisodeArg(argv) {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--episode=')) return arg.slice('--episode='.length).trim();
    if (arg === '--episode' && argv[i + 1]) return argv[++i].trim();
    if (!arg.startsWith('-')) return arg.trim();
  }
  return '';
}

function runCli() {
  const rawArg = parseEpisodeArg(process.argv.slice(2));
  if (!rawArg) {
    console.error('Cách dùng: node scripts/validate_episode.mjs episodes/<ten_file>.json');
    process.exit(1);
  }

  const episodePath = resolveEpisodeFilePath(rawArg);
  if (!episodePath || !fs.existsSync(episodePath)) {
    console.error(`[LỖI] Không tìm thấy file kịch bản: ${rawArg}`);
    process.exit(1);
  }

  let registeredVisuals;
  try {
    registeredVisuals = loadRegisteredCustomVisuals();
  } catch (err) {
    console.error(`[LỖI] Không đọc được EPISODE_VISUAL_REGISTRY: ${err.message}`);
    process.exit(1);
  }

  let episodeJson;
  try {
    episodeJson = JSON.parse(fs.readFileSync(episodePath, 'utf8'));
  } catch (err) {
    console.error(`[LỖI] File JSON sai cú pháp (${episodePath}): ${err.message}`);
    process.exit(1);
  }

  const result = validateEpisodeData(episodeJson, registeredVisuals);

  console.log('====================================================================');
  console.log(`KIỂM ĐỊNH KỊCH BẢN TỰ ĐỘNG V21.0`);
  console.log(`-> File: ${episodePath}`);
  console.log(`-> Tiêu đề: ${episodeJson?.title ?? '(chưa đặt tên)'}`);
  console.log(`-> Số beat: ${result.totalBeats} | Registry visuals: ${registeredVisuals.size}`);
  console.log('====================================================================');

  if (result.errors.length > 0) {
    console.log(`\n❌ PHÁT HIỆN ${result.errors.length} LỖI NGHIÊM TRỌNG:`);
    for (let i = 0; i < result.errors.length; i++) {
      const e = result.errors[i];
      const beatLabel = e.beatIndex >= 0 ? `Beat #${e.beatIndex + 1} (${e.beatId})` : 'Cấu trúc JSON';
      console.log(`  ${i + 1}. [${e.code}] ${beatLabel}: ${e.message}`);
    }
  } else {
    console.log('\n✅ KHÔNG CÓ LỖI NGHIÊM TRỌNG.');
  }

  if (result.warnings.length > 0) {
    console.log(`\n⚠️  PHÁT HIỆN ${result.warnings.length} CẢNH BÁO:`);
    for (let i = 0; i < result.warnings.length; i++) {
      const w = result.warnings[i];
      const beatLabel = w.beatIndex >= 0 ? `Beat #${w.beatIndex + 1} (${w.beatId})` : 'Cấu trúc JSON';
      console.log(`  ${i + 1}. [${w.code}] ${beatLabel}: ${w.message}`);
    }
  } else {
    console.log('✅ KHÔNG CÓ CẢNH BÁO.');
  }

  console.log('\n--------------------------------------------------------------------');
  if (result.errors.length > 0) {
    console.log(
      `KẾT QUẢ: FAIL (${result.errors.length} lỗi nghiêm trọng, ${result.warnings.length} cảnh báo) -> exit code 1`
    );
    process.exit(1);
  } else {
    console.log(
      `KẾT QUẢ: PASS (0 lỗi nghiêm trọng, ${result.warnings.length} cảnh báo) -> exit code 0`
    );
    process.exit(0);
  }
}

function isDirectCliInvocation() {
  if (typeof process.argv[1] !== 'string' || !process.argv[1]) return false;
  try {
    const a = fs.realpathSync(process.argv[1]);
    const b = fs.realpathSync(__filename);
    return process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
  } catch {
    const a = path.resolve(process.argv[1]);
    const b = path.resolve(__filename);
    return process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
  }
}

if (isDirectCliInvocation()) {
  runCli();
}
