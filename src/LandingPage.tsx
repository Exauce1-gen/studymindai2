import { useState } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [email, setEmail] = useState('');

  const handleGetStarted = () => {
    onGetStarted();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#07070f',
      color: '#e8e8f8',
      fontFamily: 'system-ui'
    }}>
      {/* Header/Nav */}
      <nav style={{
        padding: '20px 5%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(108,92,231,0.15)',
        position: 'sticky',
        top: 0,
        background: 'rgba(7,7,15,0.95)',
        backdropFilter: 'blur(12px)',
        zIndex: 100
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <div style={{
            width: 40,
            height: 40,
            background: 'linear-gradient(135deg, #6C5CE7, #fd79a8)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22
          }}>
            🧠
          </div>
          <div style={{fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px'}}>
            Study<span style={{color: '#6C5CE7'}}>Mind</span> AI
          </div>
        </div>
        <button
          onClick={handleGetStarted}
          style={{
            padding: '10px 24px',
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
            color: '#fff',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(108,92,231,0.4)'
          }}
        >
          Get Started Free
        </button>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '80px 5% 60px',
        maxWidth: 1200,
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-block',
          padding: '6px 16px',
          borderRadius: 20,
          background: 'rgba(108,92,231,0.15)',
          border: '1px solid rgba(108,92,231,0.3)',
          marginBottom: 24,
          fontSize: 13,
          fontWeight: 600,
          color: '#6C5CE7'
        }}>
          ✨ Free AI-Powered Study Assistant
        </div>

        <h1 style={{
          fontSize: 'clamp(40px, 8vw, 72px)',
          fontWeight: 900,
          lineHeight: 1.1,
          marginBottom: 24,
          background: 'linear-gradient(135deg, #e8e8f8, #6C5CE7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Learn Smarter<br />with AI
        </h1>

        <p style={{
          fontSize: 20,
          color: '#888',
          maxWidth: 600,
          margin: '0 auto 40px',
          lineHeight: 1.6
        }}>
          AI-powered summaries, quizzes, exams, and chat to help you learn faster and retain more.
        </p>

        <div style={{display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap'}}>
          <button
            onClick={handleGetStarted}
            style={{
              padding: '16px 32px',
              borderRadius: 14,
              border: 'none',
              background: 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
              color: '#fff',
              fontSize: 17,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(108,92,231,0.4)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            🚀 Start Learning Free
          </button>
          <button
            style={{
              padding: '16px 32px',
              borderRadius: 14,
              border: '1px solid #6C5CE7',
              background: 'transparent',
              color: '#6C5CE7',
              fontSize: 17,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            📹 Watch Demo
          </button>
        </div>

        <div style={{
          marginTop: 48,
          display: 'flex',
          gap: 32,
          justifyContent: 'center',
          flexWrap: 'wrap',
          fontSize: 14,
          color: '#888'
        }}>
          <div>✅ No credit card required</div>
          <div>✅ 100% Free to start</div>
          <div>✅ Unlimited AI summaries</div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{
        padding: '60px 5%',
        background: 'rgba(108,92,231,0.03)',
        borderTop: '1px solid rgba(108,92,231,0.1)',
        borderBottom: '1px solid rgba(108,92,231,0.1)'
      }}>
        <div style={{maxWidth: 1200, margin: '0 auto'}}>
          <h2 style={{
            fontSize: 40,
            fontWeight: 900,
            textAlign: 'center',
            marginBottom: 16
          }}>
            Everything you need to ace your studies
          </h2>
          <p style={{
            textAlign: 'center',
            color: '#888',
            fontSize: 18,
            marginBottom: 60,
            maxWidth: 600,
            margin: '0 auto 60px'
          }}>
            Powered by advanced AI to create personalized learning experiences
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24
          }}>
            {[
              {
                icon: '📄',
                title: 'AI Summaries',
                description: 'Get ultra-short, structured summaries of any topic in seconds. Perfect for quick revision.'
              },
              {
                icon: '🧩',
                title: 'AI Quizzes',
                description: 'Generate custom quizzes from your notes. Test your knowledge with instant feedback.'
              },
              {
                icon: '📝',
                title: 'AI Exams',
                description: 'Practice with full exams (QCM format). Get automatic grading and detailed corrections.'
              },
              {
                icon: '💬',
                title: 'AI Chat',
                description: 'Ask questions and get instant answers. Like having a personal tutor 24/7.'
              },
              {
                icon: '📋',
                title: 'Study Cards',
                description: 'AI-generated flashcards for effective memorization. Review anytime, anywhere.'
              },
              {
                icon: '📅',
                title: 'Study Planner',
                description: 'Organize your study schedule with AI recommendations for optimal learning.'
              }
            ].map((feature, i) => (
              <div key={i} style={{
                background: '#0e0e1d',
                border: '1px solid rgba(108,92,231,0.2)',
                borderRadius: 16,
                padding: 32,
                transition: 'all 0.3s'
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = 'rgba(108,92,231,0.5)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = 'rgba(108,92,231,0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{fontSize: 48, marginBottom: 16}}>{feature.icon}</div>
                <h3 style={{fontSize: 22, fontWeight: 800, marginBottom: 12}}>{feature.title}</h3>
                <p style={{color: '#888', lineHeight: 1.6}}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '80px 5%',
        textAlign: 'center'
      }}>
        <div style={{maxWidth: 1200, margin: '0 auto'}}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 48
          }}>
            {[
              { number: '100+', label: 'Active Students' },
              { number: '1000+', label: 'AI Summaries Created' },
              { number: '500+', label: 'Quizzes Generated' },
              { number: '4.9★', label: 'User Rating' }
            ].map((stat, i) => (
              <div key={i}>
                <div style={{
                  fontSize: 48,
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #6C5CE7, #fd79a8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: 8
                }}>
                  {stat.number}
                </div>
                <div style={{color: '#888', fontSize: 16}}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{
        padding: '80px 5%',
        background: 'rgba(108,92,231,0.03)',
        borderTop: '1px solid rgba(108,92,231,0.1)'
      }}>
        <div style={{maxWidth: 1000, margin: '0 auto'}}>
          <h2 style={{
            fontSize: 40,
            fontWeight: 900,
            textAlign: 'center',
            marginBottom: 60
          }}>
            Simple, transparent pricing
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24
          }}>
            {/* Free Plan */}
            <div style={{
              background: '#0e0e1d',
              border: '1px solid rgba(108,92,231,0.2)',
              borderRadius: 16,
              padding: 32
            }}>
              <div style={{fontSize: 32, marginBottom: 12}}>💎</div>
              <h3 style={{fontSize: 24, fontWeight: 800, marginBottom: 8}}>Free</h3>
              <div style={{fontSize: 40, fontWeight: 900, color: '#6C5CE7', marginBottom: 4}}>$0</div>
              <div style={{fontSize: 14, color: '#666', marginBottom: 24}}>per month</div>

              <ul style={{listStyle: 'none', padding: 0, marginBottom: 32}}>
                {[
                  '10 AI summaries/day',
                  '5 AI quizzes/day',
                  '2 exams/day',
                  'Basic AI chat',
                  'Study cards',
                  'Study planner'
                ].map((item, i) => (
                  <li key={i} style={{
                    padding: '8px 0',
                    color: '#888',
                    display: 'flex',
                    gap: 8
                  }}>
                    <span style={{color: '#6C5CE7'}}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleGetStarted}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 12,
                  border: '1px solid #6C5CE7',
                  background: 'transparent',
                  color: '#6C5CE7',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Start Free
              </button>
            </div>

            {/* Premium Plan */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(108,92,231,0.2), rgba(253,121,168,0.2))',
              border: '2px solid #6C5CE7',
              borderRadius: 16,
              padding: 32,
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: -12,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #6C5CE7, #fd79a8)',
                padding: '4px 16px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                whiteSpace: 'nowrap'
              }}>
                MOST POPULAR
              </div>

              <div style={{fontSize: 32, marginBottom: 12}}>🌟</div>
              <h3 style={{fontSize: 24, fontWeight: 800, marginBottom: 8}}>Premium</h3>
              <div style={{fontSize: 40, fontWeight: 900, color: '#6C5CE7', marginBottom: 4}}>$3</div>
              <div style={{fontSize: 14, color: '#888', marginBottom: 24}}>per month</div>

              <ul style={{listStyle: 'none', padding: 0, marginBottom: 32}}>
                {[
                  'UNLIMITED AI summaries',
                  'UNLIMITED AI quizzes',
                  'UNLIMITED exams',
                  'UNLIMITED AI chat',
                  'NO ADS',
                  'Priority support',
                  'Early access to new features'
                ].map((item, i) => (
                  <li key={i} style={{
                    padding: '8px 0',
                    color: '#e8e8f8',
                    display: 'flex',
                    gap: 8,
                    fontWeight: 600
                  }}>
                    <span style={{color: '#6C5CE7'}}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleGetStarted}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(108,92,231,0.4)'
                }}
              >
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '100px 5%',
        textAlign: 'center'
      }}>
        <div style={{maxWidth: 800, margin: '0 auto'}}>
          <h2 style={{
            fontSize: 48,
            fontWeight: 900,
            marginBottom: 24,
            lineHeight: 1.2
          }}>
            Ready to learn smarter?
          </h2>
          <p style={{
            fontSize: 20,
            color: '#888',
            marginBottom: 40
          }}>
            Join hundreds of students using AI to boost their grades.
          </p>
          <button
            onClick={handleGetStarted}
            style={{
              padding: '18px 48px',
              borderRadius: 14,
              border: 'none',
              background: 'linear-gradient(135deg, #6C5CE7, #8b5cf6)',
              color: '#fff',
              fontSize: 18,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 12px 32px rgba(108,92,231,0.4)'
            }}
          >
            🚀 Get Started Free
          </button>
          <div style={{marginTop: 16, fontSize: 14, color: '#666'}}>
            No credit card required • Start in seconds
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px 5%',
        borderTop: '1px solid rgba(108,92,231,0.1)',
        textAlign: 'center',
        color: '#666'
      }}>
        <div style={{marginBottom: 16}}>
          <span style={{fontWeight: 700, color: '#e8e8f8'}}>StudyMind AI</span> • Learn Smarter with AI
        </div>
        <div style={{fontSize: 13}}>
          © 2025 StudyMind AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
