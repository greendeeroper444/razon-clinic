const Admin = require("./admin.model");
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

class PersonnelService {
    
    async createPersonnel(personnelData) {
        try {
            const { contactNumber, password, username, middleName, suffix, ...restData } = personnelData;

            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactNumber);
            
            const dataToSave = {
                ...restData,
                ...(middleName?.trim() && { middleName: middleName.trim() }),
                ...(suffix?.trim() && { suffix: suffix.trim() }),
                ...(username?.trim() && { username }),
                email: isEmail ? contactNumber : undefined,
                contactNumber: !isEmail ? contactNumber : undefined
            };

            // Check if email or contact number already exists
            if (isEmail) {
                const existingEmail = await Admin.findOne({ email: contactNumber });
                if (existingEmail) throw new Error('Email already exists');
            } else {
                const existingContact = await Admin.findOne({ contactNumber });
                if (existingContact) throw new Error('Contact number already exists');
            }

            // Check if username already exists
            if (username) {
                const existingUsername = await Admin.findOne({ username: username.toLowerCase() });
                if (existingUsername) throw new Error('Username already exists');
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            dataToSave.password = hashedPassword;

            const personnel = new Admin(dataToSave);
            return await personnel.save();
        } catch (error) {
            throw error;
        }
    }

    async getPersonnel(queryParams) {
        try {
            const {
                search,
                page, 
                limit, 
                role,
                sortBy = 'createdAt', 
                sortOrder = 'desc' 
            } = queryParams;

            const filter = {};
            if (search) {
                filter.$or = [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { contactNumber: { $regex: search, $options: 'i' } },
                    { username: { $regex: search, $options: 'i' } }
                ];
            }
            if (role) filter.role = role;

            const sort = {};
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

            const totalItems = await Admin.countDocuments(filter);
            const searchTerm = search || null;

            let personnel;
            let pagination;

            if (limit && parseInt(limit) > 0) {
                const currentPage = parseInt(page);
                const itemsPerPage = parseInt(limit);
                const skip = (currentPage - 1) * itemsPerPage;
                const totalPages = Math.ceil(totalItems / itemsPerPage);
                
                personnel = await Admin.find(filter).sort(sort).skip(skip).limit(itemsPerPage);

                const startIndex = totalItems > 0 ? skip + 1 : 0;
                const endIndex = Math.min(skip + itemsPerPage, totalItems);

                pagination = {
                    currentPage,
                    totalPages,
                    totalItems,
                    itemsPerPage,
                    hasNextPage: currentPage < totalPages,
                    hasPreviousPage: currentPage > 1,
                    startIndex,
                    endIndex,
                    isUnlimited: false,
                    nextPage: currentPage < totalPages ? currentPage + 1 : null,
                    previousPage: currentPage > 1 ? currentPage - 1 : null,
                    remainingItems: Math.max(0, totalItems - endIndex),
                    searchTerm
                };
            } else {
                personnel = await Admin.find(filter).sort(sort);

                pagination = {
                    currentPage: 1,
                    totalPages: 1,
                    totalItems,
                    itemsPerPage: totalItems,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    startIndex: totalItems > 0 ? 1 : 0,
                    endIndex: totalItems,
                    isUnlimited: true,
                    nextPage: null,
                    previousPage: null,
                    remainingItems: 0,
                    searchTerm
                };
            }

            return { personnel, pagination };
        } catch (error) {
            throw error;
        }
    }

    async getPersonnelById(personnelId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(personnelId)) {
                throw new Error('Invalid personnel ID format');
            }

            const personnel = await Admin.findById(personnelId);
            if (!personnel) throw new Error('Personnel not found');

