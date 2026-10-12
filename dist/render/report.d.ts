import type { Control } from '../domain/control.js';
import type { Deficiency } from '../domain/deficiency.js';
import type { Engagement } from '../domain/engagement.js';
import type { Risk } from '../domain/risk.js';
import type { Sample } from '../domain/sample.js';
import type { ScopeItem } from '../domain/scope.js';
import type { Exception, TestResult } from '../domain/test-result.js';
import type { Workpaper } from '../domain/workpaper.js';
import type { ComponentAssessment, IntegrationCheck } from '../util/assessment.js';
export interface ReportContext {
    engagement: Engagement;
    scopeItems: ScopeItem[];
    risks: Risk[];
    controls: Control[];
    samples: Sample[];
    testResults: TestResult[];
    exceptions: Exception[];
    workpapers: Workpaper[];
    deficiencies: Deficiency[];
    componentAssessments: ComponentAssessment[];
    integration: IntegrationCheck;
}
/** Render the engagement review report as Markdown. */
export declare function renderEngagementReport(context: ReportContext): string;
//# sourceMappingURL=report.d.ts.map