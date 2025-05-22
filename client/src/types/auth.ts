
//register 
export interface SignupFormData {
    fullName: string;
    emailOrContactNumber: string;
    password: string;
    confirmPassword: string;
    birthdate: string;
    sex: string;
    address: string;
    agreeToTerms: boolean;
}

export interface ValidationErrors {
    fullName?: string;
    emailOrContactNumber?: string;
    password?: string;
    confirmPassword?: string;
    birthdate?: string;
    sex?: string;
    address?: string;
    agreeToTerms?: string;
}

export interface SignupResponse {
    data: {
        token: string;
    };
}


//login
export interface LoginFormData {
    emailOrContactNumber: string;
    password: string;
    rememberMe: boolean;
}

export interface LoginResponse {
    data: {
        token: string;
        user: {
            id: string;
            fullName: string;
            email?: string;
            contactNumber?: string;
            role: string;
        }
    };
}



//user
export interface User {
    id: string;
    fullName: string;
    email?: string;
    contactNumber?: string;
    role: string;
}