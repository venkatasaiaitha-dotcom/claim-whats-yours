(function () {
  'use strict';
  const E = globalThis.Engine;
  const LS_DATA = 'cwy_data_v1';
  const LS_TRACK = 'cwy_track_v1';
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const load = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch (e) { return fb; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage may be blocked */ } };

  let data = load(LS_DATA, null) || clone(globalThis.SCHEME_DATA);
  let tracker = load(LS_TRACK, []);
  let profile = {};
  let skipped = [];
  let analysed = false;

  const STATUS = [
    ['not_started', 'Not started'], ['collecting_docs', 'Collecting documents'], ['applied', 'Applied'],
    ['under_review', 'Under review'], ['sanctioned', 'Sanctioned / money received'], ['rejected', 'Rejected / needs a fix']
  ];
  const SUBMITTED = ['applied', 'under_review', 'sanctioned', 'rejected'];
  const SAMPLES = [
    'I am a 19 year old girl from Warangal, Telangana. I study B.Tech first year. We are BC and my father is a farmer. Family income is about 1.5 lakh a year.',
    'నేను తెలంగాణలో డిగ్రీ చదువుతున్నాను. మా కుటుంబం ఎస్సీ. ఏడాదికి ఆదాయం 2 లక్షలు.',
    'मैं हैदराबाद में बी.टेक कर रहा हूँ। हमारा परिवार मुस्लिम है और सालाना आमदनी 3 लाख है।'
  ];

  const $ = (id) => document.getElementById(id);
  const today = () => new Date().toISOString().slice(0, 10);
  const daysUntil = (d) => Math.round((Date.parse(d + 'T00:00:00') - Date.parse(today() + 'T00:00:00')) / 864e5);
  const money = (n) => '₹' + Number(n).toLocaleString('en-IN');
  const fieldInfo = (f) => data.fields[f] || { label: f, type: 'text' };

  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v === false || v == null) return;
      if (k === 'class') el.className = v;
      else if (k === 'value') el.value = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    });
    kids.flat(Infinity).forEach((kid) => {
      if (kid == null || kid === false) return;
      el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    });
    return el;
  }

  function toast(msg) {
    const t = $('toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast.t);
    toast.t = setTimeout(() => { t.hidden = true; }, 2200);
  }

  // ---------- formatting helpers ----------
  function optLabel(field, v) {
    const f = fieldInfo(field);
    return (f.option_labels && f.option_labels[v]) || String(v);
  }
  function fmtValue(field, v) {
    const f = fieldInfo(field);
    if (f.type === 'money') return money(v);
    if (f.type === 'boolean') return v ? 'Yes' : 'No';
    return optLabel(field, v);
  }
  function describeRule(rule) {
    const f = fieldInfo(rule.field);
    const lbl = f.rule_label || f.label;
    if (f.type === 'boolean') return rule.value ? lbl : 'NOT: ' + lbl;
    const ops = { eq: 'is', in: 'is one of', lte: 'is at most', gte: 'is at least' };
    const val = Array.isArray(rule.value) ? rule.value.map((x) => optLabel(rule.field, x)).join(', ') : fmtValue(rule.field, rule.value);
    return lbl + ' ' + (ops[rule.op] || rule.op) + ' ' + val;
  }
  function fmtDate(d) {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function verifiedBadge(s) {
    if (!s.last_verified) return h('span', { class: 'badge warn' }, 'Not yet verified (sample data)');
    const age = (Date.now() - Date.parse(s.last_verified)) / 864e5;
    return h('span', { class: 'badge ' + (age > 90 ? 'warn' : 'ok') },
      'Last verified ' + fmtDate(s.last_verified) + (age > 90 ? ' - may be outdated, recheck' : ''));
  }
  const safeUrl = (u) => (/^https:\/\//.test(u || '') ? u : null);

  // ---------- find view ----------
  function analyse() {
    const text = $('story').value;
    if (!text.trim()) { toast('Please describe your situation first'); return; }
    const out = E.extract(text);
    profile = out.profile;
    skipped = [];
    analysed = true;
    const warn = $('warn');
    if (out.redacted) {
      warn.hidden = false;
      warn.textContent = 'We spotted a number that looks like an ID (Aadhaar). It was ignored and not stored. You never need to type it here.';
      $('story').value = text.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[removed]');
    } else {
      warn.hidden = true;
    }
    renderAll();
  }

  function renderUnderstood() {
    const box = $('understood');
    box.innerHTML = '';
    const keys = Object.keys(profile).filter((k) => profile[k] !== undefined);
    if (!analysed) { box.hidden = true; return; }
    box.hidden = false;
    box.append(h('strong', {}, 'What we understood'));
    if (!keys.length) {
      box.append(h('p', { class: 'empty' }, 'We could not pick out details yet. No problem: we will ask a few short questions below.'));
      return;
    }
    box.append(h('div', { class: 'chips' }, keys.map((k) =>
      h('span', { class: 'chip' }, fieldInfo(k).label + ': ' + fmtValue(k, profile[k]),
        h('button', { title: 'Wrong? Remove it and answer again', onclick: () => { delete profile[k]; skipped = skipped.filter((x) => x !== k); renderAll(); } }, '×')))));
  }

  function renderQuestion(matches) {
    const box = $('question');
    box.innerHTML = '';
    if (!analysed) { box.hidden = true; return; }
    const key = E.nextQuestion(matches, skipped);
    if (!key) { box.hidden = true; return; }
    box.hidden = false;
    const f = fieldInfo(key);
    const answer = (v) => { profile[key] = v; renderAll(); };
    let input;
    if (f.type === 'choice') {
      input = h('div', { class: 'choices' }, f.options.map((o) => h('button', { class: 'btn', onclick: () => answer(o) }, optLabel(key, o))));
    } else if (f.type === 'boolean') {
      input = h('div', { class: 'choices' },
        h('button', { class: 'btn', onclick: () => answer(true) }, 'Yes'),
        h('button', { class: 'btn', onclick: () => answer(false) }, 'No'));
    } else {
      const inp = h('input', { type: 'number', min: '0', placeholder: 'e.g. 150000' });
      input = h('div', { class: 'choices' }, inp,
        h('button', { class: 'btn primary', onclick: () => { const n = parseFloat(inp.value); if (!isNaN(n) && n >= 0) answer(n); } }, 'Save'));
    }
    box.append(h('strong', {}, 'One more detail, so we can check your rules properly'),
      h('p', {}, f.question || ('Please tell us: ' + f.label)), input,
      h('button', { class: 'btn link', onclick: () => { skipped.push(key); renderAll(); } }, "I'm not sure / skip this"));
  }

  function card(m) {
    const s = m.scheme;
    const tracked = tracker.some((t) => t.id === s.id);
    const label = { likely: 'Likely eligible', maybe: 'Possibly eligible: need more info', no: 'Does not match' }[m.status];
    const why = m.results.map((r) => {
      const known = profile[r.rule.field] !== undefined && profile[r.rule.field] !== null && profile[r.rule.field] !== '';
      return h('li', { class: r.status },
        describeRule(r.rule),
        known ? h('span', { class: 'said' }, ' (you said: ' + fmtValue(r.rule.field, profile[r.rule.field]) + ')')
          : h('span', { class: 'said' }, ' (not known yet)'));
    });
    const link = safeUrl(s.url);
    const details = h('details', {},
      h('summary', {}, 'Documents you need and how to apply'),
      h('h4', {}, 'Your document checklist'),
      h('ul', {}, (s.documents || []).map((d) => h('li', {}, d.name, h('div', { class: 'docwhere' }, 'Where: ' + d.where)))),
      h('h4', {}, 'How to apply, step by step'),
      h('ol', {}, (s.steps || []).map((x) => h('li', {}, x))),
      s.deadline_note ? h('p', { class: 'docwhere' }, 'Deadline: ' + (s.deadline ? fmtDate(s.deadline) + '. ' : '') + s.deadline_note) : null);
    return h('article', { class: 'card ' + m.status },
      h('div', { class: 'card-top' }, h('h3', {}, s.name), h('span', { class: 'pill ' + m.status }, label)),
      h('p', { class: 'meta' }, s.authority + ' · ' + s.benefit),
      h('p', { class: 'meta' }, 'Why: each line is a rule from this scheme'),
      h('ul', { class: 'why' }, why),
      h('p', { class: 'source' }, 'Official source: ',
        link ? h('a', { href: link, target: '_blank', rel: 'noopener noreferrer' }, link) : 'not available', ' · ', verifiedBadge(s)),
      m.status === 'no' ? null : details,
      m.status === 'no' ? null : h('div', { class: 'actions' },
        h('button', { class: 'btn primary', disabled: tracked, onclick: () => track(s) }, tracked ? 'Tracking ✓' : 'Track this application')));
  }

  function renderResults(matches) {
    const box = $('results');
    box.innerHTML = '';
    if (!analysed) return;
    const likely = matches.filter((m) => m.status === 'likely');
    const maybe = matches.filter((m) => m.status === 'maybe');
    const no = matches.filter((m) => m.status === 'no');
    box.append(h('h2', { class: 'group' }, 'Likely eligible (' + likely.length + ')'));
    if (!likely.length) box.append(h('p', { class: 'empty' }, 'None confirmed yet. Answer the question above or see the possible matches below.'));
    likely.forEach((m) => box.append(card(m)));
    if (maybe.length) {
      box.append(h('h2', { class: 'group' }, 'Possibly eligible, need more details (' + maybe.length + ')'));
      maybe.forEach((m) => box.append(card(m)));
    }
    if (no.length) {
      box.append(h('details', {}, h('summary', {}, 'Schemes that do not match, and why (' + no.length + ')'), no.map(card)));
    }
    box.append(h('p', { class: 'source' }, 'These are indications based on the rules we hold, not a decision. The department makes the final decision.'));
  }

  function renderAll() {
    const matches = E.matchAll(data, profile);
    renderUnderstood();
    renderQuestion(matches);
    renderResults(matches);
    renderTracker();
    updateTab();
  }

  // ---------- tracker ----------
  function track(s) {
    if (tracker.some((t) => t.id === s.id)) return;
    tracker.push({ id: s.id, name: s.name, status: 'not_started', deadline: s.deadline || '', docsDone: [], added: today(), appliedOn: null });
    save(LS_TRACK, tracker);
    toast('Added to My tracker');
    renderAll();
  }

  function alertsFor(t) {
    const out = [];
    if (t.deadline && SUBMITTED.indexOf(t.status) === -1) {
      const d = daysUntil(t.deadline);
      if (d < 0) out.push({ late: true, text: t.name + ': deadline passed ' + (-d) + ' day(s) ago. Check the portal for a extension or next round.'.replace('a extension', 'an extension') });
      else if (d <= 14) out.push({ late: d <= 3, text: t.name + ': deadline in ' + d + ' day(s) (' + fmtDate(t.deadline) + ').' });
    }
    if ((t.status === 'applied' || t.status === 'under_review') && t.appliedOn && -daysUntil(t.appliedOn) >= 14) {
      out.push({ late: false, text: t.name + ': applied ' + (-daysUntil(t.appliedOn)) + ' days ago. Time to check the status on the portal.' });
    }
    return out;
  }

  function icsFor(t) {
    const d = t.deadline.replace(/-/g, '');
    const nx = new Date(Date.parse(t.deadline + 'T00:00:00Z') + 864e5).toISOString().slice(0, 10).replace(/-/g, '');
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Claim Whats Yours//EN', 'BEGIN:VEVENT',
      'UID:' + t.id + '-' + d + '@claim-whats-yours', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z',
      'DTSTART;VALUE=DATE:' + d, 'DTEND;VALUE=DATE:' + nx, 'SUMMARY:Deadline: ' + t.name.replace(/[,;]/g, ' '),
      'DESCRIPTION:Submit the application on the official portal before this date.',
      'BEGIN:VALARM', 'TRIGGER:-P7D', 'ACTION:DISPLAY', 'DESCRIPTION:Scholarship deadline in 7 days', 'END:VALARM',
      'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:Scholarship deadline tomorrow', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'];
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
    const a = h('a', { href: URL.createObjectURL(blob), download: t.id + '-deadline.ics' });
    document.body.append(a); a.click(); a.remove();
  }

  function renderTracker() {
    const box = $('view-track');
    box.innerHTML = '';
    const alerts = tracker.flatMap(alertsFor);
    box.append(h('div', { class: 'panel' }, h('strong', {}, 'My applications'),
      h('p', { class: 'meta' }, 'Saved only in this browser. Reminders show here; "Add to calendar" gives you phone alerts 7 days and 1 day before.')));
    alerts.forEach((a) => box.append(h('div', { class: 'alert' + (a.late ? ' late' : '') }, '⏰ ' + a.text)));
    if (!tracker.length) box.append(h('p', { class: 'empty' }, 'Nothing tracked yet. Use "Track this application" on a scheme.'));
    tracker.forEach((t) => {
      const s = data.schemes.find((x) => x.id === t.id);
      const docs = (s && s.documents) || [];
      const done = docs.filter((d) => t.docsDone.indexOf(d.name) !== -1).length;
      const update = () => { save(LS_TRACK, tracker); renderTracker(); updateTab(); };
      box.append(h('article', { class: 'card' },
        h('h3', {}, t.name),
        h('div', { class: 'track-grid' },
          h('div', {}, h('label', {}, 'Status'),
            h('select', { onchange: (e) => { t.status = e.target.value; if (t.status === 'applied' && !t.appliedOn) t.appliedOn = today(); update(); } },
              STATUS.map(([v, l]) => h('option', { value: v, selected: t.status === v }, l)))),
          h('div', {}, h('label', {}, 'Deadline'),
            h('input', { type: 'date', value: t.deadline || '', onchange: (e) => { t.deadline = e.target.value; update(); } }))),
        docs.length ? h('div', { class: 'docs' }, h('strong', {}, 'Documents ready: ' + done + ' of ' + docs.length),
          docs.map((d) => h('label', {}, h('input', {
            type: 'checkbox', checked: t.docsDone.indexOf(d.name) !== -1,
            onchange: (e) => { t.docsDone = e.target.checked ? t.docsDone.concat(d.name) : t.docsDone.filter((x) => x !== d.name); save(LS_TRACK, tracker); renderTracker(); }
          }), d.name))) : null,
        h('div', { class: 'actions' },
          t.deadline ? h('button', { class: 'btn', onclick: () => icsFor(t) }, '📅 Add to calendar') : null,
          s && safeUrl(s.url) ? h('a', { class: 'btn', href: s.url, target: '_blank', rel: 'noopener noreferrer' }, 'Open official portal') : null,
          h('button', { class: 'btn', onclick: () => { tracker = tracker.filter((x) => x !== t); update(); renderAll(); } }, 'Stop tracking'))));
    });
  }

  function updateTab() {
    const n = tracker.flatMap(alertsFor).length;
    $('tab-track').textContent = 'My tracker' + (tracker.length ? ' (' + tracker.length + ')' : '') + (n ? ' ⏰' + n : '');
  }

  // ---------- admin view ----------
  function renderAdmin() {
    const box = $('view-admin');
    box.innerHTML = '';
    const persist = () => { save(LS_DATA, data); toast('Saved'); if (analysed) renderAll(); };
    box.append(h('div', { class: 'panel' }, h('strong', {}, 'Scheme rules are data'),
      h('p', { class: 'meta' }, 'When a department changes a limit, edit it here (or in schemes-data.js). Results update immediately. Mark a scheme as verified once you have checked the official source.')));
    const rows = data.schemes.map((s) => {
      const limits = s.rules.filter((r) => (r.op === 'lte' || r.op === 'gte') && typeof r.value === 'number');
      return h('tr', {},
        h('td', {}, h('strong', {}, s.name), h('div', { class: 'docwhere' }, s.id)),
        h('td', {}, limits.map((r) => h('div', {}, h('div', { class: 'docwhere' }, describeRule({ field: r.field, op: r.op, value: '' }).trim()),
          h('input', { type: 'number', value: r.value, onchange: (e) => { const n = parseFloat(e.target.value); if (!isNaN(n)) { r.value = n; persist(); } } })))),
        h('td', {}, h('input', { type: 'date', value: s.deadline || '', onchange: (e) => { s.deadline = e.target.value || null; persist(); } })),
        h('td', {}, h('input', { type: 'date', value: s.last_verified || '', onchange: (e) => { s.last_verified = e.target.value || null; persist(); renderAdmin(); } }),
          h('div', {}, h('button', { class: 'btn small', onclick: () => { s.last_verified = today(); persist(); renderAdmin(); } }, 'Verified today'))));
    });
    box.append(h('div', { class: 'panel' }, h('table', {},
      h('thead', {}, h('tr', {}, h('th', {}, 'Scheme'), h('th', {}, 'Limits'), h('th', {}, 'Deadline'), h('th', {}, 'Last verified'))),
      h('tbody', {}, rows))));
    const ta = h('textarea', { rows: 14, spellcheck: 'false' });
    ta.value = JSON.stringify(data, null, 2);
    box.append(h('div', { class: 'panel' }, h('strong', {}, 'Raw rules (JSON): add or remove schemes and rules'), ta,
      h('div', { class: 'row' },
        h('button', { class: 'btn primary', onclick: () => {
          try {
            const obj = JSON.parse(ta.value);
            if (!obj || !Array.isArray(obj.schemes) || typeof obj.fields !== 'object') throw new Error('Need "fields" and a "schemes" list');
            data = obj; persist(); renderAdmin();
          } catch (e) { toast('Invalid JSON: ' + e.message); }
        } }, 'Apply JSON'),
        h('button', { class: 'btn', onclick: () => { data = clone(globalThis.SCHEME_DATA); try { localStorage.removeItem(LS_DATA); } catch (e) {} toast('Reset to defaults'); renderAdmin(); if (analysed) renderAll(); } }, 'Reset to defaults'))));
  }

  // ---------- speech ----------
  function setupMic() {
    const SR = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
    const btn = $('mic');
    if (!SR) { btn.hidden = true; $('lang').hidden = true; return; }
    let rec = null;
    btn.addEventListener('click', () => {
      if (rec) { rec.stop(); return; }
      rec = new SR();
      rec.lang = $('lang').value;
      rec.interimResults = false;
      rec.onresult = (e) => {
        const said = Array.from(e.results).map((r) => r[0].transcript).join(' ');
        const ta = $('story');
        ta.value = (ta.value ? ta.value + ' ' : '') + said;
      };
      rec.onend = () => { rec = null; btn.textContent = '🎤 Speak'; };
      rec.onerror = () => { toast('Could not hear you. Please try again or type.'); };
      btn.textContent = '⏹ Stop';
      rec.start();
    });
  }

  // ---------- init ----------
  document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('active', x === b));
    ['find', 'track', 'admin'].forEach((v) => { $('view-' + v).hidden = v !== b.dataset.view; });
    if (b.dataset.view === 'admin') renderAdmin();
    if (b.dataset.view === 'track') renderTracker();
  }));
  $('analyse').addEventListener('click', analyse);
  document.querySelectorAll('[data-sample]').forEach((b) => b.addEventListener('click', () => {
    $('story').value = SAMPLES[Number(b.dataset.sample)];
    analyse();
  }));
  setupMic();
  renderTracker();
  updateTab();
})();
