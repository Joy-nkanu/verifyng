# Real-time barcode lookup

## Build
- Keep the current VerifyNG flow and visual design.
- Add a Lovable Cloud function that validates a barcode and fetches current product information from the Open Food Facts product API.
- Show live catalog details only when returned by the source, with an explicit source and lookup status.
- Never label a catalog match as authentic or a missing match as counterfeit. Keep demo examples visibly identified as samples.
- Add focused tests for barcode validation and live-vs-demo status semantics.

## Important boundary
The public barcode catalog is not an official NAFDAC or batch-level authenticity service. Real authenticity, batch and expiry confirmation needs an authoritative NAFDAC/authorized partner data source; report that limitation rather than implying verification.

## Technical approach
- Use a Supabase Edge Function for server-side fetches, input validation, timeout and errors; no API key is needed for the public catalog lookup.
- Keep the existing camera scanning and manual entry components unchanged; route their result to the live lookup and retain the demo codes as demo records.
