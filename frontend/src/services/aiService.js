const transcribeAudio = async (audioBlob) => {
  // Convert audio blob to base64
  const reader = new FileReader();
  const audioBase64 = await new Promise((resolve) => {
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(audioBlob);
  });

  try {
    const response = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-r1',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that transcribes audio and generates reports.'
          },
          {
            role: 'user',
            content: `Please transcribe this audio and summarize the key points: ${audioBase64}`
          }
        ]
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Transcription error:', error);
    return null;
  }
};

const generateDailyReport = async (transcriptions) => {
  try {
    const response = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-r1',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates daily activity reports.'
          },
          {
            role: 'user',
            content: `Generate a detailed daily report from these transcriptions:\n${transcriptions.join('\n')}`
          }
        ]
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Report generation error:', error);
    return null;
  }
};

export { transcribeAudio, generateDailyReport };