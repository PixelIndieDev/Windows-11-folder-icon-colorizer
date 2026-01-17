const previewBox = document.getElementsByClassName("previewBox")[0];
const colorInput = document.getElementById("colorInput");
const downloadButton = document.getElementById("downloadButton");
const sizeSlider = document.getElementById("sizeSlider");
const sizeLabel = document.getElementById("sizeLabelText");
const downloadButtonPNG = document.getElementById("downloadButtonPNG");
const background = document.getElementById("background");
const presetButtons = document.querySelectorAll("#presetColors button");

let svgElement = null;

//fetch it
fetch("assets/svg/base.svg").then(res => res.text()).then(text => {
  previewBox.innerHTML = text;
  svgElement = previewBox.querySelector("svg");
  updateColors(colorInput.value);
});

fetch("assets/svg/background.svg").then(res => res.text()).then(svg => {background.innerHTML = svg});


//update dcolors
function updateColors(inputColor) {
  if (!svgElement) return;

  const stops = svgElement.querySelectorAll("stop");

  inputColor2 = adjustLightness(inputColor, -0.20);
  inputColor3 = adjustLightness(inputColor2, -0.077)

  stops.forEach((stop, i) => {
    let value;

    inputColor4 = adjustLightness(inputColor2, 0.0333);
    inputColor5 = adjustLightness(inputColor, 0.037);

    switch (i) {
      case 0:
        value = inputColor3; //background
        break;
      case 1:
        value = inputColor3; //background
        break;
      case 2:
        value = inputColor; //main color
        break;
      case 3:
        value = adjustLightness(inputColor, -0.20); //main gradient darker
        break;
      case 4:
        value = adjustLightness(inputColor2, 0.0333);
        break;
      case 5:
        value = adjustLightness(inputColor4, -0.145);
        break;
      case 6:
        value = inputColor5;
        break;
      case 7:
        value = adjustLightness(inputColor5, -0.10);
        break;
      default:
        value = inputColor; //won't ever be used
    }

    stop.setAttribute("stop-color", value);
  });
}

function adjustLightness(hex, lightOffset) {
    let r = parseInt(hex.substring(1, 3), 16) / 255;
    let g = parseInt(hex.substring(3, 5), 16) / 255;
    let b = parseInt(hex.substring(5, 7), 16) / 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; 
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    l = Math.max(0, Math.min(1, l + lightOffset));

    const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;

        return p;
    };

    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    
    r = Math.round(hue2rgb(p, q, h + 1/3) * 255);
    g = Math.round(hue2rgb(p, q, h) * 255);
    b = Math.round(hue2rgb(p, q, h - 1/3) * 255);

    const toHex = (c) => c.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

//input
colorInput.addEventListener("input", e => {updateColors(e.target.value)});
sizeSlider.addEventListener("input", () => {
  const size = sliderToSize();
  sizeLabel.textContent = `${size}×${size}`;
});
presetButtons.forEach(button => {
  button.addEventListener("mouseenter", () => {
    const color = button.dataset.color;
    document.documentElement.style.setProperty('--selected-color', color);
    document.documentElement.style.setProperty('--selected-color2', adjustLightness(color, 0.02));
  });

  button.addEventListener("click", () => {
    const color = button.dataset.color;
    colorInput.value = color;
    updateColors(color);
  });
});

function sliderToSize() {
  return Math.pow(2, Number(sizeSlider.value));
}

//download svg
downloadButton.addEventListener("click", () => {
  if (!svgElement) return;

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);

  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `Win11Folder_color_${colorInput.value}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
});

//download png
downloadButtonPNG.addEventListener("click", () => {
  if (!svgElement) return;

  const size = sliderToSize();

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);

  const svgBlob = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});

  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);

    URL.revokeObjectURL(url);

    canvas.toBlob(blob => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `Win11Folder_color_${colorInput.value}_${size}px.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, "image/png");
  };

  img.src = url;
});
