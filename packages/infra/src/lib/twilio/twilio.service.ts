// libs/infra/src/lib/twilio.service.ts
import { Injectable, Inject } from '@nestjs/common';
import type Twilio from 'twilio';   // use the correct type
import { TWILIO_TOKEN, TWILIO_OPTIONS, TwilioModuleOptions } from './twilio.tokens';

interface TwilioError {
    code: number;
    status: number;
    message: string;
    moreInfo?: string;
}

@Injectable()
export class TwilioService {
    constructor(
        @Inject(TWILIO_TOKEN) private readonly client: Twilio.Twilio,
        @Inject(TWILIO_OPTIONS) private readonly opts: TwilioModuleOptions,
    ) { }

    /** Send a single SMS */
    async sendSms(to: string, body: string) {
        console.log('[Twilio Debug] Sending SMS:', {
            to: to.slice(0, 6) + '***',
            from: this.opts.from,
            bodyLength: body.length
        });

        try {
            const result = await this.client.messages.create({
                to,
                from: this.opts.from,
                body,
            });
            
            console.log('[Twilio Debug] SMS sent successfully:', {
                sid: result.sid,
                status: result.status,
                errorCode: result.errorCode,
                errorMessage: result.errorMessage
            });

            return result;
        } catch (error) {
            const twilioError = error as TwilioError;
            console.error('[Twilio Debug] SMS send failed:', {
                code: twilioError.code,
                status: twilioError.status,
                message: twilioError.message,
                moreInfo: twilioError.moreInfo
            });
            throw error;
        }
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
    async sendOtp(to: string, code: string) {
        console.log('[Twilio Debug] Preparing OTP message:', {
            to: to.slice(0, 6) + '***',
            codeLength: code.length
        });

        // Ensure phone number is in E.164 format
        const formattedNumber = to.startsWith('+') ? to : `+${to}`;
        const msg = `Your OTP code is ${code}. It expires in 5 minutes.`;
        
        return this.sendSms(formattedNumber, msg);
    }

    /** Bulk SMS */
    sendBulkSms(recipients: string[], body: string) {
        return Promise.all(recipients.map(to => this.sendSms(to, body)));
    }

    /**
     * Test Twilio configuration and connectivity
     * Use this method to verify your Twilio setup
     */
    async testConfiguration() {
        console.log('[Twilio Debug] Testing configuration');
        
        try {
            // Test account access
            const account = await this.client.api.accounts(this.opts.accountSid).fetch();
            console.log('[Twilio Debug] Account verified:', {
                status: account.status,
                type: account.type,
                friendlyName: account.friendlyName
            });

            // Verify 'from' number ownership
            const numbers = await this.client.incomingPhoneNumbers.list({phoneNumber: this.opts.from});
            const hasNumber = numbers.length > 0;
            console.log('[Twilio Debug] From number verification:', {
                number: this.opts.from.slice(0, 6) + '***',
                owned: hasNumber,
                capabilities: hasNumber ? numbers[0].capabilities : null
            });

            return {
                accountVerified: true,
                numberVerified: hasNumber,
                accountStatus: account.status,
                numberCapabilities: hasNumber ? numbers[0].capabilities : null
            };
        } catch (error) {
            const twilioError = error as TwilioError;
            console.error('[Twilio Debug] Configuration test failed:', {
                code: twilioError.code,
                status: twilioError.status,
                message: twilioError.message
            });
            throw error;
        }
    }
}
