const Admin = require("./admin.model");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

class PersonnelService {
    
    async createPersonnel(personnelData) {
        try {
            const { contactNumber, password, ...restData } = personnelData;

            //determine if contactNumber is email or contact number
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactNumber);
            
            const dataToSave = {
                ...restData,
                email: isEmail ? contactNumber : undefined,
                contactNumber: !isEmail ? contactNumber : undefined
            };

            //check if email or contact number already exists
            if (isEmail) {
                const existingEmail = await Admin.findOne({ email: contactNumber });
                if (existingEmail) {
                    throw new Error('Email already exists');
                }
            } else {
                const existingContact = await Admin.findOne({ contactNumber: contactNumber });
                if (existingContact) {
                    throw new Error('Contact number already exists');
                }
            }

            //hash password
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

            //build filter object
            const filter = {};
            if (search) {
                filter.$or = [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { contactNumber: { $regex: search, $options: 'i' } }
                ];
            }
            if (role) {
                filter.role = role;
            }

            //build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

            //get total count first
            const totalItems = await Admin.countDocuments(filter);

            const searchTerm = search || null;

            let personnel;
            let pagination;

            //check if limit is provided (pagination requested)
            if (limit && parseInt(limit) > 0) {
                //paginated query
                const currentPage = parseInt(page);
                const itemsPerPage = parseInt(limit);
                const skip = (currentPage - 1) * itemsPerPage;
                const totalPages = Math.ceil(totalItems / itemsPerPage);
                
                personnel = await Admin.find(filter)
                    .sort(sort)
                    .skip(skip)
                    .limit(itemsPerPage);

                const startIndex = totalItems > 0 ? skip + 1 : 0;
                const endIndex = Math.min(skip + itemsPerPage, totalItems);

                pagination = {
                    currentPage: currentPage,
                    totalPages: totalPages,
                    totalItems: totalItems,
                    itemsPerPage: itemsPerPage,
                    hasNextPage: currentPage < totalPages,
                    hasPreviousPage: currentPage > 1,
                    startIndex: startIndex,
                    endIndex: endIndex,
                    isUnlimited: false,
                    nextPage: currentPage < totalPages ? currentPage + 1 : null,
                    previousPage: currentPage > 1 ? currentPage - 1 : null,
                    remainingItems: Math.max(0, totalItems - endIndex),
                    searchTerm: searchTerm
                };
            } else {
                //unlimited query (no pagination)
                personnel = await Admin.find(filter).sort(sort);

                pagination = {
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: totalItems,
                    itemsPerPage: totalItems,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    startIndex: totalItems > 0 ? 1 : 0,
                    endIndex: totalItems,
                    isUnlimited: true,
                    nextPage: null,
                    previousPage: null,
                    remainingItems: 0,
                    searchTerm: searchTerm
                };
            }

            return {
                personnel,
                pagination
            };
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
            
            if (!personnel) {
                throw new Error('Personnel not found');
            }

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

            //get current personnel data to check for existing contact info
            const currentPersonnel = await Admin.findById(personnelId);
            if (!currentPersonnel) {
                throw new Error('Personnel not found');
            }

            //handle contactNumber if provided
            if (updateData.contactNumber) {
                const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.contactNumber);
                
                //check for duplicates (excluding current personnel)
                if (isEmail) {
                    const existingEmail = await Admin.findOne({ 
                        email: updateData.contactNumber,
                        _id: { $ne: personnelId }
                    });
                    if (existingEmail) {
                        throw new Error('Email already exists');
                    }
                    
                    //set email and clear contactNumber
                    updateData.email = updateData.contactNumber;
                    updateData.contactNumber = null;
                } else {
                    const existingContact = await Admin.findOne({ 
                        contactNumber: updateData.contactNumber,
                        _id: { $ne: personnelId }
                    });
                    if (existingContact) {
                        throw new Error('Contact number already exists');
                    }
                    
                    //keep contactNumber and clear email
                    updateData.email = null;
                }
            }

            //hash password if provided
            if (updateData.password) {
                updateData.password = await bcrypt.hash(updateData.password, 10);
            }

            //remove protected fields
            delete updateData._id;
            delete updateData.__v;
            delete updateData.createdAt;
            delete updateData.updatedAt;
            delete updateData.dateRegistered;

            const personnel = await Admin.findByIdAndUpdate(
                personnelId,
                updateData,
                { 
                    new: true, 
                    runValidators: true 
                }
            );

            if (!personnel) {
                throw new Error('Personnel not found');
            }

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
            
            if (!personnel) {
                throw new Error('Personnel not found');
            }

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

            const personnel = await Admin.find({ role }).sort({ createdAt: -1 });
            
            return personnel;
        } catch (error) {
            throw error;
        }
    }

    async validatePersonnelData(data) {
        const { firstName, lastName, contactNumber, password, birthdate, sex, address, role } = data;
        
        if (!firstName || !lastName || !contactNumber || !password || !birthdate || !sex || !address || !role) {
            throw new Error('Missing required fields: firstName, lastName, contactNumber, password, birthdate, sex, address, role');
        }

        //validate role
        if (!['Doctor', 'Staff'].includes(role)) {
            throw new Error('Role must be either Doctor or Staff');
        }

        //validate sex
        if (!['Male', 'Female', 'Other'].includes(sex)) {
            throw new Error('Sex must be either Male, Female, or Other');
        }

        //validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            throw new Error('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
        }

        //validate contactNumber format
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

            //get recently added (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const recentlyAdded = await Admin.countDocuments({
                dateRegistered: { $gte: thirtyDaysAgo }
            });

            return {
                totalPersonnel,
                totalDoctors,
                totalStaff,
                recentlyAdded
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new PersonnelService();