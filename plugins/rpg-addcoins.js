let handler = async (m, { conn, args, text, prefix, command, db }) => {
    // 1. Determinar quién recibe las monedas
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null)
    
    if (!who) return m.reply(`*⚠️ ¿A quién quieres darle monedas?*\n\nEjemplo:\n*${prefix + command} @user 500*`)

    // 2. Extraer el número de los argumentos de forma segura
    // Buscamos el primer argumento que sea un número
    let amount = args.find(a => !isNaN(parseInt(a)) && !a.includes('@'))
    let count = parseInt(amount)

    if (!amount || isNaN(count)) {
        return m.reply(`*🔢 Por favor, ingresa una cantidad válida.*\nEjemplo: *${prefix + command} @${who.split('@')[0]} 1000*`, null, { mentions: [who] })
    }

    // 3. INICIACIÓN FORZADA (Igual que en el PVP)
    if (!db.users) db.users = {}
    if (!db.users[who]) db.users[who] = { coin: 0, exp: 0, limit: 20, name: conn.getName(who) }
    if (db.users[who].coin === undefined) db.users[who].coin = 0

    // 4. Sumar monedas y guardar
    db.users[who].coin += count
    await global.database.save()

    let name = conn.getName(who)
    m.reply(`*✅ ECONOMÍA ACTUALIZADA*\n\n*👤 Usuario:* ${name}\n*💰 Añadido:* ${count} Coins\n*👛 Total:* ${db.users[who].coin} Coins`)
}

handler.help = ['addcoins']
handler.tags = ['owner']
handler.command = ['addcoins', 'añadircoins', 'darcoins']
handler.owner = true // Solo tú puedes usarlo

export default handler
