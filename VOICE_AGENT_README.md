# Voice Agent Feature

This feature implements a real-time voice conversation capability using OpenAI's Realtime API, allowing users to have voice-to-voice conversations with the AI.

## Features

- **Real-time Voice Conversation**: Speak to the AI and receive voice responses
- **Voice Activity Detection**: Automatic detection of when the user starts and stops speaking
- **Transcription**: Real-time transcription of both user input and AI responses
- **Interruption Support**: Users can interrupt the AI while it's speaking
- **Same System Prompt**: Uses the same Christian-focused system prompt as the text chat

## Setup

### Prerequisites

1. **OpenAI API Key**: You need an OpenAI API key with access to the Realtime API
2. **HTTPS**: The voice agent requires HTTPS for microphone access (works on localhost for development)

### Environment Variables

Add your OpenAI API key to your `.env.local` file:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### Browser Permissions

The voice agent requires microphone permissions. Users will be prompted to allow microphone access when they start a conversation.

## Usage

### Accessing the Voice Agent

1. **Via Sidebar**: Click the "Voice Agent" button in the sidebar menu
2. **Via Header**: Click the microphone icon in the header
3. **Direct URL**: Navigate to `/chat/voice-agent`

### Using the Voice Agent

1. **Start Conversation**: Click the "Start Conversation" button
2. **Grant Permissions**: Allow microphone access when prompted
3. **Speak**: Start speaking - the AI will detect when you start and stop
4. **Listen**: The AI will respond with voice and display the transcript
5. **Interrupt**: You can interrupt the AI at any time by speaking
6. **End Conversation**: Click "End Conversation" to stop

## Technical Implementation

### Architecture

```
User Speech → Browser MediaRecorder → WebSocket → OpenAI Realtime API → Voice Response
```

### Components

- **VoiceAgentPage**: Main page component with UI and status management
- **VoiceAgentClient**: Core component handling WebSocket connection and audio
- **API Route**: `/api/voice-agent` for session management

### API Endpoints

- `POST /api/voice-agent` - Create new Realtime API session

### WebSocket Events

The implementation handles various OpenAI Realtime API events:
- `session.created` - Session initialization
- `input_audio_buffer.speech_started` - User starts speaking
- `input_audio_buffer.speech_stopped` - User stops speaking
- `response.audio.delta` - Streaming audio response
- `response.text.delta` - Streaming text response
- `conversation.item.input_audio_transcription.completed` - Transcription complete

## Configuration

### Audio Settings

- **Sample Rate**: 24kHz
- **Channels**: 1 (mono)
- **Format**: PCM16
- **Voice**: Alloy (configurable)

### Voice Activity Detection

- **Type**: Server-side VAD
- **Threshold**: 0.5
- **Prefix Padding**: 300ms
- **Silence Duration**: 200ms

### System Prompt

The voice agent uses the same comprehensive system prompt as the text chat, with additional instructions for voice conversation:

- Keep responses concise and conversational
- Use simple, clear language for speech
- Break long responses into digestible chunks
- Ask follow-up questions to maintain engagement

## Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support (macOS/iOS)
- **Edge**: Full support

## Troubleshooting

### Connection Issues

1. **Check API Key**: Ensure your OpenAI API key is valid and has Realtime API access
2. **HTTPS Required**: Voice features require HTTPS (localhost works for development)
3. **Firewall**: Ensure WebSocket connections to OpenAI are allowed

### Audio Issues

1. **Microphone Permissions**: Check browser permissions for microphone access
2. **Audio Device**: Ensure your microphone is working and selected
3. **Browser Support**: Some browsers may have limited WebRTC support

### Performance

1. **Network**: Stable internet connection required for real-time communication
2. **Latency**: Response times depend on network conditions and server load
3. **Battery**: Voice processing can be battery-intensive on mobile devices

## Development

### Local Development

1. Install dependencies: `npm install`
2. Set up environment variables
3. Run development server: `npm run dev`
4. Navigate to `http://localhost:3000/chat/voice-agent`

### Testing

- Test on different browsers and devices
- Verify microphone permissions work correctly
- Test interruption functionality
- Verify audio playback quality

## Future Enhancements

Potential improvements:

1. **Voice Selection**: Allow users to choose from different AI voices
2. **Language Support**: Multi-language voice conversations
3. **Audio Quality**: Enhanced audio processing and noise reduction
4. **Conversation History**: Save and replay voice conversations
5. **Push-to-Talk**: Alternative to voice activity detection
6. **Mobile App**: Native mobile app integration

## Security Considerations

- Microphone access requires user consent
- Audio data is processed in real-time, not stored
- WebSocket connections are secure (WSS)
- API keys are kept server-side only

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify API key and permissions
3. Test with different browsers/devices
4. Review OpenAI Realtime API documentation 