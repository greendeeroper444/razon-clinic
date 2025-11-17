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



get response:
{
    "success": true,
    "message": "Blocked time slots retrieved successfully",
    "data": {
        "blockedTimeSlots": [
            {
                "startDate": "2025-11-20T00:00:00.000Z",
                "endDate": "2025-11-20T00:00:00.000Z",
                "startTime": "13:00",
                "endTime": "15:00",
                "reason": "Meeting",
                "customReason": "Monthly team meeting",
                "createdBy": {
                    "email": "staff@gmail.com",
                    "id": "682fc90843d3f179225c5205"
                },
                "isActive": true,
                "createdAt": "2025-11-16T12:58:17.118Z",
                "updatedAt": "2025-11-16T12:58:17.118Z",
                "id": "6919ca692d33d61f7af0b587"
            }
        ],
        "pagination": {
            "currentPage": 1,
            "totalPages": 1,
            "totalItems": 1,
            "itemsPerPage": 1,
            "hasNextPage": false,
            "hasPreviousPage": false,
            "startIndex": 1,
            "endIndex": 1,
            "isUnlimited": true,
            "nextPage": null,
            "previousPage": null,
            "remainingItems": 0,
            "searchTerm": null
        }
    }
}