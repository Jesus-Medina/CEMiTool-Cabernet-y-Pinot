#!/usr/bin/env bash
# Technical pilot only. Run inside WSL from the canonical repository root:
# bash scripts/post/21_t008_pilot_salmon_quant.sh /mnt/d/CEMiTool_T008_scratch SRR5560506
# --fldMean/--fldSD are explicit Salmon priors, not measured library lengths.
set -euo pipefail

if [[ $# -ne 2 || ! -f AGENTS.md ]]; then
  echo "Usage from repository root: $0 /mnt/.../T008_scratch SRR..." >&2
  exit 2
fi
scratch="${1%/}"
run="$2"
if [[ ! "$run" =~ ^SRR[0-9]+$ ]]; then
  echo "Invalid SRA run accession" >&2
  exit 2
fi
salmon="$scratch/tools/salmon-linux-x86_64/bin/salmon"
index="$scratch/reference/salmon_t2t_v5_1_index"
fastq="$scratch/raw/$run/$run.fastq.gz"
output="$scratch/quant/$run"
for required in "$salmon" "$index/versionInfo.json" "$index/info.json" "$fastq"; do
  if [[ ! -e "$required" ]]; then
    echo "Missing required pilot input: $required" >&2
    exit 1
  fi
done
if [[ -e "$output" ]]; then
  echo "Pilot output already exists; refusing to overwrite: $output" >&2
  exit 1
fi
export LOCPATH="$scratch/tools/locale"
export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8
"$salmon" quant \
  -i "$index" -l U -r "$fastq" \
  --fldMean 250 --fldSD 25 \
  --seqBias --dumpEq -p 2 -o "$output"
