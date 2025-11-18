import { ColumnDef } from "@tanstack/react-table";
import z from "zod";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";

import { userSchema } from "./schema";
import { UserActions } from "./user-actions";
import { format } from "date-fns";

interface ColumnOptions {
  onEdit: (user: z.infer<typeof userSchema>) => void;
  onDelete: (user: z.infer<typeof userSchema>) => void;
}

export const userColumns = ({
  onEdit,
  onDelete,
}: ColumnOptions): ColumnDef<z.infer<typeof userSchema>>[] => [
  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => <span>{row.original.email}</span>,
    enableHiding: false,
  },
  {
    accessorKey: "fullname",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Full Name" />,
    cell: ({ row }) => <span>{row.original.fullname}</span>,
    enableHiding: false,
  },
  {
    accessorKey: "role",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    cell: ({ row }) => {
      const roleColors: Record<string, string> = {
        admin: "bg-red-100 text-red-700",
        pic: "bg-blue-100 text-blue-700",
        client: "bg-green-100 text-green-700",
      };
      return (
        <Badge className={roleColors[row.original.role] || "bg-gray-100 text-gray-700"}>
          {row.original.role}
        </Badge>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "phone",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.phone || "-"}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {format(new Date(row.original.createdAt), "dd-MMM-yyyy")}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <UserActions user={row.original} onEdit={onEdit} onDelete={onDelete} />,
    enableSorting: false,
  },
];
