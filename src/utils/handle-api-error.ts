import axios from "axios";

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong"
): string {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.message;
    const nestedMessage = error.response?.data?.error?.message;
    const firstValidationError = error.response?.data?.errors?.[0]?.message
      ?? error.response?.data?.errors?.[0];

    if (typeof responseMessage === "string" && responseMessage.trim()) {
      return responseMessage;
    }
    if (typeof nestedMessage === "string" && nestedMessage.trim()) {
      return nestedMessage;
    }
    if (typeof firstValidationError === "string" && firstValidationError.trim()) {
      return firstValidationError;
    }
    if (typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
