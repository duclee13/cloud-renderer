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
};
