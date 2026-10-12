import type { Component, ComponentId, IcfFramework, ObjectiveCategory, Principle } from './types.js';
export declare const COMPONENT_IDS: readonly ComponentId[];
/** The complete framework reference (used by the `coso://framework/icif-2013` resource). */
export declare function framework(): IcfFramework;
export declare function listComponents(): Component[];
export declare function getComponent(id: ComponentId): Component | undefined;
export declare function listPrinciples(componentId?: ComponentId): Principle[];
export declare function getPrincipleByNumber(number: number): Principle | undefined;
export declare function getPrincipleById(id: string): Principle | undefined;
export declare function listObjectiveCategories(): ObjectiveCategory[];
//# sourceMappingURL=query.d.ts.map