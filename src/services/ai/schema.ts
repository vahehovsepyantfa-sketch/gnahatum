import { z } from 'zod';
export const questionSchema=z.object({questionNumber:z.string(),studentAnswer:z.string().nullable(),teacherCorrectionDetected:z.boolean(),teacherCorrection:z.string().nullable(),expectedAnswer:z.string().nullable(),isCorrect:z.boolean(),scoreAwarded:z.number().min(0),maxScore:z.number().positive(),confidence:z.number().min(0).max(1),reviewRequired:z.boolean(),reason:z.string().nullable()});
export const analysisSchema=z.object({studentName:z.string().nullable(),overallConfidence:z.number().min(0).max(1),reviewRequired:z.boolean(),score:z.number(),maxScore:z.number(),percentage:z.number(),questions:z.array(questionSchema),summary:z.string(),warnings:z.array(z.string())});
export type AssessmentAnalysis=z.infer<typeof analysisSchema>;
export function normalizeAnalysis(value:unknown, configuredMax:number, threshold=0.85) {
 const parsed=analysisSchema.parse(value); const max=Math.min(configuredMax,parsed.questions.reduce((n,q)=>n+q.maxScore,0)); const score=Math.min(max,parsed.questions.reduce((n,q)=>n+Math.min(q.scoreAwarded,q.maxScore),0));
 return {...parsed,maxScore:max,score,percentage:max ? Math.round(score/max*10000)/100 : 0,reviewRequired:parsed.reviewRequired||parsed.overallConfidence<threshold||parsed.questions.some(q=>q.reviewRequired)};
}
