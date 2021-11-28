function luminance(r: number, g: number, b: number) {
  const a = [r, g, b].map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/** получить контрастность между 2-мя rgb */
export function getContrast(
  rgb1: [number, number, number],
  rgb2: [number, number, number]
) {
  const lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

const hashRegEx = /^\s*#|\s*$/g;

/** обертка для удобства получения контраста между 2-мя hex цветами */
export function getHexContrast(hex1: string, hex2: string) {
  const c1 = hex1.replace(hashRegEx, '');
  const c2 = hex2.replace(hashRegEx, '');

  const r1 = parseInt(c1.substr(0, 2), 16),
    g1 = parseInt(c1.substr(2, 2), 16),
    b1 = parseInt(c1.substr(4, 2), 16),
    r2 = parseInt(c2.substr(0, 2), 16),
    g2 = parseInt(c2.substr(2, 2), 16),
    b2 = parseInt(c2.substr(4, 2), 16);

  return getContrast([r1, g1, b1], [r2, g2, b2]);
}

/** Увеличение контраста на определенный процент */
export function increaseBrightness(hex: string, percent: number) {
  // strip the leading # if it's there
  hex = hex.replace(/^\s*#|\s*$/g, '');

  // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
  if (hex.length == 3) {
    hex = hex.replace(/(.)/g, '$1$1');
  }

  const r = parseInt(hex.substr(0, 2), 16),
    g = parseInt(hex.substr(2, 2), 16),
    b = parseInt(hex.substr(4, 2), 16);

  return (
    '#' +
    (0 | ((1 << 8) + r + ((256 - r) * percent) / 100)).toString(16).substr(1) +
    (0 | ((1 << 8) + g + ((256 - g) * percent) / 100)).toString(16).substr(1) +
    (0 | ((1 << 8) + b + ((256 - b) * percent) / 100)).toString(16).substr(1)
  );
}
