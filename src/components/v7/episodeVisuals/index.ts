import React from 'react';
import {
  GumIngredientsSplitVisual,
  EsophagusSlideVisual,
  StomachAcidDissolveVisual,
  EnzymeBounceOffVisual,
  MucusSlipDemoVisual,
  StomachChurnPushVisual,
  CornHuskVsGumVisual,
  IntestinePeristalsisVisual,
  GumClumpBlockageVisual,
  WatermelonSeedStomachVisual,
  GumSummaryTimelineVisual,
} from './nuotKeoCaoSuVisuals';
import {
  MosquitoCo2RadarVisual,
  MosquitoSweatAcidVisual,
  MosquitoHeatCameraVisual,
  MosquitoBloodTypeOVisual,
  MosquitoColorClothesVisual,
  MosquitoFemaleOnlyVisual,
  MosquitoProboscisNeedleVisual,
  MosquitoItchHistamineVisual,
  MosquitoScratchLoopVisual,
  MosquitoFanWindVisual,
  MosquitoPreventionCheckVisual,
  MosquitoSummaryRadarVisual,
} from './taiSaoMuoiDotVisuals';
import {
  SayXeCarInteriorPhoneVisual,
  SayXeCarDizzyWavesVisual,
  SayXeCarStopBreatheVisual,
  SayXeEyeSeesStillVisual,
  SayXeInnerEarFluidVisual,
  SayXeSensoryConflictVisual,
  SayXeBrainPoisonAlarmVisual,
  SayXeStomachEjectNauseaVisual,
  SayXeReadBookVsWindowVisual,
} from './sayXeVisualsPart1';
import {
  SayXeDriverPredictsVisual,
  SayXePassengerBlindsidedVisual,
  SayXeAgeGroupChartVisual,
  SayXeTipLookHorizonVisual,
  SayXeTipFrontSeatVisual,
  SayXeTipFreshAirGingerVisual,
  SayXeTipPutPhoneDownVisual,
  SayXeHappyTripReturnVisual,
  SayXeSummary3RulesVisual,
} from './sayXeVisualsPart2';
import {
  MoiCanhHumidPorchLampVisual,
  MoiCanhUndergroundColonyVisual,
  MoiCanhWeatherTriggerVisual,
  MoiCanhSwarmEmergenceVisual,
  MoiCanhOldMoonMythVisual,
  MoiCanhDorsalLightSkyVisual,
  MoiCanhLampTrapOrbitVisual,
  MoiCanhWhiteVsYellowLightVisual,
  MoiCanhWingSheddingVisual,
} from './moiCanhVisualsPart1';
import {
  MoiCanhTandemRunningVisual,
  MoiCanhNewColonyWoodVisual,
  MoiCanhTermiteVsAntVisual,
  MoiCanhTipTurnOffLightsVisual,
  MoiCanhTipWaterBasinTrapVisual,
  MoiCanhTipWoodMoistureVisual,
  MoiCanhPeacefulRainyNightVisual,
  MoiCanhSummary3RulesVisual,
} from './moiCanhVisualsPart2';
import {
  GiatMinhBedroomFallJerkVisual,
  GiatMinhSleepBorderN1Visual,
  GiatMinhBodyWindDownVisual,
  GiatMinhBrainstemHandoffVisual,
  GiatMinhPrimateTreeBranchVisual,
  GiatMinhBrainTestPingVisual,
  GiatMinhCulpritFatigueVisual,
} from './giatMinhVisualsPart1';
import {
  GiatMinhCulpritCaffeineVisual,
  GiatMinhCulpritStressScreenVisual,
  GiatMinhVsSleepParalysisVisual,
  GiatMinhTipScheduleCaffeineVisual,
  GiatMinhTipWindDownRoomVisual,
  GiatMinhPeacefulSummaryVisual,
} from './giatMinhVisualsPart2';

