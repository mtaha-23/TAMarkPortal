// Admin configuration
export const ADMIN_EMAIL = "muhammadtaha2723@gmail.com"

// Check if user is admin
export function isAdmin(email: string | null | undefined): boolean {
  return email === ADMIN_EMAIL
}

// Activity types for logging
export enum ActivityType {
  LOGIN = "login",
  LOGOUT = "logout",
  PASSWORD_CHANGE = "password_change",
  PASSWORD_RESET = "password_reset",
  QUERY_SUBMIT = "query_submit",
  QUERY_RESPONSE = "query_response",
}

// Query/Ticket statuses
export enum QueryStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  CLOSED = "closed",
}

