/**
 * App user summary for secure admin dropdowns — never carries password hashes.
 */
export interface UserPicklistRow {
  userId: string;
  email: string;
  name?: string | null;
}
