import type { Control } from '../domain/control.js';
import type { Engagement } from '../domain/engagement.js';
import type { Population } from '../domain/population.js';
import type { Risk } from '../domain/risk.js';
import type { Sample } from '../domain/sample.js';
import type { Exception, TestResult } from '../domain/test-result.js';
export interface WorkpaperContext {
    engagement: Engagement;
    control: Control;
    risks: Risk[];
    population?: Population;
    sample?: Sample;
    testResults: TestResult[];
    exceptions: Exception[];
}
/** Render a control-testing workpaper as Markdown. */
export declare function renderWorkpaper(context: WorkpaperContext): string;
//# sourceMappingURL=workpaper.d.ts.map