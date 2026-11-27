# Zadanie: objednávkový web Family Sečovce (prototyp)

27. 11. 2026 · Tomáš Hanušovský

## 1. Cieľ a rozsah

Postav **klikateľný prototyp objednávkového webu** pre Family Restaurant & Caffe Sečovce, ktorý predstavím majiteľovi. Musí vyzerať ako hotový produkt: štýl ich jedálneho lístka, plynulé animácie, perfektne na mobile. Objednávka sa vo fáze 1 nikam neodosiela – stránka beží v **ukážkovom režime**.

**Vo fáze 1 je:**

- celý jedálny lístok s cenami (údaje v časti 6),
- výber jedla s úpravami (veľkosť, pol na pol, bez ingrediencie, prílohy navyše, burger samostatne/menu),
- košík so správnym výpočtom balného, akcií a dopravy,
- pokladňa: rozvoz alebo osobný odber, obec, adresa, meno, telefón, **spôsob platby**,
- potvrdenie objednávky s odhadom času a ukážkou budúceho sledovania vodiča (simulované).

**Platba:** zákazník si len **vyberie** spôsob – hotovosť, karta pri prevzatí, stravné lístky. **Žiadna online platba**, žiadna platobná brána. Platí pri prevzatí (vodičovi alebo pri osobnom odbere).

**Nie je vo fáze 1:** skutočné odosielanie objednávok, prihlásenie zákazníkov, administrácia, SMS, skutočné GPS sledovanie vodiča. Kód má byť však pripravený tak, aby sa to dalo neskôr doplniť bez prepisovania (časť 7).

Jazyk webu: **slovenčina** (správna diakritika). Mena: EUR, formát `8,50 €`.

## 2. Technológie a nasadenie

Statická webová aplikácia bez servera, nasadená na verejnú adresu, ktorú otvorím na mobile u majiteľa.

- **Vite + React + TypeScript**, **Tailwind CSS**, animácie **Framer Motion**, stav košíka v jednom store (Zustand alebo React Context) uložený v `localStorage` (obnovenie stránky košík nezmaže).
- Smerovanie cez hash (`#/menu`, `#/kosik`…), aby fungovalo na GitHub Pages.
- **Údaje oddelené od kódu:** `src/data/menu.json`, `src/data/obce.json`, `src/data/nastavenia.json` (obsah v časti 6, súbory sú pripravené v `family-web/data/`). Žiadna cena ani obec natvrdo v komponentoch.
- **Výpočet ceny v jednom module** `src/lib/cena.ts` (čisté funkcie) + **unit testy (Vitest)** pre všetky príklady z časti 5. Pri skutočnom spustení bude cenu potvrdzovať server, ale prototyp musí ukazovať rovnaké sumy ako dnešný systém.
- **Nasadenie:** v repozitári `Miteso/bidovce` – zdrojový kód v priečinku `family-web/`, zostavený web (`npm run build`, Vite `base: '/bidovce/family/'`) skopíruj do priečinka `family/` a commitni do vetvy `main`; GitHub Pages ho zverejní na https://miteso.github.io/bidovce/family/. Ostatné súbory v repozitári (agent, obsluha, tlač) nemeň. Na konci mi daj odkaz.
- Mobile-first (šírka 360–430 px je hlavný prípad), potom tablet a desktop. Lighthouse na mobile: výkon ≥ 85, prístupnosť ≥ 90.
- Obrázky vo formáte WebP, načítané lenivo (lazy). Fonty z Google Fonts.
- Používaj len obrázky, ktoré dodám (logo, fotky z jedálneho lístka), alebo obrázky s voľnou licenciou (Unsplash, Pexels) – zdroj zapíš do `CREDITS.md`. Kde fotka chýba, daj vkusný zástupný obrázok v štýle webu, nie prázdny rámček.

## 3. Vizuálny štýl a animácie

Web má pôsobiť ako ich tlačený jedálny lístok (dve strany – obrázky v `family-web/podklady/`): tmavý kameň, zlaté písmo, ručne písané doplnky, bordové akcie. Prémiový, ale čitateľný.

| Prvok | Ako to vyzerá v lístku | Na webe |
| --- | --- | --- |
| Pozadie | tmavý bridlicový kameň s jemnou štruktúrou | `#1e1e1e`–`#2a2a2a` + jemná textura (CSS noise/obrázok), nie čistá čierna |
| Hlavička | biely mramor s vlnitým spodným okrajom | mramorový pás hore s vlnou (SVG), na ňom nadpis |
| Nadpisy | „POCTIVÁ“, „PIZZA menu“ – hrubé veľké písmená so zlatým kovovým prechodom | Montserrat 800–900, veľké písmená, prechod `#8a6a24 → #d4af37 → #f3dc8f → #b8862e` |
| Ručné písmo | „menu“, „ponuka“, „Sme späť!“, „až k tebe domov“ | script font s plnou slovenskou diakritikou (napr. Great Vibes alebo Allura), biela/zlatá |
| Poznámky so šípkami | „Domáce briošková žemle“ pri burgri | Caveat, biela, kreslené šípky (SVG) |
| Názvy jedál | zlaté/oranžové veľké písmená | Montserrat 700, `#e8a33d` |
| Ceny | zlaté, tučné | `#e8a33d`, tučné, formát `8,50 €` |
| Zloženie | biela/svetlosivá menšia | Montserrat 400, `#d6d6d6` |
| Akcie | bordová tabuľka, biele písmo, zlatá bočná záložka „AKCIE“ | `#7a1a1a`, zlatý okraj, prerušovaná zlatá čiara medzi akciami |
| Logo | okrúhly tmavý odznak so zlatým gréckym vzorom, „Family“ zlatým písmom, „RESTAURANT & CAFFE“ červeným | použi dodané logo (SVG/PNG), neprekresľuj ho |
| Oddelovače | tenká zlatá čiara za nadpisom sekcie, bodkované čiary pri prílohách | rovnako |

