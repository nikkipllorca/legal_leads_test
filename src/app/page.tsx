import CaseForm from '@/components/CaseForm';

export default function Home() {
  return (
    <main className="main-wrapper">
      <div className="info-section">
        <div className="badge">Texas Justice Hub</div>
        <h1>Fighting for <span>Texas Families.</span></h1>
        <p className="description">
          Texas roads rank as having the deadliest driving conditions in the USA.
          Over 4,000 deaths and 550,000 accidents occurred in 2024 alone.
        </p>

        <div className="features-grid">
          <div className="feature-item">
            <h3>Medical Bills</h3>
            <p>We track every expense.</p>
          </div>
          <div className="feature-item">
            <h3>Lost Wages</h3>
            <p>Recovering your future.</p>
          </div>
          <div className="feature-item">
            <h3>Family Support</h3>
            <p>Compassionate legal care.</p>
          </div>
          <div className="feature-item">
            <h3>Expert Trial</h3>
            <p>We don't back down.</p>
          </div>
        </div>

        <p style={{ fontStyle: 'italic', opacity: 0.8, borderLeft: '2px solid var(--gold)', paddingLeft: '20px' }}>
          "In addition to the traumatic experience of a wreck, victims suffer from medical bills, funeral expenses, and loss of work opportunity."
        </p>
      </div>

      <CaseForm />

      <footer>
        <div className="footer-content">
          <p>&copy; 2026 TEXAS JUSTICE HUB (TJH). ALL RIGHTS RESERVED.</p>
          <p>ATTORNEY ADVERTISING | CONFIDENTIAL | FREE EVALUATION | NO WIN NO FEE</p>
        </div>
      </footer>
    </main>
  );
}
