// src/routes/captcha.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import axios from 'axios';


const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_SITE_KEY = process.env.RECAPTCHA_SITE_KEY;

if (!RECAPTCHA_SECRET_KEY || !RECAPTCHA_SITE_KEY) {
  console.error("CRITICAL: reCAPTCHA keys not found in environment variables.");
}

interface VerifyCaptchaBody {
  recaptchaResponse?: string;
}

interface GoogleVerifyResponse {
    success: boolean;
    challenge_ts?: string;
    hostname?: string;
    score?: number;
    'error-codes'?: string[];
}

interface VerifyCaptchaReply {
    success: boolean;
    message: string;
    errors?: string[];
    score?: number;
}

export default async function captchaRoutes(fastify: FastifyInstance) {

  fastify.log.info('Registering CAPTCHA routes under /api/captcha');

  fastify.get(
     '/site-key',
     async (request: FastifyRequest, reply: FastifyReply): Promise<{ siteKey: string | undefined }> => {
         fastify.log.info('Request received for /api/captcha/site-key');
         reply.header('Access-Control-Allow-Origin', '*');
         reply.code(200);
         return { siteKey: RECAPTCHA_SITE_KEY };
     }
  );

  fastify.post<{ Body: VerifyCaptchaBody }>(
    '/verify',
    async (request: FastifyRequest<{ Body: VerifyCaptchaBody }>, reply: FastifyReply): Promise<VerifyCaptchaReply> => {
      const { recaptchaResponse } = request.body;
      fastify.log.info('Request received for /api/captcha/verify');
      reply.header('Access-Control-Allow-Origin', '*');

      if (!RECAPTCHA_SECRET_KEY) {
         fastify.log.error("reCAPTCHA secret key is not configured on the server.");
         reply.code(500);
         return { success: false, message: "Server configuration error." };
      }

      if (!recaptchaResponse) {
        reply.code(400);
        return { success: false, message: 'reCAPTCHA response token is missing.' };
      }

      try {
        const verificationURL = 'https://www.google.com/recaptcha/api/siteverify';
        // Note: Fixed the template literal issue in the POST data
        const response = await axios.post<GoogleVerifyResponse>(
          verificationURL,
          `secret=${encodeURIComponent(RECAPTCHA_SECRET_KEY)}&response=${encodeURIComponent(recaptchaResponse)}`,
          {
             headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          }
        );

        const data = response.data;
        fastify.log.info({ recaptchaVerifyResult: data }, "reCAPTCHA verification result");

        if (data.success) {
           reply.code(200);
           return {
             success: true,
             message: 'reCAPTCHA verification successful!',
             score: data.score
           };
        } else {
           reply.code(400);
           return {
             success: false,
             message: 'reCAPTCHA verification failed',
             errors: data['error-codes']
           };
        }
      } catch (error: any) {
         fastify.log.error({ err: error }, 'Error verifying reCAPTCHA with Google API');
         reply.code(500);
         return { success: false, message: 'Internal server error during reCAPTCHA verification.' };
      }
    }
  );
}