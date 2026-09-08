import type { Role } from '@prisma/client';
export function canAccessTeacher(actor: {id:string;role:Role}, teacher: {userId:string;ldmId:string}) {
  return actor.role === 'ADMIN' || (actor.role === 'TEACHER' && actor.id === teacher.userId) || (actor.role === 'LDM' && actor.id === teacher.ldmId);
}
export function requireRole(actual: Role, allowed: Role[]) { if (!allowed.includes(actual)) throw new Error('Այս գործողության համար թույլտվություն չունեք։'); }
