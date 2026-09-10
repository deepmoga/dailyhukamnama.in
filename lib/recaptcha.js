import { getAllSettings } from './settings-service.js';

/**
 * Verify Google reCAPTCHA token against Google's API
 */
export async function verifyCaptcha(token, remoteIp = null) {
  try {
    const settings = await getAllSettings();
    const secretKey = (settings.recaptcha_secret_key || '').trim();

    // If no secret key is configured yet in settings, bypass verification gracefully
    if (!secretKey) {
      return { success: true, bypassed: true };
    }

    if (!token) {
      return {
        success: false,
        error: 'Please check the Google reCAPTCHA box before submitting.',
      };
    }

    const params = new URLSearchParams();
    params.append('secret', secretKey);
    params.append('response', token);
    if (remoteIp) {
      params.append('remoteip', remoteIp);
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (data.success) {
      return { success: true, data };
    } else {
      console.warn('Google reCAPTCHA verification failed:', data['error-codes']);
      return {
        success: false,
        error: 'Google reCAPTCHA verification failed. Please try again.',
        errorCodes: data['error-codes'],
      };
    }
  } catch (err) {
    console.error('reCAPTCHA verification exception:', err);
    // On unexpected network error connecting to Google, don't hard-block users unless strict
    return { success: false, error: 'Could not verify reCAPTCHA: ' + err.message };
  }
}