**Animácie** (plynulé, 60 fps, nikdy nezdržujú objednávku):

- **Úvod:** pizza sa pomaly otáča (celá otočka za ~60 s), burger jemne „pláva“ hore-dole, „Sme späť!“ sa pri načítaní „dopíše“ (ťah pera), cez zlaté nadpisy občas prejde lesk, štítok akcií jemne pulzuje.
- **Menu:** karty sa pri skrolovaní postupne vysunú zdola; záložky kategórií sú prilepené hore a podkreslenie sa posunie na aktívnu.
- **Pridanie do košíka:** obrázok jedla „odletí“ do ikony košíka, počítadlo poskočí, na mobile krátka vibrácia (ak to telefón podporuje).
- **Akcia 3+1 v košíku:** ukazovateľ „už 3 z 4 pizz – štvrtá je zadarmo“ sa plní; pri 4 pizzách zlaté iskry a hláška „Akcia tri plus jedna – najlacnejšia pizza zadarmo“.
- **Prechody stránok** jemné (prelínanie/posun), pokladňa s ukazovateľom krokov.
- **Potvrdenie:** animovaná fajka, časová os stavu, mapa s pohybujúcim sa vodičom (ukážka).
- Pri nastavení telefónu „obmedziť pohyb“ (`prefers-reduced-motion`) väčšinu animácií vypni. Žiadny zvuk.

## 4. Stránky a tok objednávky

Zákazník prejde celú objednávku na mobile do 1 minúty: úvod → menu → košík → pokladňa → potvrdenie. Košík je stále na dosah (plávajúci panel dole so sumou a počtom kusov).

1. **Úvod** (`#/`)
    - Mramorová hlavička s logom, „POCTIVÁ PIZZA & SMASH BURGER – bez kompromisov“, „Sme späť!“, pizza a burger ako na lístku.
    - Tlačidlá **Objednať online** (→ menu) a **Zavolať** (číslo z `nastavenia.json`).
    - Stav otvorené/zatvorené podľa otváracích hodín, akcie (3+1, 2 pizze + nápoj), rozvoz s cenami dopravy podľa obcí.
2. **Menu** (`#/menu`)
    - Prilepené záložky: Pizza, Burgre, Snacky & wrapy, Krídelká & šalát, Palacinky, Prílohy, Omáčky. Hľadanie podľa názvu aj suroviny („brokolica“ nájde Brokolicovú, Bimbo, Carlos).
    - Karta jedla: fotka, názov, zloženie, gramáž, alergény, cena (pri pizzi malá aj veľká), tlačidlo +. Položka s `vypredane: true` je sivo s nápisom „Dnes vypredané“ a nedá sa pridať.
3. **Detail jedla** (na mobile panel zdola), cena sa prepočítava hneď:
    - **Pizza:** malá 500 g / veľká 1000 g; prepínač **Pol na pol** → výber druhej polovice (rovnaká veľkosť); „Bez…“ (čipy zo zloženia, zadarmo); **Príloha navyše** s cenou – na celú pizzu, pri pol na pol aj na jednu polovicu; poznámka; počet kusov.
    - **Burger:** samostatne / **menu** (+ dip + hranolky); pri menu výber dipu zo zoznamu omáčok a zámena hranoliek za batátové alebo domáce (+1,00 €); navyše extra mäso + cheddar, extra cheddar, extra slanina, extra omáčka; „Bez…“.
    - **Stripsy, toasty, wrapy, krídelká:** dresing vymeniť za inú omáčku (zadarmo); hranolky za batátové alebo domáce (+1,00 €); „Bez…“.
    - **Prílohy:** hranolky a hranolky so syrom 150 g / 250 g; batátové len 150 g a bez syra, syr navyše +1,50 €.
    - **Omáčky:** výber druhu (BBQ, slaninová, cesnaková, tzatziki, Caesar, pikantná, sweet chilli, kečup, tatárska).
4. **Košík** (`#/kosik`)
    - Položky s úpravami, +/−, upraviť, odstrániť. Riadok **Balné** (s rozpisom po rozkliknutí), riadky akcií („Najlacnejšia pizza ZADARMO“, „Nápoj podľa ponuky ZADARMO“), doprava, spolu.
    - Ponuky: pri 1 pizzi „Pridaj druhú pizzu a nápoj máš zadarmo“; pri 3 pizzách „Pridaj štvrtú – akcia tri plus jedna, najlacnejšia je zadarmo“. Upozornenie na minimálnu objednávku podľa obce.
5. **Pokladňa** (`#/pokladna`), kroky s ukazovateľom:
    1. **Rozvoz** (predvolené) alebo **Osobný odber** (adresa reštaurácie, pripravené do pol hodiny).
    2. Rozvoz: **obec** zo zoznamu (pri každej cena dopravy), **ulica** (povinná v Sečovciach a Trebišove, našepkávač zo zoznamu ulíc), **číslo domu** (povinné, formát aj `821/41`; nevyžaduje sa pri Hábeš a Ku škole), poznámka pre vodiča. V obciach mimo Sečoviec a Trebišova stačí obec + číslo.
    3. **Meno** a **telefón** (slovenské číslo, validácia `09xx xxx xxx` alebo `+421`).
    4. **Čas:** „Čo najskôr“ (odhad) alebo „Na čas“ (dnes, v otváracích hodinách, po 15 minútach).
    5. **Platba:** Hotovosť / Karta pri prevzatí / Stravné lístky + veta „Platíte až pri prevzatí.“
    6. Súhlas so spracovaním údajov (zaškrtávacie políčko, odkaz na krátky text – zatiaľ zástupný).
    7. Zhrnutie + tlačidlo **Odoslať objednávku · 19,50 €**. V ukážkovom režime nenápadný štítok „Ukážka – objednávka sa neodošle“.
