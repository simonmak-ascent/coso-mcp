import * as z from 'zod';
export declare const WorkpaperStatusSchema: any;
export type WorkpaperStatus = z.infer<typeof WorkpaperStatusSchema>;
export declare const ReviewNoteStatusSchema: any;
export declare const ReviewNoteSchema: any;
export type ReviewNote = z.infer<typeof ReviewNoteSchema>;
export declare const SignOffRoleSchema: any;
export type SignOffRole = z.infer<typeof SignOffRoleSchema>;
export declare const SignOffSchema: any;
export type SignOff = z.infer<typeof SignOffSchema>;
export declare const WorkpaperSchema: any;
export type Workpaper = z.infer<typeof WorkpaperSchema>;
/** The preparer and reviewer sign-offs, if present. */
export declare function findSignOff(workpaper: Workpaper, role: SignOffRole): SignOff | undefined;
//# sourceMappingURL=workpaper.d.ts.map