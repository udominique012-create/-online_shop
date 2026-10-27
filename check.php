<?php
/* API ya PHP + MySQL — ikora nk'iya Python (app.py): imbuga (index.html/admin.html) zikoresha izo nzira zimwe. */
require __DIR__ . '/config.php';
ini_set('display_errors', '0');          // ntuzane amakosa ya PHP mu mwanya wa JSON
ob_start();                               // gufata ibyasohotse kubw'impanuka (warnings)
foreach (['DEBUG' => false, 'SESSION_IDLE' => 1800, 'SESSION_MAX' => 28800] as $k => $v) if (!defined($k)) define($k, $v);
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Cache-Control: no-store');       // ibicuruzwa bishya bigaragare ako kanya (browser ntibibike)
header('Referrer-Policy: strict-origin-when-cross-origin');
register_shutdown_function(function () {  // niba PHP ihuye n'ikosa rikomeye: subiza JSON, si urupapuro rwera
    $e = error_get_last();
    if ($e && in_array($e['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR], true)) {
        while (ob_get_level() > 0) ob_end_clean();
        if (!headers_sent()) { http_response_code(500); header('Content-Type: application/json; charset=utf-8'); }
        echo json_encode(['error' => 'server', 'detail' => DEBUG ? $e['message'] : 'Ikosa rya seriveri. Shyira DEBUG=true muri config.php urebe ibisobanuro.']);
    }
});
const LOCK_N = 5, LOCK_MIN = 15;         // konti ifungwa iminota 15 nyuma yo kwibeshya inshuro 5

const CATS = ['Imyenda', 'Inkweto'];
const TYPES = ['shirt', 'dress', 'pants', 'shoe', 'boot'];
const PAYS = ['itegereje', 'yishyuwe', 'yanzwe'];
const EXT = ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'webm'];
const PINS = 'INSERT INTO products(name,cat,type,color,bg,price,old_price,sizes,badge,image,video) VALUES(?,?,?,?,?,?,?,?,?,?,?)';

function out($d, $code = 200) { while (ob_get_level() > 0) ob_end_clean(); http_response_code($code); echo json_encode($d, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE); exit; }
function db() {
    static $p = null;
    if (!$p) $p = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]);
    return $p;
}
function q($sql, $args = []) { $s = db()->prepare($sql); $s->execute($args); return $s; }
function all($sql, $args = []) { return q($sql, $args)->fetchAll(); }
function one($sql, $args = []) { $r = q($sql, $args)->fetch(); return $r ? $r : null; }
function body() { static $b = null; if ($b === null) { $b = json_decode(file_get_contents('php://input'), true); if (!is_array($b)) $b = []; } return $b; }
function s($v, $n) { return mb_substr(trim((string)$v), 0, $n); }
function digits($v, $n = 20) { return substr(preg_replace('/[^\d+]/', '', (string)$v), 0, $n); }
function ints(&$r, $keys) { foreach ($keys as $k) if (array_key_exists($k, $r) && $r[$k] !== null) $r[$k] = (int)$r[$k]; }
function sess() {
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'secure' => COOKIE_SECURE, 'httponly' => true, 'samesite' => 'Strict']);
        session_start();
    }
}
function admin() {
    if (!alive()) out(['error' => 'auth'], 401);
    if ($_SERVER['REQUEST_METHOD'] !== 'GET' && !hash_equals((string)($_SESSION['csrf'] ?? ''), (string)($_SERVER['HTTP_X_CSRF'] ?? ''))) out(['error' => 'csrf'], 403);
}
function ipaddr() { return substr((string)($_SERVER['REMOTE_ADDR'] ?? '?'), 0, 45); }
function locked($u) {
    $since = time() - LOCK_MIN * 60;
    $a = (int)one('SELECT COUNT(*) n FROM login_attempts WHERE ip=? AND ts>?', [ipaddr(), $since])['n'];
    $b = $u !== '' ? (int)one('SELECT COUNT(*) n FROM login_attempts WHERE username=? AND ts>?', [$u, $since])['n'] : 0;
    return $a >= LOCK_N || $b >= LOCK_N * 2;
}
function fail($u) { q('INSERT INTO login_attempts(ip,username,ts) VALUES(?,?,?)', [ipaddr(), $u, time()]); q('DELETE FROM login_attempts WHERE ts<?', [time() - 86400]); }
function clearFails($u) { q('DELETE FROM login_attempts WHERE ip=? OR username=?', [ipaddr(), $u]); }
function norm($c) { return preg_replace('/[^A-Z0-9]/', '', strtoupper((string)$c)); }
function newcode() {   // kode yo kugarura ijambobanga, urugero K7M2-9XQP-4TDH-6WRB
    $al = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; $o = '';
    for ($i = 0; $i < 16; $i++) { $o .= $al[random_int(0, 31)]; if ($i % 4 === 3 && $i < 15) $o .= '-'; }
    return $o;
}
function alive() {   // session irangira nyuma y'iminota 30 udakoze cyangwa amasaha 8
    sess();
    if (empty($_SESSION['admin'])) return false;
    $n = time();
    if ($n - (int)($_SESSION['last'] ?? 0) > SESSION_IDLE || $n - (int)($_SESSION['start'] ?? 0) > SESSION_MAX) { $_SESSION = []; session_destroy(); return false; }
    $_SESSION['last'] = $n; return true;
}
function nowstr() { return substr((string)one('SELECT NOW() n')['n'], 0, 19); }
function sinceOf($rng) {   // itariki yo gutangira: uyu munsi / iminsi 7 / iminsi 30
    $days = ['today' => 0, '7' => 6, '30' => 29];
    if (!isset($days[$rng])) return null;
    return date('Y-m-d H:i:s', strtotime(substr(nowstr(), 0, 10) . ' 00:00:00') - $days[$rng] * 86400);
}
function chatBy($t) { return one('SELECT * FROM chats WHERE token=?', [(string)$t]); }
function say($cid, $who, $b) {
    q('INSERT INTO messages(chat_id,sender,body) VALUES(?,?,?)', [$cid, $who, $b]);
    q('UPDATE chats SET last_msg_at=NOW(), admin_unread=admin_unread+? WHERE id=?', [$who === 'c' ? 1 : 0, $cid]);
}
function sniff($h, $e) {   // genzura ko file ari ukuri (si izina gusa)
    if ($e === 'jpg' || $e === 'jpeg') return substr($h, 0, 2) === "\xff\xd8";
    if ($e === 'png') return substr($h, 0, 4) === "\x89PNG";
    if ($e === 'webp') return substr($h, 0, 4) === 'RIFF' && substr($h, 8, 4) === 'WEBP';
    if ($e === 'mp4') return substr($h, 4, 4) === 'ftyp';
    if ($e === 'webm') return substr($h, 0, 4) === "\x1a\x45\xdf\xa3";
    return false;
}function sendMail(string $to, string $subject, string $body): bool {
    // Ushobora gukoresha PHPMailer (composer require phpmailer/phpmailer)
    // Hano ndakoresha mail() — niba SMTP-config itari yo, hindura ukoreshe PHPMailer.
    $h  = "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=utf-8\r\n";
    $h .= 'From: ' . MAIL_FROM_NAME . ' <' . MAIL_FROM . ">\r\n";
    return @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $h);
}

