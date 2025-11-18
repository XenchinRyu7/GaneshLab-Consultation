"use client";

import { useEffect, useState } from "react";
import { Download, Plus } from "lucide-react";

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
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { userColumns } from "./columns.users";
import { userSchema } from "./schema";
import { CreateUserForm } from "./create-user-form";
import { EditUserForm } from "./edit-user-form";
import { DeleteUserDialog } from "./delete-user-dialog";
import type { z } from "zod";

export function TableCards() {
  const [users, setUsers] = useState<z.infer<typeof userSchema>[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAddUserModal, setOpenAddUserModal] = useState(false);
  const [openEditUserModal, setOpenEditUserModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<z.infer<typeof userSchema> | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch(`/api/users`);
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();

        // normalize createdAt
        const norm = data.map((u: any) => ({
          ...u,
          createdAt: new Date(u.createdAt).toISOString(),
        }));

        if (!mounted) return;

        setUsers(norm);
      } catch (err) {
        console.error(err);
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
      const res = await fetch(`/api/users`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();

      const norm = data.map((u: any) => ({
        ...u,
        createdAt: new Date(u.createdAt).toISOString(),
      }));

      setUsers(norm);
    } catch (err) {
      console.error(err);
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

  const table = useDataTableInstance({
    data: users,
    columns,
    getRowId: row => row.id,
  });

  const exportToCSV = () => {
    if (users.length === 0) return;
    const header = Object.keys(users[0]).join(",");
    const rows = users.map(u => Object.values(u).join(",")).join("\n");

    const csvContent = `data:text/csv;charset=utf-8,${header}\n${rows}`;
    const encodedUri = encodeURI(csvContent);

    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download />
                <span className="hidden lg:inline">Export</span>
              </Button>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="flex size-full flex-col gap-4">
          <div className="overflow-hidden rounded-md border">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Spinner className="text-muted-foreground size-6" />
              </div>
            ) : (
              <DataTable table={table} columns={columns} />
            )}
          </div>
          {!loading && <DataTablePagination table={table} />}
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
    </div>
  );
}