6. **Potvrdenie** (`#/objednavka/<číslo>`)
    - Animovaná fajka, číslo objednávky, súhrn, odhad času **slovami po štvrťhodinách** („U vás bude približne o hodinu až hodinu a štvrť“, odber „pripravená do pol hodiny“).
    - Časová os stavu: Prijatá → Pripravuje sa → Na ceste → Doručená (v ukážke sa posunie sama).
    - Tlačidlo **Sledovať vodiča** → mapa (Leaflet + OpenStreetMap) s trasou z pizzerie na adresu a pohybujúcim sa autíčkom; označené „Ukážka – pripravujeme“.
7. **Zatvorené:** mimo otváracích hodín pás „Teraz máme zatvorené – objednávky prijímame Po–Pi od 15:00, So od 12:00“; odoslať sa dá len „Na čas“. Pre prezentáciu: `?demo=otvorene` vynúti otvorený stav.
8. **Pätička:** adresa, telefóny, otváracie hodiny, legenda alergénov, odkazy na podmienky a ochranu údajov (zástupný text).

## 5. Obchodné pravidlá (výpočet ceny)

Sumy musia sedieť na cent s tým, čo dnes počíta telefonický agent a tlačí na bločky. Pravidlá platia pre rozvoz aj osobný odber.

**Ceny jedál**

- Pizza má cenu za malú (500 g) a veľkú (1000 g). Bez veľkosti = malá.
- **Pol na pol** = jedna pizza, cena drahšej polovice (obe polovice v rovnakej veľkosti).
- **Príloha na pizzu navyše** stojí vždy plnú cenu z cenníka – aj keď je len na polovicu pizze.
- „Bez ingrediencie“ je zadarmo a cenu nemení.
- **Burger:** samostatne alebo menu (+ dip + hranolky 150 g). Dip v menu je v cene. Zámena hranoliek v menu za batátové alebo domáce +1,00 €.
- **Stripsy, toasty, wrapy, krídelká:** dresing sa dá vymeniť za inú omáčku zadarmo, hranolky za batátové alebo domáce +1,00 €.
- **Batátové hranolky** len 150 g za 3,50 €, nikdy so syrom automaticky; syr navyše +1,50 € len na želanie.
- **Omáčka samostatne** 1,50 €. Nápoje sa nepredávajú (len nápoj zadarmo v akcii).

**Balné** (pripočíta sa vždy, zákazník ho vidí ako jeden riadok „Balné“ s rozpisom):

| Za čo | Suma |
| --- | --- |
| každá pizza – krabica malá / veľká (aj pizza zadarmo v akcii) | 0,50 € / 1,00 € |
| každý burger alebo burger menu | 0,50 € |
| každé iné jedlo (stripsy, toast, wrap, krídelká, šalát, palacinky, samostatné hranolky, zemiaky, ryža) | 0,50 € |
| každá samostatne objednaná omáčka (nie dip v menu, nie dresing v stripsoch, nie extra omáčka do burgra) | 0,30 € |

**Akcie** (nekombinujú sa, počítajú sa automaticky):

- **Tri plus jedna:** za každé 4 pizze (pol na pol = 1 pizza, malé aj veľké) je jedna zadarmo – **najlacnejšia podľa základnej ceny pizze**. Jej prílohy navyše a krabica sa platia.
- **2 pizze + nápoj:** pri 2 alebo 3 pizzách riadok „Nápoj podľa ponuky ZADARMO“ (0,00 €, bez balného, zákazník si ho nevyberá). Pri 4 a viac pizzách už nie.

**Doprava a minimá**

- Doprava podľa obce (zoznam v časti 6), žiadna doprava zadarmo. Osobný odber bez dopravy.
- **Minimálna objednávka** (jedlá + balné po akciách, bez dopravy): Zemplínska Teplica 25 €, Sečovská Polianka 30 €, Trebišov 30 €. Pod minimom tlačidlo Odoslať nepustí a ukazuje, koľko chýba.
- Obce mimo zoznamu: „Do vašej obce, žiaľ, nerozvážame“ + ponuka osobného odberu. Tušice a Tušická Nová Ves: odovzdanie na autobusovej zastávke na Hlavnej v Horovciach, doprava 3,50 €.

**Otváracie hodiny a čas:** Po–Pi 15:00–21:30, So 12:00–21:30, Ne zatvorené. Odhad v prototype z `nastavenia.json`: osobný odber „do pol hodiny“, rozvoz „zhruba do pol hodiny“ až „hodinu“ podľa obce. Nikdy menej ako pol hodiny, vždy slovami po štvrťhodinách („trištvrte hodiny až hodinu“, nie „45–60 min“).

**Kontrolné príklady pre unit testy**

| # | Košík | Spolu |
| --- | --- | --- |
| 1 | Šunková malá, rozvoz Sečovce | 8,00 + 0,50 + 1,00 = **9,50 €** |
| 2 | 2× Šunková malá, rozvoz Sečovce | 16,00 + 1,00 + nápoj 0,00 + 1,00 = **18,00 €** |
| 3 | Šunková malá, Special malá, Calzone malá bez šampiňónov, Gazdovská veľká, odber | 44,90 − 8,00 (Šunková zadarmo) + krabice 2,50 = **39,40 €** |
| 4 | Pol na pol Brokolicová / Special malá, rozvoz Sečovce | 9,40 + 0,50 + 1,00 = **10,90 €** |
| 5 | Salámová malá + feferóny na polovicu, odber | 8,30 + 0,50 + 0,50 = **9,30 €** |
| 6 | Royal BBQ Smash menu, hranolky za batátové, odber | 8,70 + 1,00 + 0,50 = **10,20 €** |
| 7 | Kuracie stripsy (dresing za kečup) + batátové, odber | 8,50 + 1,00 + 0,50 = **10,00 €** |
| 8 | Batátové hranolky + syr, odber | 3,50 + 1,50 + 0,50 = **5,50 €** |
| 9 | Kečup samostatne, odber | 1,50 + 0,30 = **1,80 €** |
| 10 | 4× Šunková malá, rozvoz Trebišov | jedlá 26,00 € < 30 € → **odoslanie zablokované** (chýba 4,00 €) |

