/*
  Engine: (1) pulls a profile out of plain text (English / Telugu / Hindi keywords),
          (2) evaluates scheme rules deterministically, with reasoning.
  No Aadhaar or ID numbers are read or stored. To use an LLM later, replace extract() only;
  the matching below must stay plain code so every result can be explained.
*/
(function (root) {
  'use strict';

  function parseIncome(t) {
    let val = null;
    let m = t.match(/(\d+(?:\.\d+)?)\s*(?:lakhs?|lacs?|lpa|లక్షల?|లక్ష|लाख)/i);
    if (m) {
      val = parseFloat(m[1]) * 100000;
    } else {
      m = t.match(/(\d{1,3}(?:,\d{2,3})+|\d{5,7})/);
      if (m) val = parseInt(m[1].replace(/,/g, ''), 10);
    }
    if (val === null) return null;
    if (/per month|monthly|a month|\/\s*month|నెలకు|महीने|प्रति माह/i.test(t)) val *= 12;
    return val;
  }

  // Returns { profile, redacted } where redacted is true if an Aadhaar-like number was removed.
  function extract(raw) {
    let text = String(raw || '');
    let redacted = false;
    const idLike = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
    if (idLike.test(text)) { redacted = true; text = text.replace(idLike, ' '); }
    const t = ' ' + text.toLowerCase() + ' ';
    const p = {};

    if (/telangana|hyderabad|warangal|karimnagar|nizamabad|khammam|nalgonda|తెలంగాణ|హైదరాబాద్|तेलंगाना|हैदराबाद/.test(t)) p.state = 'Telangana';
    else if (/andhra|karnataka|maharashtra|tamil nadu|kerala|odisha|bihar|uttar pradesh/.test(t)) p.state = 'Another state';

    if (/\bebc\b|economically backward|\bgeneral\b|\boc\b|forward caste|ఓసీ|सामान्य/.test(t)) p.category = 'OC';
    else if (/\bsc\b|scheduled caste|dalit|ఎస్సీ|अनुसूचित जाति/.test(t)) p.category = 'SC';
    else if (/\bst\b|scheduled tribe|tribal|adivasi|ఎస్టీ|आदिवासी|जनजाति/.test(t)) p.category = 'ST';
    else if (/\bbc\b|\bobc\b|backward|బీసీ|ఓబీసీ|पिछड़ा|पिछड़े/.test(t)) p.category = 'BC';

    if (/muslim|christian|sikh|buddhist|jain\b|parsi|zoroastrian|minority|ముస్లిం|క్రిస్టియన్|मुस्लिम|ईसाई|सिख/.test(t)) p.minority = true;

    const inc = parseIncome(text);
    if (inc !== null) p.income = inc;

    if (/post.?graduat|\bpg\b|m\.?tech|\bmba\b|\bmca\b|m\.?sc\b|m\.a\b|m\.?com\b|పీజీ|एम\.?टेक|पीजी/.test(t)) p.level = 'pg';
    else if (/degree|b\.?tech|b\.e\b|b\.?sc|b\.?com|b\.a\b|\bbca\b|\bbba\b|engineering|mbbs|b\.?pharm|డిగ్రీ|బీటెక్|बी\.?टेक|डिग्री/.test(t)) p.level = 'degree';
    else if (/diploma|polytechnic|డిప్లొమా|डिप्लोमा/.test(t)) p.level = 'diploma';
    else if (/intermediate|class 1[12]|1[12]th|\binter\b|ఇంటర్|12वीं|११वीं/.test(t)) p.level = 'intermediate';

    if (/top 20|top twenty|80th percentile|above 80 percentile|state ranker|topper/.test(t)) p.top20 = true;

    if (/no disabilit|not disabled|without disabilit/.test(t)) p.disability40 = false;
    else if (/disab|handicap|divyang|వికలాంగ|विकलांग|दिव्यांग/.test(t)) {
      const m = t.match(/(\d{2,3})\s*(?:%|percent|per cent)/);
      if (m) p.disability40 = parseInt(m[1], 10) >= 40;
    }
    return { profile: p, redacted };
  }

  function evalRule(rule, profile) {
    const v = profile[rule.field];
    if (v === undefined || v === null || v === '') return 'unknown';
    let ok;
    switch (rule.op) {
      case 'eq': ok = v === rule.value; break;
      case 'in': ok = Array.isArray(rule.value) && rule.value.indexOf(v) !== -1; break;
      case 'lte': ok = Number(v) <= Number(rule.value); break;
      case 'gte': ok = Number(v) >= Number(rule.value); break;
      default: return 'unknown';
    }
    return ok ? 'pass' : 'fail';
  }

  function matchScheme(scheme, profile) {
    const results = scheme.rules.map((rule) => ({ rule, status: evalRule(rule, profile) }));
    let status = 'likely';
    if (results.some((r) => r.status === 'fail')) status = 'no';
    else if (results.some((r) => r.status === 'unknown')) status = 'maybe';
    return { scheme, status, results };
  }

  function matchAll(data, profile) {
    return data.schemes.map((s) => matchScheme(s, profile));
  }

  // The unknown field that the most still-possible schemes depend on (and was not skipped).
  function nextQuestion(matches, skipped) {
    const counts = {};
    matches.forEach((m) => {
      if (m.status === 'no') return;
      m.results.forEach((r) => {
        if (r.status === 'unknown' && skipped.indexOf(r.rule.field) === -1) {
          counts[r.rule.field] = (counts[r.rule.field] || 0) + 1;
        }
      });
    });
    const keys = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    return keys[0] || null;
  }

  root.Engine = { extract, evalRule, matchScheme, matchAll, nextQuestion };
})(globalThis);
