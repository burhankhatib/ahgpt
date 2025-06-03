# Dynamic Language Detection System

## Overview

The Al Hayat GPT chatbot now features an advanced, real-time language detection system that automatically adapts to language changes throughout a conversation. This system is designed to be highly flexible and responsive to multilingual users who may switch languages mid-conversation.

## Key Features

### 🔄 **Real-Time Language Detection**
- Detects language changes as the user types (with 800ms debouncing)
- Automatically switches between RTL (Arabic, Hebrew, Urdu, Balochi) and LTR languages
- Minimum 8 characters required before triggering detection to avoid false positives

### 🧠 **Intelligent Context Awareness**
- Considers the last 3 messages for context-aware detection
- Weights recent messages more heavily (3x weight for latest, 2x for second-latest)
- Analyzes conversation patterns to make smarter language decisions

### 📊 **Confidence-Based Switching**
The system uses multiple factors to calculate confidence before switching languages:

1. **Script Difference** (40% weight): High confidence for RTL ↔ LTR switches
2. **Message Length** (10-30% weight): Longer messages = higher confidence
3. **Recent Context** (20% weight): Consistency with recent conversation
4. **Script Dominance** (10% weight): How dominant the detected script is in the text

**Minimum 50% confidence required** for automatic language switching.

### 🎯 **Smart Detection Algorithms**

#### Character-Based Detection
- Immediate detection for non-Latin scripts (Arabic, Hebrew, Chinese, etc.)
- Script-specific Unicode ranges for accurate identification
- Fallback to statistical analysis for Latin scripts

#### Statistical Analysis
- Uses `franc` library for Latin script language detection
- Requires minimum 10 characters for statistical accuracy
- Supports 27 languages with proper mapping

## Supported Languages & Scripts

### RTL Languages (Right-to-Left)
- 🇸🇦 **Arabic** (`ar`) - العربية
- 🇮🇱 **Hebrew** (`he`) - עברית  
- 🇵🇰 **Urdu** (`ur`) - اردو
- 🇵🇰 **Balochi** (`bal`) - بلۏچی

### LTR Languages (Left-to-Right)

#### Latin Script
- 🇺🇸 **English** (`en`)
- 🇪🇸 **Spanish** (`es`) 
- 🇫🇷 **French** (`fr`)
- 🇵🇹 **Portuguese** (`pt`)
- 🇩🇪 **German** (`de`)
- 🇮🇩 **Indonesian** (`id`)
- 🇹🇷 **Turkish** (`tr`)
- 🇻🇳 **Vietnamese** (`vi`)
- 🇲🇾 **Malay** (`ms`)
- 🇫🇮 **Finnish** (`fi`)
- 🇸🇪 **Swedish** (`sv`)
- 🇳🇴 **Norwegian** (`no`)
- 🇩🇰 **Danish** (`da`)

#### Other Scripts
- 🇨🇳 **Chinese** (`zh`) - 中文
- 🇮🇳 **Hindi** (`hi`) - हिन्दी
- 🇮🇳 **Marathi** (`mr`) - मराठी
- 🇧🇩 **Bengali** (`bn`) - বাংলা
- 🇷🇺 **Russian** (`ru`) - Русский
- 🇯🇵 **Japanese** (`ja`) - 日本語
- 🇰🇷 **Korean** (`ko`) - 한국어
- 🇹🇭 **Thai** (`th`) - ไทย
- 🇮🇳 **Telugu** (`te`) - తెలుగు
- 🇮🇳 **Tamil** (`ta`) - தமிழ்

## User Experience Examples

### Scenario 1: Arabic to English Switch
```
User starts: "مرحبا، كيف حالك؟" (Arabic detected → RTL mode)
User continues: "Actually, let me switch to English now" 
→ System detects English → Automatically switches to LTR mode
→ Placeholder changes from "اكتب رسالتك..." to "Type your message..."
```

### Scenario 2: Mixed Language Conversation
```
User: "Hello, how are you?" (English → LTR)
User: "Wait, let me ask in Hebrew: איך אתה?" (Hebrew detected → RTL)
User: "Thanks, back to English now" (English detected → LTR)
```

### Scenario 3: Gradual Language Detection
```
User types: "Hola" (too short, no switch)
User types: "Hola, ¿cómo estás?" (Spanish detected → remains LTR, Spanish fonts)
User types: "Actually, let me continue in English" (English detected)
```

## Technical Implementation

### Core Functions

#### `detectLanguageSwitch()`
```typescript
detectLanguageSwitch(
  currentLanguage: Language,
  newMessage: string,
  recentMessages: Array<{content: string, role: string}>
): {
  shouldSwitch: boolean;
  newLanguage: Language | null;
  confidence: number;
}
```

#### `detectInputLanguageChange()`
- Real-time detection with debouncing
- Integrates with React context for seamless UI updates
- Considers conversation history for context

#### `detectConversationLanguage()`
- Enhanced to weight recent messages more heavily
- Reduced from 5 to 3 recent messages for faster adaptation
- Improved algorithm for mixed-language conversations

### Performance Optimizations

1. **Debouncing**: 800ms delay prevents excessive API calls
2. **Minimum Length**: 8 characters required for real-time detection
3. **Context Limiting**: Only last 3 messages analyzed for performance
4. **Script Priority**: Character-based detection for non-Latin scripts (faster)

## Configuration

### Auto-Detection Settings
- **Enabled by default** for all users
- **Toggle available** in language dropdown
- **Persistent** across sessions via localStorage

### Confidence Thresholds
- **Real-time detection**: 50% confidence minimum
- **Short text**: Requires non-Latin scripts for high confidence
- **Long text**: Statistical analysis with franc library

## Benefits for Users

### 🌍 **Multilingual Flexibility**
- Seamless switching between any supported languages
- No manual intervention required
- Maintains conversation flow

### 🔄 **RTL/LTR Adaptation**
- Automatic text direction changes
- Proper font selection for each script
- Culturally appropriate UI adjustments

### ⚡ **Real-Time Responsiveness**
- Language detection as you type
- Immediate UI adaptation
- Context-aware decisions

### 🎯 **Accuracy & Intelligence**
- Considers conversation history
- Confidence-based switching prevents false positives
- Script-specific detection algorithms

## Future Enhancements

- **Voice input language detection**
- **Mixed-language message support**
- **User preference learning**
- **Regional dialect detection**
- **Confidence level display for users**

---

This system makes Al Hayat GPT truly multilingual and adaptive, providing an exceptional user experience for speakers of all supported languages. 