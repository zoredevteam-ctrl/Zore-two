import './settings.js'
import chalk from 'chalk'
import print from './lib/print.js'
import { smsg } from './lib/simple.js'
import { database } from './lib/database.js'
import { readdirSync } from 'fs'
import { join, resolve } from 'path'
import { pathToFileURL } from 'url'
import { resolveWho } from './lib/who.js'

// ── Normalización de JIDs ─────────────────────────────────────────────────────

const toNum         = v => (v + '').replace(/[^0-9]/g, '')
const localPart     = v => (v + '').split('@')[0].split(':')[0].split('/')[0].split(',')[0]
const normalizeCore = v => toNum(localPart(v))

function pickOwners() {
    const arr = Array.isArray(global.owner) ? global.owner : []
    return arr.map(v => Array.isArray(v)
        ? { num: normalizeCore(v[0]), root: !!v[2] }
        : { num: normalizeCore(v), root: false }
    )
}

const isOwnerJid     = jid => pickOwners().some(o => o.num === normalizeCore(jid))
const isRootOwnerJid = jid => pickOwners().some(o => o.num === normalizeCore(jid) && o.root)

const isPremiumJid = jid => {
    const num   = normalizeCore(jid)
    const prems = Array.isArray(global.prems) ? global.prems.map(normalizeCore) : []
    if (prems.includes(num)) return true
    return !!database.data?.users?.[jid]?.premium
}

// ── Prefijos ──────────────────────────────────────────────────────────────────

const PREFIXES = ['#', '.', '/', '$']
const getPrefix = body => PREFIXES.find(p => body.startsWith(p)) || null

