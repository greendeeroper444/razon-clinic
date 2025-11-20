import { ParentInfo } from "./appointment";

export interface SignupFormData {
    firstName: string;
    lastName: string;
    middleName: string;
    emailOrContactNumber: string;
    password: string;
    confirmPassword: string;
    birthdate: string;
    sex: string;
    address: string;
    motherInfo?: ParentInfo;
    fatherInfo?: ParentInfo;
    religion?: string;
    agreeToTerms: boolean;
    religionOther?: string;
}

export interface ValidationErrors {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    emailOrContactNumber?: string;
    password?: string;
    confirmPassword?: string;
    birthdate?: string;
    sex?: string;
    address?: string;
    'motherInfo.name'?: string;
    'motherInfo.age'?: string;
    'motherInfo.occupation'?: string;
    'fatherInfo.name'?: string;
    'fatherInfo.age'?: string;
    'fatherInfo.occupation'?: string;
    religion?: string;
    agreeToTerms?: string;
    religionOther?: string;
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
            firstName: string;
            lastName: string;
            middleName: string;
            email?: string;
            contactNumber?: string;
            birthdate: Date;
            sex: string;
            address: string;
            motherInfo?: ParentInfo;
            fatherInfo?: ParentInfo;
            religion?: string;
            role: string;
        }
    };
}