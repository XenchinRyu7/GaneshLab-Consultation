"use client";

import { AuditFilters } from "./audit-filters";
import { AuditLogsTable } from "./audit-logs-table";
import { AuditLog, AuditFilters as AuditFiltersType } from "./types";

interface AuditLogsTabProps {
  auditLogs: AuditLog[];
  loading: boolean;
  filters: AuditFiltersType;
  onFiltersChange: (filters: AuditFiltersType) => void;
}

export function AuditLogsTab({ auditLogs, loading, filters, onFiltersChange }: AuditLogsTabProps) {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <AuditFilters filters={filters} onFiltersChange={onFiltersChange} />

      {/* Audit Logs Table */}
      <AuditLogsTable auditLogs={auditLogs} loading={loading} />
    </div>
  );
}
