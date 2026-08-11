# Předávka mezi stroji

Session Claude Code se mezi stroji nepřenáší. Tenhle soubor je jediný kanál, kterým
si PC a druhý stroj předají, co je rozdělané. **Commituje se.**

Pravidla v [CLAUDE.md](../CLAUDE.md), sekce „Práce ze dvou zařízení".

- **Na začátku session** si tenhle soubor přečti — než sáhneš do oblasti, kterou má
  druhý stroj rozdělanou.
- **Na konci session** sem zapiš, co zůstalo nedokončené a kde to leží. Hotovou
  a smergovanou práci odsud zase smaž, ať soubor nezhoustne do archivu.

---

## Rozdělaná práce

| Stroj | Větev | Co je rozdělané | Od kdy |
|-------|-------|-----------------|--------|
| PC | `pc/tooling-fixes` | Oprava playwright configu + tailwind pluginů a zavedení pravidel pro dva stroje. Čeká na preview a merge do `main` — po mergnutí tenhle řádek smaž. | 2026-08-11 |

## Poslední synchronizace

| Stroj | Naposledy srovnán s `origin/main` |
|-------|-----------------------------------|
| PC (`swelt.partner`) | 2026-08-11 |
| druhý stroj (`tomek`) | — |

## Kdo drží Supabase

Migrace a zásahy do schématu živé DB dělá **jen jeden stroj** — jinak vznikne drift
mezi živou DB a `supabase/migrations/` (bolístka č. 6 v CLAUDE.md).

**Aktuálně drží:** zatím nedohodnuto — před první migrací si to rozdělte a zapište sem.
