import * as z from 'zod';
/**
 * CEAVOP — the assertions commonly used to frame control objectives in an
 * ICFR/control review. Labels follow the conventional audit terms.
 */
export declare const ASSERTIONS: readonly [{
    readonly id: "completeness";
    readonly label: "Completeness";
}, {
    readonly id: "existence-occurrence";
    readonly label: "Existence / Occurrence";
}, {
    readonly id: "accuracy";
    readonly label: "Accuracy";
}, {
    readonly id: "valuation";
    readonly label: "Valuation";
}, {
    readonly id: "obligations-rights";
    readonly label: "Obligations / Rights";
}, {
    readonly id: "presentation-disclosure";
    readonly label: "Presentation / Disclosure";
}];
export declare const AssertionIdSchema: any;
export type AssertionId = z.infer<typeof AssertionIdSchema>;
//# sourceMappingURL=assertions.d.ts.map