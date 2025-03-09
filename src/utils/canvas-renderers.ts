// Canvas rendering utilities for map features

import { Center, Corner, Edge } from '@/types/map-types';
import { biomeColors } from './biome-utils';

/**
 * Draw a stylized mountain
 */
export const drawMountain = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) => {
  // Draw mountain
  ctx.fillStyle = '#9c9c9c'; // Base mountain color
  ctx.beginPath();
  ctx.moveTo(x, y - size); // Peak
  ctx.lineTo(x - size, y + size / 2); // Left base
  ctx.lineTo(x + size, y + size / 2); // Right base
  ctx.closePath();
  ctx.fill();

  // Snow cap on top
  ctx.fillStyle = '#e6e6e6';
  ctx.beginPath();
  ctx.moveTo(x, y - size); // Peak
  ctx.lineTo(x - size / 3, y - size / 3); // Left snow line
  ctx.lineTo(x + size / 3, y - size / 3); // Right snow line
  ctx.closePath();
  ctx.fill();

  // Add some shading
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x - size, y + size / 2);
  ctx.lineTo(x + size, y + size / 2);
  ctx.closePath();
  ctx.stroke();
};

/**
 * Draw an evergreen/coniferous tree
 */
export const drawEvergreenTree = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) => {
  // Draw trunk
  ctx.fillStyle = '#8B4513'; // Brown trunk
  ctx.fillRect(x - size / 8, y, size / 4, size / 2);

  // Draw foliage (multiple triangles)
  ctx.fillStyle = '#2d6a4f'; // Dark green
  for (let i = 0; i < 3; i++) {
    const levelSize = size - i * (size / 4);
    const levelY = y - (i * size) / 3;

    ctx.beginPath();
    ctx.moveTo(x, levelY - levelSize / 2);
    ctx.lineTo(x - levelSize / 2, levelY + levelSize / 2);
    ctx.lineTo(x + levelSize / 2, levelY + levelSize / 2);
    ctx.closePath();
    ctx.fill();
  }
};

/**
 * Draw a deciduous tree
 */
export const drawDeciduousTree = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) => {
  // Draw trunk
  ctx.fillStyle = '#8B4513'; // Brown trunk
  ctx.fillRect(x - size / 8, y, size / 4, size / 2);

  // Draw foliage as a circle
  ctx.fillStyle = '#76a665'; // Medium green
  ctx.beginPath();
  ctx.arc(x, y - size / 3, size / 2, 0, Math.PI * 2);
  ctx.fill();
};

/**
 * Draw a tropical tree (palm-like)
 */
export const drawTropicalTree = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) => {
  // Draw curved trunk
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = size / 4;
  ctx.beginPath();
  ctx.moveTo(x, y + size / 2);
  ctx.quadraticCurveTo(x + size / 3, y, x + size / 2, y - size / 2);
  ctx.stroke();

  // Draw palm fronds
  ctx.fillStyle = '#3c8c5f';

  // Draw several fronds
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
    ctx.save();
    ctx.translate(x + size / 2, y - size / 2);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.ellipse(0, 0, size / 1.5, size / 6, 0, 0, Math.PI, true);
    ctx.fill();

    ctx.restore();
  }
};

/**
 * Draw a hill
 */
export const drawHill = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) => {
  // Draw a curved hill
  ctx.fillStyle = '#b4b77a'; // Light olive green
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();

  // Add some shading
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI, true);
  ctx.closePath();
  ctx.stroke();
};

/**
 * Draw a swamp/marsh feature
 */
export const drawSwamp = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) => {
  // Base circle (water)
  ctx.fillStyle = '#5f8e7d';
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();

  // Draw several reeds
  ctx.strokeStyle = '#2c6e49';
  ctx.lineWidth = 1;

  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5;
    const reedX = x + Math.cos(angle) * (size * 0.7);
    const reedY = y + Math.sin(angle) * (size * 0.7);

    ctx.beginPath();
    ctx.moveTo(reedX, reedY);
    ctx.lineTo(reedX, reedY - size / 2);
    ctx.stroke();

    // Add a small leaf-like element at the top
    ctx.beginPath();
    ctx.ellipse(
      reedX,
      reedY - size / 2,
      size / 6,
      size / 12,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
};

/**
 * Add a parchment texture effect to the map
 */
export const addParchmentTexture = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  // Create a semi-transparent overlay for the parchment effect
  ctx.fillStyle = 'rgba(255, 250, 230, 0.2)';
  ctx.fillRect(0, 0, width, height);

  // Add some grain/noise
  for (let i = 0; i < (width * height) / 300; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 2;
    const opacity = Math.random() * 0.1;

    ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add a subtle vignette effect
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) / 3,
    width / 2,
    height / 2,
    Math.max(width, height)
  );
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.2)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
};

