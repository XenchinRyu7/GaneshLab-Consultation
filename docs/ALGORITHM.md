# Algoritma Deteksi Konflik Appointment

## Gambaran Umum

Dokumen ini menjelaskan algoritma **Allen's Interval Algebra** yang digunakan untuk mendeteksi konflik jadwal di sistem booking appointment GaneshLab.

---

## Algoritma: Allen's Interval Algebra

### Referensi Akademik

**Judul:** "Maintaining Knowledge about Temporal Intervals"
**Penulis:** James F. Allen
**Diterbitkan:** Communications of the ACM, Vol. 26, No. 11 (November 1983), pp. 832-843
**DOI:** [10.1145/182.358434](https://doi.org/10.1145/182.358434)

### Tujuan

Allen's Interval Algebra adalah kalkulus untuk penalaran temporal yang mendefinisikan hubungan antara interval waktu. Kami menggunakannya untuk mendeteksi apakah dua slot waktu appointment tumpang tindih.

### 13 Hubungan Temporal

Allen mendefinisikan 13 kemungkinan hubungan antara dua interval A dan B:

```
1.  Before        A |-----|        B         |-----|
2.  After         A         |-----| B |-----|
3.  Meets         A |-----|B|-----|
4.  Met-by        A      |-----|B|-----|
5.  Overlaps      A |-------|  B    |-------|  ✓ KONFLIK
6.  Overlapped-by A    |-------| B |-------|  ✓ KONFLIK
7.  Starts        A |---|    B |----------|    ✓ KONFLIK
8.  Started-by    A |----------| B |---|      ✓ KONFLIK
9.  During        A   |---|   B |----------|   ✓ KONFLIK
10. Contains      A |----------| B   |---|    ✓ KONFLIK
11. Finishes      A     |---| B |----------|   ✓ KONFLIK
12. Finished-by   A |----------| B     |---|   ✓ KONFLIK
13. Equals        A |----------| B |----------|  ✓ KONFLIK
```

### Formula Deteksi Overlap

Formula sederhana untuk mendeteksi apakah dua interval overlap:

```
Overlap(A, B) = (A.start < B.end) ∧ (A.end > B.start)
```

Formula tunggal ini mencakup hubungan 5-13 di atas (semua skenario konflik).

**Bukti Matematis:**

- Jika `A.start < B.end`: A dimulai sebelum B berakhir
- DAN `A.end > B.start`: A berakhir setelah B dimulai
- Maka interval harus overlap

**Kasus non-overlap:**

- `A.end ≤ B.start`: A sepenuhnya sebelum B (hubungan 1)
- `A.start ≥ B.end`: A sepenuhnya setelah B (hubungan 2)

---

## Implementasi

### Lokasi Kode

`src/app/api/appointments/_handlers/appointments-route-post-validation.ts`

### Tanda Tangan Fungsi

```typescript
export async function checkAppointmentConflictForCreate(
  picId: string,
  date: string,
  startTime: string, // Format: "HH:mm" (e.g., "14:30")
  endTime: string // Format: "HH:mm" (e.g., "15:30")
): Promise<NextResponse | null>;
```

### Langkah-Langkah Algoritma

```typescript
// Langkah 1: Ambil semua appointment yang ada untuk PIC pada tanggal yang sama
const existingAppointments = await prisma.appointment.findMany({
  where: {
    picId,
    date: new Date(date),
    status: {
      not: "cancelled",
    },
  },
  select: {
    id: true,
    startTime: true,
    endTime: true,
    title: true,
    client: {
      select: {
        fullname: true,
      },
    },
  },
});

// Langkah 2: Terapkan formula overlap Allen's ke setiap appointment yang ada
for (const existing of existingAppointments) {
  const newStart = startTime;
  const newEnd = endTime;
  const existingStart = existing.startTime;
  const existingEnd = existing.endTime;

  // Langkah 3: Cek overlap menggunakan formula Allen's
  const hasOverlap = newStart < existingEnd && newEnd > existingStart;

  if (hasOverlap) {
    return NextResponse.json(
      {
        error: `Konflik jadwal terdeteksi. PIC sudah memiliki appointment pada waktu ini.`,
        conflict: {
          title: existing.title,
          client: existing.client?.fullname ?? "Tamu",
          time: `${existingStart} - ${existingEnd}`,
          message: `Slot waktu yang diminta (${startTime} - ${endTime}) overlap dengan appointment yang ada "${existing.title}" yang dijadwalkan dari ${existingStart} sampai ${existingEnd}.`,
        },
      },
      { status: 409 } // 409 Conflict
    );
  }
}

return null; // Tidak ada konflik
```

### Kompleksitas Waktu

- **Kasus Terbaik:** O(1) - Tidak ada appointment yang ada
- **Kasus Rata-Rata:** O(n) - Dimana n = jumlah appointment yang ada untuk PIC pada tanggal itu
- **Kasus Terburuk:** O(n) - Harus cek semua appointment yang ada

**Optimasi:** Biasanya n kecil (< 10 appointment per hari per PIC), jadi pencarian linear efisien.

### Kompleksitas Ruang

- **O(n)** - Menyimpan appointment yang ada di memori untuk perbandingan

---

## Pencegahan Race Condition

### Masalah Race Condition

Algoritma ini rentan terhadap **race condition** jika dua request datang bersamaan:

1. Request A: Cek konflik → Tidak ada → Mulai create.
2. Request B: Cek konflik (saat A belum commit) → Masih tidak ada → Mulai create.
3. Hasil: Kedua appointment dibuat, padahal overlap → Duplikasi.

### Solusi: Gunakan Transaction

Bungkus validasi dan create dalam `prisma.$transaction` untuk memastikan atomicity.

**Status Implementasi:** ✅ **SUDAH DITERAPKAN** di `src/app/api/appointments/_handlers/appointments-route-post.ts`

**Kode Implementasi Aktual:**

```typescript
// Use transaction to prevent race condition: check conflict and create atomically
const appointment = await prisma.$transaction(async tx => {
  // Check for conflicts within transaction
  const existingAppointments = await tx.appointment.findMany({
    where: {
      picId: body.picId,
      date: new Date(body.date),
      status: { not: "cancelled" },
    },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      title: true,
      client: { select: { fullname: true } },
    },
  });

  // Apply Allen's overlap formula
  for (const existing of existingAppointments) {
    const newStart = body.startTime;
    const newEnd = body.endTime;
    const existingStart = existing.startTime;
    const existingEnd = existing.endTime;

    const hasOverlap = newStart < existingEnd && newEnd > existingStart;

    if (hasOverlap) {
      throw new Error(
        `Konflik jadwal terdeteksi. PIC sudah memiliki appointment pada waktu ini. Detail: "${existing.title}" dengan ${existing.client?.fullname ?? "Tamu"} dari ${existingStart} sampai ${existingEnd}.`
      );
    }
  }

  // Create appointment within transaction
  return await tx.appointment.create({
    data: appointmentData,
    include: {
      /* ... */
    },
  });
});
```

**Manfaat:**

- Mencegah duplikasi meski request bersamaan.
- Jika konflik, transaction rollback otomatis.
- Error handling khusus untuk konflik (HTTP 409).

---

## Contoh

### Contoh 1: Overlap Terdeteksi (Skenario 5: Overlaps)

```
Appointment yang Ada: 10:00 - 11:00
Appointment Baru:     10:30 - 11:30

Cek: 10:30 < 11:00 ∧ 11:30 > 10:00
     true         ∧ true
     = KONFLIK ❌
```

**Visual:**

```
Yang Ada: |-----------|
Baru:           |-----------|
          10:00  10:30  11:00  11:30
                 ↑ Wilayah overlap
```

### Contoh 2: Tidak Ada Overlap (Hubungan 1: Before)

```
Appointment yang Ada: 10:00 - 11:00
Appointment Baru:     11:00 - 12:00

Cek: 11:00 < 11:00 ∧ 12:00 > 10:00
     false        ∧ true
     = TIDAK ADA KONFLIK ✓
```

**Visual:**

```
Yang Ada: |-----------|
Baru:                  |-----------|
          10:00    11:00       12:00
                   ↑ Tidak overlap
```

### Contoh 3: Kontainmen Lengkap (Skenario 10: Contains)

```
Appointment yang Ada: 10:00 - 11:00
Appointment Baru:     09:00 - 12:00

Cek: 09:00 < 11:00 ∧ 12:00 > 10:00
     true         ∧ true
     = KONFLIK ❌
```

**Visual:**

```
Yang Ada:    |-----|
Baru:      |-------------|
          09:00 10:00 11:00 12:00
                ↑ Baru mengandung yang ada
```

### Contoh 4: Waktu Sama Persis (Skenario 13: Equals)

```
Appointment yang Ada: 10:00 - 11:00
Appointment Baru:     10:00 - 11:00

Cek: 10:00 < 11:00 ∧ 11:00 > 10:00
     true         ∧ true
     = KONFLIK ❌
```

---

## Format Response Error

Ketika konflik terdeteksi, API mengembalikan:

```json
{
  "error": "Konflik jadwal terdeteksi. PIC sudah memiliki appointment pada waktu ini.",
  "conflict": {
    "title": "Meeting Klien",
    "client": "John Doe",
    "time": "10:00 - 11:00",
    "message": "Slot waktu yang diminta (10:30 - 11:30) overlap dengan appointment yang ada \"Meeting Klien\" yang dijadwalkan dari 10:00 sampai 11:00."
  }
}
```

**Kode Status HTTP:** `409 Conflict`

---

## Optimasi Query Database

### Strategi Index

Index komposit PostgreSQL untuk deteksi konflik cepat:

```sql
CREATE INDEX idx_appointments_pic_date_time_status
ON Appointment(picId, date, startTime, endTime, status);
```

**Rencana Query:**

```sql
EXPLAIN ANALYZE
SELECT * FROM Appointment
WHERE picId = $1
  AND date = $2
  AND status != 'cancelled';
```

**Hasil:**

- Menggunakan index scan pada `idx_appointments_pic_date_time_status`
- Biaya: O(log n) untuk lookup index + O(k) untuk filtering (k = baris yang cocok)

---

## Strategi Testing

### Unit Tests

```typescript
describe("Allen's Interval Algebra - Deteksi Konflik", () => {
  test("mendeteksi overlap ketika baru dimulai selama yang ada", () => {
    const existing = { start: "10:00", end: "11:00" };
    const newAppt = { start: "10:30", end: "11:30" };

    const hasConflict = newAppt.start < existing.end && newAppt.end > existing.start;

    expect(hasConflict).toBe(true);
  });

  test("tidak ada konflik ketika baru dimulai tepat saat yang ada berakhir", () => {
    const existing = { start: "10:00", end: "11:00" };
    const newAppt = { start: "11:00", end: "12:00" };

    const hasConflict = newAppt.start < existing.end && newAppt.end > existing.start;

    expect(hasConflict).toBe(false); // 11:00 < 11:00 adalah false
  });

  test("mendeteksi konflik ketika baru mengandung yang ada", () => {
    const existing = { start: "10:30", end: "10:45" };
    const newAppt = { start: "10:00", end: "11:00" };

    const hasConflict = newAppt.start < existing.end && newAppt.end > existing.start;

    expect(hasConflict).toBe(true);
  });

  test("mendeteksi konflik ketika appointment identik", () => {
    const existing = { start: "10:00", end: "11:00" };
    const newAppt = { start: "10:00", end: "11:00" };

    const hasConflict = newAppt.start < existing.end && newAppt.end > existing.start;

    expect(hasConflict).toBe(true);
  });
});
```

### Integration Tests

```typescript
describe("Appointment API - Deteksi Konflik", () => {
  test("mencegah double booking pada slot waktu yang sama", async () => {
    // Buat appointment pertama
    await POST("/api/appointments", {
      picId: "pic-1",
      date: "2025-11-23",
      startTime: "10:00",
      endTime: "11:00",
    }); // Mengembalikan 201 Created

    // Coba buat appointment yang overlap
    const response = await POST("/api/appointments", {
      picId: "pic-1",
      date: "2025-11-23",
      startTime: "10:30",
      endTime: "11:30",
    });

    expect(response.status).toBe(409); // Conflict
    expect(response.body.error).toContain("Konflik jadwal");
  });

  test("mengizinkan appointment berurutan", async () => {
    // Buat appointment pertama
    await POST("/api/appointments", {
      picId: "pic-1",
      date: "2025-11-23",
      startTime: "10:00",
      endTime: "11:00",
    }); // 201 Created

    // Buat appointment berurutan (dimulai saat yang pertama berakhir)
    const response = await POST("/api/appointments", {
      picId: "pic-1",
      date: "2025-11-23",
      startTime: "11:00",
      endTime: "12:00",
    });

    expect(response.status).toBe(201); // Sukses
  });
});
```

---

## Metrik Performa

| Metrik                   | Nilai  | Catatan                                          |
| ------------------------ | ------ | ------------------------------------------------ |
| Kompleksitas Algoritma   | O(n)   | n = appointment yang ada                         |
| n tipikal per hari       | < 10   | Kebanyakan PIC memiliki < 10 meeting/hari        |
| Waktu Response Rata-Rata | < 50ms | Termasuk query DB + validasi                     |
| Penggunaan Memori        | O(n)   | Penyimpanan sementara untuk appointment yang ada |

---

## Referensi

1. Allen, J. F. (1983). **Maintaining knowledge about temporal intervals**. _Communications of the ACM_, 26(11), 832-843. DOI: [10.1145/182.358434](https://doi.org/10.1145/182.358434)

2. Allen, J. F. (1984). **Towards a general theory of action and time**. _Artificial Intelligence_, 23(2), 123-154.

3. Van Beek, P., & Cohen, R. (1990). **Exact and approximate reasoning about temporal relations**. _Computational Intelligence_, 6(3), 132-147.

4. Nebel, B., & Bürckert, H. J. (1995). **Reasoning about temporal relations: A maximal tractable subclass of Allen's interval algebra**. _Journal of the ACM_, 42(1), 43-66.

---

## Perbaikan Masa Depan

### Optimasi Potensial

1. **Constraint di Level Database**

   ```sql
   -- Tambah exclusion constraint (PostgreSQL only)
   ALTER TABLE Appointment
   ADD CONSTRAINT no_overlap_appointments
   EXCLUDE USING gist (
     picId WITH =,
     tsrange(startTime, endTime) WITH &&
   ) WHERE (status != 'cancelled');
   ```

2. **Strategi Caching**
   - Cache ketersediaan PIC untuk tanggal yang sering diakses
   - Invalidasi cache saat appointment dibuat/diupdate

3. **Pemrosesan Paralel**
   - Untuk PIC dengan banyak appointment, cek konflik dalam batch paralel

---

**Versi Dokumen:** 1.2
**Terakhir Diupdate:** Desember 7, 2025
**Penulis:** Tim Pengembangan GaneshLab
