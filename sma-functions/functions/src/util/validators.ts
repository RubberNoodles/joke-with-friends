import { SignupData, LoginData, ValidationError, SimpleUserData } from './../types/validate';


// if the list is empty, there are no errors
const validateSignupData = (data: SignupData): ValidationError[] => {
    const nestedErrs: ValidationError[][] = [
        nonEmpty(data.email, 'email'),
        validEmail(data.email, 'email'),
        nonEmpty(data.password, 'password'),
        nonEmpty(data.handle, 'username'),
        noInvalidChars(data.handle, 'username', ['/']),
        equal(data.password, data.confirmPassword, 'password')
    ]
    // flatten errors
    // seems silly to have 'as ValidationError' in the middle,
    // but it won't typecheck without it LOL
    // https://schneidenbach.gitbooks.io/typescript-cookbook/content/functional-programming/flattening-array-of-arrays.html
    return ([] as ValidationError[]).concat(...nestedErrs);
}


const validateLoginData = (data: LoginData): ValidationError[] => {
    const nestedErrs: ValidationError[][] = [
        nonEmpty(data.email, 'email'),
        nonEmpty(data.password, 'password')
    ]
    return ([] as ValidationError[]).concat(...nestedErrs);
};

const simplifyUserData = (bio: string, website: string, location: string): SimpleUserData => {
    let userData: SimpleUserData = { bio: undefined, website: undefined, location: undefined };
    if (!isEmpty(bio)) userData.bio = bio;
    if (!isEmpty(website)) {
        if (website.substring(0, 4) === 'http') {
            userData.website = website;
        } else {
            userData.website = "https://" + website;
        }
    }

    if (!isEmpty(location)) userData.location = location;
    return userData
}

export { validateSignupData, validateLoginData, simplifyUserData }


// HELPERS

const isEmpty = (s: string): boolean => (s.trim() === '');

// the label property allows us to make better error messages basically
const nonEmpty = (str: string, label: string): ValidationError[] => {
    if (isEmpty(str)) {
        return [{ label: label, msg: 'Label must not be empty' }];
    } else {
        return [];
    }
};


const validEmail = (email: string, label: string): ValidationError[] => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(emailRegEx)) {
        return [];
    } else {
        return [{ label: label, msg: 'Email must be formatted properly' }];
    }
};

const noInvalidChars = (str: string, label: string, invalidChars: string[]): ValidationError[] => {
    let errs: ValidationError[] = [];
    for (let char of invalidChars) {
        if (str.includes(char)) {
            errs.push({ msg: `Invalid character observed: ${char}`, label: label });
            // if there are more than one invalid char, just ignore the other ones. 
            // we don't need to clutter up the error messages
            // maybe we can change this later on
            break;
        }
    }
    return errs;
};

const equal = (str1: string, str2: string, label: string): ValidationError[] => {
    if (str1 === str2) {
        return [];
    } else {
        return [{ msg: 'fields do not match', label: label }];
    }
}