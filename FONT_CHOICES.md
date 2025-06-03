# Font Configuration for Multilingual Support

This document explains the font choices made for each language in the application, based on typography research and best practices for multilingual websites.

## Font Selection Criteria

1. **Readability**: Fonts must be highly legible across different screen sizes
2. **Cultural Appropriateness**: Fonts should respect the typographic traditions of each language
3. **Technical Quality**: Fonts must have comprehensive character sets and proper OpenType features
4. **Performance**: Fonts should load efficiently and render well across devices
5. **Consistency**: Related languages should use harmonious font families

## Font Assignments by Language

### Latin Script Languages
**Font**: Inter
**Languages**: English, Spanish, French, Portuguese, German, Indonesian, Turkish, Vietnamese, Malay, Finnish, Swedish, Norwegian, Danish

**Why Inter?**
- Modern, highly legible sans-serif designed specifically for UI/screen reading
- Excellent support for Latin extended characters (diacritics, special characters)
- Optimized for digital interfaces with careful attention to character spacing
- Superior readability at small sizes compared to traditional fonts
- Comprehensive language support for all European languages

### Cyrillic Script
**Font**: Source Sans Pro
**Language**: Russian

**Why Source Sans Pro?**
- Adobe's professional-grade font with excellent Cyrillic character design
- Better Cyrillic letterforms than generic fonts like Roboto
- Maintains consistency with Latin text while respecting Cyrillic typography traditions
- Widely tested and proven in professional applications

### Arabic Script Languages
**Font**: Noto Naskh Arabic
**Languages**: Arabic, Urdu, Balochi

**Why Noto Naskh Arabic?**
- Traditional Naskh style that's highly readable and culturally appropriate
- Designed by Google with extensive language support
- Superior to generic Arabic fonts like Cairo for traditional text
- Proper contextual forms and ligatures for authentic Arabic typography
- Larger font size (text-lg) for optimal readability of Arabic script

### Hebrew Script
**Font**: Noto Sans Hebrew
**Language**: Hebrew

**Why Noto Sans Hebrew?**
- Modern, clean Hebrew typography designed specifically for Hebrew script
- Better character design than generic fonts
- Proper right-to-left text support
- Optimized for both traditional and modern Hebrew usage
- Larger font size (text-lg) for optimal readability

### Chinese Script
**Font**: Noto Sans SC (Simplified Chinese)
**Language**: Chinese

**Why Noto Sans SC?**
- Comprehensive CJK (Chinese, Japanese, Korean) support
- Optimized specifically for Simplified Chinese characters
- Part of Google's Noto family ensuring consistency
- Excellent rendering quality for complex Chinese characters

### Japanese Script
**Font**: Noto Sans JP
**Language**: Japanese

**Why Noto Sans JP?**
- Optimized specifically for Japanese writing system (Hiragana, Katakana, Kanji)
- Better character design than generic CJK fonts
- Proper support for Japanese typography conventions
- Harmonious with other Noto fonts in the family

### Korean Script
**Font**: Noto Sans KR
**Language**: Korean

**Why Noto Sans KR?**
- Optimized specifically for Korean Hangul script
- Proper character proportions for Korean typography
- Better readability than generic CJK fonts
- Consistent with other Noto fonts

### Devanagari Script
**Font**: Noto Sans Devanagari
**Languages**: Hindi, Marathi

**Why Noto Sans Devanagari?**
- Designed specifically for Devanagari script used in Hindi and Marathi
- Proper conjunct forms and diacritic placement
- Superior to generic fonts for Indian languages
- Excellent readability for complex Devanagari text

### Other Indic Scripts
- **Bengali**: Noto Sans Bengali - Optimized for Bengali script
- **Telugu**: Noto Sans Telugu - Designed for Telugu script
- **Tamil**: Noto Sans Tamil - Optimized for Tamil script

### Thai Script
**Font**: Noto Sans Thai
**Language**: Thai

**Why Noto Sans Thai?**
- Designed specifically for Thai script with proper character stacking
- Better than generic fonts for Thai typography
- Proper support for Thai diacritics and tone marks

## Font Size Considerations

- **Latin/CJK Scripts**: `text-base` (16px) - Standard size for good readability
- **Arabic/Hebrew Scripts**: `text-lg` (18px) - Larger size due to script complexity and reading patterns
- **Indic Scripts**: `text-base` (16px) - Appropriate for the character density

## Technical Implementation

The fonts are implemented using CSS classes that map to CSS custom properties:
- `font-inter` → `var(--font-inter)`
- `font-noto-naskh-arabic` → `var(--font-noto-naskh-arabic)`
- etc.

This allows for easy font swapping and ensures consistent typography across the application.

## Benefits of This Approach

1. **Improved Readability**: Each language uses fonts optimized for its script
2. **Cultural Respect**: Traditional scripts use culturally appropriate typefaces
3. **Better User Experience**: Users see text in familiar, well-designed fonts
4. **Professional Quality**: All fonts are from reputable foundries (Google, Adobe)
5. **Comprehensive Coverage**: Support for all major world languages and scripts
6. **Performance**: Fonts are loaded only when needed for specific languages

## Future Considerations

- Monitor font loading performance and consider font subsetting
- Add more specialized fonts for additional languages as needed
- Consider variable fonts for better performance and flexibility
- Regular updates to font versions for improved character support 