## 6. Údaje (ulož ich ako JSON súbory)

Ceny, obce, doprava a minimá sú zo systému, podľa ktorého dnes účtuje telefonický agent; názvy a zloženie jedál z jedálneho lístka. Súbory sú pripravené v `family-web/data/` – skopíruj ich bez úprav do `src/data/`. Pole `alias_system` je názov, pod ktorým jedlo pozná dnešný systém (pre budúce napojenie).

**`src/data/menu.json`**

```json
{
  "mena": "EUR",
  "alergeny_legenda": {"1": "obilniny obsahujúce lepok", "3": "vajcia", "7": "mlieko", "8": "orechy", "9": "zeler", "10": "horčica"},
  "kategorie": [
    {"id": "pizza", "nazov": "Pizza", "popis": "malá 500 g · veľká 1000 g"},
    {"id": "burgre", "nazov": "Burgre", "popis": "MENU VERZIA: + dip + hranolky"},
    {"id": "snacky", "nazov": "Snacky & wrapy"},
    {"id": "kridelka", "nazov": "Krídelká & šalát"},
    {"id": "palacinky", "nazov": "Palacinky"},
    {"id": "prilohy", "nazov": "Prílohy"},
    {"id": "omacky", "nazov": "Omáčky"}
  ],
  "polozky": [
    {"id": "sunkova", "kat": "pizza", "nazov": "Šunková", "zlozenie": ["paradajková omáčka", "syr", "šunka", "kukurica"], "alergeny": [1, 7], "cena_mala": 8.00, "cena_velka": 17.00},
    {"id": "salamova", "kat": "pizza", "nazov": "Salámová", "zlozenie": ["paradajková omáčka", "syr", "saláma", "kukurica"], "alergeny": [1, 7], "cena_mala": 8.30, "cena_velka": 17.60},
    {"id": "sunkova-quattro", "kat": "pizza", "nazov": "Šunková Quattro", "zlozenie": ["paradajková omáčka", "4 druhy syra", "šunka"], "alergeny": [1, 7], "cena_mala": 9.00, "cena_velka": 19.00},
    {"id": "quattro", "kat": "pizza", "nazov": "Quattro", "zlozenie": ["paradajková omáčka", "4 druhy syra"], "alergeny": [1, 7], "cena_mala": 8.50, "cena_velka": 18.00},
    {"id": "quattro-stagioni", "kat": "pizza", "nazov": "Quattro Stagioni", "zlozenie": ["paradajková omáčka", "4 druhy pizze v jednej (Gazdovská, Šunková, Salámová, Quattro)"], "alergeny": [1, 7], "cena_mala": 8.70, "cena_velka": 18.40},
    {"id": "margherita", "kat": "pizza", "nazov": "Margherita", "zlozenie": ["paradajková omáčka", "syr", "paradajky"], "alergeny": [1, 7], "cena_mala": 7.50, "cena_velka": 16.00},
    {"id": "hawaii", "kat": "pizza", "nazov": "Hawaii", "zlozenie": ["paradajková omáčka", "syr", "šunka", "ananás"], "alergeny": [1, 7], "cena_mala": 8.60, "cena_velka": 18.20},
    {"id": "vegetarianska", "kat": "pizza", "nazov": "Vegetariánska", "zlozenie": ["paradajková omáčka", "syr", "paradajka", "paprika", "kukurica", "šampiňóny"], "alergeny": [1, 7], "cena_mala": 8.50, "cena_velka": 18.00},
    {"id": "bolognese", "kat": "pizza", "nazov": "Bolognese", "zlozenie": ["paradajková omáčka", "syr", "bolognese zmes", "olivy"], "alergeny": [1, 7, 9], "cena_mala": 8.70, "cena_velka": 18.40},
    {"id": "calzone", "kat": "pizza", "nazov": "Calzone", "zlozenie": ["paradajková omáčka", "syr", "šunka", "kukurica", "šampiňóny", "olivy"], "alergeny": [1, 7], "cena_mala": 8.50, "cena_velka": 18.60},
    {"id": "kuracia", "kat": "pizza", "nazov": "Kuracia", "zlozenie": ["paradajková omáčka", "syr", "kuracie mäso", "kukurica", "šampiňóny"], "alergeny": [1, 7], "cena_mala": 8.60, "cena_velka": 18.20},
    {"id": "brokolicova", "kat": "pizza", "nazov": "Brokolicová", "alias_system": "Brocoli Chicken", "zlozenie": ["paradajková omáčka", "syr", "kuracie mäso", "brokolica", "šampiňóny"], "alergeny": [1, 7], "cena_mala": 8.80, "cena_velka": 18.60},
    {"id": "mexicana", "kat": "pizza", "nazov": "Mexicana", "zlozenie": ["paradajková omáčka", "syr", "saláma", "šampiňóny", "feferóny"], "alergeny": [1, 7], "cena_mala": 8.90, "cena_velka": 18.80},
    {"id": "bimbo", "kat": "pizza", "nazov": "Bimbo", "zlozenie": ["paradajková omáčka", "syr", "šunka", "slanina", "brokolica", "kukurica", "šampiňóny"], "alergeny": [1, 7], "cena_mala": 9.30, "cena_velka": 19.60},
    {"id": "gazdovska", "kat": "pizza", "nazov": "Gazdovská", "zlozenie": ["paradajková omáčka", "syr", "slanina", "klobása", "cibuľa", "feferóny"], "alergeny": [1, 7], "cena_mala": 9.00, "cena_velka": 19.00},
    {"id": "bryndzova-baca", "kat": "pizza", "nazov": "Bryndzová Bača", "zlozenie": ["smotanový základ", "bryndza", "slanina", "saláma", "cibuľa", "kukurica"], "alergeny": [1, 7], "cena_mala": 9.30, "cena_velka": 19.60},
    {"id": "bbq-chicken", "kat": "pizza", "nazov": "BBQ Chicken", "zlozenie": ["paradajková omáčka", "syr", "kuracie mäso", "kukurica", "cibuľa", "údený syr", "BBQ omáčka"], "alergeny": [1, 7, 10], "cena_mala": 9.20, "cena_velka": 19.40},
    {"id": "carlos", "kat": "pizza", "nazov": "Carlos", "zlozenie": ["paradajková omáčka", "syr", "saláma", "kukurica", "brokolica", "údený syr"], "alergeny": [1, 7], "cena_mala": 9.10, "cena_velka": 19.20},
    {"id": "sampinonova", "kat": "pizza", "nazov": "Šampiňónová", "zlozenie": ["paradajková omáčka", "syr", "šunka", "šampiňóny"], "alergeny": [1, 7], "cena_mala": 8.20, "cena_velka": 17.40},
    {"id": "special", "kat": "pizza", "nazov": "Special", "zlozenie": ["paradajková omáčka", "syr", "šunka", "saláma", "šampiňóny", "olivy", "kukurica", "niva"], "alergeny": [1, 7], "cena_mala": 9.40, "cena_velka": 19.80},

    {"id": "family-signature", "kat": "burgre", "nazov": "Family Signature Smash burger", "zlozenie": ["žemľa", "100% hovädzie mäso", "cheddar", "nakladaná cibuľka", "paradajky", "kyslé uhorky", "šalát", "domáci dresing"], "popis": "Smash z hovädzieho mäsa, cheddar, kyslé uhorky, cibuľa a klasická burger omáčka v maslovej brioche žemli.", "cena": 6.50, "cena_menu": 8.00},
    {"id": "royal-bbq", "kat": "burgre", "nazov": "Royal BBQ Smash burger", "zlozenie": ["žemľa", "100% hovädzie mäso", "cheddar", "nakladaná cibuľka", "slaninový džem", "BBQ omáčka", "šalát", "pečená slanina", "domáci dresing", "kyslé uhorky"], "popis": "Smash z hovädzieho mäsa s extrémne chrumkavými okrajmi, roztopeným cheddarom, domácim slaninovým džemom, jemne nakladanou červenou cibuľou, sviežim šalátom a našou signature omáčkou v maslovej brioche žemli.", "odporucame": true, "cena": 7.20, "cena_menu": 8.70},
    {"id": "inferno", "kat": "burgre", "nazov": "Inferno Smash burger", "zlozenie": ["žemľa", "100% hovädzie mäso", "cheddar", "nakladaná cibuľka", "pečená slanina", "šalát", "domáci pikantný dresing", "jalapeño", "sweet chilli"], "cena": 6.90, "cena_menu": 8.40},
    {"id": "crispy-cheese", "kat": "burgre", "nazov": "Crispy Cheese Smash burger", "zlozenie": ["žemľa", "100% hovädzie mäso", "cheddar", "nakladaná cibuľka", "kyslé uhorky", "šalát", "brusnicový džem", "domáci dresing", "vyprážaný syr v panko strúhanke"], "cena": 7.50, "cena_menu": 9.00},
    {"id": "crispy-chicken", "kat": "burgre", "nazov": "Crispy Chicken burger", "gramaz": "370 g", "zlozenie": ["vyprážané kuracie prsia v panko strúhanke", "dresing", "šalát", "paradajka", "kyslá uhorka", "cheddar"], "cena": 6.20, "cena_menu": 7.70},

    {"id": "kuracie-stripsy", "kat": "snacky", "nazov": "Kuracie stripsy", "gramaz": "550 g", "alergeny": [1, 3, 7], "zlozenie": ["5 ks kuracie stripsy 400 g", "hranolky 150 g", "dresing 50 ml"], "cena": 8.50, "ma_hranolky": true, "ma_dresing": true},
    {"id": "sunkovy-toast", "kat": "snacky", "nazov": "Šunkový toast", "gramaz": "350 g", "alergeny": [1, 3, 7], "zlozenie": ["žemľa 85 g", "šunka 30 g", "syr 35 g", "šalát 10 g", "hranolky 150 g", "dresing 50 ml"], "cena": 5.50, "ma_hranolky": true, "ma_dresing": true},
    {"id": "slaninovy-toast", "kat": "snacky", "nazov": "Slaninový toast", "gramaz": "350 g", "alergeny": [1, 3, 7], "zlozenie": ["žemľa 85 g", "slanina 40 g", "cheddar 35 g", "sweet chilli 10 ml", "šalát 10 g", "hranolky 150 g", "dresing 50 ml"], "cena": 5.80, "ma_hranolky": true, "ma_dresing": true},
    {"id": "gyros-wrap", "kat": "snacky", "nazov": "Gyros kurací wrap", "gramaz": "450 g", "alergeny": [1, 3, 7], "zlozenie": ["tortilla 1 ks", "kuracie prsia v panko 150 g", "cibuľa", "zelenina", "šalát", "tzatziki dresing 25 ml", "omáčka 50 ml", "hranolky 150 g"], "cena": 7.50, "ma_hranolky": true, "ma_dresing": true},
    {"id": "mexico-wrap", "kat": "snacky", "nazov": "Mexico wrap", "gramaz": "450 g", "alergeny": [1, 3, 7, 9, 10], "zlozenie": ["tortilla 1 ks", "mleté mäso 150 g", "kukurica 7 g", "fazuľka 10 g", "cibuľa", "šalát", "BBQ dresing 25 ml", "dresing 50 ml", "hranolky 150 g"], "cena": 7.50, "ma_hranolky": true, "ma_dresing": true},

    {"id": "pikantne-kridelka", "kat": "kridelka", "nazov": "Pikantné krídelká", "gramaz": "650 g", "alergeny": [7, 9], "zlozenie": ["marinované krídelká 500 g", "hranolky 150 g", "dresing 50 ml"], "cena": 7.50, "ma_hranolky": true, "ma_dresing": true},
    {"id": "bbq-kridelka", "kat": "kridelka", "nazov": "BBQ krídelká", "gramaz": "650 g", "alergeny": [7, 9, 10], "zlozenie": ["marinované krídelká 500 g", "hranolky 150 g", "BBQ dresing 20 ml", "dresing 50 ml"], "cena": 7.50, "ma_hranolky": true, "ma_dresing": true},
    {"id": "caesar-salat", "kat": "kridelka", "nazov": "Caesar šalát", "gramaz": "350 g", "alergeny": [1, 3, 7], "zlozenie": ["kuracie prsia v panko 150 g", "šalát 100 g", "parmezán 50 g", "slaninka 20 g", "Caesar dresing 50 ml", "olej", "soľ", "korenie", "krutóny"], "cena": 9.90},

    {"id": "palacinky-nutella", "kat": "palacinky", "nazov": "Palacinky s Nutellou a šľahačkou", "gramaz": "350 g", "alergeny": [1, 3, 7, 8], "zlozenie": ["3 ks palacinky", "Nutella", "šľahačka", "topping", "práškový cukor"], "cena": 6.50},
    {"id": "palacinky-dubai", "kat": "palacinky", "nazov": "Palacinky Dubai", "gramaz": "400 g", "alergeny": [1, 3, 7, 8], "zlozenie": ["3 ks palacinky", "pistáciový krém", "čokoládový krém", "opražené kataifi", "čokoládová poleva", "sekané pistácie", "lyofilizované ovocie", "šľahačka"], "cena": 8.50},
    {"id": "lotus-palacinky", "kat": "palacinky", "nazov": "Lotus cheesecake palacinky", "gramaz": "400 g", "alergeny": [1, 3, 7], "zlozenie": ["3 ks palacinky", "vanilkovo-tvarohový krém", "drvené sušienky Lotus", "Lotus krém", "ovocný topping", "šľahačka"], "cena": 7.50},

    {"id": "hranolky", "kat": "prilohy", "nazov": "Hranolky", "varianty": [{"gramaz": "150 g", "cena": 2.00}, {"gramaz": "250 g", "cena": 3.00}]},
    {"id": "hranolky-syr", "kat": "prilohy", "nazov": "Hranolky so syrom", "varianty": [{"gramaz": "150 g", "cena": 3.00}, {"gramaz": "250 g", "cena": 4.00}]},
    {"id": "batatove-hranolky", "kat": "prilohy", "nazov": "Batátové hranolky", "gramaz": "150 g", "cena": 3.50, "syr_navyse": 1.50},
    {"id": "domace-hranolky", "kat": "prilohy", "nazov": "Domáce hranolky", "gramaz": "150 g", "cena": 3.00},
    {"id": "americke-zemiaky", "kat": "prilohy", "nazov": "Americké zemiaky", "gramaz": "150 g", "cena": 2.00},
    {"id": "ryza", "kat": "prilohy", "nazov": "Ryža", "cena": 1.50},

    {"id": "omacka", "kat": "omacky", "nazov": "Omáčka", "gramaz": "50 ml", "cena": 1.50, "druhy": ["BBQ", "slaninová", "cesnaková", "tzatziki", "Caesar", "pikantná", "sweet chilli", "kečup", "tatárska"]}
  ],
  "prilohy_na_pizzu": [
    {"nazov": "Šunka", "cena": 1.50}, {"nazov": "Saláma", "cena": 1.50}, {"nazov": "Klobása", "cena": 1.50}, {"nazov": "Slanina", "cena": 1.50},
    {"nazov": "Kuracie mäso", "cena": 2.00}, {"nazov": "Syr", "cena": 1.50}, {"nazov": "Údený syr", "cena": 1.80}, {"nazov": "Niva", "cena": 1.80},
    {"nazov": "Bryndza", "cena": 1.50}, {"nazov": "Kukurica", "cena": 1.00}, {"nazov": "Olivy", "cena": 1.00}, {"nazov": "Cibuľa", "cena": 0.80},
    {"nazov": "Feferóny", "cena": 0.50}, {"nazov": "Paradajka", "cena": 1.00}, {"nazov": "Paprika", "cena": 1.00}, {"nazov": "Ananás", "cena": 1.00},
    {"nazov": "Šampiňóny", "cena": 1.00}, {"nazov": "Brokolica", "cena": 1.30}
  ],
  "burger_navyse": [
    {"nazov": "Extra mäso + cheddar", "cena": 2.50}, {"nazov": "Extra cheddar", "cena": 1.00},
    {"nazov": "Extra slanina", "cena": 0.90}, {"nazov": "Extra omáčka", "cena": 1.50}
  ],
  "zamena_hranoliek": [{"nazov": "Batátové hranolky", "cena": 1.00}, {"nazov": "Domáce hranolky", "cena": 1.00}],
  "balne": {"krabica_mala": 0.50, "krabica_velka": 1.00, "balenie_burger": 0.50, "balenie_jedal": 0.50, "balenie_omacky": 0.30}
}
```

