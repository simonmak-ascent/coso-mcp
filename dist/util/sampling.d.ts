import type { ControlFrequency } from '../domain/control.js';
export type RiskLevel = 'low' | 'moderate' | 'high';
export interface SampleSizeInput {
    frequency: ControlFrequency;
    risk?: RiskLevel;
    populationSize?: number;
    priorDeficiency?: boolean;
    externalReliance?: boolean;
}
export interface SampleSizeResult {
    frequency: ControlFrequency;
    requestedRisk: RiskLevel;
    effectiveRisk: RiskLevel;
    recommended: number;
    populationSize?: number;
    capped: boolean;
    rationale: string;
}
/** Deterministic sample-size recommendation with a documented rationale. */
export declare function computeSampleSize(input: SampleSizeInput): SampleSizeResult;
/** mulberry32 — a small, fast, seeded PRNG so selection is reproducible. */
export declare function mulberry32(seed: number): () => number;
/** FNV-1a hash of the joined parts, used to derive a stable seed from inputs. */
export declare function hashSeed(parts: readonly string[]): number;
/** Simple random selection without replacement (1-based indices, ascending). */
export declare function randomSelection(size: number, n: number, seed: number): number[];
/** Systematic selection: a random start then every Nth item. */
export declare function systematicSelection(size: number, n: number, seed: number): number[];
/** Haphazard selection: a seeded shuffle, no fixed interval. */
export declare function haphazardSelection(size: number, n: number, seed: number): number[];
//# sourceMappingURL=sampling.d.ts.map