import type { Control } from '../domain/control.js';
import type { Engagement } from '../domain/engagement.js';
import type { Population } from '../domain/population.js';
import type { Risk } from '../domain/risk.js';
import type { Sample } from '../domain/sample.js';
import type { Exception, TestResult } from '../domain/test-result.js';
import { DISCLAIMER, FRAMEWORK_LABEL } from '../version.js';

export interface WorkpaperContext {
  engagement: Engagement;
  control: Control;
  risks: Risk[];
  population?: Population;
  sample?: Sample;
  testResults: TestResult[];
  exceptions: Exception[];
}

function table(headers: string[], rows: string[][]): string {
  const head = `| ${headers.join(' | ')} |`;
  const divider = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${row.join(' | ')} |`).join('\n');
  return [head, divider, body].filter((line) => line.length > 0).join('\n');
}

function list(values: readonly (string | number)[], fallback = '—'): string {
  return values.length > 0 ? values.join(', ') : fallback;
}

/** Render a control-testing workpaper as Markdown. */
export function renderWorkpaper(context: WorkpaperContext): string {
  const { engagement, control, risks, population, sample, testResults, exceptions } = context;

  const lines: string[] = [];
  lines.push(`# Control testing workpaper — ${control.id}`);
  lines.push('');
  lines.push(`**Engagement:** ${engagement.title} (${engagement.id})  `);
  lines.push(`**Entity:** ${engagement.entity}  `);
  lines.push(`**Period:** ${engagement.period ?? '—'}  `);
  lines.push(`**Framework:** ${FRAMEWORK_LABEL}`);
  lines.push('');

  lines.push('## 1. Control identification');
  lines.push('');
  lines.push(
    table(
      ['Field', 'Value'],
      [
        ['Control id', control.id],
        ['Description', control.description],
        ['Type', control.type],
        ['Frequency', control.frequency],
        ['Key control', control.key ? 'Yes' : 'No'],
        ['Owner', control.owner ?? '—'],
        ['Assertions', list(control.assertions)],
        ['COSO principle(s)', list(control.principles)]
      ]
    )
  );
  lines.push('');

  lines.push('## 2. Risks addressed');
  lines.push('');
  if (risks.length === 0) {
    lines.push('_No risks linked to this control._');
  } else {
    lines.push(
      table(
        ['Risk', 'Description', 'Likelihood', 'Fraud', 'Assertions'],
        risks.map((risk) => [
          risk.id,
          risk.description,
          risk.likelihood,
          risk.fraud ? 'Yes' : 'No',
          list(risk.assertions)
        ])
      )
    );
  }
  lines.push('');

  lines.push('## 3. Population and sample');
  lines.push('');
  if (!population) {
    lines.push('_No population registered for this control._');
  } else {
    lines.push(
      table(
        ['Field', 'Value'],
        [
          ['Population', `${population.id} — ${population.description}`],
          ['Declared size', String(population.declaredSize ?? population.items.length)],
          ['Period', population.period ?? '—']
        ]
      )
    );
  }
  if (sample) {
    lines.push('');
    lines.push(
      table(
        ['Sample', 'Method', 'Size', 'Seed', 'Selected references'],
        [
          [
            sample.id,
            sample.method,
            String(sample.sampleSize),
            String(sample.seed),
            list(sample.selectedReferences)
          ]
        ]
      )
    );
    if (sample.rationale) {
      lines.push('');
      lines.push(`_Selection rationale:_ ${sample.rationale}`);
    }
  }
  lines.push('');

  lines.push('## 4. Test results');
  lines.push('');
  if (testResults.length === 0) {
    lines.push('_No test results recorded._');
  } else {
    for (const result of testResults) {
      lines.push(`### ${result.id} — ${result.attribute}`);
      lines.push('');
      if (result.procedure) {
        lines.push(`_Procedure:_ ${result.procedure}`);
        lines.push('');
      }
      lines.push(
        table(
          ['Reference', 'Outcome', 'Evidence', 'Note'],
          result.results.map((row) => [
            row.reference,
            row.outcome,
            row.evidenceRef ?? '—',
            row.note ?? '—'
          ])
        )
      );
      const pass = result.results.filter((r) => r.outcome === 'pass').length;
      const fail = result.results.filter((r) => r.outcome === 'fail').length;
      const na = result.results.filter((r) => r.outcome === 'na').length;
      lines.push('');
      lines.push(`Pass ${pass} / Fail ${fail} / N/A ${na}. Conclusion: ${result.conclusion ?? 'not concluded'}.`);
      lines.push('');
    }
  }

  lines.push('## 5. Exceptions');
  lines.push('');
  if (exceptions.length === 0) {
    lines.push('_No exceptions noted._');
  } else {
    lines.push(
      table(
        ['Id', 'Reference', 'Description', 'Root cause', 'Impact'],
        exceptions.map((exception) => [
          exception.id,
          exception.reference,
          exception.description,
          exception.rootCause ?? '—',
          exception.impact ?? '—'
        ])
      )
    );
  }
  lines.push('');

  lines.push('## 6. Conclusion and sign-off');
  lines.push('');
  lines.push('Preparer: ____________________  Date: __________');
  lines.push('');
  lines.push('Reviewer: ____________________  Date: __________');
  lines.push('');
  lines.push(`> ${DISCLAIMER}`);

  return lines.join('\n');
}