// ── تعريب أسماء الأوامر ───────────────────────────────────────────────────
// تكتب الأمر بالعربي → يتحوّل للأمر الأصلي تلقائياً. الأسماء الأصلية تفضل شغالة.
const AR_ALIASES = {
    'قائمه': 'menu', 'القائمه': 'menu', 'اوامر': 'menu', 'الأوامر': 'menu',
    'اوامري': 'menu', 'منيو': 'menu', 'مساعده': 'menu', 'مساعدة': 'menu', 'help': 'menu',
    'معلومات': 'infobot', 'info': 'infobot',
    'مالك': 'owner', 'المالك': 'owner', 'المطور': 'owner', 'مطور': 'owner', 'creator': 'owner',
    'تسجيل': 'reg', 'سجل': 'reg',
    'الغاء_تسجيل': 'unreg', 'الغاءتسجيل': 'unreg',
    'وقت': 'horario', 'الساعه': 'horario', 'ساعه': 'horario',
    'سرعه': 'p', 'السرعه': 'p', 'بنق': 'p', 'ping': 'p',
    'تقرير': 'report', 'ابلاغ': 'report',
    'رقص': 'dance', 'حضن': 'hug', 'قتل': 'kill', 'بوسه': 'kiss', 'بوس': 'kiss',
    'حزن': 'sad', 'وايفو': 'waifu',
    'زواج': 'ship', 'شيب': 'ship', 'جوزني': 'ship',
    'رول': 'rw', 'كلب': 'rw',
    'كولكشن': 'col', 'كوليكشن': 'col', 'مجموعتي': 'col',
    'هديه': 'dar', 'هبه': 'dar', 'اعطاء': 'dar',
    'بيع': 'vender', 'بعت': 'vender',
    'شعر': 'poema', 'قصيده': 'poema',
    'حجره': 'ppt', 'حجر': 'ppt', 'ملقوف': 'ppt',
    'هاك': 'hack', 'اختراق': 'hack',
    'ذكاء': 'iq', 'نسبه_ذكاء': 'iq',
    'ديث_نوت': 'deathnote', 'ديثنوت': 'deathnote',
    'كيرا': 'kira', 'محكمه': 'kira',
    'رصيد': 'bal', 'فلوسي': 'bal', 'balance': 'bal',
    'ترتيب': 'leaderboard', 'المتصدرين': 'leaderboard', 'توب': 'leaderboard',
    'تيك_توك': 'tt', 'تيكتوك': 'tt', 'tiktok': 'tt',
    'فيسبوك': 'fb', 'فيس': 'fb',
    'انستا': 'ig', 'انستجرام': 'ig',
    'بنترست': 'pinterest',
    'يوتيوب': 'play', 'اغنيه': 'play', 'صوت': 'play',
    'تحميل': 'play2', 'نزل': 'play2',
    'تطبيق': 'apk', 'برنامج': 'apk',
    'ملصق': 'attp', 'ستيكر': 'attp',
    'صوره': 'toimg', 'لصوره': 'toimg',
    'فحص': 'inspect',
    'رفع': 'tourl', 'لينك': 'tourl',
    'طقس': 'clima', 'الجو': 'clima',
    'تحسين': 'hd', 'وضوح': 'hd',
    'ترجم': 'traducir', 'ترجمه': 'traducir',
    'فتح': 'vv', 'شوف': 'vv',
    'تذكير': 'recordar', 'فكرني': 'recordar',
    'حفظ': 'save', 'خزن': 'save',
    'جلب': 'fetch', 'هات': 'fetch',
    'ذكاء_صناعي': 'ia', 'بوت_ذكي': 'ia', 'ai': 'ia',
    'بوكيمون': 'pokedex', 'بوكيدكس': 'pokedex',
    'مضاد_بوت': 'antibot', 'antiبوت': 'antibot',
    'مضاد_لينك': 'antilink', 'مضاد_روابط': 'antilink',
    'استدعاء': 'invocar', 'نادي': 'invocar',
    'هيئه': 'staff', 'المشرفين': 'staff', 'ادمنز': 'staff',
    'خاملين': 'inactivos', 'الخاملين': 'inactivos',
    'كتم': 'mute', 'اسكت': 'mute',
    'الغاء_كتم': 'unmute', 'اتكلم': 'unmute',
    'فتح_جروب': 'open', 'افتح': 'open',
    'غلق_جروب': 'close', 'اقفل': 'close',
    'رابط': 'link', 'لينك_جروب': 'link',
    'تنبيه': 'hidetag', 'اعلان': 'hidetag', 'نوتفاي': 'hidetag',
    'انذار': 'warn', 'تحذير': 'warn', 'حذر': 'warn',
    'انذارات': 'warnlist', 'الانذارات': 'warnlist',
    'حذف_انذار': 'delwarn', 'مسح_انذار': 'delwarn',
    'خروج': 'leave', 'اطلع': 'leave',
    'تفعيل': 'nable', 'فيتشر': 'nable',
    'تنزيل': 'demote', 'شيل_ادمن': 'demote',
    'ترقيه': 'promote', 'خليه_ادمن': 'promote', 'رفع_ادمن': 'promote',
    'طرد': 'kick', 'اطرد': 'kick', 'هش': 'kick',
    'وضع_المشرفين': 'modoadmin', 'مشرفين_فقط': 'modoadmin',
    'كود': 'code', 'ربط': 'code',
    'بوتات': 'bots', 'البوتات': 'bots',
    'قناه': 'rcanal', 'القناه': 'rcanal', 'channel': 'rcanal',
    'اضف_مالك': 'addowner', 'ضيف_مالك': 'addowner',
    'مشرف_تلقائي': 'autoadmin', 'ادمن_تلقائي': 'autoadmin',
    'ارسل_تيك_توك': 'enviartt',
    'جيب_الامر': 'getplugin', 'هات_الامر': 'getplugin',
    'دخول': 'join', 'انضم': 'join',
    'طرد_الكل': 'kickall', 'اطرد_الكل': 'kickall',
    'معرف': 'lid', 'الايدي': 'lid',
    'اعاده_تشغيل': 'restart', 'ريستارت': 'restart',
    'تحديث': 'update', 'حدث': 'update',
    'نشر': 'revsall', 'انشر': 'revsall',
    'تقييم': 'e', 'نفذ': 'e',
    'ليزبيان': 'lesbian', 'باك': 'pack', 'بوسي': 'pussy', 'تيتاس': 'tetas', 'اكس': 'xnxx',
}

