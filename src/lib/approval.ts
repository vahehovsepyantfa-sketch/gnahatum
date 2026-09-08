import type {PrismaClient,Phase} from '@prisma/client';
export async function approveIdempotently(db:PrismaClient,input:{submissionId:string;teacherId:string;phase:Phase;approvedById:string;comments?:string;finalMetrics:object}){return db.approval.upsert({where:{submissionId:input.submissionId},update:{},create:{...input,finalMetrics:input.finalMetrics}})}
