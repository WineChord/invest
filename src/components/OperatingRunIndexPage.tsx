import { ExternalLink, Home, History, ListChecks, ShieldCheck } from "lucide-react";
import type { OperatingRunRecord } from "../lib/portfolioData";

interface Props {
  publicUrl: string;
  repositoryUrl: string;
  runs: OperatingRunRecord[];
}

export default function OperatingRunIndexPage({
  publicUrl,
  repositoryUrl,
  runs,
}: Props) {
  return (
    <div className="invest-shell research-page-shell" data-market-colors="mainland">
      <main className="research-page operating-runs-page">
        <nav className="research-page-nav" aria-label="Operating run navigation">
          <a href={publicUrl}>
            <Home size={16} />
            <span>Dashboard</span>
          </a>
          <a href={repositoryUrl} rel="noreferrer" target="_blank">
            <ExternalLink size={16} />
            <span>Repository</span>
          </a>
        </nav>

        <header className="research-page-hero operating-runs-hero">
          <div>
            <p className="eyebrow">Full-cycle audit</p>
            <h1>Operating Runs</h1>
            <p>Durable summaries of full repository cycles, decisions, validation, and confirmed historical execution links.</p>
          </div>
          <div className="research-page-price">
            <span>Recorded runs</span>
            <strong>{runs.length}</strong>
            <small>Newest first</small>
          </div>
        </header>

        <section className="publication-notice" aria-label="Publication boundary">
          <ShieldCheck size={18} />
          <p>
            <strong>Not investment advice.</strong> These pages are delayed
            historical process records. Execution appears only when linked to
            confirmed ledger events, never from recommendations or simulations.
          </p>
        </section>

        <section className="operating-run-index">
          {runs.map((run) => (
            <article className="operating-run-index-card" key={run.runId}>
              <div className="operating-run-card-head">
                <div>
                  <span>{run.runDate}</span>
                  <h2>{run.title}</h2>
                </div>
                <span className={`operating-run-status operating-run-status-${run.status}`}>
                  {readableStatusLabel(run.status)}
                </span>
              </div>
              <p>{run.decisionSummary}</p>
              <dl className="operating-run-index-grid">
                <div>
                  <dt>Primary symbols</dt>
                  <dd>{run.primarySymbols.join(" / ")}</dd>
                </div>
                <div>
                  <dt>Execution</dt>
                  <dd>{run.executionSummary}</dd>
                </div>
                <div>
                  <dt>Validation</dt>
                  <dd>{run.validationSummary}</dd>
                </div>
              </dl>
              <div className="operating-run-actions">
                <a className="research-action-link" href={`${run.runId}/`}>
                  <ListChecks size={14} />
                  <span>Open detail</span>
                </a>
                <a
                  className="research-action-link"
                  href={repositoryFileUrl(repositoryUrl, run.linkedDecisionPath)}
                  rel="noreferrer"
                  target="_blank"
                >
                  <History size={14} />
                  <span>Decision note</span>
                </a>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

function readableStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    completed_with_confirmed_execution: "Confirmed Execution",
    completed_no_action: "Completed No Action",
    local_unpublished_actionable_decision: "Publication Embargo",
    expired_no_execution: "Expired No Execution",
    superseded: "Superseded",
  };
  if (labels[status]) {
    return labels[status];
  }

  return status
    .split("_")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function repositoryFileUrl(repositoryUrl: string, sourcePath: string): string {
  const encodedPath = sourcePath.split("/").map(encodeURIComponent).join("/");
  return `${repositoryUrl.replace(/\/$/, "")}/blob/main/${encodedPath}`;
}
