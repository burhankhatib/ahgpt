# Voice Agent Setup Guide

## 🎯 Overview

This implementation provides a complete voice agent solution using OpenAI's Realtime API with **WebRTC** for real-time voice conversations. This approach works perfectly with Vercel deployment since it creates a direct browser-to-OpenAI connection without requiring server-side WebSocket proxies.

## 🔧 Architecture

```
Browser (WebRTC) → OpenAI Realtime API (WebRTC)
```

The browser creates a direct WebRTC connection to OpenAI's Realtime API using ephemeral tokens for authentication.

## 🚀 Quick Start

### 1. Deploy to Vercel

```bash
# Deploy your app
vercel deploy
```

### 2. Set Environment Variables

In your Vercel dashboard, add:
- `OPENAI_API_KEY`: Your OpenAI API key

### 3. Test the Voice Agent

1. **Navigate to**: `https://yourdomain.com/chat/voice-agent`
2. **Click "Start Conversation"**: This will:
   - Create an OpenAI session with ephemeral token
   - Establish a WebRTC connection directly to OpenAI
   - Start the voice conversation

## 🎙️ How It Works

### WebRTC Connection Process

1. **Session Creation**: Creates an ephemeral token via `/api/voice-agent`
2. **WebRTC Setup**: Browser creates RTCPeerConnection with data channel
3. **SDP Exchange**: Sends offer to OpenAI, receives answer
4. **Connection Established**: Direct browser-to-OpenAI WebRTC connection
5. **Voice Conversation**: Real-time audio streaming with AI responses

### Key Features

✅ **Real-time Voice Conversation** like ChatGPT
✅ **ChatGPT-like Visual Indicators** (listening, thinking, speaking)
✅ **Server VAD with 2-second silence threshold** 
✅ **Interruption handling** (speak to interrupt AI)
✅ **Christian AI assistant** with comprehensive instructions
✅ **Multilingual support** (responds in user's language)
✅ **Vercel-compatible** (no server-side WebSocket required)

## 🔍 Debugging

### Check Browser Console
- Open Developer Tools (F12)
- Look for connection messages and WebRTC events
- Check for any authentication errors

### Common Issues

1. **"Disconnected" Status**: 
   - Check if OPENAI_API_KEY environment variable is set
   - Verify OpenAI API key has access to Realtime API
   - Ensure you have proper OpenAI billing setup

2. **Microphone Permission**:
   - Grant microphone access when prompted
   - Check browser settings if no prompt appears

3. **Audio Issues**:
   - Ensure speakers/headphones are working
   - Check browser audio permissions
   - Try refreshing the page

## 🛠️ Technical Details

### API Routes
- **Session Creation**: `/api/voice-agent` - Creates ephemeral tokens

### WebRTC Configuration
- **ICE Servers**: Uses Google's STUN server for NAT traversal
- **Audio Format**: PCM16 (48kHz) with automatic echo cancellation
- **Data Channel**: `oai-events` for bidirectional event communication

### Authentication
- Server-side API key creates ephemeral tokens
- Ephemeral tokens used for WebRTC SDP exchange
- Browser never exposes the actual API key

## 📋 Session Configuration

The voice agent is configured with:

```javascript
{
  instructions: "Christian AI assistant with theological knowledge",
  voice: "alloy",
  turn_detection: {
    type: "server_vad",
    threshold: 0.5,
    prefix_padding_ms: 300,
    silence_duration_ms: 2000
  },
  input_audio_format: "pcm16",
  output_audio_format: "pcm16",
  input_audio_transcription: {
    model: "whisper-1"
  }
}
```

## 🎯 Event Handling

The system handles these OpenAI Realtime API events:

- `session.created` - Session establishment
- `input_audio_buffer.speech_started` - User starts speaking
- `input_audio_buffer.speech_stopped` - User stops speaking
- `conversation.item.input_audio_transcription.completed` - User transcript ready
- `response.created` - AI starts generating response
- `response.audio_transcript.delta` - AI transcript streaming
- `response.audio.delta` - AI audio streaming
- `response.done` - AI response complete

## 🔒 Security

- API keys are never exposed to the browser
- Ephemeral tokens have limited lifespan (30 minutes)
- Direct WebRTC connection eliminates proxy vulnerabilities
- HTTPS required for WebRTC functionality

## 🚀 Deployment

### Vercel Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Set `OPENAI_API_KEY` environment variable
4. Deploy - WebRTC works automatically!

### Environment Variables
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify your OpenAI API key and billing status
3. Ensure microphone permissions are granted
4. Try refreshing the page to reset WebRTC connection

## 🎉 Benefits Over WebSocket Approach

- **Vercel Compatible**: No server-side WebSocket proxy required
- **Lower Latency**: Direct browser-to-OpenAI connection
- **More Stable**: WebRTC handles network issues better
- **Better Audio Quality**: Opus codec with built-in error correction
- **Easier Deployment**: Works on any serverless platform 