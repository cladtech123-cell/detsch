/**
 * Shared API types. These mirror the Pydantic schemas on the backend.
 * Phase 1 only needs the lightweight shapes used by the placeholder UI;
 * richer types (Investigation, Artifact, VaultEntry…) land in Phase 2+.
 */

export interface HealthResponse {
  status: string;
  app: string;
  version: string;
}

export interface ModuleCategory {
  id: string;
  name: string;
  description: string;
  category: string;
  input_types: string[];
  enabled: boolean;
  requires_api_key: boolean;
}

export interface ApiListResponse<T> {
  items: T[];
  total: number;
  /** Present on Phase 1 stub endpoints. */
  stub?: boolean;
}
