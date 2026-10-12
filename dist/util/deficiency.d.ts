import type { Deficiency, DeficiencyLikelihood, Magnitude, Severity } from '../domain/deficiency.js';
export declare function severityRank(severity: Severity): number;
export declare function maxSeverity(severities: readonly Severity[]): Severity | undefined;
export interface Classification {
    severity: Severity;
    rationale: string;
}
/**
 * Deterministic ICFR severity classification from likelihood × magnitude, with
 * an escalation for a pervasive (entity-level / ITGC) control.
 */
export declare function classifyDeficiency(input: {
    likelihood: DeficiencyLikelihood;
    magnitude: Magnitude;
    pervasive?: boolean;
}): Classification;
export interface AggregationGroup {
    key: string;
    controlId?: string;
    count: number;
    deficiencyIds: string[];
    severity: Severity;
    aggregated: boolean;
}
export interface AggregationResult {
    groups: AggregationGroup[];
    overallSeverity?: Severity;
    notes: string[];
}
/**
 * Group related deficiencies (by control) and flag combinations that may
 * aggregate. Two or more significant deficiencies in the same control, or any
 * material weakness, is flagged for aggregation review.
 */
export declare function aggregateDeficiencies(deficiencies: readonly Deficiency[]): AggregationResult;
//# sourceMappingURL=deficiency.d.ts.map