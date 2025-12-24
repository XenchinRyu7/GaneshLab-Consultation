"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UsersTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  onReset: () => void;
}

export function UsersTableToolbar({
  searchValue,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  onReset,
}: UsersTableToolbarProps) {
  const isFiltered = searchValue !== "" || roleFilter !== "all";

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      {/* Search Input */}
      <div className="relative max-w-md flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="Search by name, email..."
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Role Filter */}
      <div className="flex items-center gap-2">
        <Select value={roleFilter} onValueChange={onRoleFilterChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="pic">PIC</SelectItem>
            <SelectItem value="client">Client</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset Button */}
        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={onReset} className="h-9 px-2 lg:px-3">
            <X className="size-4" />
            <span className="ml-1 hidden lg:inline">Reset</span>
          </Button>
        )}
      </div>
    </div>
  );
}
