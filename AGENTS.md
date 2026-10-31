# Flash Bot MD — repository notes

## Stack
- Bot: ESM (`"type": "module"`), entry `index.js`, handler `handler.js`.
- Baileys: `@whiskeysockets/baileys` is aliased to the CJS fork **`dwhhhg8-code/bails`**
  (`node_modules/Baileys`, `main = lib/index.js`, no `exports` map).
  The fork ships `sendMessage`/`relayMessage`/`groupMetadata`/`sendPresenceUpdate`/etc.
  but **not** `reply`, `getName`, `copyNForward`, `downloadMediaMessage`, `decodeJid`.

## Socket helpers — always call `bind(conn)`
`lib/simple.js` exports `bind(conn)` which attaches the helpers above plus sets
`conn.user.jid` from `conn.user.id`. Every socket must go through it:
- `index.js` calls `bind(conn)` right after `makeWASocket`.
- `plugins/jadibot.js` calls `bind(sock)` for sub-bots.

If you refactor `simple.js`, keep `bind` — ~74 plugins call `conn.reply`,
several call `conn.getName`, and `tools-save.js` uses `conn.copyNForward`.
`m.quoted.text` and `m.quoted.body` are both exposed by `smsg`.

## Commands & aliases
- `handler.js` splits the body on spaces (`body.split(/ +/)`), so multi-word
  arguments arrive as separate `args` entries — rejoin with `args.join(' ')`.
- Arabic command names live in `lib/ar-aliases.js` (`AR_ALIASES`). The menu lists
  Arabic aliases; the handler resolves them via `resolveAlias`/`arNormalize`.

## Menu
`plugins/main-menu.js`: the main menu sends **only** section buttons
(`interactiveButtons`, nativeFlow `quick_reply`). Pressing one sends
`<prefix>القائمة <section name>`; the section reply is **plain text** listing that
section's commands. Sections and their commands are the `SECCIONES` array.

## global.owner shape
`global.owner` is an array of `[number, name, isRoot]` tuples. When adding an
owner push a tuple, and compare using the normalized first element.

## Useful checks
```bash
node --check <file>                                  # syntax
node index.js                                        # boots; stops at link-method prompt
timeout 30 node index.js > /tmp/b.log 2>&1           # exit 124 = waiting for input (healthy)
```
