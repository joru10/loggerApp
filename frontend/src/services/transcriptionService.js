export async function transcribeAudio(audioData, transcript = '') {
  try {
    console.log('Starting transcription process with transcript:', transcript);
    
    // Change the condition to check for both empty and 'No transcript available'
    if (!transcript || transcript === 'No transcript available') {
      console.log('Invalid transcript provided:', transcript);
      return { 
        transcript: transcript || 'No transcript available', 
        activities: [] 
      };
    }

    console.log('Processing valid transcript:', transcript);
    const requestBody = {
      messages: [
        {
          role: "system",
          content: "Extract activities from text. Output ONLY a JSON array of activities."
        },
        {
          role: "user",
          content: transcript
        }
      ],
      model: "phi-4",
      temperature: 0.1,
      max_tokens: -1,
      stream: false
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('LMStudio response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LMStudio error response:', errorText);
      throw new Error(`LLM API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('LMStudio raw response:', result);
    
    let activities = [];
    
    try {
      const content = result.choices[0].message.content.trim();
      activities = JSON.parse(content.replace(/```json\n|\n```/g, ''));
    } catch (error) {
      console.warn('Error parsing activities:', error);
      activities = [];
    }

    return { transcript, activities };
  } catch (error) {
    console.error('Error in transcribeAudio:', error);
    throw error;
  }
}