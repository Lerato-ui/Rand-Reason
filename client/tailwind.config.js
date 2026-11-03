
export default { content: ['./index.html','./src/**/*.{ts,tsx}'], theme: { extend: {
 colors: { paper:'#F5F0E6', ground:'#EFE8DA', card:'#FBF8F1', ink:'#1B1A17', mute:'#5E5A50', line:'#D9D0BD', rule:'#1B1A17',
  rand:'#E4451C', forest:'#0F3D2E', leaf:'#2E7D5B', mark:'#FFE49A', mint:'#E6EDE3', pos:'#157A4F', neg:'#C2331A', negSoft:'#F8E0D8', warn:'#8A5200', warnSoft:'#FBEBC8', info:'#2B5E8C', infoSoft:'#E1EAF2', rail:'#1B1A17', railHi:'#2C2A25' },
 fontFamily: { serif:['"Fraunces Variable"','Fraunces','Georgia','serif'], sans:['"Instrument Sans Variable"','"Instrument Sans"','system-ui','sans-serif'] },
 fontSize: { mega:['clamp(2.4rem,5.6vw,4.6rem)',{lineHeight:'1.02',letterSpacing:'-.03em'}], h1:['clamp(2.1rem,4vw,3.2rem)',{lineHeight:'1.05',letterSpacing:'-.025em'}], lead:['clamp(1.35rem,2.3vw,1.8rem)',{lineHeight:'1.32',letterSpacing:'-.012em'}], prose:['1.125rem',{lineHeight:'1.62'}], fig:['1.75rem',{lineHeight:'1.1'}], meta:['.78rem',{lineHeight:'1.4'}] },
 boxShadow: { pop:'0 10px 30px -10px rgba(27,26,23,.4)', card:'none' } } }, plugins: [] }
