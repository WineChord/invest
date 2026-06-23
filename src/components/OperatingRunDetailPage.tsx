import { ExternalLink, FileText, History, Home, ListChecks, ShieldCheck } from "lucide-react";
import type { LedgerEvent, OperatingRunRecord } from "../lib/portfolioData";

interface Props {
  ledgerEvents: LedgerEvent[];
  publicUrl: string;
  repositoryUrl: string;
  run: OperatingRunRecord;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 2,
  style: "currency",
});

export default function OperatingRunDetailPage({
  ledgerEvents,
  publicUrl,
  repositoryUrl,
  run,
}: Props) {
  return (
    <div className="invest-shell research-page-shell" data-market-colors="mainland">
      <main className="research-page operating-run-detail-page">
        <nav className="research-page-nav" aria-label="Operating run navigation">
          <a href={publicUrl}>
            <Home size={16} />
            <span>Dashboard</span>
          </a>
          <a href="../">
            <History size={16} />
            <span>All runs</span>
          </a>
          <a href={repositoryUrl} rel="noreferrer" target="_blank">
            <ExternalLink size={16} />
            <span>Repository</span>
          </a>
        </nav>

        <header className="research-page-hero operating-runs-hero">
          <div>
            <p className="eyebrow">{readableStatusLabel(run.runType)}</p>
            <h1>{run.title}</h1>
            <p>{run.decisionSummary}</p>
          </div>
          <div className="research-page-price">
            <span>{run.runDate}</span>
            <strong>{readableStatusLabel(run.status)}</strong>
            <small>{run.policyVersion}</small>
          </div>
        </header>

        <section className="publication-notice" aria-label="Publication boundary">
          <ShieldCheck size={18} />
          <p>
            <strong>Not investment advice.</strong> This is a delayed historical
            run record. Proposed or simulated actions are not current
            instructions. Confirmed execution appears only from linked ledger
            events.
          </p>
        </section>

        <section className="operating-run-detail-grid">
          <article className="operating-run-detail-main">
            <RunNarrativeBlock title="Analysis" value={run.analysisSummary} />
            <RunNarrativeBlock title="Decision result" value={run.decisionResult} />
            <RunNarrativeBlock title="Execution boundary" value={run.executionSummary} />
            <section className="operating-run-section">
              <div className="analysis-history-heading">
                <ListChecks size={16} />
                <span>Confirmed execution</span>
              </div>
              {ledgerEvents.length === 0 ? (
                <p>No confirmed ledger events are linked to this run.</p>
              ) : (
                <>
                  <div className="run-ledger-table-wrap">
                    <table className="run-ledger-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Action</th>
                          <th>Quantity</th>
                          <th>Average price</th>
                          <th>Net cash</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ledgerEvents.map((event) => (
                          <tr key={event.eventId}>
                            <td>{event.tradeDate}</td>
                            <td>
                              <strong>{event.side.toUpperCase()} {event.symbol}</strong>
                              <span>{event.eventId}</span>
                            </td>
                            <td>{formatQuantity(event.quantity)}</td>
                            <td>{formatCurrency(event.averagePrice)}</td>
                            <td>{formatCurrency(event.netCashEffect)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="run-ledger-card-list">
                    {ledgerEvents.map((event) => (
                      <article className="run-ledger-card" key={`${event.eventId}-card`}>
                        <header>
                          <span>{event.tradeDate}</span>
                          <strong>{event.side.toUpperCase()} {event.symbol}</strong>
                        </header>
                        <dl>
                          <div>
                            <dt>Quantity</dt>
                            <dd>{formatQuantity(event.quantity)}</dd>
                          </div>
                          <div>
                            <dt>Average price</dt>
                            <dd>{formatCurrency(event.averagePrice)}</dd>
                          </div>
                          <div>
                            <dt>Net cash</dt>
                            <dd>{formatCurrency(event.netCashEffect)}</dd>
                          </div>
                        </dl>
                        <small>{event.eventId}</small>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </section>
          </article>

          <aside className="operating-run-detail-side">
            <section className="research-page-snapshot">
              <RunFact label="Primary symbols" value={run.primarySymbols.join(" / ")} />
              <RunFact label="Publication" value={readableStatusLabel(run.publicationStatus)} />
              <RunFact label="Next trigger" value={run.nextReviewTrigger} />
              <RunFact label="Validation" value={run.validationSummary} />
            </section>
            <section className="operating-run-section">
              <div className="analysis-history-heading">
                <FileText size={16} />
                <span>Source files</span>
              </div>
              <div className="operating-run-source-list">
                <RepositoryLink
                  label="Decision note"
                  repositoryUrl={repositoryUrl}
                  sourcePath={run.linkedDecisionPath}
                />
                <RepositoryLink
                  label="Run artifact"
                  repositoryUrl={repositoryUrl}
                  sourcePath={run.linkedRunArtifactPath}
                />
                <RepositoryLink
                  label="Evidence packet"
                  repositoryUrl={repositoryUrl}
                  sourcePath={run.evidencePacketPath}
                />
              </div>
            </section>
            <section className="operating-run-section">
              <div className="analysis-history-heading">
                <ShieldCheck size={16} />
                <span>Notes</span>
              </div>
              <p>{run.notes}</p>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}

function RunNarrativeBlock({ title, value }: { title: string; value: string }) {
  return (
    <section className="operating-run-section">
      <div className="analysis-history-heading">
        <History size={16} />
        <span>{title}</span>
      </div>
      <p>{value}</p>
    </section>
  );
}

function RunFact({ label, value }: { label: string; value: string }) {
  return (
    <section>
      <h4>{label}</h4>
      <p>{value}</p>
    </section>
  );
}

function RepositoryLink({
  label,
  repositoryUrl,
  sourcePath,
}: {
  label: string;
  repositoryUrl: string;
  sourcePath: string;
}) {
  if (sourcePath === "") {
    return (
      <span className="operating-run-source-empty">
        <FileText size={14} />
        <span>{label}: not recorded</span>
      </span>
    );
  }

  return (
    <a
      className="research-source-link"
      href={repositoryFileUrl(repositoryUrl, sourcePath)}
      rel="noreferrer"
      target="_blank"
    >
      <ExternalLink size={14} />
      <span>{label}: {sourceLinkLabel(sourcePath)}</span>
    </a>
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

function formatCurrency(value: number | null): string {
  return value === null ? "N/A" : currencyFormatter.format(value);
}

function formatQuantity(value: number | null): string {
  return value?.toLocaleString("en-US", { maximumFractionDigits: 4 }) ?? "N/A";
}

function repositoryFileUrl(repositoryUrl: string, sourcePath: string): string {
  const encodedPath = sourcePath.split("/").map(encodeURIComponent).join("/");
  return `${repositoryUrl.replace(/\/$/, "")}/blob/main/${encodedPath}`;
}

function sourceLinkLabel(sourcePath: string): string {
  return sourcePath.split("/").at(-1) ?? sourcePath;
}
