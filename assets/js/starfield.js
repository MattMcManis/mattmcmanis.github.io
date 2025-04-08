/*
 * Copyright © 2025 Matt McManis
 */
window.addEventListener("DOMContentLoaded", function () {
  // Configurable Parameters
  const params = {
    referenceWidth: 1920,
    referenceHeight: 1080,
    starCounts: {
      large: { count: 115, enabled: true },
      medium: { count: 390, enabled: true },
      small: { count: 2500, enabled: true },
      tiny: { count: 6800, enabled: true },
    },
    starSizes: {
      large: { min: 2.8, max: 3.5, enabled: true },
      medium: { min: 1.6, max: 2.7, enabled: true },
      small: { min: 0.8, max: 1.5, enabled: true },
      tiny: { min: 0.3, max: 0.7, enabled: true },
    },
    brightness: {
      large: { value: 1.0, enabled: true },
      medium: { value: 1.0, enabled: true },
      small: { value: 1.0, enabled: true },
      tiny: { value: 1.0, enabled: true },
    },
    twinkle: {
      large: { enabled: true, speed: 0.005, intensityRadius: 0.15, intensityOpacity: 0.1, percentage: 0.3 }, // 0.5 = 50% twinkle
      medium: { enabled: true, speed: 0.005, intensityRadius: 0.25, intensityOpacity: 0.5, percentage: 0.4 },
      small: { enabled: true, speed: 0.005, intensityRadius: 0.10, intensityOpacity: 0.3, percentage: 0.5 },
      tiny: { enabled: true, speed: 0.005, intensityRadius: 0.005, intensityOpacity: 0.4, percentage: 0.6 },
    },
    starburst: {
      allSizes: {
        enabled: true,
        rayCount: 4,
        rayLengthFactor: 12,
        angle: 0,
        opacity: 0.8,
        minRayFactor: 0.80,
      },
      large: { enabled: true, animate: true, animationSpeed: 7 },
      medium: { enabled: true, animate: true, animationSpeed: 7 },
      small: { enabled: false, animate: true, animationSpeed: 0 },
      tiny: { enabled: false, animate: true, animationSpeed: 0 },
    },
    glow: {
      large: { enabled: true, sizeFactor: 5.25, opacity: 0.35 },
      medium: { enabled: true, sizeFactor: 3.75, opacity: 0.3 },
      small: { enabled: false, sizeFactor: 2.75, opacity: 0.2 },
      tiny: { enabled: false, sizeFactor: 1.75, opacity: 0.1 },
    },
    blur: {
      large: { amount: 0, enabled: false },
      medium: { amount: 0, enabled: false },
      small: { amount: 0.1, enabled: true },
      tiny: { amount: 0.1, enabled: false },
    },
    distribution: 0.0,
    basicColors: {
      '#adb2ff': 1, // O-type (Blue-Violet)
      '#4f86f6': 1,
      '#5aadf2': 2, // B-type (Blue)
      '#91c2ff': 3,
      '#cef3ff': 10, // A-type (Blue-White)
      '#ffffff': 10,
      '#ffffe3': 0, // F-type (White)
      '#fcfc8f': 1,
      '#fef3b9': 1, // G-type (Yellow)
      '#fb9964': 1,
      '#fdbaa2': 1, // K-type (Orange)
      '#f37477': 1,
      '#f9bdcd': 1, // M-type (Red)
    },
    mediumStarColors: {
      '#7b96ff': 1, // Blue-violet
      '#3480ff': 8, // Bright Blue
      '#76cffa': 1, // Light Sky Blue
      '#ffe687': 3, // Bright yellow
      '#ffab1a': 1, // Deep orange
      '#ff7f10': 1, // Red-orange
      '#ff5b5b': 3, // Light Red
      '#3ffab2': 1, // Medium Spring Green
      '#48D1CC': 1, // Medium Turquoise
      '#20B2AA': 1, // Light Sea Green
    },
    largeStarColors: {
      '#7b96ff': 1, // Blue-violet
      '#3480ff': 8, // Bright Blue
      '#76cffa': 1, // Light Sky Blue
      '#ffe687': 3, // Bright yellow
      '#ffab1a': 1, // Deep orange
      '#ff7f10': 1, // Red-orange
      '#ff5b5b': 3, // Light Red
      '#3ffab2': 1, // Medium Spring Green
      '#48D1CC': 1, // Medium Turquoise
      '#20B2AA': 1, // Light Sea Green
    },
    useOffScreenCanvas: true,
    globalFramerate: 20,
  };

  let canvas, ctx, offScreenCanvas, offScreenCtx;
  let width, height;
  let animationFrameId;
  let lastFrameTime = 0;
  let frameInterval = 1000 / params.globalFramerate;
  let stars = {
    large: [],
    medium: [],
    small: [],
    tiny: [],
  };
  const starLayers = ['large', 'medium', 'small', 'tiny'];
  // Pre-calculate and store animation data
  let starAnimationData = {
    large: [],
    medium: [],
    small: [],
    tiny: [],
  };
  // Store last twinkle time for each star
  let lastTwinkleTime = {
    large: [],
    medium: [],
    small: [],
    tiny: [],
  };
  // Store whether each star should twinkle or not
  let starTwinkleStatus = {
    large: [],
    medium: [],
    small: [],
    tiny: [],
  };
  //Global variable for resize timeout
  let resizeTimeout;

  function init() {
    canvas = document.getElementById('starsCanvas');
    ctx = canvas.getContext('2d', {
      willReadFrequently: false,
    });
    resizeCanvas();

    if (params.useOffScreenCanvas) {
      offScreenCanvas = document.createElement('canvas');
      offScreenCanvas.width = width;
      offScreenCanvas.height = height;
      offScreenCtx = offScreenCanvas.getContext('2d', {
        willReadFrequently: false,
      });
    }

    generateStars();
    animate();
    window.addEventListener('resize', handleResize, {
      passive: true,
    });
  }

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    if (offScreenCanvas) {
      offScreenCanvas.width = width;
      offScreenCanvas.height = height;
    }
  }

  function handleResize() {
    // Clear the timeout
    clearTimeout(resizeTimeout);
    // Set a new timeout
    resizeTimeout = setTimeout(() => {
      cancelAnimationFrame(animationFrameId);
      resizeCanvas();
      generateStars();
      animate();
    }, 100); // 100ms debounce time
  }

  function generateColorPalette(colorObj) {
    const palette = [];
    for (const color in colorObj) {
      const weight = colorObj[color];
      for (let i = 0; i < weight; i++) {
        palette.push(color);
      }
    }
    return palette;
  }

  function getRandomColor(sizeClass) {
    let palette = generateColorPalette(params.basicColors);

    // Check sizeClass and only concatenate if necessary
    if (sizeClass === 'medium' && params.mediumStarColors) {
      for (const color in params.mediumStarColors) {
        const weight = params.mediumStarColors[color];
        for (let i = 0; i < weight; i++) {
          palette.push(color);
        }
      }
    } else if (sizeClass === 'large' && params.largeStarColors) {
      for (const color in params.largeStarColors) {
        const weight = params.largeStarColors[color];
        for (let i = 0; i < weight; i++) {
          palette.push(color);
        }
      }
    }

    return palette[Math.floor(Math.random() * palette.length)];
  }

  function applyBrightness(color, brightness) {
    if (brightness === 1) return color;

    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    const adjustedR = (r * brightness) | 0; // Faster Math.floor
    const adjustedG = (g * brightness) | 0;
    const adjustedB = (b * brightness) | 0;

    const clamp = (val) => (val > 255 ? 255 : val < 0 ? 0 : val);

    const clampedR = clamp(adjustedR);
    const clampedG = clamp(adjustedG);
    const clampedB = clamp(adjustedB);

    const hexR = clampedR.toString(16).padStart(2, '0');
    const hexG = clampedG.toString(16).padStart(2, '0');
    const hexB = clampedB.toString(16).padStart(2, '0');

    return `#${hexR}${hexG}${hexB}`;
  }

  function generatePosition() {
    const factor = params.distribution;
    let x = Math.random() * width;
    let y = Math.random() * height;

    if (factor > 0) {
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const dx = x - centerX;
      const dy = y - centerY;

      const distanceSquared = dx * dx + dy * dy;

      if (distanceSquared > 0) {
        const angle = Math.atan2(dy, dx);
        const adjustedDistance = Math.sqrt(distanceSquared) * Math.pow(Math.random(), factor);

        x = centerX + Math.cos(angle) * adjustedDistance;
        y = centerY + Math.sin(angle) * adjustedDistance;
      }
    }
    return {
      x,
      y,
    };
  }

  function generateStars() {
    const scaleFactor = Math.min(width / params.referenceWidth, height / params.referenceHeight);
    const layerCount = starLayers.length;

    for (let layerIndex = 0; layerIndex < layerCount; layerIndex++) {
      const size = starLayers[layerIndex];
      stars[size] = [];
      starAnimationData[size] = [];
      lastTwinkleTime[size] = [];
      starTwinkleStatus[size] = []; // Initialize the twinkle status array

      if (!params.starCounts[size].enabled) continue;

      const count = Math.floor(params.starCounts[size].count * scaleFactor);
      const minSize = params.starSizes[size].min;
      const maxSize = params.starSizes[size].max;
      const brightness = params.brightness[size].value;
      const twinklePercentage = params.twinkle[size].percentage; // Get twinkle percentage

      const starList = stars[size];
      const animDataList = starAnimationData[size];
      const lastTwinkleList = lastTwinkleTime[size];
      const twinkleStatusList = starTwinkleStatus[size]; // Get twinkle status list

      for (let i = 0; i < count; i++) {
        const {
          x,
          y,
        } = generatePosition();
        const radius = minSize + Math.random() * (maxSize - minSize);
        const baseColor = getRandomColor(size);
        let color = params.brightness[size].enabled ? applyBrightness(baseColor, brightness) : baseColor;

        if (size === 'large' || size === 'medium') {
          color = '#ffffff';
        }

        const twinklePhase = Math.random() * Math.PI * 2;
        const burstPhase = Math.random() * Math.PI * 2;
        const twinkleFreq2 = 0.3 + Math.random() * 0.7;
        const shouldTwinkle = Math.random() < twinklePercentage; // Determine if this star should twinkle

        starList.push({
          x,
          y,
          radius,
          color,
          twinklePhase,
          burstPhase,
          baseColor,
          twinkleFreq2,
        });
        animDataList[i] = {
          actualRadius: radius,
          actualOpacity: 1,
          animFactors: Array(params.starburst.allSizes.rayCount).fill(1),
        };
        lastTwinkleList[i] = 0;
        twinkleStatusList[i] = shouldTwinkle; // Store the twinkle status
      }
    }
  }

  function drawStar(ctx, star, sizeClass, time, animationData) {
    const { x, y, radius, color } = star;
    let { actualRadius, actualOpacity } = animationData;
    const twinkleParams = params.twinkle[sizeClass];
    const starIndex = stars[sizeClass].indexOf(star); // Cache index to avoid repeated lookup
    const shouldTwinkle = starTwinkleStatus[sizeClass][starIndex];

    if (twinkleParams.enabled && shouldTwinkle) {
      const deltaTime = time - lastTwinkleTime[sizeClass][starIndex];
      if (deltaTime >= frameInterval) {
        const primaryWave = Math.sin(star.twinklePhase + time * twinkleParams.speed);
        const secondaryWave = Math.sin(star.twinklePhase * star.twinkleFreq2 + time * twinkleParams.speed * 0.7) * 0.5;
        const twinkleFactor = (primaryWave + secondaryWave) / 1.5;
        actualRadius = radius * (1 + twinkleFactor * twinkleParams.intensityRadius);
        actualOpacity = 1 - Math.abs(twinkleFactor) * twinkleParams.intensityOpacity;
        lastTwinkleTime[sizeClass][starIndex] = time;
      }
    } else {
      actualRadius = radius;
      actualOpacity = 1;
    }

    // Draw Starburst if enabled
    if (params.starburst.allSizes.enabled && params.starburst[sizeClass].enabled) {
      drawStarburst(ctx, star, sizeClass, time, animationData);
    }

    // Draw Glow if enabled
    if (params.glow[sizeClass].enabled) {
      const glowColor = (sizeClass === 'large' || sizeClass === 'medium') ? star.baseColor : color;
      drawGlow(ctx, star, actualRadius, glowColor, sizeClass);
    }

    // Draw the star
    ctx.beginPath();
    ctx.arc(x, y, actualRadius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = actualOpacity;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawStarburst(ctx, star, sizeClass, time, animationData) {
    const { x, y, radius, baseColor } = star;
    const rayCount = params.starburst.allSizes.rayCount;
    let rayLength = radius * params.starburst.allSizes.rayLengthFactor;
    const sizeFactor = { large: 1, medium: 0.7, small: 0.5, tiny: 0.3 };
    rayLength *= sizeFactor[sizeClass];

    let { animFactors } = animationData;
    const animationSpeed = params.starburst[sizeClass].animationSpeed;

    if (params.starburst[sizeClass].animate) {
      for (let i = 0; i < rayCount; i++) {
        const uniquePhase = star.burstPhase + i * 0.7;
        const combinedWave = (
          Math.sin(uniquePhase + time * animationSpeed) +
          Math.sin(uniquePhase * 1.3 + time * animationSpeed * 2.1) * 0.3 +
          Math.sin(uniquePhase * 0.7 + time * animationSpeed * 0.5) * 0.15 +
          1.45
        ) / 2.9;
        const rayFactor = params.starburst.allSizes.minRayFactor + combinedWave * (1 - params.starburst.allSizes.minRayFactor);
        animFactors[i] = rayFactor; // Update pre-calculated data
      }
    }

    const angleStep = Math.PI * 2 / rayCount;
    const startAngle = params.starburst.allSizes.angle * Math.PI / 180;
    ctx.save();
    ctx.globalAlpha = params.starburst.allSizes.opacity;

    // Draw rays
    for (let i = 0; i < rayCount; i++) {
      const angle = startAngle + i * angleStep;
      const currentRayLength = rayLength * animFactors[i];
      const endX = x + Math.cos(angle) * currentRayLength;
      const endY = y + Math.sin(angle) * currentRayLength;
      const gradient = ctx.createLinearGradient(x, y, endX, endY);
      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = radius * 0.5;
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawGlow(ctx, star, radius, glowColor, sizeClass) {
    const {
      x,
      y,
    } = star;
    const sizeFactor = params.glow[sizeClass].sizeFactor;
    const glowOpacity = params.glow[sizeClass].opacity;

    // Precompute the glow radius once
    const glowRadius = radius * sizeFactor;

    // Convert glowColor to RGB once, instead of every time
    const r = parseInt(glowColor.slice(1, 3), 16);
    const g = parseInt(glowColor.slice(3, 5), 16);
    const b = parseInt(glowColor.slice(5, 7), 16);

    // Prepare the gradient - Create it once and reuse it as needed
    const gradient = ctx.createRadialGradient(x, y, radius * 0.5, x, y, glowRadius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${glowOpacity})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    // Save the context state and set glow effect
    ctx.save(); // Save state before drawing glow

    // Set the fillStyle to the precomputed gradient
    ctx.fillStyle = gradient;

    // Draw the glow with a circle
    ctx.beginPath();
    ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // Restore state to avoid affecting other drawings
  }

  function applyBlur(ctx, sizeClass) {
    if (params.blur[sizeClass].enabled && params.blur[sizeClass].amount > 0) {
      // Apply blur once per layer instead of for each star
      ctx.filter = `blur(${params.blur[sizeClass].amount}px)`;
    }
  }

  function resetFilters(ctx) {
    ctx.filter = 'none'; // Reset after drawing each layer
  }

  function drawStars(timestamp = 0) {
    const time = timestamp;
    const drawCtx = params.useOffScreenCanvas ? offScreenCtx : ctx;

    // Clear the entire canvas before drawing
    drawCtx.clearRect(0, 0, width, height);

    // Process each star layer once
    for (const layer of starLayers) {
      if (!params.starCounts[layer].enabled) continue;

      // Apply blur filter once for the layer, instead of for each star
      applyBlur(drawCtx, layer);

      // Draw all stars in the current layer
      for (let i = 0; i < stars[layer].length; i++) {
        const star = stars[layer][i];
        const animationData = starAnimationData[layer][i]; // Pre-calculated data for the star
        drawStar(drawCtx, star, layer, time, animationData); // Pass pre-calculated data to drawing function
      }

      // Reset the filter after the entire layer is drawn
      resetFilters(drawCtx);
    }

    // If using offscreen canvas, transfer the drawn content to the main canvas
    if (params.useOffScreenCanvas) {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(offScreenCanvas, 0, 0);
    }
  }

  function animate(timestamp = 0) {
    const globalFrameRate = params.globalFramerate;
    const frameInterval = 1000 / globalFrameRate;
    if (timestamp - lastFrameTime >= frameInterval) {
      drawStars(timestamp);
      lastFrameTime = timestamp; // Update lastFrameTime for animation
    }

    // Calculate and display FPS
    //calculateFPS(timestamp);

    animationFrameId = requestAnimationFrame(animate);
  }

  // Function to calculate and display FPS
  let fpsLastTime = 0; // Keep a separate variable for FPS calculation

  function calculateFPS(currentTime) {
    if (!fpsLastTime) {
      fpsLastTime = currentTime;
      return;
    }

    const deltaTime = currentTime - fpsLastTime;
    const fps = 1000 / deltaTime;
    fpsLastTime = currentTime;

    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText(`FPS: ${fps.toFixed(1)}`, width - 10, 20);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
      if (!animationFrameId) {
        animate();
      }
    } else {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }, {
    passive: true
  });

  init();
});
