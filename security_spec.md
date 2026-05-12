# Security Specification - Aesthetix Pro

## Data Invariants
- A sale must always have a client and an employee.
- Commissions are tied to a specific sale and employee.
- Appointments require a valid client, treatment, and employee.
- Stock cannot be negative (enforced by app logic, but rules should restrict unauthorized stock updates).
- Only authenticated admins/employees can manage products and treatments.

## The "Dirty Dozen" Payloads (Conceptual Test Cases)
1. **Identity Spoofing**: Attempt to create a sale as one employee but set `employeeId` to another.
2. **Price Manipulation**: Attempt to create a sale with a `total` that doesn't match item prices.
3. **Unauthorized Stock Update**: Attempt to update product stock without a corresponding sale or return.
4. **Appointment Hijacking**: Attempt to update another client's appointment notes or status.
5. **PII Leak**: Attempt to list all clients and their phones/emails as an unauthenticated user.
6. **Self-Commission**: An employee trying to create their own commission record without a sale.
7. **Negative Expense**: Creating an expense with a negative amount.
8. **Ghost Notification**: Sending a notification from a client's UID.
9. **History Erasure**: Attempt to delete a sale or return record.
10. **ID Poisoning**: Using a 2MB string as a document ID for a new treatment.
11. **State Shortcut**: Moving an appointment from `cancelled` back to `scheduled` without permission.
12. **Shadow Field**: Adding `isAdmin: true` to a user profile patch.

## Tests to Implement
- Ensure `list clients` is restricted to staff.
- Ensure `write products` is restricted to staff.
- Enforce immutability on `createdAt` fields.
- Enforce `request.auth.uid` matches `recipientId` for safe read of personal notifications.
