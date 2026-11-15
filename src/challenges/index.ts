import type { ComponentType } from "react";
import SoftLanding from "./SoftLanding";
import RadiationBelts from "./RadiationBelts";
import BoulderField from "./BoulderField";
import WalkBack from "./WalkBack";
import EntrySequence from "./EntrySequence";
import DustStorm from "./DustStorm";
import RotorHover from "./RotorHover";
import SurveyPass from "./SurveyPass";
import EarthPointing from "./EarthPointing";
import PowerBudget from "./PowerBudget";

export interface ChallengeProps {
  /** msg is a SIMPLIFIED MODEL result line; factId optionally names a verified fact to show beside it. */
  onWin: (msg: string, factId?: string) => void;
  onLose: (msg: string) => void;
}

/** One module per challenge. No two missions share a mechanic. */
export const CHALLENGES: Record<string, ComponentType<ChallengeProps>> = {
  "radiation-belts": RadiationBelts,
  "soft-landing": SoftLanding,
  "boulder-field": BoulderField,
  "walk-back": WalkBack,
  "entry-sequence": EntrySequence,
  "dust-storm": DustStorm,
  "rotor-hover": RotorHover,
  "survey-pass": SurveyPass,
  "earth-pointing": EarthPointing,
  "power-budget": PowerBudget,
};
