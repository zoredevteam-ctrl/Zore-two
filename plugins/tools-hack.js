let handler = async (m, { conn, text }) => {
    await m.react('⌛')

    let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : m.sender)
    let shortName = '@' + target.split('@')[0]

    const steps = [
        `💻 Iniciando intrusión contra ${shortName}...`,
        '🔌 Conectando a servidores remotos...',
        '📡 Rastreando IP pública...',
        '🔍 Escaneando puertos abiertos...',
        '🔐 Fuerza bruta de credenciales...',
        '📂 Accediendo a archivos personales...',
        '📤 Extrayendo datos confidenciales...',
        '🧹 Limpiando rastros...',
        '✅ Acceso total obtenido'
    ]

    // 1. Enviamos el primer mensaje y guardamos su "key" para poder editarlo después
    let { key } = await conn.sendMessage(m.chat, { text: 'Iniciando proceso...' }, { quoted: m })

    for (let i = 0; i < steps.length; i++) {
        const progress = Math.floor(((i + 1) / steps.length) * 100)
        const bar = '▰'.repeat(Math.floor(progress / 10)) + '▱'.repeat(10 - Math.floor(progress / 10))
        
        // 2. Usamos { edit: key } para reemplazar el texto del mensaje original
        await conn.sendMessage(m.chat, { text: `${steps[i]}\n\n[${bar}] ${progress}%`, edit: key })
        
        await new Promise(r => setTimeout(r, 1200 + Math.floor(Math.random() * 800)))
    }

    // 3. Arreglamos la sintaxis de las variables usando ${...}
    const fakeIp = `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`
    const fakeEmail = `${shortName.replace('@','')}user${Math.floor(Math.random()*999)}@gmail.com`
    const fakePass = `P@ssw0rd${Math.floor(Math.random()*9999)}`
    const fakeTime = `${String(Math.floor(Math.random()*24)).padStart(2,'0')}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`

    const final = `⚠️ *ACCESO TOTAL OBTENIDO*\n\n` +
                  `Objetivo: ${shortName}\n` +
                  `IP: ${fakeIp}\n` +
                  `Email principal: ${fakeEmail}\n` +
                  `Contraseña: ${fakePass}\n` +
                  `Última conexión: ${fakeTime}\n\n` +
                  `Datos extraídos correctamente.`

    // 4. Editamos por última vez con el resultado final
    await conn.sendMessage(m.chat, { text: final, edit: key })
    await m.react('💀')
}

handler.help = ['hack @user']
handler.tags = ['fun']
handler.command = ['hack']

export default handler
