const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** An opaque record identifier only; access still requires the owning authenticated account. */
export function checkupResumePath(id: string): string | null {
  return UUID_PATTERN.test(id) ? `/checkup?saved=${encodeURIComponent(id)}` : null;
}
