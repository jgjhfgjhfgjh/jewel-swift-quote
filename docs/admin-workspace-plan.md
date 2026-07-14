# Swelt — AI-First Admin Workspace & Context Hub (prováděcí plán v2)

> Nahrazuje první draft roadmapy. Verze 2 je ověřená proti skutečnému stavu repa
> (commit `ffac795`, 2026-07-13) — opravuje nepřesnosti draftu a zpřesňuje pořadí fází.

## ✅ STAV REALIZACE (2026-07-14): všech 9 fází postaveno

| Fáze | Commit | Poznámka |
|---|---|---|
| 0 — Admin shell | `79e6088` | guard z realIsAdmin, sidebar ze siteMap, nested routy |
| 1 — Context Hub | `0e29080` | bundle + /admin/context + api/context.ts |
| 2 — Chat + command bus | `5f567da` | api/ai/chat.ts, provideři Anthropic/OpenAI, /admin/ws |
| 3–5 — Preview, Jarvis, split | `e06d268` | previewBridge, Web Speech, ResizablePanelGroup |
| 6 — Integrace + MCP | `35c1651` | /admin/integrations, api/mcp.ts (MCP_TOKEN) |
| 7 — Automation hub | `33acab0` | /admin/automations, stav front, ruční spuštění |
| 8 — Finance + marketing | `642f2ad` | /admin/finance (recharts), /admin/marketing |

**Odchylky od plánu (zdůvodněné):**
- Fáze 6: `app_settings` na živé DB NEEXISTUJE (čerstvě generované typy ji nemají,
  migrace zjevně neaplikována) a Supabase MCP nemá oprávnění → stav integrací se
  persistuje v localStorage, MCP auth přes Vercel env `MCP_TOKEN`. Tabulka
  `admin_integrations` čeká na zprovoznění přístupu k živé DB.
- OpenAI provider implementován přes fetch+SSE (bez `openai` závislosti).

**Po deployi zbývá ověřit na Vercelu (lokální vite dev serverless neumí):**
`/api/context` živá KPI, `/api/ai/chat` end-to-end (tools + oba provideři),
`/api/mcp` handshake z Claude Code, chat/Jarvis příkazy nad reálným API.
Nutné env: `ANTHROPIC_API_KEY` (je), volitelně `OPENAI_API_KEY`, `MCP_TOKEN`.

## Co se oproti draftu změnilo (ověřeno v kódu)

1. **`api/chat.ts` NEMÁ tool-calling.** Je to prostý stream (Haiku) s keyword pre-fetchem
   katalogu pro veřejný widget Vera. Navíc má `Access-Control-Allow-Origin: *` a žádnou auth.
   → Admin chat stavíme jako **nový, oddělený endpoint** `api/ai/chat.ts` (admin-gated);
   Very se nedotýkáme, slouží dál zákazníkům.
2. **Vercel Hobby plán** (viz git log `eba87fc`): crony jen 1×/den, 2 sloty už obsazené
   (`process-supplier-orders`, `process-inquiries`), limity délky funkcí.
   → Playwright screenshoty na Vercelu **odkládáme** — preview řeší živý iframe (zadarmo,
   vždy aktuální). Automation hub počítá s cron limity.
3. **`adminViewAs` se nepersistuje a žije per-dokument** (zustand v paměti). Iframe je
   samostatný dokument s vlastním store → audience se do preview musí předat **boot query
   paramem** (`?viewAs=b2b`) + živé přepínání přes `BroadcastChannel`. `AuthContext` override
   aplikuje jen při `realIsAdmin` — bezpečné.
4. **Auth vzor potvrzen:** `public.is_admin()` SECURITY DEFINER RPC + Bearer token, přesně jak
   to dělá `api/generate-offer.ts`. Všechny nové admin endpointy (`api/context.ts`,
   `api/ai/*`, `api/mcp/*`) používají tentýž vzor.
