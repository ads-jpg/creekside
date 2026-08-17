const React = require("react");
const RDS = require("react-dom/server");
const sharp = require("sharp");
const fi = require("react-icons/fi");
const fa = require("react-icons/fa");
const fs = require("fs");

const OUT = __dirname + "/ico";
fs.mkdirSync(OUT, { recursive: true });

// name -> [component, strokeWidthOverride]
const SET = {
  search: fi.FiSearch,
  bars: fi.FiBarChart2,
  tv: fi.FiTv,
  map: fi.FiMap,
  video: fi.FiVideo,
  rocket: fi.FiSend,
  home: fi.FiHome,
  layers: fi.FiLayers,
  pin: fi.FiMapPin,
  scale: fi.FiSliders,
  dollar: fi.FiDollarSign,
  arrow: fi.FiArrowRight,
  check: fi.FiCheck,
};

const COLORS = {
  green: "#0F8140",
  white: "#FFFFFF",
  mint: "#A9C63C",
};

async function render(name, Comp, colorName) {
  const hex = COLORS[colorName];
  let svg = RDS.renderToStaticMarkup(
    React.createElement(Comp, { color: hex, size: 512, strokeWidth: 1.6 })
  );
  // react-icons emits stroke="currentColor"; ensure explicit color
  svg = svg.replace(/currentColor/g, hex);
  const buf = await sharp(Buffer.from(svg), { density: 600 })
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const file = `${OUT}/${name}-${colorName}.png`;
  fs.writeFileSync(file, buf);
  return file;
}

(async () => {
  for (const [name, Comp] of Object.entries(SET)) {
    for (const c of ["green", "white", "mint"]) {
      await render(name, Comp, c);
    }
  }
  console.log("icons written:", fs.readdirSync(OUT).length);
})();
