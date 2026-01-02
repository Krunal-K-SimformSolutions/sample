/**
 * Represents the base response from a API request.
 *
 * @interface BaseResponse
 * @property {string} [statusCode] - The status code of the response.
 * @property {boolean} [success] - Indicates if the request was successful.
 * @property {string} [message] - A message providing additional information about the response.
 * @property {T} [data] - The data returned from the request.
 * @template T - The type of the data returned in the response.
 */
export interface BaseResponse<T> {
  readonly statusCode?: string;
  readonly success?: boolean;
  readonly message?: string;
  readonly data?: T;
}
