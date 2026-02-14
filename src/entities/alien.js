const ALIEN_PALETTES = [
  { body: "#ff6b6b", eye: "#ffe3e3" },
  { body: "#ffd166", eye: "#fff4cc" },
  { body: "#8ce99a", eye: "#e6ffed" },
  { body: "#74c0fc", eye: "#dff1ff" },
  { body: "#c8b6ff", eye: "#f1ecff" }
];

const ALIEN_ANIMATIONS = [
  {
    rate: 1.0,
    frames: [
      [
        "000011110000",
        "001111111100",
        "011121112110",
        "111111111111",
        "001111111100",
        "011011110110",
        "110110011011",
        "100000000001"
      ],
      [
        "000011110000",
        "001111111100",
        "011121112110",
        "111111111111",
        "001111111100",
        "110011110011",
        "011110011110",
        "000000000000"
      ]
    ]
  },
  {
    rate: 0.8,
    frames: [
      [
        "001100001100",
        "011111111110",
        "111211112111",
        "111111111111",
        "111100001111",
        "011000000110",
        "001100001100",
        "010010010010"
      ],
      [
        "001100001100",
        "011111111110",
        "111211112111",
        "111111111111",
        "111100001111",
        "001000000100",
        "010100001010",
        "100010010001"
      ]
    ]
  },
  {
    rate: 1.25,
    frames: [
      [
        "000111111000",
        "011111111110",
        "111111111111",
        "112211112211",
        "111111111111",
        "001111111100",
        "011001100110",
        "110000000011"
      ],
      [
        "000111111000",
        "011111111110",
        "111111111111",
        "112211112211",
        "111111111111",
        "001111111100",
        "110001100011",
        "001100001100"
      ]
    ]
  },
  {
    rate: 0.65,
    frames: [
      [
        "011111111110",
        "111111111111",
        "112222222211",
        "111111111111",
        "001111111100",
        "011100001110",
        "110010010011",
        "000110011000"
      ],
      [
        "011111111110",
        "111111111111",
        "112222222211",
        "111111111111",
        "001111111100",
        "001110011100",
        "011001100110",
        "110000000011"
      ]
    ]
  }
];

export class Alien {
  constructor(x, y, row, col) {
    this.x = x;
    this.y = y;
    this.width = 36;
    this.height = 24;
    this.row = row;
    this.col = col;
    this.alive = true;
    this.points = row === 0 ? 30 : row < 3 ? 20 : 10;
    this.typeIndex = (this.row + this.col) % ALIEN_ANIMATIONS.length;
    this.animation = ALIEN_ANIMATIONS[this.typeIndex];
    this.animationOffset = (this.col + this.row) % 2;
    this.palette = ALIEN_PALETTES[this.row % ALIEN_PALETTES.length];
  }

  draw(ctx, animationTimeMs = 0) {
    if (!this.alive) {
      return;
    }
    const frameStep = Math.floor((animationTimeMs * this.animation.rate) / 220) + this.animationOffset;
    const frame = this.animation.frames[frameStep % this.animation.frames.length];
    const scale = 3;

    for (let row = 0; row < frame.length; row += 1) {
      for (let col = 0; col < frame[row].length; col += 1) {
        const pixel = frame[row][col];
        if (pixel === "0") {
          continue;
        }

        ctx.fillStyle = pixel === "1" ? this.palette.body : this.palette.eye;
        ctx.fillRect(this.x + col * scale, this.y + row * scale, scale, scale);
      }
    }
  }
}

export function createAlienGrid({
  rows = 5,
  cols = 10,
  startX = 90,
  startY = 80,
  gapX = 16,
  gapY = 14
} = {}) {
  const aliens = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = startX + col * (36 + gapX);
      const y = startY + row * (24 + gapY);
      aliens.push(new Alien(x, y, row, col));
    }
  }
  return aliens;
}