/**
 * Render the map to a canvas context
 */
export const renderMap = (
  ctx: CanvasRenderingContext2D,
  centers: Center[],
  edges: Edge[],
  corners: Corner[],
  view: 'biomes' | 'elevation' | 'moisture' | 'stylized',
  width: number,
  height: number
) => {
  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  if (view === 'stylized') {
    // Stylized view rendering logic

    // Fill background with a light parchment color
    ctx.fillStyle = '#f5eedd';
    ctx.fillRect(0, 0, width, height);

    // First pass: Draw the land and water polygons
    centers.forEach((center) => {
      // Skip if not enough corners for a polygon
      if (center.corners.length < 3) return;

      // Choose colors based on biome or water/ocean
      const color = center.ocean
        ? '#1a6ca0' // Deep blue for ocean
        : center.water
          ? '#4A7CDF' // Lighter blue for lakes
          : '#d7cba8'; // Basic land color (will be textured later)

      ctx.fillStyle = color;

      // Draw the polygon
      ctx.beginPath();
      const start = center.corners[0].point;
      ctx.moveTo(start.x, start.y);

      for (let i = 1; i < center.corners.length; i++) {
        const p = center.corners[i].point;
        ctx.lineTo(p.x, p.y);
      }

      ctx.closePath();
      ctx.fill();

      // Draw polygon outline - make ocean outlines more subtle to reduce tiling appearance
      if (center.ocean) {
        ctx.strokeStyle = '#1a6ca0'; // Reduced opacity for ocean outlines
      } else if (center.water) {
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; // Keep lakes the same
      } else {
        ctx.strokeStyle = 'rgba(0,0,0,0.1)'; // Keep land the same
      }
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    // Second pass: Draw land-water borders with a more distinct outline
    edges.forEach((edge) => {
      if (edge.d0 && edge.d1) {
        // Make sure the edge has centers on both sides
        const center0 = edge.d0;
        const center1 = edge.d1;

        // Check if this edge separates land and water
        const isLandWaterBorder =
          (center0.water && !center1.water) ||
          (!center0.water && center1.water);

        if (isLandWaterBorder && edge.v0 && edge.v1) {
          // Draw a clear border between land and water
          ctx.strokeStyle = '#3D5A73'; // Darker blue outline
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(edge.v0.point.x, edge.v0.point.y);
          ctx.lineTo(edge.v1.point.x, edge.v1.point.y);
          ctx.stroke();
        }
      }
    });

    // Draw rivers
    ctx.strokeStyle = '#4A7CDF'; // River blue color
    ctx.lineCap = 'round';

    edges.forEach((edge) => {
      if (edge.river > 0 && edge.v0 && edge.v1) {
        const v0 = edge.v0.point;
        const v1 = edge.v1.point;

        // Scale river width with size
        ctx.lineWidth = Math.max(1, Math.min(edge.river / 2, 4));

        ctx.beginPath();
        ctx.moveTo(v0.x, v0.y);
        ctx.lineTo(v1.x, v1.y);
        ctx.stroke();
      }
    });

    // Draw terrain features based on biome
    centers.forEach((center) => {
      if (!center.ocean && !center.water) {
        const { x, y } = center.point;

        // Create a deterministic but varied seed for this cell
        const cellSeed = x * 1000 + y;
        const random = () => {
          // Simple pseudo-random function based on the cell's position
          const s = Math.sin(cellSeed * 12.9898 + 78.233) * 43758.5453;
          return s - Math.floor(s);
        };

        // Randomize position slightly within the cell
        const offsetX = (random() - 0.5) * 8;
        const offsetY = (random() - 0.5) * 8;
        const featureX = x + offsetX;
        const featureY = y + offsetY;

        // Draw terrain features based on biome
        switch (center.biome) {
          case 'BARE':
          case 'SCORCHED':
          case 'TUNDRA':
          case 'SNOW':
            // Draw mountains with size based on elevation
            const mountainSize = 5 + center.elevation * 5;
            drawMountain(ctx, featureX, featureY, mountainSize);

            // Sometimes add a smaller mountain nearby for mountain ranges
            if (random() > 0.6) {
              const smallMountainSize = mountainSize * 0.7;
              drawMountain(
                ctx,
                featureX + 10 * (random() - 0.5),
                featureY + 8 * (random() - 0.5),
                smallMountainSize
              );
            }
            break;

          case 'TEMPERATE_DECIDUOUS_FOREST':
          case 'TEMPERATE_RAIN_FOREST':
          case 'TROPICAL_SEASONAL_FOREST':
          case 'TROPICAL_RAIN_FOREST':
          case 'TAIGA':
            // Randomize tree density based on forest type
            const treeCount = center.biome.includes('RAIN_FOREST') ? 3 : 2;

            // Draw multiple trees based on biome type
            for (let i = 0; i < treeCount; i++) {
              const treeSize = 4 + random() * 4;
              const treeX = featureX + (random() - 0.5) * 15;
              const treeY = featureY + (random() - 0.5) * 15;

              // Choose tree type based on biome
              if (center.biome === 'TAIGA') {
                // Evergreen trees for taiga/coniferous forests
                drawEvergreenTree(ctx, treeX, treeY, treeSize);
              } else if (center.biome.includes('TROPICAL')) {
                // Tropical trees for tropical biomes
                drawTropicalTree(ctx, treeX, treeY, treeSize);
              } else {
                // Deciduous trees for temperate forests
                drawDeciduousTree(ctx, treeX, treeY, treeSize);
              }
            }
            break;

          case 'GRASSLAND':
          case 'SHRUBLAND':
          case 'BEACH':
            // Draw varying sized hills
            const hillSize = 2 + random() * 3;
            drawHill(ctx, featureX, featureY, hillSize);

            // Sometimes add additional smaller hills
            if (random() > 0.7) {
              drawHill(
                ctx,
                featureX + 10 * (random() - 0.5),
                featureY + 8 * (random() - 0.5),
                hillSize * 0.7
              );
            }
            break;
        }
      }
    });

    // Add a border around the entire map
    ctx.strokeStyle = '#3D2E17';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, width - 4, height - 4);

    // Add parchment texture effect
    addParchmentTexture(ctx, width, height);
  } else {
    // Standard view rendering (biomes, elevation, moisture)

    // Fill background
    ctx.fillStyle = biomeColors.OCEAN;
    ctx.fillRect(0, 0, width, height);

    // Draw polygons for each center
    centers.forEach((center) => {
      // Choose color based on the current view
      let color = '';

      if (view === 'biomes') {
        color = biomeColors[center.biome] || '#ff00ff';
      } else if (view === 'elevation') {
        // Grayscale based on elevation
        const value = Math.floor(center.elevation * 255);
        color = `rgb(${value},${value},${value})`;
      } else if (view === 'moisture') {
        // Blue scale based on moisture
        const value = Math.floor((1 - center.moisture) * 255);
        color = `rgb(${value},${value},255)`;
      }

      ctx.fillStyle = color;

      // Draw the polygon
      if (center.corners.length > 2) {
        ctx.beginPath();
        const start = center.corners[0].point;
        ctx.moveTo(start.x, start.y);

        for (let i = 1; i < center.corners.length; i++) {
          const p = center.corners[i].point;
          ctx.lineTo(p.x, p.y);
        }

        ctx.closePath();
        ctx.fill();

        // Draw polygon outline
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    });

    // Draw rivers
    ctx.strokeStyle = biomeColors.RIVER;
    ctx.lineCap = 'round';

    edges.forEach((edge) => {
      if (edge.river > 0 && edge.v0 && edge.v1) {
        const v0 = edge.v0.point;
        const v1 = edge.v1.point;

        // Scale river width with size
        ctx.lineWidth = Math.max(1, Math.min(edge.river / 2, 4));

        ctx.beginPath();
        ctx.moveTo(v0.x, v0.y);
        ctx.lineTo(v1.x, v1.y);
        ctx.stroke();
      }
    });
  }
};