const arNormalize = s => (s || '')
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u0652]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, '_')

const resolveAlias = s => AR_ALIASES[arNormalize(s)] || s

// ── Similitud de comandos ─────────────────────────────────────────────────────

const similarity = (a, b) => {
    let matches = 0
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] === b[i]) matches++
    }
    return Math.floor((matches / Math.max(a.length, b.length)) * 100)
}

// ── Cache de metadata de grupos ───────────────────────────────────────────────
// Evita llamar groupMetadata() en cada mensaje — se cachea por 2 minutos

const groupMetaCache = new Map()
const GROUP_CACHE_TTL = 2 * 60 * 1000 // 2 minutos

async function getCachedGroupMeta(conn, chatId) {
    const cached = groupMetaCache.get(chatId)
    if (cached && Date.now() - cached.ts < GROUP_CACHE_TTL) return cached.data
    try {
        const data = await conn.groupMetadata(chatId)
        groupMetaCache.set(chatId, { data, ts: Date.now() })
        return data
    } catch {
        return null
    }
}

// Limpiar cache viejo cada 5 minutos para no acumular memoria
setInterval(() => {
    const now = Date.now()
    for (const [k, v] of groupMetaCache) {
        if (now - v.ts > GROUP_CACHE_TTL) groupMetaCache.delete(k)
    }
}, 5 * 60 * 1000)

// ── Anti-duplicate: ignorar mensajes ya procesados ───────────────────────────

const processedMsgs = new Set()
const MSG_TTL = 30_000 // 30 segundos

function isDuplicate(msgId) {
    if (!msgId) return false
    if (processedMsgs.has(msgId)) return true
    processedMsgs.add(msgId)
    setTimeout(() => processedMsgs.delete(msgId), MSG_TTL)
    return false
}

// ── Carga de eventos ──────────────────────────────────────────────────────────

const eventsLoadedFor = new WeakSet()

export const loadEvents = async (conn) => {
    if (!conn?.ev?.on || eventsLoadedFor.has(conn)) return
    eventsLoadedFor.add(conn)

    const eventsPath = resolve('./events')
    let files = []
    try { files = readdirSync(eventsPath).filter(f => f.endsWith('.js')) } catch { return }

    for (const file of files) {
        try {
            const url = pathToFileURL(join(eventsPath, file)).href
            const mod = await import(url)
            if (!mod.event || !mod.run) continue
            conn.ev.on(mod.event, data => {
                const id = data?.id || data?.key?.remoteJid || null
                if (mod.enabled && id && !mod.enabled(id)) return
                mod.run(conn, data)
            })
        } catch {}
    }
}

// ── Handler principal ─────────────────────────────────────────────────────────

