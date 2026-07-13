export function trailingTwelveMonthPeriod(periodFacts, endBefore = null) {
  const eligible = periodFacts.filter(
    (fact) => endBefore === null || fact.end < endBefore,
  );
  const annual = eligible
    .filter((fact) => fact.fp === "FY" || durationDays(fact) > 300)
    .sort(compareFactsByEndAndFiled)
    .at(-1);
  const quarterly = latestQuarterlyFacts(eligible);

  if (annual !== undefined) {
    const postAnnual = quarterly
      .filter((fact) => fact.end > annual.end)
      .slice(-4);
    if (postAnnual.length === 0) {
      return { basis: "annual", end: annual.end, value: annual.value };
    }

    const priorComparables = postAnnual.map((fact) =>
      comparablePriorQuarter(quarterly, fact, annual.end),
    );
    if (priorComparables.every((fact) => fact !== null)) {
      return {
        basis: "annual_rollforward",
        end: postAnnual.at(-1).end,
        value:
          annual.value +
          sum(postAnnual.map((fact) => fact.value)) -
          sum(priorComparables.map((fact) => fact.value)),
      };
    }

    // SEC companyfacts often omits a standalone fourth-quarter frame in a
    // 10-K. A complete annual fact is safer than four non-contiguous quarters.
    return { basis: "annual", end: annual.end, value: annual.value };
  }

  if (quarterly.length >= 4) {
    const latestFour = quarterly.slice(-4);
    return {
      basis: "quarterly",
      end: latestFour.at(-1).end,
      value: sum(latestFour.map((fact) => fact.value)),
    };
  }

  const latestQuarter = quarterly.at(-1);
  return latestQuarter === undefined
    ? null
    : { basis: "latest_quarter", end: latestQuarter.end, value: latestQuarter.value };
}

export function selectTrailingTwelveMonthPeriod(
  periodFacts,
  { endBefore = null, preferLargest = false } = {},
) {
  const tagOrder = new Map();
  const factsByTag = new Map();
  periodFacts.forEach((fact) => {
    if (!tagOrder.has(fact.tag)) {
      tagOrder.set(fact.tag, tagOrder.size);
    }
    const facts = factsByTag.get(fact.tag) ?? [];
    facts.push(fact);
    factsByTag.set(fact.tag, facts);
  });

  const basisRank = {
    annual_rollforward: 3,
    annual: 2,
    quarterly: 1,
    latest_quarter: 0,
  };
  const candidates = [...factsByTag.entries()]
    .map(([tag, facts]) => {
      const period = trailingTwelveMonthPeriod(facts, endBefore);
      return period === null ? null : { ...period, tag };
    })
    .filter((period) => period !== null)
    .sort((left, right) => {
      const endOrder = right.end.localeCompare(left.end);
      if (endOrder !== 0) {
        return endOrder;
      }
      const basisOrder = basisRank[right.basis] - basisRank[left.basis];
      if (basisOrder !== 0) {
        return basisOrder;
      }
      if (preferLargest && Math.abs(right.value) !== Math.abs(left.value)) {
        return Math.abs(right.value) - Math.abs(left.value);
      }
      return tagOrder.get(left.tag) - tagOrder.get(right.tag);
    });
  return candidates.at(0) ?? null;
}

export function selectPreferredInstantFact(facts, tagCandidates) {
  const tagRank = new Map(tagCandidates.map((tag, index) => [tag, index]));
  return facts
    .filter((fact) => fact.end !== "" && fact.start === "")
    .sort((left, right) => {
      const factOrder = compareFactsByEndAndFiled(left, right);
      if (factOrder !== 0) {
        return factOrder;
      }
      // On the same reporting date, candidate order is semantic priority.
      // This prevents cash plus restricted cash from replacing unrestricted
      // corporate cash merely because the broader tag was visited later.
      return (tagRank.get(right.tag) ?? tagCandidates.length) -
        (tagRank.get(left.tag) ?? tagCandidates.length);
    })
    .at(-1) ?? null;
}

export function selectFreshShareCountFact({
  instantFacts,
  instantTagCandidates,
  periodFacts,
  periodTagCandidates,
  maxInstantStalenessDays = 180,
}) {
  const instant = selectPreferredInstantFact(instantFacts, instantTagCandidates);
  const period = selectPreferredPeriodFact(periodFacts, periodTagCandidates);
  if (instant === null) {
    return period === null ? null : { ...period, basis: "period_average_fallback" };
  }
  if (period === null) {
    return { ...instant, basis: "instant" };
  }

  const stalenessDays = Math.round(
    (Date.parse(`${period.end}T00:00:00Z`) - Date.parse(`${instant.end}T00:00:00Z`)) /
      (24 * 60 * 60 * 1000),
  );
  return stalenessDays > maxInstantStalenessDays
    ? { ...period, basis: "period_average_fallback" }
    : { ...instant, basis: "instant" };
}

function selectPreferredPeriodFact(facts, tagCandidates) {
  const tagRank = new Map(tagCandidates.map((tag, index) => [tag, index]));
  return facts
    .filter((fact) => fact.end !== "")
    .sort((left, right) => {
      const factOrder = compareFactsByEndAndFiled(left, right);
      if (factOrder !== 0) {
        return factOrder;
      }
      return (tagRank.get(right.tag) ?? tagCandidates.length) -
        (tagRank.get(left.tag) ?? tagCandidates.length);
    })
    .at(-1) ?? null;
}

function latestQuarterlyFacts(periodFacts) {
  const quarterlyByEnd = new Map();

  periodFacts
    .filter((fact) => fact.fp !== "FY")
    .filter((fact) => durationDays(fact) <= 115)
    .forEach((fact) => {
      const existing = quarterlyByEnd.get(fact.end);
      if (existing === undefined || compareFactsByEndAndFiled(existing, fact) < 0) {
        quarterlyByEnd.set(fact.end, fact);
      }
    });

  return [...quarterlyByEnd.values()].sort(compareFactsByEndAndFiled);
}

function comparablePriorQuarter(quarterly, current, annualEnd) {
  const expectedEnd = addDays(current.end, -365);
  const candidates = quarterly
    .filter((fact) => fact.end <= annualEnd)
    .filter((fact) => fact.fp === current.fp || current.fp === "")
    .map((fact) => ({
      distance: Math.abs(
        Date.parse(`${fact.end}T00:00:00Z`) -
          Date.parse(`${expectedEnd}T00:00:00Z`),
      ),
      fact,
    }))
    .filter(({ distance }) => distance <= 16 * 24 * 60 * 60 * 1000)
    .sort((left, right) => left.distance - right.distance);
  return candidates.at(0)?.fact ?? null;
}

function compareFactsByEndAndFiled(left, right) {
  const endOrder = left.end.localeCompare(right.end);
  if (endOrder !== 0) {
    return endOrder;
  }
  return left.filed.localeCompare(right.filed);
}

function durationDays(fact) {
  return Math.round(
    (Date.parse(`${fact.end}T00:00:00Z`) -
      Date.parse(`${fact.start}T00:00:00Z`)) /
      (24 * 60 * 60 * 1000),
  );
}

function addDays(date, days) {
  const timestamp = Date.parse(`${date}T00:00:00Z`);
  return new Date(timestamp + days * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}
