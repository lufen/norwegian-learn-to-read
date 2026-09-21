/**
 * Letter stroke data — defines how to draw each printed capital letter as a
 * sequence of strokes, so the app can *animate* correct letter formation
 * (stroke order + direction) for a child to watch and copy onto real paper,
 * instead of asking them to draw on the screen.
 *
 * Coordinates are in a normalized 0-100 box (x: left→right, y: top→bottom,
 * baseline around y=90, top around y=10). The renderer (handwriting.js)
 * scales this box onto the canvas.
 */

const LETTER_STROKES = (() => {
  function line(x1, y1, x2, y2) {
    return [
      { x: x1, y: y1 },
      { x: x2, y: y2 }
    ];
  }

  function bezier(p0, p1, p2, p3, steps = 16) {
    const pts = [];
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const mt = 1 - t;
      pts.push({
        x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
        y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y
      });
    }
    return pts;
  }

  function join(...parts) {
    let result = [];
    parts.forEach((part, index) => {
      result = result.concat(index === 0 ? part : part.slice(1));
    });
    return result;
  }

  const strokes = {
    A: [line(50, 10, 18, 90), line(50, 10, 82, 90), line(32, 58, 68, 58)],
    B: [
      line(25, 10, 25, 90),
      bezier({ x: 25, y: 10 }, { x: 62, y: 10 }, { x: 62, y: 46 }, { x: 25, y: 50 }),
      bezier({ x: 25, y: 50 }, { x: 66, y: 50 }, { x: 66, y: 90 }, { x: 25, y: 90 })
    ],
    C: [
      join(
        bezier({ x: 78, y: 25 }, { x: 40, y: 2 }, { x: 12, y: 30 }, { x: 20, y: 50 }),
        bezier({ x: 20, y: 50 }, { x: 12, y: 70 }, { x: 40, y: 98 }, { x: 78, y: 75 })
      )
    ],
    D: [line(25, 10, 25, 90), bezier({ x: 25, y: 10 }, { x: 88, y: 10 }, { x: 88, y: 90 }, { x: 25, y: 90 })],
    E: [line(25, 10, 25, 90), line(25, 10, 78, 10), line(25, 50, 60, 50), line(25, 90, 78, 90)],
    F: [line(25, 10, 25, 90), line(25, 10, 78, 10), line(25, 50, 60, 50)],
    G: [
      join(
        bezier({ x: 78, y: 25 }, { x: 40, y: 2 }, { x: 12, y: 30 }, { x: 20, y: 50 }),
        bezier({ x: 20, y: 50 }, { x: 12, y: 70 }, { x: 40, y: 98 }, { x: 78, y: 75 })
      ),
      line(52, 55, 78, 55),
      line(78, 55, 78, 75)
    ],
    H: [line(25, 10, 25, 90), line(78, 10, 78, 90), line(25, 50, 78, 50)],
    I: [line(50, 10, 50, 90)],
    J: [line(62, 10, 62, 68), bezier({ x: 62, y: 68 }, { x: 62, y: 94 }, { x: 28, y: 94 }, { x: 26, y: 70 })],
    K: [line(25, 10, 25, 90), line(78, 10, 25, 52), line(25, 52, 78, 90)],
    L: [line(25, 10, 25, 90), line(25, 90, 78, 90)],
    M: [line(20, 90, 20, 10), line(20, 10, 50, 60), line(50, 60, 80, 10), line(80, 10, 80, 90)],
    N: [line(25, 90, 25, 10), line(25, 10, 78, 90), line(78, 90, 78, 10)],
    O: [
      join(
        bezier({ x: 50, y: 10 }, { x: 88, y: 10 }, { x: 88, y: 90 }, { x: 50, y: 90 }),
        bezier({ x: 50, y: 90 }, { x: 12, y: 90 }, { x: 12, y: 10 }, { x: 50, y: 10 })
      )
    ],
    P: [line(25, 10, 25, 90), bezier({ x: 25, y: 10 }, { x: 68, y: 10 }, { x: 68, y: 46 }, { x: 25, y: 50 })],
    Q: [
      join(
        bezier({ x: 50, y: 10 }, { x: 88, y: 10 }, { x: 88, y: 90 }, { x: 50, y: 90 }),
        bezier({ x: 50, y: 90 }, { x: 12, y: 90 }, { x: 12, y: 10 }, { x: 50, y: 10 })
      ),
      line(58, 72, 84, 96)
    ],
    R: [
      line(25, 10, 25, 90),
      bezier({ x: 25, y: 10 }, { x: 68, y: 10 }, { x: 68, y: 46 }, { x: 25, y: 50 }),
      line(35, 50, 78, 90)
    ],
    S: [
      join(
        bezier({ x: 76, y: 22 }, { x: 55, y: 4 }, { x: 18, y: 16 }, { x: 28, y: 36 }),
        bezier({ x: 28, y: 36 }, { x: 46, y: 56 }, { x: 76, y: 54 }, { x: 70, y: 70 }),
        bezier({ x: 70, y: 70 }, { x: 64, y: 86 }, { x: 28, y: 96 }, { x: 14, y: 78 })
      )
    ],
    T: [line(20, 10, 80, 10), line(50, 10, 50, 90)],
    U: [
      join(
        line(22, 10, 22, 65),
        bezier({ x: 22, y: 65 }, { x: 22, y: 92 }, { x: 78, y: 92 }, { x: 78, y: 65 }),
        line(78, 65, 78, 10)
      )
    ],
    V: [line(20, 10, 50, 90), line(50, 90, 80, 10)],
    W: [line(15, 10, 32, 90), line(32, 90, 50, 40), line(50, 40, 68, 90), line(68, 90, 85, 10)],
    X: [line(20, 10, 80, 90), line(80, 10, 20, 90)],
    Y: [line(20, 10, 50, 50), line(80, 10, 50, 50), line(50, 50, 50, 90)],
    Z: [line(20, 10, 80, 10), line(80, 10, 20, 90), line(20, 90, 80, 90)],
    Æ: [
      line(45, 10, 45, 90),
      line(15, 90, 45, 10),
      line(18, 55, 42, 55),
      line(45, 10, 85, 10),
      line(45, 50, 75, 50),
      line(45, 90, 85, 90)
    ],
    Ø: [
      join(
        bezier({ x: 50, y: 10 }, { x: 88, y: 10 }, { x: 88, y: 90 }, { x: 50, y: 90 }),
        bezier({ x: 50, y: 90 }, { x: 12, y: 90 }, { x: 12, y: 10 }, { x: 50, y: 10 })
      ),
      line(20, 88, 80, 12)
    ],
    Å: [
      line(50, 25, 18, 90),
      line(50, 25, 82, 90),
      line(34, 65, 66, 65),
      join(
        bezier({ x: 50, y: 4 }, { x: 60, y: 4 }, { x: 60, y: 18 }, { x: 50, y: 18 }),
        bezier({ x: 50, y: 18 }, { x: 40, y: 18 }, { x: 40, y: 4 }, { x: 50, y: 4 })
      )
    ]
  };

  return strokes;
})();

if (typeof window !== "undefined") {
  window.LETTER_STROKES = LETTER_STROKES;
}
