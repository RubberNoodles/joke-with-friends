const { UserRecordMetadata } = require("firebase-functions/lib/providers/auth");

const isEmpty =(string) => {
    if (string.trim() == '') {
        return true;
    } else {
        return false;
    }
};

const isEmail = (email) => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(emailRegEx)) return true;
    else return false;
};

exports.validateSignupData = data => {

    // Just boring shit to validate the fact all of the input data works.
    // Note that errors are weird if one of the fields are not filled. But this is okay its more of 
    // a problem on the frontend where we just never send in a null object.
    let errors = {};
    if (isEmpty(data.email)) {
        errors.email = "Must not be empty";
    } else if (!isEmail(data.email)) {
        errors.email = "Must be a valid email address";
    };

    if (isEmpty(data.password)) {
        errors.password = "Must not be empty";
    };

    if (isEmpty(data.handle)) {
        errors.handle = "Must not be empty";
    } else if (data.handle.includes("/")) {
        errors.handle = "Invalid characters: Hint no '/' characters";
    };

    if (data.password !== data.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
    };

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
};

exports.validateLoginData = data => {
    let errors = {};

    if (isEmpty(data.password)) {
        errors.password = "Must not be empty";
    };

    if (isEmpty(data.email)) {
        errors.email = "Must not be empty";
    };

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    };
};

exports.simplifyUserData = ({bio, website, location}) => {
    let userData = {}
    if (!isEmpty(bio)) userData.bio = bio;
    if (!isEmpty(website)) {
        if (website.substring(0,4) == 'http') {
            userData.website= website;
        } else {
            userData.website = "https://" + website;
        }
    };
    if (!isEmpty(location)) userData.location = location;
    return userData
}