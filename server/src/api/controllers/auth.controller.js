const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ApiError } = require('../../utils/errors');
const config = require('../../config');
const Admin = require('../../models/admin.model');
const User = require('../../models/user.model');

class AuthController {


    async register(req, res, next) {
        try {
            const { 
                firstName, 
                lastName,
                middleName,
                emailOrContactNumber, 
                password,
                birthdate,
                sex,
                address,
                religion
            } = req.body;
            
            //determine if input is email or contact number
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrContactNumber);
            const isContactNumber = /^(09|\+639)\d{9}$/.test(emailOrContactNumber);
            
            if (!isEmail && !isContactNumber) {
                throw new ApiError('Please provide a valid email or contact number', 400);
            }
            
            //check if user already exists with either email or contact number
            const existingUser = await User.findOne(
                isEmail 
                    ? { email: emailOrContactNumber } 
                    : { contactNumber: emailOrContactNumber }
            );
            
            if (existingUser) {
                throw new ApiError('User with this email or contact number already exists', 400);
            }
            
            //hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            //create new user with either email or contact number
            const userData = {
                firstName,
                lastName,
                middleName: middleName || null,
                password: hashedPassword,
                birthdate: new Date(birthdate),
                sex,
                address,
                dateRegistered: new Date(),
                role: 'User'
            };
            
            //add either email or contact number based on validation
            if (isEmail) {
                userData.email = emailOrContactNumber;
            } else {
                userData.contactNumber = emailOrContactNumber;
            }
            
            
            if (religion) {
                userData.religion = religion;
            }
            
            const user = new User(userData);
            
            //save user to database
            await user.save();
            
            //return user info and token
            res.status(201).json({
                status: 'success',
                data: {
                    user: {
                        id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        middleName: user.middleName,
                        email: user.email,
                        contactNumber: user.contactNumber,
                        birthdate: user.birthdate,
                        sex: user.sex,
                        address: user.address,
                        religion: user.religion,
                        dateRegistered: user.dateRegistered
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }


    async login(req, res, next) {
        try {
            const { emailOrContactNumber, password } = req.body;
            
            //determine if input is email or contact number
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrContactNumber);
            const isContactNumber = /^(09|\+639)\d{9}$/.test(emailOrContactNumber);
            
            if (!isEmail && !isContactNumber) {
                throw new ApiError('Please provide a valid email or contact number', 400);
            }
            
            //prepare the query based on input type
            const query = isEmail 
                ? { email: emailOrContactNumber } 
                : { contactNumber: emailOrContactNumber };
            
            //find user in Admin collection first
            let user = await Admin.findOne(query).select('+password');
            let userType = 'admin';
            
            //If not found in Admin, try user collection
            if (!user) {
                user = await User.findOne(query).select('+password');
                userType = 'user';
                
                //if still not found, return error
                if (!user) {
                    throw new ApiError('Invalid credentials', 401);
                }
            }
            
            // check password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            
            if (!isPasswordValid) {
                throw new ApiError('Invalid credentials', 401);
            }
            
            //create JWT token
            const token = jwt.sign(
                { 
                    id: user._id,
                    email: user.email,
                    contactNumber: user.contactNumber,
                    role: user.role,
                    userType: userType
                },
                config.jwtSecret,
                { expiresIn: config.jwtExpiration }
            );
            
            //return user info and token
            res.status(200).json({
                status: 'success',
                data: {
                    user: {
                        id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        middleName: user.middleName,
                        email: user.email,
                        contactNumber: user.contactNumber,
                        birthdate: user.birthdate,
                        sex: user.sex,
                        address: user.address,
                        religion: user.religion,
                        role: user.role,
                        userType: userType
                    },
                    token
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const userType = req.user.userType;
            
            let user;
            
            //find user based on userType from token
            if (userType === 'admin') {
                user = await Admin.findById(userId);
                if (!user) {
                    throw new ApiError('Admin not found', 404);
                }
            } else {
                user = await User.findById(userId);
                if (!user) {
                    throw new ApiError('User not found', 404);
                }
            }
            
            //return user profile
            res.status(200).json({
                status: 'success',
                data: {
                    user: {
                        id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        middleName: user.middleName,
                        email: user.email,
                        contactNumber: user.contactNumber,
                        birthdate: user.birthdate,
                        sex: user.sex,
                        address: user.address,
                        religion: user.religion,
                        role: user.role,
                        userType: userType
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }


    async logout(req, res, next) {
        try {
            // Since JWT is stateless, we don't actually invalidate the token on the server side
            // Instead, we return a success response that the client will use to remove the token

            res.status(200).json({
                status: 'success',
                message: 'Successfully logged out'
            });
        } catch (error) {
            next(error);
        }
    };
}


module.exports = new AuthController();