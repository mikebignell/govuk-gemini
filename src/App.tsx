// src/App.tsx
import { Amplify } from 'aws-amplify';
import { parseAmplifyConfig } from "aws-amplify/utils";
import outputs from '../amplify_outputs.json';

const amplifyConfig = parseAmplifyConfig(outputs);
Amplify.configure(
  {
    ...amplifyConfig,
    API: {
      ...amplifyConfig.API,
      REST: outputs.custom.API,
    },
  },
  {
    API: {
      REST: {
        retryStrategy: {
          strategy: 'no-retry', // Overrides default retry strategy
        },
      }
    }
  });

import { useState } from 'react';
import { Button, TextArea, Heading, Panel, SectionBreak, InsetText } from 'govuk-react';
import { GlobalStyle } from 'govuk-react';

function App() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Find the REST API endpoint from amplify_outputs.json
  const API_URL = outputs.custom?.API?.generatePageApi?.endpoint + "items";

  async function generatePage(input: { prompt: string }) {
    if (!API_URL) throw new Error('API endpoint not found in amplify_outputs.json');
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: input.prompt })
    });
    if (!response.ok) throw new Error('API error');
    // The lambda returns a string URL (possibly JSON-encoded)
    let url = await response.text();
    // If the response is JSON, parse it
    try {
      const parsed = JSON.parse(url);
      if (typeof parsed === 'string') url = parsed;
    } catch {}
    return url;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setError('Please enter your question');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const url = await generatePage({ prompt });
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
          
          <Button type="submit" loading={isLoading}>
            Generate Advice Page
          </Button>
        </form>
      </div>
    </>
  );
}

export default App;