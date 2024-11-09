import type { IConfigOption } from '@/types';

export const backgroundList: IConfigOption[] = [
  {
    label: `无背景`,
    value: ``,
    desc: `无背景`,
  },
  {
    label: `网格`,
    value: `
.output {
  background-size: 20px 20px;
  background-image: linear-gradient(
    90deg,
    rgba(50, 0, 0, 0.1) 3%,
    transparent 0
  ),
  linear-gradient(1turn, rgba(50, 0, 0, 0.1) 3%, transparent 0);
}`,
    desc: ``,
  },
  {
    label: `主题网格`,
    value: `
.output {
  background-size: 20px 20px;
  background-image: linear-gradient(
    rgb(from var(--md-primary-color) r g b / 0.2)
    1px, 
    transparent 1px
  ),
  linear-gradient(
    90deg, 
    rgb(from var(--md-primary-color) r g b / 0.2) 1px, 
    transparent 1px
  );
}
    `,
    desc: ``,
  },
  {
    label: `渐变网格`,
    value: `
.output {
  background-image: 
    linear-gradient(to right, rgba(173, 216, 230, 0.2) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(173, 216, 230, 0.2) 1px, transparent 1px),
    linear-gradient(to right, rgba(255, 182, 193, 0.2) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 182, 193, 0.2) 1px, transparent 1px);
  background-size: 
    50px 50px, /* 第一个网格 */
    50px 50px, /* 第二个网格 */
    25px 25px, /* 第三个网格 */
    25px 25px; /* 第四个网格 */
  background-position: 
    0 0, /* 第一个网格位置 */
    0 0, /* 第二个网格位置 */
    25px 25px, /* 第三个网格位置 */
    25px 25px; /* 第四个网格位置 */
}
    `,
    desc: ``,
  },
  {
    label: `圆点`,
    value: `
.output {
  background-size: 10px 10px;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgdmlld0JveD0iMCAwIDEwIDEwIj48Y2lyY2xlIGN4PSI1IiBjeT0iNSIgcj0iMSIgZmlsbD0icmdiYSgwLCAwLCAwLCAwLjIpIi8+PC9zdmc+');
}
.dark .output {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgdmlld0JveD0iMCAwIDEwIDEwIj48Y2lyY2xlIGN4PSI1IiBjeT0iNSIgcj0iMSIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjIpIi8+PC9zdmc+');
}
`,
    desc: ``,
  },
  {
    label: `纸张`,
    value: `
.output {
    background-color: #fffef0;
    background-image: 
        linear-gradient(90deg, transparent 9px, #abced4 9px, #abced4 11px, transparent 11px),
        linear-gradient(#eee .1em, transparent .1em);
    background-size: 100% 1.2em;
    padding: 10px 10px 10px 20px;
    border: 1px solid #ddd;
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
}
.dark .output {
    background-color: #2c2c2c;
    background-image: 
        linear-gradient(90deg, transparent 9px, #6b4b4b 9px, #6b4b4b 11px, transparent 11px),
        linear-gradient(#111 .1em, transparent .1em);
    border: 1px solid #222;
    box-shadow: 0 0 10px rgba(255,255,255,0.2);
}
`,
    desc: ``,
  },
  {
    label: `主题线条`,
    value: `
.output {
  background-color: rgb(from var(--md-primary-color) r g b / 10%);
  background-image: 
    linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(255,255,255,0.2) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.2) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.2) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 10px 10px, 10px 10px, 20px 20px;
}
.dark .output {
  background-image: 
  linear-gradient(45deg, rgba(0,0,0,0.2) 25%, transparent 25%),
  linear-gradient(-45deg, rgba(0,0,0,0.2) 25%, transparent 25%),
  linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.2) 75%),
  linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.2) 75%);
}
`,
    desc: ``,
  },
];