**`src/data/obce.json`** (doprava v €, minimum v € bez dopravy)

```json
{
 "obce": [
  {"nazov": "Sečovce", "doprava": 1.0, "min_objednavka": null, "povinna_ulica": true},
  {"nazov": "Albínov", "doprava": 2.0, "min_objednavka": null, "povinna_ulica": false},
  {"nazov": "Hriadky", "doprava": 2.0, "min_objednavka": null, "povinna_ulica": false},
  {"nazov": "Trnávka", "doprava": 2.0, "min_objednavka": null, "povinna_ulica": false},
  {"nazov": "Zbehňov", "doprava": 2.0, "min_objednavka": null, "povinna_ulica": false},
  {"nazov": "Bačkov", "doprava": 2.5, "min_objednavka": null, "povinna_ulica": false},
  {"nazov": "Dargov", "doprava": 2.5, "min_objednavka": null, "povinna_ulica": false},
  {"nazov": "Dvorianky", "doprava": 2.5, "min_objednavka": null, "povinna_ulica": false},
  {"nazov": "Kravany", "doprava": 2.5, "min_objednavka": null, "povinna_ulica": false},
  {"nazov": "Malé Ozorovce", "doprava": 2.5, "min_objednavka": null, "povinna_ulica": false},
  {"nazov": "Višňov", "doprava": 2.5, "min_objednavka": null, "povinna_ulica": false},
  {"nazov": "Nový Ruskov", "doprava": 3.0, "min_objednavka": null, "povinna_ulica": false},
  {"nazov": "Parchovany", "doprava": 3.0, "min_objednavka": null, "povinna_ulica": false},
  {"nazov": "Plechotice", "doprava": 3.0, "min_objednavka": null, "povinna_ulica": false},
  {"nazov": "Veľké Ozorovce", "doprava": 3.0, "min_objednavka": null, "povinna_ulica": false},
  {"nazov": "Vojčice", "doprava": 3.0, "min_objednavka": null, "povinna_ulica": false},
  {"nazov": "Horovce", "doprava": 3.5, "min_objednavka": null, "povinna_ulica": false},
  {"nazov": "Zemplínska Teplica", "doprava": 3.5, "min_objednavka": 25, "povinna_ulica": false},
  {"nazov": "Sečovská Polianka", "doprava": 4.0, "min_objednavka": 30, "povinna_ulica": false},
  {"nazov": "Trebišov", "doprava": 4.0, "min_objednavka": 30, "povinna_ulica": true}
 ],
 "casti_secoviec_bez_cisla": ["Hábeš", "Ku škole"],
 "specialne": [
  {"nazov": "Tušice", "doprava": 3.5, "poznamka": "odovzdanie na autobusovej zastávke na Hlavnej ulici v Horovciach"},
  {"nazov": "Tušická Nová Ves", "doprava": 3.5, "poznamka": "odovzdanie na autobusovej zastávke na Hlavnej ulici v Horovciach"}
 ],
 "nerozvazame": ["Milhostov", "Stankovce", "Moravany", "Egreš", "Trhovište", "Cabov", "Čeľovce", "Rakovec nad Ondavou", "Košický Klečenov", "Bánovce nad Ondavou", "Slanské Nové Mesto", "Slančík", "Sačurov", "Dlhé Klčovo", "Davidov", "Slivník", "Nižný Žipov", "Kalša", "Ložín", "Zemplínska Nová Ves", "Laškovce", "Nižný Hrušov", "Svinica", "Nižná Kamenica", "Bracovce", "Zemplínske Hradište", "Pozdišovce", "Stanča", "Suché", "Slanec", "Kuzmice"],
 "ulice": {"Sečovce": ["Albínovská", "Bačkovská", "Bitúnková", "Blatná", "Bottova", "Čižmárska", "Dargovských hrdinov", "Družstevná", "Dukelská", "Fialková", "Gorkého", "Hábeš", "Hodvábna", "Hrnčiarska", "Hviezdoslavova", "J. Horňáka", "Jarná", "Jazmínová", "Klinčeková", "Kochanovská", "Kollárova", "Komenského", "Konvalinková", "Kpt. Jána Nálepku", "Krátka", "Ku škole", "Letná", "M. R. Štefánika", "Mlynská", "Mostová", "Muškátová", "Námestie sv. Cyrila a Metoda", "Narcisová", "Nová doba", "Obchodná", "Okružná", "Orgovánová", "Partizánska", "Plechotická", "Poľná", "Potočná", "Pribinova", "Ružová", "Rybníková", "Sedlárska", "Sládkovičova", "Snežienková", "SNP", "Súdna", "Široká", "Štúrova", "Tulipánová", "Vysoká", "Záhradná", "Zvončeková", "Železničná"]}
}
```

