import { ParentInfo } from "./appointment";

export interface User {
    id: string;
    userNumber?: string;
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

export interface UserFormData {
    id?: string;
    userNumber?: string;
    firstName: string;
    lastName: string;
    middleName: string;
    email?: string;
    contactNumber?: string;
    password?: string;
    birthdate: string;
    sex: 'Male' | 'Female' | 'Other' | ''; 
    address: string;
    dateRegistered?: string;
    role?: 'User' | 'Doctor' | 'Staff';
    createdAt?: string;
    updatedAt?: string;
}

export interface UserDetailed extends User {
    email?: string;
    contactNumber?: string;
    birthdate: Date;
    sex: 'Male' | 'Female' | 'Other';
    address: string;
    dateRegistered: Date;
    role: 'User' | 'Doctor' | 'Staff';
    createdAt: Date;
    updatedAt: Date;
}

export interface UsersResponse {
    status: string;
    results: number;
    data: {
        users: User[];
    };
}

export interface UserResponse {
    status: string;
    data: {
        user: UserDetailed;
    };
}