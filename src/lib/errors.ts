export class CliError extends Error {
  code: number;
  details?: unknown;

  constructor(message: string, code = 1, details?: unknown) {
    super(message);
    this.name = "CliError";
    this.code = code;
    this.details = details;
  }
}

export class HttpError extends CliError {
  status: number;

  constructor(status: number, message: string, details?: unknown) {
    super(message, status === 401 ? 2 : 1, details);
    this.name = "HttpError";
    this.status = status;
  }
}
