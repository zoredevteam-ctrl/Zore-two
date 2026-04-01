import './settings.js';
import chalk from 'chalk';
import print from './lib/print.js';
import { smsg } from './lib/simple.js';
import { database } from './lib/database.js';
import { readdirSync } from 'fs';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';

const toNum = v => (v + '').replace(/[^0-9]/g, '')
const localPart = v => (v + '').split('@')[0].split(':')[0].split('/')[0].split(',')[0]
const normalizeCore = v => toNum(localPart(v))

const normalizeJid = v => {
    if (!v) return ''
    if (typeof v === 'number') v = String(v)
    v = (v + '').trim()
    if (v.startsWith('@')) v = v.slice(1)
    if (v.endsWith('@g.us')) return v
    if (v.includes('@s.whatsapp.net')) {
        const n = toNum(v.split('@')[0])
        return n ? n + '@s.whatsapp.net' : v
    }
    const n = toNum(v)
    return n ? n + '@s.whatsapp.net' : v
}

function pickOwners() {
    const arr = Array.isArray(global.owner) ? global.owner : []
    const flat = []
    for (const v of arr) {
        if (Array.isArray(v)) flat.push({ num: normalizeCore(v[0]), root: !!v[2] })
        else flat.push({ num: normalizeCore(v), root: false })
    }
    return flat
}

function isOwnerJid(jid) {
    const num = normalizeCore(jid)
    return pickOwners().some(o => o.num === num)
}

function isRootOwnerJid(jid) {
    const num = normalizeCore(jid)
    return pickOwners().some(o => o.num === num && o.root)
}

function isPremiumJid(jid) {
    const num = normalizeCore(jid)
    const prems = Array.isArray(global.prems) ? global.prems.map(normalizeCore) : []
    if (prems.includes(num)) return true
    const u = database.data?.users?.[normalizeJid(jid)]
    return !!u?.premium
}

const PREFIXES = ['#', '.', '/', '$']

function getPrefix(body) {
    for (const p of PREFIXES) {
        if (body.startsWith(p)) return p
    }
    return null
}

const similarity = (a, b) => {
    let matches = 0
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] === b[i]) matches++
    }
    return Math.floor((matches / Math.max(a.length, b.length)) * 100)
}

const eventsLoadedFor = new WeakSet()

export const loadEvents = async (conn) => {
    if (!conn?.ev?.on) return
    if (eventsLoadedFor.has(conn)) return
    eventsLoadedFor.add(conn)

    const eventsPath = resolve('./events')
    let files = []

    try {
        files = readdirSync(eventsPath).filter(f => f.endsWith('.js'))
    } catch {
        console.log(chalk.yellow('[EVENTS] Carpeta ./events no encontrada, omitiendo...'))
        return
    }

    for (const file of files) {
        try {
            const url = pathToFileURL(join(eventsPath, file)).href
            const mod = await import(url)

            if (!mod.event || !mod.run) {
                console.log(chalk.yellow(`[EVENTS] Saltando ${file}, falta event o run`))
                continue
            }

            conn.ev.on(mod.event, (data) => {
                const id = data?.id || data?.key?.remoteJid || null
                if (mod.enabled && id && !mod.enabled(id)) return
                mod.run(conn, data)
            })

            console.log(chalk.green(`[EVENTS] ✦ ${file} → ${mod.event}`))
        } catch (e) {
            console.log(chalk.red(`[EVENTS ERROR] ${file}:`), e.message)
        }
    }
}

