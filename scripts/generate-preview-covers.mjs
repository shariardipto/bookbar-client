import { mkdir, writeFile } from "node:fs/promises";

// Original vector jackets for the P01 sample catalog. No publisher artwork is reproduced.
const line = (text, y, size = 42, extra = "") =>
  `<text x="180" y="${y}" text-anchor="middle" font-family="Georgia,serif" font-size="${size}" ${extra}>${text}</text>`;
const stem = (x, y, flip = 1) =>
  `<g transform="translate(${x} ${y}) scale(${flip} 1)" fill="none" stroke="currentColor" stroke-width="2"><path d="M0 0 Q-15-65 12-145"/><path d="M-1-25 Q-46-34-39-65 Q-7-59-1-25M1-62 Q41-70 38-96 Q5-95 1-62M4-100 Q-24-109-20-130 Q3-127 4-100"/></g>`;
const covers = [
  {
    slug: "secret-garden",
    title: "The Secret Garden",
    author: "FRANCES HODGSON BURNETT",
    background: "#e7d9bc",
    ink: "#354651",
    art: `${line("The Secret", 105, 40)}${line("Garden", 154, 55)}<g color="#99664e">${stem(85, 465)}${stem(275, 465, -1)}</g><g fill="none" stroke="#99664e" stroke-width="2"><path d="M112 456V304a68 68 0 01136 0v152M123 456V307a57 57 0 01114 0v149M135 456V315a45 45 0 0190 0v141M180 273v183M134 362h92M134 411h92"/><circle cx="194" cy="381" r="4"/><path d="M85 470h190"/></g><g fill="#99664e"><circle cx="77" cy="310" r="8"/><circle cx="285" cy="321" r="8"/><circle cx="92" cy="250" r="5"/><circle cx="270" cy="248" r="5"/></g>`,
  },
  {
    slug: "time-machine",
    title: "The Time Machine",
    author: "H. G. WELLS",
    background: "#b3654e",
    ink: "#f8ead7",
    art: `${line("THE TIME", 112, 42)}${line("MACHINE", 163, 49)}<g fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="180" cy="332" r="99"/><circle cx="180" cy="332" r="88"/><circle cx="180" cy="332" r="70"/><ellipse cx="180" cy="332" rx="125" ry="40" transform="rotate(-34 180 332)"/><path d="M180 273v59l45 23M180 227v19M180 418v19M75 332h19M266 332h19"/><circle cx="180" cy="332" r="8"/><path d="M122 246l11 16M239 246l-11 16M105 390l16-10M255 390l-16-10"/></g><g fill="currentColor"><circle cx="285" cy="242" r="3"/><circle cx="70" cy="418" r="3"/></g>`,
  },
  {
    slug: "pride-prejudice",
    title: "Pride and Prejudice",
    author: "JANE AUSTEN",
    background: "#344b5c",
    ink: "#eddfc7",
    art: `${line("Pride", 113, 57)}${line("and", 152, 28, 'font-style="italic"')}${line("Prejudice", 207, 54)}<g fill="none" stroke="#d1aa7f" stroke-width="1.5"><path d="M180 461V286M180 423Q74 395 69 311Q153 300 180 423M180 423Q286 395 291 311Q207 300 180 423M180 380Q115 354 123 279Q180 298 180 380M180 380Q245 354 237 279Q180 298 180 380"/><ellipse cx="108" cy="347" rx="18" ry="29" transform="rotate(-35 108 347)"/><ellipse cx="252" cy="347" rx="18" ry="29" transform="rotate(35 252 347)"/><path d="M145 456q35-30 70 0M151 470q29-23 58 0"/></g>`,
  },
  {
    slug: "room-own",
    title: "A Room of One’s Own",
    author: "VIRGINIA WOOLF",
    background: "#c8b2bd",
    ink: "#293849",
    art: `${line("A Room", 110, 49)}${line("of One’s Own", 160, 37)}<path d="M97 460V302a83 83 0 01166 0v158Z" fill="#344b5c"/><path d="M109 448V303a71 71 0 01142 0v145Z" fill="none" stroke="#e8d9d4" stroke-width="2"/><circle cx="211" cy="300" r="25" fill="#cb8d70"/><path d="M109 379q55-47 142-9v78H109Z" fill="#b6c1c3"/><path d="M109 416q70-45 142-13v45H109Z" fill="#7f939d"/><path d="M180 231v217M109 342h142" fill="none" stroke="#e8d9d4" stroke-width="3"/>`,
  },
  {
    slug: "origin-species",
    title: "On the Origin of Species",
    author: "CHARLES DARWIN",
    background: "#dce2d9",
    ink: "#3c4b50",
    art: `${line("On the Origin", 108, 36)}${line("of Species", 157, 49)}<g color="#526a68">${stem(112, 465)}${stem(250, 465, -1)}</g><g fill="none" stroke="#a36e53" stroke-width="2"><path d="M116 405c0-100 132-115 132-23c0 71-101 88-101 22c0-40 60-47 60-9c0 24-31 26-31 7"/><path d="M178 457v-27M167 454l-9-21M191 454l10-25"/></g><path d="M72 219h216" stroke="currentColor" stroke-width="1"/>`,
  },
  {
    slug: "alice",
    title: "Alice’s Adventures in Wonderland",
    author: "LEWIS CARROLL",
    background: "#efe0cf",
    ink: "#67505b",
    art: `${line("Alice’s", 100, 52)}${line("Adventures in", 142, 29)}${line("Wonderland", 188, 43)}<g fill="none" stroke="#a16b5c" stroke-width="2"><path d="M88 461V319a92 92 0 01184 0v142M100 461V321a80 80 0 01160 0v140"/><path d="M132 461l26-45l-16-35l27-24l-4-34l36-39"/><circle cx="223" cy="281" r="21"/><path d="M202 384q-18-42-8-52q17-7 21 39q13-47 27-38q12 12-12 51q39 22 6 54h-44q-28-31 10-54Z"/></g><g fill="#a16b5c"><path d="M66 253l5 10l11 2l-8 8l2 12l-10-6l-10 6l2-12l-8-8l11-2Z"/><circle cx="285" cy="411" r="6"/></g>`,
  },
  {
    slug: "short-history",
    title: "A Short History of the World",
    author: "H. G. WELLS",
    background: "#273c58",
    ink: "#e8d8bc",
    art: `${line("A Short History", 103, 35)}${line("of the World", 153, 43)}<g fill="none" stroke="#c3a58a" stroke-width="1.5"><circle cx="180" cy="334" r="96"/><ellipse cx="180" cy="334" rx="51" ry="96"/><ellipse cx="180" cy="334" rx="80" ry="96"/><ellipse cx="180" cy="334" rx="96" ry="38"/><path d="M84 334h192M180 238v192M99 284h162M99 384h162M156 438h48M180 430v19M130 451h100"/></g><g fill="currentColor"><circle cx="68" cy="238" r="3"/><circle cx="285" cy="420" r="3"/><path d="M289 251v14m-7-7h14" stroke="currentColor"/></g>`,
  },
  {
    slug: "little-women",
    title: "Little Women",
    author: "LOUISA MAY ALCOTT",
    background: "#ba9999",
    ink: "#f6e6d4",
    art: `${line("Little", 116, 58)}${line("Women", 181, 60)}<g fill="none" stroke="currentColor" stroke-width="2"><path d="M94 363h158v37H94q-22-18 0-37ZM107 400h158v34H107q-21-17 0-34ZM85 434h162v31H85q-22-16 0-31ZM99 375h133M111 414h133M87 448h135M180 363v-58"/><path d="M180 323c-61 0-62-61-24-43c-25-53 41-58 24-13c36-47 67 6 24 21c46-4 36 46-24 35Z"/><path d="M180 341q-44-28-58-3q22 26 58 3M180 342q44-28 58-3q-22 26-58 3"/></g>`,
  },
  {
    slug: "art-war",
    title: "The Art of War",
    author: "SUN TZU",
    background: "#b65f49",
    ink: "#f2dfc2",
    art: `${line("THE ART", 116, 49)}${line("OF WAR", 179, 57)}<circle cx="180" cy="330" r="83" fill="#e7b491"/><path d="M31 430l96-117l62 91l54-67l86 93Z" fill="#35465a"/><path d="M31 430l87-61l61 61l70-36l80 36v36H31Z" fill="#27384e"/><path d="M31 473h298M50 482h260" stroke="currentColor" stroke-width="1"/><path d="M180 215v24M168 227h24" stroke="currentColor" stroke-width="1.5"/>`,
  },
];

const output = new URL("../public/covers/", import.meta.url);
await mkdir(output, { recursive: true });
for (const cover of covers) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="540" viewBox="0 0 360 540"><title>${cover.title} — original BookBar preview cover</title><defs><linearGradient id="spine"><stop stop-color="#000" stop-opacity=".2"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter></defs><rect width="360" height="540" fill="${cover.background}"/><rect x="19" y="20" width="322" height="500" fill="none" stroke="${cover.ink}" stroke-opacity=".35"/><g fill="${cover.ink}" color="${cover.ink}"><text x="180" y="44" text-anchor="middle" font-family="Arial,sans-serif" font-size="8" letter-spacing="2.8">THE BOOKBAR COLLECTION</text>${cover.art}<text x="180" y="503" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" letter-spacing="1.4">${cover.author}</text></g><rect width="360" height="540" filter="url(#grain)" opacity=".055"/><rect width="15" height="540" fill="url(#spine)"/><path d="M7 0v540" stroke="#fff" stroke-opacity=".15"/></svg>`;
  await writeFile(new URL(`${cover.slug}.svg`, output), `${svg}\n`);
}
console.log(`Created ${covers.length} original preview cover assets.`);
