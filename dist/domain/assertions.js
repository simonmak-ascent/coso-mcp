import * as z from 'zod';
/**
 * CEAVOP — the assertions commonly used to frame control objectives in an
 * ICFR/control review. Labels follow the conventional audit terms.
 */
export const ASSERTIONS = [
    { id: 'completeness', label: 'Completeness' },
    { id: 'existence-occurrence', label: 'Existence / Occurrence' },
    { id: 'accuracy', label: 'Accuracy' },
    { id: 'valuation', label: 'Valuation' },
    { id: 'obligations-rights', label: 'Obligations / Rights' },
    { id: 'presentation-disclosure', label: 'Presentation / Disclosure' }
];
export const AssertionIdSchema = z.enum([
    'completeness',
    'existence-occurrence',
    'accuracy',
    'valuation',
    'obligations-rights',
    'presentation-disclosure'
]);
//# sourceMappingURL=assertions.js.map