import {
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

export type EpisodeVisualProps = {
  progress: number;
  frame: number;
  fps: number;
  step?: number;
  visualStep?: number;
};

export const EPISODE_VISUAL_REGISTRY: Record<string, React.FC<EpisodeVisualProps>> = {
  // Episode: Nuốt Kẹo Cao Su
  GUM_INGREDIENTS_SPLIT: GumIngredientsSplitVisual,
  ESOPHAGUS_SLIDE: EsophagusSlideVisual,
  STOMACH_ACID_DISSOLVE: StomachAcidDissolveVisual,
  ENZYME_BOUNCE_OFF: EnzymeBounceOffVisual,
  MUCUS_SLIP_DEMO: MucusSlipDemoVisual,
  STOMACH_CHURN_PUSH: StomachChurnPushVisual,
  CORN_HUSK_VS_GUM: CornHuskVsGumVisual,
  INTESTINE_PERISTALSIS: IntestinePeristalsisVisual,
  GUM_CLUMP_BLOCKAGE: GumClumpBlockageVisual,
  WATERMELON_SEED_STOMACH: WatermelonSeedStomachVisual,
  GUM_SUMMARY_TIMELINE: GumSummaryTimelineVisual,

  // Episode: Tại Sao Muỗi Chỉ Đốt Đúng 1 Người?
  MOSQUITO_CO2_RADAR: MosquitoCo2RadarVisual,
  MOSQUITO_SWEAT_ACID: MosquitoSweatAcidVisual,
  MOSQUITO_HEAT_CAMERA: MosquitoHeatCameraVisual,
  MOSQUITO_BLOOD_TYPE_O: MosquitoBloodTypeOVisual,
  MOSQUITO_COLOR_CLOTHES: MosquitoColorClothesVisual,
  MOSQUITO_FEMALE_ONLY: MosquitoFemaleOnlyVisual,
  MOSQUITO_PROBOSCIS_NEEDLE: MosquitoProboscisNeedleVisual,
  MOSQUITO_ITCH_HISTAMINE: MosquitoItchHistamineVisual,
  MOSQUITO_SCRATCH_LOOP: MosquitoScratchLoopVisual,
  MOSQUITO_FAN_WIND: MosquitoFanWindVisual,
  MOSQUITO_PREVENTION_CHECK: MosquitoPreventionCheckVisual,
  MOSQUITO_SUMMARY_RADAR: MosquitoSummaryRadarVisual,

  // Episode: Tại Sao Đọc Điện Thoại Trên Xe Lại Bị Say Xe? (V20.2)
  SAYXE_CAR_INTERIOR_PHONE: SayXeCarInteriorPhoneVisual,
  SAYXE_CAR_DIZZY_WAVES: SayXeCarDizzyWavesVisual,
  SAYXE_CAR_STOP_BREATHE: SayXeCarStopBreatheVisual,
  SAYXE_EYE_SEES_STILL: SayXeEyeSeesStillVisual,
  SAYXE_INNER_EAR_FLUID: SayXeInnerEarFluidVisual,
  SAYXE_SENSORY_CONFLICT: SayXeSensoryConflictVisual,
  SAYXE_BRAIN_POISON_ALARM: SayXeBrainPoisonAlarmVisual,
  SAYXE_STOMACH_EJECT_NAUSEA: SayXeStomachEjectNauseaVisual,
  SAYXE_READ_BOOK_VS_WINDOW: SayXeReadBookVsWindowVisual,
  SAYXE_DRIVER_PREDICTS: SayXeDriverPredictsVisual,
  SAYXE_PASSENGER_BLINDSIDED: SayXePassengerBlindsidedVisual,
  SAYXE_AGE_GROUP_CHART: SayXeAgeGroupChartVisual,
  SAYXE_TIP_LOOK_HORIZON: SayXeTipLookHorizonVisual,
  SAYXE_TIP_FRONT_SEAT: SayXeTipFrontSeatVisual,
  SAYXE_TIP_FRESH_AIR_GINGER: SayXeTipFreshAirGingerVisual,
  SAYXE_TIP_PUT_PHONE_DOWN: SayXeTipPutPhoneDownVisual,
  SAYXE_HAPPY_TRIP_RETURN: SayXeHappyTripReturnVisual,
  SAYXE_SUMMARY_3_RULES: SayXeSummary3RulesVisual,

  // Episode: Tại Sao Mối Cánh Hay Bay Bu Đèn Đêm Sắp Mưa? (V20.2)
  MOICANH_HUMID_PORCH_LAMP: MoiCanhHumidPorchLampVisual,
  MOICANH_UNDERGROUND_COLONY: MoiCanhUndergroundColonyVisual,
  MOICANH_WEATHER_TRIGGER: MoiCanhWeatherTriggerVisual,
  MOICANH_SWARM_EMERGENCE: MoiCanhSwarmEmergenceVisual,
  MOICANH_OLD_MOON_MYTH: MoiCanhOldMoonMythVisual,
  MOICANH_DORSAL_LIGHT_SKY: MoiCanhDorsalLightSkyVisual,
  MOICANH_LAMP_TRAP_ORBIT: MoiCanhLampTrapOrbitVisual,
  MOICANH_WHITE_VS_YELLOW_LIGHT: MoiCanhWhiteVsYellowLightVisual,
  MOICANH_WING_SHEDDING: MoiCanhWingSheddingVisual,
  MOICANH_TANDEM_RUNNING: MoiCanhTandemRunningVisual,
  MOICANH_NEW_COLONY_WOOD: MoiCanhNewColonyWoodVisual,
  MOICANH_TERMITE_VS_ANT: MoiCanhTermiteVsAntVisual,
  MOICANH_TIP_TURN_OFF_LIGHTS: MoiCanhTipTurnOffLightsVisual,
  MOICANH_TIP_WATER_BASIN_TRAP: MoiCanhTipWaterBasinTrapVisual,
  MOICANH_TIP_WOOD_MOISTURE: MoiCanhTipWoodMoistureVisual,
  MOICANH_PEACEFUL_RAINY_NIGHT: MoiCanhPeacefulRainyNightVisual,
  MOICANH_SUMMARY_3_RULES: MoiCanhSummary3RulesVisual,

  // Episode: Tại Sao Đang Sắp Ngủ Lại Giật Mình Như Rơi Từ Trên Cao Xuống? (V21.0)
  GIATMINH_BEDROOM_FALL_JERK: GiatMinhBedroomFallJerkVisual,
  GIATMINH_SLEEP_BORDER_N1: GiatMinhSleepBorderN1Visual,
  GIATMINH_BODY_WIND_DOWN: GiatMinhBodyWindDownVisual,
  GIATMINH_BRAINSTEM_HANDOFF: GiatMinhBrainstemHandoffVisual,
  GIATMINH_PRIMATE_TREE_BRANCH: GiatMinhPrimateTreeBranchVisual,
  GIATMINH_BRAIN_TEST_PING: GiatMinhBrainTestPingVisual,
  GIATMINH_CULPRIT_FATIGUE: GiatMinhCulpritFatigueVisual,
  GIATMINH_CULPRIT_CAFFEINE: GiatMinhCulpritCaffeineVisual,
  GIATMINH_CULPRIT_STRESS_SCREEN: GiatMinhCulpritStressScreenVisual,
  GIATMINH_VS_SLEEP_PARALYSIS: GiatMinhVsSleepParalysisVisual,
  GIATMINH_TIP_SCHEDULE_CAFFEINE: GiatMinhTipScheduleCaffeineVisual,
  GIATMINH_TIP_WINDDOWN_ROOM: GiatMinhTipWindDownRoomVisual,
  GIATMINH_PEACEFUL_SUMMARY: GiatMinhPeacefulSummaryVisual,

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
};
