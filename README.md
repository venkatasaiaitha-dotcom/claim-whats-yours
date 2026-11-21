# Claim What's Yours (Telangana student scholarships)

Plain HTML/CSS/JS. No install, no backend, no API key.

## Run
Put all files in one folder in the Codebenders IDE and open `index.html` in the preview or browser
(or use a Live Server extension / `python -m http.server`).

## Files
- `schemes-data.js`: scheme rules as editable data (eligibility rules, documents, steps, source URL, last_verified, deadline)
- `engine.js`: plain-language extraction (English/Telugu/Hindi keywords) and deterministic rule matching
- `app.js`, `index.html`, `style.css`: UI, follow-up questions, results with reasoning, tracker, admin editor

## Demo flow
1. Click a sample profile (or type/speak) -> "What we understood" chips
2. Follow-up question appears only for details that still matter
3. Results: "Likely eligible" / "Possibly eligible", each rule with a tick/cross, official link, verified date
4. Open "Documents you need and how to apply" -> Track this application
5. My tracker: status, deadline, document ticks, reminders, .ics calendar alerts
6. Admin tab: change an income limit, re-run, and the results change. Click "Verified today".

## Guardrails built in
- Says "likely eligible", never guaranteed
- No Aadhaar/ID fields; 12-digit ID-like numbers typed into the box are removed and warned about
- Rules are data; sample profiles only

## Important
All scheme rules are SAMPLE data and `last_verified` is null on purpose. Check each rule against the
official portal and set the date before presenting it as accurate.

## Next steps
Swap `Engine.extract()` for an LLM call (keep matching as code), add WhatsApp/SMS reminders via a small backend, add more states/groups.
