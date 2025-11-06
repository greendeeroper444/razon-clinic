const mongoose = require('mongoose');
const config = require('@config');
const logger = require('@utils/logger');

const migrateUsers = async () => {
    try {
        await mongoose.connect(config.mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        logger.info('Connected to database');
        
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');
        
        const needsUpdate = await usersCollection.countDocuments({
            $or: [
                { isArchived: { $exists: false } },
                { archivedAt: { $exists: false } },
                { archivedBy: { $exists: false } },
                { lastActiveAt: { $exists: false } }
            ]
        });
        
        logger.info(`Found ${needsUpdate} users that need migration`);
        
        if (needsUpdate === 0) {
            logger.info('No users need migration. All users already have archive fields.');
            await mongoose.connection.close();
            return;
        }
        
        const result = await usersCollection.updateMany(
            {
                $or: [
                    { isArchived: { $exists: false } },
                    { archivedAt: { $exists: false } },
                    { archivedBy: { $exists: false } },
                    { lastActiveAt: { $exists: false } }
                ]
            },
            {
                $set: {
                    isArchived: false,
                    archivedAt: null,
                    archivedBy: null,
                    lastActiveAt: new Date()
                }
            }
        );
        
        logger.info(`Migration completed successfully!`);
        logger.info(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
        
        const allUsers = await usersCollection.find({}).toArray();
        const verifyCount = allUsers.filter(user => 
            user.isArchived !== undefined && 
            user.lastActiveAt !== undefined
        ).length;
        
        logger.info(`Verification: ${verifyCount}/${allUsers.length} users now have archive fields`);
        
        await mongoose.connection.close();
        logger.info('Database connection closed');
        
        process.exit(0);
    } catch (error) {
        logger.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateUsers();