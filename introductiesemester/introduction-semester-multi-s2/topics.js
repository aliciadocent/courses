// Multisemester 2: tabellen per topic opbouwen uit de JSON-bestanden in data/
// en filteren op de topics die je kiest. De keuze staat in de URL (?topics=sde,bda,im),
// zodat je een gefilterde pagina kunt delen.
(function () {
  const DATA = 'data/';
  let topics = [];   // in de volgorde van data/topics.json
  let team = { activiteiten: {} };
  let selected = new Set();

  const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const getJson = (path) => fetch(DATA + path).then((r) => {
    if (!r.ok) throw new Error(path + ' (' + r.status + ')');
    return r.json();
  });

  async function load() {
    const manifest = await getJson('topics.json');
    topics = await Promise.all(manifest.topics.map((id) => getJson('topics/' + id + '.json').then((t) => ({ ...t, id }))));
    team = await getJson('team.json').catch(() => team);
    const fromUrl = new URLSearchParams(location.search).get('topics');
    const ids = fromUrl ? fromUrl.toLowerCase().split(',') : topics.map((t) => t.id);
    selected = new Set(ids.filter((id) => topics.some((t) => t.id === id)));
    renderChips();
    render();
  }

  function renderChips() {
    const box = document.getElementById('topic-chips');
    box.innerHTML = topics.map((t) =>
      `<label class="topic-chip"><input type="checkbox" value="${esc(t.id)}"${selected.has(t.id) ? ' checked' : ''}>` +
      `<b>${esc(t.code)}</b><span>${esc(t.naam)}</span></label>`).join('');
    box.addEventListener('change', (e) => {
      if (e.target.checked) selected.add(e.target.value); else selected.delete(e.target.value);
      render();
    });
    document.querySelectorAll('[data-select]').forEach((btn) => btn.addEventListener('click', () => {
      selected = btn.dataset.select === 'all' ? new Set(topics.map((t) => t.id)) : new Set();
      box.querySelectorAll('input').forEach((i) => { i.checked = selected.has(i.value); });
      render();
    }));
  }

  const chosen = () => topics.filter((t) => selected.has(t.id));
  const table = (head, rows) => rows.length
    ? `<div class="table-wrap"><table><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`
    : '<p class="small">Kies hierboven een of meer topics.</p>';

  function renderRollen() {
    return table(['Topic', 'Verantwoordelijk voor'],
      chosen().map((t) => `<tr><td><strong>${esc(t.naam)} (${esc(t.code)})</strong></td><td>${esc(t.rol)}</td></tr>`));
  }

  function renderTheorie(act) {
    return table(['Topic', 'Theorie', 'Product (hoofdstuk in het teamdocument)'],
      chosen().filter((t) => t.activiteiten?.[act]).map((t) => {
        const a = t.activiteiten[act];
        return `<tr><td><strong>${esc(t.code)}</strong></td><td>${esc(a.theorie)}</td><td>${esc(a.product)}</td></tr>`;
      }));
  }

  // Overlap wordt afgeleid: een thema hoort bij elk topic dat het in zijn JSON noemt.
  function renderOverlap(act) {
    const themes = new Map();
    const add = (name, who) => {
      if (!themes.has(name)) themes.set(name, []);
      themes.get(name).push(who);
    };
    topics.forEach((t) => (t.activiteiten?.[act]?.overlap || []).forEach((name) => add(name, t)));
    (team.activiteiten?.[act]?.overlap || []).forEach((name) => add(name, { id: 'team', code: 'team' }));

    const n = selected.size;
    const rows = [...themes].map(([name, who]) => {
      const inTeam = who.some((w) => w.id === 'team');
      const hits = who.filter((w) => selected.has(w.id)).length;
      return { name, who, inTeam, hits };
    }).filter((r) => r.inTeam || (n >= 2 ? r.hits >= 2 : r.hits >= 1 && r.who.length >= 2))
      .sort((a, b) => b.hits - a.hits || b.who.length - a.who.length);

    if (!n) return '<p class="small">Kies hierboven een of meer topics.</p>';
    const tags = (who) => who.map((w) => {
      const cls = w.id === 'team' ? 'team' : selected.has(w.id) ? 'on' : 'off';
      return `<span class="topic-tag ${cls}">${esc(w.code)}</span>`;
    }).join(' ');
    const note = n >= 2
      ? '<p class="small">Thema\'s die minstens twee van de gekozen topics delen, plus thema\'s voor het hele team. Grijze topics zitten niet in je selectie.</p>'
      : '<p class="small">Thema\'s die dit topic deelt met andere topics.</p>';
    if (!rows.length) return '<p class="small">Geen overlap tussen de gekozen topics in deze activiteit.</p>';
    return note + table(['Overlappend thema', 'Topics'],
      rows.map((r) => `<tr><td><strong>${esc(r.name)}</strong></td><td class="topic-tags">${tags(r.who)}</td></tr>`));
  }

  function render() {
    document.querySelectorAll('[data-render]').forEach((el) => {
      const act = el.dataset.activiteit;
      el.innerHTML = el.dataset.render === 'rollen' ? renderRollen()
        : el.dataset.render === 'theorie' ? renderTheorie(act)
        : renderOverlap(act);
    });
    const codes = chosen().map((t) => t.code);
    document.getElementById('topic-summary').textContent =
      codes.length === topics.length ? 'Alle topics zichtbaar.' : codes.length ? 'Gekozen: ' + codes.join(', ') : 'Geen topics gekozen.';
    const url = new URL(location.href);
    if (codes.length === topics.length) url.searchParams.delete('topics');
    else url.searchParams.set('topics', [...selected].join(','));
    history.replaceState(null, '', url);
  }

  load().catch((err) => {
    const msg = '<div class="box warn"><p class="box-title">Topics konden niet laden</p>' +
      '<p>' + esc(err.message) + '. Open je de pagina als los bestand op je computer? Dan blokkeert de browser het inlezen van de JSON-bestanden. ' +
      'Bekijk hem via Vercel of een lokale server, bijvoorbeeld de Live Server-extensie in VS Code.</p></div>';
    document.getElementById('topic-chips').innerHTML = msg;
    document.querySelectorAll('[data-render]').forEach((el) => { el.innerHTML = ''; });
  });
})();
