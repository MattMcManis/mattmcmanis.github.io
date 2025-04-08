/*
 * Copyright © 2025 Matt McManis
 */
window.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById('galaxiesCanvas');
  const ctx = canvas.getContext('2d');

  // Base resolution for standardizing sizes
  const BASE_WIDTH = 1920;
  const BASE_HEIGHT = 1200;

  // Fixed parameters for galaxy generation
  const BASE_GALAXY_SIZE = 500;

  // Size variation parameters
  const MIN_SIZE_FACTOR = 0.02;
  const MAX_SIZE_FACTOR = 0.08;

  // Chromatic Aberration parameters
  const chromaticAberration = {
    enabled: true,
    opacity: 0.15,  // 0-1 range
    offsetRed: 2.0,
    offsetGreen: 0.0,
    offsetBlue: -2.0
  };

  // Color arrays
  const galaxy_O_Type_Colors = ['#957ff7', '#adb2ff']; // O-type (Blue-Violet)
  const galaxy_B_Type_Colors = ['#4f86f6', '#5aadf2']; // B-type (Blue)
  const galaxy_A_Type_Colors = ['#91c2ff', '#cef3ff']; // A-type (Blue-White)
  const galaxy_F_Type_Colors = ['#ffffff', '#ffffe3']; // F-type (White)
  const galaxy_G_Type_Colors = ['#fefea7', '#fef3b9']; // G-type (Yellow)
  const galaxy_K_Type_Colors = ['#fb9964', '#fdbaa2']; // K-type (Orange)
  const galaxy_M_Type_Colors = ['#f37477', '#f9bdcd']; // M-type (Red)
  const galaxyColors = [ // Combines all color arrays.
    ...galaxy_O_Type_Colors,
    ...galaxy_B_Type_Colors,
    ...galaxy_A_Type_Colors,
    ...galaxy_F_Type_Colors,
    ...galaxy_G_Type_Colors,
    ...galaxy_K_Type_Colors,
    ...galaxy_M_Type_Colors
  ];

  const galaxies = []; // Declare galaxies array

  function getGalaxyCountByResolution() {
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;
    const isMobile = screenWidth < 768;

    if (!isMobile) {
      if (screenHeight >= 7680) return 28;
      if (screenHeight >= 2880) return 20;
      if (screenHeight >= 2160) return 16;
      if (screenHeight >= 1600) return 12;
      if (screenHeight >= 1440) return 10;
      if (screenHeight >= 1080) return 8;
      if (screenHeight >= 900) return 7;
      if (screenHeight >= 720) return 6;
      if (screenHeight >= 480) return 4;
      if (screenHeight >= 360) return 3;
      if (screenHeight >= 144) return 2;
    } else {
      if (screenHeight >= 7680) return 14;
      if (screenHeight >= 2880) return 10;
      if (screenHeight >= 2160) return 8;
      if (screenHeight >= 1600) return 6;
      if (screenHeight >= 1440) return 5;
      if (screenHeight >= 1080) return 5;
      if (screenHeight >= 900) return 4;
      if (screenHeight >= 720) return 4;
      if (screenHeight >= 480) return 3;
      if (screenHeight >= 360) return 2;
      if (screenHeight >= 144) return 2;
    }
    return 2; // Default galaxy count for mobile
  }

  // Galaxy
  class Galaxy {
    constructor(centerX, centerY, sizeFactor, numArms, viewAngleX, viewAngleY, galaxyColor, typeData) {
      this.centerX = centerX;
      this.centerY = centerY;
      this.sizeFactor = sizeFactor;
      this.numArms = numArms;
      this.viewAngleX = viewAngleX;
      this.viewAngleY = viewAngleY;
      this.galaxyColor = galaxyColor;
      this.typeData = typeData;
    }

    draw(ctx, scaleX, scaleY) {
      const {
        centerX, centerY, sizeFactor, numArms, viewAngleX, viewAngleY, galaxyColor, typeData
      } = this;

      const {
        baseNumPoints, tightness, startRadius, endRadius, armWidth,
        interArmDensity, coreDensity, coreRadius
      } = typeData;

      const scaledCenterX = centerX * scaleX;
      const scaledCenterY = centerY * scaleY;
      const sizeRatio = sizeFactor / MAX_SIZE_FACTOR;
      const numPoints = Math.floor(baseNumPoints * sizeRatio);

      const cosX = Math.cos(viewAngleX);
      const sinX = Math.sin(viewAngleX);
      const cosY = Math.cos(viewAngleY);
      const sinY = Math.sin(viewAngleY);

      // Pre-calculate random special colors for faster access
      const specialColors = ['#FFFFFF', '#C8C8FF', '#FFF0C8'];

      // Draw spiral arms
      for (let i = 0; i < numPoints; i++) {
        const t = i / (numPoints - 1);
        const radius = startRadius + t * (endRadius - startRadius);

        // Pre-calculate jitter factor for arm width
        const armJitter = armWidth * radius;

        for (let arm = 0; arm < numArms; arm++) {
          const angleOffset = (arm / numArms) * 2 * Math.PI;
          const angle = t * 10 * Math.PI * tightness + angleOffset;
          const jitterX = (Math.random() - 0.5) * armJitter;
          const jitterY = (Math.random() - 0.5) * armJitter;

          let x = scaledCenterX + radius * Math.cos(angle) + jitterX;
          let y = scaledCenterY + radius * Math.sin(angle) + jitterY;
          let z = 0;

          // 3D rotation (combined for X and Y axis)
          let rotatedX = (x - scaledCenterX) * cosX - z * sinX + scaledCenterX;
          let rotatedZ = (x - scaledCenterX) * sinX + z * cosX;
          x = rotatedX;
          z = rotatedZ;

          let rotatedY = (y - scaledCenterY) * cosY - z * sinY + scaledCenterY;
          z = (y - scaledCenterY) * sinY + z * cosY;
          y = rotatedY;

          const size = (Math.random() * 0.525 + 0.1) * sizeFactor;
          let finalColor = getRandomShade(galaxyColor, radius, coreRadius, endRadius);

          if (Math.random() < 0.008) {
            finalColor = specialColors[Math.floor(Math.random() * specialColors.length)];
          }

          const edgeFactor = Math.abs(jitterX) / armJitter;
          const opacity = Math.max(0.1, 1 - edgeFactor * 1.5);
          drawStar(ctx, x, y, size, finalColor, opacity);
        }
      }

      // Draw inter-arm stars
      const numInterArmStars = Math.floor(numPoints * interArmDensity);
      for (let i = 0; i < numInterArmStars; i++) {
        const radius = startRadius + Math.random() * (endRadius - startRadius);
        const angle = Math.random() * 2 * Math.PI;
        let x = scaledCenterX + radius * Math.cos(angle);
        let y = scaledCenterY + radius * Math.sin(angle);
        let z = 0;

        // 3D rotation (combined for X and Y axis)
        let rotatedX = (x - scaledCenterX) * cosX - z * sinX + scaledCenterX;
        let rotatedZ = (x - scaledCenterX) * sinX + z * cosX;
        x = rotatedX;
        z = rotatedZ;

        let rotatedY = (y - scaledCenterY) * cosY - z * sinY + scaledCenterY;
        z = (y - scaledCenterY) * sinY + z * cosY;
        y = rotatedY;

        const size = (Math.random() * 0.25 + 0.05) * sizeFactor;
        const opacity = Math.random() * 0.6 + 0.4;
        const color = getRandomShade(galaxyColor, radius, coreRadius, endRadius);
        drawStar(ctx, x, y, size, color, opacity);
      }

      // Draw the core
      const numCoreStars = Math.floor(240 * coreDensity);
      for (let i = 0; i < numCoreStars; i++) {
        const radius = Math.random() * coreRadius;
        const angle = Math.random() * 2 * Math.PI;
        let x = scaledCenterX + radius * Math.cos(angle);
        let y = scaledCenterY + radius * Math.sin(angle);
        let z = 0;

        // 3D rotation (combined for X and Y axis)
        let rotatedX = (x - scaledCenterX) * cosX - z * sinX + scaledCenterX;
        let rotatedZ = (x - scaledCenterX) * sinX + z * cosX;
        x = rotatedX;
        z = rotatedZ;

        let rotatedY = (y - scaledCenterY) * cosY - z * sinY + scaledCenterY;
        z = (y - scaledCenterY) * sinY + z * cosY;
        y = rotatedY;

        const size = (Math.random() * 0.6 + 0.15) * (1 - radius / coreRadius) * sizeFactor;
        let color;

        if (radius < coreRadius * 0.7) {
          color = '#FFFFFF';
        } else {
          const baseColor = hexToRgb(galaxyColor);
          const factor = (radius - coreRadius * 0.7) / (coreRadius * 0.3);
          const r = 255 - Math.floor(factor * (255 - baseColor.r) * 0.2);
          const g = 255 - Math.floor(factor * (255 - baseColor.g) * 0.2);
          const b = 255 - Math.floor(factor * (255 - baseColor.b) * 0.2);
          color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }

        const opacity = Math.random() * 0.4 + 0.6;
        drawStar(ctx, x, y, size, color, opacity);
      }
    }
  }

  class SpiralGalaxy extends Galaxy {
    constructor(centerX, centerY, sizeFactor, numArms, viewAngleX, viewAngleY, galaxyColor) {
      const typeData = {
        baseNumPoints: 325,
        tightness: 0.25,
        startRadius: 5 * sizeFactor,
        endRadius: BASE_GALAXY_SIZE * sizeFactor,
        armWidth: 2.9 * sizeFactor,
        interArmDensity: 2 * sizeFactor,
        coreDensity: 20 * sizeFactor,
        coreRadius: 100 * sizeFactor
      };
      super(centerX, centerY, sizeFactor, numArms, viewAngleX, viewAngleY, galaxyColor, typeData);
    }
  }

  class SpiralAlternateGalaxy extends Galaxy {
    constructor(centerX, centerY, sizeFactor, numArms, viewAngleX, viewAngleY, galaxyColor) {
      const typeData = {
        baseNumPoints: 275,
        tightness: 0.32,
        startRadius: 5 * sizeFactor,
        endRadius: BASE_GALAXY_SIZE * sizeFactor,
        armWidth: 2.2 * sizeFactor,
        interArmDensity: 2.5 * sizeFactor,
        coreDensity: 20 * sizeFactor,
        coreRadius: 80 * sizeFactor
      };
      super(centerX, centerY, sizeFactor, numArms, viewAngleX, viewAngleY, galaxyColor, typeData);
    }
  }

  class EllipticalGalaxy extends Galaxy {
    constructor(centerX, centerY, sizeFactor, numArms, viewAngleX, viewAngleY, galaxyColor) {
      const typeData = {
        baseNumPoints: 200,
        tightness: 0.7,
        startRadius: 1 * sizeFactor,
        endRadius: BASE_GALAXY_SIZE * sizeFactor,
        armWidth: 5 * sizeFactor,
        interArmDensity: 2.5 * sizeFactor,
        coreDensity: 1 * sizeFactor,
        coreRadius: 50 * sizeFactor
      };
      super(centerX, centerY, sizeFactor, numArms, viewAngleX, viewAngleY, galaxyColor, typeData);
    }
  }

  class IrregularGalaxy extends Galaxy {
    constructor(centerX, centerY, sizeFactor, numArms, viewAngleX, viewAngleY, galaxyColor) {
      const typeData = {
        baseNumPoints: 150,
        tightness: 1,
        startRadius: 5 * sizeFactor,
        endRadius: BASE_GALAXY_SIZE * sizeFactor,
        armWidth: 0 * sizeFactor,
        interArmDensity: 1.2 * sizeFactor,
        coreDensity: 0 * sizeFactor,
        coreRadius: 0 * sizeFactor
      };
      super(centerX, centerY, sizeFactor, numArms, viewAngleX, viewAngleY, galaxyColor, typeData);
    }
  }

  class RingGalaxy extends Galaxy {
    constructor(centerX, centerY, sizeFactor, numArms, viewAngleX, viewAngleY, galaxyColor) {
      const typeData = {
        baseNumPoints: 200,
        tightness: 0.5,
        startRadius: 350 * sizeFactor,
        endRadius: BASE_GALAXY_SIZE * sizeFactor,
        armWidth: 5 * sizeFactor,
        interArmDensity: 1 * sizeFactor,
        coreDensity: 20 * sizeFactor,
        coreRadius: 50 * sizeFactor
      };
      super(centerX, centerY, sizeFactor, numArms, viewAngleX, viewAngleY, galaxyColor, typeData);
    }
  }

  function initializeGalaxies() {
    const GALAXY_COUNT = getGalaxyCountByResolution();
    galaxies.length = 0; // Clear the galaxies array

    const gridCols = 5;
    const gridRows = 5;
    const cellWidth = BASE_WIDTH / gridCols;
    const cellHeight = BASE_HEIGHT / gridRows;

    // Precompute grid positions and shuffle them
    const gridPositions = [];
    let index = 0;
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        gridPositions[index++] = { row, col };
      }
    }

    // Efficient random shuffle (Fisher-Yates algorithm)
    for (let i = gridPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gridPositions[i], gridPositions[j]] = [gridPositions[j], gridPositions[i]];
    }

    // Slice the shuffled positions to select only the needed ones
    const selectedPositions = gridPositions.slice(0, GALAXY_COUNT);

    // Precompute random color arrays for each galaxy type
    const galaxyTypeColors = [
      { type: SpiralGalaxy, colors: [...galaxy_B_Type_Colors, ...galaxy_A_Type_Colors] },
      { type: SpiralAlternateGalaxy, colors: [...galaxy_O_Type_Colors, ...galaxy_B_Type_Colors, ...galaxy_A_Type_Colors] },
      { type: EllipticalGalaxy, colors: [...galaxy_G_Type_Colors, ...galaxy_K_Type_Colors, ...galaxy_M_Type_Colors] },
      { type: IrregularGalaxy, colors: galaxyColors },
      { type: RingGalaxy, colors: [...galaxy_O_Type_Colors, ...galaxy_B_Type_Colors] }
    ];

    // Precompute random values for galaxy creation
    const randomValues = Array(GALAXY_COUNT).fill(0).map(() => Math.random());

    // Generate galaxies
    for (let i = 0; i < GALAXY_COUNT; i++) {
      const { row, col } = selectedPositions[i];
      const jitterX = (Math.random() * 0.6 + 0.2) * cellWidth;
      const jitterY = (Math.random() * 0.6 + 0.2) * cellHeight;
      const centerX = col * cellWidth + jitterX;
      const centerY = row * cellHeight + jitterY;
      const sizeFactor = MIN_SIZE_FACTOR + Math.random() * (MAX_SIZE_FACTOR - MIN_SIZE_FACTOR);
      const numArms = Math.floor(Math.random() * 2) + 2;
      const viewAngleX = Math.random() * Math.PI * 2;
      const viewAngleY = Math.random() * Math.PI - Math.PI / 2;

      const rand = randomValues[i];
      let galaxyType, colorArray;

      if (rand < 0.6) {
        galaxyType = galaxyTypeColors[0].type;
        colorArray = galaxyTypeColors[0].colors;
      } else if (rand < 0.8) {
        galaxyType = galaxyTypeColors[1].type;
        colorArray = galaxyTypeColors[1].colors;
      } else if (rand < 0.9) {
        galaxyType = galaxyTypeColors[2].type;
        colorArray = galaxyTypeColors[2].colors;
      } else if (rand < 0.98) {
        galaxyType = galaxyTypeColors[3].type;
        colorArray = galaxyTypeColors[3].colors;
      } else {
        galaxyType = galaxyTypeColors[4].type;
        colorArray = galaxyTypeColors[4].colors;
      }

      const galaxyColor = colorArray[Math.floor(Math.random() * colorArray.length)];
      galaxies.push(new galaxyType(centerX, centerY, sizeFactor, numArms, viewAngleX, viewAngleY, galaxyColor));
    }
  }

  function drawStar(ctx, x, y, size, color, opacity) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];  // Return as an array for faster access
  }

  function rgbToHex(r, g, b) {
    return `#${(r < 16 ? '0' : '') + r.toString(16)}${(g < 16 ? '0' : '') + g.toString(16)}${(b < 16 ? '0' : '') + b.toString(16)}`;
  }

  function getRandomShade(baseHexColor, radius, coreRadius, endRadius) {
    const [rBase, gBase, bBase] = hexToRgb(baseHexColor); // Extract base RGB values once

    if (radius < coreRadius * 0.7) {
      return '#FFFFFF';
    }

    const transitionZone = coreRadius * 2.5;
    let r, g, b;

    if (radius < coreRadius) {
      const factor = (radius - coreRadius * 0.7) / (coreRadius * 0.3);
      r = 255 - Math.floor(factor * (255 - rBase) * 0.2);
      g = 255 - Math.floor(factor * (255 - gBase) * 0.2);
      b = 255 - Math.floor(factor * (255 - bBase) * 0.2);
      return rgbToHex(r, g, b);
    }

    if (radius < transitionZone) {
      const transitionFactor = (radius - coreRadius) / (transitionZone - coreRadius);
      r = Math.floor(255 - (transitionFactor * transitionFactor * (255 - rBase)));
      g = Math.floor(255 - (transitionFactor * transitionFactor * (255 - gBase)));
      b = Math.floor(255 - (transitionFactor * transitionFactor * (255 - bBase)));

      const variance = 15;
      r = Math.min(255, Math.max(0, r + Math.floor(Math.random() * variance - variance / 2)));
      g = Math.min(255, Math.max(0, g + Math.floor(Math.random() * variance - variance / 2)));
      b = Math.min(255, Math.max(0, b + Math.floor(Math.random() * variance - variance / 2)));
      return rgbToHex(r, g, b);
    }

    const distanceFactor = radius / endRadius;
    const brightnessFactor = 1 - distanceFactor * 0.7;
    const randomFactor = 1 - 0.25 + Math.random() * 0.5; // varianceFactor optimized

    r = Math.floor(rBase * brightnessFactor * randomFactor);
    g = Math.floor(gBase * brightnessFactor * randomFactor);
    b = Math.floor(bBase * brightnessFactor * randomFactor);

    return rgbToHex(Math.min(255, Math.max(0, r)), Math.min(255, Math.max(0, g)), Math.min(255, Math.max(0, b)));
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    initializeGalaxies();
    drawGalaxies();
	
    if (chromaticAberration.enabled) {
      applyChromaticAberration();
    }
    addAuraEffect();
    addAuraEffect();
    blurCanvasContent();
  }

  function applyChromaticAberration() {
    // Create a single temporary canvas for all operations
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    // Get the original image data
    tempCtx.drawImage(canvas, 0, 0);
    const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Create a single canvas for the combined effect
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');

    // Clear the main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Allocate arrays for red, green, blue channels
    const redData = new Uint8ClampedArray(data.length);
    const greenData = new Uint8ClampedArray(data.length);
    const blueData = new Uint8ClampedArray(data.length);

    // Populate the red, green, blue channel data
    for (let i = 0; i < data.length; i += 4) {
      redData[i] = data[i];         // Red channel
      redData[i + 3] = data[i + 3]; // Alpha

      greenData[i + 1] = data[i + 1]; // Green channel
      greenData[i + 3] = data[i + 3]; // Alpha

      blueData[i + 2] = data[i + 2]; // Blue channel
      blueData[i + 3] = data[i + 3]; // Alpha
    }

    // Apply red channel offset
    const redImageData = new ImageData(redData, canvas.width, canvas.height);
    outputCtx.putImageData(redImageData, 0, 0);
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = chromaticAberration.opacity;
    ctx.drawImage(outputCanvas, chromaticAberration.offsetRed, 0);

    // Apply green channel offset
    const greenImageData = new ImageData(greenData, canvas.width, canvas.height);
    outputCtx.putImageData(greenImageData, 0, 0);
    ctx.drawImage(outputCanvas, chromaticAberration.offsetGreen, 0);

    // Apply blue channel offset
    const blueImageData = new ImageData(blueData, canvas.width, canvas.height);
    outputCtx.putImageData(blueImageData, 0, 0);
    ctx.drawImage(outputCanvas, chromaticAberration.offsetBlue, 0);

    // Reset composite operation and alpha
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;

    // Draw original image with normal opacity to combine
    ctx.drawImage(tempCanvas, 0, 0);
  }

  function addAuraEffect() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(canvas, 0, 0);
    tempCtx.filter = 'blur(3px)';
    tempCtx.globalAlpha = 1;
    tempCtx.drawImage(tempCanvas, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0);

    for (const galaxy of galaxies) {
      const scaleX = canvas.width / BASE_WIDTH;
      const scaleY = canvas.height / BASE_HEIGHT;
      galaxy.draw(ctx, scaleX, scaleY);
    }
  }

  function blurCanvasContent() {
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Apply the separable Gaussian blur directly to the image data
    const blurredData = applySeparableGaussianBlur(data, width, height, 2);

    // Set the blurred data back to the canvas
    imageData.data.set(blurredData);
    ctx.putImageData(imageData, 0, 0);
  }

  function applySeparableGaussianBlur(data, width, height, radius) {
    const kernel = createGaussianKernel(radius);
    const kernelLength = radius * 2 + 1;

    const horizontalBlurred = new Uint8ClampedArray(data);

    // Horizontal pass (apply the kernel horizontally)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0;
        for (let kx = -radius; kx <= radius; kx++) {
          const nx = x + kx;
          if (nx >= 0 && nx < width) {
            const idx = (y * width + nx) * 4;
            const weight = kernel[kx + radius];
            r += data[idx] * weight;
            g += data[idx + 1] * weight;
            b += data[idx + 2] * weight;
            a += data[idx + 3] * weight;
          }
        }
        const idx = (y * width + x) * 4;
        horizontalBlurred[idx] = r;
        horizontalBlurred[idx + 1] = g;
        horizontalBlurred[idx + 2] = b;
        horizontalBlurred[idx + 3] = a;
      }
    }

    // Vertical pass (apply the kernel vertically)
    const finalBlurred = new Uint8ClampedArray(data);

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let r = 0, g = 0, b = 0, a = 0;
        for (let ky = -radius; ky <= radius; ky++) {
          const ny = y + ky;
          if (ny >= 0 && ny < height) {
            const idx = (ny * width + x) * 4;
            const weight = kernel[ky + radius];
            r += horizontalBlurred[idx] * weight;
            g += horizontalBlurred[idx + 1] * weight;
            b += horizontalBlurred[idx + 2] * weight;
            a += horizontalBlurred[idx + 3] * weight;
          }
        }
        const idx = (y * width + x) * 4;
        finalBlurred[idx] = r;
        finalBlurred[idx + 1] = g;
        finalBlurred[idx + 2] = b;
        finalBlurred[idx + 3] = a;
      }
    }

    return finalBlurred;
  }

  function createGaussianKernel(radius) {
    const size = radius * 2 + 1;
    const sigma = radius / 3;
    const kernel = new Array(size);
    let sum = 0;

    // Calculate the Gaussian kernel
    for (let i = -radius; i <= radius; i++) {
      const value = Math.exp(-(i * i) / (2 * sigma * sigma));
      kernel[i + radius] = value;
      sum += value;
    }

    // Normalize the kernel
    for (let i = 0; i < size; i++) {
      kernel[i] /= sum;
    }

    return kernel;
  }

  function drawGalaxies() {
    // Clear the entire canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Pre-calculate scale values outside the loop to avoid repeated computation
    const scaleX = canvas.width / BASE_WIDTH;
    const scaleY = canvas.height / BASE_HEIGHT;

    // Use a simple for loop for iterating over galaxies for better performance (vs for..of)
    const galaxiesLength = galaxies.length;  // Cache the length for better loop performance
    for (let i = 0; i < galaxiesLength; i++) {
      // Draw each galaxy using the pre-calculated scaling factors
      galaxies[i].draw(ctx, scaleX, scaleY);
    }
  }

  function initialize() {
    resizeCanvas();
  }

  initialize();
  window.addEventListener('resize', resizeCanvas);
});
