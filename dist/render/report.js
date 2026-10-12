import { DISCLAIMER, FRAMEWORK_LABEL } from '../version.js';
function table(headers, rows) {
    if (rows.length === 0)
        return '_None._';
    const head = `| ${headers.join(' | ')} |`;
    const divider = `| ${headers.map(() => '---').join(' | ')} |`;
    const body = rows.map((row) => `| ${row.join(' | ')} |`).join('\n');
    return [head, divider, body].join('\n');
}
/** Render the engagement review report as Markdown. */
export function renderEngagementReport(context) {
    const { engagement, scopeItems, risks, controls, samples, testResults, exceptions, workpapers, deficiencies, componentAssessments, integration } = context;
    const lines = [];
    lines.push(`# Internal control review report — ${engagement.title}`);
    lines.push('');
    lines.push(`**Entity:** ${engagement.entity}  `);
    lines.push(`**Period:** ${engagement.period ?? '—'}  `);
    lines.push(`**Status:** ${engagement.status}  `);
    lines.push(`**Framework:** ${FRAMEWORK_LABEL}`);
    lines.push('');
    lines.push('## Scope');
    lines.push('');
    lines.push(table(['Id', 'Area', 'Objective', 'Assertions', 'In scope'], scopeItems.map((item) => [
        item.id,
        item.area,
        item.objectiveCategory,
        item.assertions.join(', ') || '—',
        item.inScope ? 'Yes' : 'No'
    ])));
    lines.push('');
    lines.push('## Risks');
    lines.push('');
    lines.push(table(['Id', 'Description', 'Likelihood', 'Fraud', 'Assertions', 'Principles'], risks.map((risk) => [
        risk.id,
        risk.description,
        risk.likelihood,
        risk.fraud ? 'Yes' : 'No',
        risk.assertions.join(', ') || '—',
        risk.principles.join(', ') || '—'
    ])));
    lines.push('');
    lines.push('## Controls');
    lines.push('');
    lines.push(table(['Id', 'Description', 'Type', 'Frequency', 'Key', 'Assertions', 'Principles'], controls.map((control) => [
        control.id,
        control.description,
        control.type,
        control.frequency,
        control.key ? 'Yes' : 'No',
        control.assertions.join(', ') || '—',
        control.principles.join(', ') || '—'
    ])));
    lines.push('');
    lines.push('## Testing');
    lines.push('');
    lines.push(`Populations: ${samples.length > 0 ? samples.length : 0} sample(s) drawn.`);
    lines.push('');
    lines.push(table(['Test', 'Control', 'Attribute', 'Pass', 'Fail', 'N/A', 'Conclusion'], testResults.map((result) => {
        const pass = result.results.filter((row) => row.outcome === 'pass').length;
        const fail = result.results.filter((row) => row.outcome === 'fail').length;
        const na = result.results.filter((row) => row.outcome === 'na').length;
        return [
            result.id,
            result.controlId,
            result.attribute,
            String(pass),
            String(fail),
            String(na),
            result.conclusion ?? 'not concluded'
        ];
    })));
    lines.push('');
    lines.push(`Exceptions noted: ${exceptions.length}.`);
    lines.push('');
    lines.push('## Workpapers');
    lines.push('');
    lines.push(table(['Id', 'Control', 'Status', 'Sign-offs'], workpapers.map((workpaper) => [
        workpaper.id,
        workpaper.controlId,
        workpaper.status,
        workpaper.signOffs.map((signOff) => `${signOff.role}:${signOff.actor}`).join(', ') || '—'
    ])));
    lines.push('');
    lines.push('## Deficiencies');
    lines.push('');
    lines.push(table(['Id', 'Title', 'Control', 'Severity', 'Rationale'], deficiencies.map((deficiency) => [
        deficiency.id,
        deficiency.title,
        deficiency.controlId ?? '—',
        deficiency.severity,
        deficiency.rationale
    ])));
    lines.push('');
    lines.push('## COSO component coverage (indicators)');
    lines.push('');
    lines.push(table(['Component', 'Controls', 'Risks', 'Deficiencies', 'Indicators'], componentAssessments.map((component) => [
        `${component.id} — ${component.name}`,
        String(component.controls),
        String(component.risks),
        String(component.deficiencies),
        component.status
    ])));
    lines.push('');
    lines.push(`Principle coverage: ${integration.coveredPrinciples}/${integration.totalPrinciples}.`);
    if (integration.uncoveredComponents.length > 0) {
        lines.push('');
        lines.push(`Uncovered components: ${integration.uncoveredComponents.join(', ')}.`);
    }
    lines.push('');
    lines.push('## Conclusion');
    lines.push('');
    lines.push('This report summarises recorded review evidence and data-driven coverage indicators. ' +
        'It is not an audit opinion and does not assert that the system of internal control is effective; ' +
        'that conclusion is a matter of professional judgment.');
    lines.push('');
    lines.push(`> ${DISCLAIMER}`);
    return lines.join('\n');
}
//# sourceMappingURL=report.js.map