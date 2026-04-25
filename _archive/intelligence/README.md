# swelt.intelligence — archiv

Služba dočasně stažena z webu dne 2026-04-25.

## Soubory
- `Intelligence.tsx` — plná landing page (hero, pricing 3 plány, interaktivní demo, FAQ)

## Assety (v src/assets/)
- `gateway-intelligence.jpg`
- `intel-warehouse.jpg`
- `intel-chart.jpg`

## Routy / reference které byly odstraněny
- `/intelligence` route v App.tsx
- sekce #intelligence v GatewaySections.tsx
- odkaz #intelligence v Navbar.tsx
- cross-sell odkaz v Dropshipping.tsx a Velkoobchod.tsx

## Obnovení
1. Zkopírovat Intelligence.tsx zpět do `src/pages/`
2. Přidat `import Intelligence` + `<Route path="/intelligence">` do App.tsx
3. Přidat sekci zpět do GatewaySections.tsx
4. Přidat odkaz do Navbar.tsx
