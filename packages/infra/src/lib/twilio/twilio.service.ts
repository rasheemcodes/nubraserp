// libs/infra/src/lib/twilio.service.ts
import { Injectable, Inject } from '@nestjs/common';
import type Twilio from 'twilio';   // use the correct type
import { TWILIO_TOKEN, TWILIO_OPTIONS, TwilioModuleOptions } from './twilio.tokens';

@Injectable()
export class TwilioService {
    constructor(
        @Inject(TWILIO_TOKEN) private readonly client: Twilio.Twilio,
        @Inject(TWILIO_OPTIONS) private readonly opts: TwilioModuleOptions,
    ) { }

    /** Send a single SMS */
    sendSms(to: string, body: string) {
        return this.client.messages.create({
            to,
            from: this.opts.from,
            body,
        });
    }

   /**
    * The function sends an OTP code to a specified phone number with an expiration time of 5 minutes.
    * @param {string} to - The `to` parameter in the `sendOtp` function is the phone number or
    * destination where the OTP (One-Time Password) code will be sent via SMS.
    * @param {string} code - The `code` parameter is a string that represents the OTP (One-Time
    * Password) code that will be sent to the user.
    * @returns The `sendOtp` function is returning the result of calling the `sendSms` function with
    * the `to` and `msg` parameters.
    */
    sendOtp(to: string, code: string) {
        const msg = `Your OTP code is ${code}. It expires in 5 minutes.`;
        return this.sendSms(to, msg);
    }

    /** Bulk SMS */
    sendBulkSms(recipients: string[], body: string) {
        return Promise.all(recipients.map(to => this.sendSms(to, body)));
    }
}
