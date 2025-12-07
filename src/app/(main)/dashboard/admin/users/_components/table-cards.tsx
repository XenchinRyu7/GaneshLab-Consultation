"use client";

import { useEffect, useState, useMemo } from "react";

import { Download, Plus } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { userColumns } from "./columns.users";
import { CreateUserForm } from "./create-user-form";
import { DeleteUserDialog } from "./delete-user-dialog";
import { EditUserForm } from "./edit-user-form";
import { ExportCSVDialog } from "./export-csv-dialog";
import { userSchema } from "./schema";
import { withRetry, exportUsersToCSV } from "./table-utils";
import { UsersTableToolbar } from "./users-table-toolbar";

export function TableCards() {
  const [users, setUsers] = useState<z.infer<typeof userSchema>[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAddUserModal, setOpenAddUserModal] = useState(false);
  const [openEditUserModal, setOpenEditUserModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<z.infer<typeof userSchema> | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type ApiUser = {
    id: string;
    userId: string;
    email: string;
    fullname: string;
    role: "client" | "pic" | "admin";
    phone: string | null;
    avatarColor: string | null;
    createdAt: string | Date;
  };

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setError(null);
        const res = await withRetry(
          () =>
            fetch(`/api/users`).then(res => {
              if (!res.ok) throw new Error("Failed to fetch users");
              return res;
            }),
          3,
          1000
        );
        const data: ApiUser[] = await res.json();

        // normalize createdAt
        const norm = data.map(u => ({
          ...u,
          createdAt: new Date(u.createdAt).toISOString(),
        }));

        if (!mounted) return;

        setUsers(norm);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load users";
        console.error(message);
        if (mounted) {
          setError(message);
          toast.error("Failed to load users", {
            description: message,
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const loadUsers = async () => {
    try {
      setError(null);
      const res = await withRetry(
        () =>
          fetch(`/api/users`).then(res => {
            if (!res.ok) throw new Error("Failed to fetch users");
            return res;
          }),
        3,
        1000
      );
      const data: ApiUser[] = await res.json();

      const norm = data.map(u => ({
        ...u,
        createdAt: new Date(u.createdAt).toISOString(),
      }));

      setUsers(norm);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load users";
      console.error(message);
      setError(message);
      toast.error("Failed to load users", {
        description: message,
      });
    }
  };

  const handleEditUser = (user: z.infer<typeof userSchema>) => {
    setSelectedUser(user);
    setOpenEditUserModal(true);
  };

  const handleEditUserSuccess = async () => {
    setOpenEditUserModal(false);
    setSelectedUser(null);
    await loadUsers();
  };

  const handleDeleteUser = (user: z.infer<typeof userSchema>) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleDeleteUserSuccess = async () => {
    setOpenDeleteDialog(false);
    setSelectedUser(null);
    await loadUsers();
  };

  const handleCreateUserSuccess = async () => {
    setOpenAddUserModal(false);
    await loadUsers();
  };

  const columns = userColumns({
    onEdit: handleEditUser,
    onDelete: handleDeleteUser,
  });
  // Filter logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.fullname.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.email.toLowerCase().includes(searchValue.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchValue, roleFilter]);

  // Create filtered table
  const filteredTable = useDataTableInstance({
    data: filteredUsers,
    columns,
    getRowId: row => row.id,
  });

  const handleResetFilters = () => {
    setSearchValue("");
    setRoleFilter("all");
  };

  const handleExportCSV = async () => {
    setExportLoading(true);
    try {
      exportUsersToCSV(filteredUsers, `users-${new Date().toISOString().split("T")[0]}.csv`);
      toast.success("CSV exported successfully", {
        description: `${filteredUsers.length} user(s) exported`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to export CSV";
      toast.error("Export failed", {
        description: message,
      });
    } finally {
      setExportLoading(false);
      setOpenExportDialog(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs">
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage and track all users in the system.</CardDescription>
          <CardAction>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpenAddUserModal(true)}>
                <Plus />
                <span className="hidden lg:inline">Add Users</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpenExportDialog(true)}
                disabled={filteredUsers.length === 0}
              >
                <Download />
                <span className="hidden lg:inline">Export</span>
              </Button>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="flex size-full flex-col gap-4">
          {/* Search and Filter Toolbar */}
          <UsersTableToolbar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            onReset={handleResetFilters}
          />

          <div className="overflow-hidden rounded-md border">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Spinner className="text-muted-foreground size-6" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12">
                <div className="space-y-2 text-center">
                  {users.length === 0 ? (
                    <>
                      <p className="text-muted-foreground">No users yet</p>
                      <p className="text-muted-foreground text-sm">
                        Click &ldquo;Add Users&rdquo; button to create the first user
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-muted-foreground">No results found</p>
                      <p className="text-muted-foreground text-sm">
                        Try adjusting your search or filters
                      </p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <DataTable table={filteredTable} columns={columns} />
            )}
          </div>
          {!loading && filteredUsers.length > 0 && <DataTablePagination table={filteredTable} />}
        </CardContent>
      </Card>

      <Dialog open={openAddUserModal} onOpenChange={setOpenAddUserModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>

          <CreateUserForm onSuccess={handleCreateUserSuccess} />
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      {selectedUser && (
        <Dialog open={openEditUserModal} onOpenChange={setOpenEditUserModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>

            <EditUserForm
              userId={selectedUser.id}
              initialData={{
                fullname: selectedUser.fullname,
                phone: selectedUser.phone,
                role: selectedUser.role as "pic" | "client",
              }}
              onSuccess={handleEditUserSuccess}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete User Dialog */}
      {selectedUser && (
        <DeleteUserDialog
          userId={selectedUser.id}
          userEmail={selectedUser.email}
          userName={selectedUser.fullname}
          open={openDeleteDialog}
          onOpenChange={setOpenDeleteDialog}
          onSuccess={handleDeleteUserSuccess}
        />
      )}

      {/* Export CSV Dialog */}
      <ExportCSVDialog
        open={openExportDialog}
        onOpenChange={setOpenExportDialog}
        userCount={filteredUsers.length}
        onConfirm={handleExportCSV}
        isLoading={exportLoading}
      />
    </div>
  );
}
