// Every response that is not a 2xx holds `{ error: { code, message } }`. The
// specification in tinacmsv4 plans/007 records the code table, until the ADR for the
// error model exists. The tests hold the literal values.
export const errorResponse = (
  status: number,
  code: string,
  message: string
): Response => Response.json({ error: { code, message } }, { status });
