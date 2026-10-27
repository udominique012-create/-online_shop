<?php
/* ============================================================
   FRANCOIS SHOES & CLOTHES STORE — Configuration
   ============================================================ */

/* ===== Database ===== */
const DB_HOST = 'localhost';
const DB_NAME = 'product';
const DB_USER = 'root';
const DB_PASS = '';

/* ===== Delivery ===== */
// ⚠️ SHYIRA 0 kugira ngo nta mafaranga yongerwa ku giciro cy'ibicuruzwa
// Umukiriya yishyura 150 → admin abona 150 (nta 2000 yongeweho)
const DELIVERY          = 0;
const FREE_OVER         = 0;
const TRANSPORT_OUTSIDE = 0;

/* ===== Uploads ===== */
const MAX_UPLOAD_MB = 60;

/* ===== Security ===== */
const COOKIE_SECURE = false;
const DEBUG         = false;
const SESSION_IDLE  = 1800;
const SESSION_MAX   = 28800;

/* ===== Email (SMTP) ===== */
const MAIL_FROM      = 'no-reply@yourdomain.rw';
const MAIL_FROM_NAME = 'Online Shop';
const SMTP_HOST      = 'smtp.yourhost.com';
const SMTP_PORT      = 587;
const SMTP_USER      = 'no-reply@yourdomain.rw';
const SMTP_PASS      = 'SMTP_PASSWORD_YAWE';
const SMTP_SECURE    = 'tls';

/* ===== SMS ===== */
const SMS_USER = 'sandbox';
const SMS_KEY  = 'SMS_API_KEY_YAWE';
const SMS_FROM = 'FRANCOIS';
const SMS_URL  = 'https://api.africastalking.com/version1/messaging';

/* ===== Urubuga ===== */
const SITE_URL  = 'https://yourdomain.rw';
const RESET_TTL = 1800;
const OTP_TTL   = 600;
const OTP_MAX_TRY = 5;

/* ===== Admin ===== */
if (!defined('ADMIN_PHONE')) {
    define('ADMIN_PHONE','+250784292599');
}