import React from 'react';
import { AlertCircle, Server, Cpu, CloudLightning } from 'lucide-react';

export default function LaboratorySection() {
  return (
    <section
      id="laboratory"
      style={{
        position: 'relative',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        padding: '120px 0',
        zIndex: 10
      }}
    >
      <div className="container">
        <div
          style={{
            maxWidth: '820px',
            marginLeft: 'auto',
            backgroundColor: 'rgba(5, 5, 5, 0.82)',
            backdropFilter: 'blur(12px)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(200, 205, 216, 0.12)',
            padding: 'clamp(28px, 5vw, 64px)'
          }}
        >
          {/* Chapter Tag */}
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              textTransform: 'uppercase',
              color: 'var(--accent-green)',
              letterSpacing: '0.14em',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>ACT II</span>
            <span>/</span>
            <span>THE MYSTERIOUS LABORATORY</span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.4rem, 5.5vw, 4.4rem)',
              lineHeight: 1.05,
              fontWeight: 800,
              color: '#F4F1EB',
              marginBottom: '24px'
            }}
          >
            WHERE CLOUD MEETS IMAGINATION
          </h2>

          <p
            style={{
              fontSize: 'clamp(1.05rem, 1.4vw, 1.2rem)',
              lineHeight: 1.7,
              color: '#C8CDD8',
              marginBottom: '28px'
            }}
          >
            Operating entirely in a virtual format, this hackathon provides builders with the autonomy to design distributed systems from the ground up. Whether architecting serverless event pipelines, containerized backend services, or autonomous machine learning workflows, teams bring their technical visions into reality.
          </p>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.2vw, 1.1rem)',
              lineHeight: 1.7,
              color: '#C8CDD8',
              marginBottom: '32px'
            }}
          >
            Participants are encouraged to leverage the AWS Free Tier and existing builder tooling. All code and deployment configurations must be verified in repository documentation.
          </p>

          {/* Explicit Notice: No AWS service or paid resource is provided automatically */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              padding: '16px 20px',
              backgroundColor: 'rgba(23, 23, 23, 0.8)',
              border: '1px solid rgba(255, 176, 0, 0.3)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '32px'
            }}
          >
            <div style={{ color: 'var(--accent-amber)', marginTop: '2px', flexShrink: 0 }}>
              <AlertCircle size={20} />
            </div>
            <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#C8CDD8' }}>
              <strong style={{ color: '#F4F1EB' }}>Infrastructure Notice: </strong>
              No AWS service or paid resource is provided automatically by the organizers. Participants are responsible for configuring their own development environments and accounts within standard free tier parameters.
            </div>
          </div>

          {/* Architectural Pillars */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px'
            }}
          >
            <div style={{ padding: '16px', backgroundColor: '#171717', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(200, 205, 216, 0.08)' }}>
              <div style={{ color: 'var(--accent-green)', marginBottom: '8px' }}><Server size={20} /></div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: '#F4F1EB', marginBottom: '4px' }}>
                Serverless First
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Stateless compute, on-demand execution, and automated resource management.
              </div>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#171717', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(200, 205, 216, 0.08)' }}>
              <div style={{ color: 'var(--accent-orange)', marginBottom: '8px' }}><Cpu size={20} /></div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: '#F4F1EB', marginBottom: '4px' }}>
                Applied Intelligence
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Foundational model integration with clear validation boundaries.
              </div>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#171717', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(200, 205, 216, 0.08)' }}>
              <div style={{ color: 'var(--accent-purple)', marginBottom: '8px' }}><CloudLightning size={20} /></div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: '#F4F1EB', marginBottom: '4px' }}>
                Infrastructure as Code
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Repeatable architectures using AWS CDK or AWS CloudFormation.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
