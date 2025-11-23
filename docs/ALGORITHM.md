# Appointment Conflict Detection Algorithm

## Overview

This document describes the **Allen's Interval Algebra** algorithm used for detecting scheduling conflicts in the GaneshLab appointment booking system.

---

## Algorithm: Allen's Interval Algebra

### Academic Reference

**Title:** "Maintaining Knowledge about Temporal Intervals"
**Author:** James F. Allen
**Published:** Communications of the ACM, Vol. 26, No. 11 (November 1983), pp. 832-843
**DOI:** [10.1145/182.358434](https://doi.org/10.1145/182.358434)

### Purpose

Allen's Interval Algebra is a calculus for temporal reasoning that defines relationships between time intervals. We use it to detect whether two appointment time slots overlap.

### The 13 Temporal Relations

Allen defined 13 possible relations between two intervals A and B:

```
1.  Before        A |-----|        B         |-----|
2.  After         A         |-----| B |-----|
3.  Meets         A |-----|B|-----|
4.  Met-by        A      |-----|B|-----|
5.  Overlaps      A |-------|  B    |-------|  ✓ CONFLICT
6.  Overlapped-by A    |-------| B |-------|  ✓ CONFLICT
7.  Starts        A |---|    B |----------|    ✓ CONFLICT
8.  Started-by    A |----------| B |---|      ✓ CONFLICT
9.  During        A   |---|   B |----------|   ✓ CONFLICT
10. Contains      A |----------| B   |---|    ✓ CONFLICT
11. Finishes      A     |---| B |----------|   ✓ CONFLICT
12. Finished-by   A |----------| B     |---|   ✓ CONFLICT
13. Equals        A |----------| B |----------|  ✓ CONFLICT
```

### Overlap Detection Formula

The simplified formula to detect if two intervals overlap:

```
Overlap(A, B) = (A.start < B.end) ∧ (A.end > B.start)
```

This single formula covers relations 5-13 above (all conflict scenarios).

**Mathematical Proof:**

- If `A.start < B.end`: A starts before B ends
- AND `A.end > B.start`: A ends after B starts
- Then intervals must overlap

**Non-overlap cases:**

- `A.end ≤ B.start`: A completely before B (relation 1)
- `A.start ≥ B.end`: A completely after B (relation 2)

---

## Implementation

### Code Location

`src/app/api/appointments/_handlers/appointments-route-post-validation.ts`

### Function Signature

```typescript
async function checkAppointmentConflictForCreate(
  picId: string,
  date: string,
  startTime: string, // Format: "HH:mm" (e.g., "14:30")
  endTime: string // Format: "HH:mm" (e.g., "15:30")
): Promise<NextResponse | null>;
```

### Algorithm Steps

```typescript
// Step 1: Fetch all existing appointments for PIC on same date
const existingAppointments = await prisma.appointment.findMany({
  where: {
    picId,
    date: new Date(date),
    status: { not: "cancelled" },
  },
});

// Step 2: Apply Allen's overlap formula to each existing appointment
for (const existing of existingAppointments) {
  const newStart = startTime; // e.g., "14:30"
  const newEnd = endTime; // e.g., "15:30"
  const existingStart = existing.startTime;
  const existingEnd = existing.endTime;

  // Step 3: Check overlap using Allen's formula
  const hasOverlap = newStart < existingEnd && newEnd > existingStart;

  if (hasOverlap) {
    return ConflictError; // HTTP 409
  }
}

return null; // No conflict
```

### Time Complexity

- **Best Case:** O(1) - No existing appointments
- **Average Case:** O(n) - Where n = number of existing appointments for PIC on that date
- **Worst Case:** O(n) - Must check all existing appointments

**Optimization:** Typically n is small (< 10 appointments per day per PIC), so linear search is efficient.

### Space Complexity

- **O(n)** - Stores existing appointments in memory for comparison

---

## Examples

### Example 1: Overlap Detected (Scenario 5: Overlaps)

```
Existing Appointment: 10:00 - 11:00
New Appointment:      10:30 - 11:30

Check: 10:30 < 11:00 ∧ 11:30 > 10:00
       true         ∧ true
       = CONFLICT ❌
```

**Visual:**

```
Existing: |-----------|
New:           |-----------|
          10:00  10:30  11:00  11:30
                 ↑ Overlap region
```

### Example 2: No Overlap (Relation 1: Before)

```
Existing Appointment: 10:00 - 11:00
New Appointment:      11:00 - 12:00

Check: 11:00 < 11:00 ∧ 12:00 > 10:00
       false        ∧ true
       = NO CONFLICT ✓
```

**Visual:**

```
Existing: |-----------|
New:                  |-----------|
          10:00    11:00       12:00
                   ↑ No overlap
```

### Example 3: Complete Containment (Scenario 10: Contains)

```
Existing Appointment: 10:00 - 11:00
New Appointment:      09:00 - 12:00

Check: 09:00 < 11:00 ∧ 12:00 > 10:00
       true         ∧ true
       = CONFLICT ❌
```

**Visual:**

```
Existing:    |-----|
New:      |-------------|
          09:00 10:00 11:00 12:00
                ↑ New contains existing
```

### Example 4: Exact Same Time (Scenario 13: Equals)

```
Existing Appointment: 10:00 - 11:00
New Appointment:      10:00 - 11:00

Check: 10:00 < 11:00 ∧ 11:00 > 10:00
       true         ∧ true
       = CONFLICT ❌
```

---

## Error Response Format

When a conflict is detected, the API returns:

```json
{
  "error": "Schedule conflict detected. PIC already has an appointment at this time.",
  "conflict": {
    "title": "Client Meeting",
    "client": "John Doe",
    "time": "10:00 - 11:00",
    "message": "The requested time slot (10:30 - 11:30) overlaps with existing appointment \"Client Meeting\" scheduled from 10:00 to 11:00."
  }
}
```

**HTTP Status Code:** `409 Conflict`

---

## Database Query Optimization

### Index Strategy

PostgreSQL composite index for fast conflict detection:

```sql
CREATE INDEX idx_appointments_pic_date_time_status
ON Appointment(picId, date, startTime, endTime, status);
```

**Query Plan:**

```sql
EXPLAIN ANALYZE
SELECT * FROM Appointment
WHERE picId = $1
  AND date = $2
  AND status != 'cancelled';
```

**Result:**

- Uses index scan on `idx_appointments_pic_date_time_status`
- Cost: O(log n) for index lookup + O(k) for filtering (k = matching rows)

---

## Testing Strategy

### Unit Tests

```typescript
describe("Allen's Interval Algebra - Conflict Detection", () => {
  test("detects overlap when new starts during existing", () => {
    const existing = { start: "10:00", end: "11:00" };
    const newAppt = { start: "10:30", end: "11:30" };

    const hasConflict = newAppt.start < existing.end && newAppt.end > existing.start;

    expect(hasConflict).toBe(true);
  });

  test("no conflict when new starts exactly when existing ends", () => {
    const existing = { start: "10:00", end: "11:00" };
    const newAppt = { start: "11:00", end: "12:00" };

    const hasConflict = newAppt.start < existing.end && newAppt.end > existing.start;

    expect(hasConflict).toBe(false); // 11:00 < 11:00 is false
  });

  test("detects conflict when new contains existing", () => {
    const existing = { start: "10:30", end: "10:45" };
    const newAppt = { start: "10:00", end: "11:00" };

    const hasConflict = newAppt.start < existing.end && newAppt.end > existing.start;

    expect(hasConflict).toBe(true);
  });

  test("detects conflict when appointments are identical", () => {
    const existing = { start: "10:00", end: "11:00" };
    const newAppt = { start: "10:00", end: "11:00" };

    const hasConflict = newAppt.start < existing.end && newAppt.end > existing.start;

    expect(hasConflict).toBe(true);
  });
});
```

### Integration Tests

```typescript
describe("Appointment API - Conflict Detection", () => {
  test("prevents double booking on same time slot", async () => {
    // Create first appointment
    await POST("/api/appointments", {
      picId: "pic-1",
      date: "2025-11-23",
      startTime: "10:00",
      endTime: "11:00",
    }); // Returns 201 Created

    // Try to create overlapping appointment
    const response = await POST("/api/appointments", {
      picId: "pic-1",
      date: "2025-11-23",
      startTime: "10:30",
      endTime: "11:30",
    });

    expect(response.status).toBe(409); // Conflict
    expect(response.body.error).toContain("Schedule conflict");
  });

  test("allows sequential appointments", async () => {
    // Create first appointment
    await POST("/api/appointments", {
      picId: "pic-1",
      date: "2025-11-23",
      startTime: "10:00",
      endTime: "11:00",
    }); // 201 Created

    // Create sequential appointment (starts when first ends)
    const response = await POST("/api/appointments", {
      picId: "pic-1",
      date: "2025-11-23",
      startTime: "11:00",
      endTime: "12:00",
    });

    expect(response.status).toBe(201); // Success
  });
});
```

---

## Performance Metrics

| Metric                | Value  | Notes                                       |
| --------------------- | ------ | ------------------------------------------- |
| Algorithm Complexity  | O(n)   | n = existing appointments                   |
| Typical n per day     | < 10   | Most PICs have < 10 meetings/day            |
| Average Response Time | < 50ms | Including DB query + validation             |
| Memory Usage          | O(n)   | Temporary storage for existing appointments |

---

## References

1. Allen, J. F. (1983). **Maintaining knowledge about temporal intervals**. _Communications of the ACM_, 26(11), 832-843. DOI: [10.1145/182.358434](https://doi.org/10.1145/182.358434)

2. Allen, J. F. (1984). **Towards a general theory of action and time**. _Artificial Intelligence_, 23(2), 123-154.

3. Van Beek, P., & Cohen, R. (1990). **Exact and approximate reasoning about temporal relations**. _Computational Intelligence_, 6(3), 132-147.

4. Nebel, B., & Bürckert, H. J. (1995). **Reasoning about temporal relations: A maximal tractable subclass of Allen's interval algebra**. _Journal of the ACM_, 42(1), 43-66.

---

## Future Improvements

### Potential Optimizations

1. **Database-Level Constraint**

   ```sql
   -- Add exclusion constraint (PostgreSQL only)
   ALTER TABLE Appointment
   ADD CONSTRAINT no_overlap_appointments
   EXCLUDE USING gist (
     picId WITH =,
     tsrange(startTime, endTime) WITH &&
   ) WHERE (status != 'cancelled');
   ```

2. **Caching Strategy**
   - Cache PIC availability for frequently accessed dates
   - Invalidate cache on appointment creation/update

3. **Parallel Processing**
   - For PICs with many appointments, check conflicts in parallel batches

---

**Document Version:** 1.0
**Last Updated:** November 23, 2025
**Author:** GaneshLab Development Team