**`src/data/nastavenia.json`**

```json
{
 "nazov": "Family Restaurant & Caffe",
 "mesto": "Sečovce",
 "adresa": "Nám. sv. Cyrila a Metoda 148/36, 078 01 Sečovce",
 "telefon_objednavky": "055 230 3166",
 "telefony": ["0915 156 575", "0915 385 008", "0948 503 213"],
 "otvaracie_hodiny": {"po": ["15:00", "21:30"], "ut": ["15:00", "21:30"], "st": ["15:00", "21:30"], "stv": ["15:00", "21:30"], "pi": ["15:00", "21:30"], "so": ["12:00", "21:30"], "ne": null},
 "platby": ["Hotovosť", "Karta pri prevzatí", "Stravné lístky"],
 "odhad_minuty": {"odber": [0, 30], "rozvoz_secovce": [0, 30], "rozvoz_doprava_do_2_50": [45, 60], "rozvoz_doprava_od_3_00": [60, 75]},
 "demo": true
}
```

**Čas slovami** (rovnako ako telefonický agent): horná hranica ≤ 30 min → „zhruba do pol hodiny“; inak „približne o X až Y“, kde X a Y sú násobky 15 minút slovami: 30 pol hodiny · 45 trištvrte hodiny · 60 hodinu · 75 hodinu a štvrť · 90 hodinu a pol · 105 hodinu a trištvrte · 120 dve hodiny. Príklad: 45–60 → „približne o trištvrte hodiny až hodinu“.

