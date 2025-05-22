const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ApiError } = require('../../utils/errors');
const config = require('../../config');
const Admin = require('../../models/admin.model');
const OnlinePatient = require('../../models/onlinePatient.model');

class AuthController {
    
    async register(req, res, next) {
        try {
            const { 
                fullName, 
                emailOrContactNumber, 
                password,
                birthdate,
                sex,
                address
            } = req.body;
            
            //determine if input is email or contact number
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrContactNumber);
            const isContactNumber = /^(09|\+639)\d{9}$/.test(emailOrContactNumber);
            
            if (!isEmail && !isContactNumber) {
                throw new ApiError('Please provide a valid email or contact number', 400);
            }
            
            //check if user already exists with either email or contact number
            const existingOnlinePatient = await OnlinePatient.findOne(
                isEmail 
                    ? { email: emailOrContactNumber } 
                    : { contactNumber: emailOrContactNumber }
            );
            
            if (existingOnlinePatient) {
                throw new ApiError('Patient with this email or contact number already exists', 400);
            }
            
            //hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            //create new user with either email or contact number
            const onlinePatientData = {
                fullName,
                password: hashedPassword,
                birthdate: new Date(birthdate),
                sex,
                address,
                dateRegistered: new Date(),
                role: 'Patient'
            };
            
            //add either email or contact number based on validation
            if (isEmail) {
                onlinePatientData.email = emailOrContactNumber;
            } else {
                onlinePatientData.contactNumber = emailOrContactNumber;
            }
            
            const onlinePatient = new OnlinePatient(onlinePatientData);
            
            //save onlinePatient to database
            await onlinePatient.save();
            
            //generate JWT token
            const token = jwt.sign(
                { 
                    id: onlinePatient._id,
                    email: onlinePatient.email,
                    contactNumber: onlinePatient.contactNumber
                },
                config.jwtSecret,
                { expiresIn: config.jwtExpiration }
            );
            
            //return onlinePatient info and token
            res.status(201).json({
                status: 'success',
                data: {
                    onlinePatient: {
                        id: onlinePatient._id,
                        fullName: onlinePatient.fullName,
                        email: onlinePatient.email,
                        contactNumber: onlinePatient.contactNumber,
                        birthdate: onlinePatient.birthdate,
                        sex: onlinePatient.sex,
                        address: onlinePatient.address,
                        dateRegistered: onlinePatient.dateRegistered
                    },
                    token
                }
            });
        } catch (error) {
            next(error);
        }
    };


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
            
            //If not found in Admin, try OnlinePatient collection
            if (!user) {
                user = await OnlinePatient.findOne(query).select('+password');
                userType = 'patient';
                
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
                        fullName: user.fullName,
                        email: user.email,
                        contactNumber: user.contactNumber,
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
                user = await OnlinePatient.findById(userId);
                if (!user) {
                    throw new ApiError('Online patient not found', 404);
                }
            }
            
            //return user profile
            res.status(200).json({
                status: 'success',
                data: {
                    user: {
                        id: user._id,
                        fullName: user.fullName,
                        email: user.email,
                        contactNumber: user.contactNumber,
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