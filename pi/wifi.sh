#!/bin/bash
# Prida Wi-Fi novej pizzerie do Raspberry (domaca Wi-Fi ostava).
# Spustenie: curl -fsSL https://miteso.github.io/bidovce/pi/wifi.sh | sudo bash
set -e
[ "$(id -u)" = 0 ] || { echo "Spusti cez sudo"; exit 1; }
exec 3</dev/tty
read -u 3 -p "Nazov Wi-Fi v pizzerii: " SSID
read -u 3 -s -p "Heslo Wi-Fi (nezobrazuje sa): " PASS; echo
read -u 3 -s -p "Heslo Wi-Fi este raz: " PASS2; echo
[ "$PASS" = "$PASS2" ] || { echo "Hesla sa nezhoduju, skus znova."; exit 1; }
nmcli connection delete "pizzeria" >/dev/null 2>&1 || true
nmcli connection add type wifi con-name pizzeria ifname wlan0 ssid "$SSID" \
  wifi-sec.key-mgmt wpa-psk wifi-sec.psk "$PASS" connection.autoconnect yes connection.autoconnect-priority 10 >/dev/null
echo "HOTOVO. Wi-Fi '$SSID' je ulozena. V pizzerii sa Raspberry pripoji samo."
