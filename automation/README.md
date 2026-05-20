# DEAL offer ingestion automation

Two pieces feed new closeout offers automatically into the platform:

| Piece | Where it runs | Job |
|---|---|---|
| **Apps Script** ([`gmail-deal-export.gs`](gmail-deal-export.gs)) | inside `sweltdeal@gmail.com`, hourly trigger | The Gmail connector cannot download binary attachments, so this small script copies every `.xlsx` attachment from new offer e-mails into the Supabase `deal-imports` bucket and labels the thread `deal-ready`. |
| **Claude routine — „Deal agent"** ([`deal-agent-prompt.md`](deal-agent-prompt.md)) | scheduled remote Claude routine, hourly | Reads threads labelled `deal-ready`, extracts the offer terms from the e-mail body, calls the `import-deal` edge function for each message containing a workbook, writes a calendar event and labels the thread `deal-imported`. |

The edge function [`supabase/functions/import-deal`](../supabase/functions/import-deal/index.ts) is the deterministic core — both the manual admin upload and the routine end up calling it.

## Flow

```
supplier e-mail  ──►  Gmail (sweltdeal@gmail.com)
                          │
                          │ hourly · Apps Script
                          ▼
                    Supabase Storage
                    deal-imports/<msgId>/N.xlsx
                          │
              hourly · Claude routine (Deal agent)
                          │  reads body text → terms
                          ▼
            POST /functions/v1/import-deal
                          │
                          ▼
            DRAFT deal + products  +  Calendar event
                          │
                          ▼
              Admin schvaluje v /admin/deals  →  status: active
```

## Re-running the agent manually

If something fails, the routine leaves the thread *unlabeled* — the next hourly run retries it. You can also re-import any specific workbook directly:

```bash
curl -X POST https://ijcfcjlfxktvedqrsvqz.supabase.co/functions/v1/import-deal \
  -H "Authorization: Bearer <service_role_key>" \
  -H "Content-Type: application/json" \
  -d '{ "message_id": "<gmail msg id>", "meta": { "supplier": "Fossil Group" } }'
```
