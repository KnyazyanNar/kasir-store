// Profile Types for KASIR Store

export type UserRole = "user" | "admin";

export type Profile = {
  id: string;
  email: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};