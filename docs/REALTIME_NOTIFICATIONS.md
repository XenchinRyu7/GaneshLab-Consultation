# Supabase Realtime untuk Notifikasi

Proyek ini menggunakan **Supabase Realtime** untuk mengirim notifikasi secara real-time ke klien tanpa polling.

## Arsitektur

- **Client**: Subscribe ke channel `notifications-user-{userId}` via Supabase Realtime
  - Mendengar event broadcast: `notification:new`, `notification:update`, `notification:delete`
  - Fallback postgres_changes (opsional) jika database adalah Supabase
- **Server**: Prisma middleware otomatis mem-broadcast setiap operasi CREATE/UPDATE/DELETE pada model `Notification`
  - File: `src/lib/prisma.ts` (middleware)
  - Helper: `src/lib/realtime.ts` (publishNotificationNew/Update/Delete)

## Setup Supabase

### 1. Environment Variables

Pastikan file `.env.local` berisi:

```env
# Untuk client (mandatory)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Untuk server broadcast (mandatory)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Catatan**: `SUPABASE_SERVICE_ROLE_KEY` diperlukan di server untuk mengirim broadcast ke channel. Jangan expose key ini ke client.

### 2. Enable Realtime (Opsional - hanya jika ingin postgres_changes)

Jika database Anda adalah Supabase dan ingin memakai postgres_changes sebagai tambahan broadcast:

1. Buka Supabase Dashboard → **Database** → **Replication**
2. Di tab **Realtime**, centang tabel `public.notifications`
3. Jalankan di SQL Editor:

```sql
alter table public.notifications replica identity full;
```

Ini memastikan event UPDATE/DELETE menyertakan data `old` row.

### 3. RLS Policy (Opsional)

Jika Anda menggunakan Supabase Auth (bukan custom auth), tambahkan policy untuk membatasi akses:

```sql
-- Enable RLS
alter table public.notifications enable row level security;

-- Policy SELECT (untuk Realtime)
create policy "users_can_select_own_notifications"
on public.notifications
for select
using (auth.uid()::text = user_id);
```

**Catatan**: Proyek ini memakai custom auth (bukan Supabase Auth), sehingga `auth.uid()` tidak tersedia. Filter per-user dilakukan di aplikasi, bukan di RLS.

## Cara Kerja

### Server (Otomatis via Middleware)

Setiap operasi Prisma pada model `Notification` akan:

1. **CREATE**: Emit `notification:new` ke channel `notifications-user-{userId}`
2. **UPDATE**: Emit `notification:update` dengan partial data
3. **DELETE**: Emit `notification:delete` (untuk DELETE, API route harus fetch `wasUnread` sebelum delete)

**File terkait**:

- `src/lib/prisma.ts` (extension hook)
- `src/lib/realtime.ts` (broadcast helpers)

### Client

Komponen `NotificationProvider` di `src/app/(main)/dashboard/_components/notifications/notification-context.tsx`:

- Subscribe ke channel `notifications-user-{currentUser.id}`
- Listen event broadcast: `notification:new|update|delete` ✨ **Real-time**
- Fallback polling setiap 60 detik (jika broadcast gagal)

### Fallback

Jika Supabase Realtime tidak tersedia atau gagal:

- Polling setiap 60 detik tetap aktif sebagai fallback
- Error broadcast di-silent agar tidak mengganggu operasi database

## Testing

1. Login sebagai user
2. Buka tab/window lain, kirim chat/buat appointment (yang memicu notifikasi)
3. Badge dan dropdown notifikasi di tab pertama akan update **tanpa reload**

## Troubleshooting

### Notifikasi tidak update real-time

1. Cek env `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` di client
2. Cek env `SUPABASE_SERVICE_ROLE_KEY` di server
3. Lihat console browser untuk error subscription
4. Lihat server logs untuk error broadcast

### Broadcast gagal (server)

Error seperti `Failed to broadcast notification:new` adalah silent error—operasi database tetap sukses. Pastikan:

- Service role key valid
- Supabase project tidak dalam maintenance mode
- Network bisa reach Supabase API

### Postgres changes tidak menerima event

Postgres changes tidak diimplementasikan (hanya broadcast yang aktif). Jika ingin enable:

- Pastikan tabel `notifications` sudah di-enable di Realtime (Supabase Dashboard)
- Pastikan `replica identity full` sudah diset
- Postgres_changes hanya bekerja jika DB yang ditulis adalah Supabase DB

## Nonaktifkan Polling (Opsional)

Jika Realtime sangat stabil, Anda bisa reduce polling lebih lanjut atau nonaktifkan:

```ts
// Di notification-context.tsx
// Hapus atau ubah interval ke lebih besar (misal 300000ms = 5 menit)
const interval = setInterval(fetchNotifications, 300000);
```

Tetapi disarankan **tetap aktif polling** sebagai fallback untuk reliability.
// Hapus atau komentar ini:
// const interval = setInterval(fetchNotifications, 30000);

```

Tetapi disarankan tetap aktif sebagai fallback untuk dev environment yang belum setup Supabase.
```
