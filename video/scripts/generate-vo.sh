#!/usr/bin/env bash
# Investor VO for Clueso-style Cyber Submission Automation launch (macOS say → m4a).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/vo"
mkdir -p "$OUT"
VOICE="${VO_VOICE:-Flo (English (US))}"
RATE="${VO_RATE:-148}"

chapters=(
  "01|Every cyber submission contains a risk story. [[slnc 320]] The problem is that the story arrives in pieces."
  "02|Cyber Submission Automation turns the inbound pack into one evolving record."
  "03|It reads the pack, [[slnc 220]] structures the facts, [[slnc 220]] and keeps the source."
  "04|Risk comparison puts received against permitted. [[slnc 280]] Claimed control, versus the floor."
  "05|Risk factors and appetite assemble around the same file."
  "06|The underwriter opens a brief, [[slnc 240]] not a pile of documents."
  "07|Automation prepares the decision. [[slnc 300]] The underwriter keeps the authority."
  "08|From fragmented submissions [[slnc 240]] to decision-ready underwriting."
)

echo "Voice: $VOICE @ ${RATE} wpm → $OUT"
manifest="$OUT/durations.json"
echo "{" > "$manifest"
first=1
for entry in "${chapters[@]}"; do
  id="${entry%%|*}"
  text="${entry#*|}"
  aiff="$OUT/${id}.aiff"
  m4a="$OUT/${id}.m4a"
  say -v "$VOICE" -r "$RATE" -o "$aiff" "$text"
  afconvert "$aiff" "$m4a" -d aac -f m4af -s 3 -b 128000
  rm -f "$aiff"
  dur=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$m4a")
  printf '  %s: %ss\n' "$id" "$dur"
  if [[ $first -eq 1 ]]; then first=0; else echo "," >> "$manifest"; fi
  printf '  "%s": %s' "$id" "$dur" >> "$manifest"
done
echo "" >> "$manifest"
echo "}" >> "$manifest"
echo "Wrote $manifest"
