import chalk from 'chalk'

function msToUptime(ms) {
  const seconds = Math.floor((ms / 1000) % 60)
  const minutes = Math.floor((ms / (1000 * 60)) % 60)
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))

  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

function isSocketReady(sock) {
  if (!sock) return false
  return sock.ws?.socket?.readyState === 1 && !!sock.user?.jid
}

function getPhone(jid) {
  if (!jid) return null
  return jid.split('@')[0].split(':')[0]
}

const handler = async (m, { conn, isOwner }) => {
  if (!isOwner) return m.reply('👑 *الوصول مقيّد*\nالأمر ده مطوّري بس اللي ينفذه.')

  const active = (global.conns || []).filter(c => isSocketReady(c))

  if (active.length === 0) {
    return m.reply(`✦ Flash Bot MD\n\n  ◇ مفيش بوتات فرعية متوصلة حالياً.`)
  }

  const now = Date.now()
  let lista = `✦ Flash Bot MD\n\n  ◆ SubBots conectados › ${active.length}\n\n`

  active.forEach((sock, i) => {
    const nombre = sock.user?.name || sock.user?.verifiedName || 'Desconocido'
    const phone = getPhone(sock.user?.jid)
    const uptime = sock.startTime ? msToUptime(now - sock.startTime) : 'Desconocido'
    const link = phone ? `https://wa.me/${phone}` : 'N/A'

    lista += `  ${i + 1}. ${nombre}\n`
    lista += `     ✧ Número  › ${link}\n`
    lista += `     ✧ Activo  › ${uptime}\n`
    if (i < active.length - 1) lista += `\n`
  })

  return m.reply(lista)
}

handler.command = ['bots', 'subbots', 'listbots']
handler.tags = ['serbot']
handler.help = ['bots']

export default handler