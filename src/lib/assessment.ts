import type {AssessmentTemplate,Domain,Phase} from '@prisma/client';
export function matchAssessmentTemplate(templates:AssessmentTemplate[],input:{phase:Phase;domain:Domain;subject:string;grade:string}){return templates.find(t=>t.active&&t.phase===input.phase&&t.domain===input.domain&&t.subject.trim().toLocaleLowerCase()===input.subject.trim().toLocaleLowerCase()&&t.grade===input.grade)??null;}
