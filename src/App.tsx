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
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 30px' }}>
        <Heading size="XLARGE">Government Advice Generator</Heading>
        
        <InsetText>
          This service uses AI to generate government-style advice pages. 
          The content is automatically created and should be verified for accuracy.
        </InsetText>
        
        <SectionBreak level="L" visible />
        
        {error && (
          <Panel title="Error" style={{ color: '#d4351c', borderColor: '#d4351c' }}>
            {error}
          </Panel>
        )}
        
        <form onSubmit={handleSubmit}>
          <TextArea
            hint="For example: 'how to apply for a passport' or 'rules for recycling in my area'"
            defaultValue="A simple page with text entry and a submit button for comments"
            input={{
              value: prompt,
              onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value),
              required: true,
              rows: 5
            }}
          >
            What government advice would you like?
          </TextArea>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button type="submit" loading={isLoading}>
              Generate Advice Page
            </Button>
            {isLoading && <Spinner />}
          </div>
        </form>
      </div>
    </>
  );
}

export default App;