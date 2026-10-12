import type {
  Deficiency,
  DeficiencyLikelihood,
  Magnitude,
  Severity
} from '../domain/deficiency.js';

const SEVERITY_ORDER: readonly Severity[] = [
  'deficiency',
  'significant-deficiency',
  'material-weakness'
];

export function severityRank(severity: Severity): number {
  return SEVERITY_ORDER.indexOf(severity);
}

export function maxSeverity(severities: readonly Severity[]): Severity | undefined {
  let best: Severity | undefined;
  for (const severity of severities) {
    if (best === undefined || severityRank(severity) > severityRank(best)) best = severity;
  }
  return best;
}

function bump(severity: Severity): Severity {
  const index = Math.min(SEVERITY_ORDER.length - 1, severityRank(severity) + 1);
  return SEVERITY_ORDER[index] as Severity;
}

export interface Classification {
  severity: Severity;
  rationale: string;
}

/**
 * Deterministic ICFR severity classification from likelihood × magnitude, with
 * an escalation for a pervasive (entity-level / ITGC) control.
 */
export function classifyDeficiency(input: {
  likelihood: DeficiencyLikelihood;
  magnitude: Magnitude;
  pervasive?: boolean;
}): Classification {
  const { likelihood, magnitude } = input;
  const notes: string[] = [];

  let severity: Severity;
  if (magnitude === 'material' && likelihood !== 'remote') {
    severity = 'material-weakness';
    notes.push(
      `material magnitude with ${likelihood} likelihood → reasonable possibility a material misstatement is not prevented/detected`
    );
  } else if (magnitude === 'more-than-inconsequential' || magnitude === 'material') {
    severity = 'significant-deficiency';
    notes.push(`more than inconsequential magnitude with ${likelihood} likelihood`);
  } else {
    severity = 'deficiency';
    notes.push('inconsequential magnitude');
  }

  if (input.pervasive && severity !== 'material-weakness') {
    const escalated = bump(severity);
    notes.push(`escalated from ${severity} to ${escalated} because the control is pervasive`);
    severity = escalated;
  }

  return { severity, rationale: notes.join('; ') };
}

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
export function aggregateDeficiencies(deficiencies: readonly Deficiency[]): AggregationResult {
  const byKey = new Map<string, Deficiency[]>();
  for (const deficiency of deficiencies) {
    const key = deficiency.controlId ?? 'unassigned';
    const bucket = byKey.get(key) ?? [];
    bucket.push(deficiency);
    byKey.set(key, bucket);
  }

  const groups: AggregationGroup[] = [];
  const notes: string[] = [];

  for (const [key, bucket] of byKey) {
    const severities = bucket.map((deficiency) => deficiency.severity);
    const severity = maxSeverity(severities) as Severity;
    const significantPlus = severities.filter(
      (candidate) => severityRank(candidate) >= severityRank('significant-deficiency')
    ).length;
    const aggregated = significantPlus >= 2 || severity === 'material-weakness';
    if (significantPlus >= 2) {
      notes.push(
        `${significantPlus} significant-or-worse deficiencies in ${key} — assess in combination`
      );
    }
    groups.push({
      key,
      controlId: key === 'unassigned' ? undefined : key,
      count: bucket.length,
      deficiencyIds: bucket.map((deficiency) => deficiency.id),
      severity,
      aggregated
    });
  }

  groups.sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
  const overallSeverity = maxSeverity(deficiencies.map((deficiency) => deficiency.severity));

  return { groups, overallSeverity, notes };
}
