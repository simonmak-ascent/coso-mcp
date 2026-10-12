import { ICIF } from './icif.js';
import type {
  Component,
  ComponentId,
  IcfFramework,
  ObjectiveCategory,
  Principle
} from './types.js';

export const COMPONENT_IDS: readonly ComponentId[] = [
  'control-environment',
  'risk-assessment',
  'control-activities',
  'information-communication',
  'monitoring-activities'
];

/** The complete framework reference (used by the `coso://framework/icif-2013` resource). */
export function framework(): IcfFramework {
  return ICIF;
}

export function listComponents(): Component[] {
  return [...ICIF.components];
}

export function getComponent(id: ComponentId): Component | undefined {
  return ICIF.components.find((component) => component.id === id);
}

export function listPrinciples(componentId?: ComponentId): Principle[] {
  const principles = componentId
    ? ICIF.principles.filter((principle) => principle.component === componentId)
    : ICIF.principles;
  return [...principles].sort((a, b) => a.number - b.number);
}

export function getPrincipleByNumber(number: number): Principle | undefined {
  return ICIF.principles.find((principle) => principle.number === number);
}

export function getPrincipleById(id: string): Principle | undefined {
  return ICIF.principles.find((principle) => principle.id === id);
}

export function listObjectiveCategories(): ObjectiveCategory[] {
  return [...ICIF.objectiveCategories];
}
