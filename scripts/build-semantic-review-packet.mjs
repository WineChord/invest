import {
  fileSha256,
  readJson,
  relativePath,
  requireNextArg,
  strictDate,
  writeJson,
} from "./semantic-discovery-lib.mjs";

const options = parseArgs(process.argv.slice(2));
const generatedAt = options.generatedAt ?? new Date().toISOString();
const semanticRun = readJson(options.semanticRun);

if (semanticRun.as_of !== options.asOf) {
  throw new Error(`--as-of ${options.asOf} does not match semantic run as_of ${semanticRun.as_of}`);
}

const result = {
  schema_version: 1,
  source: "semantic_review_packet",
  generated_at: generatedAt,
  as_of: options.asOf,
  semantic_run_path: relativePath(options.semanticRun),
  semantic_run_sha256: fileSha256(options.semanticRun),
  semantic_cache_path: semanticRun.cache_path,
  semantic_cache_sha256: semanticRun.cache_sha256,
  packet_artifact_path: semanticRun.packet_artifact_path,
  packet_artifact_sha256: semanticRun.packet_artifact_sha256,
  summary: {
    classifier_version: semanticRun.classifier_version,
    packet_count: semanticRun.packet_count,
    classified_current_count: semanticRun.classified_current_count,
    unclassified_count: semanticRun.unclassified_count,
    stale_cache_count: semanticRun.stale_cache_count,
    classification_coverage_ratio: semanticRun.classification_coverage_ratio,
    escalation_counts: semanticRun.escalation_counts,
    bottleneck_exposure_counts: semanticRun.bottleneck_exposure_counts,
    directness_counts: semanticRun.directness_counts,
    lane_counts: semanticRun.lane_counts,
  },
  xhigh_readiness_candidates: semanticRun.xhigh_readiness_candidates ?? [],
  medium_lane_compare: semanticRun.medium_lane_compare ?? [],
  reject_or_archive: semanticRun.reject_or_archive ?? [],
  none_sample: (semanticRun.no_escalation_sample ?? []).slice(0, options.noneSampleSize),
  review_questions: [
    "Which xhigh_readiness_candidate symbols are genuine material readiness sprint candidates versus known names, too-large mature issuers, weak proxies, or false positives?",
    "Which medium_lane_compare symbols should be promoted to xhigh, rejected, or kept cached until source evidence changes?",
    "Which lane keywords or issuer-profile fields caused noisy matches and should be tightened?",
    "Did the packet set miss a new structural bottleneck lane or newly public direct beneficiary that fixed screens could miss?",
  ],
};

writeJson(options.output, result);
console.log(`Wrote semantic review packet to ${options.output}.`);

function parseArgs(args) {
  const parsed = {
    noneSampleSize: 50,
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--as-of") {
      parsed.asOf = strictDate(requireNextArg(args, index, arg), "--as-of");
      index += 1;
    } else if (arg === "--generated-at") {
      parsed.generatedAt = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--semantic-run") {
      parsed.semanticRun = requireNextArg(args, index, arg);
      index += 1;
    } else if (arg === "--none-sample-size") {
      parsed.noneSampleSize = nonNegativeInteger(requireNextArg(args, index, arg), arg);
      index += 1;
    } else if (arg === "--output") {
      parsed.output = requireNextArg(args, index, arg);
      index += 1;
    } else {
      throw new Error(`Unsupported argument: ${arg}`);
    }
  }
  ["asOf", "semanticRun", "output"].forEach((field) => {
    if (parsed[field] === undefined) {
      throw new Error(`--${field.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)} is required`);
    }
  });
  return parsed;
}

function nonNegativeInteger(value, context) {
  if (!/^\d+$/.test(String(value))) {
    throw new Error(`${context} must be a non-negative integer`);
  }
  return Number(value);
}