export const handler = async (m, conn, plugins) => {
    try {
        if (!m) return

        // Cargar eventos una sola vez por conexión
        loadEvents(conn).catch(() => {})

        m = await smsg(conn, m)

        // Anti-duplicate
        const msgId = m.key?.id
        if (isDuplicate(msgId)) return

        // ── Procesar respuesta de botón ───────────────────────────────────
        const btn =
            m.message?.buttonsResponseMessage ||
            m.message?.templateButtonReplyMessage ||
            m.message?.listResponseMessage

        if (btn) {
            const cmd = btn.selectedButtonId || btn.singleSelectReply?.selectedRowId
            if (cmd?.trim()) {
                m.message = { conversation: cmd.trim() }
                m.text    = cmd.trim()
                m.body    = cmd.trim()
                const senderId = m.participant || m.key?.participant || m.key?.remoteJid || ''
                if (m.sender !== senderId) {
                    Object.defineProperty(m, 'sender', { value: senderId, writable: true, configurable: true })
                }
            }
        }

        // ── Mute check ────────────────────────────────────────────────────
        if (m.isGroup) {
            const muted = database.data?.groups?.[m.chat]?.muted || []
            if (muted.includes(m.sender)) {
                await conn.sendMessage(m.chat, { delete: m.key })
                return
            }
        }

        await print(m, conn)

        if (!m.body) return

        const prefix = getPrefix(m.body)
        if (!prefix) return

        const body        = m.body.slice(prefix.length).trim()
        const args        = body.split(/ +/)
        const rawCommand  = args.shift()?.toLowerCase()
        if (!rawCommand) return
        const commandName = resolveAlias(rawCommand)
        const displayName = rawCommand

        // ── Buscar plugin ─────────────────────────────────────────────────
        let cmd = null

        if (prefix === '$') {
            for (const [, plugin] of plugins) {
                if (plugin.customPrefix?.includes('$')) {
                    cmd = plugin
                    args.unshift(commandName)
                    break
                }
            }
        } else {
            for (const [, plugin] of plugins) {
                if (!plugin.command) continue
                const cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command]
                if (cmds.map(c => String(c).toLowerCase()).includes(commandName)) {
                    cmd = plugin
                    break
                }
            }
        }

        // ── Comando no encontrado: sugerencias ────────────────────────────
        if (!cmd) {
            const allCommands = []
            for (const [, plugin] of plugins) {
                if (!plugin.command) continue
                const cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command]
                for (const c of cmds) if (typeof c === 'string') allCommands.push(c)
            }

            const similares = allCommands
                .map(c => ({ cmd: c, score: similarity(commandName, c) }))
                .filter(o => o.score >= 40)
                .sort((a, b) => b.score - a.score)
                .slice(0, 3)

            const sugerencias = similares.length
                ? similares.map(s => `*${prefix + s.cmd}* » *${s.score}%*`).join('\n')
                : 'مفيش نتائج'

            return conn.sendMessage(m.chat, {
                text: `الأمر *(${prefix + displayName})* غير موجود.\n- اكتب *${prefix}القائمة* لعرض كل الأوامر.\n\n*أوامر مشابهة:*\n${sugerencias}`
            }, { quoted: m })
        }

        // ── Permisos ──────────────────────────────────────────────────────
        const isROwner   = isRootOwnerJid(m.sender)
        const isOwner    = isROwner || isOwnerJid(m.sender)
        const isPremium  = isOwner  || isPremiumJid(m.sender)
        const isRegistered = isOwner || !!database.data.users?.[m.sender]?.registered

        const isGroup = m.isGroup
        let isAdmin    = false
        let isBotAdmin = false

        // Solo llamar groupMetadata si el comando realmente lo necesita
        if (isGroup && (cmd.admin || cmd.botAdmin || cmd.group !== undefined)) {
            const groupMeta = await getCachedGroupMeta(conn, m.chat)
            if (groupMeta) {
                const clean   = v => (v || '').split('@')[0].split(':')[0]
                const senderNum = clean(m.sender)
                const botNum    = clean(conn.user.id)

                const participant    = groupMeta.participants.find(p => clean(p.jid || p.id) === senderNum)
                const botParticipant = groupMeta.participants.find(p => clean(p.jid || p.id) === botNum)

                isAdmin    = !!participant?.admin || isOwner
                isBotAdmin = !!botParticipant?.admin
            }
        } else if (isGroup) {
            // Para comandos que no necesitan admin check, igual marcar isAdmin si es owner
            isAdmin = isOwner
        }

        // ── Init usuario y grupo en DB ────────────────────────────────────
        if (!database.data.users)  database.data.users  = {}
        if (!database.data.groups) database.data.groups = {}

        if (!database.data.users[m.sender]) {
            database.data.users[m.sender] = {
                registered: false, premium: false, banned: false,
                warning: 0, exp: 0, level: 1, limit: 20,
                lastclaim: 0, registered_time: 0,
                name: m.pushName || '', age: null
            }
            database.save().catch(() => {})
        }

        if (isGroup && !database.data.groups[m.chat]) {
            database.data.groups[m.chat] = { modoadmin: false, muted: [] }
            database.save().catch(() => {})
        }

        // ── Validaciones de acceso ────────────────────────────────────────
        if (isGroup && database.data.groups[m.chat]?.modoadmin && !isAdmin && !isOwner) {
            return m.reply('⚙️ *𝖅0𝕽𝕿 𝕾𝖄𝕾𝕿𝕰𝕸𝕾*\n\n🔒 *وضع الأدمن شغال*\n_الأدمنز بس اللي يستخدموا الأوامر في الجروب ده._')
        }

        if (database.data.users[m.sender]?.banned && !isOwner) {
            return m.reply('🚫 *انت محظور*\nمش مسموحلك تستخدم أوامر البوت.')
        }

        if (cmd.rowner   && !isROwner)    return m.reply('👑 *الوصول مرفوض*\nالأمر ده المطوّر الرئيسي بس اللي ينفذه.')
        if (cmd.owner    && !isOwner)     return m.reply('👑 *الوصول مقيّد*\nالأمر ده مطوّري بس اللي ينفذه.')
        if (cmd.premium  && !isPremium)   return m.reply('💎 *حساب مميز*\nالأمر ده للحسابات المميزة بس.')
        if (cmd.register && !isRegistered) return m.reply(`📝 *التسجيل مطلوب*\nUsa: *${prefix}reg nombre.edad*`)
        if (cmd.group    && !isGroup)     return m.reply('🏢 *للجروبات بس*\nالأمر ده للجروبات بس.')
        if (cmd.admin    && !isAdmin)     return m.reply('👮 *انت أدمن؟*\nالأمر ده لأدمنز الجروب بس.')
        if (cmd.botAdmin && !isBotAdmin)  return m.reply('🤖 *خطأ في الصلاحيات*\nلازم أكون أدمن الجروب عشان أنفذ الحركة دي.')
        if (cmd.private  && isGroup)      return m.reply('💬 *شات خاص*\nابعتلي خاص عشان تستخدم الأمر ده.')

        if (cmd.limit && !isPremium && !isOwner) {
            const userLimit = database.data.users[m.sender].limit || 0
            if (userLimit < 1) return m.reply(`⚠️ *مفيش حدود*\nخلصت حدودك اليومية.\n💎 الحسابات المميزة عندها حدود مفتوحة.`)
            database.data.users[m.sender].limit -= 1
            database.save().catch(() => {})
        }

        // ── Resolver who ──────────────────────────────────────────────────
        const who = await resolveWho(m, conn, args)

        // ── Ejecutar comando ──────────────────────────────────────────────
        try {
            await cmd(m, {
                conn, args, isOwner, isROwner, isPremium, isRegistered,
                isAdmin, isBotAdmin, isGroup, who,
                db: database.data,
                prefix,
                usedPrefix: prefix,
                command: commandName,
                plugins
            })
        } catch (e) {
            const message    = e?.message || String(e)
            const stackLines = e?.stack?.split('\n') || []

            let file = null, line = null
            for (const l of stackLines) {
                const match = l.match(/\((.*plugins.*):(\d+):(\d+)\)/)
                if (match) { file = match[1]; line = match[2]; break }
            }

            const debug =
                `❌ *خطأ في الأمر*\n\n` +
                `📌 الأمر: ${prefix + displayName}\n\n` +
                `🧾 Mensaje:\n${message.slice(0, 500)}\n\n` +
                `📍 Archivo: ${file || 'desconocido'}\n` +
                `📍 Línea: ${line || '?'}`

            console.log(chalk.red(debug))
            if (m?.reply) m.reply(debug)
        }

    } catch (e) {
        const msg = e?.message || String(e)
        if (m?.reply) m.reply(`❌ *خطأ عام*\n\n🧾 ${msg.slice(0, 400)}`)
    }
}
