/* eslint-disable @typescript-eslint/no-explicit-any */

export const TWILIO_TOKEN   = 'TWILIO_CLIENT';
export const TWILIO_OPTIONS = 'TWILIO_OPTIONS';

export interface TwilioModuleOptions {
  accountSid: string;
  authToken:  string;
  from:       string;
}

export interface TwilioModuleAsyncOptions {
  imports?: any[];
  inject?: any[];
  useFactory: (
    ...args: any[]
  ) => Promise<TwilioModuleOptions> | TwilioModuleOptions;
}