function sendSms(string $to, string $msg): bool {
    $ch = curl_init(SMS_URL);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['apiKey: ' . SMS_KEY, 'Accept: application/json'],
        CURLOPT_POSTFIELDS => http_build_query([
            'username' => SMS_USER, 'to' => $to, 'message' => $msg, 'from' => SMS_FROM,
        ]),
        CURLOPT_TIMEOUT => 10,
    ]);
    $r = curl_exec($ch);
    $ok = $r !== false && curl_getinfo($ch, CURLINFO_HTTP_CODE) < 300;
    if (!$ok) error_log('SMS fail: ' . (string)$r);
    return $ok;
}
function media($u) { $u = trim((string)$u); return (strpos($u, '/uploads/') === 0 && strpos($u, '..') === false && strlen($u) <= 255) ? $u : null; }
function rm($u) { $u = media($u); if ($u) { $f = __DIR__ . '/uploads/' . basename($u); if (is_file($f)) @unlink($f); } }
function pfields($d) {
    $name = s($d['name'] ?? '', 150); $cat = $d['cat'] ?? ''; $type = $d['type'] ?? '';
    if ($name === '' || !in_array($cat, CATS, true) || !in_array($type, TYPES, true)) throw new InvalidArgumentException('bad');
    if (!isset($d['price']) || !is_numeric($d['price']) || (int)$d['price'] <= 0) throw new InvalidArgumentException('bad');
    $old = (int)($d['old'] ?? 0);
    return [$name, $cat, $type, s($d['color'] ?? '#d6246e', 9), s($d['bg'] ?? '#ffe3ef', 9), (int)$d['price'], $old > 0 ? $old : null,
            s($d['sizes'] ?? '', 100), s($d['badge'] ?? '', 30), media($d['image'] ?? null), media($d['video'] ?? null)];
}

