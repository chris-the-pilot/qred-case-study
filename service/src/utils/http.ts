export const response = (statusCode: number, body: unknown) => ({
  statusCode,
  body: JSON.stringify(body),
});
