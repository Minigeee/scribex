// A simple Perlin noise implementation for map generation
// Based on improved noise reference implementation by Ken Perlin

export class PerlinNoise {
  private perm: number[] = [];

  constructor(seed = Math.random() * 10000) {
    // Initialize permutation table
    this.perm = new Array(512);
    const p = new Array(256);

    // Fill p with values
    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }

    // Shuffle p
    const random = this.seededRandom(seed);
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }

    // Duplicate for faster lookups
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
    }
  }

  private seededRandom(seed: number) {
    return function () {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private grad(hash: number, x: number, y: number, z: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }

  noise3D(x: number, y: number, z: number): number {
    // Find unit cube that contains point
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;

    // Find relative x, y, z of point in cube
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);

    // Compute fade curves for each of x, y, z
    const u = this.fade(x);
    const v = this.fade(y);
    const w = this.fade(z);

    // Hash coordinates of the 8 cube corners
    const A = this.perm[X] + Y;
    const AA = this.perm[A] + Z;
    const AB = this.perm[A + 1] + Z;
    const B = this.perm[X + 1] + Y;
    const BA = this.perm[B] + Z;
    const BB = this.perm[B + 1] + Z;

    // Add blended results from 8 corners of cube
    return this.lerp(
      this.lerp(
        this.lerp(
          this.grad(this.perm[AA], x, y, z),
          this.grad(this.perm[BA], x - 1, y, z),
          u
        ),
        this.lerp(
          this.grad(this.perm[AB], x, y - 1, z),
          this.grad(this.perm[BB], x - 1, y - 1, z),
          u
        ),
        v
      ),
      this.lerp(
        this.lerp(
          this.grad(this.perm[AA + 1], x, y, z - 1),
          this.grad(this.perm[BA + 1], x - 1, y, z - 1),
          u
        ),
        this.lerp(
          this.grad(this.perm[AB + 1], x, y - 1, z - 1),
          this.grad(this.perm[BB + 1], x - 1, y - 1, z - 1),
          u
        ),
        v
      ),
      w
    );
  }

  // Convenience method for 2D noise (using 0 for z)
  noise2D(x: number, y: number): number {
    return this.noise3D(x, y, 0);
  }

  // Fractal Brownian Motion (fBm) for more natural looking noise
  fBm(
    x: number,
    y: number,
    octaves = 6,
    lacunarity = 2.0,
    persistence = 0.5
  ): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    // Normalize
    return total / maxValue;
  }
}
