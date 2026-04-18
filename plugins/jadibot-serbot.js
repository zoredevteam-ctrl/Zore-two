import path from 'path'
import fs from 'fs'
import { database } from '../lib/database.js'
import {
    makeWASocket,
    useMultiFileAuthState
} from '@whiskeysockets/baileys'

if (!Array.isArray(global.conns)) global.conns = []

const MAX_SUBBOTS = 15
const MAX_PER_USER = 2

function isSocketReady(sock) {
    return sock?.ws?.socket?.readyState === 1 && !!sock?.user?.jid
}

function cleanPhone(jid) {
    return jid?.replace(/[^0-9]/g, '') || null
}

const handler = async (m, { conn, prefix }) => {
    const userId = m.sender

    if (!database.data.users[userId]) database.data.users[userId] = {}

    const active = global.conns.filter(isSocketReady).length
    if (active >= MAX_SUBBOTS) {
        return m.reply(`${global.vs}\n\n◇ Límite alcanzado\n✧ ${active}/${MAX_SUBBOTS}`)
    }

    const userPhone = cleanPhone(m.sender)
    if (userPhone) {
        const count = global.conns.filter(c =>
            isSocketReady(c) && cleanPhone(c.user?.jid) === userPhone
        ).length

        if (count >= MAX_PER_USER) {
            return m.reply(`${global.vs}\n\n◇ Máximo alcanzado\n✧ ${count}/${MAX_PER_USER}\n› usa ${prefix}stop`)
        }
    }

    const number = m.sender.split('@')[0]

    const sessionPath = path.join(global.subBotsDir || './Sessions/SubBots', number)
    if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true })

    await m.reply(`${global.vs}\n\n◇ Generando código para +${number}...`)

    try {
        const { state } = await useMultiFileAuthState(sessionPath)

        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false
        })

        setTimeout(async () => {
            try {
                if (!state.creds.registered) {
                    let code = await sock.requestPairingCode(number)
                    code = code.match(/.{1,4}/g)?.join('-') || code

                    await conn.sendMessage(m.chat, {
                        text:
                            `${global.vs}\n\n` +
                            `◆ Vinculación\n\n` +
                            `✧ Número › +${number}\n\n` +
                            `1. WhatsApp > Dispositivos vinculados\n` +
                            `2. Vincular con número\n` +
                            `3. Ingresa este código:\n\n` +
                            `🔑 ${code}`
                    }, { quoted: m })

                    global.startSubBot(sessionPath, number)

                    setTimeout(() => {
                        if (!global.conns.find(c => c.sessionPath === sessionPath)) {
                            fs.rmSync(sessionPath, { recursive: true, force: true })
                        }
                    }, 120000)
                }
            } catch (e) {
                await m.reply(`❌ Error: ${e.message}`)
            }
        }, 3000)

    } catch (e) {
        await m.reply(`❌ Error: ${e.message}`)
    }
}

handler.help = ['code']
handler.tags = ['serbot']
handler.command = ['code', 'serbot']

export default handler