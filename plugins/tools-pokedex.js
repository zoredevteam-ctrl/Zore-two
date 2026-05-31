import fetch from 'node-fetch'

// ── Helpers ───────────────────────────────────────────────────────────────────

const getThumb = async () => {
    try {
        const src = global.icon || global.avatar || global.banner
        if (!src) return null
        const res = await fetch(src)
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

const makeCtx = (thumb) => ({
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid:   global.newsletterJid,
        serverMessageId: '',
        newsletterName:  global.newsletterName
    },
    externalAdReply: {
        title:                 global.botName,
        body:                  global.botText,
        mediaType:             1,
        thumbnail:             thumb,
        renderLargerThumbnail: false,
        sourceUrl:             global.rcanal
    }
})

const TYPE_EMOJI = {
    fire:     '🔥', water:    '💧', grass:    '🌿',
    electric: '⚡', ice:      '❄️', fighting: '🥊',
    poison:   '☠️', ground:   '🌍', flying:   '🌪️',
    psychic:  '🔮', bug:      '🐛', rock:     '🪨',
    ghost:    '👻', dragon:   '🐉', dark:     '🌑',
    steel:    '⚙️', fairy:    '🌸', normal:   '⭐'
}

const STAT_BAR = (val) => {
    const filled = Math.round(val / 10)
    return '█'.repeat(Math.min(filled, 15)) + '░'.repeat(Math.max(15 - filled, 0)) + ` (${val})`
}

// ── Handler ───────────────────────────────────────────────────────────────────

const handler = async (m, { conn, args, prefix, command }) => {
    const query = args.join(' ').trim().toLowerCase()

    if (!query) {
        const thumb = await getThumb()
        return conn.sendMessage(m.chat, {
            text:
                `╔══「 🔴 𝐏𝐨𝐤é𝐝𝐞𝐱 · Zero Two 」══╗\n\n` +
                `꒰ ⚠️ ꒱ ¡Necesito un Pokémon, Darling~!\n` +
                `⟡ Uso: *${prefix}${command} <nombre o número>*\n` +
                `⟡ Ejemplo: *${prefix}${command} pikachu*\n` +
                `⟡ Ejemplo: *${prefix}${command} 25*\n\n` +
                `╚══「 💕 © ZoreDevTeam 」══╝`,
            contextInfo: makeCtx(thumb)
        }, { quoted: m })
    }

    await m.react('🔍')

    try {
        // ── Fetch datos del Pokémon ───────────────────────────────────────
        const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`)
        if (!pokeRes.ok) {
            await m.react('💔')
            const thumb = await getThumb()
            return conn.sendMessage(m.chat, {
                text:
                    `╔══「 🔴 𝐏𝐨𝐤é𝐝𝐞𝐱 · Zero Two 」══╗\n\n` +
                    `꒰ 💔 ꒱ No encontré ese Pokémon, Darling~\n` +
                    `⟡ Verifica el nombre o número e intenta de nuevo.\n\n` +
                    `╚══「 💕 © ZoreDevTeam 」══╝`,
                contextInfo: makeCtx(thumb)
            }, { quoted: m })
        }

        const data = await pokeRes.json()

        // ── Fetch especie (descripción y nombre en español) ───────────────
        const speciesRes = await fetch(data.species.url)
        const species    = await speciesRes.json()

        const nombreES = species.names.find(n => n.language.name === 'es')?.name
            || species.names.find(n => n.language.name === 'en')?.name
            || data.name

        const descripcion = (
            species.flavor_text_entries.find(e => e.language.name === 'es')
            || species.flavor_text_entries.find(e => e.language.name === 'en')
        )?.flavor_text?.replace(/\f|\n/g, ' ') || 'Sin descripción disponible.'

        const generacion = species.generation.name.replace('generation-', 'Gen ').toUpperCase()
        const habitat    = species.habitat?.name || 'Desconocido'
        const legendario = species.is_legendary ? '⭐ Legendario' : species.is_mythical ? '✨ Mítico' : '—'

        // ── Procesar datos ────────────────────────────────────────────────
        const tipos = data.types.map(t =>
            `${TYPE_EMOJI[t.type.name] || '❓'} ${t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)}`
        ).join(' · ')

        const habilidades = data.abilities.map(a =>
            a.is_hidden ? `*(${a.ability.name})*` : a.ability.name
        ).join(', ')

        const stats = data.stats
        const getStat = (name) => stats.find(s => s.stat.name === name)?.base_stat || 0

        const hp      = getStat('hp')
        const atk     = getStat('attack')
        const def     = getStat('defense')
        const spatk   = getStat('special-attack')
        const spdef   = getStat('special-defense')
        const spd     = getStat('speed')
        const total   = hp + atk + def + spatk + spdef + spd

        const peso  = (data.weight / 10).toFixed(1) + ' kg'
        const altura = (data.height / 10).toFixed(1) + ' m'

        const movimientos = data.moves.slice(0, 5).map(mv => mv.move.name).join(', ')

        // ── Imagen oficial ────────────────────────────────────────────────
        const imgUrl =
            data.sprites.other?.['official-artwork']?.front_default ||
            data.sprites.other?.home?.front_default ||
            data.sprites.front_default

        // ── Texto ─────────────────────────────────────────────────────────
        const texto =
            `╔══「 🔴 𝐏𝐨𝐤é𝐝𝐞𝐱 #${String(data.id).padStart(3, '0')} 」══╗\n\n` +
            `꒰ 🌟 ꒱ *${nombreES.toUpperCase()}*\n` +
            `❝ ${descripcion} ❞\n\n` +
            `*╭── ⟡ [ ✦ INFO ] ⟡*\n` +
            `*│ ✦ Tipo:* ${tipos}\n` +
            `*│ ✦ Generación:* ${generacion}\n` +
            `*│ ✦ Habitat:* ${habitat}\n` +
            `*│ ✦ Categoría:* ${legendario}\n` +
            `*│ ✦ Altura:* ${altura}\n` +
            `*│ ✦ Peso:* ${peso}\n` +
            `*│ ✦ Habilidades:* ${habilidades}\n` +
            `*╰─────────────── ✦*\n\n` +
            `*╭── ⟡ [ ✦ BASE STATS ] ⟡*\n` +
            `*│* ❤️ HP      ${STAT_BAR(hp)}\n` +
            `*│* ⚔️ ATK     ${STAT_BAR(atk)}\n` +
            `*│* 🛡️ DEF     ${STAT_BAR(def)}\n` +
            `*│* 🔮 SP.ATK  ${STAT_BAR(spatk)}\n` +
            `*│* 💠 SP.DEF  ${STAT_BAR(spdef)}\n` +
            `*│* 💨 SPD     ${STAT_BAR(spd)}\n` +
            `*│ ✦ TOTAL:* ${total}\n` +
            `*╰─────────────── ✦*\n\n` +
            `*╭── ⟡ [ ✦ MOVIMIENTOS ] ⟡*\n` +
            `*│* ${movimientos}\n` +
            `*╰─────────────── ✦*\n\n` +
            `> 💗 Pokédex por Zero Two~ © ZoreDevTeam`

        // ── Enviar con imagen ─────────────────────────────────────────────
        if (imgUrl) {
            const imgRes = await fetch(imgUrl)
            const imgBuf = Buffer.from(await imgRes.arrayBuffer())

            await conn.sendMessage(m.chat, {
                image:   imgBuf,
                caption: texto,
                mentions: [m.sender],
                contextInfo: makeCtx(await getThumb())
            }, { quoted: m })
        } else {
            const thumb = await getThumb()
            await conn.sendMessage(m.chat, {
                text: texto,
                mentions: [m.sender],
                contextInfo: makeCtx(thumb)
            }, { quoted: m })
        }

        await m.react('✅')

    } catch (e) {
        console.error('[POKEDEX ERROR]', e.message)
        await m.react('💔')
        const thumb = await getThumb()
        conn.sendMessage(m.chat, {
            text:
                `╔══「 🔴 𝐏𝐨𝐤é𝐝𝐞𝐱 · Error 」══╗\n\n` +
                `꒰ 💔 ꒱ ¡Algo falló, Darling~!\n` +
                `⟡ ${e.message}\n\n` +
                `╚══「 💕 © ZoreDevTeam 」══╝`,
            contextInfo: makeCtx(thumb)
        }, { quoted: m })
    }
}

handler.help    = ['pokedex <nombre o número>']
handler.tags    = ['tools']
handler.command = ['pokedex', 'dex', 'pokemon', 'poke']

export default handler
