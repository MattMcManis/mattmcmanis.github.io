/*
 * Copyright © 2025 Matt McManis
 */
window.addEventListener("DOMContentLoaded", function () {
	const canvas = document.getElementById('galaxiesCanvas');
	const ctx = canvas.getContext('2d');

	const baseWidth = 1920;
	const baseHeight = 1080;

	// Galaxy Size
	const baseGalaxySize = 500;
	const galaxyMinSize = 0.02;
	const galaxyMaxSize = 0.08;

	const chromaticAberration = {
		enabled: true,
		opacity: 0.15,
		offsetRed: 2.0,
		offsetGreen: 0.0,
		offsetBlue: -2.0
	};

	const galaxyOTypeColors = ['#957ff7', '#adb2ff'];
	const galaxyBTypeColors = ['#4f86f6', '#5aadf2'];
	const galaxyATypeColors = ['#91c2ff', '#cef3ff'];
	const galaxyFTypeColors = ['#ffffff', '#ffffe3'];
	const galaxyGTypeColors = ['#fefea7', '#fef3b9'];
	const galaxyKTypeColors = ['#fb9964', '#fdbaa2'];
	const galaxyMTypeColors = ['#f37477', '#f9bdcd'];

	const galaxyColors = [].concat(
		galaxyOTypeColors, galaxyBTypeColors, galaxyATypeColors,
		galaxyFTypeColors, galaxyGTypeColors, galaxyKTypeColors,
		galaxyMTypeColors
	);

	// Galaxies Array
	const galaxies = [];

	// Calculates the number of galaxies to display based on window size.
	function getGalaxyCount() {
		const width = window.innerWidth;
		const height = window.innerHeight;
		const isMobile = width < 768;
		let count;

		switch (true) {
			// Desktop
			case (!isMobile && height >= 7680): count = 28; break;
			case (!isMobile && height >= 2880): count = 20; break;
			case (!isMobile && height >= 2160): count = 16; break;
			case (!isMobile && height >= 1600): count = 12; break;
			case (!isMobile && height >= 1440): count = 10; break;
			case (!isMobile && height >= 1080): count = 8; break;
			case (!isMobile && height >= 900): count = 7; break;
			case (!isMobile && height >= 720): count = 6; break;
			case (!isMobile && height >= 480): count = 4; break;
			case (!isMobile && height >= 360): count = 3; break;
			// Mobile
			case (isMobile && height >= 7680): count = 14; break;
			case (isMobile && height >= 2880): count = 10; break;
			case (isMobile && height >= 2160): count = 8; break;
			case (isMobile && height >= 1600): count = 6; break;
			case (isMobile && height >= 1440): count = 5; break;
			case (isMobile && height >= 1080): count = 5; break; 
			case (isMobile && height >= 900): count = 4; break;
			case (isMobile && height >= 720): count = 4; break;
			case (isMobile && height >= 480): count = 3; break;
			case (isMobile && height >= 360): count = 2; break;
			case (isMobile): count = 2; break;
		}

		return count;
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

		// Draws the galaxy on the canvas
		draw(ctx, scaleX, scaleY) {
			const {
				centerX,
				centerY,
				sizeFactor,
				numArms,
				viewAngleX,
				viewAngleY,
				galaxyColor,
				typeData
			} = this;
			const {
				baseNumPoints,
				tightness,
				startRadius,
				endRadius,
				armWidth,
				interArmDensity,
				coreDensity,
				coreRadius
			} = typeData;

			const scaledCenterX = centerX * scaleX;
			const scaledCenterY = centerY * scaleY;
			const sizeRatio = sizeFactor / galaxyMaxSize;
			const numPoints = Math.floor(baseNumPoints * sizeRatio);
			const cosX = Math.cos(viewAngleX);
			const sinX = Math.sin(viewAngleX);
			const cosY = Math.cos(viewAngleY);
			const sinY = Math.sin(viewAngleY);
			const specialColors = ['#FFFFFF', '#C8C8FF', '#FFF0C8'];

			for (let i = 0; i < numPoints; i++) {
				const t = i / (numPoints - 1);
				const radius = startRadius + t * (endRadius - startRadius);
				const armJitter = armWidth * radius;

				for (let arm = 0; arm < numArms; arm++) {
					const angleOffset = (arm / numArms) * 2 * Math.PI;
					const angle = t * 10 * Math.PI * tightness + angleOffset;
					const jitterX = (Math.random() - 0.5) * armJitter;
					const jitterY = (Math.random() - 0.5) * armJitter;
					let x = scaledCenterX + radius * Math.cos(angle) + jitterX;
					let y = scaledCenterY + radius * Math.sin(angle) + jitterY;
					let z = 0;
					let rotatedX = (x - scaledCenterX) * cosX - z * sinX + scaledCenterX;
					let rotatedZ = (x - scaledCenterX) * sinX + z * cosX;
					x = rotatedX;
					z = rotatedZ;
					let rotatedY = (y - scaledCenterY) * cosY - z * sinY + scaledCenterY;
					z = (y - scaledCenterY) * sinY + z * cosY;
					y = rotatedY;
					const size = (Math.random() * 0.525 + 0.1) * sizeFactor;
					let finalColor = getRandomShade(galaxyColor, radius, coreRadius, endRadius);
					if (Math.random() < 0.008)
						finalColor = specialColors[Math.floor(Math.random() * specialColors.length)];
					const edgeFactor = Math.abs(jitterX) / armJitter;
					const opacity = Math.max(0.1, 1 - edgeFactor * 1.5);
					drawStar(ctx, x, y, size, finalColor, opacity);
				}
			}

			const numInterArmStars = Math.floor(numPoints * interArmDensity);
			for (let i = 0; i < numInterArmStars; i++) {
				const radius = startRadius + Math.random() * (endRadius - startRadius);
				const angle = Math.random() * 2 * Math.PI;
				let x = scaledCenterX + radius * Math.cos(angle);
				let y = scaledCenterY + radius * Math.sin(angle);
				let z = 0;
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

			const numCoreStars = Math.floor(240 * coreDensity);
			for (let i = 0; i < numCoreStars; i++) {
				const radius = Math.random() * coreRadius;
				const angle = Math.random() * 2 * Math.PI;
				let x = scaledCenterX + radius * Math.cos(angle);
				let y = scaledCenterY + radius * Math.sin(angle);
				let z = 0;
				let rotatedX = (x - scaledCenterX) * cosX - z * sinX + scaledCenterX;
				let rotatedZ = (x - scaledCenterX) * sinX + z * cosX;
				x = rotatedX;
				z = rotatedZ;
				let rotatedY = (y - scaledCenterY) * cosY - z * sinY + scaledCenterY;
				z = (y - scaledCenterY) * sinY + z * cosY;
				y = rotatedY;
				const size = (Math.random() * 0.6 + 0.15) * (1 - radius / coreRadius) * sizeFactor;
				let color = radius < coreRadius * 0.7 ? '#FFFFFF' :
					`#${(255 - Math.floor((radius - coreRadius * 0.7) / (coreRadius * 0.3) * (255 - parseInt(galaxyColor.slice(1, 3), 16)) * 0.2)).toString(16).padStart(2, '0')}${
						(255 - Math.floor((radius - coreRadius * 0.7) / (coreRadius * 0.3) * (255 - parseInt(galaxyColor.slice(3, 5), 16)) * 0.2)).toString(16).padStart(2, '0')}${
						(255 - Math.floor((radius - coreRadius * 0.7) / (coreRadius * 0.3) * (255 - parseInt(galaxyColor.slice(5, 7), 16)) * 0.2)).toString(16).padStart(2, '0')}`;
				const opacity = Math.random() * 0.4 + 0.6;
				drawStar(ctx, x, y, size, color, opacity);
			}
		}
	}

	class SpiralGalaxy extends Galaxy {
		constructor(centerX, centerY, sizeFactor, numArms, viewAngleX, viewAngleY, galaxyColor) {
			super(centerX, centerY, sizeFactor, numArms, viewAngleX, viewAngleY, galaxyColor, {
				baseNumPoints: 325,
				tightness: 0.25,
				startRadius: 5 * sizeFactor,
				endRadius: baseGalaxySize * sizeFactor,
				armWidth: 2.9 * sizeFactor,
				interArmDensity: 2 * sizeFactor,
				coreDensity: 20 * sizeFactor,
				coreRadius: 100 * sizeFactor
			});
		}
	}

	class SpiralAlternateGalaxy extends Galaxy {
		constructor(centerX, centerY, sizeFactor, numArms, viewAngleX, viewAngleY, galaxyColor) {
			super(centerX, centerY, sizeFactor, numArms, viewAngleX, viewAngleY, galaxyColor, {
				baseNumPoints: 275,
				tightness: 0.32,
				startRadius: 5 * sizeFactor,
				endRadius: baseGalaxySize * sizeFactor,
				armWidth: 2.2 * sizeFactor,
				interArmDensity: 2.5 * sizeFactor,
				coreDensity: 20 * sizeFactor,
				coreRadius: 80 * sizeFactor
			});
		}
	}

	class EllipticalGalaxy extends Galaxy {
		constructor(centerX, centerY, sizeFactor, numArms, viewAngleX, viewAngleY, galaxyColor) {
			super(centerX, centerY, sizeFactor, numArms, viewAngleX, viewAngleY, galaxyColor, {
				baseNumPoints: 200,
				tightness: 0.7,
				startRadius: 1 * sizeFactor,
				endRadius: baseGalaxySize * sizeFactor,
				armWidth: 5 * sizeFactor,
				interArmDensity: 2.5 * sizeFactor,
				coreDensity: 1 * sizeFactor,
				coreRadius: 50 * sizeFactor
			});
		}
	}

	class IrregularGalaxy extends Galaxy {
		constructor(centerX, centerY, sizeFactor, numArms, viewAngleX, viewAngleY, galaxyColor) {
			super(centerX, centerY, sizeFactor, numArms, viewAngleX, viewAngleY, galaxyColor, {
				baseNumPoints: 150,
				tightness: 1,
				startRadius: 5 * sizeFactor,
				endRadius: baseGalaxySize * sizeFactor,
				armWidth: 0 * sizeFactor,
				interArmDensity: 1.2 * sizeFactor,
				coreDensity: 0 * sizeFactor,
				coreRadius: 0 * sizeFactor
			});
		}
	}

	class RingGalaxy extends Galaxy {
		constructor(centerX, centerY, sizeFactor, numArms, viewAngleX, viewAngleY, galaxyColor) {
			super(centerX, centerY, sizeFactor, numArms, viewAngleX, viewAngleY, galaxyColor, {
				baseNumPoints: 200,
				tightness: 0.5,
				startRadius: 350 * sizeFactor,
				endRadius: baseGalaxySize * sizeFactor,
				armWidth: 5 * sizeFactor,
				interArmDensity: 1 * sizeFactor,
				coreDensity: 20 * sizeFactor,
				coreRadius: 50 * sizeFactor
			});
		}
	}

	// Initializes the galaxies array with Galaxy objects
	function initializeGalaxies() {
		const galaxyCount = getGalaxyCount();
		galaxies.length = 0;
		const gridCols = 5;
		const gridRows = 5;
		const cellWidth = baseWidth / gridCols;
		const cellHeight = baseHeight / gridRows;
		const gridPositions = [];
		let index = 0;
		for (let row = 0; row < gridRows; row++)
			for (let col = 0; col < gridCols; col++)
				gridPositions[index++] = { row, col };
		for (let i = gridPositions.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[gridPositions[i], gridPositions[j]] = [gridPositions[j], gridPositions[i]];
		}
		const selectedPositions = gridPositions.slice(0, galaxyCount);
		const galaxyTypeColors = [
			{ type: SpiralGalaxy, colors: [...galaxyBTypeColors, ...galaxyATypeColors] },
			{ type: SpiralAlternateGalaxy, colors: [...galaxyOTypeColors, ...galaxyBTypeColors, ...galaxyATypeColors] },
			{ type: EllipticalGalaxy, colors: [...galaxyGTypeColors, ...galaxyKTypeColors, ...galaxyMTypeColors] },
			{ type: IrregularGalaxy, colors: galaxyColors },
			{ type: RingGalaxy, colors: [...galaxyOTypeColors, ...galaxyBTypeColors] }
		];
		const randomValues = Array(galaxyCount).fill(0).map(() => Math.random());

		for (let i = 0; i < galaxyCount; i++) {
			const { row, col } = selectedPositions[i];
			const jitterX = (Math.random() * 0.6 + 0.2) * cellWidth;
			const jitterY = (Math.random() * 0.6 + 0.2) * cellHeight;
			const centerX = col * cellWidth + jitterX;
			const centerY = row * cellHeight + jitterY;
			const sizeFactor = galaxyMinSize + Math.random() * (galaxyMaxSize - galaxyMinSize);
			const numArms = Math.floor(Math.random() * 2) + 2;
			const viewAngleX = Math.random() * Math.PI * 2;
			const viewAngleY = Math.random() * Math.PI - Math.PI / 2;
			const rand = randomValues[i];
			const { type: galaxyType, colors: colorArray } =
				rand < 0.6 ? galaxyTypeColors[0] :
				rand < 0.8 ? galaxyTypeColors[1] :
				rand < 0.9 ? galaxyTypeColors[2] :
				rand < 0.98 ? galaxyTypeColors[3] :
				galaxyTypeColors[4];
			const galaxyColor = colorArray[Math.floor(Math.random() * colorArray.length)];
			galaxies.push(new galaxyType(centerX, centerY, sizeFactor, numArms, viewAngleX, viewAngleY, galaxyColor));
		}
	}

	// Draws a single star on the canvas
	function drawStar(ctx, x, y, size, color, opacity) {
		ctx.beginPath();
		ctx.arc(x, y, size, 0, 2 * Math.PI);
		ctx.fillStyle = color;
		ctx.globalAlpha = opacity;
		ctx.fill();
		ctx.globalAlpha = 1;
	}

	// Converts a hex color string to RGB
	function hexToRgb(hex) {
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		return [r, g, b];
	}

	// Converts RGB values to a hex color string
	function rgbToHex(r, g, b) {
		return `#${(r < 16 ? '0' : '') + r.toString(16)}${(g < 16 ? '0' : '') + g.toString(16)}${(b < 16 ? '0' : '') + b.toString(16)}`;
	}

	// Gets a random shade of a base color based on distance from the galaxy core
	function getRandomShade(baseHexColor, radius, coreRadius, endRadius) {
		const [rBase, gBase, bBase] = hexToRgb(baseHexColor);
		if (radius < coreRadius * 0.7)
			return '#FFFFFF';
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
		const randomFactor = 1 - 0.25 + Math.random() * 0.5;
		r = Math.floor(rBase * brightnessFactor * randomFactor);
		g = Math.floor(gBase * brightnessFactor * randomFactor);
		b = Math.floor(bBase * brightnessFactor * randomFactor);
		return rgbToHex(Math.min(255, Math.max(0, r)), Math.min(255, Math.max(0, g)), Math.min(255, Math.max(0, b)));
	}

	// Resizes the canvas and redraws galaxies
	function resizeCanvas() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		initializeGalaxies();
		drawGalaxies();
		const isMobile = window.innerWidth < 768;
		if (chromaticAberration.enabled && !isMobile)
			applyChromaticAberration();
		auraEffect(); // First Aura Effect
		if (!isMobile)
			auraEffect(); // Second Aura Effect if Desktop only
		blurCanvasContent();
	}

	// Applies chromatic aberration effect
	function applyChromaticAberration() {
		const tempCanvas = document.createElement('canvas');
		tempCanvas.width = canvas.width;
		tempCanvas.height = canvas.height;
		const tempCtx = tempCanvas.getContext('2d');
		tempCtx.drawImage(canvas, 0, 0);
		const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
		const data = imageData.data;
		const outputCanvas = document.createElement('canvas');
		outputCanvas.width = canvas.width;
		outputCanvas.height = canvas.height;
		const outputCtx = outputCanvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		const redData = new Uint8ClampedArray(data.length);
		const greenData = new Uint8ClampedArray(data.length);
		const blueData = new Uint8ClampedArray(data.length);
		for (let i = 0; i < data.length; i += 4) {
			redData[i] = data[i];
			redData[i + 3] = data[i + 3];
			greenData[i + 1] = data[i + 1];
			greenData[i + 3] = data[i + 3];
			blueData[i + 2] = data[i + 2];
			blueData[i + 3] = data[i + 3];
		}
		const redImageData = new ImageData(redData, canvas.width, canvas.height);
		outputCtx.putImageData(redImageData, 0, 0);
		ctx.globalCompositeOperation = 'screen';
		ctx.globalAlpha = chromaticAberration.opacity;
		ctx.drawImage(outputCanvas, chromaticAberration.offsetRed, 0);
		const greenImageData = new ImageData(greenData, canvas.width, canvas.height);
		outputCtx.putImageData(greenImageData, 0, 0);
		ctx.drawImage(outputCanvas, chromaticAberration.offsetGreen, 0);
		const blueImageData = new ImageData(blueData, canvas.width, canvas.height);
		outputCtx.putImageData(blueImageData, 0, 0);
		ctx.drawImage(outputCanvas, chromaticAberration.offsetBlue, 0);
		ctx.globalCompositeOperation = 'source-over';
		ctx.globalAlpha = 1.0;
		ctx.drawImage(tempCanvas, 0, 0);
	}

	// Applies an aura effect to the galaxies
	function auraEffect() {
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
		const scaleX = canvas.width / baseWidth;
		const scaleY = canvas.height / baseHeight;
		for (const galaxy of galaxies)
			galaxy.draw(ctx, scaleX, scaleY);
	}

	// Applies a blur effect to the entire canvas
	function blurCanvasContent() {
		const width = canvas.width;
		const height= canvas.height;
		const imageData = ctx.getImageData(0, 0, width, height);
		const data = imageData.data;
		const blurredData = applySeparableGaussianBlur(data, width, height, 2);
		imageData.data.set(blurredData);
		ctx.putImageData(imageData, 0, 0);
	}

	// Applies separable Gaussian blur to the image data
	function applySeparableGaussianBlur(data, width, height, radius) {
		const kernel = createGaussianKernel(radius);
		const kernelLength = radius * 2 + 1;
		const horizontalBlurred = new Uint8ClampedArray(data);
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				let r = 0,
					g = 0,
					b = 0,
					a = 0;
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
		const finalBlurred = new Uint8ClampedArray(data);
		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				let r = 0,
					g = 0,
					b = 0,
					a = 0;
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

	// Creates a Gaussian kernel for the blur effect
	function createGaussianKernel(radius) {
		const size = radius * 2 + 1;
		const sigma = radius / 3;
		const kernel = new Array(size);
		let sum = 0;
		for (let i = -radius; i <= radius; i++) {
			const value = Math.exp(-(i * i) / (2 * sigma * sigma));
			kernel[i + radius] = value;
			sum += value;
		}
		for (let i = 0; i < size; i++)
			kernel[i] /= sum;
		return kernel;
	}

	// Draws all galaxies on the canvas
	function drawGalaxies() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		const scaleX = canvas.width / baseWidth;
		const scaleY = canvas.height / baseHeight; 
		for (let i = 0; i < galaxies.length; i++)
			galaxies[i].draw(ctx, scaleX, scaleY);
	}

	// Initializes the canvas and galaxies
	function initialize() {
		resizeCanvas();
	}

	initialize();
	window.addEventListener('resize', resizeCanvas);
});
