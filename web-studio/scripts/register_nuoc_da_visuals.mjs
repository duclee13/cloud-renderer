import fs from 'node:fs';
import path from 'node:path';

const indexPath = path.resolve(process.cwd(), 'src/components/v7/episodeVisuals/index.ts');
let src = fs.readFileSync(indexPath, 'utf8');

if (src.includes('NUOCDA_HOT_NOON_GULP')) {
  console.log('NuocDa visuals already registered in index.ts — skipping.');
  process.exit(0);
}

const importBlock = `import {
  NuocDaHotNoonGulpVisual,
  NuocDaBrainNotFrozenVisual,
  NuocDaPalateTargetVisual,
  NuocDaSpeedVsSlowVisual,
  NuocDaVesselConstrictDilateVisual,
  NuocDaTrigeminalWireVisual,
  NuocDaReferredPainMapVisual,
} from './nuocDaVisualsPart1';
import {
  NuocDaThermostatAlarmVisual,
  NuocDaTimeline60SecVisual,
  NuocDaMigraineLinkVisual,
  NuocDaBrainVsToothVisual,
  NuocDaColdAirTriggerVisual,
  NuocDaTipTonguePalateVisual,
  NuocDaTipWarmWaterVisual,
  NuocDaTipSipSlowlyVisual,
  NuocDaHappySummerEnjoyVisual,
  NuocDaSummary3RulesVisual,
} from './nuocDaVisualsPart2';
`;

const registryEntries = `
  // Episode: Tại Sao Uống Nước Đá Lạnh Quá Nhanh Lại Đau Buốt Lên Tận Óc? (V21.0)
  NUOCDA_HOT_NOON_GULP: NuocDaHotNoonGulpVisual,
  NUOCDA_BRAIN_NOT_FROZEN: NuocDaBrainNotFrozenVisual,
  NUOCDA_PALATE_TARGET: NuocDaPalateTargetVisual,
  NUOCDA_SPEED_VS_SLOW: NuocDaSpeedVsSlowVisual,
  NUOCDA_VESSEL_CONSTRICT_DILATE: NuocDaVesselConstrictDilateVisual,
  NUOCDA_TRIGEMINAL_WIRE: NuocDaTrigeminalWireVisual,
  NUOCDA_REFERRED_PAIN_MAP: NuocDaReferredPainMapVisual,
  NUOCDA_THERMOSTAT_ALARM: NuocDaThermostatAlarmVisual,
  NUOCDA_TIMELINE_60SEC: NuocDaTimeline60SecVisual,
  NUOCDA_MIGRAINE_LINK: NuocDaMigraineLinkVisual,
  NUOCDA_BRAIN_VS_TOOTH: NuocDaBrainVsToothVisual,
  NUOCDA_COLD_AIR_TRIGGER: NuocDaColdAirTriggerVisual,
  NUOCDA_TIP_TONGUE_PALATE: NuocDaTipTonguePalateVisual,
  NUOCDA_TIP_WARM_WATER: NuocDaTipWarmWaterVisual,
  NUOCDA_TIP_SIP_SLOWLY: NuocDaTipSipSlowlyVisual,
  NUOCDA_HAPPY_SUMMER_ENJOY: NuocDaHappySummerEnjoyVisual,
  NUOCDA_SUMMARY_3_RULES: NuocDaSummary3RulesVisual,
`;

const anchor = 'export type EpisodeVisualProps';
const anchorIdx = src.indexOf(anchor);
if (anchorIdx === -1) throw new Error('Could not find EpisodeVisualProps in index.ts');
src = src.slice(0, anchorIdx) + importBlock + '\n' + src.slice(anchorIdx);

const lastClose = src.lastIndexOf('};');
if (lastClose === -1) throw new Error('Could not find closing }; of EPISODE_VISUAL_REGISTRY');
src = src.slice(0, lastClose) + registryEntries + src.slice(lastClose);

fs.writeFileSync(indexPath, src, 'utf8');
console.log('Successfully registered 17 NuocDa visuals into index.ts (all existing visuals preserved).');
