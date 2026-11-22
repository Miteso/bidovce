import { createClient } from "npm:@supabase/supabase-js@2.45.4";

// Schranka objednavok pre pizzerie (Miteso).
// POST  ?ka=kluc_agent                  -> ulozi objednavku od hlasoveho agenta (pizzeria sa urci podla agent_id v tele, inak podla kluca)
// POST  ?init=1                         -> ElevenLabs webhook na zaciatku hovoru (uvodna veta podla otvaracich hodin + predosly hovor do 60 min podla cisla)
// POST  ?postcall=1                     -> ElevenLabs webhook po hovore; pizzeria sa urci podla agent_id (pizzerie.agent_id)
// GET   ?k=kluc_tlac                    -> poslednych 50 objednavok (len na citanie)
// GET   ?k=kluc_tlac&den=YYYY-MM-DD     -> objednavky (blocky) vybraneho dna [stranka obsluhy]
// GET   ?k=kluc_tlac&prehlad=1&den=     -> prehlad dna + spotreba minut hovorov (den aj mesiac) [stranka obsluhy]
// GET   ?k=kluc_tlac&nove=1&format=text -> nevytlacene objednavky + denne suhrny ako text na blocek (oznaci ako vytlacene) [MacroDroid]
// GET   ?k=kluc_tlac&pi=1               -> cakajuce blocky pre tlacove zariadenie (neoznacuje) + ping [Raspberry Pi]; pocet kopii podla pizzerie
// POST  ?k=kluc_tlac&pi=potvrd          -> {o:[id], s:[id]} oznaci vytlacene po uspesnej tlaci [Raspberry Pi]
// GET   ?ka=kluc_agent&vypredane=1      -> dnes vypredane polozky + meskanie + otvorene (text pre agenta)
// GET   ?k=kluc_tlac&vypredane=1        -> dnes vypredane polozky + meskanie + ponuka (JSON pre stranku obsluhy)
// POST  ?k=kluc_tlac&vypredane=1        -> body {zoznam:[...]} ulozi vypredane polozky na dnes
//                                          body {meskanie: minuty} ulozi meskanie na dnes
//                                          body {oznam: text} ulozi oznam obsluhy pre agenta na dnes

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-kluc",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const json = (d: unknown, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" } });
const bezDiakritiky = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const eur = (x: unknown) => x == null ? null : Number(x).toFixed(2).replace(".", ",") + " EUR";
// ESC/POS: tucne pismo zap/vyp (len pre tlac cez RawBT)
const TUCNE = "\x1bE\x01", NORMAL = "\x1bE\x00";
// GS ! n: velkost pisma. VYSOKE = dvojita vyska (32 znakov na riadok), VELKE = dvojita vyska aj sirka (16 znakov)
const VYSOKE = "\x1d!\x01", VELKE = "\x1d!\x11", BEZNE = "\x1d!\x00";