## 7. Formát objednávky a ďalšie fázy

Pri odoslaní prototyp zostaví objednávku v tvare, ktorý neskôr pošle na server. Teraz ju len uloží do `localStorage` a vypíše do konzoly.

```json
{
  "zdroj": "web",
  "sposob": "ROZVOZ",
  "obec": "Sečovce",
  "adresa": "Sečovce, Okružná 5",
  "meno": "Ján Novák",
  "telefon": "0901234567",
  "platba": "KARTA",
  "na_cas": null,
  "poznamka": "zvonček Novák, 2. poschodie",
  "polozky": [
    {"id": "calzone", "velkost": "mala", "pol_na_pol": null, "bez": ["šampiňóny"], "navyse": [], "pocet": 1, "cena_ks": 8.50},
    {"id": "royal-bbq", "menu": true, "dip": "cesnaková", "zamena_hranoliek": "Batátové hranolky", "pocet": 1, "cena_ks": 9.70}
  ],
  "polozky_text": "1x Calzone mala - 8,50 EUR\n  - bez sampinonov\n  + krabica mala - 0,50 EUR\n1x Royal BBQ Smash burger menu (dip cesnakovy) - 8,70 EUR\n  + batatove hranolky - 1,00 EUR\n  + balenie burger - 0,50 EUR",
  "suma_jedlo": 19.20,
  "doprava": 1.00,
  "suma": 20.20
}
```

