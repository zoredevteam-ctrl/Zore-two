// ─── EVENTO: Anti-Toxic ──────────────────────────────────────────────────────
// Carpeta: events/anti-toxic.js

import { database } from '../lib/database.js'

export const event = 'messages.upsert'

const TOXIC_WORDS = [
    'puta','puto','putos','putas','putita','putazo',
    'mierda','mierdas','joder','jodete','jodido','jodida',
    'pendejo','pendeja','pendejos','pendejas',
    'gilipollas','cabrón','cabrona','cabrones','cabron',
    'zorra','zorras','verga','vergas','coño','cono',
    'culo','culos','culero','culera','maricón','maricon',
    'hdp','hijo de puta','hija de puta',
    'estupido','estupida','idiota','imbecil',
    'mamon','mamona','chingar','chingado','chingada','pinche',
    'culiao','culiado','huevon','huevona','malparido','malparida',
    'gonorrea','mamahuevo','coger','cogida','boludo','boluda',
    'pelotudo','tarado','tarada','retrasado','retrasada',
    'cornudo','cornuda','bastardo','bastarda','malnacido',
    'fuck','fucker','fucking','motherfucker','shit','bitch',
    'asshole','cunt','dick','cock','pussy','whore','bastard',
    'slut','nigger','nigga','faggot','retard','moron','dumbass','wanker','twat',
    'porra','merda','caralho','viado','filho da puta','desgraçado',
    'sexo','polla','pollas','pene','vagina','tetas','teta',
    'follar','follada','mamar','mamada','chupar','chupada',
    'corrida','eyacular','masturbar','masturbacion',
    'porno','pornografia','porn','hentai','orgasmo',
    'dildo','vibrador','prostituta','prostitutas',
    'nudes','nude','onlyfans','xxx','xnxx','xvideos','pornhub','xhamster',
]

const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const TOXIC_REGEX = new RegExp(`\\b(${TOXIC_WORDS.map(escapeRegex).join('|')})\\b`, 'gi')

const WARN1 = (name) => [
    `Oye ${name} 😕 eso que dijiste no está bien. Te doy una advertencia, la próxima te vas 💔`,
    `${name} para... 😞 eso aquí no se dice. *Advertencia 1* — no desperdicies esta oportunidad 🌸`,
    `Ay ${name} 🥺 no esperaba eso de ti. Cuida tus palabras, ¿sí? Esta es tu única advertencia 💗`,
    `${name} 😤 eso estuvo mal y lo sabes. *Primera y última advertencia* de mi parte 🌸`,
    `Oye ${name} 😔 te lo digo con respeto — eso no va aquí. Tienes una advertencia, no falles 💗`,
][Math.floor(Math.random() * 5)]

const WARN2 = (name) => [
    `${name} ya te lo dije 😔 y no me hiciste caso. Me duele pero... *adiós* 💔`,
    `${name} tuviste tu oportunidad y la dejaste ir 😞 *Hasta aquí llegamos* 🌸`,
    `De verdad ${name} que me pesa 🥺 pero ya no puedo hacer nada. *Salida del grupo* 💗`,
    `${name} sin drama y sin rencores 😤 pero las reglas son las reglas. *Adiós* 🌸`,
    `Suspiro... ${name} ya sabías lo que pasaría 😮‍💨 *Hasta luego* 💔`,
][Math.floor(Math.random() * 5)]

const metaCache = new Map()
const META_TTL  = 2 * 60 * 1000

async function getGroupMeta(conn, chat) {
    const c = metaCache.get(chat)
    if (c && Date.now() - c.ts < META_TTL) return c.data
    try {
        const data = await conn.groupMetadata(chat)
        metaCache.set(chat, { data, ts: Date.now() })
        return data
    } catch { return null }
}

export const run = async (conn, { messages, type }) => {
    try {
        if (type !== 'notify') return
        const m = messages[0]
        if (!m?.message) return
        if (m.key?.remoteJid === 'status@broadcast') return

        const chat = m.key.remoteJid
        if (!chat?.endsWith('@g.us')) return

        const msg   = m.message
        const mtype = Object.keys(msg)[0]
        const text  =
            mtype === 'conversation'          ? msg.conversation
            : mtype === 'extendedTextMessage' ? msg.extendedTextMessage?.text
            : mtype === 'imageMessage'        ? msg.imageMessage?.caption
            : mtype === 'videoMessage'        ? msg.videoMessage?.caption
            : ''

        if (!text) return
        TOXIC_REGEX.lastIndex = 0
        if (!TOXIC_REGEX.test(text)) return

        let sender = m.key.fromMe ? conn.user.id : (m.key.participant || m.key.remoteJid)
        if (sender?.includes(':')) sender = sender.split(':')[0] + '@s.whatsapp.net'

        const owners    = Array.isArray(global.owner) ? global.owner : []
        const ownerNums = owners.map(o => (Array.isArray(o) ? o[0] : o).replace(/\D/g, ''))
        if (ownerNums.includes(sender.replace(/\D/g, ''))) return

        const meta = await getGroupMeta(conn, chat)
        if (!meta) return

        const clean  = v => (v || '').split('@')[0].split(':')[0]
        const senderP    = meta.participants.find(p => clean(p.jid || p.id) === clean(sender))
        const botP       = meta.participants.find(p => clean(p.jid || p.id) === clean(conn.user.id))
        const isAdmin    = !!senderP?.admin
        const isBotAdmin = !!botP?.admin

        if (isAdmin) return

        if (!database.data.users) database.data.users = {}
        if (!database.data.users[sender]) database.data.users[sender] = {}
        if (typeof database.data.users[sender].toxicWarn !== 'number') database.data.users[sender].toxicWarn = 0

        const user = database.data.users[sender]
        user.toxicWarn += 1
        await database.save()

        const warns   = user.toxicWarn
        const nameTag = `@${sender.split('@')[0]}`
        const mention = [sender]

        if (isBotAdmin) {
            try {
                await conn.sendMessage(chat, {
                    delete: { remoteJid: chat, fromMe: false, id: m.key.id, participant: sender }
                })
            } catch {}
        }

        if (warns === 1) {
            await conn.sendMessage(chat, { text: WARN1(nameTag), mentions: mention })
            await conn.sendMessage(chat, { react: { text: '⚠️', key: m.key } })

        } else if (warns >= 2) {
            await conn.sendMessage(chat, { text: WARN2(nameTag), mentions: mention })
            await conn.sendMessage(chat, { react: { text: '💔', key: m.key } })

            if (isBotAdmin) {
                try {
                    await conn.groupParticipantsUpdate(chat, [sender], 'remove')
                } catch {
                    await conn.sendMessage(chat, {
                        text: `Quise sacar a ${nameTag} pero no tengo permisos 😞`,
                        mentions: mention
                    })
                }
            } else {
                await conn.sendMessage(chat, {
                    text: `${nameTag} merece salir pero necesito ser admin 😔`,
                    mentions: mention
                })
            }

            user.toxicWarn = 0
            await database.save()
        }

    } catch (e) {
        console.log('[ANTI-TOXIC] Error:', e.message)
    }
}
