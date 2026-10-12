/**
 * Types for the COSO Internal Control—Integrated Framework (ICIF-2013)
 * reference data. Paraphrased from public COSO descriptions; see `icif.ts`.
 */

export type ComponentId =
  | 'control-environment'
  | 'risk-assessment'
  | 'control-activities'
  | 'information-communication'
  | 'monitoring-activities';

export type ObjectiveCategoryId = 'operations' | 'reporting' | 'compliance';

/** A point of focus is a characteristic associated with a principle. */
export interface PointOfFocus {
  /** Short slug, stable within a principle (e.g. `tone-at-the-top`). */
  id: string;
  /** Paraphrased summary — not COSO wording. */
  summary: string;
}

export interface Principle {
  /** Framework principle number, 1–17. */
  number: number;
  /** Stable slug, e.g. `integrity-and-ethical-values`. */
  id: string;
  /** The principle statement (public framework wording). */
  statement: string;
  /** Owning component. */
  component: ComponentId;
  /** Paraphrased, illustrative points of focus (a subset; not exhaustive). */
  pointsOfFocus: PointOfFocus[];
}

export interface Component {
  id: ComponentId;
  /** Component order within the framework, 1–5. */
  number: number;
  name: string;
  /** Paraphrased summary. */
  summary: string;
  /** Principle numbers belonging to this component. */
  principles: number[];
}

export interface ObjectiveCategory {
  id: ObjectiveCategoryId;
  name: string;
  /** Paraphrased summary. */
  summary: string;
}

export interface IcfFramework {
  id: string;
  label: string;
  version: string;
  sourceUrl: string;
  /** Paraphrase/provenance note. */
  notice: string;
  components: Component[];
  principles: Principle[];
  objectiveCategories: ObjectiveCategory[];
}
