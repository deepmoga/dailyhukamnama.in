'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeftRight, Calendar as CalendarIcon, MapPin, Sparkles, Info, X } from 'lucide-react';

const LOCATIONS = [
  { value: 'agra', label: 'Agra' },
  { value: 'amritsar', label: 'Sri Amritsar Sahib', default: true },
  { value: 'anandpur', label: 'Sri Anandpur Sahib' },
  { value: 'bakala', label: 'Baba Bakala' },
  { value: 'batala', label: 'Batala' },
  { value: 'bathinda', label: 'Bathinda' },
  { value: 'csi', label: 'Central Station of India' },
  { value: 'chamkaur', label: 'Chamkaur Sahib' },
  { value: 'chandigarh', label: 'Chandigarh' },
  { value: 'chennai', label: 'Chennai' },
  { value: 'damdama', label: 'Sri Damdama Sahib' },
  { value: 'delhi', label: 'Delhi' },
  { value: 'faridkot', label: 'Faridkot' },
  { value: 'sirhind', label: 'Fatehgarh Sahib' },
  { value: 'ferozepur', label: 'Ferozepur' },
  { value: 'goindwal', label: 'Goindwal Sahib' },
  { value: 'wadali', label: 'Guru Ki Wadali' },
  { value: 'gwalior', label: 'Gwalior' },
  { value: 'haridwar', label: 'Haridwar' },
  { value: 'nanded', label: 'Sri Hazur Sahib, Nanded' },
  { value: 'hoshiarpur', label: 'Hoshiarpur' },
  { value: 'jaipur', label: 'Jaipur' },
  { value: 'jalandhar', label: 'Jalandhar' },
  { value: 'jammu', label: 'Jammu' },
  { value: 'kalanaur', label: 'Kalanaur' },
  { value: 'kapurthala', label: 'Kapurthala' },
  { value: 'kartarpur', label: 'Kartarpur' },
  { value: 'kartarpur_p', label: 'Kartarpur Sahib, PK' },
  { value: 'khadur', label: 'Khadur Sahib' },
  { value: 'kiratpur', label: 'Kiratpur Sahib' },
  { value: 'kolkata', label: 'Kolkata' },
  { value: 'kurukshetra', label: 'Kurukshetra' },
  { value: 'lahore', label: 'Lahore' },
  { value: 'ludhiana', label: 'Ludhiana' },
  { value: 'macchiwara', label: 'Macchiwara' },
  { value: 'moga', label: 'Moga' },
  { value: 'mukatsar', label: 'Muktsar Sahib' },
  { value: 'mumbai', label: 'Mumbai' },
  { value: 'nadaun', label: 'Nadaun, HP' },
  { value: 'nankana', label: 'Nankana Sahib' },
  { value: 'narsinghpur', label: 'Narsinghpur, MP' },
  { value: 'nawanshahr', label: 'Nawanshahr' },
  { value: 'paonta', label: 'Paonta Sahib' },
  { value: 'patiala', label: 'Patiala' },
  { value: 'patna', label: 'Sri Patna Sahib' },
  { value: 'phagwara', label: 'Phagwara' },
  { value: 'pune', label: 'Pune' },
  { value: 'puri', label: 'Puri (Jagannath)' },
  { value: 'sultanpurlodhi', label: 'Sultanpur Lodhi' },
  { value: 'tarntaran', label: 'Tarn Taran Sahib' },
  { value: 'ujjain', label: 'Ujjain' },
  { value: 'varanasi', label: 'Varanasi' }
];

const GREGORIAN_MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const GREGORIAN_MONTHS_PA = ['ਜਨਵਰੀ', 'ਫ਼ਰਵਰੀ', 'ਮਾਰਚ', 'ਅਪ੍ਰੈਲ', 'ਮਈ', 'ਜੂਨ', 'ਜੁਲਾਈ', 'ਅਗਸਤ', 'ਸਤੰਬਰ', 'ਅਕਤੂਬਰ', 'ਨਵੰਬਰ', 'ਦਸੰਬਰ'];

const NANAKSHAHI_MONTHS_EN = ['Chet', 'Vaisakh', 'Jeth', 'Harh', 'Savan', 'Bhadon', 'Assu', 'Katak', 'Maghar', 'Poh', 'Magh', 'Phagun'];
const NANAKSHAHI_MONTHS_PA = ['ਚੇਤ', 'ਵੈਸਾਖ', 'ਜੇਠ', 'ਹਾੜ', 'ਸਾਵਣ', 'ਭਾਦੋਂ', 'ਅੱਸੂ', 'ਕੱਤਕ', 'ਮੱਘਰ', 'ਪੋਹ', 'ਮਾਘ', 'ਫੱਗਣ'];

const BIKRAMI_SOLAR_MONTHS_EN = ['Vaisakh', 'Jeth', 'Harh', 'Savan', 'Bhadon', 'Assu', 'Katak', 'Maghar', 'Poh', 'Magh', 'Phagun', 'Chet'];
const BIKRAMI_SOLAR_MONTHS_PA = ['ਵੈਸਾਖ', 'ਜੇਠ', 'ਹਾੜ', 'ਸਾਵਣ', 'ਭਾਦੋਂ', 'ਅੱਸੂ', 'ਕੱਤਕ', 'ਮੱਘਰ', 'ਪੋਹ', 'ਮਾਘ', 'ਫੱਗਣ', 'ਚੇਤ'];

