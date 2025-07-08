# OpenAI Realtime API Voice Agent Implementation

## Overview

This implementation provides a complete voice agent solution using OpenAI's Realtime API, featuring:

- **Real-time speech-to-speech conversations** like ChatGPT's voice mode
- **ChatGPT-like visual indicators** (listening, thinking, speaking states)
- **Server VAD turn detection** with 2-second silence threshold
- **Interruption handling** - speak at any time to interrupt AI responses
- **Multilingual support** with automatic language detection
- **Christian AI assistant** with comprehensive theological knowledge

## Key Features

### 🎙️ Voice Interaction
- Click "Start Conversation" to begin
- Speak naturally - the AI will detect when you stop talking after 2 seconds
- Interrupt the AI at any time by speaking
- Real-time audio streaming with low latency

### 🎨 Visual Feedback
- **Blue animated bars** when listening to your voice
- **Purple bouncing dots** when AI is thinking
- **Green animated bars** when AI is speaking
- **Audio level visualization** responds to your voice

### 🔧 Technical Implementation
- **WebSocket connection** to OpenAI Realtime API
- **PCM16 audio encoding** for optimal quality
- **Server VAD** for natural turn detection
- **Automatic language detection** and response matching
- **Proper session management** with ephemeral keys

## Architecture

### API Routes

#### `/api/voice-agent` (POST)
Creates a new OpenAI Realtime session with:
- Model: `gpt-4o-realtime-preview-2024-12-17`
- Voice: `alloy`
- Turn detection: Server VAD with 2-second silence threshold
- Audio format: PCM16 at 24kHz
- Custom Christian AI system prompt

#### `/api/voice-agent/websocket` (GET)
Provides WebSocket connection details for client-side connection to OpenAI Realtime API.

### VoiceAgentClient Component

The main React component that handles:
- Session creation and management
- WebSocket connection to OpenAI Realtime API
- Audio input/output processing
- Visual state management
- Turn detection and interruption handling

## Setup Instructions

### 1. Environment Variables
Ensure you have your OpenAI API key set:
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 2. Dependencies
The implementation uses standard browser APIs:
- WebSocket API for real-time communication
- Web Audio API for audio processing
- MediaDevices API for microphone access

### 3. Browser Support
- Chrome (recommended)
- Safari
- Edge
- Firefox (limited support)

## Usage

### Starting a Conversation
1. Click "Start Conversation"
2. Allow microphone access when prompted
3. Speak naturally - the AI will respond after you stop talking for 2 seconds
4. Continue the conversation by speaking again

### Interrupting the AI
- Simply start speaking while the AI is responding
- The AI will stop and listen to your interruption
- Natural conversation flow is maintained

### Visual States
- **Listening**: Blue animated bars that respond to your voice level
- **Thinking**: Purple bouncing dots indicating AI processing
- **Speaking**: Green animated bars during AI response
- **Ready**: Microphone icon when ready for input

## Technical Details

### Audio Processing
- **Sample Rate**: 24kHz
- **Channels**: Mono
- **Format**: PCM16
- **Chunk Size**: 4096 samples
- **Echo Cancellation**: Enabled
- **Noise Suppression**: Enabled

### WebSocket Events
The implementation handles all OpenAI Realtime API events:
- `session.created` - Session initialization
- `input_audio_buffer.speech_started` - User starts speaking
- `input_audio_buffer.speech_stopped` - User stops speaking
- `response.audio.delta` - AI audio chunks
- `response.audio_transcript.delta` - AI transcript chunks
- `response.done` - AI response complete
- `error` - Error handling

### Turn Detection
- **Type**: Server VAD (Voice Activity Detection)
- **Threshold**: 0.5
- **Silence Duration**: 2000ms (2 seconds)
- **Prefix Padding**: 300ms

## Error Handling

### Connection Issues
- Automatic retry on connection failure
- Graceful degradation if WebSocket fails
- User-friendly error messages

### Audio Issues
- Microphone permission handling
- Audio context management
- Cleanup on component unmount

### API Errors
- Session expiration handling
- Rate limit management
- Error logging and recovery

## Performance Optimizations

### Audio Streaming
- Continuous audio buffering
- Efficient PCM16 encoding
- Minimal latency processing

### Memory Management
- Proper cleanup of audio contexts
- WebSocket connection management
- Reference cleanup on unmount

### Network Optimization
- Binary audio data transmission
- Efficient WebSocket message handling
- Session reuse when possible

## Troubleshooting

### Common Issues

1. **"Microphone access denied"**
   - Ensure HTTPS connection
   - Check browser permissions
   - Try refreshing the page

2. **"WebSocket connection failed"**
   - Verify OpenAI API key
   - Check network connectivity
   - Ensure proper session creation

3. **"No audio response"**
   - Check audio output device
   - Verify browser audio permissions
   - Try different browser

### Debug Mode
Enable console logging to see:
- WebSocket connection status
- Audio processing events
- API responses
- Error details

## Future Enhancements

### Planned Features
- [ ] Voice customization options
- [ ] Conversation history
- [ ] Multiple voice models
- [ ] Advanced audio processing
- [ ] Mobile app support

### Technical Improvements
- [ ] Better error recovery
- [ ] Audio quality optimization
- [ ] Network resilience
- [ ] Performance monitoring

## Security Considerations

### API Key Management
- Server-side session creation
- Ephemeral key usage
- No client-side API key exposure

### Audio Privacy
- Real-time processing only
- No audio storage
- Secure WebSocket connections

### Session Security
- Automatic session expiration
- Secure token handling
- Connection encryption

## Support

For issues or questions about the voice agent implementation:
1. Check the console for error messages
2. Verify your OpenAI API key and permissions
3. Ensure proper browser support
4. Review the troubleshooting section

## License

This implementation is part of the AHGPT project and follows the same licensing terms. 