export const handler = async (m, conn, plugins) => {
    try {
        if (!m) return;

        await loadEvents(conn)

        m = await smsg(conn, m);

        if (m.isGroup) {
            const muted = database.data?.groups?.[m.chat]?.muted || []
            if (muted.includes(m.sender)) {
                await conn.sendMessage(m.chat, { delete: m.key })
                return
            }
        }

        await print(m, conn);

        if (!m.body) return;

        const prefix = getPrefix(m.body)
        if (!prefix) return;

        const body = m.body.slice(prefix.length).trim()
        const args = body.split(/ +/)
        const commandName = args.shift().toLowerCase()

        if (!commandName) return;

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
                const cmds = Array.isArray(plugin.command)
                    ? plugin.command
                    : plugin.command instanceof RegExp
                        ? []
                        : [plugin.command]
                if (cmds.map(c => c.toLowerCase()).includes(commandName)) {
                    cmd = plugin
                    break
                }
            }
        }

        if (!cmd) {
            const allCommands = []
            for (const [, plugin] of plugins) {
                if (!plugin.command) continue
                const cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command]
                for (const c of cmds) {
                    if (typeof c === 'string') allCommands.push(c)
                }
            }

            const similares = allCommands
                .map(c => ({ cmd: c, score: similarity(commandName, c) }))
                .filter(o => o.score >= 40)
                .sort((a, b) => b.score - a.score)
                .slice(0, 3)

            const sugerencias = similares.length
                ? similares.map(s => `*${prefix + s.cmd}* » *${s.score}%*`).join('\n')
                : 'Sin resultados'

            return conn.sendMessage(m.chat, {
                text: `El comando *(${prefix + commandName})* no existe.\n- Use el comando *${prefix}menu* para ver los comandos.\n\n*Similares:*\n${sugerencias}`
            }, { quoted: m })
        }

        const senderRawFull = m.sender || ''
        const senderCanonical = senderRawFull.replace(/:[0-9A-Za-z]+(?=@s\.whatsapp\.net)/, '')
        if (senderCanonical !== m.sender) {
            m.realSender = m.sender
            m.sender = senderCanonical
        }

        const isROwner = isRootOwnerJid(m.sender)
        const isOwner = isROwner || isOwnerJid(m.sender)
        const isPremium = isOwner || isPremiumJid(m.sender)
        const isRegistered = isOwner || database.data.users?.[m.sender]?.registered || false

        const isGroup = m.isGroup;
        let isAdmin = false;
        let isBotAdmin = false;

        if (isGroup) {
            try {
                const groupMeta = await conn.groupMetadata(m.chat);
                const participant = groupMeta.participants.find(p =>
                    p.jid === m.sender || p.id === m.sender
                )
                isAdmin = !!participant?.admin || isOwner

                const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net'
                const botParticipant = groupMeta.participants.find(p =>
                    p.jid === botJid || p.id === botJid
                )
                isBotAdmin = !!botParticipant?.admin
            } catch (err) {
                console.log(chalk.red('[ERROR GROUP META]'), err.message);
            }
        }

        // 🟢 INICIALIZACIÓN SEGURA DE BASE DE DATOS 🟢
        if (!database.data.users) database.data.users = {};
        if (!database.data.groups) database.data.groups = {};

        if (!database.data.users[m.sender]) {
            database.data.users[m.sender] = {
                registered: false,
                premium: false,
                banned: false,
                warning: 0,
                exp: 0,
                level: 1,
                limit: 20,
                lastclaim: 0,
                registered_time: 0,
                name: m.pushName || '',
                age: null
            };
            await database.save();
        }

        if (isGroup && !database.data.groups[m.chat]) {
            database.data.groups[m.chat] = {
                modoadmin: false,
                muted: []
            };
            await database.save();
        }

        // Resolución who con soporte LID → JID real
        let who = null;

        if (m.mentionedJid && m.mentionedJid[0]) {
            who = m.mentionedJid[0];
        } else if (m.quoted?.sender) {
            who = m.quoted.sender;
        }

        if (who) {
            const rawNum = who.split('@')[0].split(':')[0]
            const isLid = who.endsWith('@lid') || rawNum.length > 13

            if (isLid && m.isGroup) {
                try {
                    const groupMeta = await conn.groupMetadata(m.chat)
                    // Buscar si algún participante tiene jid @s.whatsapp.net con este lid
                    const found = groupMeta.participants.find(p =>
                        p.id?.split('@')[0] === rawNum
                    )
                    if (found?.jid && found.jid.endsWith('@s.whatsapp.net')) {
                        who = found.jid.includes(':') ? found.jid.split(':')[0] + '@s.whatsapp.net' : found.jid
                    } else if (found?.id && found.id.endsWith('@s.whatsapp.net')) {
                        who = found.id
                    } else {
                        who = rawNum + '@lid'
                    }
                } catch {
                    who = rawNum + '@lid'
                }
            } else {
                who = rawNum + '@s.whatsapp.net'
            }
        }

        // 🛑 INTERCEPTOR DE MODO ADMIN 🛑
        if (isGroup && database.data.groups[m.chat]?.modoadmin && !isAdmin && !isOwner) {
            return m.reply('⚙️ *𝖅0𝕽𝕿 𝕾𝖄𝕾𝕿𝕰𝕸𝕾*\n\n🔒 *MODO ADMIN ACTIVO*\n_Zero Two está temporalmente restringida. Solo los administradores pueden usar comandos en este grupo._');
        }

        if (database.data.users[m.sender]?.banned && !isOwner) {
            return m.reply('🚫 *ESTÁS BANEADO*\nNo puedes usar los comandos del bot.');
        }

        if (cmd.rowner && !isROwner) {
            return m.reply('👑 *ACCESO DENEGADO*\nEste comando solo puede ser ejecutado por el creador principal.');
        }

        if (cmd.owner && !isOwner) {
            return m.reply('👑 *ACCESO RESTRINGIDO*\nEste comando solo puede ser ejecutado por mi creador.');
        }

        if (cmd.premium && !isPremium) {
            return m.reply('💎 *USUARIO PREMIUM*\nEste comando es exclusivo para miembros Premium.');
        }

        if (cmd.register && !isRegistered) {
            return m.reply(`📝 *REGISTRO REQUERIDO*\nDebes registrarte para usar este comando.\n\n> Usa: *${prefix}reg nombre.edad*\n> Ejemplo: *${prefix}reg Juan.25*`);
        }

        if (cmd.group && !isGroup) {
            return m.reply('🏢 *SOLO GRUPOS*\nEste comando solo está habilitado para grupos.');
        }

        if (cmd.admin && !isAdmin) {
            return m.reply('👮 *ERES ADMIN?*\nEste comando es solo para administradores del grupo.');
        }

        if (cmd.botAdmin && !isBotAdmin) {
            return m.reply('🤖 *ERROR DE PERMISOS*\nNecesito ser administrador del grupo para ejecutar esta acción.');
        }

        if (cmd.private && isGroup) {
            return m.reply('💬 *CHAT PRIVADO*\nEscríbeme al privado para usar este comando.');
        }

        if (cmd.limit && !isPremium && !isOwner) {
            const userLimit = database.data.users[m.sender].limit || 0;
            if (userLimit < 1) {
                return m.reply(`⚠️ *SIN LÍMITES*\nSe han agotado tus límites diarios.\n💎 Los usuarios premium tienen límites ilimitados.`);
            }
            database.data.users[m.sender].limit -= 1;
            await database.save();
        }

        try {
            await cmd(m, {
                conn,
                args,
                isOwner,
                isROwner,
                isPremium,
                isRegistered,
                isAdmin,
                isBotAdmin,
                isGroup,
                who,
                db: database.data,
                prefix,
                plugins
            })

        } catch (e) {

            console.log(chalk.red('[ERROR COMANDO DETECTADO]'), e)

            const name = e?.name || 'Error'
            const message = e?.message || String(e)

            const stackLines = e?.stack?.split('\n') || []
            const stack = stackLines.slice(0, 8).join('\n')

            let file = null
            let line = null
            let column = null

            for (const l of stackLines) {
                const match = l.match(/\((.*plugins.*):(\d+):(\d+)\)/)
                if (match) {
                    file = match[1]
                    line = match[2]
                    column = match[3]
                    break
                }
            }

            const status = e?.response?.status || e?.status || null
            const statusText = e?.response?.statusText || ''

            const data = e?.response?.data || e?.data || null
            const headers = e?.response?.headers || null

            const url =
                e?.config?.url ||
                e?.request?.path ||
                e?.request?.url ||
                null

            const method =
                e?.config?.method?.toUpperCase() ||
                e?.request?.method ||
                null

            let domain = null
            try {
                if (url) {
                    const u = new URL(url)
                    domain = u.hostname
                }
            } catch {}

            let flags = []

            if (status === 401 || /unauthorized|invalid api key/i.test(message)) flags.push('API_KEY')
            if (status === 403) flags.push('FORBIDDEN')
            if (status === 404) flags.push('NOT_FOUND')
            if (status === 429) flags.push('RATE_LIMIT')
            if (status >= 500) flags.push('SERVER_ERROR')

            if (/timeout/i.test(message)) flags.push('TIMEOUT')
            if (/ENOTFOUND|ECONNREFUSED|EAI_AGAIN/i.test(message)) flags.push('NETWORK')
            if (/MODULE_NOT_FOUND|ERR_MODULE_NOT_FOUND/i.test(message)) flags.push('MODULE')
            if (/permission|denied/i.test(message)) flags.push('PERMISSION')

            if (typeof message === 'string') {
                if (message.includes('<html') || message.includes('<!DOCTYPE html')) flags.push('HTML')
                if (/Unexpected token|JSON/i.test(message)) flags.push('BAD_JSON')
            }

            let extra = ''

            if (status) extra += `🌐 HTTP: ${status} ${statusText}\n`
            if (method || url) extra += `📡 Request: ${method || 'GET'} ${url || 'desconocido'}\n`
            if (domain) extra += `🌍 API: ${domain}\n`

            if (headers) {
                try {
                    extra += `📨 Headers:\n${JSON.stringify(headers).slice(0,200)}\n`
                } catch {}
            }

            if (data) {
                try {
                    extra += `📦 Response:\n${JSON.stringify(data).slice(0,400)}\n`
                } catch {}
            }

            let debug = `
❌ *ERROR EN COMANDO*

📌 Comando: ${prefix + commandName}
📂 Plugin: ${file ? file.split('/').pop() : (cmd?.name || 'desconocido')}

📛 Nombre: ${name}

🧾 Mensaje:
${message.slice(0,500)}

${extra.trim()}

🏷️ Flags: ${flags.join(', ') || 'NINGUNO'}

📍 Archivo: ${file || 'desconocido'}
📍 Línea: ${line || '?'} | Columna: ${column || '?'}

📍 Stack:
${stack}
`.trim()

            console.log(chalk.red(debug))

            if (m?.reply) m.reply(debug)
        }

    } catch (e) {

        console.log(chalk.red('[ERROR HANDLER GLOBAL]'), e)

        let msg = e?.message || String(e)

        if (m?.reply) {
            m.reply(`❌ *ERROR GLOBAL*\n\n🧾 ${msg.slice(0,400)}`)
        }

    }