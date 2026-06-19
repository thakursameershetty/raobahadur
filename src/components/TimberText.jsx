import React from 'react';

const META = {
  "0": [111, 135], "1": [48, 131], "2": [91, 137], "3": [84, 135], "4": [100, 133], "5": [87, 132],
  "6": [107, 133], "7": [91, 130], "8": [97, 133], "9": [111, 133],
  "A": [127, 130], "B": [114, 131], "C": [112, 114], "D": [107, 113], "E": [85, 115], "F": [82, 113],
  "G": [101, 113], "H": [109, 113], "I": [49, 113], "J": [83, 112], "K": [115, 120], "L": [86, 114],
  "M": [118, 116], "N": [107, 116], "O": [111, 119], "P": [87, 115], "Q": [118, 121], "R": [111, 119],
  "S": [94, 125], "T": [91, 120], "U": [104, 120], "V": [100, 122], "W": [133, 122], "X": [114, 118],
  "Y": [113, 117], "Z": [96, 122]
};
const REF = 116;

export default function TimberText({ text, fontSize = 78, tracking = 5, glow = true, className = '' }) {
  const words = [];
  let cur = null;
  const flush = () => { if (cur && cur.glyphs.length) { words.push(cur); } cur = null; };

  for (const raw of text) {
    if (raw === "\n") { flush(); words.push({ type: "br", isBr: true }); continue; }
    if (raw === " " || raw === "\t") { flush(); words.push({ type: "space", isSpace: true }); continue; }
    const ch = raw.toUpperCase();
    const m = META[ch];
    if (!cur) cur = { type: "word", isWord: true, glyphs: [] };

    if (m) {
      const h = Math.round(fontSize * m[1] / REF);
      const w = Math.round(h * m[0] / m[1]);
      const file = /[0-9]/.test(ch) ? ("d" + ch) : ch;
      cur.glyphs.push({ isImg: true, src: "/glyphs/" + file + ".png", w, h, ch, raw });
    } else {
      cur.glyphs.push({ isOther: true, ch: raw });
    }
  }
  flush();

  const otherSize = Math.round(fontSize * 0.6);

  return (
    <div className={`flex flex-wrap items-end justify-center ${className}`} style={{ rowGap: Math.round(fontSize * 0.34) }}>
      {words.map((tok, i) => {
        if (tok.isWord) {
          return (
            <span key={i} className="inline-flex items-end whitespace-nowrap" style={{ columnGap: tracking }}>
              {tok.glyphs.map((g, j) => {
                if (g.isImg) {
                  return (
                    <img
                      key={j}
                      src={g.src}
                      width={g.w}
                      height={g.h}
                      alt={g.ch}
                      className="block h-auto align-bottom"
                      style={{
                        filter: glow ? 'drop-shadow(0 5px 9px rgba(90,55,18,.5)) drop-shadow(0 0 16px rgba(214,170,92,.22))' : 'none'
                      }}
                    />
                  );
                } else if (g.isOther) {
                  return (
                    <span key={j} className="inline-flex items-end font-serif italic" style={{ fontSize: otherSize, lineHeight: 1, color: 'rgba(214,178,110,.4)', padding: '0 .04em' }}>
                      {g.ch}
                    </span>
                  );
                }
                return null;
              })}
            </span>
          );
        } else if (tok.isSpace) {
          return <span key={i} className="inline-block" style={{ width: Math.round(fontSize * 0.4) }}></span>;
        } else if (tok.isBr) {
          return <span key={i} className="basis-full h-0"></span>;
        }
        return null;
      })}
    </div>
  );
}
