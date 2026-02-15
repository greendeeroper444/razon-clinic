import { SignupFormData, ValidationErrors } from '../../../types/auth';

export const validateSignupStep = (
    step: number,
    formData: SignupFormData
): ValidationErrors => {
    const stepErrors: ValidationErrors = {};
    
    switch (step) {
        case 1:
            return validateBasicInfo(formData);
            
        case 2:
            return validateAccountSecurity(formData);
            
        case 3:
            return validatePersonalDetails(formData);
            
        case 4:
            return validateReviewStep(formData);
            
        default:
            return stepErrors;
    }
};

//step 1
const validateBasicInfo = (formData: SignupFormData): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (!formData.firstName.trim()) {
        errors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 3) {
        errors.firstName = 'First name must be at least 3 characters';
    } else if (formData.firstName.trim().length > 50) {
        errors.firstName = 'First name must not exceed 50 characters';
    }

    if (!formData.lastName.trim()) {
        errors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 3) {
        errors.lastName = 'Last name must be at least 3 characters';
    } else if (formData.lastName.trim().length > 50) {
        errors.lastName = 'Last name must not exceed 50 characters';
    }

    if (formData.middleName && formData.middleName.trim()) {
        if (formData.middleName.trim().length < 3) {
            errors.middleName = 'Middle name must be at least 3 characters';
        } else if (formData.middleName.trim().length > 50) {
            errors.middleName = 'Middle name must not exceed 50 characters';
        }
    }

    if (formData.suffix && formData.suffix.trim()) {
        const validSuffixes = ['Jr.', 'Sr.', 'II', 'III', 'IV', 'V'];
        if (formData.suffix.trim().length > 10) {
            errors.suffix = 'Suffix must not exceed 10 characters';
        } else if (!validSuffixes.includes(formData.suffix)) {
            errors.suffix = 'Invalid suffix value';
        }
    }

    if (!formData.emailOrContactNumber.trim()) {
        errors.emailOrContactNumber = 'Contact number is required';
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const contactNumberRegex = /^(09|\+639)\d{9}$/;
        
        if (!emailRegex.test(formData.emailOrContactNumber) && !contactNumberRegex.test(formData.emailOrContactNumber)) {
            errors.emailOrContactNumber = 'Must provide a valid contact number';
        }
    }

    return errors;
};

//step 2
const validateAccountSecurity = (formData: SignupFormData): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (!formData.password) {
        errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
};

//step 3
const validatePersonalDetails = (formData: SignupFormData): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (!formData.birthdate) {
        errors.birthdate = 'Birthdate is required';
    } else {
        const birthdateObj = new Date(formData.birthdate);
        
        if (isNaN(birthdateObj.getTime())) {
            errors.birthdate = 'Invalid birthdate format';
        } else {
            const minAge = new Date();
            minAge.setFullYear(minAge.getFullYear() - 13);
            
            if (birthdateObj > minAge) {
                errors.birthdate = 'User must be at least 13 years old';
            }
        }
    }

    if (!formData.sex) {
        errors.sex = 'Sex is required';
    } else if (!['Male', 'Female', 'Other'].includes(formData.sex)) {
        errors.sex = 'Sex must be Male, Female, or Other';
    }

    if (!formData.address.trim()) {
        errors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
        errors.address = 'Address must be at least 10 characters';
    } else if (formData.address.trim().length > 200) {
        errors.address = 'Address must not exceed 200 characters';
    }

    if (formData.religion && formData.religion !== 'Others') {
        if (formData.religion.trim().length > 30) {
            errors.religion = 'Religion must not exceed 30 characters';
        }
    }

    if (formData.religion === 'Others') {
        if (!formData.religionOther || !formData.religionOther.trim()) {
            errors.religionOther = 'Please specify your religion';
        } else if (formData.religionOther.trim().length > 30) {
            errors.religionOther = 'Religion must not exceed 30 characters';
        }
    }

    return errors;
};

///step 4
const validateReviewStep = (formData: SignupFormData): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (!formData.agreeToTerms) {
        errors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    return errors;
};

export const validateAllSteps = (formData: SignupFormData): ValidationErrors => {
    const allErrors: ValidationErrors = {
        ...validateBasicInfo(formData),
        ...validateAccountSecurity(formData),
        ...validatePersonalDetails(formData),
        ...validateReviewStep(formData),
    };

    return allErrors;
};

export const validateField = (
    fieldName: keyof SignupFormData,
    value: any,
    formData: SignupFormData
): string | undefined => {
    const tempFormData = { ...formData, [fieldName]: value };
    
    const step1Fields = ['firstName', 'lastName', 'middleName', 'suffix', 'emailOrContactNumber'];
    const step2Fields = ['password', 'confirmPassword'];
    const step3Fields = ['birthdate', 'sex', 'address', 'religion', 'religionOther'];
    const step4Fields = ['agreeToTerms'];
    
    let errors: ValidationErrors = {};
    
    if (step1Fields.includes(fieldName)) {
        errors = validateBasicInfo(tempFormData);
    } else if (step2Fields.includes(fieldName)) {
        errors = validateAccountSecurity(tempFormData);
    } else if (step3Fields.includes(fieldName)) {
        errors = validatePersonalDetails(tempFormData);
    } else if (step4Fields.includes(fieldName)) {
        errors = validateReviewStep(tempFormData);
    }
    
    return errors[fieldName as keyof ValidationErrors];
};