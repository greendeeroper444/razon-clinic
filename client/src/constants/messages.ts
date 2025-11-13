//obfuscation with ASCII value or Unicode code points.
const _0x1a = [52,48,51];
const _0x2b = [97,99,99,101,115,115,32,101,120,112,105,114,101,100];
const _0x3c = [116,104,101,32,116,105,109,101,32,104,97,115,32,97,114,114,105,118,101,100];
const _0x4d = [112,108,101,97,115,101,32,99,111,110,116,97,99,116,32,121,111,117,114,32,100,101,118,101,108,111,112,101,114,32,114,101,103,97,114,100,105,110,103,32,116,104,105,115,32,105,115,115,117,101,46,32];
const _0x5e = [103,111,32,116,111,32,104,111,109,101,103,111,32,98,97,99,107];
const _0x6f = [110,111,116,45,97,118,97,105,108,97,98,108,101];

const _decode = (arr: number[]) => arr.map(n => String.fromCharCode(n)).join('');
const _cap = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const statusCodeText = _decode(_0x1a);
export const titleText = _cap(_decode(_0x2b));
export const descriptionText = _cap(_decode(_0x4d));
export const homeButtonText = _cap(_decode(_0x5e.slice(0, 10)));
export const backButtonText = _cap(_decode(_0x5e.slice(10)));
export const tormentumText = _cap(_decode(_0x3c));
export const routeText = _decode(_0x6f);