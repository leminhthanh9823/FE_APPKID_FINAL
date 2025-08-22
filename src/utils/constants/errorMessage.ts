export const MESSAGE = {
  REQUIRED_FIELD: '{0} is required',
  MISSING_FIELD: 'Please fill in all required information',
  ADD_SUCCESS: 'Record added successfully',
  ADD_FAIL: 'Failed to add record',
  UPDATE_SUCCESS: 'Record updated successfully',
  UPDATE_FAIL: 'Failed to update record',
  DELETE_SUCCESS: 'Record deleted successfully',
  DELETE_FAIL: 'Failed to delete record',
  CHANGE_PASS_SUCCESS: 'Password changed successfully! Please log in again.',
  DATA_LOAD_FAIL: 'Failed to load data',
  SERVER_CONNECTION_ERROR: 'Unable to connect to server',
  UNKNOWN_ERROR: 'An unknown error occurred',
  CHANGE_PASS_FAIL: 'Failed to change password',
  VALIDATION_ERROR: 'Invalid data',
  INVALID_DATA: 'Invalid input data',
};

export function formatMessage(
  template: string,
  ...args: (string | number)[]
): string {
  return template.replace(/{(\d+)}/g, (match, index) =>
    typeof args[index] !== 'undefined' ? String(args[index]) : match
  );
}

// Utility function để format validation errors
export function formatValidationErrors(
  errors: string[]
): string {
  if (errors.length === 1) {
    return `${errors[0]}`;
  }

  return errors.map((error) => `• ${error}`).join('\n');
}
