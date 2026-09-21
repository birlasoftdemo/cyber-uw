#!/usr/bin/env bash
# Generate humanized chapter VO for Agents Assist launch video (macOS say → m4a).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/vo"
mkdir -p "$OUT"
VOICE="${VO_VOICE:-Flo (English (US))}"
RATE="${VO_RATE:-155}"

# Apple Speech Synthesis Markup Language pauses for keynote pacing
chapters=(
  "01|Soft market. [[slnc 280]] Soft answers. [[slnc 320]] Throughput without truth fails the desk."
  "02|One shell for Ops and underwriting. [[slnc 260]] AI search finds the case worth opening."
  "03|The package lands. [[slnc 300]] Agents begin to think through the ingest."
  "04|Ideal versus Detected. [[slnc 280]] Every material gap cites its signal."
  "05|Appetite rules fire. [[slnc 240]] Tier assist is guidance. [[slnc 260]] Not a bound premium."
  "06|Know the book before you bind. [[slnc 260]] Stacked exposure. [[slnc 220]] Estimated A L E."
  "07|Quote. [[slnc 180]] Refer. [[slnc 180]] Decline. [[slnc 260]] An AI recommendation with confidence."
  "08|Referral chase lives in one inbox only. [[slnc 280]] Not five."
  "09|Human-in-the-loop. [[slnc 260]] The underwriter binds. [[slnc 280]] Every override stays explainable."
  "10|Approve before send to policy admin. [[slnc 280]] Sync when you're ready."
  "11|Agents assist. [[slnc 260]] Underwriter binds. [[slnc 280]] Every override is explainable."
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
  # CAF/AIFF → AAC m4a for Remotion
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
