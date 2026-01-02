import type { BaseResponse } from './BaseResponse';

/**
 * Represents a user object in the system.
 *
 * @interface User
 * @property {string} [firstName] - The first name of the user.
 * @property {string} [lastName] - The last name of the user.
 * @property {string} [email] - The email address of the user.
 * @property {boolean} [isVerified] - Indicates if the user's email is verified.
 * @property {string} [profilePictureUrl] - The URL of the user's profile picture.
 * @property {string} [dateOfBirth] - The date of birth of the user.
 * @property {string} [gender] - The gender of the user.
 * @property {boolean} [isProfileComplete] - Indicates if the user's profile is complete.
 */
export interface User {
  readonly firstName?: string;
  readonly lastName?: string;
  readonly email?: string;
  readonly isVerified?: boolean;
  readonly profilePictureUrl?: string;
  readonly dateOfBirth?: string;
  readonly gender?: string;
  readonly isProfileComplete?: boolean;
}

/**
 * Represents the response from a user API request.
 *
 * @interface UserResponse
 * @augments BaseResponse
 * @property {User} [data] - The user data returned from the API.
 */
export interface UserResponse extends BaseResponse<User> {}
