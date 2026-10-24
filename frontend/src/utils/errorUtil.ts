export function extractErrorMessage(err: any, fallback = 'Operation failed'): string {
  if (!err) return fallback;
  const data = err.response?.data;
  if (data?.fieldErrors && Array.isArray(data.fieldErrors) && data.fieldErrors.length > 0) {
    return data.fieldErrors.map((f: any) => `${f.field ? `${f.field}: ` : ''}${f.message}`).join(', ');
  }
  return data?.message || err.message || fallback;
}
