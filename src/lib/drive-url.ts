const ID = /^[a-zA-Z0-9_-]{10,}$/;
export function parseGoogleDriveFileId(input: string): string {
  let url: URL;
  try { url = new URL(input); } catch { throw new Error('Google Drive հղումը վավեր չէ։'); }
  if (!['drive.google.com','docs.google.com'].includes(url.hostname)) throw new Error('Թույլատրվում են միայն Google Drive հղումներ։');
  const candidates = [url.searchParams.get('id'), url.pathname.match(/\/d\/([^/]+)/)?.[1], url.pathname.match(/\/folders\/([^/]+)/)?.[1]];
  const id = candidates.find((value): value is string => !!value && ID.test(value));
  if (!id) throw new Error('Հղումից հնարավոր չէ որոշել Google Drive ֆայլը։');
  return id;
}
