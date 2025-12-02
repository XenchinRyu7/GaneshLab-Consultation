"use client";

import { Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { AuditFilters as AuditFiltersType } from "./types";

interface AuditFiltersProps {
  filters: AuditFiltersType;
  onFiltersChange: (filters: AuditFiltersType) => void;
}

export function AuditFilters({ filters, onFiltersChange }: AuditFiltersProps) {
  const handleClearFilters = () => {
    onFiltersChange({
      action: "",
      entityType: "",
      userId: "",
      success: "",
      page: 1,
      limit: 50,
    });
  };

  const handleActionChange = (value: string) => {
    onFiltersChange({ ...filters, action: value === "all" ? "" : value });
  };

  const handleEntityTypeChange = (value: string) => {
    onFiltersChange({ ...filters, entityType: value === "all" ? "" : value });
  };

  const handleSuccessChange = (value: string) => {
    onFiltersChange({ ...filters, success: value === "all" ? "" : value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Select value={filters.action || "all"} onValueChange={handleActionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="LOGIN">Login</SelectItem>
              <SelectItem value="CREATE_PROJECT">Create Project</SelectItem>
              <SelectItem value="APPROVE_PROJECT">Approve Project</SelectItem>
              <SelectItem value="CREATE_USER">Create User</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.entityType || "all"} onValueChange={handleEntityTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Entity Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="PROJECT">Project</SelectItem>
              <SelectItem value="APPOINTMENT">Appointment</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.success || "all"} onValueChange={handleSuccessChange}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">Success</SelectItem>
              <SelectItem value="false">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleClearFilters}>Clear Filters</Button>
        </div>
      </CardContent>
    </Card>
  );
}