export default function ConvertPage() {
  const [isPunjabi, setIsPunjabi] = useState(true);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [calendarSystem, setCalendarSystem] = useState('gregorian');
  const [locationKey, setLocationKey] = useState('amritsar');

  // Input states
  const [inputMonth, setInputMonth] = useState(1);
  const [inputDate, setInputDate] = useState(1);
  const [inputYear, setInputYear] = useState(2026);
  const [inputPaksh, setInputPaksh] = useState('false'); // false = Sudi, true = Vadi

  // Modal alert
  const [showAlertModal, setShowAlertModal] = useState(false);

  // Script references
  const nanakshahiRef = useRef(null);
  const nconvertRef = useRef(null);

  // Load scripts on mount
  useEffect(() => {
    let isMounted = true;

    // Load stored language
    try {
      const stored = localStorage.getItem('language');
      if (stored === 'en') {
        setIsPunjabi(false);
      } else if (stored === 'pa') {
        setIsPunjabi(true);
      }
    } catch (e) {}

    function loadScript(src) {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          if (existing.getAttribute('data-loaded') === 'true') {
            resolve();
          } else {
            existing.addEventListener('load', () => resolve());
            existing.addEventListener('error', (e) => reject(e));
          }
          return;
        }

        const s = document.createElement('script');
        s.src = src;
        s.async = false;
        s.onload = () => {
          s.setAttribute('data-loaded', 'true');
          resolve();
        };
        s.onerror = (e) => reject(e);
        document.body.appendChild(s);
      });
    }

    async function init() {
      try {
        await loadScript('/assets/js/nanakshahi.min.js');
        await loadScript('/assets/js/nanakshahi-convert.min.js');

        if (isMounted) {
          nanakshahiRef.current = window.nanakshahi;
          nconvertRef.current = window.NConvert;
          setScriptsLoaded(true);
        }
      } catch (err) {
        console.error('Error loading converter libraries:', err);
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update inputs whenever calendarSystem or location changes
  useEffect(() => {
    if (!scriptsLoaded) return;
    initializeInputsForSystem(calendarSystem, locationKey);
  }, [scriptsLoaded, calendarSystem]);

  // Run conversion whenever dependencies change
  useEffect(() => {
    if (!scriptsLoaded) return;
    runConversion();
  }, [scriptsLoaded, calendarSystem, locationKey, inputMonth, inputDate, inputYear, inputPaksh, isPunjabi]);

  // Handle enter key to convert
  useEffect(() => {
    const handleKeyUp = (e) => {
      if (e.key === 'Enter') {
        runConversion();
      }
    };
    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, [scriptsLoaded, calendarSystem, locationKey, inputMonth, inputDate, inputYear, inputPaksh, isPunjabi]);

  const handleLanguageToggle = (lang) => {
    const punjabi = lang === 'pa';
    setIsPunjabi(punjabi);
    try {
      localStorage.setItem('language', lang);
    } catch (e) {}
  };

  function initializeInputsForSystem(system, loc) {
    const NConvert = nconvertRef.current || window.NConvert;
    const nanakshahi = nanakshahiRef.current || window.nanakshahi;
    if (!NConvert || !nanakshahi) return;

    const date = new Date();
    const locationObj = NConvert.locations[loc] || NConvert.locations.amritsar;

    if (system === 'gregorian') {
      setInputMonth(date.getMonth() + 1);
      setInputDate(date.getDate());
      setInputYear(date.getFullYear());
    } else if (system === 'julian') {
      const rd = NConvert.fixedFromGregorian(date.getFullYear(), date.getMonth() + 1, date.getDate());
      const jDate = NConvert.julianFromFixed(rd);
      setInputMonth(jDate.month);
      setInputDate(jDate.day);
      setInputYear(jDate.year);
    } else if (system === 'nanakshahi') {
      const nsDate = nanakshahi.getNanakshahiDate(new Date()).englishDate;
      setInputDate(nsDate.date);
      setInputMonth(nsDate.month);
      setInputYear(nsDate.year);
    } else if (system === 'bikrami_lunar_drik' || system === 'bikrami_lunar_surya') {
      const rd = NConvert.fixedFromGregorian(date.getFullYear(), date.getMonth() + 1, date.getDate());
      const bikramiDate = NConvert.getDrikLunarFromFixed(rd, locationObj);
      const isPaksh = bikramiDate.day > 15;
      const lDay = isPaksh ? bikramiDate.day - 15 : bikramiDate.day;
      setInputMonth(bikramiDate.month);
      setInputPaksh(isPaksh ? 'true' : 'false');
      setInputDate(lDay);
      setInputYear(bikramiDate.year);
    } else if (system === 'bikrami_solar_drik' || system === 'bikrami_solar_surya') {
      const rd = NConvert.fixedFromGregorian(date.getFullYear(), date.getMonth() + 1, date.getDate());
      const bikramiDate = NConvert.getDrikSolarFromFixed(rd, locationObj);
      setInputMonth(bikramiDate.month);
      setInputDate(bikramiDate.day);
      setInputYear(bikramiDate.year);
    }
  }

  function runConversion() {
    const NConvert = nconvertRef.current || window.NConvert;
    const nanakshahi = nanakshahiRef.current || window.nanakshahi;
    if (!NConvert) return;

    const locationObj = NConvert.locations[locationKey] || NConvert.locations.amritsar;
    const yearVal = +inputYear;
    const monthVal = +inputMonth;
    const dateVal = +inputDate;
    const pakshVal = inputPaksh === 'true';

    let rd = null;
    let nanakshahiDate = false;

    try {
      if (calendarSystem === 'gregorian') {
        const d = new Date(yearVal, monthVal - 1, dateVal);
        rd = NConvert.fixedFromGregorian(yearVal, monthVal, dateVal);
        if (nanakshahi) {
          try {
            nanakshahiDate = nanakshahi.getNanakshahiDate(d);
          } catch (e) {
            nanakshahiDate = false;
          }
        }
      } else if (calendarSystem === 'julian') {
        rd = NConvert.fixedFromJulian(yearVal, monthVal, dateVal);
        const gDay = NConvert.gregorianFromFixed(rd);
        const d = new Date(gDay.year, gDay.month - 1, gDay.day);
        if (nanakshahi) {
          try {
            nanakshahiDate = nanakshahi.getNanakshahiDate(d);
          } catch (e) {
            nanakshahiDate = false;
          }
        }
      } else if (calendarSystem === 'nanakshahi') {
        if (nanakshahi) {
          try {
            nanakshahiDate = nanakshahi.getDateFromNanakshahi(yearVal, monthVal, dateVal);
            const d = nanakshahiDate.gregorianDate;
            rd = NConvert.fixedFromGregorian(d.getFullYear(), d.getMonth() + 1, d.getDate());
          } catch (err) {
            nanakshahiDate = false;
            const nsDateEl = document.getElementById('nanakshahiDate');
            if (nsDateEl) nsDateEl.innerHTML = 'Error';
            const histEl = document.getElementById('historicalCal');
            if (histEl) histEl.style.display = 'none';
            return;
          }
        }
      } else if (calendarSystem === 'bikrami_lunar_drik') {
        rd = NConvert.getFixedFromDrikLunar(yearVal, monthVal, dateVal, pakshVal, locationObj);
        const gDay = NConvert.gregorianFromFixed(rd);
        const d = new Date(gDay.year, gDay.month - 1, gDay.day);
        if (nanakshahi) {
          try {
            nanakshahiDate = nanakshahi.getNanakshahiDate(d);
          } catch (e) {
            nanakshahiDate = false;
          }
        }
      } else if (calendarSystem === 'bikrami_solar_drik') {
        rd = NConvert.getFixedFromDrikSolar(yearVal, monthVal, dateVal, locationObj);
        const gDay = NConvert.gregorianFromFixed(rd);
        const d = new Date(gDay.year, gDay.month - 1, gDay.day);
        if (nanakshahi) {
          try {
            nanakshahiDate = nanakshahi.getNanakshahiDate(d);
          } catch (e) {
            nanakshahiDate = false;
          }
        }
      } else if (calendarSystem === 'bikrami_lunar_surya') {
        rd = NConvert.getFixedFromSuryaLunar(yearVal, monthVal, dateVal, pakshVal, locationObj);
        const gDay = NConvert.gregorianFromFixed(rd);
        const d = new Date(gDay.year, gDay.month - 1, gDay.day);
        if (nanakshahi) {
          try {
            nanakshahiDate = nanakshahi.getNanakshahiDate(d);
          } catch (e) {
            nanakshahiDate = false;
          }
        }
      } else if (calendarSystem === 'bikrami_solar_surya') {
        rd = NConvert.getFixedFromSuryaSolar(yearVal, monthVal, dateVal, locationObj);
        const gDay = NConvert.gregorianFromFixed(rd);
        const d = new Date(gDay.year, gDay.month - 1, gDay.day);
        if (nanakshahi) {
          try {
            nanakshahiDate = nanakshahi.getNanakshahiDate(d);
          } catch (e) {
            nanakshahiDate = false;
          }
        }
      }

      if (rd === null || isNaN(rd)) return;

      const histEl = document.getElementById('historicalCal');
      if (histEl) histEl.style.display = '';

      const calendarData = NConvert.convert(rd, isPunjabi, locationObj);
      if (!calendarData) return;

      // Update Gregorian and Julian headers
      const gregEl = document.getElementById('gregorian');
      const julianEl = document.getElementById('julianDate');

      if (gregEl) {
        if (rd < 639797) {
          gregEl.innerHTML = calendarData.weekday + ', ' + calendarData.julian;
          if (julianEl) {
            julianEl.innerHTML = isPunjabi ? '(ਜੂਲੀਅਨ)' : '(Julian)';
            julianEl.style.display = '';
          }
        } else if (calendarSystem === 'julian') {
          gregEl.innerHTML = calendarData.weekday + ', ' + calendarData.gregorian;
          if (julianEl) {
            julianEl.innerHTML = (isPunjabi ? 'ਜੂਲੀਅਨ: ' : 'Julian: ') + calendarData.julian;
            julianEl.style.display = '';
          }
        } else {
          gregEl.innerHTML = calendarData.weekday + ', ' + calendarData.gregorian;
          if (julianEl) julianEl.style.display = 'none';
        }
      }

      // Drik Bikrami
      const astroSolarDate = document.getElementById('astroSolarDate');
      if (astroSolarDate) astroSolarDate.innerHTML = '<b>' + (calendarData.drik?.solar || '') + '</b>';
      const astroLunarDate = document.getElementById('astroLunarDate');
      if (astroLunarDate) astroLunarDate.innerHTML = '<b>' + (calendarData.drik?.lunar || '') + '</b>';
      const astroTithi = document.getElementById('astroTithi');
      if (astroTithi) astroTithi.innerHTML = calendarData.drik?.tithi || '';
      const astroTithiTime = document.getElementById('astroTithiTime');
      if (astroTithiTime) {
        astroTithiTime.innerHTML =
          (isPunjabi ? '<u>ਥਿਤੀ ਅਰੰਭ</u>: ' : '<u>Start</u>: ') +
          (calendarData.drik?.tithiStart || '') +
          '<br>' +
          (isPunjabi ? '<u>ਥਿਤੀ ਸਮਾਪਤੀ</u>: ' : '<u>End</u>: ') +
          (calendarData.drik?.tithiEnd || '');
      }
      const astroSankranti = document.getElementById('astroSankranti');
      if (astroSankranti) {
        astroSankranti.innerHTML =
          (isPunjabi ? '<u>ਸੰਗਰਾਂਦ</u>: ' : '<u>Sangrand</u>: ') +
          (calendarData.drik?.sangrand || '') +
          '<br>' +
          (isPunjabi ? '<u>ਸੰਕ੍ਰਾਂਤਿ</u>: ' : '<u>Sankranti</u>: ') +
          (calendarData.drik?.sankranti || '');
      }
      const astroNakshatra = document.getElementById('astroNakshatra');
      if (astroNakshatra) {
        astroNakshatra.innerHTML = (isPunjabi ? '<u>ਨਛੱਤਰ</u>: ' : '<u>Nakshatra</u>: ') + (calendarData.drik?.nakshatra || '');
      }
      const astroZodiac = document.getElementById('astroZodiac');
      if (astroZodiac) {
        astroZodiac.innerHTML =
          (isPunjabi ? '<u>ਰਾਸ਼ੀ</u>: ' : '<u>Zodiac</u>: ') +
          '<span>' + (calendarData.drik?.zodiac?.emoji || '') + '</span> ' +
          (calendarData.drik?.zodiac?.name || '');
      }

      // Surya Bikrami
      const ssSolarDate = document.getElementById('ssSolarDate');
      if (ssSolarDate) ssSolarDate.innerHTML = '<b>' + (calendarData.surya?.solar || '') + '</b>';
      const ssLunarDate = document.getElementById('ssLunarDate');
      if (ssLunarDate) ssLunarDate.innerHTML = '<b>' + (calendarData.surya?.lunar || '') + '</b>';
      const ssTithi = document.getElementById('ssTithi');
      if (ssTithi) ssTithi.innerHTML = calendarData.surya?.tithi || '';
      const ssTithiTime = document.getElementById('ssTithiTime');
      if (ssTithiTime) {
        ssTithiTime.innerHTML =
          (isPunjabi ? '<u>ਥਿਤੀ ਅਰੰਭ</u>: ' : '<u>Start</u>: ') +
          (calendarData.surya?.tithiStart || '') +
          '<br>' +
          (isPunjabi ? '<u>ਥਿਤੀ ਸਮਾਪਤੀ</u>: ' : '<u>End</u>: ') +
          (calendarData.surya?.tithiEnd || '');
      }
      const ssSankranti = document.getElementById('ssSankranti');
      if (ssSankranti) {
        ssSankranti.innerHTML =
          (isPunjabi ? '<u>ਸੰਗਰਾਂਦ</u>: ' : '<u>Sangrand</u>: ') +
          (calendarData.surya?.sangrand || '') +
          '<br>' +
          (isPunjabi ? '<u>ਸੰਕ੍ਰਾਂਤਿ</u>: ' : '<u>Sankranti</u>: ') +
          (calendarData.surya?.sankranti || '');
      }
      const ssNakshatra = document.getElementById('ssNakshatra');
      if (ssNakshatra) {
        ssNakshatra.innerHTML = (isPunjabi ? '<u>ਨਛੱਤਰ</u>: ' : '<u>Nakshatra</u>: ') + (calendarData.surya?.nakshatra || '');
      }
      const ssZodiac = document.getElementById('ssZodiac');
      if (ssZodiac) {
        ssZodiac.innerHTML =
          (isPunjabi ? '<u>ਰਾਸ਼ੀ</u>: ' : '<u>Zodiac</u>: ') +
          '<span>' + (calendarData.surya?.zodiac?.emoji || '') + '</span> ' +
          (calendarData.surya?.zodiac?.name || '');
      }

      // Other Info
      const sunrise = document.getElementById('sunrise');
      if (sunrise) {
        sunrise.innerHTML = '<span>🌅</span> ' + (isPunjabi ? '<u>ਸੂਰਜ ਚੜ੍ਹਨ</u>: ' : '<u>Sunrise</u>: ') + (calendarData.sunrise || '');
      }
      const sunset = document.getElementById('sunset');
      if (sunset) {
        sunset.innerHTML = '<span>🌇</span> ' + (isPunjabi ? '<u>ਸੂਰਜ ਛਿਪਣ</u>: ' : '<u>Sunset</u>: ') + (calendarData.sunset || '');
      }
      const moonrise = document.getElementById('moonrise');
      if (moonrise) {
        moonrise.innerHTML = '<span>🎑</span> ' + (isPunjabi ? '<u>ਚੰਦ ਚੜ੍ਹਨ</u>: ' : '<u>Moonrise</u>: ') + (calendarData.moonrise || '');
      }
      const moonset = document.getElementById('moonset');
      if (moonset) {
        moonset.innerHTML = '<span>🌃</span> ' + (isPunjabi ? '<u>ਚੰਦ ਛਿਪਣ</u>: ' : '<u>Moonset</u>: ') + (calendarData.moonset || '');
      }
      const ayanamsha = document.getElementById('ayanamsha');
      if (ayanamsha) {
        ayanamsha.innerHTML = (isPunjabi ? '<u>ਅਯਨਾਂਸ਼</u>: ' : '<u>Ayanamsha</u>: ') + (calendarData.ayanamsha || '');
      }
      const tropical = document.getElementById('tropical');
      if (tropical) {
        tropical.innerHTML = '<u>' + (calendarData.tropical?.name || '') + '</u>: ' + (calendarData.tropical?.moment || '');
      }
      const decl = document.getElementById('decl');
      if (decl) {
        decl.innerHTML =
          (isPunjabi ? '<u>ਸੂਰਜ ਤਿਰਛਾਪਣ</u>: ' : '<u>Declination</u>: ') +
          (Math.sign(calendarData.solarDecl) === 1 ? '+' : '') +
          calendarData.solarDecl +
          '°';
      }
      const kalyug = document.getElementById('kalyug');
      if (kalyug) {
        kalyug.innerHTML = (isPunjabi ? '<u>ਕਲਿਜੁਗ ਸੰਮਤ</u>: ' : '<u>Kaliyuga Era</u>: ') + (calendarData.kaljug || '');
      }
      const saka = document.getElementById('saka');
      if (saka) {
        saka.innerHTML = (isPunjabi ? '<u>ਸਾਕਾ ਸੰਮਤ</u>: ' : '<u>Saka Era</u>: ') + (calendarData.saka || '');
      }
      const jdEl = document.getElementById('JD');
      if (jdEl) {
        jdEl.innerHTML = (isPunjabi ? '<u>JD (ਦੁਪਹਿਰ ਵੇਲੇ)</u>: ' : '<u>JD (at Noon)</u>: ') + (calendarData.julianDate || '');
      }

      // Nanakshahi
      const nsDateEl = document.getElementById('nanakshahiDate');
      const oldNsYearEl = document.getElementById('oldNanakshahiYear');
      if (nanakshahiDate) {
        if (nsDateEl) {
          nsDateEl.innerHTML = isPunjabi
            ? (nanakshahiDate.punjabiDate.day + ', ' + nanakshahiDate.punjabiDate.date + ' ' + nanakshahiDate.punjabiDate.monthName + ', ' + nanakshahiDate.punjabiDate.year)
            : (nanakshahiDate.englishDate.day + ', ' + nanakshahiDate.englishDate.date + ' ' + nanakshahiDate.englishDate.monthName + ', ' + nanakshahiDate.englishDate.year);
        }
        if (oldNsYearEl) oldNsYearEl.style.display = 'none';
      } else {
        if (typeof window !== 'undefined' && sessionStorage.getItem('ackConvertOutOfRange') !== 'true') {
          setShowAlertModal(true);
        }
        if (nsDateEl) {
          nsDateEl.innerHTML = (isPunjabi ? 'ਨਾਨਕਸ਼ਾਹੀ ਸੰਮਤ: ' : 'Nanakshahi Era: ') + calendarData.nanakshahi;
        }
        if (oldNsYearEl) {
          oldNsYearEl.innerHTML = '(' + (isPunjabi ? 'ਕੱਤਕ ਪੂਰਨਮਾਸ਼ੀ ਤੋਂ: ' : 'From Katak Pooranmashi: ') + calendarData.oldNanakshahi + ')';
          oldNsYearEl.style.display = '';
        }
      }

      // Hijri & Persian
      const hijriDate = document.getElementById('hijriDate');
      if (hijriDate) hijriDate.innerHTML = calendarData.hijri || '';
      const persianDate = document.getElementById('persianDate');
      if (persianDate) persianDate.innerHTML = calendarData.persian || '';

      // Titles
      const nsTitle = document.getElementById('nsTitle');
      if (nsTitle) nsTitle.innerHTML = isPunjabi ? 'ਨਾਨਕਸ਼ਾਹੀ' : 'Nanakshahi';
      const astroTitle = document.getElementById('astroTitle');
      if (astroTitle) astroTitle.innerHTML = isPunjabi ? 'ਬਿਕ੍ਰਮੀ (ਦ੍ਰਿਕ ਗਣਿਤ)' : 'Bikrami (Drik)';
      const ssTitle = document.getElementById('ssTitle');
      if (ssTitle) ssTitle.innerHTML = isPunjabi ? 'ਬਿਕ੍ਰਮੀ (ਸੂਰਯ ਸਿਧਾਂਤ)' : 'Bikrami (Surya)';
      const otherTitle = document.getElementById('otherTitle');
      if (otherTitle) otherTitle.innerHTML = isPunjabi ? 'ਹੋਰ ਜਾਣਕਾਰੀ' : 'Other Info';
      const hijriTitle = document.getElementById('hijriTitle');
      if (hijriTitle) hijriTitle.innerHTML = isPunjabi ? 'ਹਿਜਰੀ' : 'Hijri';
      const persianTitle = document.getElementById('persianTitle');
      if (persianTitle) persianTitle.innerHTML = isPunjabi ? 'ਫ਼ਾਰਸੀ (ਸੂਰਜੀ ਹਿਜਰੀ)' : 'Persian (Solar Hijri)';
    } catch (err) {
      console.error('Error during conversion calculation:', err);
    }
  }

  const handleAcknowledgeModal = () => {
    try {
      sessionStorage.setItem('ackConvertOutOfRange', 'true');
    } catch (e) {}
    setShowAlertModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      {/* Adoption Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gold-300 overflow-hidden transform transition-all">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <Info className="w-5 h-5 text-amber-100" />
                <h5 className="font-bold text-lg">ⓘ {isPunjabi ? 'ਜਾਣਕਾਰੀ' : 'Information'}</h5>
              </div>
              <button
                type="button"
                onClick={handleAcknowledgeModal}
                className="text-white/80 hover:text-white transition p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-slate-700 text-sm leading-relaxed">
              <p>
                {isPunjabi
                  ? 'ਗਣਨਾ ਕੀਤੀ ਗਈ ਤਾਰੀਖ 2003 ਈ. (535 ਨਾ: ਸੰਮਤ) ਵਿੱਚ ਨਾਨਕਸ਼ਾਹੀ ਕੈਲੰਡਰ ਲਾਗੂ ਹੋਣ ਤੋਂ ਪਹਿਲਾਂ ਦੀ ਹੈ। ਬਿਕ੍ਰਮੀ ਸੂਰਜੀ ਤਾਰੀਖ ਨੂੰ ਨਾਨਕਸ਼ਾਹੀ ਤਾਰੀਖ ਵਜੋਂ ਵਰਤਿਆ ਜਾ ਸਕਦਾ ਹੈ।'
                  : 'The date that has been calculated was before the Nanakshahi calendar adoption in 2003 CE (535 NS). Use Bikrami solar date as Nanakshahi date.'}
              </p>
              <p className="font-medium text-amber-900">
                {isPunjabi ? 'ਨਾਨਕਸ਼ਾਹੀ ਸੰਮਤ ਪ੍ਰਦਾਨ ਕੀਤਾ ਗਿਆ ਹੈ।' : 'The Nanakshahi year has been provided.'}
              </p>
              <p className="text-xs text-slate-400">
                {isPunjabi
                  ? 'ਇਹ ਸੁਨੇਹਾ ਇਸ ਸੈਸ਼ਨ ਲਈ ਦੁਬਾਰਾ ਨਹੀਂ ਦਿਖਾਇਆ ਜਾਵੇਗਾ।'
                  : 'This message will not show again for this session.'}
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleAcknowledgeModal}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-md transition-colors"
              >
                {isPunjabi ? 'ਸਮਝ ਗਿਆ (Acknowledge)' : 'Acknowledge'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-gold-500/20 shadow-inner">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-gold-500/10 border border-gold-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-gold-300">
            <ArrowLeftRight className="w-4 h-4 text-gold-400" />
            <span>ਤਾਰੀਖ ਕਨਵਰਟਰ • Date Converter</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif-heading tracking-wide">
            {isPunjabi ? 'ਕੈਲੰਡਰ ਤਾਰੀਖ ਕਨਵਰਟਰ' : 'Calendar Date Converter'}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            {isPunjabi
              ? 'ਗ੍ਰੈਗੋਰੀਅਨ, ਜੂਲੀਅਨ, ਨਾਨਕਸ਼ਾਹੀ, ਬਿਕ੍ਰਮੀ (ਦ੍ਰਿਕ ਅਤੇ ਸੂਰਯ ਸਿਧਾਂਤ), ਹਿਜਰੀ ਅਤੇ ਫ਼ਾਰਸੀ ਕੈਲੰਡਰਾਂ ਵਿੱਚ ਤਾਰੀਖਾਂ ਬਦਲੋ।'
              : 'Seamlessly convert dates between Gregorian, Julian, Nanakshahi, Bikrami (Drik & Surya), Hijri, and Persian calendar systems.'}
          </p>

          {/* Top 2 Buttons for Punjabi and English */}
          <div className="pt-2 flex items-center justify-center space-x-3">
            <button
              type="button"
              onClick={() => handleLanguageToggle('pa')}
              className={`en pa px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md flex items-center space-x-2 border ${
                isPunjabi
                  ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white border-gold-400 shadow-gold-500/30 scale-105'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>ਪੰਜਾਬੀ</span>
            </button>

            <button
              type="button"
              onClick={() => handleLanguageToggle('en')}
              className={`en px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md flex items-center space-x-2 border ${
                !isPunjabi
                  ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white border-gold-400 shadow-gold-500/30 scale-105'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>English</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Conversion Tool */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Converter Input Controls Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gold-200/90 p-5 sm:p-7 space-y-5">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <CalendarIcon className="w-5 h-5 text-gold-600" />
            <h2 className="font-bold text-slate-800 text-base sm:text-lg">
              {isPunjabi ? 'ਕੈਲੰਡਰ ਪ੍ਰਣਾਲੀ ਅਤੇ ਤਾਰੀਖ ਚੁਣੋ' : 'Select Calendar System & Date'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Calendar System Dropdown */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {isPunjabi ? 'ਕੈਲੰਡਰ ਪ੍ਰਣਾਲੀ' : 'Calendar System'}
              </label>
              <select
                id="calendarSelect"
                name="Calendar System"
                value={calendarSystem}
                onChange={(e) => setCalendarSystem(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-gold-500 transition-shadow"
              >
                <option value="gregorian">{isPunjabi ? 'ਗ੍ਰੈਗੋਰੀਅਨ (Gregorian)' : 'Gregorian'}</option>
                <option value="julian">{isPunjabi ? 'ਜੂਲੀਅਨ (Julian)' : 'Julian'}</option>
                <option value="nanakshahi">{isPunjabi ? 'ਨਾਨਕਸ਼ਾਹੀ (Nanakshahi)' : 'Nanakshahi'}</option>
                <option value="bikrami_lunar_drik">{isPunjabi ? 'ਬਿਕ੍ਰਮੀ ਚੰਦਰ (ਦ੍ਰਿਕ) - Bikrami Lunar (Drik)' : 'Bikrami Lunar (Drik)'}</option>
                <option value="bikrami_solar_drik">{isPunjabi ? 'ਬਿਕ੍ਰਮੀ ਸੂਰਜੀ (ਦ੍ਰਿਕ) - Bikrami Solar (Drik)' : 'Bikrami Solar (Drik)'}</option>
                <option value="bikrami_lunar_surya">{isPunjabi ? 'ਬਿਕ੍ਰਮੀ ਚੰਦਰ (ਸੂਰਯ) - Bikrami Lunar (Surya)' : 'Bikrami Lunar (Surya)'}</option>
                <option value="bikrami_solar_surya">{isPunjabi ? 'ਬਿਕ੍ਰਮੀ ਸੂਰਜੀ (ਸੂਰਯ) - Bikrami Solar (Surya)' : 'Bikrami Solar (Surya)'}</option>
              </select>
            </div>

            {/* Dynamic Date Inputs */}
            <div className="md:col-span-6">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {isPunjabi ? 'ਤਾਰੀਖ ਵੇਰਵਾ' : 'Date Details'}
              </label>
              <div id="dateSelector" className="flex flex-wrap sm:flex-nowrap gap-2">
                {/* 1. Gregorian & Julian */}
                {(calendarSystem === 'gregorian' || calendarSystem === 'julian') && (
                  <>
                    <select
                      id="inputMonth"
                      name={isPunjabi ? 'ਮਹੀਨਾ' : 'Month'}
                      value={inputMonth}
                      onChange={(e) => setInputMonth(+e.target.value)}
                      className="w-full sm:w-1/2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      {(isPunjabi ? GREGORIAN_MONTHS_PA : GREGORIAN_MONTHS_EN).map((m, idx) => (
                        <option key={idx} value={idx + 1}>
                          {m}
                        </option>
                      ))}
                    </select>

                    <input
                      id="inputDate"
                      type="number"
                      min="1"
                      max="31"
                      placeholder={isPunjabi ? 'ਤਾਰੀਖ਼' : 'Date'}
                      value={inputDate}
                      onChange={(e) => setInputDate(+e.target.value)}
                      className="w-1/2 sm:w-1/4 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />

                    <input
                      id="inputYear"
                      type="number"
                      min="100"
                      placeholder={isPunjabi ? 'ਸੰਨ' : 'Year'}
                      value={inputYear}
                      onChange={(e) => setInputYear(+e.target.value)}
                      className="w-1/2 sm:w-1/4 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </>
                )}

                {/* 2. Nanakshahi */}
                {calendarSystem === 'nanakshahi' && (
                  <>
                    <input
                      id="inputDate"
                      type="number"
                      min="1"
                      max="31"
                      placeholder={isPunjabi ? 'ਤਾਰੀਖ਼' : 'Date'}
                      value={inputDate}
                      onChange={(e) => setInputDate(+e.target.value)}
                      className="w-1/3 sm:w-1/4 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />

                    <select
                      id="inputMonth"
                      name={isPunjabi ? 'ਮਹੀਨਾ' : 'Month'}
                      value={inputMonth}
                      onChange={(e) => setInputMonth(+e.target.value)}
                      className="w-2/3 sm:w-1/2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      {(isPunjabi ? NANAKSHAHI_MONTHS_PA : NANAKSHAHI_MONTHS_EN).map((m, idx) => (
                        <option key={idx} value={idx + 1}>
                          {m}
                        </option>
                      ))}
                    </select>

                    <input
                      id="inputYear"
                      type="number"
                      min="535"
                      placeholder={isPunjabi ? 'ਨਾ: ਸੰਮਤ' : 'NS Year'}
                      value={inputYear}
                      onChange={(e) => setInputYear(+e.target.value)}
                      className="w-full sm:w-1/4 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </>
                )}

                {/* 3. Bikrami Lunar (Drik & Surya) */}
                {(calendarSystem === 'bikrami_lunar_drik' || calendarSystem === 'bikrami_lunar_surya') && (
                  <>
                    <select
                      id="inputMonth"
                      name={isPunjabi ? 'ਮਹੀਨਾ' : 'Month'}
                      value={inputMonth}
                      onChange={(e) => setInputMonth(+e.target.value)}
                      className="w-1/2 sm:w-1/3 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      {(isPunjabi ? NANAKSHAHI_MONTHS_PA : NANAKSHAHI_MONTHS_EN).map((m, idx) => (
                        <option key={idx} value={idx + 1}>
                          {m}
                        </option>
                      ))}
                    </select>

                    <select
                      id="inputPaksh"
                      name={isPunjabi ? 'ਪਕਸ਼' : 'Paksh'}
                      value={inputPaksh}
                      onChange={(e) => setInputPaksh(e.target.value)}
                      className="w-1/2 sm:w-1/4 bg-slate-50 border border-slate-300 rounded-xl px-2 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      <option value="false">{isPunjabi ? 'ਸੁਦੀ' : 'Sudi'}</option>
                      <option value="true">{isPunjabi ? 'ਵਦੀ' : 'Vadi'}</option>
                    </select>

                    <input
                      id="inputDate"
                      type="number"
                      min="1"
                      max="15"
                      placeholder={isPunjabi ? 'ਥਿਤੀ' : 'Tithi'}
                      value={inputDate}
                      onChange={(e) => setInputDate(+e.target.value)}
                      className="w-1/2 sm:w-1/5 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />

                    <input
                      id="inputYear"
                      type="number"
                      placeholder={isPunjabi ? 'ਸੰਮਤ' : 'Year'}
                      value={inputYear}
                      onChange={(e) => setInputYear(+e.target.value)}
                      className="w-1/2 sm:w-1/5 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </>
                )}

                {/* 4. Bikrami Solar (Drik & Surya) */}
                {(calendarSystem === 'bikrami_solar_drik' || calendarSystem === 'bikrami_solar_surya') && (
                  <>
                    <input
                      id="inputDate"
                      type="number"
                      min="1"
                      max="32"
                      placeholder={isPunjabi ? 'ਤਾਰੀਖ਼' : 'Date'}
                      value={inputDate}
                      onChange={(e) => setInputDate(+e.target.value)}
                      className="w-1/3 sm:w-1/4 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />

                    <select
                      id="inputMonth"
                      name={isPunjabi ? 'ਮਹੀਨਾ' : 'Month'}
                      value={inputMonth}
                      onChange={(e) => setInputMonth(+e.target.value)}
                      className="w-2/3 sm:w-1/2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      {(isPunjabi ? BIKRAMI_SOLAR_MONTHS_PA : BIKRAMI_SOLAR_MONTHS_EN).map((m, idx) => (
                        <option key={idx} value={idx + 1}>
                          {m}
                        </option>
                      ))}
                    </select>

                    <input
                      id="inputYear"
                      type="number"
                      placeholder={isPunjabi ? 'ਬਿ: ਸੰਮਤ' : 'Bikrami Year'}
                      value={inputYear}
                      onChange={(e) => setInputYear(+e.target.value)}
                      className="w-full sm:w-1/4 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Convert Button */}
            <div className="md:col-span-2 pt-1 sm:pt-6">
              <button
                type="button"
                id="getDate"
                onClick={runConversion}
                className="w-full bg-gradient-to-r from-gold-500 via-gold-600 to-amber-600 hover:from-gold-600 hover:to-amber-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-98 flex items-center justify-center space-x-1.5 text-sm"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>{isPunjabi ? 'ਕਨਵਰਟ ਕਰੋ' : 'Convert'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Primary Converted Date Result */}
        <div className="text-center space-y-2">
          <h3
            id="gregorian"
            className="text-2xl sm:text-3xl font-bold font-serif-heading text-slate-900 tracking-wide"
          >
            {isPunjabi ? 'ਤਾਰੀਖ ਲੋਡ ਹੋ ਰਹੀ ਹੈ...' : 'Loading Date...'}
          </h3>
          <h5
            id="julianDate"
            style={{ display: 'none' }}
            className="text-sm font-semibold text-amber-800 tracking-wide"
          ></h5>
        </div>

        {/* Nanakshahi Highlight Card */}
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gold-300 overflow-hidden text-center transition-all hover:shadow-xl">
            <div
              id="nsTitle"
              className="bg-gradient-to-r from-amber-600 via-gold-600 to-amber-600 text-white py-3 px-6 text-base sm:text-lg font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-inner"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isPunjabi ? 'ਨਾਨਕਸ਼ਾਹੀ' : 'Nanakshahi'}</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="p-6 space-y-2 bg-gradient-to-b from-amber-50/40 to-white">
              <h4
                id="nanakshahiDate"
                className="text-xl sm:text-2xl font-bold text-slate-900 font-gurmukhi tracking-wide"
              ></h4>
              <p
                id="oldNanakshahiYear"
                style={{ display: 'none' }}
                className="text-sm font-medium text-slate-500 pt-1"
              ></p>
            </div>
          </div>
        </div>

        {/* Historical Calendars Section */}
        <div id="historicalCal" className="space-y-6">
          <div className="text-center space-y-1 border-t border-slate-200 pt-8">
            <h3 className="text-2xl font-bold font-serif-heading text-slate-900">
              {isPunjabi ? 'ਇਤਿਹਾਸਕ ਅਤੇ ਖਗੋਲ ਵਿਗਿਆਨ ਕੈਲੰਡਰ' : 'Historical & Astronomical Calendars'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              {isPunjabi
                ? 'ਵੱਖ-ਵੱਖ ਸ਼ਹਿਰਾਂ ਅਨੁਸਾਰ ਬਿਕ੍ਰਮੀ ਸੰਮਤ, ਤਿੱਥ, ਨਛੱਤਰ ਅਤੇ ਸੂਰਜ/ਚੰਦ ਚੜ੍ਹਨ-ਛਿਪਣ ਦੇ ਵੇਰਵੇ'
                : 'Astronomical Bikrami dates, tithi, nakshatra, and solar coordinates by historical location.'}
            </p>
          </div>

          {/* Location Selector */}
          <div className="max-w-md mx-auto space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 text-center flex items-center justify-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-gold-600" />
              <span>{isPunjabi ? 'ਸਥਾਨ ਚੁਣੋ (Location)' : 'Select Location:'}</span>
            </label>
            <select
              id="locationSelect"
              name="Location"
              value={locationKey}
              onChange={(e) => setLocationKey(e.target.value)}
              className="w-full bg-white border border-gold-300 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc.value} value={loc.value}>
                  {loc.label}
                </option>
              ))}
            </select>
            <div className="text-center">
              <span className="inline-block text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                Timezone: IST (UT+5:30)
              </span>
            </div>
          </div>

          {/* Tri-Card Grid: Drik Bikrami, Surya Bikrami, Other Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Bikrami Drik */}
            <div className="bg-white rounded-2xl shadow-sm border border-gold-200 overflow-hidden flex flex-col">
              <div
                id="astroTitle"
                className="bg-amber-100/70 border-b border-gold-200 py-2.5 px-4 text-center font-bold text-sm text-amber-900"
              >
                {isPunjabi ? 'ਬਿਕ੍ਰਮੀ (ਦ੍ਰਿਕ ਗਣਿਤ)' : 'Bikrami (Drik)'}
              </div>
              <div className="p-4 border-b border-slate-100 text-center">
                <div id="astroSolarDate" className="text-base font-bold text-slate-900"></div>
              </div>
              <ul className="divide-y divide-slate-100 text-xs text-slate-700 flex-1">
                <li id="astroLunarDate" className="p-3 bg-amber-50/30"></li>
                <li id="astroTithi" className="p-3"></li>
                <li id="astroTithiTime" className="p-3 leading-relaxed"></li>
                <li id="astroSankranti" className="p-3 leading-relaxed"></li>
                <li id="astroNakshatra" className="p-3"></li>
                <li id="astroZodiac" className="p-3 font-semibold text-slate-800"></li>
              </ul>
            </div>

            {/* 2. Bikrami Surya */}
            <div className="bg-white rounded-2xl shadow-sm border border-gold-200 overflow-hidden flex flex-col">
              <div
                id="ssTitle"
                className="bg-amber-100/70 border-b border-gold-200 py-2.5 px-4 text-center font-bold text-sm text-amber-900"
              >
                {isPunjabi ? 'ਬਿਕ੍ਰਮੀ (ਸੂਰਯ ਸਿਧਾਂਤ)' : 'Bikrami (Surya)'}
              </div>
              <div className="p-4 border-b border-slate-100 text-center">
                <div id="ssSolarDate" className="text-base font-bold text-slate-900"></div>
              </div>
              <ul className="divide-y divide-slate-100 text-xs text-slate-700 flex-1">
                <li id="ssLunarDate" className="p-3 bg-amber-50/30"></li>
                <li id="ssTithi" className="p-3"></li>
                <li id="ssTithiTime" className="p-3 leading-relaxed"></li>
                <li id="ssSankranti" className="p-3 leading-relaxed"></li>
                <li id="ssNakshatra" className="p-3"></li>
                <li id="ssZodiac" className="p-3 font-semibold text-slate-800"></li>
              </ul>
            </div>

            {/* 3. Other Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gold-200 overflow-hidden flex flex-col">
              <div
                id="otherTitle"
                className="bg-amber-100/70 border-b border-gold-200 py-2.5 px-4 text-center font-bold text-sm text-amber-900"
              >
                {isPunjabi ? 'ਹੋਰ ਜਾਣਕਾਰੀ' : 'Other Info'}
              </div>
              <ul className="divide-y divide-slate-100 text-xs text-slate-700 flex-1">
                <li className="p-3 space-y-1">
                  <div id="sunrise"></div>
                  <div id="sunset"></div>
                </li>
                <li className="p-3 space-y-1">
                  <div id="moonrise"></div>
                  <div id="moonset"></div>
                </li>
                <li className="p-3 space-y-1">
                  <div id="tropical"></div>
                  <div id="decl"></div>
                </li>
                <li id="ayanamsha" className="p-3"></li>
                <li className="p-3 space-y-1">
                  <div id="kalyug"></div>
                  <div id="saka"></div>
                </li>
                <li id="JD" className="p-3"></li>
              </ul>
            </div>
          </div>

          {/* Dual Card Grid: Hijri & Persian */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Hijri */}
            <div className="bg-white rounded-2xl shadow-sm border border-gold-200 overflow-hidden">
              <div
                id="hijriTitle"
                className="bg-slate-100 border-b border-slate-200 py-2.5 px-4 text-center font-bold text-sm text-slate-800"
              >
                {isPunjabi ? 'ਹਿਜਰੀ' : 'Hijri'}
              </div>
              <div className="p-5 text-center">
                <h5 id="hijriDate" className="text-base sm:text-lg font-bold text-slate-800"></h5>
              </div>
            </div>

            {/* Persian */}
            <div className="bg-white rounded-2xl shadow-sm border border-gold-200 overflow-hidden">
              <div
                id="persianTitle"
                className="bg-slate-100 border-b border-slate-200 py-2.5 px-4 text-center font-bold text-sm text-slate-800"
              >
                {isPunjabi ? 'ਫ਼ਾਰਸੀ (ਸੂਰਜੀ ਹਿਜਰੀ)' : 'Persian (Solar Hijri)'}
              </div>
              <div className="p-5 text-center">
                <h5 id="persianDate" className="text-base sm:text-lg font-bold text-slate-800"></h5>
              </div>
            </div>
          </div>

          {/* Historical Footnote */}
          <div className="bg-amber-50/60 rounded-xl p-4 border border-gold-300/60 text-center text-xs text-slate-600 space-y-1">
            <p>
              Calculations are based off <em>Calendrical Calculations: The Ultimate Edition</em> (2018).
            </p>
            <p className="text-slate-500">
              May not represent historical reality. Calculations may be ±1 days off.
            </p>
          </div>
        </div>

        {/* Quick Links Back */}
        <div className="pt-4 flex items-center justify-center space-x-4 text-sm">
          <Link
            href="/calender"
            className="text-gold-700 hover:text-gold-800 font-semibold underline flex items-center space-x-1"
          >
            <span>← {isPunjabi ? 'ਨਾਨਕਸ਼ਾਹੀ ਕੈਲੰਡਰ ਦੇਖੋ' : 'View Nanakshahi Calendar'}</span>
          </Link>
          <span className="text-slate-300">|</span>
          <Link
            href="/daily-hukamnamas"
            className="text-gold-700 hover:text-gold-800 font-semibold underline flex items-center space-x-1"
          >
            <span>{isPunjabi ? 'ਰੋਜ਼ਾਨਾ ਹੁਕਮਨਾਮਾ ਸਾਹਿਬ' : 'Daily Hukamnama Sahib'} →</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
