import { LoginFormData, SignupFormData, ValidationErrors } from '../types/auth';


//register validation
export const validateSignupForm = (formData: SignupFormData): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    //validate full name
    if (!formData.firstName.trim()) {
        errors.firstName = 'First name is required';
    } 

    if (!formData.lastName.trim()) {
        errors.lastName = 'Last name is required';
    }
    
    
    //validate email or contact number
    if (!formData.emailOrContactNumber.trim()) {
        errors.emailOrContactNumber = 'Email or contact number is required';
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const contactNumberRegex = /^(09|\+639)\d{9}$/;
        
        if (!emailRegex.test(formData.emailOrContactNumber) && !contactNumberRegex.test(formData.emailOrContactNumber)) {
            errors.emailOrContactNumber = 'Please enter a valid email or contact number';
        }
    }
    
    //validate password
    if (!formData.password) {
        errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
    }
    
    //validate confirm password
    if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }
    
    //validate birthdate
    if (!formData.birthdate) {
        errors.birthdate = 'Birthdate is required';
    } else {
        const today = new Date();
        const birthDate = new Date(formData.birthdate);
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (age < 13) {
            errors.birthdate = 'You must be at least 13 years old to register';
        }
    }
    
    //validate sex/gender
    if (!formData.sex) {
        errors.sex = 'Please select your gender';
    }
    
    //validate address
    if (!formData.address.trim()) {
        errors.address = 'Address is required';
    }
    
    //validate terms agreement
    if (!formData.agreeToTerms) {
        errors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    return errors;
};


//login validation
export const validateLoginForm = (formData: LoginFormData): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    //validate email or contact number
    if (!formData.emailOrContactNumber.trim()) {
        errors.emailOrContactNumber = 'Email or contact number is required';
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const contactNumberRegex = /^(09|\+639)\d{9}$/;
        
        if (!emailRegex.test(formData.emailOrContactNumber) && !contactNumberRegex.test(formData.emailOrContactNumber)) {
            errors.emailOrContactNumber = 'Please enter a valid email or contact number';
        }
    }
    
    //validate password
    if (!formData.password) {
        errors.password = 'Password is required';
    }
    
    return errors;
};