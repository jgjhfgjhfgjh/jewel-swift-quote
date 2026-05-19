/**
 * Gmail → Supabase bridge for automated DEAL offer ingestion.
 *
 * The Gmail connector cannot download binary attachments, so this Apps Script
 * runs inside the dedicated offers mailbox and copies the .xlsx attachments of
 * new offer e-mails into the Supabase `deal-imports` storage bucket. It then
 * labels the thread `deal-ready` — the Claude agent picks those up, reads the
 * e-mail terms and calls the `import-deal` edge function.
 *
 * ── Setup ──────────────────────────────────────────────────────────────────
 * 1. script.google.com → New project → paste this file.
 * 2. Project Settings → Script Properties → add:
 *      SUPABASE_URL          = https://ijcfcjlfxktvedqrsvqz.supabase.co
 *      SUPABASE_SERVICE_KEY  = <service_role key — Supabase dashboard,
 *                               Project Settings → API → service_role>
 * 3. Triggers (clock icon) → Add Trigger:
 *      function: exportDealOffers · event: Time-driven · Hour timer · Every hour
 * 4. Run `exportDealOffers` once manually to grant the Gmail/UrlFetch
 *    authorization prompt.
 */

const READY_LABEL = 'deal-ready';

/** Entry point — set this on an hourly time-driven trigger. */
function exportDealOffers() {
  const props = PropertiesService.getScriptProperties();
  const baseUrl = props.getProperty('SUPABASE_URL');
  const serviceKey = props.getProperty('SUPABASE_SERVICE_KEY');
  if (!baseUrl || !serviceKey) {
    throw new Error('Chybí Script Properties SUPABASE_URL / SUPABASE_SERVICE_KEY.');
  }

  const label = GmailApp.getUserLabelByName(READY_LABEL) || GmailApp.createLabel(READY_LABEL);

  // Offer e-mails = carry an .xlsx attachment and were not exported yet.
  const threads = GmailApp.search(
    'has:attachment filename:xlsx -label:' + READY_LABEL + ' newer_than:30d', 0, 20);

  threads.forEach(function (thread) {
    try {
      var uploaded = 0;
      thread.getMessages().forEach(function (msg) {
        var msgId = msg.getId();
        var idx = 0;
        msg.getAttachments().forEach(function (att) {
          if (!/\.xlsx$/i.test(att.getName())) return;
          uploadXlsx_(baseUrl, serviceKey, msgId + '/' + idx + '.xlsx', att);
          idx++;
          uploaded++;
        });
      });
      if (uploaded > 0) {
        thread.addLabel(label);
        Logger.log('Exported ' + uploaded + ' xlsx — thread ' + thread.getId());
      }
    } catch (e) {
      // Leave the thread unlabelled so the next run retries it.
      Logger.log('Thread ' + thread.getId() + ' failed: ' + e);
    }
  });
}

/** Uploads one attachment to deal-imports/<path> via the Supabase Storage API. */
function uploadXlsx_(baseUrl, serviceKey, path, attachment) {
  const url = baseUrl + '/storage/v1/object/deal-imports/' + encodeURI(path);
  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    headers: { Authorization: 'Bearer ' + serviceKey, 'x-upsert': 'true' },
    payload: attachment.getBytes(),
    muteHttpExceptions: true,
  });
  const code = res.getResponseCode();
  if (code >= 300) {
    throw new Error('Upload ' + path + ' selhal (' + code + '): ' + res.getContentText());
  }
}
