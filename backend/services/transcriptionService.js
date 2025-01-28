import fetch from 'node-fetch';
import FormData from 'form-data';

  const LOCAL_AI_URL = 'http://localhost:1234/v1/chat/completions';
  
  const fetchWithTimeout = async (url, options, timeout = 5000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  export async function processRecording(audioData, transcript = '') {
    const maxRetries = 2;
    let attempt = 0;

    if (!transcript || transcript.trim() === '') {
      console.warn('Empty transcript received');
      return { transcript: '', activities: [] };
    }

    console.log('Received transcript for processing:', transcript);

    while (attempt < maxRetries) {
      try {
        console.log(`Processing attempt ${attempt + 1} for transcript:`, transcript);
        
        const response = await fetchWithTimeout(LOCAL_AI_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content: "You are a helpful assistant that extracts activities from transcripts. Your response should be ONLY a JSON array of activities, without any additional text. Example: [\"activity 1\", \"activity 2\"]. If no activities found, respond with []"
              },
              {
                role: "user",
                content: transcript
              }
            ],
            temperature: 0.1,  // Reduced temperature for more consistent output
            max_tokens: 500
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('LLM response error:', response.status, errorText);
          throw new Error(`LLM request failed: ${response.status}`);
        }

        const result = await response.json();
        console.log('Raw LLM response:', JSON.stringify(result, null, 2));

        let activities = [];
        const content = result.choices[0].message.content.trim();
        
        try {
          // Try to parse the content directly first
          activities = JSON.parse(content);
        } catch (parseError) {
          console.log('Direct parse failed, trying to extract JSON array');
          // If direct parse fails, try to extract JSON array from the text
          const match = content.match(/\[.*\]/s);
          if (match) {
            activities = JSON.parse(match[0]);
          } else {
            console.warn('Could not extract activities from response');
            activities = [];
          }
        }

        console.log('Successfully extracted activities:', activities);
        return { transcript, activities };
      } catch (error) {
        console.error(`Error in processRecording attempt ${attempt + 1}:`, error);
        attempt++;
        if (attempt === maxRetries) {
          return { transcript, activities: [] };
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
}