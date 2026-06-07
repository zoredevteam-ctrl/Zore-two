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
        const commandName = args.shift()?.toLowerCase()
        if (!commandName) return

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
                : 'Sin resultados'

            return conn.sendMessage(m.chat, {
                text: `El comando *(${prefix + commandName})* no existe.\n- Use *${prefix}menu* para ver los comandos.\n\n*Similares:*\n${sugerencias}`
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
            return m.reply('⚙️ *𝖅0𝕽𝕿 𝕾𝖄𝕾𝕿𝕰𝕸𝕾*\n\n🔒 *MODO ADMIN ACTIVO*\n_Solo los administradores pueden usar comandos en este grupo._')
        }

        if (database.data.users[m.sender]?.banned && !isOwner) {
            return m.reply('🚫 *ESTÁS BANEADO*\nNo puedes usar los comandos del bot.')
        }

        if (cmd.rowner   && !isROwner)    return m.reply('👑 *ACCESO DENEGADO*\nEste comando solo puede ser ejecutado por el creador principal.')
        if (cmd.owner    && !isOwner)     return m.reply('👑 *ACCESO RESTRINGIDO*\nEste comando solo puede ser ejecutado por mi creador.')
        if (cmd.premium  && !isPremium)   return m.reply('💎 *USUARIO PREMIUM*\nEste comando es exclusivo para miembros Premium.')
        if (cmd.register && !isRegistered) return m.reply(`📝 *REGISTRO REQUERIDO*\nUsa: *${prefix}reg nombre.edad*`)
        if (cmd.group    && !isGroup)     return m.reply('🏢 *SOLO GRUPOS*\nEste comando solo está habilitado para grupos.')
        if (cmd.admin    && !isAdmin)     return m.reply('👮 *ERES ADMIN?*\nEste comando es solo para administradores del grupo.')
        if (cmd.botAdmin && !isBotAdmin)  return m.reply('🤖 *ERROR DE PERMISOS*\nNecesito ser administrador del grupo para ejecutar esta acción.')
        if (cmd.private  && isGroup)      return m.reply('💬 *CHAT PRIVADO*\nEscríbeme al privado para usar este comando.')

        if (cmd.limit && !isPremium && !isOwner) {
            const userLimit = database.data.users[m.sender].limit || 0
            if (userLimit < 1) return m.reply(`⚠️ *SIN LÍMITES*\nSe han agotado tus límites diarios.\n💎 Los usuarios premium tienen límites ilimitados.`)
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
                `❌ *ERROR EN COMANDO*\n\n` +
                `📌 Comando: ${prefix + commandName}\n\n` +
                `🧾 Mensaje:\n${message.slice(0, 500)}\n\n` +
                `📍 Archivo: ${file || 'desconocido'}\n` +
                `📍 Línea: ${line || '?'}`

            console.log(chalk.red(debug))
            if (m?.reply) m.reply(debug)
        }

    } catch (e) {
        const msg = e?.message || String(e)
        if (m?.reply) m.reply(`❌ *ERROR GLOBAL*\n\n🧾 ${msg.slice(0, 400)}`)
    }
}
