'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

const GoogleRecaptcha = forwardRef(function GoogleRecaptcha(
  { siteKey, onVerify, onExpire, theme = 'light' },
  ref
) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (typeof window !== 'undefined' && window.grecaptcha && widgetIdRef.current !== null) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
        } catch (e) {
          console.warn('Could not reset recaptcha:', e);
        }
      }
    },
    getResponse: () => {
      if (typeof window !== 'undefined' && window.grecaptcha && widgetIdRef.current !== null) {
        try {
          return window.grecaptcha.getResponse(widgetIdRef.current);
        } catch (e) {
          return '';
        }
      }
      return '';
    },
  }));

  useEffect(() => {
    if (!siteKey) return;

    let isMounted = true;

    const renderWidget = () => {
      if (!isMounted || !containerRef.current || !window.grecaptcha || !window.grecaptcha.render) return;

      // Avoid double render
      if (widgetIdRef.current !== null) return;

      try {
        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          callback: (token) => {
            if (onVerify) onVerify(token);
          },
          'expired-callback': () => {
            if (onExpire) onExpire();
          },
        });
      } catch (err) {
        console.warn('reCAPTCHA render error:', err);
      }
    };

    if (typeof window !== 'undefined') {
      if (window.grecaptcha && window.grecaptcha.render) {
        renderWidget();
      } else {
        // Load script
        const scriptId = 'google-recaptcha-script';
        let script = document.getElementById(scriptId);
        if (!script) {
          script = document.createElement('script');
          script.id = scriptId;
          script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);
        }

        const checkInterval = setInterval(() => {
          if (window.grecaptcha && window.grecaptcha.render) {
            clearInterval(checkInterval);
            renderWidget();
          }
        }, 150);

        return () => {
          isMounted = false;
          clearInterval(checkInterval);
        };
      }
    }

    return () => {
      isMounted = false;
    };
  }, [siteKey, theme]);

  if (!siteKey) {
    return null;
  }

  return (
    <div className="my-3 flex justify-start">
      <div ref={containerRef} className="recaptcha-wrapper min-h-[78px]" />
    </div>
  );
});

export default GoogleRecaptcha;
