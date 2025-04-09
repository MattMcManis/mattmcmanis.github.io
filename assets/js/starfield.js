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
	  medium: { min: 1.7, max: 2.7, enabled: true },
	  small: { min: 0.8, max: 1.6, enabled: true },
	  tiny: { min: 0.3, max: 0.7, enabled: true },
	},
	brightness: {
	  large: { value: 1.0, enabled: true },
	  medium: { value: 1.0, enabled: true },
	  small: { value: 1.0, enabled: true },
	  tiny: { value: 1.0, enabled: true },
	},
	twinkle: {
	  large: { enabled: true, speed: 0.005, intensityRadius: 0.15, intensityOpacity: 0.1, percentage: 0.3 },
	  medium: { enabled: true, speed: 0.005, intensityRadius: 0.25, intensityOpacity: 0.5, percentage: 0.4 },
	  small: { enabled: true, speed: 0.005, intensityRadius: 0.10, intensityOpacity: 0.3, percentage: 0.5 },
	  tiny: { enabled: true, speed: 0.005, intensityRadius: 0.005, intensityOpacity: 0.4, percentage: 0.6 },
	},
	starburst: {
	  allSizes: {
		enabled: true,
		rayCount: 4,
		rayLengthFactor: 9,
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
	  large: { enabled: true, sizeFactor: 4.75, opacity: 0.35  },
	  medium: { enabled: true, sizeFactor: 3.75, opacity: 0.3 },
	  small: { enabled: false, sizeFactor: 2.75, opacity: 0.2 },
	  tiny: { enabled: false, sizeFactor: 1.75, opacity: 0.1 },
	},
	blur: {
	  large: { amount: 0, enabled: false },
	  medium: { amount: 0, enabled: false },
	  small: { amount: 0.1, enabled: false },
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
	  '#3ffab2': 2, // Medium Spring Green
	  '#48D1CC': 1, // Medium Turquoise
	  '#20B2AA': 1, // Light Sea Green
	},
	useOffScreenCanvas: true,
	globalFramerate: 20,
	poolSizeFactor: 1.2, // Initial pool size multiplier (20% more than needed)
  };

  let canvas, ctx, offScreenCanvas, offScreenCtx;
  let width, height;
  let animationFrameId = null; // Initialize to null
  let lastFrameTime = 0;
  const frameInterval = 1000 / params.globalFramerate;
  const starLayers = ['large', 'medium', 'small', 'tiny'];
  
  // Object pools
  const starPools = {
	large: [],
	medium: [],
	small: [],
	tiny: [],
  };
  
  // Active stars
  const stars = {
	large: [],
	medium: [],
	small: [],
	tiny: [],
  };
  
  // Animation data
  const starAnimationData = {
	large: [],
	medium: [],
	small: [],
	tiny: [],
  };
  
  // Twinkle data
  const lastTwinkleTime = {
	large: [],
	medium: [],
	small: [],
	tiny: [],
  };
  
  const starTwinkleStatus = {
	large: [],
	medium: [],
	small: [],
	tiny: [],
  };
  
  // Global variable for resize timeout
  let resizeTimeout;

  // Color palettes - Initialize as constants
  const colorPalettes = {
	basic: [],
	medium: [],
	large: []
  };

  function init() {
	canvas = document.getElementById('starsCanvas');
	if (!canvas) {
	  console.error('Canvas element not found');
	  return;
	}
	
	ctx = canvas.getContext('2d', {
	  willReadFrequently: false,
	  alpha: true // Optimization for opaque canvas
	});
	
	resizeCanvas();

	if (params.useOffScreenCanvas) {
	  offScreenCanvas = document.createElement('canvas');
	  offScreenCanvas.width = width;
	  offScreenCanvas.height = height;
	  offScreenCtx = offScreenCanvas.getContext('2d', {
		willReadFrequently: false,
		alpha: true // Optimization for opaque canvas
	  });
	}

	// Initialize color palettes
	initColorPalettes();
	
	// Initialize star pools
	initStarPools();
	
	// Generate active stars from pools
	generateStars();
	
	animate();
	
	// Use passive listener for better performance
	window.addEventListener('resize', handleResize, {
	  passive: true,
	});
  }

  function initColorPalettes() {
	colorPalettes.basic = generateColorPalette(params.basicColors);
	colorPalettes.medium = [...colorPalettes.basic];
	colorPalettes.large = [...colorPalettes.basic];
	
	// Add medium star colors
	if (params.mediumStarColors) {
	  for (const color in params.mediumStarColors) {
		const weight = params.mediumStarColors[color];
		for (let i = 0; i < weight; i++) {
		  colorPalettes.medium.push(color);
		}
	  }
	}
	
	// Add large star colors
	if (params.largeStarColors) {
	  for (const color in params.largeStarColors) {
		const weight = params.largeStarColors[color];
		for (let i = 0; i < weight; i++) {
		  colorPalettes.large.push(color);
		}
	  }
	}
  }

  function initStarPools() {
	const scaleFactor = Math.min(width / params.referenceWidth, height / params.referenceHeight);
	
	for (const size of starLayers) {
	  if (!params.starCounts[size].enabled) continue;
	  
	  const count = Math.floor(params.starCounts[size].count * scaleFactor);
	  const poolSize = Math.ceil(count * params.poolSizeFactor);
	  
	  // Create objects for the pool
	  for (let i = 0; i < poolSize; i++) {
		starPools[size].push(createStar(size));
	  }
	}
  }

  function createStar(sizeClass) {
	const minSize = params.starSizes[sizeClass].min;
	const maxSize = params.starSizes[sizeClass].max;
	const radius = minSize + Math.random() * (maxSize - minSize);
	const baseColor = getRandomColor(sizeClass);
	
	return {
	  x: 0,
	  y: 0,
	  radius,
	  color: baseColor,
	  twinklePhase: Math.random() * Math.PI * 2,
	  burstPhase: Math.random() * Math.PI * 2,
	  baseColor,
	  twinkleFreq2: 0.3 + Math.random() * 0.7
	};
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
	  if (resizeTimeout) {
		clearTimeout(resizeTimeout);
	  }
	  
	  resizeTimeout = setTimeout(() => {
		if (animationFrameId !== null) {
		  cancelAnimationFrame(animationFrameId);
		  animationFrameId = null;
		}
		
		resizeCanvas();
		
		// Reinitialize offscreen canvas if using it
		if (params.useOffScreenCanvas) {
		  offScreenCanvas = document.createElement('canvas');
		  offScreenCanvas.width = width;
		  offScreenCanvas.height = height;
		  offScreenCtx = offScreenCanvas.getContext('2d', {
			willReadFrequently: false,
			alpha: true // Optimization for opaque canvas
		  });
		}
		
		// Return stars to pool
		returnStarsToPool();
		
		// Resize pools if needed
		resizePools();
		
		// Generate active stars from pools
		generateStars();
		
		// Clear timeout reference
		resizeTimeout = null;
		
		// Restart animation
		animate();
	  }, 100);
	}

  function returnStarsToPool() {
	for (const size of starLayers) {
	  if (!params.starCounts[size].enabled) continue;
	  
	  // Move all stars back to pool
	  while (stars[size].length > 0) {
		starPools[size].push(stars[size].pop());
	  }
	  
	  // Clear animation data
	  starAnimationData[size].length = 0;
	  lastTwinkleTime[size].length = 0;
	  starTwinkleStatus[size].length = 0;
	}
  }

  function resizePools() {
	const scaleFactor = Math.min(width / params.referenceWidth, height / params.referenceHeight);
	
	for (const size of starLayers) {
	  if (!params.starCounts[size].enabled) continue;
	  
	  const count = Math.floor(params.starCounts[size].count * scaleFactor);
	  const desiredSize = Math.ceil(count * params.poolSizeFactor);
	  
	  // Add more stars to pool if needed
	  while (starPools[size].length < desiredSize) {
		starPools[size].push(createStar(size));
	  }
	}
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
	let palette;
	
	if (sizeClass === 'medium') {
	  palette = colorPalettes.medium;
	} else if (sizeClass === 'large') {
	  palette = colorPalettes.large;
	} else {
	  palette = colorPalettes.basic;
	}
	
	return palette[Math.floor(Math.random() * palette.length)];
  }

  function applyBrightness(color, brightness) {
	if (brightness === 1) return color;

	const hex = color.slice(1);
	const r = parseInt(hex.slice(0, 2), 16);
	const g = parseInt(hex.slice(2, 4), 16);
	const b = parseInt(hex.slice(4, 6), 16);

	const adjustedR = Math.round(r * brightness);
	const adjustedG = Math.round(g * brightness);
	const adjustedB = Math.round(b * brightness);

	const clamp = (val) => Math.min(255, Math.max(0, val));

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
	return { x, y };
  }

  function acquireStarFromPool(sizeClass) {
	if (starPools[sizeClass].length === 0) {
	  // Create a new star if pool is empty (should rarely happen)
	  return createStar(sizeClass);
	}
	
	// Get star from pool
	return starPools[sizeClass].pop();
  }

  function generateStars() {
	const scaleFactor = Math.min(width / params.referenceWidth, height / params.referenceHeight);

	for (const size of starLayers) {
	  if (!params.starCounts[size].enabled) continue;

	  const count = Math.floor(params.starCounts[size].count * scaleFactor);
	  const brightness = params.brightness[size].value;
	  const twinklePercentage = params.twinkle[size].percentage;

	  for (let i = 0; i < count; i++) {
		// Acquire star from pool
		const star = acquireStarFromPool(size);
		
		// Set position
		const pos = generatePosition();
		star.x = pos.x;
		star.y = pos.y;
		
		// Apply brightness
		let color = params.brightness[size].enabled ? 
		  applyBrightness(star.baseColor, brightness) : star.baseColor;

		if (size === 'large' || size === 'medium') {
		  color = '#ffffff';
		}
		
		star.color = color;
		
		// Add to active stars
		stars[size].push(star);
		
		// Initialize animation data
		starAnimationData[size][i] = {
		  actualRadius: star.radius,
		  actualOpacity: 1,
		  animFactors: Array(params.starburst.allSizes.rayCount).fill(1),
		};
		
		// Initialize twinkle data
		lastTwinkleTime[size][i] = 0;
		starTwinkleStatus[size][i] = Math.random() < twinklePercentage;
	  }
	}
  }

  function drawStar(ctx, star, sizeClass, time, animationData) {
	const { x, y, radius, color } = star;
	let { actualRadius, actualOpacity } = animationData;
	const twinkleParams = params.twinkle[sizeClass];
	const starIndex = stars[sizeClass].indexOf(star);
	
	if (starIndex === -1) {
	  return; // Skip if star not found (shouldn't happen, but safety check)
	}
	
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

	// Draw Glow if enabled (draw glow first, then starburst, then star core)
	if (params.glow[sizeClass].enabled) {
	  const glowColor = (sizeClass === 'large' || sizeClass === 'medium') ? star.baseColor : color;
	  drawGlow(ctx, star, actualRadius, glowColor, sizeClass);
	}

	// Draw Starburst if enabled
	if (params.starburst.allSizes.enabled && params.starburst[sizeClass].enabled) {
	  drawStarburst(ctx, star, sizeClass, time, animationData);
	}

	// Draw the star core
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
    // Calculate a single animation factor for all rays
    const uniquePhase = star.burstPhase;
    const combinedWave = (
      Math.sin(uniquePhase + time * 0.001 * animationSpeed) +
      Math.sin(uniquePhase * 1.3 + time * 0.001 * animationSpeed * 2.1) * 0.3 +
      Math.sin(uniquePhase * 0.7 + time * 0.001 * animationSpeed * 0.5) * 0.15 +
      1.45
    ) / 2.9;
    const rayFactor = params.starburst.allSizes.minRayFactor + combinedWave * (1 - params.starburst.allSizes.minRayFactor);
    
    // Apply the same factor to all rays
    for (let i = 0; i < rayCount; i++) {
      animFactors[i] = rayFactor;
    }
    }

    const angleStep = Math.PI * 2 / rayCount;
    const startAngle = params.starburst.allSizes.angle * Math.PI / 180;
    ctx.save();
    ctx.globalAlpha = params.starburst.allSizes.opacity;
    
    // Parse baseColor RGB
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);

    // Draw rays
    for (let i = 0; i < rayCount; i++) {
      const angle = startAngle + i * angleStep;
      const currentRayLength = rayLength * animFactors[i];
      const endX = x + Math.cos(angle) * currentRayLength;
      const endY = y + Math.sin(angle) * currentRayLength;
      const gradient = ctx.createLinearGradient(x, y, endX, endY);
      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
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
	const { x, y } = star;
	const sizeFactor = params.glow[sizeClass].sizeFactor;
	const glowOpacity = params.glow[sizeClass].opacity;
	const glowRadius = radius * sizeFactor;

	// Parse color efficiently
	const r = parseInt(glowColor.slice(1, 3), 16);
	const g = parseInt(glowColor.slice(3, 5), 16);
	const b = parseInt(glowColor.slice(5, 7), 16);

	const gradient = ctx.createRadialGradient(x, y, radius * 0.5, x, y, glowRadius);
	gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
	gradient.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${glowOpacity})`);
	gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${glowOpacity * 0.3})`);
	gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

	ctx.save();
	ctx.fillStyle = gradient;
	ctx.beginPath();
	ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
  }

  function applyBlur(ctx, sizeClass) {
	if (params.blur[sizeClass].enabled && params.blur[sizeClass].amount > 0) {
	  ctx.filter = `blur(${params.blur[sizeClass].amount}px)`;
	}
  }

  function resetFilters(ctx) {
	ctx.filter = 'none';
  }

  function drawStars(timestamp = 0) {
	const time = timestamp;
	const drawCtx = params.useOffScreenCanvas ? offScreenCtx : ctx;

	drawCtx.clearRect(0, 0, width, height);
	// Fill with black to disable transparency 
	//drawCtx.fillStyle = '#000000'; // disabled
	//drawCtx.fillRect(0, 0, width, height); // disabled

	for (const layer of starLayers) {
	  if (!params.starCounts[layer].enabled) continue;

	  applyBlur(drawCtx, layer);

	  for (let i = 0; i < stars[layer].length; i++) {
		const star = stars[layer][i];
		const animationData = starAnimationData[layer][i];
		if (star && animationData) {
		  drawStar(drawCtx, star, layer, time, animationData);
		}
	  }

	  resetFilters(drawCtx);
	}

	if (params.useOffScreenCanvas) {
	  ctx.clearRect(0, 0, width, height);
	  ctx.drawImage(offScreenCanvas, 0, 0);
	}
  }

  function animate(timestamp = 0) {
	// Calculate frame rate
	const currentFrameInterval = 1000 / params.globalFramerate;
	
	if (timestamp - lastFrameTime >= currentFrameInterval) {
	  drawStars(timestamp);
	  lastFrameTime = timestamp;
	}

	animationFrameId = requestAnimationFrame(animate);
  }

  // Handle visibility changes to pause animation when tab is not visible
  document.addEventListener("visibilitychange", function () {
	if (document.visibilityState === "visible") {
	  if (animationFrameId === null) {
		lastFrameTime = performance.now(); // Reset time to avoid jump
		animate();
	  }
	} else {
	  if (animationFrameId !== null) {
		cancelAnimationFrame(animationFrameId);
		animationFrameId = null;
	  }
	}
  }, {
	passive: true
  });
  
  // Clean up function to prevent memory leaks
  function cleanup() {
	if (animationFrameId !== null) {
	  cancelAnimationFrame(animationFrameId);
	  animationFrameId = null;
	}
	
	if (resizeTimeout) {
	  clearTimeout(resizeTimeout);
	  resizeTimeout = null;
	}
	
	window.removeEventListener('resize', handleResize);
	document.removeEventListener('visibilitychange', handleVisibilityChange);
	
	// Clear all arrays
	returnStarsToPool();
	for (const size of starLayers) {
	  starPools[size].length = 0;
	}
  }
  
  // Handle visibility changes (defined separately for proper removal)
  function handleVisibilityChange() {
	if (document.visibilityState === "visible") {
	  if (animationFrameId === null) {
		lastFrameTime = performance.now();
		animate();
	  }
	} else {
	  if (animationFrameId !== null) {
		cancelAnimationFrame(animationFrameId);
		animationFrameId = null;
	  }
	}
  }
  
  // Use the visibility change function
  document.addEventListener("visibilitychange", handleVisibilityChange, {
	passive: true
  });

  // Initialize the animation
  init();
  
  // Add unload handler for cleanup
  window.addEventListener('unload', cleanup);
});
