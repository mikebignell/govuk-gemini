// src/App.tsx
import { Amplify } from 'aws-amplify';
import { parseAmplifyConfig } from "aws-amplify/utils";
import outputs from '../amplify_outputs.json';

const amplifyConfig = parseAmplifyConfig(outputs);

Amplify.configure(amplifyConfig);

import { generatePage } from './graphql/mutations'; // Import mutations to ensure they are registered
import { useState } from 'react';
import { Button, TextArea, Heading, Panel, SectionBreak, InsetText } from 'govuk-react';
import { GlobalStyle } from 'govuk-react';

// Simple spinner component
const Spinner = () => (
  <span
    style={{
      display: 'inline-block',
      width: 20,
      height: 20,
      marginLeft: 10,
      border: '3px solid #b1b4b6',
      borderTop: '3px solid #1d70b8',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      verticalAlign: 'middle',
    }}
    aria-label="Loading"
  />
);

// Add spinner keyframes to global style
const spinnerStyle = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`;

function App() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setError('Please enter your question');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await generatePage({ prompt });
      const url = response?.data;

      if (url) {
        window.location.href = url;
      } else {
        setError('Unexpected response from server.');
      }
    } catch (err) {
      setError('Failed to generate page. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <GlobalStyle />
      <style>{spinnerStyle}</style>
      {/* GOV.UK Header */}
      <header style={{ background: '#0b0c0c', color: 'white', padding: 0, marginBottom: 0, borderBottom: '4px solid #fd0' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 30px', display: 'flex', alignItems: 'center', height: 60 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'white' }}>
            <span style={{ display: 'inline-block', marginRight: 8, height: 32 }}>
              {/* Crown SVG from GOV.UK */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 32" width="36" height="32" aria-hidden="true" focusable="false"><path fill="white" d="M6.6 13.2L0 6.6l2.2 10.2L6.6 13.2zm22.8 0l4.4 3.6 2.2-10.2-6.6 6.6zM18 0l-4.4 13.2h8.8L18 0zm-7.2 16.8l-2.2 7.2h18.8l-2.2-7.2H10.8zm-3.6 9.6v2.4h21.6v-2.4H7.2zm0 4.8v1.6c0 .4.4.8.8.8h20c.4 0 .8-.4.8-.8v-1.6H7.2z"/></svg>
            </span>
            <span style={{ fontWeight: 700, fontSize: 28, letterSpacing: 1, lineHeight: 1, fontFamily: 'GDS Transport, Arial, sans-serif' }}>
              GOV.UK
            </span>
          </a>
          <span style={{ marginLeft: 16, fontSize: 18, fontWeight: 400, color: '#fff', opacity: 0.8 }}>
            Page Generator (AI Demo) By Mike Bignell
          </span>
        </div>
      </header>
      <main style={{ background: '#fff', minHeight: 'calc(100vh - 180px)', paddingTop: 40, paddingBottom: 40 }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 30px' }}>
          <Heading size="XLARGE">GOV.UK Design System Page Generator</Heading>
          <InsetText>
            This service uses AI to generate example pages in the style of the GOV.UK Design System. It is <b>not</b> an official UK government service and is <b>not associated with the UK government</b> in any way. The content is automatically created and should not be considered official advice or guidance.
          </InsetText>
          <SectionBreak level="L" visible />
          {error && (
            <Panel title="Error" style={{ color: '#d4351c', borderColor: '#d4351c' }}>
              {error}
            </Panel>
          )}
          <form onSubmit={handleSubmit}>
            <TextArea
              hint="For example: 'create a passport application page' or 'generate a recycling information page'"
              defaultValue="A simple page with text entry and a submit button for comments"
              input={{
                value: prompt,
                onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value),
                required: true,
                rows: 5
              }}
            >
              What GOV.UK-style page would you like to generate?
            </TextArea>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Button type="submit" loading={isLoading}>
                Generate Page
              </Button>
              {isLoading && <Spinner />}
            </div>
          </form>
          <Panel style={{ background: '#fff3bf', borderColor: '#ffbf47', color: '#594d00', marginBottom: 24 }} title="Notice">
            Due to limitations on AWS, this page can only process requests for up to <b>30 seconds</b>. If you receive an error, please try re-submitting your request or make the page less complex.
          </Panel>
        </div>
      </main>
      {/* Footer */}
      <footer style={{ background: '#f3f2f1', color: '#505a5f', marginTop: 0, padding: '24px 0', fontSize: 16, borderTop: '1px solid #b1b4b6' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 30px' }}>
          <p style={{ margin: 0 }}>
            This tool is a demonstration of AI-generated GOV.UK Design System pages. It is not affiliated with or endorsed by the UK government. All content is for illustrative purposes only.
          </p>
        </div>
      </footer>
    </>
  );
}

export default App;