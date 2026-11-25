# Záloha – pôvodný hlas agenta Family Sečovce (pred prepnutím na Adama, 25.11.2026 19:20)

Agent: agent_5301m53ceg94f4ebxqyhbpv7rt4q (ElevenLabs, api.us.elevenlabs.io)

## Pôvodné nastavenie hlasu (TTS)
- voice_id: 9Nd358gE1qQp0pDh8FgP – „Julia – Young & Airy“ (slovenský ženský, knižnica ElevenLabs, sadzba ×1)
- model_id: eleven_v4_turbo
- stability: 0.5, similarity_boost: 0.75, speed: 1

## Pôvodný prompt (ženský rod)
- commit d5c827ba035fdc4c25c654e358550ba2607d6e4e, git tag `zaloha-julia-2026-11-25`
- https://raw.githubusercontent.com/Miteso/bidovce/d5c827ba035fdc4c25c654e358550ba2607d6e4e/agent/family-secovce.txt

## Návrat na Juliu
PATCH /v1/convai/agents/agent_5301m53ceg94f4ebxqyhbpv7rt4q
{"conversation_config": {"tts": {"voice_id": "9Nd358gE1qQp0pDh8FgP"}, "agent": {"prompt": {"prompt": <text z commitu d5c827b>}}}}

Vety zo servera (Supabase) sú od 25.11. bez rodu („Mám to zapísané“, „Zmena je poslaná do kuchyne“, „Je to pridané k objednávke“, „Objednávka číslo X je zrušená“) – sedia pre oba hlasy, pri návrate sa nemenia.

## Nový hlas
- voice_id: 2ST3sI2j7fz4A5oXjnbA – „Adam – Young and Energetic“ (slovenský mužský, knižnica ElevenLabs, sadzba ×1)