/* ---- ijyana (router) ---- */
$method = $_SERVER['REQUEST_METHOD'];
$parts = array_values(array_filter(explode('/', trim((string)($_GET['route'] ?? ''), '/')), 'strlen'));
$sig = []; $ids = [];
foreach ($parts as $p) { if (ctype_digit($p)) { $sig[] = '{id}'; $ids[] = (int)$p; } else $sig[] = $p; }
$key = $method . ' ' . implode('/', $sig);
$id = $ids[0] ?? 0;

try {
    switch ($key) {
    /* ---------- PUBLIC ---------- */
    case 'GET ':
        out(['ok' => true, 'message' => 'Online Shop API ikora']);

    case 'GET products':
        $page = max(1, (int)($_GET['page'] ?? 1)); $per = 24; $where = ['active=1']; $args = [];
        $cat = (string)($_GET['cat'] ?? '');
        if (in_array($cat, CATS, true)) { $where[] = 'cat=?'; $args[] = $cat; }
        $sq = s($_GET['q'] ?? '', 50);
        if ($sq !== '') { $where[] = 'name LIKE ?'; $args[] = '%' . $sq . '%'; }
        $orders = ['a' => 'price ASC', 'd' => 'price DESC'];
        $order = $orders[(string)($_GET['sort'] ?? '')] ?? 'id DESC';
        $w = implode(' AND ', $where);
        $total = (int)one("SELECT COUNT(*) n FROM products WHERE $w", $args)['n'];
        $rows = all("SELECT id,name n,cat c,type t,color col,bg,price p,old_price o,sizes s,badge b,image img,video v FROM products WHERE $w ORDER BY $order LIMIT $per OFFSET " . (($page - 1) * $per), $args);
        foreach ($rows as &$x) {
            ints($x, ['id', 'p', 'o']);
            $x['s'] = array_values(array_filter(array_map('trim', explode(',', (string)$x['s'])), 'strlen'));
            $x['b'] = $x['b'] === null ? '' : $x['b'];
        }
        unset($x);
        out(['items' => $rows, 'total' => $total, 'per' => $per]);

    case 'GET announcements':
        out(array_column(all('SELECT body t FROM announcements WHERE active=1 ORDER BY id DESC LIMIT 5'), 't'));

    case 'POST order':
        $d = body(); $name = s($d['name'] ?? '', 100); $phone = digits($d['phone'] ?? '');
        if ($name === '' || strlen($phone) < 9 || empty($d['items']) || !is_array($d['items'])) out(['ok' => false], 422);
        $total = 0; $items = [];
        foreach (array_slice($d['items'], 0, 50) as $i) {
            if (!is_array($i)) continue;
            $p = one('SELECT name,price FROM products WHERE id=? AND active=1', [(int)($i['id'] ?? 0)]);
            $n = max(1, min(20, (int)($i['qty'] ?? 1)));
            if ($p) { $total += (int)$p['price'] * $n; $items[] = ['name' => $p['name'], 'size' => s($i['size'] ?? '', 10), 'qty' => $n, 'price' => (int)$p['price']]; }
        }
        if (!$items) out(['ok' => false], 422);
        $pick = (($d['mode'] ?? '') === 'pick'); $ship = ($pick || $total >= FREE_OVER) ? 0 : DELIVERY;
        q('INSERT INTO orders(name,phone,address,items,total,momo_txn) VALUES(?,?,?,?,?,?)',
          [$name, $phone, $pick ? 'Azabifata ku iduka' : s($d['address'] ?? '', 255), json_encode($items, JSON_UNESCAPED_UNICODE), $total + $ship, s($d['txn'] ?? '', 50)]);
        out(['ok' => true, 'total' => $total + $ship]);

    case 'POST chat/start':
        $d = body(); $name = s($d['name'] ?? '', 100);
        if ($name === '') out(['ok' => false], 422);
        $tok = bin2hex(random_bytes(16)); $prod = s($d['product'] ?? '', 150);
        q('INSERT INTO chats(token,name,phone,product) VALUES(?,?,?,?)', [$tok, $name, digits($d['phone'] ?? ''), $prod]);
        $cid = (int)db()->lastInsertId();
        if ($prod !== '') say($cid, 'c', 'Ndashaka kumenya byinshi kuri: ' . $prod);
        out(['token' => $tok]);

    case 'POST chat/send':
        $d = body(); $c = chatBy($d['token'] ?? ''); $b = s($d['body'] ?? '', 1000);
        if (!$c || $b === '') out(['ok' => false], 404);
        if ((int)one('SELECT COUNT(*) n FROM messages WHERE chat_id=?', [$c['id']])['n'] < 500) say((int)$c['id'], 'c', $b);
        out(['ok' => true]);

    case 'GET chat/poll':
        $c = chatBy($_GET['token'] ?? '');
        if (!$c) out(['ok' => false], 404);
        $rows = all('SELECT id,sender s,body b FROM messages WHERE chat_id=? AND id>? ORDER BY id LIMIT 100', [$c['id'], (int)($_GET['after'] ?? 0)]);
        foreach ($rows as &$m) ints($m, ['id']);
        unset($m);
        out(['m' => $rows]);

    /* ---------- ADMIN ---------- */
   case 'POST admin/setup':
    $d = body();
    $u     = s($d['u'] ?? '', 50);
    $pw    = (string)($d['p'] ?? '');
    $email = filter_var(trim((string)($d['email'] ?? '')), FILTER_VALIDATE_EMAIL);
    $phone = preg_replace('/[^\d+]/', '', (string)($d['phone'] ?? ''));

    if ((int)one('SELECT COUNT(*) n FROM admins')['n'] > 0) out(['ok'=>false, 'error'=>'exists'], 403);
    if ($u === '' || strlen($pw) < 8)     out(['ok'=>false, 'error'=>'bad'], 422);
    if (!$email)                          out(['ok'=>false, 'error'=>'email'], 422);
    if (strlen($phone) < 9)               out(['ok'=>false, 'error'=>'phone'], 422);

    // Reba niba email/phone itarasanzwe
    if (one('SELECT id FROM admins WHERE email=? OR phone=?', [$email, $phone]))
        out(['ok'=>false, 'error'=>'dup'], 409);

    $code = newcode();   // kode y'agace y'inyongera (nka backup)
    q('INSERT INTO admins(username,email,phone,pass,recovery) VALUES(?,?,?,?,?)',
      [$u, $email, $phone, password_hash($pw, PASSWORD_DEFAULT), password_hash(norm($code), PASSWORD_DEFAULT)]);

    out(['ok'=>true, 'recovery'=>$code]);
    // POST admin/request-reset
    case 'POST admin/request-reset':
    $d = body();
    $ident = s($d['ident'] ?? '', 190);   // email cyangwa telefoni
    $ch    = (string)($d['channel'] ?? 'e');   // 'e' cyangwa 'p'

    // Ntugaragaze niba itabaho — buri gihe subiza "ok"
    $row = one('SELECT * FROM admins WHERE email=? OR phone=? LIMIT 1', [$ident, $ident]);
    if (!$row) { usleep(400000); out(['ok'=>true]); }

    // Rate limit: ntarengwa 3 mu minota 15
    $recent = (int)one('SELECT COUNT(*) n FROM password_resets WHERE admin_id=? AND created_at > (NOW() - INTERVAL 15 MINUTE)',
                       [$row['id']])['n'];
    if ($recent >= 3) out(['ok'=>false, 'error'=>'slow'], 429);

    if ($ch === 'p') {
        // ===== OTP kuri telefoni =====
        if (!$row['phone']) out(['ok'=>true]);  // nta telefoni — ntacyo dukora
        $otp = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        q('INSERT INTO otp_codes(admin_id,code_hash,expires_at) VALUES(?,?, DATE_ADD(NOW(), INTERVAL ? SECOND))',
          [$row['id'], hash('sha256', $otp), OTP_TTL]);
        sendSms($row['phone'], "Online Shop: kode yo kugarura ijambobanga ni $otp. Igihe: iminota 10.");
    } else {
        // ===== Link kuri email =====
        if (!$row['email']) out(['ok'=>true]);
        $token = bin2hex(random_bytes(32));
        q('INSERT INTO password_resets(admin_id,token_hash,channel,expires_at) VALUES(?,?,?, DATE_ADD(NOW(), INTERVAL ? SECOND))',
          [$row['id'], hash('sha256', $token), 'e', RESET_TTL]);
        $link = SITE_URL . '/admin.html?reset=' . urlencode($token);
        sendMail($row['email'], 'Kugarura ijambobanga — Online Shop',
            "Muraho {$row['username']},\n\nKanda iyi link uhindure ijambobanga (iminota 30):\n$link\n\nNiba utabisabye, wirengagije iyi email.");
    }
    out(['ok'=>true]);
    //POST admin/reset
    case 'POST admin/reset':
    $d = body();
    $pw = (string)($d['p'] ?? '');
    if (strlen($pw) < 8) out(['ok'=>false, 'error'=>'short'], 422);

    $adminId = 0;

    // A) Binyuze kuri token ya email
    if (!empty($d['token'])) {
        $t = one('SELECT * FROM password_resets WHERE token_hash=? AND used=0 AND expires_at>NOW()',
                 [hash('sha256', (string)$d['token'])]);
        if (!$t) out(['ok'=>false, 'error'=>'invalid'], 401);
        $adminId = (int)$t['admin_id'];
        q('UPDATE password_resets SET used=1 WHERE id=?', [$t['id']]);
    }
    // B) Binyuze kuri OTP ya telefoni
    elseif (!empty($d['otp']) && !empty($d['ident'])) {
        $row = one('SELECT * FROM admins WHERE email=? OR phone=? LIMIT 1', [$d['ident'], $d['ident']]);
        if (!$row) out(['ok'=>false, 'error'=>'invalid'], 401);
        $o = one('SELECT * FROM otp_codes WHERE admin_id=? AND used=0 AND expires_at>NOW() ORDER BY id DESC LIMIT 1',
                 [$row['id']]);
        if (!$o || $o['attempts'] >= OTP_MAX_TRY) out(['ok'=>false, 'error'=>'invalid'], 401);
        q('UPDATE otp_codes SET attempts=attempts+1 WHERE id=?', [$o['id']]);
        if (!hash_equals($o['code_hash'], hash('sha256', (string)$d['otp']))) out(['ok'=>false, 'error'=>'invalid'], 401);
        q('UPDATE otp_codes SET used=1 WHERE id=?', [$o['id']]);
        $adminId = (int)$row['id'];
    } else {
        out(['ok'=>false, 'error'=>'bad'], 422);
    }

    q('UPDATE admins SET pass=? WHERE id=?', [password_hash($pw, PASSWORD_DEFAULT), $adminId]);
    // Siba tokens/OTP zose zisigaye
    q('DELETE FROM password_resets WHERE admin_id=?', [$adminId]);
    q('DELETE FROM otp_codes WHERE admin_id=?', [$adminId]);
    out(['ok'=>true]);
    // POST admin/update-contact
    case 'POST admin/update-contact':
    admin();
    $d = body();
    $email = filter_var(trim((string)($d['email'] ?? '')), FILTER_VALIDATE_EMAIL);
    $phone = preg_replace('/[^\d+]/', '', (string)($d['phone'] ?? ''));
    if (!$email || strlen($phone) < 9) out(['ok'=>false, 'error'=>'bad'], 422);
    if (one('SELECT id FROM admins WHERE (email=? OR phone=?) AND id<>?', [$email, $phone, (int)$_SESSION['admin']]))
        out(['ok'=>false, 'error'=>'dup'], 409);
    q('UPDATE admins SET email=?, phone=? WHERE id=?', [$email, $phone, (int)$_SESSION['admin']]);
    out(['ok'=>true]);

    case 'POST admin/login':
        sess(); $d = body(); $u = s($d['u'] ?? '', 50);
        if (locked($u)) out(['error' => 'locked', 'minutes' => LOCK_MIN], 429);
        $row = one('SELECT * FROM admins WHERE username=?', [$u]);
        if (!$row || !password_verify((string)($d['p'] ?? ''), $row['pass'])) { fail($u); usleep(500000); out(['ok' => false], 401); }
        clearFails($u); session_regenerate_id(true);
        $_SESSION['admin'] = (int)$row['id']; $_SESSION['csrf'] = bin2hex(random_bytes(16)); $_SESSION['start'] = $_SESSION['last'] = time();
        out(['ok' => true, 'csrf' => $_SESSION['csrf']]);

    case 'POST admin/recover':   // kugarura ijambobanga ukoresheje kode yo kugarura
        $d = body(); $u = s($d['u'] ?? '', 50); $pw = (string)($d['p'] ?? '');
        if (locked($u)) out(['error' => 'locked', 'minutes' => LOCK_MIN], 429);
        if (strlen($pw) < 8) out(['ok' => false, 'error' => 'short'], 422);
        $row = one('SELECT * FROM admins WHERE username=?', [$u]);
        if (!$row || !$row['recovery'] || !password_verify(norm($d['code'] ?? ''), $row['recovery'])) { fail($u); usleep(500000); out(['ok' => false], 401); }
        $code = newcode();
        q('UPDATE admins SET pass=?, recovery=? WHERE id=?', [password_hash($pw, PASSWORD_DEFAULT), password_hash(norm($code), PASSWORD_DEFAULT), $row['id']]);
        clearFails($u); sess(); $_SESSION = [];
        out(['ok' => true, 'recovery' => $code]);

    case 'POST admin/account':   // guhindura ijambobanga / gukora kode nshya yo kugarura
        admin(); $d = body();
        $row = one('SELECT * FROM admins WHERE id=?', [(int)$_SESSION['admin']]);
        if (locked($row['username'])) out(['error' => 'locked', 'minutes' => LOCK_MIN], 429);
        if (!password_verify((string)($d['old'] ?? ''), $row['pass'])) { fail($row['username']); out(['ok' => false, 'error' => 'badpass'], 400); }
        $new = (string)($d['new'] ?? ''); $res = ['ok' => true];
        if ($new !== '') { if (strlen($new) < 8) out(['ok' => false, 'error' => 'short'], 422); q('UPDATE admins SET pass=? WHERE id=?', [password_hash($new, PASSWORD_DEFAULT), $row['id']]); }
        if (!empty($d['regen'])) { $res['recovery'] = newcode(); q('UPDATE admins SET recovery=? WHERE id=?', [password_hash(norm($res['recovery']), PASSWORD_DEFAULT), $row['id']]); }
        clearFails($row['username']); out($res);

    case 'POST admin/logout':
        admin(); $_SESSION = []; session_destroy(); out(['ok' => true]);

    case 'GET admin/stats':
        admin();
        $c = all('SELECT id,name,phone,product,admin_unread u,last_msg_at t FROM chats ORDER BY last_msg_at DESC LIMIT 50');
        $unread = 0; foreach ($c as &$x) { ints($x, ['id', 'u']); $unread += $x['u']; } unset($x);
        try { $tx = (int)one("SELECT COUNT(*) n FROM orders WHERE pay_status='itegereje'")['n']; } catch (Throwable $e) { $tx = 0; }   // database ya kera: koresha migration_transactions.sql
        out(['unread' => $unread, 'orders' => (int)one("SELECT COUNT(*) n FROM orders WHERE status='bishya'")['n'], 'tx' => $tx, 'chats' => $c]);

    case 'GET admin/thread':
        admin(); $cid = (int)($_GET['id'] ?? 0);
        q('UPDATE chats SET admin_unread=0 WHERE id=?', [$cid]);
        $rows = all('SELECT id,sender s,body b FROM messages WHERE chat_id=? AND id>? ORDER BY id LIMIT 200', [$cid, (int)($_GET['after'] ?? 0)]);
        foreach ($rows as &$m) ints($m, ['id']);
        unset($m);
        out(['m' => $rows]);

    case 'POST admin/reply':
        admin(); $d = body(); $b = s($d['body'] ?? '', 1000);
        if ($b !== '') say((int)($d['id'] ?? 0), 'a', $b);
        out(['ok' => true]);

    case 'GET admin/products':
        admin();
        $page = max(1, (int)($_GET['page'] ?? 1)); $sq = s($_GET['q'] ?? '', 50);
        if ($sq !== '') { $w = 'name LIKE ?'; $a = ['%' . $sq . '%']; } else { $w = '1=1'; $a = []; }
        $rows = all("SELECT id,name,cat,type,color,bg,price,old_price,sizes,badge,image,video,active FROM products WHERE $w ORDER BY id DESC LIMIT 30 OFFSET " . (($page - 1) * 30), $a);
        foreach ($rows as &$x) ints($x, ['id', 'price', 'old_price', 'active']);
        unset($x);
        out(['items' => $rows, 'total' => (int)one("SELECT COUNT(*) n FROM products WHERE $w", $a)['n']]);

    case 'POST admin/products':
        admin(); q(PINS, pfields(body())); out(['ok' => true]);

    case 'PUT admin/products/{id}':
        admin();
        $old = one('SELECT image,video FROM products WHERE id=?', [$id]);
        if (!$old) out(['error' => 'none'], 404);
        $f = pfields(body());
        q('UPDATE products SET name=?,cat=?,type=?,color=?,bg=?,price=?,old_price=?,sizes=?,badge=?,image=?,video=? WHERE id=?', array_merge($f, [$id]));
        if ($old['image'] !== $f[9]) rm($old['image']);
        if ($old['video'] !== $f[10]) rm($old['video']);
        out(['ok' => true]);

    case 'POST admin/products/{id}/toggle':
        admin(); q('UPDATE products SET active=1-active WHERE id=?', [$id]); out(['ok' => true]);

    case 'DELETE admin/products/{id}':
        admin();
        $old = one('SELECT image,video FROM products WHERE id=?', [$id]);
        q('DELETE FROM products WHERE id=?', [$id]);
        if ($old) { rm($old['image']); rm($old['video']); }
        out(['ok' => true]);

    case 'POST admin/upload':
        admin();
        if (empty($_FILES) && (int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) out(['error' => 'size'], 413);   // irenze post_max_size
        if (!isset($_FILES['file'])) out(['error' => 'file'], 400);
        $f = $_FILES['file'];
        if ($f['error'] === UPLOAD_ERR_INI_SIZE || $f['error'] === UPLOAD_ERR_FORM_SIZE || $f['size'] > MAX_UPLOAD_MB * 1048576) out(['error' => 'size'], 413);
        if ($f['error'] !== UPLOAD_ERR_OK) out(['error' => 'file'], 400);
        $ext = strtolower(pathinfo((string)$f['name'], PATHINFO_EXTENSION));
        $h = (string)file_get_contents($f['tmp_name'], false, null, 0, 12);
        if (!in_array($ext, EXT, true) || !sniff($h, $ext)) out(['error' => 'type'], 415);
        $dir = __DIR__ . '/uploads';
        if (!is_dir($dir)) @mkdir($dir, 0755, true);
        $name = time() . '-' . bin2hex(random_bytes(6)) . '.' . $ext;
        if (!move_uploaded_file($f['tmp_name'], $dir . '/' . $name)) out(['error' => 'save'], 500);
        out(['url' => '/uploads/' . $name]);

    case 'POST admin/import':   // CSV: izina,icyiciro,ubwoko,igiciro,igiciro_cya_kera,ingano,akarango
        admin();
        $fh = fopen('php://temp', 'r+'); fwrite($fh, substr((string)(body()['csv'] ?? ''), 0, 2000000)); rewind($fh);
        $ok = 0; $bad = 0; $n = 0;
        while (($r = fgetcsv($fh, 0, ',', '"', '\\')) !== false && $n < 1001) {
            $n++;
            if (count($r) === 1 && $r[0] === null) continue;   // murongo ubuze ibirimo
            $first = mb_strtolower(trim((string)$r[0]));
            if ($first === 'name' || $first === 'izina') continue;
            $r = array_pad(array_map(function ($c) { return trim((string)$c); }, $r), 7, '');
            try { q(PINS, pfields(['name' => $r[0], 'cat' => $r[1], 'type' => $r[2], 'price' => $r[3], 'old' => $r[4], 'sizes' => $r[5], 'badge' => $r[6]])); $ok++; }
            catch (Throwable $e) { $bad++; }
        }
        fclose($fh);
        out(['added' => $ok, 'skipped' => $bad]);

    case 'GET admin/announcements':
        admin(); $rows = all('SELECT id,body text,active FROM announcements ORDER BY id DESC LIMIT 50');
        foreach ($rows as &$x) ints($x, ['id', 'active']);
        unset($x); out($rows);

    case 'POST admin/announcements':
        admin(); $t = s(body()['text'] ?? '', 200);
        if ($t === '') out(['ok' => false], 422);
        q('INSERT INTO announcements(body) VALUES(?)', [$t]); out(['ok' => true]);

    case 'POST admin/announcements/{id}/toggle':
        admin(); q('UPDATE announcements SET active=1-active WHERE id=?', [$id]); out(['ok' => true]);

    case 'DELETE admin/announcements/{id}':
        admin(); q('DELETE FROM announcements WHERE id=?', [$id]); out(['ok' => true]);

    case 'GET admin/orders':
        admin(); $rows = all('SELECT * FROM orders ORDER BY id DESC LIMIT 50');
        foreach ($rows as &$x) { ints($x, ['id', 'total']); $it = json_decode((string)$x['items'], true); $x['items'] = is_array($it) ? $it : []; }
        unset($x); out($rows);

    case 'POST admin/orders/{id}/sent':
        admin(); q("UPDATE orders SET status='byoherejwe' WHERE id=?", [$id]); out(['ok' => true]);

    case 'GET admin/transactions':   // ibyishyuwe / bitegereje / byanzwe
        admin();
        $st = (string)($_GET['status'] ?? 'all'); $since = sinceOf((string)($_GET['range'] ?? 'all'));
        $where = ['1=1']; $args = [];
        if (in_array($st, PAYS, true)) { $where[] = 'pay_status=?'; $args[] = $st; }
        if ($since) { $where[] = 'created_at>=?'; $args[] = $since; }
        $rows = all('SELECT id,name,phone,address,items,total,momo_txn,status,pay_status,paid_at,created_at FROM orders WHERE ' . implode(' AND ', $where) . ' ORDER BY id DESC LIMIT 200', $args);
        foreach ($rows as &$x) { ints($x, ['id', 'total']); $it = json_decode((string)$x['items'], true); $x['items'] = is_array($it) ? $it : []; }
        unset($x);
        $z = ['n' => 0, 'total' => 0]; $sm = ['paid' => $z, 'pending' => $z, 'rejected' => $z]; $key = ['yishyuwe' => 'paid', 'itegereje' => 'pending', 'yanzwe' => 'rejected'];
        $w2 = $since ? 'created_at>=?' : '1=1'; $a2 = $since ? [$since] : [];
        foreach (all("SELECT pay_status s, COUNT(*) n, COALESCE(SUM(total),0) t FROM orders WHERE $w2 GROUP BY pay_status", $a2) as $g) {
            if (isset($key[$g['s']])) $sm[$key[$g['s']]] = ['n' => (int)$g['n'], 'total' => (int)$g['t']];
        }
        $today = (int)one("SELECT COALESCE(SUM(total),0) t FROM orders WHERE pay_status='yishyuwe' AND paid_at>=?", [sinceOf('today')])['t'];
        $prods = [];
        foreach (all("SELECT items FROM orders WHERE pay_status='yishyuwe' AND $w2 ORDER BY id DESC LIMIT 2000", $a2) as $o) {
            foreach ((json_decode((string)$o['items'], true) ?: []) as $i) {
                $k = (string)($i['name'] ?? '?');
                if (!isset($prods[$k])) $prods[$k] = ['name' => $k, 'qty' => 0, 'total' => 0];
                $prods[$k]['qty'] += (int)($i['qty'] ?? 0); $prods[$k]['total'] += (int)($i['price'] ?? 0) * (int)($i['qty'] ?? 0);
            }
        }
        usort($prods, function ($a, $b) { return $b['total'] <=> $a['total']; });
        out(['summary' => ['paid' => $sm['paid'], 'pending' => $sm['pending'], 'rejected' => $sm['rejected'], 'today_paid' => $today], 'items' => $rows, 'products' => array_values($prods)]);

    case 'POST admin/orders/{id}/pay':   // admin yemeza ko ubwishyu bwabonetse (cyangwa bwanzwe)
        admin(); $stt = (string)(body()['state'] ?? '');
        if (!in_array($stt, PAYS, true)) out(['ok' => false], 422);
        q('UPDATE orders SET pay_status=?, paid_at=? WHERE id=?', [$stt, $stt === 'yishyuwe' ? nowstr() : null, $id]);
        out(['ok' => true]);

    default:
        out(['error' => 'not found'], 404);
    }
} catch (InvalidArgumentException $e) {
    out(['error' => 'bad request'], 400);
} catch (Throwable $e) {
    error_log('Online Shop API: ' . $e->getMessage());
    out(['error' => 'server', 'detail' => DEBUG ? $e->getMessage() : null], 500);
}
