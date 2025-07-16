// src/config/joi.validation.ts
import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Postgres / Drizzle
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .required()
    .description('Postgres connection string'),

  // Redis (for rate-limit, token blacklists)
  REDIS_URL: Joi.string()
    .required()
    .description('Redis connection URI'),

  // Twilio SMS
  TWILIO_ACCOUNT_SID: Joi.string()
    .pattern(/^AC[a-zA-Z0-9]{32}$/)
    .required()
    .description('Twilio Account SID'),
  TWILIO_AUTH_TOKEN: Joi.string()
    .min(32)
    .required()
    .description('Twilio Auth Token'),
  TWILIO_PHONE_NUMBER: Joi.string()
    .required()
    .description('Twilio phone number (E.164 format)'),

  // JWT
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .description('Secret key for signing access tokens'),
  JWT_REFRESH_SECRET: Joi.string()
    .min(32)
    .required()
    .description('Secret key for signing refresh tokens'),

  // IP Data API
  IPDATA_API_KEY: Joi.string()
    .required()
    .description('IPData API key for geolocation'),

  // Frontend URL for magic links
  FRONTEND_URL: Joi.string()
    .uri()
    .required()
    .description('Frontend application URL'),
})
  .unknown() // allow other env vars
  .required();
