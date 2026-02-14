import React from "react";

export default function Landing({ onLoginClick, onRegisterClick }) {
    return (
        <div className="landing-container">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1>Student Grievance Redressal Portal</h1>
                    <p>
                        Ensuring a transparent, accountable, and responsive environment for
                        all students. Your voice matters.
                    </p>
                    <div className="cta-buttons">
                        <button className="btn-primary" onClick={onRegisterClick}>
                            File a Complaint
                        </button>
                        <button className="btn-secondary" onClick={onLoginClick}>
                            Login to Track Status
                        </button>
                    </div>
                </div>
            </section>

            {/* Information Cards */}
            <section className="info-section">
                <div className="info-card glass-panel">
                    <h3>📢 Raise Your Voice</h3>
                    <p>
                        Submit grievances related to academics, facilities, harassment, or
                        administration securely. We ensure your concerns reach the right
                        authority.
                    </p>
                </div>
                <div className="info-card glass-panel">
                    <h3>🔒 Privacy Guaranteed</h3>
                    <p>
                        Your identity is protected. We maintain strict confidentiality for
                        sensitive complaints to ensure student safety and trust.
                    </p>
                </div>
                <div className="info-card glass-panel">
                    <h3>⚡ Quick Resolution</h3>
                    <p>
                        Our dedicated committee reviews complaints within 24-48 hours. Track
                        current status and receive real-time updates on your dashboard.
                    </p>
                </div>
            </section>

            {/* Process Steps */}
            <section className="process-section">
                <h2>How It Works</h2>
                <div className="steps-container">
                    <div className="step">
                        <div className="step-number">1</div>
                        <h4>Register/Login</h4>
                        <p>Create an account to securely access the portal.</p>
                    </div>
                    <div className="step">
                        <div className="step-number">2</div>
                        <h4>Submit Grievance</h4>
                        <p>Fill out the detailed form with category and evidence.</p>
                    </div>
                    <div className="step">
                        <div className="step-number">3</div>
                        <h4>Investigation</h4>
                        <p>The committee reviews and investigates the issue.</p>
                    </div>
                    <div className="step">
                        <div className="step-number">4</div>
                        <h4>Resolution</h4>
                        <p>Receive a formal response and resolution action.</p>
                    </div>
                </div>
            </section>

            <footer className="footer">
                <p>© 2026 College Administration | Contact: grievance@college.edu</p>
                <p>Helpline: +91-98765-43210 (Mon-Fri, 9AM - 5PM)</p>
            </footer>
        </div>
    );
}
