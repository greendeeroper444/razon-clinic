# Medical System Data Dictionary

## Table of Contents
1. [Admin Schema](#admin-schema)
2. [Appointment Schema](#appointment-schema)
3. [Billing Schema](#billing-schema)
4. [Inventory Item Schema](#inventory-item-schema)
5. [Medical Record Schema](#medical-record-schema)
6. [Notification Schema](#notification-schema)
7. [Online Patient Schema](#online-patient-schema)
8. [Personal Patient Schema](#personal-patient-schema)
9. [Report Schema](#report-schema)
10. [Entity Relationships](#entity-relationships)

## Admin Schema

Represents administrative staff members including doctors and staff.

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| fullName | String | The admin's full name | Required, trim, min 3 chars, max 30 chars |
| email | String | Email address | Optional, unique when present, trim, lowercase, valid email format |
| contactNumber | String | Phone number | Optional, unique when present, trim, valid PH format (09/+639 + 9 digits) |
| password | String | Hashed password | Required, excluded from API responses (select: false) |
| birthdate | Date | Admin's date of birth | Required |
| sex | String | Admin's gender | Required, enum: 'Male', 'Female', 'Other' |
| address | String | Physical address | Required, trim |
| dateRegistered | Date | Registration date | Default: current date |
| role | String | Admin role type | Required, enum: 'Doctor', 'Staff', default: 'Doctor' |
| createdAt | Date | Record creation timestamp | Automatically generated |
| updatedAt | Date | Record update timestamp | Automatically generated |

**Notes:**
- Either email or contactNumber must be provided
- Password is excluded from JSON responses
- MongoDB `_id` field is transformed to `id` in responses
- `__v` version field is removed from responses

## Appointment Schema

Represents patient appointments in the system.

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| appointmentNumber | String | Unique sequential identifier | Auto-generated, unique |
| patientId | ObjectId | Reference to patient | Required, references OnlinePatient model |
| preferredDate | Date | Requested appointment date | Required |
| preferredTime | String | Requested appointment time | Required |
| reasonForVisit | String | Patient's reason for visit | Required, trim |
| status | String | Current appointment status | Enum: 'Scheduled', 'Completed', 'Cancelled', 'Rebooked', default: 'Scheduled' |
| createdAt | Date | Record creation timestamp | Automatically generated |
| updatedAt | Date | Record update timestamp | Automatically generated |

**Notes:**
- Appointment numbers are auto-generated sequentially (0001, 0002, etc.)
- MongoDB `_id` field is transformed to `id` in responses
- `__v` version field is removed from responses

## Billing Schema

Represents billing records for appointments.

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| appointmentId | ObjectId | Reference to appointment | Required, references Appointment model |
| patientId | ObjectId | Reference to patient | Required, references User model |
| amount | Number | Billing amount | Required, minimum 0 |
| paymentStatus | String | Current payment status | Enum: 'Paid', 'Unpaid', 'Pending', default: 'Unpaid' |
| dateIssued | Date | Date billing was issued | Default: current date |
| createdAt | Date | Record creation timestamp | Automatically generated |
| updatedAt | Date | Record update timestamp | Automatically generated |

**Notes:**
- MongoDB `_id` field is transformed to `id` in responses
- `__v` version field is removed from responses

## Inventory Item Schema

Represents medical supplies and vaccines in inventory.

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| itemName | String | Name of inventory item | Required, trim |
| category | String | Item category | Required, enum: 'Vaccine', 'Medical Supply' |
| quantityInStock | Number | Current available quantity | Required, minimum 0 |
| quantityUsed | Number | Total quantity used | Required, minimum 0 |
| expiryDate | Date | Item expiration date | Required |
| createdAt | Date | Record creation timestamp | Automatically generated |
| updatedAt | Date | Record update timestamp | Automatically generated |

**Notes:**
- MongoDB `_id` field is transformed to `id` in responses
- `__v` version field is removed from responses

## Medical Record Schema

Represents a patient's medical records and history.

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| patientId | ObjectId | Reference to patient | Required, references User model |
| medicalHistory | String | Patient's medical history | Optional, trim |
| growthMilestones | String | Developmental milestones | Optional, trim |
| vaccinationHistory | String | Record of vaccines received | Optional, trim |
| currentSymptoms | String | Present symptoms | Optional, trim |
| diagnosis | String | Doctor's diagnosis | Optional, trim |
| treatmentPlan | String | Prescribed treatment plan | Optional, trim |
| prescribedMedications | String | Medications prescribed | Optional, trim |
| consultationNotes | String | Doctor's notes from visit | Optional, trim |
| followUpDate | Date | Scheduled follow-up date | Optional |
| dateRecorded | Date | Date record was created | Default: current date |
| createdAt | Date | Record creation timestamp | Automatically generated |
| updatedAt | Date | Record update timestamp | Automatically generated |

**Notes:**
- MongoDB `_id` field is transformed to `id` in responses
- `__v` version field is removed from responses

## Notification Schema

Represents system notifications for various events.

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| sourceId | ObjectId | Entity that triggered notification | Optional, dynamic reference based on sourceType |
| sourceType | String | Type of source entity | Enum: 'Patient', 'Doctor', 'Secretary', 'System', default: 'System' |
| type | String | Notification type | Required, enum: 'AppointmentReminder', 'AppointmentCreated', 'AppointmentUpdated', 'AppointmentCancelled', 'PatientCreated', 'MedicalRecordUpdated', 'LowStock', 'ExpiredItem' |
| entityId | ObjectId | Related entity reference | Optional |
| entityType | String | Type of related entity | Optional, enum: 'Appointment', 'Patient', 'MedicalRecord', 'Inventory' |
| message | String | Notification content | Required, trim |
| isRead | Boolean | Read status | Default: false |
| createdAt | Date | Record creation timestamp | Automatically generated |
| updatedAt | Date | Record update timestamp | Automatically generated |

**Notes:**
- Uses dynamic references with refPath for flexible entity relationships
- MongoDB `_id` field is transformed to `id` in responses
- `__v` version field is removed from responses

## Online Patient Schema

Represents patients who registered online with accounts.

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| fullName | String | Patient's full name | Required, trim, min 3 chars, max 30 chars |
| email | String | Email address | Optional, unique when present, trim, lowercase, valid email format |
| contactNumber | String | Phone number | Optional, unique when present, trim, valid PH format (09/+639 + 9 digits) |
| password | String | Hashed password | Required, excluded from API responses (select: false) |
| birthdate | Date | Patient's date of birth | Required |
| sex | String | Patient's gender | Required, enum: 'Male', 'Female', 'Other' |
| address | String | Physical address | Required, trim |
| dateRegistered | Date | Registration date | Default: current date |
| role | String | User role | Required, default: 'Patient' |
| createdAt | Date | Record creation timestamp | Automatically generated |
| updatedAt | Date | Record update timestamp | Automatically generated |

**Notes:**
- Either email or contactNumber must be provided
- Password is excluded from JSON responses
- MongoDB `_id` field is transformed to `id` in responses
- `__v` version field is removed from responses

## Personal Patient Schema

Represents patients added by clinic staff without online accounts.

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| fullName | String | Patient's full name | Required, trim, min 3 chars, max 30 chars |
| email | String | Email address | Optional, unique when present, trim, lowercase, valid email format |
| contactNumber | String | Phone number | Optional, unique when present, trim, valid PH format (09/+639 + 9 digits) |
| birthdate | Date | Patient's date of birth | Required |
| sex | String | Patient's gender | Required, enum: 'Male', 'Female', 'Other' |
| address | String | Physical address | Required, trim |
| dateRegistered | Date | Registration date | Default: current date |
| role | String | User role | Required, default: 'Patient' |
| createdAt | Date | Record creation timestamp | Automatically generated |
| updatedAt | Date | Record update timestamp | Automatically generated |

**Notes:**
- Either email or contactNumber must be provided
- No password field (patients added by staff)
- MongoDB `_id` field is transformed to `id` in responses
- `__v` version field is removed from responses

## Report Schema

Represents system-generated reports.

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| reportType | String | Type of report | Required, enum: 'Invoice', 'InventoryReport' |
| dateGenerated | Date | Generation date | Default: current date |
| createdAt | Date | Record creation timestamp | Automatically generated |
| updatedAt | Date | Record update timestamp | Automatically generated |

**Notes:**
- MongoDB `_id` field is transformed to `id` in responses
- `__v` version field is removed from responses

## Entity Relationships

This section describes the relationships between different entities in the system.

1. **Admin → Appointment**
   - Implicit relationship (admins manage appointments)

2. **OnlinePatient → Appointment**
   - One-to-many: A patient can have multiple appointments
   - Referenced via `patientId` in Appointment schema

3. **Appointment → Billing**
   - One-to-one: Each appointment can have one billing record
   - Referenced via `appointmentId` in Billing schema

4. **Patient → MedicalRecord**
   - One-to-many: A patient can have multiple medical records
   - Referenced via `patientId` in MedicalRecord schema

5. **Various Entities → Notification**
   - Many-to-many: Multiple entities can trigger notifications
   - Referenced via dynamic `sourceId` and `entityId` fields with corresponding type fields

6. **Inventory → Notification**
   - One-to-many: Inventory items can trigger notifications (low stock, expiry)
   - Referenced via `entityId` with `entityType: 'Inventory'`

**Note:** The system appears to use both OnlinePatient and PersonalPatient models to differentiate between patients who registered online (with accounts) versus those added by clinic staff directly.