# CREATE


# GET MEDICAL RECORDS
GET /api/medicalRecords/getMedicalRecords
GET /api/medicalRecords/getMedicalRecords? --can place the parameters here

# SOFT DELETE MEDICAL RECORD
DELETE /api/medicalRecords/deleteMedicalRecord/68e5e0cb655b2fec01a9b08a

# GET DELETED MEDICAL RECORDS
GET /api/medicalRecords/getDeletedMedicalRecords

# RESTORE MEDICAL RECORD
PATCH /api/medicalRecords/restoreMedicalRecord/68e3ef1f63df5cb3e562d992

# RESTORE MULTPLE MEDICAL RECORD
POST /api/medicalRecords/bulkRestore
{
    "medicalRecordIds": [
        "68e5e0cb655b2fec01a9b08a",
        "68e3fd69082bcdb125dee425"
    ]
}

# DELETE MULTPLE MEDICAL RECORD
POST /api/medicalRecords/bulkPermanentDelete
{
    "medicalRecordIds": [
        "68e5e0cb655b2fec01a9b08a",
        "68e3fd69082bcdb125dee425"
    ]
}
