"use client";

import { Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { AuditLog } from "./types";

interface AuditLogsTableProps {
  auditLogs: AuditLog[];
  loading: boolean;
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString("id-ID");
};

export function AuditLogsTable({ auditLogs, loading }: AuditLogsTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Audit Logs
          </CardTitle>
          <CardDescription>System activity and user actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center">
            <div className="border-primary h-6 w-6 animate-spin rounded-full border-b-2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Audit Logs
        </CardTitle>
        <CardDescription>System activity and user actions</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogs.map(log => (
              <TableRow key={log.id}>
                <TableCell className="text-sm">{formatDate(log.createdAt)}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{log.user?.fullname ?? "System"}</p>
                    <p className="text-muted-foreground text-sm">{log.user?.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{log.action}</Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{log.entityType}</p>
                    {log.entityId && (
                      <p className="text-muted-foreground text-sm">{log.entityId}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={log.success ? "default" : "destructive"}>
                    {log.success ? "Success" : "Failed"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {log.errorMessage && <p className="text-sm text-red-600">{log.errorMessage}</p>}
                  {log.details && (
                    <pre className="text-muted-foreground mt-1 text-xs">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
