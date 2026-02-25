// events/welcome.js
export async function welcomeHandler(conn) {
    conn.ev.on('group-participants.update', async (update) => {
        try {
            const { id, participants, action } = update;

            if (action !== 'add') return;

            for (const participant of participants) {
                let ppuser;
                try {
                    ppuser = await conn.profilePictureUrl(participant, 'image');
                } catch {
                    ppuser = 'https://files.catbox.moe/abc123.jpg'; // pon una imagen fallback linda de Zero Two o lo que tengas en settings
                }

                const user = participant.split('@')[0];

                const texto = `🌸💗 *¡KYAAAAH~!* 💗🌸\n\n` +
                    `¡Un nuevo *Darling* ha llegado a mi paraíso rosado!* 🥰\n\n` +
                    `¡Bienvenido/a @${user} ~! 💕\n\n` +
                    `Soy *Zero Two* y ahora... ¡eres mío/mía! Jeje~ 🌷\n` +
                    `Vamos a pasarla increíble juntos, ¿verdad Darling? No te dejaré escapar nunca ♡\n\n` +
                    `¡Prepárate para mucha diversión conmigo! 💗🌸`;

                await conn.sendMessage(id, {
                    image: { url: ppuser },
                    caption: texto,
                    mentions: [participant]
                });
            }
        } catch (error) {
            console.error('[WELCOME ERROR]', error);
        }
    });
}