import { ICIF } from '../framework/icif.js';
function statusFor(controls, risks, deficiencies) {
    if (deficiencies > 0)
        return 'indicators-of-gap';
    if (controls > 0 || risks > 0)
        return 'indicators-present';
    return 'no-coverage';
}
/**
 * Data-driven indicators for whether each COSO principle is addressed. This
 * reports coverage and known deficiencies; it does **not** assert that a
 * principle is effective — that remains an auditor judgment.
 */
export function assessPrinciples(input) {
    const { controls, risks, deficiencies } = input;
    return ICIF.principles.map((principle) => {
        const mappedControls = controls.filter((control) => control.principles.includes(principle.number));
        const mappedRisks = risks.filter((risk) => risk.principles.includes(principle.number));
        const controlIds = new Set(mappedControls.map((control) => control.id));
        const mappedDeficiencies = deficiencies.filter((deficiency) => deficiency.controlId !== undefined && controlIds.has(deficiency.controlId));
        return {
            number: principle.number,
            id: principle.id,
            statement: principle.statement,
            component: principle.component,
            controls: mappedControls.length,
            risks: mappedRisks.length,
            deficiencies: mappedDeficiencies.length,
            status: statusFor(mappedControls.length, mappedRisks.length, mappedDeficiencies.length)
        };
    });
}
export function assessComponents(controls, risks, deficiencies) {
    const principles = assessPrinciples({ controls, risks, deficiencies });
    return ICIF.components.map((component) => {
        const componentPrinciples = principles.filter((principle) => principle.component === component.id);
        const controlsCount = componentPrinciples.reduce((sum, p) => sum + p.controls, 0);
        const risksCount = componentPrinciples.reduce((sum, p) => sum + p.risks, 0);
        const deficienciesCount = componentPrinciples.reduce((sum, p) => sum + p.deficiencies, 0);
        const status = componentPrinciples.some((principle) => principle.status === 'indicators-of-gap')
            ? 'indicators-of-gap'
            : componentPrinciples.every((principle) => principle.status === 'no-coverage')
                ? 'no-coverage'
                : 'indicators-present';
        return {
            id: component.id,
            name: component.name,
            controls: controlsCount,
            risks: risksCount,
            deficiencies: deficienciesCount,
            status,
            principles: componentPrinciples
        };
    });
}
/** Check that all five components have some coverage (they operate together). */
export function integrationCheck(components) {
    const uncoveredComponents = components
        .filter((component) => component.status === 'no-coverage')
        .map((component) => component.id);
    const principles = components.flatMap((component) => component.principles);
    const uncovered = principles.filter((principle) => principle.controls === 0 && principle.risks === 0);
    const notes = [];
    if (uncoveredComponents.length > 0) {
        notes.push(`No coverage recorded for: ${uncoveredComponents.join(', ')}`);
    }
    if (uncovered.length > 0) {
        notes.push(`${uncovered.length} principle(s) have no controls or risks mapped`);
    }
    if (notes.length === 0) {
        notes.push('All five components have some recorded coverage.');
    }
    return {
        totalPrinciples: principles.length,
        coveredPrinciples: principles.length - uncovered.length,
        uncoveredPrincipleNumbers: uncovered.map((principle) => principle.number),
        uncoveredComponents,
        notes
    };
}
//# sourceMappingURL=assessment.js.map