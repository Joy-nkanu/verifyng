# NAFDAC registration data and secure import

## Goal
Use the provided Apify test dataset as a staged, auditable NAFDAC Greenbook source. Show a verified registration status only when an exact source record supports it. Keep barcode/catalog details separate from regulatory status; the supplied records do not map barcodes to batches or prove package authenticity.

## Build
1. **Protected account access:** Add email/password and managed Google/Lovable sign-in with user profiles. Provision the requested first administrator by matching the confirmed account email; keep roles in a protected role table and enforce them in database policies and import functions.
2. **Database:** Add product, import-batch, staging, status-history, and ingredient tables, indexes, grants, and row-level policies. Keep source status separate from derived status. Preserve repeated registration numbers and upsert only by source product ID.
3. **Import:** Add a server-side, admin-only import function for the linked Apify dataset and validated JSON uploads. Process manageable pages, validate and stage records, report duplicates/rejections/data issues, retain inactive registrations, and record status history only when an existing record changes.
4. **Admin workspace:** Add a sign-in screen and restricted dashboard for import, batch results, data-quality issues, and searching/viewing registered products and history.
5. **Public checks:** Query the imported registration records through a restricted public lookup path. Show active registration as verified only when the source confirms it and it is not expired; show inactive/expired/suspended/withdrawn/unknown distinctly. Never turn a catalog match or registration-name match into batch authenticity proof.
6. **Validation:** Add focused tests for validation, duplicate handling, non-unique registration numbers, status/expiry rules, idempotent history, and unauthorized paths. Test the 100-record dataset in bounded chunks; do not run a full extraction.

## Technical details
- Use the existing Lovable Cloud Edge Function pattern for Apify access; never expose credentials in browser code.
- Store the initial administrator role through a narrowly scoped auth lifecycle provisioner for `joyetomi28@gmail.com`; do not grant client-side role editing.
- The account must exist and complete email confirmation before the user can sign into the dashboard. Keep email confirmation enabled.
- Public barcode lookup remains separate until an authorized barcode-to-registration/batch data source exists.
