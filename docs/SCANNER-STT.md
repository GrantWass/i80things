# Scanner audio → tips: Broadcastify, local SDR and free speech-to-text

This is an engineering note, not a recommendation to auto-publish from radio. Every scanner item remains a tip until an agency confirms it.

## Is Broadcastify valuable for the daily agent?

**Somewhat — but not as the primary source.**

What it gives you:

- Real-time awareness of crashes, pursuits, closures, injuries and fires, often 10–30 minutes before a news release.
- Context for a story you are already covering ("units requested at mile 272").
- A way to know which agency to call for confirmation.

What it does not give you:

- Facts you can publish. Unit numbers, codes, partial descriptions and wrong locations are common.
- A clean API. Broadcastify requires a free account for live listening; archives and the Calls API are paid. Scraping the web player or rebroadcasting audio violates their terms.
- Coverage of every agency. There is no dedicated feed for NSP Troops B/C/D/E, Kearney PD, North Platte PD, Sidney PD or Kimball County law.

**Verdict:** for a once-a-day text desk, NSP releases + `npm run 511` + NWS + RSS already cover most stories. Scanner audio becomes valuable when you need minute-level breaking alerts for Instagram or when a major closure is developing and official feeds lag.

### Three ways to get audio, in order of practicality

1. **Broadcastify Calls API (paid, prepaid).** Archived calls with talkgroup, timestamp and audio. Much more useful for an agent than a live stream because it is asynchronous and metadata-rich. Requires an account and a small prepaid balance.
2. **Local SDR (best value for a serious setup).** An RTL-SDR dongle (~$35–$100) plus a trunking decoder (SDRTrunk, OP25) can receive the Nebraska State Radio System and local P25 systems. Free software, no Broadcastify terms, but you need a machine and antenna near the corridor.
3. **Broadcastify live player (manual monitoring only).** Free account, browser, human ears. Do not build an automated recorder around the player without permission.

## Free speech-to-text options

| Tool | Cost | Runs where | Good for | Caveat |
| --- | --- | --- | --- | --- |
| **faster-whisper** | Free | Mac/Linux/Windows, CPU or GPU | Best accuracy per dollar; batch transcription | Python; needs VAD to avoid hallucinations |
| **whisper.cpp** | Free | Mac (Metal/CoreML), Linux, CPU | Local, scriptable, low dependencies | Manual model setup |
| **Vosk** | Free | CPU, Raspberry Pi | Streaming keyword spotting | Lower accuracy on noisy radio |
| **Moonshine** | Free | CPU/GPU | Very fast short clips | Less mature ecosystem |
| **Web Speech API** | Free | Chrome browser | Quick ad-hoc tests | Cloud-backed, not for unattended servers |
| **Cloud free tiers** | Limited | APIs | Prototyping | 60 min/month or similar; not enough for 24/7 |

**Recommendation:** `faster-whisper` with `small.en` or `medium.en`, Silero VAD, and a domain prompt. On an Apple Silicon Mac with 16 GB, `medium.en` is close to real-time; `small.en` is faster and good enough for keyword triage.

## A minimal pipeline

```
audio (SDR / Calls API archive)
  → ffmpeg: 16 kHz mono WAV, 20–30s segments
  → Silero VAD: drop silence, tones and music
  → faster-whisper: transcribe with a Nebraska prompt
  → keyword/regex filter: I-80, mile, crash, rollover, closure, pursuit, injury, semi
  → dedupe + score by mile marker and talkgroup
  → /tmp/scanner-tips.json
  → human/agent verifies with NSP, 511 or the agency
  → publish only confirmed facts
```

### ffmpeg segmenting

```bash
ffmpeg -i input.mp3 -ar 16000 -ac 1 -f segment -segment_time 25 \
  -af "silenceremove=stop_periods=-1:stop_duration=1:stop_threshold=-40dB" \
  /tmp/radio-%03d.wav
```

### faster-whisper

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install faster-whisper

python3 - <<'PY'
from faster_whisper import WhisperModel
model = WhisperModel("small.en", device="cpu", compute_type="int8")
segments, info = model.transcribe(
    "/tmp/radio-001.wav",
    language="en",
    beam_size=5,
    vad_filter=True,
    condition_on_previous_text=False,
    initial_prompt="Nebraska I-80 traffic. Kearney, Lexington, North Platte, Ogallala, Sidney, Kimball, Nebraska State Patrol, NDOT, mile marker, crash, closure, pursuit.",
)
for segment in segments:
    print(f"{segment.start:.1f}-{segment.end:.1f}: {segment.text}")
PY
```

Whisper is prone to inventing phrases during silence or radio tones. Always run VAD, discard low-confidence/no-speech segments, and never publish a transcript without confirmation.

### whisper.cpp

```bash
git clone https://github.com/ggerganov/whisper.cpp && cd whisper.cpp
make
bash ./models/download-ggml-model.sh small.en
./main -m models/ggml-small.en.bin -f /tmp/radio-001.wav -l en --prompt "Nebraska I-80 traffic"
```

### Keyword triage

```js
const HITS = /\b(i[- ]?80|mile|mm|crash|rollover|collision|closed|closure|pursuit|injur|semi|tanker|jackknife)\b/i;
if (HITS.test(transcript)) queue.push({ transcript, source, receivedAt: new Date().toISOString() });
```

## Legal and ethical guardrails

- Nebraska allows listening to unencrypted public-safety radio (Neb. Rev. Stat. § 86-290). Publishing unlawfully intercepted content is separate and illegal.
- Do not rebroadcast or host audio. Do not defeat the intentional delays some agencies apply.
- Do not publish tactical movements, officer positions, victim identities or medical details.
- A transcript is not confirmation. Call the agency. If nobody confirms it, it does not run.
- Delete raw audio when it is no longer needed. Keep only the confirmed facts and your notes.

## Hardware and cost

- **Mac mini M-series, 16 GB:** can run `medium.en` near real-time; ~$600 new, less used. A spare PC works.
- **RTL-SDR + antenna:** ~$35–$100.
- **Broadcastify Premium:** roughly $15 per 6 months; Calls API prepaid, minimum ~$5.
- **Storage:** 16 kHz mono WAV is ~115 MB/hour per stream. Compress or delete after transcription.

## Bottom line

Start with `npm run 511`, NSP, NDOT, NWS and RSS. That is enough for a strong daily desk. Add scanner transcription only when you need a breaking-news edge, and treat every transcript as an unverified tip.
