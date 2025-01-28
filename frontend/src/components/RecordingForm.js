// ... imports ...

const RecordingForm = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const recognition = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognition.current = new webkitSpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      
      recognition.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        setTranscript(finalTranscript.trim());
      };
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => chunks.current.push(e.data);
      mediaRecorder.current.onstop = handleStop;
      
      mediaRecorder.current.start();
      if (recognition.current) {
        recognition.current.start();
      }
      setIsRecording(true);
      setTranscript('');
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      if (recognition.current) {
        recognition.current.stop();
      }
      setIsRecording(false);
    }
  };

  const handleStop = async () => {
    const blob = new Blob(chunks.current, { type: 'audio/wav' });
    const reader = new FileReader();
    
    reader.onloadend = async () => {
      const audioData = reader.result;
      onRecordingComplete({ audioData, transcript });
    };
    
    reader.readAsDataURL(blob);
  };

  return (
    <Box sx={{ mb: 4, textAlign: 'center' }}>
      <Button
        variant="contained"
        color={isRecording ? "error" : "primary"}
        onClick={isRecording ? stopRecording : startRecording}
        startIcon={isRecording ? <StopIcon /> : <MicIcon />}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </Button>
      {transcript && (
        <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
          "{transcript}"
        </Typography>
      )}
    </Box>
  );
};

export default RecordingForm;