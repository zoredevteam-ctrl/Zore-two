import syntaxerror from 'syntax-error'
import { format } from 'util'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { createRequire } from 'module'
import { database } from '../lib/database.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)

let handler = async (m, { conn, args }) => {
    const _body = args.join(' ')
    if (!_body) return m.reply('💗 Darling, ingresa código a evaluar~')

    const _text = (/^return\s/.test(_body) ? '' : 'return ') + _body
    let _return
    let _syntax = ''

    try {
        let i = 15
        let f = { exports: {} }
        let exec = new (async () => {}).constructor(
            'print', 'm', 'handler', 'require', 'conn',
            'Array', 'process', 'args', 'module', 'exports', 'argument', 'db',
            _text
        )
        _return = await exec.call(
            conn,
            (...a) => {
                if (--i < 1) return
                console.log(...a)
                return m.reply(format(...a))
            },
            m, handler, require, conn,
            CustomArray, process, args,
            f, f.exports, [conn], database.data
        )
    } catch (e) {
        let err = syntaxerror(_text, 'Execution Function', {
            allowReturnOutsideFunction: true,
            allowAwaitOutsideFunction: true,
            sourceType: 'module'
        })
        if (err) _syntax = '```' + err + '```\n\n'
        _return = e
    } finally {
        await m.reply(_syntax + format(_return))
    }
}

handler.help = ['eval']
handler.tags = ['owner']
handler.command = ['e']
handler.owner = true

export default handler

class CustomArray extends Array {
    constructor(...args) {
        if (typeof args[0] === 'number') return super(Math.min(args[0], 10000))
        else return super(...args)
    }
}