            return personnel;
        } catch (error) {
            throw error;
        }
    }

    async updatePersonnel(personnelId, updateData) {
        try {
            if (!mongoose.Types.ObjectId.isValid(personnelId)) {
                throw new Error('Invalid personnel ID format');
            }

            const currentPersonnel = await Admin.findById(personnelId);
            if (!currentPersonnel) throw new Error('Personnel not found');

            // Check username uniqueness
            if (updateData.username) {
                const existingUsername = await Admin.findOne({
                    username: updateData.username.toLowerCase(),
                    _id: { $ne: personnelId }
                });
                if (existingUsername) throw new Error('Username already exists');
            }

            // Build separate $set and $unset objects
            const setFields = {};
            const unsetFields = {};

            if (updateData.contactNumber) {
                const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.contactNumber);

                if (isEmail) {
                    const existingEmail = await Admin.findOne({
                        email: updateData.contactNumber,
                        _id: { $ne: personnelId }
                    });
                    if (existingEmail) throw new Error('Email already exists');

                    setFields.email = updateData.contactNumber;
                    unsetFields.contactNumber = '';
                } else {
                    const existingContact = await Admin.findOne({
                        contactNumber: updateData.contactNumber,
                        _id: { $ne: personnelId }
                    });
                    if (existingContact) throw new Error('Contact number already exists');

                    setFields.contactNumber = updateData.contactNumber;
                    unsetFields.email = '';
                }

                delete updateData.contactNumber;
            }

            if (updateData.password) {
                updateData.password = await bcrypt.hash(updateData.password, 10);
            }

            // Remove protected fields
            delete updateData._id;
            delete updateData.__v;
            delete updateData.createdAt;
            delete updateData.updatedAt;
            delete updateData.dateRegistered;

            // Merge remaining updateData into $set
            Object.assign(setFields, updateData);

            // Build the final update query
            const updateQuery = {};
            if (Object.keys(setFields).length > 0) updateQuery.$set = setFields;
            if (Object.keys(unsetFields).length > 0) updateQuery.$unset = unsetFields;

            const personnel = await Admin.findByIdAndUpdate(
                personnelId,
                updateQuery,
                { new: true, runValidators: true }
            );

            if (!personnel) throw new Error('Personnel not found');

            return personnel;
        } catch (error) {
            throw error;
        }
    }

    async deletePersonnel(personnelId) {
        try {
            if (!personnelId || personnelId === 'undefined') {
                throw new Error('Invalid personnel ID');
            }

            if (!mongoose.Types.ObjectId.isValid(personnelId)) {
                throw new Error('Invalid personnel ID format');
            }
            
            const personnel = await Admin.findByIdAndDelete(personnelId);
            if (!personnel) throw new Error('Personnel not found');

            return personnel;
        } catch (error) {
            throw error;
        }
    }

    async getPersonnelByRole(role) {
        try {
            if (!role || !['Doctor', 'Staff'].includes(role)) {
                throw new Error('Invalid role. Must be either Doctor or Staff');
            }

            return await Admin.find({ role }).sort({ createdAt: -1 });
        } catch (error) {
            throw error;
        }
    }

    async validatePersonnelData(data) {
        const { firstName, lastName, contactNumber, password, birthdate, sex, address, role } = data;
        
        if (!firstName || !lastName || !contactNumber || !password || !birthdate || !sex || !address || !role) {
            throw new Error('Missing required fields: firstName, lastName, contactNumber, password, birthdate, sex, address, role');
        }

        if (!['Doctor', 'Staff'].includes(role)) {
            throw new Error('Role must be either Doctor or Staff');
        }

        if (!['Male', 'Female', 'Other'].includes(sex)) {
            throw new Error('Sex must be either Male, Female, or Other');
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            throw new Error('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
        }

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactNumber);
        const isPhoneNumber = /^(09|\+639)\d{9}$/.test(contactNumber);
        
        if (!isEmail && !isPhoneNumber) {
            throw new Error('Please provide a valid email address or Philippine contact number');
        }
    }

    async getPersonnelStats() {
        try {
            const totalPersonnel = await Admin.countDocuments();
            const totalDoctors = await Admin.countDocuments({ role: 'Doctor' });
            const totalStaff = await Admin.countDocuments({ role: 'Staff' });

            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const recentlyAdded = await Admin.countDocuments({
                dateRegistered: { $gte: thirtyDaysAgo }
            });

            return { totalPersonnel, totalDoctors, totalStaff, recentlyAdded };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new PersonnelService();