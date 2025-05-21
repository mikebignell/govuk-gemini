// src/App.tsx
import { useState } from 'react';
import { generatePage } from './graphql/mutations';
import { Button, TextArea, Heading, Panel, SectionBreak, InsetText } from 'govuk-react';
import { GlobalStyle } from 'govuk-react';

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
      let url: string | undefined;

      if (typeof response === 'string') {
        url = response;
      } else if (response && typeof response === 'object' && 'data' in response && response.data?.generatePage) {
        url = response.data.generatePage;
      } else if (response && typeof response === 'object' && 'generatePage' in response) {
        url = (response as any).generatePage;
      }

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