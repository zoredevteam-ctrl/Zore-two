import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
    try {
        await m.react('🔍')

        const pluginsDir = './plugins'
        const files = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'))

        let response = `✨ *كشف الأخطاء - Flash Bot MD* ✨\n\n`
        response += `🌸 Revisando ${files.length} ملفات, يا غالي...\n`
        response += `━━━━━━━━━━━━━━━━━━━\n\n`

        let hasErrors = false
        let errorCount = 0

        for (const file of files) {
            try {
                await import(path.resolve(pluginsDir, file))
            } catch (error) {
                hasErrors = true
                errorCount++
                const stackLines = error.stack.split('\n')
                const errorLineMatch = stackLines[0].match(/:(\d+):\d+/)
                const errorLine = errorLineMatch ? errorLineMatch[1] : 'مجهول'

                response += `💔 *خطأ encontrado*\n\n`
                response += `📁 *الملف:* ${file}\n`
                response += `📝 *الرسالة:* ${error.message}\n`
                response += `📍 *السطر:* ${errorLine}\n`
                response += `━━━━━━━━━━━━━━━━━━━\n\n`
            }
        }

        if (!hasErrors) {
            response += `🌸 *كله تمام، يا غالي!*\n\n`
            response += `✨ مفيش أخطاء في الصياغة\n`
            response += `💗 كل الـ ${files.length} ملفات شغالة صح~`
        } else {
            response += `💢 *ملخص الأخطاء:*\n\n`
            response += `❌ إجمالي الأخطاء: ${errorCount}\n`
            response += `📂 Archivos revisados: ${files.length}\n`
            response += `💗 راجع الملفات المذكورة، يا غالي~`
        }

        await m.reply(response)
        await m.react(hasErrors ? '💔' : '💗')
    } catch (err) {
        await m.react('💔')
        await m.reply(`💔 يا غالي, حصلت مشكلة...\n\n📝 *خطأ:* ${err.message}`)
    }
}

handler.command = ['detectarsyntax', 'detectar', 'checksyntax']
handler.help = ['detectarsyntax']
handler.tags = ['tools']

export default handler