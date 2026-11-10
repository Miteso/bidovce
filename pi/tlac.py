#!/usr/bin/env python3
"""Tlac objednavok pre pizzeriu (Raspberry Pi + USB tlaciaren ESC/POS).

Kazde 4 s sa spyta servera na nove blocky, vytlaci ich priamo do USB tlaciarne
a az PO uspesnej tlaci ich potvrdi serveru. Ked tlac zlyha (tlaciaren vypnuta,
bez papiera, odpojena), blocky ostanu na serveri a vytlacia sa pri dalsom pokuse.
Kluc sa cita z /etc/pizza-tlac.conf (nie je v tomto subore).
"""
import glob, json, os, socket, sys, time, urllib.parse, urllib.request

CONF = "/etc/pizza-tlac.conf"
URL = "https://ianslaoxiuwoztwqqkyk.supabase.co/functions/v1/objednavky"
INTERVAL = 4
VERZIA = "1.0"

INIT = b"\x1b@"            # reset tlaciarne
KONIEC = b"\n\n\n\n"       # posun papiera na odtrhnutie


def log(*a):
    print(time.strftime("%d.%m %H:%M:%S"), *a, flush=True)


def nacitaj_kluc():
    with open(CONF) as f:
        for r in f:
            if r.strip().startswith("KLUC="):
                return r.split("=", 1)[1].strip()
    raise SystemExit("Chyba KLUC v " + CONF)


def tlaciaren():
    z = sorted(glob.glob("/dev/usb/lp*"))
    return z[0] if z else None


def tlac(data: bytes):
    dev = tlaciaren()
    if not dev:
        raise OSError("tlaciaren nepripojena")
    fd = os.open(dev, os.O_WRONLY)
    try:
        view = memoryview(INIT + data + KONIEC)
        while view:
            n = os.write(fd, view)
            view = view[n:]
    finally:
        os.close(fd)


def ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        a = s.getsockname()[0]
        s.close()
        return a
    except OSError:
        return "?"


def http(url, data=None):
    hl = {"User-Agent": "pizza-tlac/" + VERZIA}
    if data is not None:
        data = json.dumps(data).encode()
        hl["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=hl, method="POST" if data is not None else "GET")
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode("utf-8"))


def main():
    kluc = nacitaj_kluc()
    host = socket.gethostname()
    log("start", VERZIA, host)
    uvod = False
    stav = ""
    while True:
        try:
            dev = tlaciaren()
            info = f"{host} {ip()} v{VERZIA} tlaciaren={'OK' if dev else 'NIE'}"
            if not uvod and dev:
                tlac(f"Tlac objednavok je pripravena\n{time.strftime('%d.%m.%Y %H:%M')}\n".encode("ascii", "replace"))
                uvod = True
            q = urllib.parse.urlencode({"k": kluc, "pi": "1", "info": info})
            d = http(f"{URL}?{q}")
            if not d.get("ok"):
                log("server odmietol:", d)
                time.sleep(30)
                continue
            o, s = [], []
            for p in d.get("polozky", []):
                tlac(p["text"].encode("ascii", "replace"))
                (o if p["typ"] == "o" else s).append(p["id"])
                log("vytlacene", p["typ"], p.get("cislo", p["id"]))
                # potvrdime hned po kazdom blocku, aby sa pri vypadku netlacil znova
                http(f"{URL}?{urllib.parse.urlencode({'k': kluc, 'pi': 'potvrd'})}", {"o": o, "s": s})
                o, s = [], []
            if stav != "ok":
                log("spojenie OK")
                stav = "ok"
        except Exception as e:  # siet / tlaciaren -> skusime znova
            if stav != str(e):
                log("chyba:", e)
                stav = str(e)
        time.sleep(INTERVAL)


if __name__ == "__main__":
    main()
