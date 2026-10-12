import type { Control } from '../domain/control.js';
import type { Deficiency } from '../domain/deficiency.js';
import type { Risk } from '../domain/risk.js';
import type { ComponentId } from '../framework/types.js';
export type AssessmentStatus = 'no-coverage' | 'indicators-present' | 'indicators-of-gap';
export interface PrincipleAssessment {
    number: number;
    id: string;
    statement: string;
    component: ComponentId;
    controls: number;
    risks: number;
    deficiencies: number;
    status: AssessmentStatus;
}
export interface ComponentAssessment {
    id: ComponentId;
    name: string;
    controls: number;
    risks: number;
    deficiencies: number;
    status: AssessmentStatus;
    principles: PrincipleAssessment[];
}
/**
 * Data-driven indicators for whether each COSO principle is addressed. This
 * reports coverage and known deficiencies; it does **not** assert that a
 * principle is effective — that remains an auditor judgment.
 */
export declare function assessPrinciples(input: {
    controls: readonly Control[];
    risks: readonly Risk[];
    deficiencies: readonly Deficiency[];
}): PrincipleAssessment[];
export declare function assessComponents(controls: readonly Control[], risks: readonly Risk[], deficiencies: readonly Deficiency[]): ComponentAssessment[];
export interface IntegrationCheck {
    totalPrinciples: number;
    coveredPrinciples: number;
    uncoveredPrincipleNumbers: number[];
    uncoveredComponents: string[];
    notes: string[];
}
/** Check that all five components have some coverage (they operate together). */
export declare function integrationCheck(components: readonly ComponentAssessment[]): IntegrationCheck;
//# sourceMappingURL=assessment.d.ts.map