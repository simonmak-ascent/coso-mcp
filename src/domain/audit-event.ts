import * as z from 'zod';

import { TimestampSchema } from './common.js';

export const AuditEntityTypeSchema = z.enum([
  'engagement',
  'scope',
  'risk',
  'control',
  'population',
  'sample',
  'test',
  'exception',
  'workpaper',
  'deficiency'
]);

export const AuditEventSchema = z.object({
  at: TimestampSchema,
  actor: z.string().default('local'),
  action: z.string().min(1),
  entityType: AuditEntityTypeSchema,
  entityId: z.string().min(1),
  engagementId: z.string().min(1),
  details: z.record(z.string(), z.unknown()).optional()
});
export type AuditEvent = z.infer<typeof AuditEventSchema>;