5. **Potvrzeno k recyklaci:** `siteMap.ts` (cluster `admin` na ř. 233, typ `Audience`),
   `copyManifest.json`, `app_settings` (admin RLS, migrace `20260702100000`), nepoužitý
   `ui/sidebar.tsx` (637 ř. shadcn), `zustand@5`, `cmdk`, `recharts`, `ui/resizable.tsx`,
   `@anthropic-ai/sdk@0.91`. `openai` SDK v deps není (doplní se ve Fázi 2).
6. **Supabase MCP v aktuální session nemá oprávnění** (`permission denied` na `list_tables`).
   Kontrola živé DB (`user_roles.role` TEXT, chybějící `has_role()`, tabulky pro
   `FeedManagement`) zůstává **povinný checkpoint před Fází 6** — nejdřív zprovoznit MCP
   přístup, nebo ověřit ručně v SQL editoru.
7. **Voice (Jarvis) v1 bez externích služeb:** Web Speech API (`SpeechRecognition` +
   `speechSynthesis`) — nula klíčů, nula nákladů, funguje v Chrome. Whisper/ElevenLabs jako
   v2 upgrade, ne blocker.
8. **Prohozeno pořadí: Preview (dřív Fáze 4) jde PŘED Voice (dřív Fáze 3).** Preview má
   okamžitou denní hodnotu a voice demo na něm může stavět („ukaž homepage jako B2B").

---

## Architektura (jádro: command bus)

Jedna vrstva příkazů, do které ústí všechny tři vstupy (klik, chat, hlas):

```
src/lib/admin/commandBus.ts
  AdminCommand =
    | { type: 'navigate';             route: string }
    | { type: 'set-preview-audience'; audience: AdminViewAs; page?: string }
    | { type: 'set-layout';           mode: 'voice'|'chat'|'preview'|'split'; ratio?: number }
    | { type: 'query-data';           source: 'orders'|'inquiries'|'products'|'customers'; params?: object }
    | { type: 'run-automation';       id: string }
    | { type: 'toggle-integration';   id: string; enabled: boolean }
```

- **Lokální exekuce + broadcast:** každý příkaz se provede v okně, kde vznikl, a zároveň
  publikuje do `BroadcastChannel('swelt-admin-ws')` — ostatní okna/monitory se synchronizují.
- **Chat tools ↔ příkazy 1:1.** UI příkazy (navigate, set-preview-audience, set-layout)
  vykonává klient; datové dotazy (`query-data`) vykonává server (service key po `is_admin()`).
- **Voice = transkript → stejná chat pipeline.** Žádná třetí logika.
- Layout + per-surface stav: zustand store s `persist` (localStorage).

```
/admin  (nested route + AdminGuard + AdminLayout: sidebar z siteMap)
├── /admin                    Dashboard home (dlaždice sektorů + přehled)
├── /admin/ws                 Workspace (?surface=chat|voice|preview, ?layout=split)
├── /admin/context            Context Hub (bundle, export MD/JSON, MCP status)
├── /admin/integrations       Registr nástrojů & workflow
├── /admin/automations        Automation hub
├── /admin/finance            Finanční KPI
├── /admin/marketing          Marketing KPI
└── (zastřešené stávající)    erp, deals, poptavky, audit, feeds, /customers
```

---

## Fáze (každá = samostatně nasaditelný přírůstek)

### Fáze 0 — Admin shell *(začínáme tady)*
**Co:** jeden guard, jeden layout, sidebar, dashboard home. Žádná AI, žádná DB změna.
- `src/components/admin/AdminGuard.tsx` — jediný guard z `useAuthContext().realIsAdmin`
  (+ `authLoading`), nahradí inline `useEffect(!isAdmin → navigate('/'))` v `AdminErp`,
  `AdminInquiries`, `AuditCockpit`, `CustomerManagement`, `FeedManagement`.
- `src/components/admin/AdminLayout.tsx` — aktivuje `ui/sidebar.tsx` + `<Outlet/>`;
  položky sidebaru odvozené ze `siteMap.ts` clusteru `admin` (single source of truth).
- `src/App.tsx` — pathless wrapper `<Route element={<AdminGuard><AdminLayout/></AdminGuard>}>`
  kolem `/admin/*` a `/customers*`; existující lazy stránky se jen přesunou dovnitř,
  staré URL zůstávají platné. `/komunikace` (má vlastní layout) se nemění.
- `src/pages/admin/AdminHome.tsx` — `/admin` s dlaždicemi sektorů (Web, Zákazníci, Finance,
  Marketing, Automatizace, Integrace — budoucí sektory jako „coming soon" dlaždice).
- **DoD:** všechny admin stránky běží pod shellem, ne-admin je odmítnut jedním guardem,
  deep-linky fungují, `npm run lint` + `npm run test` zelené, ověřeno v prohlížeči.

### Fáze 1 — Context Hub (tool-agnostic jádro)
**Co:** jeden typovaný bundle „všechno o webu", exportovatelný pro člověka i stroj.
- `src/lib/context/bundle.ts` — `buildContextBundle()`: statická část (siteMap + souhrn
  copyManifest + registr rout/audiences) sestavitelná na klientu.
- `api/context.ts` — admin-gated (Bearer + `is_admin()` dle `generate-offer.ts`); statickou
  část obohatí o živé snapshoty (počty produktů, orders KPI, otevřené poptávky) přes service
  key. `?format=json|md`.
- `/admin/context` stránka — náhled bundlu, **Download MD / Download JSON / Copy**.
- **DoD:** export obsahuje siteMap + copy souhrn + živá KPI; ne-admin dostane 401/403.

### Fáze 2 — Centrální chat + command bus
**Co:** admin chat s plným kontextem a nástroji; provider-agnostic od prvního dne.
- `src/lib/ai/providers/{types,anthropic}.ts` — společné rozhraní (messages, tools, stream);
  `openai.ts` hned poté (přidat `openai` do deps, `OPENAI_API_KEY` do Vercel env — klíče
  zadává uživatel, do repa nepatří).
- `api/ai/chat.ts` — **nový** endpoint (Very se nedotýká): admin-gated, injektuje context
  bundle do system promptu, deklaruje tools = command bus akce. Datové tools vykonává server,
  UI tools vrací klientovi (`tool_use` → klient provede → pošle `tool_result`).
- `src/lib/admin/commandBus.ts` + `useAdminChannel()` (BroadcastChannel hook).
- `src/components/admin/ws/ChatSurface.tsx` — chat UI s přepínačem modelu/providera.
- **DoD:** chat zodpoví dotaz z kontextu webu; „přejdi na poptávky" naviguje; „kolik máme
  otevřených poptávek" vrátí živé číslo; přepnutí providera zachová tool-calling.

### Fáze 3 — Preview (multi-audience) *(dříve Fáze 4)*
**Co:** živý náhled webu očima každé vrstvy zákazníka, ovladatelný chatem.
- `src/components/admin/ws/PreviewSurface.tsx` — iframe na routy ze `siteMap` (jen
  ne-dynamické), toolbar: výběr stránky + audience switcher (`real/guest/lead/customer/b2b`).
- Boot: iframe URL nese `?viewAs=`; malý hook v hlavní appce (gated `realIsAdmin`) načte
  param do store a poslouchá `BroadcastChannel` pro živé přepnutí bez reloadu.
- Příkaz `set-preview-audience` z chatu přepne audience v preview (i v jiném okně).
- Playwright thumbnaily: **odloženo** (Vercel Hobby limity) — živý iframe pokrývá potřebu.
- **DoD:** přepnutí audience změní obsah iframu; příkaz z chatu na jednom monitoru přepne
  preview na druhém.

### Fáze 4 — Jarvis (voice surface) *(dříve Fáze 3)*
**Co:** hands-free vstup/výstup nad stejnou pipeline.
- v1: Web Speech API — `SpeechRecognition` push-to-talk (cs-CZ), `speechSynthesis` TTS.
  Nula závislostí a klíčů.
- `src/components/admin/ws/VoiceSurface.tsx` — stav (poslouchám/přemýšlím/mluvím), živý
  transkript, log provedených akcí. Transkript → chat pipeline → command bus.
- v2 (volitelné, až bude v1 denně používaná): Whisper (`api/ai/transcribe.ts`) + ElevenLabs.
- **DoD:** namluvený příkaz provede akci a odpověď se přehraje nahlas.

### Fáze 5 — Workspace layout (split & multi-monitor)
**Co:** plné „tři displeje" UX.
- `src/components/admin/ws/Workspace.tsx` — `/admin/ws?surface=chat|voice|preview`,
  `?layout=split` + `ui/resizable.tsx`; každý surface URL-adresovatelný → vlastní okno/monitor.
- Zustand `persist` pro layout; `BroadcastChannel` už synchronizuje příkazy z Fáze 2–3.
- **DoD:** split-view na jednom monitoru; dvě okna na dvou monitorech se synchronizují.

### Fáze 6 — Registr integrací & MCP server
**⚠️ Checkpoint před startem:** ověřit živou DB (`ktkzibhlzkoklwglkunw`) — `user_roles.role`
TEXT vs enum, existence `is_admin()`/`has_role()`, tabulky pro `FeedManagement`. Vyžaduje
zprovoznit Supabase MCP oprávnění (v session 2026-07-13 vracelo permission denied).
- Nová tabulka `admin_integrations` (id, typ `internal-api|mcp|webhook`, název, status,
  config jsonb, enabled per workflow) — čistší než přetěžovat `app_settings`.
- `/admin/integrations` — karty zapnout/vypnout/napojit/odstranit (nahradí mock
  `PartnerIntegrations.tsx` persistovanou verzí).
- `api/mcp.ts` — MCP server přes **streamable HTTP** (stateless; SSE long-lived na Hobby
  plánu neudržíme): resources = context bundle, tools = bezpečná podmnožina command busu.
  Auth tokenem uloženým v `app_settings`.
- **DoD:** toggle přežije reload; Claude Desktop se přes MCP připojí a přečte context bundle.

### Fáze 7 — Automation hub
- `/admin/automations` — registr existujících automatizací (crony z `vercel.json`, outboxy
  `order_emails`/`inquiry_emails`, `import-deal`, `sync-product-feed`): stav, poslední běh
  (z DB), ruční spuštění přes admin-gated wrapper endpointy.
- Pozor: Hobby = crony 1×/den; nové plánované úlohy řešit slučováním do existujících slotů,
  nebo externím triggerem. Chat/Jarvis spouští automatizace přes `run-automation`.
- **DoD:** seznam ukazuje reálný poslední běh; ruční spuštění projde a stav se aktualizuje.

### Fáze 8 — Finance & marketing benchmarky
- `/admin/finance` — tržby/marže z `orders`/`order_items` (recharts, vzor `AdminErp.tsx`).
- `/admin/marketing` — výkon kampaní; volitelně Meta Ads MCP.
- **DoD:** čísla sedí proti DB dotazu.

---

## Rizika a otevřená rozhodnutí

| Riziko / rozhodnutí | Stav |
|---|---|
| Živá DB ≠ migrace (`user_roles`, `has_role`) | ověřit před Fází 6; Fáze 0–5 na tom nezávisí |
| Supabase MCP bez oprávnění v session | zprovoznit před Fází 6 |
| Vercel Hobby (crony 1×/den, délka funkcí) | preview bez Playwrightu; MCP stateless; automations respektují sloty |
| Veřejná Vera (`api/chat.ts`) bez auth a s CORS `*` | mimo scope plánu, ale doporučeno zpřísnit (samostatný mini-fix) |
| Whisper vs Web Speech, ElevenLabs vs speechSynthesis | v1 = Web Speech (rozhodnuto); upgrade až podle používání |
| `admin_integrations` vs rozšíření `app_settings` | nová tabulka (rozhodnuto, čistší) |
| Necommitnuté změny v working tree | před Fází 0 commitnout/uklidit, ať fáze vzniká na čistém základě |

## Ověření průběžně
Po každé fázi: `npm run lint`, `npm run test`, ruční průchod v prohlížeči (admin i ne-admin
účet), nasazení na Vercel preview.
