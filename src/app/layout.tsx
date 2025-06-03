import { Metadata } from 'next';
import './globals.css';
import {
    Cairo,
    Roboto,
    Inter,
    Source_Sans_3,
    Noto_Sans_SC,
    Noto_Sans_Devanagari,
    Noto_Sans_Bengali,
    Noto_Sans_JP,
    Noto_Sans_KR,
    Noto_Sans_Thai,
    Noto_Sans_Telugu,
    Noto_Sans_Tamil,
    Noto_Naskh_Arabic,
    Noto_Sans_Hebrew
} from 'next/font/google';

export const metadata: Metadata = {
    title: 'Al Hayat GPT',
    description: 'The first and most advanced Christian AI chatbot that can debate with you in Islam and Christianity.',
}

// Latin script languages - Inter (modern, highly legible)
const inter = Inter({
    subsets: ['latin', 'latin-ext'],
    weight: ['400', '500', '700'],
    variable: '--font-inter',
    display: 'swap',
})

// Cyrillic script - Source Sans 3 (excellent Cyrillic support)
const sourceSans3 = Source_Sans_3({
    subsets: ['latin', 'latin-ext', 'cyrillic'],
    weight: ['400', '500', '700'],
    variable: '--font-source-sans-pro',
    display: 'swap',
})

// Arabic script languages - Noto Naskh Arabic (traditional, highly readable)
const notoNaskhArabic = Noto_Naskh_Arabic({
    subsets: ['latin', 'arabic'],
    weight: ['400', '500', '700'],
    variable: '--font-noto-naskh-arabic',
    display: 'swap',
})

// Hebrew script - Noto Sans Hebrew (modern, clean Hebrew typography)
const notoSansHebrew = Noto_Sans_Hebrew({
    subsets: ['latin', 'hebrew'],
    weight: ['400', '500', '700'],
    variable: '--font-noto-sans-hebrew',
    display: 'swap',
})

// English, Spanish, French, Portuguese, German, Indonesian, Turkish - Roboto
const roboto = Roboto({
    subsets: ['latin', 'latin-ext'],
    weight: ['400', '500', '700'],
    variable: '--font-roboto',
    display: 'swap',
})

// Arabic, Urdu - Cairo
const cairo = Cairo({
    subsets: ['latin', 'arabic'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-cairo',
    display: 'swap',
})

// Chinese (Simplified and Traditional) - Noto Sans SC
const notoSansSC = Noto_Sans_SC({
    subsets: ['latin'],
    weight: ['400', '500', '700'],
    variable: '--font-noto-sans-sc',
    display: 'swap',
})

// Hindi, Marathi - Noto Sans Devanagari
const notoSansDevanagari = Noto_Sans_Devanagari({
    subsets: ['latin', 'devanagari'],
    weight: ['400', '500', '700'],
    variable: '--font-noto-sans-devanagari',
    display: 'swap',
})

// Bengali - Noto Sans Bengali
const notoSansBengali = Noto_Sans_Bengali({
    subsets: ['latin', 'bengali'],
    weight: ['400', '500', '700'],
    variable: '--font-noto-sans-bengali',
    display: 'swap',
})

// Japanese - Noto Sans JP
const notoSansJP = Noto_Sans_JP({
    subsets: ['latin'],
    weight: ['400', '500', '700'],
    variable: '--font-noto-sans-jp',
    display: 'swap',
})

// Korean - Noto Sans KR
const notoSansKR = Noto_Sans_KR({
    subsets: ['latin'],
    weight: ['400', '500', '700'],
    variable: '--font-noto-sans-kr',
    display: 'swap',
})

// Thai - Noto Sans Thai
const notoSansThai = Noto_Sans_Thai({
    subsets: ['latin', 'thai'],
    weight: ['400', '500', '700'],
    variable: '--font-noto-sans-thai',
    display: 'swap',
})

// Telugu - Noto Sans Telugu
const notoSansTelugu = Noto_Sans_Telugu({
    subsets: ['latin', 'telugu'],
    weight: ['400', '500', '700'],
    variable: '--font-noto-sans-telugu',
    display: 'swap',
})

// Tamil - Noto Sans Tamil
const notoSansTamil = Noto_Sans_Tamil({
    subsets: ['latin', 'tamil'],
    weight: ['400', '500', '700'],
    variable: '--font-noto-sans-tamil',
    display: 'swap',
})

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={`
                ${inter.variable}
                ${sourceSans3.variable}
                ${notoNaskhArabic.variable}
                ${notoSansHebrew.variable}
                ${roboto.variable} 
                ${cairo.variable} 
                ${notoSansSC.variable} 
                ${notoSansDevanagari.variable} 
                ${notoSansBengali.variable} 
                ${notoSansJP.variable} 
                ${notoSansKR.variable} 
                ${notoSansThai.variable} 
                ${notoSansTelugu.variable} 
                ${notoSansTamil.variable}
            `}>
                {children}
            </body>
        </html>
    )
} 