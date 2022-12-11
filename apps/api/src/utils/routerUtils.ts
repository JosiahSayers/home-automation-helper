import { TRPC_ERROR_CODE_KEY } from '@trpc/server/dist/rpc';

export interface SuccessfulResponse {
  success: true;
  errorMessage?: undefined;
  statusCode?: TRPC_ERROR_CODE_KEY;
}

export interface FailedResponse {
  success: false;
  errorMessage: string;
  statusCode: TRPC_ERROR_CODE_KEY;
}

export type BasicResponse = SuccessfulResponse | FailedResponse;
