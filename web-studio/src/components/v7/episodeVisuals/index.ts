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

export type EpisodeVisualProps = {
  progress: number;
  frame: number;
  fps: number;
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

  // Episode: Tại Sao Đọc Điện Thoại Trên Xe Lại Bị Say Xe? (V20 Full-Screen 1920x1080)
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
};
