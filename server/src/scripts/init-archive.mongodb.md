use razon_db;

db.users.updateMany(
    {},
    {
        $set: {
            isArchived: false,
            archivedAt: null,
            archivedBy: null,
            lastActiveAt: new Date()
        }
    }
);

print("Migration completed! Check your users collection.");