// libs/infra/src/lib/twilio.module.ts
import { Module, DynamicModule, Global, Provider } from '@nestjs/common';
import * as Twilio from 'twilio';        
import { TwilioModuleOptions, TWILIO_TOKEN, TWILIO_OPTIONS, TwilioModuleAsyncOptions } from './twilio.tokens';
import { TwilioService } from './twilio.service';

@Global()
@Module({})
export class TwilioModule {
  static forRoot(opts: TwilioModuleOptions): DynamicModule {
    const clientProv: Provider = {
      provide: TWILIO_TOKEN,
      useFactory: () => new Twilio.Twilio(opts.accountSid, opts.authToken),
    };
    const optsProv: Provider = {
      provide: TWILIO_OPTIONS,
      useValue: opts,
    };

    return {
      module: TwilioModule,
      providers: [clientProv, optsProv, TwilioService],
      exports: [TwilioService],
    };
  }

  static forRootAsync(asyncOpts: TwilioModuleAsyncOptions): DynamicModule {
    const optsProv: Provider = {
      provide: TWILIO_OPTIONS,
      useFactory: asyncOpts.useFactory,
      inject: asyncOpts.inject || [],
    };
    const clientProv: Provider = {
      provide: TWILIO_TOKEN,
      useFactory: (opts: TwilioModuleOptions) =>
        new Twilio.Twilio(opts.accountSid, opts.authToken),
      inject: [TWILIO_OPTIONS],
    };

    return {
      module: TwilioModule,
      imports: asyncOpts.imports || [],
      providers: [optsProv, clientProv, TwilioService],
      exports: [TwilioService],
    };
  }
}
