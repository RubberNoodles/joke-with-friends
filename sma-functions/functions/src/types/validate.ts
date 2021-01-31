export interface ValidationError {
    label: string,
    msg: string,
}

export interface LoginData {
    email: string,
    password: string
}

export interface SignupData {
    email: string,
    password: string,
    confirmPassword: string,
    handle: string,
}

// used in simplifyUserData
export interface SimpleUserData {
    bio?: string,
    website?: string,
    location?: string,
}