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

export type EpisodeVisualProps = {
  progress: number;
  frame: number;
  fps: number;
};

export const EPISODE_VISUAL_REGISTRY: Record<string, React.FC<EpisodeVisualProps>> = {
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
};
