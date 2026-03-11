export function apiResponse<T>(data: T, message = 'Success') {
  return { success: true, message, data, errors: null };
}

export function apiError(message: string, errors: any = null) {
  return { success: false, message, data: null, errors };
}
