#!/bin/bash
# Instalacia tlace objednavok na Raspberry Pi.
# Spustenie:  curl -fsSL https://miteso.github.io/bidovce/pi/install.sh | sudo bash -s [KLUC]
set -e
[ "$(id -u)" = 0 ] || { echo "Spusti cez sudo"; exit 1; }
exec 3</dev/tty

echo "=== Tlac objednavok - instalacia ==="
KLUC="$1"
if [ -n "$KLUC" ]; then zm=a
elif [ -f /etc/pizza-tlac.conf ]; then
  read -u 3 -p "Kluc uz je nastaveny. Zmenit? (a/N): " zm
else zm=a; fi
if [ "$zm" = a ]; then
  [ -n "$KLUC" ] || read -u 3 -p "Zadaj kluc tlace (dostal si ho od spravcu): " KLUC
  [ -n "$KLUC" ] || { echo "Kluc je prazdny"; exit 1; }
  umask 077; echo "KLUC=$KLUC" > /etc/pizza-tlac.conf
fi

curl -fsSL https://miteso.github.io/bidovce/pi/tlac.py -o /usr/local/bin/pizza-tlac.py
chmod 755 /usr/local/bin/pizza-tlac.py

cat > /etc/systemd/system/pizza-tlac.service <<'S'
[Unit]
Description=Tlac objednavok pizzerie
After=network-online.target
Wants=network-online.target

[Service]
ExecStart=/usr/bin/python3 -u /usr/local/bin/pizza-tlac.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
S
systemctl daemon-reload
systemctl enable --now pizza-tlac.service

read -u 3 -p "Pridat Wi-Fi pizzerie? (a/N): " wf
if [ "$wf" = a ]; then
  read -u 3 -p "Nazov Wi-Fi: " SSID
  read -u 3 -s -p "Heslo Wi-Fi (nezobrazuje sa): " PASS; echo
  nmcli connection delete "pizzeria" >/dev/null 2>&1 || true
  nmcli connection add type wifi con-name pizzeria ifname wlan0 ssid "$SSID" \
    wifi-sec.key-mgmt wpa-psk wifi-sec.psk "$PASS" connection.autoconnect yes connection.autoconnect-priority 10 >/dev/null
  echo "Wi-Fi '$SSID' ulozena (pripoji sa automaticky v pizzerii)."
fi

sleep 3
echo; systemctl --no-pager --lines=5 status pizza-tlac.service | tail -6
echo; echo "HOTOVO. Ak je tlaciaren zapojena, prave vytlacila 'Tlac objednavok je pripravena'."
