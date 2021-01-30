export interface ValidationError {
    label: string,
    msg: string,
}

export interface LoginInData {
    email: string,
    password: string
}

export interface SignupData {
    email: string,
    password: string,
    confirmPassword: string,
    handle: string,
}