const linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i

const isNumber = (x) => !isNaN(x) && !isNaN(parseInt(x))

let handler = async (m, { conn, text, isOwner, usedPrefix }) => {
  try {
    if (!text) {
      return m.reply(
        `♡ يا غالي... هاتلي لينك جروب 💗\n\nمثال:\n${usedPrefix}join https://chat.whatsapp.com/ABCDEFGHIJK123456789 7`
      )
    }

    // 🔍 Extraer código del link
    let match = text.match(linkRegex)
    if (!match) {
      return m.reply(
        '♡ اممم... اللينك ده مش صالح 💔\nاتأكد إنه لينك واتساب'
      )
    }

    let code = match[1]

    // 📅 Días
    let days = 3 // default

    if (isOwner) {
      let args = text.replace(linkRegex, '').trim().split(/\s+/)
      let num = args.find(isNumber)

      if (num) {
        days = Math.max(1, Math.min(999, parseInt(num)))
      }
    }

    // 🚪 Unirse al grupo
    let groupId
    try {
      groupId = await conn.groupAcceptInvite(code)
    } catch (err) {
      let msg = err?.message || ''

      if (msg.includes('already')) {
        return m.reply('♡ أنا في الجروب ده بالفعل، يا غالي 💗')
      }
      if (msg.includes('expired') || msg.includes('invalid')) {
        return m.reply('♡ اللينك منتهي أو غير صالح 💔')
      }

      throw err
    }

    if (!groupId || !groupId.endsWith('@g.us')) {
      return m.reply('♡ مفيش ID صالح 💔')
    }

    // 📛 Nombre del grupo
    let groupName = 'جروب غير معروف'
    try {
      let meta = await conn.groupMetadata(groupId)
      groupName = meta?.subject || groupName
    } catch {}

    // 💾 Guardar en DB
    global.db ||= { data: {} }
    global.db.data ||= {}
    global.db.data.chats ||= {}

    let chats = global.db.data.chats
    chats[groupId] ||= {}

    if (days > 0) {
      chats[groupId].expired = Date.now() + days * 86400000
      chats[groupId].joinDate = Date.now()
    } else {
      delete chats[groupId].expired
    }

    // ✅ Confirmación
    await m.reply(
      `♡ دخلت *${groupName}* 💗\n` +
      (days
        ? `هفضل ${days} يوم معاك~`
        : 'هفضل معاك للأبد يا غالي ♡')
    )

    // 🎬 رسالة الترحيب
    let media = 'https://files.catbox.moe/sjak3i.jpg'

    let welcomeText = `╭━━━〔 ♡ 𝕗𝕝𝕒𝕤𝕙 𝔹𝕠𝕥-𝕄𝔻 ♡ 〕━━━⬣
┃ ❥ وصلت، يا غالي... 💗
┃ ❥ دلوقتي الجروب ده أمتع~
┃ ❥ ناديني لو محتاجني ♡
╰━━━━━━━━━━━━━━━━⬣`

    await conn.sendMessage(groupId, {
      video: { url: media },
      gifPlayback: true,
      caption: welcomeText,
      mentions: [m.sender]
    })

  } catch (e) {
    console.error('[join]', e)

    let msg = '♡ مش قدرت أدخل... 💔\n'
    let errMsg = e?.message || ''

    if (errMsg.includes('already')) msg += 'أنا في الجروب ده بالفعل~'
    else if (errMsg.includes('expired')) msg += 'اللينك انتهى...'
    else if (errMsg.includes('limit')) msg += 'وصلت حد الانضمام...'
    else msg += 'خطأ غير متوقع'

    await m.reply(msg)
  }
}

handler.help = ['join <لينك> [أيام]']
handler.tags = ['owner']
handler.command = /^(join|entrar)$/i
handler.owner = false
handler.group = false
handler.private = true

export default handler