- `polozky_text` = presne formát, ktorý dnes tlačí kuchyňa: bez diakritiky, cena za 1 kus, úpravy a balné odsadené pod položkou, `- bez …` pre ubratie, `+ …` pre prídavok a balné, dip v burger menu v zátvorke `(dip cesnakovy)`, vymenený dresing v zátvorke `(omacka kecup)`, nápoj v akcii ako `1x Napoj podla ponuky ZDARMA (akcia 2 pizze + napoj) - 0,00 EUR`. Vyrob ho jednou funkciou `naTextSystemu()`.
- Platba v systéme: `HOTOVOST`, `KARTA`, `STRAVNE LISTKY`.
- Pri ostrej prevádzke cenu vždy prepočíta server; web ju len zobrazuje.

**Ďalšie fázy (teraz nerob, len na ne nezatváraj cestu):**

1. **Ostrá prevádzka:** objednávka z webu pôjde do existujúceho systému (Supabase) cez vlastný vstup s ochranou proti spamu – vytlačí sa na bločkovej tlačiarni v kuchyni ako objednávky z telefónu, zobrazí sa na stránke obsluhy. Vypredané jedlá, otváracie hodiny a odhad času podľa vyťaženia kuchyne sa budú načítavať zo servera. Vlastná doména, podmienky a ochrana údajov.
2. **Sledovanie vodiča:** vodič bude mať v telefóne jednoduchú aplikáciu („Vyrážam“, „Doručené“), ktorá počas jazdy posiela polohu. Zákazník dostane odkaz na mapu s polohou vodiča a časom príchodu, obsluha uvidí všetkých vodičov na mape. Obrazovka „Sledovať vodiča“ z prototypu sa vtedy napojí na skutočné údaje.

## 8. Akceptačné kritériá a podklady

Prototyp je hotový, keď platí všetko nižšie a mám verejný odkaz, ktorý otvorím na mobile majiteľa.

- [ ] Celé menu z `menu.json`, ceny sedia s tým, čo účtuje telefonický agent.
- [ ] Všetkých 10 kontrolných príkladov z časti 5 prechádza v unit testoch.
- [ ] Objednávka od úvodu po potvrdenie ide na iPhone (Safari) aj Android (Chrome) bez chyby a bez vodorovného posunu stránky.
- [ ] Košík zostane po obnovení stránky.
- [ ] Pod minimom obce sa nedá odoslať; obec, kam sa nerozváža, ponúkne osobný odber.
- [ ] Mimo otváracích hodín zobrazí „zatvorené“, `?demo=otvorene` to obchádza.
- [ ] Animácie sú plynulé a pri „obmedziť pohyb“ sa vypnú.
- [ ] Stránka beží na https://miteso.github.io/bidovce/family/ a odkaz funguje.
- [ ] `family-web/README.md` po slovensky: ako spustiť, ako zmeniť ceny alebo pridať jedlo (len úprava JSON).

**Podklady:** oba obrázky jedálneho lístka sú v `family-web/podklady/` (vzor štýlu aj zdroj obrázkov). Logo samostatne zatiaľ nie je – vyrež ho z lístka (kruhový odznak „Family Restaurant & Caffe“) a priprav ako PNG s priehľadným pozadím; neskôr ho nahradíme originálom. Fotky pizze, burgra a hranoliek z lístka môžeš použiť ako výrezy.

**Postup:** najprv ukáž návrh úvodnej stránky a karty jedla (screenshot z mobilu), po mojom OK dokonči zvyšok. Na konci mi pošli odkaz a krátky zoznam, čo je v prototype len ukážka.
