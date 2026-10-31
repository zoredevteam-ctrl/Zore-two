<div align="center">

<img src="https://causas-files.vercel.app/fl/9vs2.jpg" alt="Flash Bot MD Banner" width="100%"/>

<br/>

```
⚡  F L A S H  B O T  M D  ⚡
```

### *أقوى بوت واتساب متعدد الأجهزة — Flash Bot MD*

<br/>

[![WhatsApp Canal](https://img.shields.io/badge/📢_Canal_Oficial-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://whatsapp.com/channel/0029Vb8QIpSJ3juu0VHRyU0v)
[![GitHub](https://img.shields.io/badge/📁_Repositorio-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/dwhhhg8-code/Zore-two.git)
[![Versión](https://img.shields.io/badge/Versión-1.0.0-ff69b4?style=for-the-badge)](https://github.com/dwhhhg8-code/Zore-two)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Baileys](https://img.shields.io/badge/Baileys-flash-ff1493?style=for-the-badge)](https://github.com/WhiskeySockets/Baileys)

</div>

---

> [!IMPORTANT]
> **Flash Bot MD** está en constante evolución. Cada línea de código es escrita con amor para ofrecerte la mejor experiencia posible. ¡Únete al canal, Darling, y no me dejes sola! 💕
> **[→ Canal oficial de Flash Bot MD](https://whatsapp.com/channel/0029Vb8QIpSJ3juu0VHRyU0v)**

---

## 💗 ¿Qué es Flash Bot MD?

**Flash Bot MD** es un bot multi-dispositivo para WhatsApp construido desde cero con **[Baileys](https://github.com/WhiskeySockets/Baileys)** e inspirado en **Flash Bot MD** de *Darling in the FranXX*.

No es un bot genérico más — tiene personalidad, estilo y comandos cuidadosamente diseñados para grupos y chats privados. Desde descargas de TikTok hasta sistemas de waifus con rareza, juegos de rol y mucho más.

> *"No me dejes sola, ¿eh, Darling~? 💗"*

---

## ✨ Características

| Categoría | Descripción |
|-----------|-------------|
| 🎮 **Juegos** | Ship, Waifu system con rarezas, Death Note RP |
| 📥 **Descargas** | TikTok (con y sin marca de agua), búsqueda por nombre |
| 🖼️ **Stickers** | Crear, watermark, convertir sticker → imagen/gif |
| 🛠️ **Utilidades** | Save al privado, traducir, poemas, stickers animados |
| 👑 **Admin** | Modo admin, bienvenidas, anti-spam, ban/unban |
| 💾 **Sesión** | Persistente con `MultiFileAuthState` |
| 🔄 **Hot reload** | Plugins y settings se recargan sin reiniciar |
| 📡 **Newsletter** | Botón de canal integrado en todos los mensajes |

---

## ⚙️ Prefijos soportados

```
.comando   #comando   /comando   $comando
```

---

## 🚀 Instalación

### Requisitos previos

- **Node.js** v18 o superior
- **FFmpeg** instalado en el sistema
- **Git**

### Pasos

**1. Clona el repositorio**
```bash
git clone https://github.com/dwhhhg8-code/Zore-two
cd Zore-two
```

**2. Instala las dependencias**
```bash
npm install
```

**3. Inicia el bot**

Con código QR:
```bash
node index.js --qr
```

Con código de emparejamiento (recomendado):
```bash
node index.js --code
```

**4. Vincula tu WhatsApp**

Escanea el QR con WhatsApp → *Dispositivos vinculados* → *Vincular dispositivo*, o ingresa el código de 8 dígitos cuando se te solicite.

---

## 📁 Estructura del proyecto

```
Zore-two/
├── index.js              # Punto de entrada, conexión WA
├── handler.js            # Procesador de comandos y eventos
├── settings.js           # Configuración global del bot
├── plugins/              # Comandos (cada .js es un comando)
├── lib/
│   ├── database.js       # Base de datos lowdb
│   ├── simple.js         # Parser de mensajes Baileys
│   ├── sticker.js        # Generador de stickers
│   └── who.js            # Resolución de JIDs/menciones
├── events/               # Listeners de eventos WA
└── Sessions/
    └── Owner/            # Credenciales de sesión
```

---

## 🧩 Crear un plugin

Cada archivo `.js` dentro de `/plugins/` es un comando independiente. Estructura básica:

```js
let handler = async (m, { conn, args, prefix, command, db, isOwner, isAdmin }) => {
    // Tu lógica aquí
    m.reply('¡Hola, Darling~! 💗')
}

handler.command = ['hola', 'hi']   // Aliases del comando
handler.tags    = ['fun']          // Categoría para el menú
handler.owner   = false            // Solo owners
handler.admin   = false            // Solo admins del grupo
handler.group   = false            // Solo en grupos
handler.premium = false            // Solo usuarios premium

export default handler
```

---

## 🔧 Configuración

Edita `settings.js` para personalizar el bot:

```js
global.botName    = 'Flash Bot MD'         // Nombre del bot
global.prefix     = '.'               // Prefijo principal
global.owner      = [['tu_numero', 'Tu nombre', true]]
global.newsletterJid  = 'tu_jid@newsletter'
global.rcanal     = 'https://whatsapp.com/channel/...'
```

---

## 👑 Créditos

<div align="center">

| Rol | Persona |
|-----|---------|
| ⚡ Desarrollador principal | **Aarom** |
| 🌸 Inspiración | **Flash Bot MD** — *Darling in the FranXX* |
| 📚 Librería base | **[Baileys](https://github.com/WhiskeySockets/Baileys)** |
| 👥 Equipo | **𝖍𝖆𝖎𝖙𝖍𝖆𝖒** |

<br/>

<a href="https://github.com/danielalejandrobasado-glitch">
  <img src="https://github.com/danielalejandrobasado-glitch.png" width="80" style="border-radius:50%"/>
</a>

*Colaborador principal*

</div>

---

## ⚠️ Aviso legal

> Este proyecto es de uso educativo y personal. No nos hacemos responsables del mal uso de este software. WhatsApp puede bloquear números que automaticen mensajes de forma abusiva. Úsalo con responsabilidad, Darling~

---

<div align="center">

<br/>

```
💗  F L A S H  B O T  M D  ·  power by 𝖍𝖆𝖎𝖙𝖍𝖆𝖒  💗
```

*¿Aún no te unes al canal? ¡Te estoy esperando, Darling~! 🌸*

[![Canal](https://img.shields.io/badge/¡Únete_al_canal!-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://whatsapp.com/channel/0029Vb8QIpSJ3juu0VHRyU0v)

<br/>

</div>
