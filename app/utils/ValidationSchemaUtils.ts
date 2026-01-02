import _ from 'lodash';
import * as Yup from 'yup';
import { RegexConst, StringConst } from '../constants';

/**
 * Checks if a given value is an email address.
 *
 * @param {string | null} [value] - The value to be checked.
 * @returns {boolean} A boolean value.
 */
export const isEmailFields = (value?: string | null): boolean => {
  return Yup.string()
    .transform((field) => (_.isEmpty(field) || _.isNil(field) ? field : field.trim()))
    .required()
    .matches(RegexConst.validEmailRegex)
    .isValidSync(value);
};

/**
 * Checks if a given value is an email address.
 *
 * @param {string | null} [value] - The value to be checked.
 * @returns {boolean} A boolean value.
 */
export const isPhoneFields = (value?: string | null): boolean => {
  return Yup.string()
    .transform((field) => (_.isEmpty(field) || _.isNil(field) ? field : field.trim()))
    .required()
    .matches(RegexConst.validPhoneRegex)
    .isValidSync(value);
};

const emailAddress = Yup.string()
  .transform((value) => (_.isEmpty(value) || _.isNil(value) ? value : value.trim()))
  .required(StringConst.Common.errRequireEmail)
  .matches(RegexConst.validEmailRegex, StringConst.Common.errValidEmail);

export const LoginFormSchema = Yup.object().shape({
  emailAddress,
  password: Yup.string()
    .transform((value) => (_.isEmpty(value) || _.isNil(value) ? value : value.trim()))
    .required(StringConst.Common.errValidPassword)
});
