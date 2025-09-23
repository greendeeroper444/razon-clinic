const User = require("../../models/user.model");
const { ApiError } = require("../../utils/errors");


class UserController {

    async getAllUsers(req, res, next) {
        try {
            //filter out sensitive data
            const users = await User.find().select('firstName lastName email contactNumber createdAt');
            
            //return users list
            res.status(200).json({
                success: true,
                message: 'All users retrieved successfully',
                results: users.length,
                data: {
                    users
                }
            });
        } catch (error) {
            next(error);
        }
    };
    
    async getUsers(req, res, next) {
        try {
            //only find user with role 'user'
            const users = await User.find({ role: 'User' })
                .select('_id firstName lastName userNumber')
                .lean();
            
            //format the data for the dropdown
            const formattedUsers = users.map(user => ({
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                userNumber: user.userNumber
            }));
            
            //return users list
            res.status(200).json({
                success: true,
                message: 'Users retrieved successfully',
                results: formattedUsers.length,
                data: {
                    users: formattedUsers
                }
            });
        } catch (error) {
            next(error);
        }
    };
    
    async getUserById(req, res, next) {
        try {
            const { userId } = req.params;
            
            //find user by ID
            const user = await User.findOne({ _id: userId, role: 'User' });
            
            if (!user) {
                throw new ApiError('User not found', 404);
            }
            
            //return user data
            res.status(200).json({
                success: true,
                message: 'User retrieved successfully',
                data: {
                    user: {
                        id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        contactNumber: user.contactNumber,
                        birthdate: user.birthdate,
                        sex: user.sex,
                        address: user.address
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new UserController();