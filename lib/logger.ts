const isProd = process.env.NODE_ENV === "production";

const formatError = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return String(error);
};

export const log = (...args: string[]) => {
  if (!isProd) console.log(...args);
};

export const logError = (message: string, error?: unknown) => {
  if (error === undefined) {
    console.error(message);
    return;
  }
  console.error(message, formatError(error));
};
