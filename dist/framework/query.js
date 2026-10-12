import { ICIF } from './icif.js';
export const COMPONENT_IDS = [
    'control-environment',
    'risk-assessment',
    'control-activities',
    'information-communication',
    'monitoring-activities'
];
/** The complete framework reference (used by the `coso://framework/icif-2013` resource). */
export function framework() {
    return ICIF;
}
export function listComponents() {
    return [...ICIF.components];
}
export function getComponent(id) {
    return ICIF.components.find((component) => component.id === id);
}
export function listPrinciples(componentId) {
    const principles = componentId
        ? ICIF.principles.filter((principle) => principle.component === componentId)
        : ICIF.principles;
    return [...principles].sort((a, b) => a.number - b.number);
}
export function getPrincipleByNumber(number) {
    return ICIF.principles.find((principle) => principle.number === number);
}
export function getPrincipleById(id) {
    return ICIF.principles.find((principle) => principle.id === id);
}
export function listObjectiveCategories() {
    return [...ICIF.objectiveCategories];
}
//# sourceMappingURL=query.js.map