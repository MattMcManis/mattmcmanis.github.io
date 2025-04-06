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
    const screenHeight = window.screen.height;
    const screenWidth = window.screen.width;
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

      // Draw spiral arms
      for (let i = 0; i < numPoints; i++) {
        const t = i / (numPoints - 1);
        const radius = startRadius + t * (endRadius - startRadius);
        for (let arm = 0; arm < numArms; arm++) {
          const angleOffset = (arm / numArms) * 2 * Math.PI;
          const angle = t * 10 * Math.PI * tightness + angleOffset;
          const jitterX = (Math.random() - 0.5) * armWidth * radius;
          const jitterY = (Math.random() - 0.5) * armWidth * radius;
          let x = scaledCenterX + radius * Math.cos(angle) + jitterX;
          let y = scaledCenterY + radius * Math.sin(angle) + jitterY;
          let z = 0;

          // 3D rotation
          const rotatedX = (x - scaledCenterX) * cosX - z * sinX + scaledCenterX;
          const rotatedZ = (x - scaledCenterX) * sinX + z * cosX;
          x = rotatedX;
          z = rotatedZ;

          const rotatedY = (y - scaledCenterY) * cosY - z * sinY + scaledCenterY;
          const rotatedZ2 = (y - scaledCenterY) * sinY + z * cosY;
          y = rotatedY;
          z = rotatedZ2;

          const size = (Math.random() * 0.525 + 0.1) * sizeFactor;
          const color = getRandomShade(galaxyColor, radius, coreRadius, endRadius);
          let finalColor = color;

          if (Math.random() < 0.008) {
            const specialColors = ['#FFFFFF', '#C8C8FF', '#FFF0C8'];
            finalColor = specialColors[Math.floor(Math.random() * specialColors.length)];
          }
          const edgeFactor = Math.abs(jitterX) / (armWidth * radius);
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

        // 3D rotation
        const rotatedX = (x - scaledCenterX) * cosX - z * sinX + scaledCenterX;
        const rotatedZ = (x - scaledCenterX) * sinX + z * cosX;
        x = rotatedX;
        z = rotatedZ;

        const rotatedY = (y - scaledCenterY) * cosY - z * sinY + scaledCenterY;
        const rotatedZ2 = (y - scaledCenterY) * sinY + z * cosY;
        y = rotatedY;
        z = rotatedZ2;

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

        // 3D rotation
        const rotatedX = (x - scaledCenterX) * cosX - z * sinX + scaledCenterX;
        const rotatedZ = (x - scaledCenterX) * sinX + z * cosX;
        x = rotatedX;
        z = rotatedZ;

        const rotatedY = (y - scaledCenterY) * cosY - z * sinY + scaledCenterY;
        const rotatedZ2 = (y - scaledCenterY) * sinY + z * cosY;
        y = rotatedY;
        z = rotatedZ2;

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
    galaxies.length = 0;

    const gridCols = 5;
    const gridRows = 5;
    const cellWidth = BASE_WIDTH / gridCols;
    const cellHeight = BASE_HEIGHT / gridRows;

    const gridPositions = [];
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        gridPositions.push({ row, col });
      }
    }

    for (let i = gridPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gridPositions[i], gridPositions[j]] = [gridPositions[j], gridPositions[i]];
    }

    const selectedPositions = gridPositions.slice(0, GALAXY_COUNT);

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

      const rand = Math.random();
      let galaxyType;
      let colorArray;

      if (rand < 0.6) {
        galaxyType = SpiralGalaxy;
        colorArray = [...galaxy_B_Type_Colors, ...galaxy_A_Type_Colors];
      } else if (rand < 0.8) {
        galaxyType = SpiralAlternateGalaxy;
        colorArray = [...galaxy_O_Type_Colors, ...galaxy_B_Type_Colors, ...galaxy_A_Type_Colors];
      } else if (rand < 0.9) {
        galaxyType = EllipticalGalaxy;
        colorArray = [...galaxy_G_Type_Colors, ...galaxy_K_Type_Colors, ...galaxy_M_Type_Colors];
      } else if (rand < 0.98) {
        galaxyType = IrregularGalaxy;
        colorArray = galaxyColors;
      } else {
        galaxyType = RingGalaxy;
        colorArray = [...galaxy_O_Type_Colors, ...galaxy_B_Type_Colors];
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
    return { r, g, b };
  }

  function getRandomShade(baseHexColor, radius, coreRadius, endRadius) {
    const transitionZone = coreRadius * 2.5;

    if (radius < coreRadius * 0.7) {
      return '#FFFFFF';
    } else if (radius < coreRadius) {
      const factor = (radius - coreRadius * 0.7) / (coreRadius * 0.3);
      const baseColor = hexToRgb(baseHexColor);
      const r = 255 - Math.floor(factor * (255 - baseColor.r) * 0.2);
      const g = 255 - Math.floor(factor * (255 - baseColor.g) * 0.2);
      const b = 255 - Math.floor(factor * (255 - baseColor.b) * 0.2);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    } else if (radius < transitionZone) {
      const transitionFactor = (radius - coreRadius) / (transitionZone - coreRadius);
      const baseColor = hexToRgb(baseHexColor);
      const r = Math.floor(255 - (transitionFactor * transitionFactor * (255 - baseColor.r)));
      const g = Math.floor(255 - (transitionFactor * transitionFactor * (255 - baseColor.g)));
      const b = Math.floor(255 - (transitionFactor * transitionFactor * (255 - baseColor.b)));
      const variance = 15;
      const vR = Math.floor(Math.random() * variance - variance / 2);
      const vG = Math.floor(Math.random() * variance - variance / 2);
      const vB = Math.floor(Math.random() * variance - variance / 2);
      const finalR = Math.min(255, Math.max(0, r + vR));
      const finalG = Math.min(255, Math.max(0, g + vG));
      const finalB = Math.min(255, Math.max(0, b + vB));
      return `#${finalR.toString(16).padStart(2, '0')}${finalG.toString(16).padStart(2, '0')}${finalB.toString(16).padStart(2, '0')}`;
    }

    const distanceFactor = radius / endRadius;
    const baseColor = hexToRgb(baseHexColor);
    const brightnessFactor = 1 - distanceFactor * 0.7;
    const varianceFactor = 0.5;
    const randomFactor = 1 - varianceFactor / 2 + Math.random() * varianceFactor;
    let r = Math.floor(baseColor.r * brightnessFactor * randomFactor);
    let g = Math.floor(baseColor.g * brightnessFactor * randomFactor);
    let b = Math.floor(baseColor.b * brightnessFactor * randomFactor);
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
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
    
    // Apply red channel offset
    outputCtx.clearRect(0, 0, canvas.width, canvas.height);
    const redData = new ImageData(new Uint8ClampedArray(data.length), canvas.width, canvas.height);
    for (let i = 0; i < data.length; i += 4) {
      redData.data[i] = data[i];       // Red channel
      redData.data[i + 3] = data[i + 3]; // Alpha
    }
    outputCtx.putImageData(redData, 0, 0);
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = chromaticAberration.opacity;
    ctx.drawImage(outputCanvas, chromaticAberration.offsetRed, 0);
    
    // Apply green channel offset
    outputCtx.clearRect(0, 0, canvas.width, canvas.height);
    const greenData = new ImageData(new Uint8ClampedArray(data.length), canvas.width, canvas.height);
    for (let i = 0; i < data.length; i += 4) {
      greenData.data[i + 1] = data[i + 1]; // Green channel
      greenData.data[i + 3] = data[i + 3]; // Alpha
    }
    outputCtx.putImageData(greenData, 0, 0);
    ctx.drawImage(outputCanvas, chromaticAberration.offsetGreen, 0);
    
    // Apply blue channel offset
    outputCtx.clearRect(0, 0, canvas.width, canvas.height);
    const blueData = new ImageData(new Uint8ClampedArray(data.length), canvas.width, canvas.height);
    for (let i = 0; i < data.length; i += 4) {
      blueData.data[i + 2] = data[i + 2]; // Blue channel
      blueData.data[i + 3] = data[i + 3]; // Alpha
    }
    outputCtx.putImageData(blueData, 0, 0);
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
    const blurredData = applySeparableGaussianBlur(data, width, height, 2);
    imageData.data.set(blurredData);
    ctx.putImageData(imageData, 0, 0);
  }

  function applySeparableGaussianBlur(data, width, height, radius) {
    const kernel = createGaussianKernel(radius);
    const horizontalBlurred = new Uint8ClampedArray(data);

    // Horizontal pass
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

    // Vertical pass
    const finalBlurred = new Uint8ClampedArray(horizontalBlurred);
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
    
    for (let i = -radius; i <= radius; i++) {
      kernel[i + radius] = Math.exp(-(i * i) / (2 * sigma * sigma));
      sum += kernel[i + radius];
    }
    
    for (let i = 0; i < size; i++) {
      kernel[i] /= sum;
    }
    
    return kernel;
  }

  function drawGalaxies() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scaleX = canvas.width / BASE_WIDTH;
    const scaleY = canvas.height / BASE_HEIGHT;
    
    for (const galaxy of galaxies) {
      galaxy.draw(ctx, scaleX, scaleY);
    }
  }

  function initialize() {
    resizeCanvas();
  }
  
  initialize();
  window.addEventListener('resize', resizeCanvas);
});
