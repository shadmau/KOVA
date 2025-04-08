import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as path from 'path';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = 3010;

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_SITE_KEY = process.env.RECAPTCHA_SITE_KEY;

if (!RECAPTCHA_SECRET_KEY || !RECAPTCHA_SITE_KEY) {
  console.error("Error: reCAPTCHA credentials not found in .env file");
  process.exit(1);
}

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/site-key', (req: Request, res: Response) => {
  res.json({ siteKey: RECAPTCHA_SITE_KEY });
});

app.post('/verify-captcha', async (req: Request, res: Response) => {
  const { recaptchaResponse } = req.body;
  
  if (!recaptchaResponse) {
    return res.json({
      success: false,
      message: 'Please complete the reCAPTCHA challenge'
    });
  }

  try {
    const verificationURL = 'https://www.google.com/recaptcha/api/siteverify';
    const response = await axios.post(
      verificationURL,
      null,
      {
        params: {
          secret: RECAPTCHA_SECRET_KEY,
          response: recaptchaResponse
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const data = response.data;

    if (data.success) {
      return res.json({
        success: true,
        message: 'reCAPTCHA verification successful!',
        score: data.score
      });
    } else {
      return res.json({
        success: false,
        message: 'reCAPTCHA verification failed',
        errors: data['error-codes']
      });
    }
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying reCAPTCHA'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 