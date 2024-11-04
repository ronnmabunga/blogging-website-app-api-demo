// The password must be 8 to 32 characters long.
// Consists of only letters, digits or the following symbols: ~!@#$%^&*()_-+={[}]|\:;"'<,>.?/
// No whitespaces.
const VALIDATIONS_PASSWORD_TYPE_A_REGEX = /^[\w~!@#$%^&*()+\-={[}\]|\\:;"'<,>.?\/]{8,32}/;

// The password must be 8 to 32 characters long, with at least 1 letter, and 1 digit.
// Consists of only letters, digits or the following symbols: ~!@#$%^&*()_-+={[}]|\:;"'<,>.?/
// No whitespaces.
const VALIDATIONS_PASSWORD_TYPE_B_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[\w~!@#$%^&*()+\-={[}\]|\\:;"'<,>.?\/]{8,32}$/;

// The password must be 8 to 32 characters long, with at least 1 uppercase letter, and 1 lowercase letter.
// Consists of only letters, digits or the following symbols: ~!@#$%^&*()_-+={[}]|\:;"'<,>.?/
// No whitespaces.
const VALIDATIONS_PASSWORD_TYPE_C_REGEX = /^(?=.*[A-Z])(?=.*[a-z])[\w~!@#$%^&*()+\-={[}\]|\\:;"'<,>.?\/]{8,32}$/;

// The password must be 8 to 32 characters long, with at least 1 uppercase letter, 1 lowercase letter, and 1 digit.
// Consists of only letters, digits or the following symbols: ~!@#$%^&*()_-+={[}]|\:;"'<,>.?/
// No whitespaces.
const VALIDATIONS_PASSWORD_TYPE_D_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[\w~!@#$%^&*()+\-={[}\]|\\:;"'<,>.?\/]{8,32}$/;

// The password must be 8 to 32 characters long, with at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character.
// Consists of only letters, digits or the following symbols: ~!@#$%^&*()_-+={[}]|\:;"'<,>.?/
// No whitespaces.
const VALIDATIONS_PASSWORD_TYPE_E_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[~!@#$%^&*()_+\-={[}\]|\\:;"'<,>.?\/])[\w~!@#$%^&*()+\-={[}\]|\\:;"'<,>.?\/]{8,32}$/;

// The username must be 3 to 15 characters long and it starts with a letter.
// Consists of only letters, digits or the following symbols: ._-
// No whitespaces.
const VALIDATIONS_USERNAME_TYPE_A_REGEX = /^[a-zA-Z][\w.-]{2,14}$/;

// Follows the implementation from w3.org
// It willfully violates the RFC 5322 specifications for email addresses, which is said to be too strict in the part before the domain and too tolerant on the part for the domain.
const VALIDATIONS_EMAIL_TYPE_A_REGEX = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

module.exports.isValidUsername = (username, regex = VALIDATIONS_USERNAME_TYPE_A_REGEX) => {
    return regex.test(username);
};

module.exports.isValidPassword = (password, regex = VALIDATIONS_PASSWORD_TYPE_E_REGEX) => {
    return regex.test(password);
};

module.exports.isValidEmail = (email, regex = VALIDATIONS_EMAIL_TYPE_A_REGEX) => {
    return regex.test(email);
};
