module.exports = {
    validateEmail: email => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    },
    checkSpecialCharacter: str =>{
        const re = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        return re.test(str);
    },

/**
 * Returns false if non parametes is passed or any a parameter is empty and otherwise
 *
 * @param {arguments} x The list parameters is checked
 * @return {boolean} True/False.
*/
    checkRequireFieldString: (...rest) =>{


        return rest.length > 0 && rest.every(param => (typeof param) === 'string' && param !== "");
    }
}