function blocek(o: any, nazov: string, esc = false) {
  const cas = new Date(o.prijata).toLocaleString("sk-SK", { timeZone: "Europe/Bratislava", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  // zvyraznene: velke + tucne, potom spat na vysoke pismo
  const z = (t: string) => esc ? `${VELKE}${TUCNE}${t}${NORMAL}${VYSOKE}` : t;
  const hm = (d: unknown) => new Date(String(d)).toLocaleTimeString("sk-SK", { timeZone: "Europe/Bratislava", hour: "2-digit", minute: "2-digit" });
  const rozvoz = /rozvoz/i.test(o.sposob ?? "");
  // agent nevedel spravne zachytit cislo alebo adresu -> obsluha musi zavolat
  const pozn = bezDiakritiky(String(o.poznamka ?? "")).toUpperCase();
  const overit = o.zrusena || o.nedokoncena ? "" : [
    /OVERIT TELEFON/.test(pozn) || /volal z/i.test(o.telefon ?? "") || /SKRYTE CISLO/i.test(o.telefon ?? "") ? "overit tel. cislo" : "",
    /OVERIT ADRES/.test(pozn) ? "overit adresu" : "",
    /NEUPLNE/.test(pozn) ? "neuplna objednavka - doplnit" : "",
    /OVERIT OBEC/.test(pozn) ? "overit obec" : "",
    /MINULE VOZENE NA|- OVERIT, MINULE/.test(pozn) ? "adresa ina ako minule" : "",
    /POVODNU OBJEDNAVKU SOM NENASLA/.test(pozn) ? "povodnu objednavku som nenasla" : "",
  ].filter(Boolean).join(", ");
  const zmena = o.zmena_k != null;
  const oprava = /^\s*OPRAVA/i.test(String(o.poznamka ?? ""));
  const neodoslana = o.nedokoncena && /^NEODOSLANA/.test(String(o.poznamka ?? ""));
  const ziadost = o.nedokoncena && /^ZAKAZNIK ZIADA ZAVOLAT/.test(String(o.poznamka ?? ""));
  const r = [
    ...(o.test ? [z("*** TEST ***"), z("NEPRIPRAVOVAT")] : []),
    ...(o.zrusena ? [z("!!!!!!!!!!!!!!!!"), z("ZRUSENA"), z(`OBJEDNAVKA c.${o.cislo}`), z("NEPRIPRAVOVAT"), z("NEVOZIT"), z("!!!!!!!!!!!!!!!!"), ""] : []),
    ...(neodoslana ? [z("!!!!!!!!!!!!!!!!"), z("ZAVOLAT"), z("ZAKAZNIKOVI"), z("OBJEDNAVKA"), z("NEODOSLANA !"), z("!!!!!!!!!!!!!!!!"), "Zakaznik ocakava objednavku.", "Zavolat a potvrdit objednavku.", ""] : []),
    ...(ziadost ? [z("!!!!!!!!!!!!!!!!"), z("ZAVOLAT"), z("ZAKAZNIKOVI"), z("!!!!!!!!!!!!!!!!"), "Zakaznik ziada, aby ste mu zavolali.", ""] : []),
    ...(o.nedokoncena && !neodoslana && !ziadost ? [z("!!!!!!!!!!!!!!!!"), z("ZAVOLAT"), z("ZAKAZNIKOVI"), z("NEDOKONCENA"), z("OBJEDNAVKA"), z("!!!!!!!!!!!!!!!!"), "Objednavka nebola dokoncena - zavolajte zakaznikovi.", ""] : []),
    ...(zmena ? [z("!!!!!!!!!!!!!!!!"), z("ZMENA"), z(Number(o.zmena_k) > 0 ? `K OBJEDNAVKE c.${o.zmena_k}` : "OBJEDNAVKY"), z("!!!!!!!!!!!!!!!!"), "Upravit povodnu objednavku:", ""] : []),
    ...(oprava ? [z("!!!!!!!!!!!!!!!!"), z("OPRAVA BLOCKU"), z("PLATI TENTO,"), z("STARY ZAHODIT"), z("!!!!!!!!!!!!!!!!"), ""] : []),
    "================================",
    nazov.toUpperCase(),
    `OBJEDNAVKA c. ${o.cislo}   ${cas}`,
    "================================",
    `${o.sposob ?? ""}`,
    z(`TEL: ${o.telefon ?? "-"}`),
    z(`ADRESA: ${o.adresa ?? "-"}`),
    `MENO: ${o.meno ?? "-"}`,
    // cas: tucne vysoke pismo (nie dvojita sirka), aby sa zmestil na 1 riadok
    ...(o.cas_dorucenia && !o.zrusena ? [esc ? `${TUCNE}${rozvoz ? "DORUCIT DO" : "PRIPRAVIT DO"}: ${hm(o.cas_dorucenia)}${NORMAL}` : `${rozvoz ? "DORUCIT DO" : "PRIPRAVIT DO"}: ${hm(o.cas_dorucenia)}`] : []),
    ...(overit ? ["", z("!! ZAVOLAT ZAKAZNIKOVI !!"), z(overit), ""] : []),
    "--------------------------------",
    `${o.polozky ?? ""}`,
    "--------------------------------",
  ];
  if (o.poznamka && o.poznamka !== "-") r.push(esc ? `${TUCNE}POZNAMKA: ${o.poznamka}${NORMAL}` : `POZNAMKA: ${o.poznamka}`);
  if (o.doprava != null && Number(o.doprava) > 0) r.push(`Doprava: ${eur(o.doprava)}`);
  if (o.suma != null) r.push(z(o.zrusena ? `ZRUSENE: ${eur(o.suma)}` : `SPOLU: ${eur(o.suma)}`));
  r.push("", "", "");
  const t = bezDiakritiky(r.join("\n"));
  return esc ? `${VYSOKE}${t}${BEZNE}` : t;
}

// cislo nadiktovane v hovore (pri skrytom cisle): cislice aj slova nula..devat, najprv zakaznik, potom agent
const SLOVA: Record<string, string> = { nula: "0", jeden: "1", jedna: "1", jedno: "1", dva: "2", dve: "2", tri: "3", "štyri": "4", styri: "4", "päť": "5", pat: "5", "šesť": "6", sest: "6", sedem: "7", osem: "8", "deväť": "9", devat: "9" };
function telZPrepisu(tr: any[]): string {
  const najdi = (role: string) => {
    for (const t of [...tr].reverse()) {
      if (t.role !== role) continue;
      let s = String(t.message ?? "").toLowerCase();
      s = s.replace(/[a-záäčďéíĺľňóôŕšťúýž]+/g, (w) => SLOVA[w] ?? w);
      const m = s.replace(/[\s\-\/.,]/g, "").match(/(?:\+?421|0)9\d{8}/);
      if (m) return m[0].replace(/^\+?421/, "0");
    }
    return "";
  };
  return najdi("user") || najdi("agent");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  const url = new URL(req.url);
  try {
    // ElevenLabs: webhook na zaciatku prichadzajuceho hovoru -> uvodna veta podla otvaracich hodin + predosly hovor zakaznika
    if (url.searchParams.get("init") === "1") {
      let b: any = {};
      try { b = await req.json(); } catch { /* prazdne */ }
      const agent = String(b.agent_id ?? url.searchParams.get("agent") ?? "");
      const tel = String(b.caller_id ?? b.from_number ?? "");
      let { data, error } = await db.rpc("pizza_init", { p_agent: agent, p_tel: tel });
      if (error) {
        console.error(error);
        ({ data, error } = await db.rpc("pizza_init", { p_agent: agent }));
      }
      if (error) throw error;
      return json(data);
    }
    // ElevenLabs: post-call webhook -> ak zakaznik zlozil bez dokoncenej objednavky, vytlaci "zavolat zakaznikovi"
    if (url.searchParams.get("postcall") === "1") {
      let b: any = {};
      try { b = await req.json(); } catch { return json({ ok: true }); }
      const d = b?.data ?? {};
      if (b?.type && b.type !== "post_call_transcription") return json({ ok: true, preskocene: "typ" });
      // pizzeriu urcime podla agenta (pizzerie.agent_id); test/demo agenti nemaju pizzeriu -> preskocit
      const { data: kaAgent } = await db.rpc("pizza_kluc_pre_agenta", { p_agent: String(d.agent_id ?? "") });
      if (!kaAgent) return json({ ok: true, preskocene: "agent bez pizzerie (test/demo)" });
      const ka = String(kaAgent);
      const md = d.metadata ?? {};
      const tel = md.phone_call?.external_number ?? d.conversation_initiation_client_data?.dynamic_variables?.system__caller_id ?? "";
      const vol = md.phone_call?.external_number ?? d.conversation_initiation_client_data?.dynamic_variables?.system__caller_id ?? "";
      const volane = md.phone_call?.agent_number ?? d.conversation_initiation_client_data?.dynamic_variables?.system__called_number ?? "";
      const tr: any[] = Array.isArray(d.transcript) ? d.transcript : [];
      const nastroje = tr.flatMap((t) => (t.tool_calls ?? []).map((c: any) => String(c.tool_name ?? c.name ?? "")));
      const user = tr.filter((t) => t.role === "user" && String(t.message ?? "").trim()).map((t) => String(t.message).trim());
      const agent = tr.filter((t) => t.role === "agent" && String(t.message ?? "").trim()).map((t) => String(t.message).trim());
      const dlzka = Number(md.call_duration_secs ?? 0);
      if (!md.phone_call && !String(tel).match(/\d{6}/)) return json({ ok: true, preskocene: "nie je telefon" });
      // objednavka sa rata ako odoslana len ak ju server naozaj ulozil (nie neplatne / zamietnute / chyba)
      const vysledky = tr.flatMap((t) => (t.tool_results ?? []).filter((r: any) => /odoslat_objednavku/i.test(String(r.tool_name ?? ""))));
      const ulozena = vysledky.length
        ? vysledky.some((r: any) => !r.is_error && !/neplatne|NEBOLA|NEULOZENE|"zamietnute"\s*:\s*true/i.test(String(r.result_value ?? "")))
        : nastroje.some((n) => /odoslat_objednavku/i.test(n));
      // skryte cislo: cislo vytiahneme z prepisu hovoru (zakaznik ho nadiktoval)
      const skryte = !String(tel).match(/\d{6}/);
      const telP = skryte ? telZPrepisu(tr) : "";
      const telE = telP || tel;
      // dlzka hovoru -> spotreba minut (stranka obsluhy, pizzerie.cena_minuty)
      if (d.conversation_id) {
        const { error: eD } = await db.rpc("pizza_hovor_dlzka", { p_kluc: ka, p: { conv_id: d.conversation_id, zaciatok_unix: md.start_time_unix_secs ?? null, dlzka_s: Math.round(dlzka), telefon: telE } });
        if (eD) console.error(eD);
      }
      const od = new Date(((Number(md.start_time_unix_secs) || (Date.now() / 1000 - dlzka - 120))) * 1000).toISOString();
      const zatvorene = !vysledky.length && agent.some((m) => /m[aá]me zatvoren/i.test(m));
      // model niekedy napise volanie nastroja ako text (<invoke name="odoslat_objednavku">...) namiesto skutocneho volania
      const textVolanie = [...agent].reverse().find((m) => /<invoke\s+name="odoslat_objednavku"/i.test(m));

      // PRERUSENY HOVOR -> RIADNA OBJEDNAVKA: zakaznik nadiktoval jedla a rozvoz s adresou / osobny odber, ale zlozil skor
      // (napr. pred menom a platbou). Udaje vytiahne analyza ElevenLabs (data collection rozpracovane_*),
      // ceny, balne a akcie doplni server (pizza.doplnit_polozky). Meno / platba -> NEUVEDENE.
      let zachranena: any = null;
      if (!ulozena && !textVolanie && !zatvorene && user.length) {
        const dc = d.analysis?.data_collection_results ?? {};
        const dv = (k: string) => { const v = dc?.[k]?.value; return v == null ? "" : bezDiakritiky(String(v)).trim(); };
        const rPol = dv("rozpracovane_polozky"), rSp = dv("rozpracovany_sposob").toUpperCase(), rAdr = dv("rozpracovana_adresa");
        const rOdber = /ODBER|OSOBN/.test(rSp), rRozvoz = /ROZVOZ/.test(rSp);
        if (/\d+\s*[xX×]/.test(rPol) && (rOdber || (rRozvoz && rAdr.length >= 3))) {
          const rMeno = dv("rozpracovane_meno"), rPlat = dv("rozpracovana_platba").toUpperCase();
          const platba = /HOTOV|CASH|KES/.test(rPlat) ? "HOTOVOST" : /KART/.test(rPlat) ? "KARTA" : /STRAV|LIST|GASTR/.test(rPlat) ? "STRAVNE LISTKY" : "NEUVEDENA";
          const { data, error } = await db.rpc("pizza_prijat", { p_kluc: ka, p: {
            polozky: rPol, doplnit: "1",
            sposob: rOdber ? "ODBER" : "ROZVOZ", adresa: rOdber ? "ODBER" : rAdr,
            meno: rMeno || "NEUVEDENE", telefon: skryte && telP ? telP : "volajuci",
            poznamka: `PLATBA: ${platba} | ZAKAZNIK ZLOZIL PRED DOKONCENIM - OBJEDNAVKA PODLA HOVORU`,
            volajuci: vol, volane, agent: d.agent_id ?? "", zachrana: "1",
          } });
          if (error) console.error(error);
          else if (data?.ok && !data.neplatne && !data.zamietnute) zachranena = data;
          else console.log("zachrana neuspesna", JSON.stringify(data));
        }
      }

      // zhrnutie kazdeho hovoru -> ked zakaznik zavola z toho isteho cisla znova do 60 min, agent ho dostane (predosly_hovor)
      const zhrnutieHovoru = bezDiakritiky(String(d.analysis?.transcript_summary ?? "")).trim().slice(0, 800);
      if (zhrnutieHovoru && user.length) {
        const vysledok = ulozena ? "objednavka/poziadavka bola odoslana"
          : zachranena ? `objednavka c. ${zachranena.cislo} bola prijata podla hovoru (zakaznik zlozil skor, meno/platba mozu chybat)`
          : "objednavka NEBOLA dokoncena";
        const { error: eZ } = await db.rpc("pizza_hovor_zhrnutie", { p_kluc: ka, p: { telefon: telE, conv_id: d.conversation_id ?? null, vysledok, zhrnutie: zhrnutieHovoru } });
        if (eZ) console.error(eZ);
      }
      if (ulozena) {
        if (skryte && telP) {
          const { data } = await db.rpc("pizza_doplnit_tel", { p_kluc: ka, p_tel: telP, p_od: od });
          return json({ ok: true, preskocene: "objednavka odoslana", doplneny_tel: data });
        }
        return json({ ok: true, preskocene: "objednavka odoslana" });
      }
      if (zachranena) return json({ ok: true, zachranene_z_hovoru: true, ...zachranena });
      // -> parametre vytiahneme z textu a objednavku/ziadost ulozime na serveri
      if (textVolanie) {
        const p: Record<string, string> = {};
        for (const m of textVolanie.matchAll(/<parameter\s+name="([a-z_]+)">([\s\S]*?)<\/parameter>/gi)) p[m[1]] = m[2].trim();
        if (Object.keys(p).length) {
          const { data, error } = await db.rpc("pizza_prijat", { p_kluc: ka, p: { ...p, ...(skryte && telP && !/\d{9}/.test(p.telefon ?? "") ? { telefon: telP } : {}), volajuci: vol, volane, agent: d.agent_id ?? "", zachrana: "1" } });
          if (error) throw error;
          if (data?.ok && !data.neplatne && !data.zamietnute) return json({ ok: true, zachranene_z_textu: true, ...data });
        }
      }
      // agent povedal "objednavka je prijata", ale nastroj nezavolal -> hned vytlacime jeho rekapitulaciu
      const tvrdilPrijatu = agent.some((m) => /objedn[aá]vka je prijat/i.test(m));
      if (tvrdilPrijatu) {
        const rekap = [...agent].reverse().find((m) => /potvrdzujete|zopakujem/i.test(m)) ?? "";
        const { data, error } = await db.rpc("pizza_nedokoncena", { p_kluc: ka, p: { telefon: telE, typ: "neodoslana", text: bezDiakritiky("Rekapitulacia z hovoru: " + rekap).slice(0, 600), conv_id: d.conversation_id ?? null } });
        if (error) throw error;
        return json(data);
      }
      // zakaznik zlozil bez objednavky -> blocek "zavolat spat"
      // pravidlo prevadzky: zakaznik nepovedal nic (zlozil hned) -> nic netlacit; povedal aspon nieco -> zavolat
      if (!user.length) return json({ ok: true, preskocene: "prazdny hovor (zakaznik nic nepovedal)" });
      // volal mimo otvaracich hodin a agent mu hned povedal, ze je zatvorene (nic sa neodosielalo) -> netlacit
      if (zatvorene) return json({ ok: true, preskocene: "zatvorene" });
      const typ = user.length >= 2 && dlzka >= 15 ? "nedokoncena" : "kratky";
      // AI vyhodnotenie hovoru: volal omylom / len sa pytal a dostal odpoved -> netreba volat spat
      const chcel = d.analysis?.data_collection_results?.chcel_objednat?.value;
      if (chcel === false || String(chcel).toLowerCase() === "false") return json({ ok: true, preskocene: "nechcel objednat (vyhodnotenie)" });
      // text na blocek ZAVOLAT: vecna poznamka pre obsluhu (pole pre_obsluhu z analyzy ElevenLabs) - co zakaznik chcel.
      // Blocok vidi majitel pizzerie: nikdy hodnotenie hovoru, agenta ani nalady zakaznika -> pri takom texte len objednane polozky.
      const dcB = d.analysis?.data_collection_results ?? {};
      const dvB = (k: string) => { const v = dcB?.[k]?.value; return v == null ? "" : bezDiakritiky(String(v)).trim(); };
      const ZAKAZANE = /agent|asistent|virtual|\bAI\b|robot|nedorozum|frustr|nahnev|rozcul|nespokoj|sklam|nervoz|nepochop|nerozum|zlyha|chyb|operator|clovek|ludsk/i;
      let preObsluhu = dvB("pre_obsluhu").replace(/\s+/g, " ").slice(0, 400);
      if (/^(-|nic|ziadne|null|none|n\/a)?$/i.test(preObsluhu) || ZAKAZANE.test(preObsluhu)) {
        preObsluhu = dvB("rozpracovane_polozky").replace(/\s*\n\s*/g, ", ").slice(0, 400);
      }
      const zhrnutie = preObsluhu || null;
      const { data, error } = await db.rpc("pizza_hovor_caka", { p_kluc: ka, p: { telefon: telE, typ, dlzka, conv_id: d.conversation_id ?? null, zhrnutie } });
      if (error) throw error;
      return json(data);
    }
    // Prehlad dna pre obsluhu: GET ?k=kluc_tlac&prehlad=1[&den=YYYY-MM-DD] -> pocty objednavok, trzba, vydane jedla (pizze, burgre...)
    if (url.searchParams.get("prehlad") === "1") {
      const { data, error } = await db.rpc("pizza_prehlad", { p_kluc: url.searchParams.get("k") ?? "", p_den: url.searchParams.get("den") || null });
      if (error) throw error;
      return json(data, data.ok ? 200 : 401);
    }
    // Tlacove zariadenie (Raspberry Pi): GET ?k=kluc_tlac&pi=1 -> cakajuce blocky (neoznacuje),
    // POST ?k=kluc_tlac&pi=potvrd {o:[id], s:[id]} -> oznaci vytlacene az po uspesnej tlaci
    const pi = url.searchParams.get("pi");
    if (pi) {
      const k = url.searchParams.get("k") ?? "";
      if (req.method === "POST" && pi === "potvrd") {
        let b: any = {};
        try { b = await req.json(); } catch { return json({ ok: false, chyba: "zly format" }, 400); }
        const ids = (x: unknown) => (Array.isArray(x) ? x : []).map((v) => Math.trunc(Number(v))).filter((v) => Number.isFinite(v) && v > 0);
        const { data, error } = await db.rpc("pizza_tlac_potvrd", { p_kluc: k, p_obj: ids(b.o), p_suh: ids(b.s) });
        if (error) throw error;
        return json(data, data.ok ? 200 : 401);
      }
      const { data, error } = await db.rpc("pizza_tlac_cakajuce", { p_kluc: k, p_info: url.searchParams.get("info") });
      if (error) throw error;
      if (!data.ok) return json(data, 401);
      const polozky = [
        // pocet kopii blocku podla pizzerie (napr. 2 = kuchyna + rozvoz); testy len raz
        ...(data.objednavky as any[]).map((o) => {
          const t = blocek(o, data.pizzeria, true);
          const n = o.test ? 1 : Math.max(1, Math.min(3, Number(data.kopie) || 1));
          return { typ: "o", id: o.id, cislo: o.cislo, text: Array(n).fill(t).join("\n\n\n") };
        }),
        ...(data.suhrny as any[]).map((s) => ({ typ: "s", id: s.id, text: bezDiakritiky(String(s.text ?? "")) })),
      ];
      return json({ ok: true, pizzeria: data.pizzeria, polozky });
    }
    if (url.searchParams.get("vypredane") === "1") {
      const ka = url.searchParams.get("ka");
      const k = url.searchParams.get("k");
      if (req.method === "POST") {
        let b: any = {};
        try { b = await req.json(); } catch { return json({ ok: false, chyba: "zly format" }, 400); }
        if (b.oznam !== undefined) {
          const { data, error } = await db.rpc("pizza_oznam_uloz", { p_kluc: k ?? "", p_text: String(b.oznam ?? "").slice(0, 500) });
          if (error) throw error;
          return json(data, data.ok ? 200 : 401);
        }
        if (b.meskanie !== undefined) {
          const { data, error } = await db.rpc("pizza_meskanie_uloz", { p_kluc: k ?? "", p_min: Math.round(Number(b.meskanie) || 0) });
          if (error) throw error;
          return json(data, data.ok ? 200 : 401);
        }
        const zoznam = (Array.isArray(b.zoznam) ? b.zoznam : []).map((x: unknown) => String(x).trim().slice(0, 80)).filter(Boolean);
        const { data, error } = await db.rpc("pizza_vypredane_uloz", { p_kluc: k ?? "", p_zoznam: zoznam });
        if (error) throw error;
        return json(data, data.ok ? 200 : 401);
      }
      const { data, error } = await db.rpc("pizza_vypredane_nacitaj", { p_kluc: (ka ?? k ?? "") });
      if (error) throw error;
      if (!data.ok) return json(data, 401);
      if (ka) {
        const z = data.vypredane as string[];
        const m = Number(data.meskanie) || 0;
        const { data: otv } = await db.rpc("pizza_otvorene", { p_kluc: ka, p_grace: 0 });
        return json({
          otvorene_teraz: otv?.otvorene === false
            ? `NIE - ZATVORENE. Objednavku NEPRIJIMAJ a nic neodosielaj. Povedz: ${otv.povedz} a ukonci hovor.`
            : "ANO",
          vypredane_dnes: z.length ? z.join(", ") : "nic, vsetko je k dispozicii",
          meskanie_minut: m,
          oznam_obsluhy: (data.oznam ?? "").trim() || "ziadny",
          // pizzeria s nastavenou kuchynou: cas podla aktualnej vytazenosti (pizza.odhad_text)
          cas_dorucenia: data.cas_text ? String(data.cas_text) : m > 0
            ? `rozvoz priblizne o ${45 + m} az ${60 + m} minut, osobny odber priblizne o ${20 + m} az ${30 + m} minut (pizzeria ma dnes meskanie)`
            : "rozvoz priblizne o 45 az 60 minut, osobny odber priblizne o 20 az 30 minut",
        });
      }
      return json(data);
    }
    if (req.method === "POST") {
      const kluc = req.headers.get("x-kluc") ?? url.searchParams.get("ka") ?? "";
      let b: any = {};
      try { b = await req.json(); } catch { return json({ ok: false, chyba: "zly format" }, 400); }
      const { data, error } = await db.rpc("pizza_prijat", { p_kluc: kluc, p: b });
      if (error) throw error;
      if (!data.ok) return json(data, 401);
      if (data.zrusene !== undefined) return json({ ...data, sprava: data.zrusene ? "Objednavka ZRUSENA. Povedz presne text povedz_zakaznikovi a ukonci hovor." : "Objednavka NENAJDENA. Povedz text povedz_zakaznikovi a ukonci hovor." });
      if (data.neplatne) return json({ ...data, sprava: data.chyba });
      if (data.zavolat) return json({ ...data, sprava: "Ziadost o zavolanie odoslana do kuchyne. Povedz presne text povedz_zakaznikovi a ukonci hovor." });
      if (data.zmenene !== undefined) return json({ ...data, sprava: "ZMENA odoslana do kuchyne. Povedz presne text povedz_zakaznikovi." });
      if (data.zamietnute) return json({ ...data, sprava: "ZATVORENE - objednavka NEBOLA prijata. Nehovor, ze je prijata. Povedz presne text povedz_zakaznikovi a ukonci hovor." });
      return json({ ...data, sprava: "Objednavka ulozena" });
    }
    if (req.method === "GET") {
      const kluc = url.searchParams.get("k") ?? "";
      const text = url.searchParams.get("format") === "text";
      const nove = url.searchParams.get("nove") === "1";
      // blocky vybraneho dna (stranka obsluhy): GET ?k=kluc_tlac&den=YYYY-MM-DD
      const den = url.searchParams.get("den");
      if (den && !nove && !text) {
        const { data, error } = await db.rpc("pizza_objednavky_den", { p_kluc: kluc, p_den: den });
        if (error) throw error;
        if (!data.ok) return json(data, 401);
        return json({ ok: true, pizzeria: data.pizzeria, den: data.den, objednavky: (data.objednavky as any[]).map((o) => ({ ...o, blocek: blocek(o, data.pizzeria) })) });
      }
      if (nove && !text) {
        const { data, error } = await db.rpc("pizza_objednavky", { p_kluc: kluc, p_nove: false });
        if (error) throw error;
        if (!data.ok) return json(data, 401);
        return json({ ok: true, pizzeria: data.pizzeria, objednavky: [] });
      }
      const { data, error } = await db.rpc("pizza_objednavky", { p_kluc: kluc, p_nove: nove });
      if (error) throw error;
      if (!data.ok) return json(data, 401);
      const rows = data.objednavky as any[];
      const suhrny = (data.suhrny ?? []) as string[];
      if (text) {
        const casti = [...rows.map((o) => blocek(o, data.pizzeria, true)), ...suhrny.map((s) => bezDiakritiky(s))];
        const t = casti.length ? casti.join("\n") : "ZIADNA";
        return new Response(t, { headers: { ...CORS, "Content-Type": "text/plain; charset=utf-8" } });
      }
      return json({ ok: true, pizzeria: data.pizzeria, objednavky: rows.map((o) => ({ ...o, blocek: blocek(o, data.pizzeria) })) });
    }
    return json({ ok: false }, 405);
  } catch (e) {
    console.error(e);
    return json({ ok: false, chyba: "chyba servera" }, 500);
  }
});
