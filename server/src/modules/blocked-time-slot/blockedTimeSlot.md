# ADD BLOCKED TIME SLOT
POST /api/blockedTimeSlots/getBlockedTimeSlots
{
    "startDate": "2025-11-20",
    "endDate": "2025-11-20",
    "startTime": "13:00",
    "endTime": "15:00",
    "reason": "Meeting",
    "customReason": "Monthly team meeting"
}

# GET BLOCKED TIME SLOTS
GET /api/blockedTimeSlots/getBlockedTimeSlots

# UPDATE BLOCKED TIME SLOT
PUT /api/blockedTimeSlots/updateBlockedTimeSlot/6919ca692d33d61f7af0b587
{
    "startDate": "2025-11-20",
    "endDate": "2025-11-20",
    "startTime": "13:00",
    "endTime": "15:00",
    "reason": "Meeting",
    "customReason": "Monthly team meeting"
}