window.addEventListener("DOMContentLoaded", function () {
    // Configuration parameters
    const CONFIG = {
        numLargeStars: 90,
        numMediumStars: 340,
        numSmallStars: 2500,
        numTinyStars: 10000,
        // Brightness controls (0-100)
        brightness: {
            large: 60,
            medium: 40,
            small: 30,
            tiny: 15
        },
        starburst: {
            angle: 0, // Starburst angle in degrees
        },
		
        // Color distribution
        starColorDistribution: {
            // O-type stars (Blue-Violet)
            '#adb2ff': 1,
            // B-type stars (Blue)
			'#4f86f6': 1, '#5aadf2': 2,
            // A-type stars (Blue-White)
			'#91c2ff': 3, '#cef3ff': 10,
            // F-type stars (White)
			'#ffffff': 60, '#ffffe3': 10,
            // G-type stars (Yellow)
            '#fcfc8f': 1, '#fef3b9': 1, 
            // K-type stars (Orange)
            '#fb9964': 1, '#fdbaa2': 1,
            // M-type stars (Red)
			'#f37477': 1, '#f9bdcd': 1
        },
        // Extended colors for large stars
        extendedStarColorDistribution: {
			// O-type stars (Blue-Violet)
            '#7b96ff': 1, // Blue-violet
			// B-type stars (Blue)
            '#3480ff': 8, // Bright Blue
			// A-type stars (Blue-White)
            '#76cffa': 1, // Light Sky Blue
			// F-type stars (Yellow-White)
			'#ffffff': 5, // Pure white
            '#ffe687': 3, // Bright yellow
			// K-type stars (Orange)
            '#ffab1a': 1, // Deep orange
            '#ff7f10': 1, // Red-orange (Betelgeuse, Antares)
			// M-type stars (Red)
            '#ff5b5b': 3, // Light Red
			// Unique
            '#3ffab2': 1, // Medium Spring Green
            '#48D1CC': 1, // Medium Turquoise
            '#20B2AA': 1  // Light Sea Green
        },
        // Chromatic Aberration
        chromaticAberration: {
            enabled: true,
            opacity: 0.3, // Overall opacity of the effect
            // Parameters per star size
            large: {
                intensity: 0.15, // 0-1 range
                offsetRed: 2.0,
                offsetGreen: 0.0,
                offsetBlue: -2.0,
            },
            medium: {
                intensity: 0.10,
                offsetRed: 1.5,
                offsetGreen: 0.0,
                offsetBlue: -1.5,
            },
            small: {
                intensity: 0,
                offsetRed: 0,
                offsetGreen: 0,
                offsetBlue: 0,
            },
            tiny: {
                intensity: 0,
                offsetRed: 0,
                offsetGreen: 0,
                offsetBlue: 0,
            }
        }
    };

    // Setup canvas
    const mainCanvas = document.getElementById('starsCanvas');
    const ctx = mainCanvas.getContext('2d', { alpha: true });

    // Create offscreen canvas for static elements
    let staticCanvas, staticCtx;
    if (window.OffscreenCanvas) {
        staticCanvas = new OffscreenCanvas(1, 1);
        staticCtx = staticCanvas.getContext('2d', { alpha: true });
    } else {
        staticCanvas = document.createElement('canvas');
        staticCtx = staticCanvas.getContext('2d');
    }

    // Canvas dimensions
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;

    // Update canvas dimensions
    const updateCanvasDimensions = () => {
        mainCanvas.width = canvasWidth;
        mainCanvas.height = canvasHeight;
        if (staticCanvas.width !== canvasWidth || staticCanvas.height !== canvasHeight) {
            staticCanvas.width = canvasWidth;
            staticCanvas.height = canvasHeight;
        }
    };
    updateCanvasDimensions();

    // Color utilities
    const colorCache = new Map();
    const hexToRgb = (() => {
        const hexCache = new Map();
        return (hex) => {
            if (hexCache.has(hex)) return hexCache.get(hex);
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            const rgb = result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r: 255, g: 255, b: 255 };
            if (hexCache.size > 100) hexCache.clear();
            hexCache.set(hex, rgb);
            return rgb;
        };
    })();

    const rgbToHex = (() => {
        const componentToHex = (c) => {
            const hex = c.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return (r, g, b) => `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
    })();

    const shiftColorTowards = (color1, color2, amount) => {
        const cacheKey = `${color1}|${color2}|${amount.toFixed(3)}`;
        if (colorCache.has(cacheKey)) return colorCache.get(cacheKey);
        const rgb1 = hexToRgb(color1);
        const rgb2 = hexToRgb(color2);
        const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * amount);
        const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * amount);
        const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * amount);
        const result = rgbToHex(r, g, b);
        if (colorCache.size > 500) colorCache.clear();
        colorCache.set(cacheKey, result);
        return result;
    };

    // Calculate brightness
    const getBrightnessFactor = (value) => {
        return (value / 50) * 2.0;
    };

    // Process color distributions
    const createWeightedColorArray = (colorDistribution) => {
        const colors = [], weights = [];
        let totalWeight = 0;
        for (const [color, weight] of Object.entries(colorDistribution)) {
            if (weight <= 0) continue;
            colors.push(color);
            weights.push(weight);
            totalWeight += weight;
        }
        const probabilities = weights.map(w => w / totalWeight);
        const cumulativeProbabilities = [];
        let sum = 0;
        for (const p of probabilities) {
            sum += p;
            cumulativeProbabilities.push(sum);
        }
        return { colors, cumulativeProbabilities };
    };

    // Get weighted random color
    const getRandomWeightedColor = (colorData) => {
        const { colors, cumulativeProbabilities } = colorData;
        const rand = Math.random();
        let low = 0, high = cumulativeProbabilities.length - 1;
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (mid === 0 || (rand >= cumulativeProbabilities[mid - 1] && rand < cumulativeProbabilities[mid])) {
                return colors[mid];
            } else if (rand < cumulativeProbabilities[mid]) {
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        return colors[0];
    };

    // Pre-compute color distributions
    const starColors = createWeightedColorArray(CONFIG.starColorDistribution);
    const extendedStarColors = createWeightedColorArray({
        ...CONFIG.starColorDistribution,
        ...CONFIG.extendedStarColorDistribution
    });

    // Star class
    class Star {
        constructor(type = null) {
            this.x = Math.random() * canvasWidth;
            this.y = Math.random() * canvasHeight;
            if (type) {
                this.type = type;
            } else {
                const sizeRand = Math.random();
                if (sizeRand > 0.995) this.type = "large";
                else if (sizeRand > 0.97) this.type = "medium";
                else if (sizeRand > 0.6) this.type = "small";
                else this.type = "tiny";
            }
            this.initProperties();
        }

        initProperties() {
            switch (this.type) {
				case "large":
					this.size = 3 + Math.random() * 2; // Size range: 3 to 5
					this.hasStarburst = true;
					this.color = getRandomWeightedColor(extendedStarColors);
					this.twinkleAmount = 0.075 + Math.random() * 0.1;
					break;
				case "medium":
					// Size range: closer to large, with some overlap
					this.size = 1.6 + Math.random() * 1.4; // Size range: 1.6 to 3
					this.hasStarburst = Math.random() > 0.3;
					this.color = getRandomWeightedColor(starColors);
					this.twinkleAmount = 0.15 + Math.random() * 0.15;
					break;
				case "small":
					// Size range: between medium and tiny
					this.size = 0.8 + Math.random() * 0.8; // Size range: 0.8 to 1.6
					this.hasStarburst = Math.random() > 0.7;
					this.color = getRandomWeightedColor(starColors);
					this.twinkleAmount = 0.2 + Math.random() * 0.2;
					break;
				case "tiny":
				default:
					this.size = 0.3 + Math.random() * 0.4; // Size range: 0.3 to 0.7
					this.hasStarburst = false;
					this.color = getRandomWeightedColor(starColors);
					this.twinkleAmount = 0.25 + Math.random() * 0.25;
					this.staticOpacity = 0.3 + Math.random() * 0.2;
					break;
            }
            const brightnessFactor = getBrightnessFactor(CONFIG.brightness[this.type]);
            this.baseOpacity = (0.6 + Math.random() * 0.4) * brightnessFactor;
            this.baseOpacity = Math.min(this.baseOpacity, 1.0);
            this.opacity = this.baseOpacity;
            this.baseColor = this.color;
            this.twinkleSpeed = 0.15 + Math.random() * 1.25;
            this.twinkleOffset = Math.random() * Math.PI * 2;
            this.colorTwinkle = Math.random() > 0.7;
            this.twinkleColorAmount = 0.05 + Math.random() * 0.15;
            this.flickerProbability = 0.0005 + (this.type === "tiny" ? 0.0015 : 0);
            this.flickering = false;
            this.flickerDuration = 0;
            this.flickerTime = 0;
            this.useComplexTwinkle = Math.random() > 0.7;
            if (this.useComplexTwinkle) {
                this.secondaryTwinkleSpeed = this.twinkleSpeed * (0.3 + Math.random() * 0.7);
                this.secondaryTwinkleAmount = this.twinkleAmount * (0.3 + Math.random() * 0.5);
            }
            if (this.type === "tiny") {
                this.staticOpacity = Math.min(this.staticOpacity * brightnessFactor, 1.0);
            }

            // Chromatic Aberration properties
            this.caIntensity = CONFIG.chromaticAberration[this.type].intensity;
            this.caOffsetRed = CONFIG.chromaticAberration[this.type].offsetRed;
            this.caOffsetGreen = CONFIG.chromaticAberration[this.type].offsetGreen;
            this.caOffsetBlue = CONFIG.chromaticAberration[this.type].offsetBlue;
        }

        updateBrightness() {
            const brightnessFactor = getBrightnessFactor(CONFIG.brightness[this.type]);
            this.baseOpacity = (0.6 + Math.random() * 0.4) * brightnessFactor;
            this.baseOpacity = Math.min(this.baseOpacity, 1.0);
            if (this.type === "tiny") {
                this.staticOpacity = Math.min((0.3 + Math.random() * 0.2) * brightnessFactor, 1.0);
            }
        }

        update(time) {
            if (this.flickering) {
                this.flickerTime++;
                if (this.flickerTime >= this.flickerDuration) {
                    this.flickering = false;
                }
                const flickerPhase = this.flickerTime / this.flickerDuration;
                const flickerPattern = Math.sin(flickerPhase * Math.PI * 8) * 0.5 + 0.5;
                this.opacity = this.baseOpacity * (1 + flickerPattern * 0.5);
                return;
            } else if (Math.random() < this.flickerProbability) {
                this.flickering = true;
                this.flickerDuration = 5 + Math.floor(Math.random() * 15);
                this.flickerTime = 0;
                return;
            }
            let twinkleFactor;
            if (this.useComplexTwinkle) {
                const primaryWave = Math.sin(time * this.twinkleSpeed + this.twinkleOffset);
                const secondaryWave = Math.sin(time * this.secondaryTwinkleSpeed + this.twinkleOffset * 1.5);
                twinkleFactor = (primaryWave * 0.7 + secondaryWave * 0.3);
            } else {
                twinkleFactor = Math.sin(time * this.twinkleSpeed + this.twinkleOffset);
            }
            const opacityMultiplier = 1 + (twinkleFactor * this.twinkleAmount);
            this.opacity = this.baseOpacity * opacityMultiplier;
            if (this.colorTwinkle && (this.type === "large" || this.type === "medium")) {
                const colorShiftAmount = twinkleFactor * this.twinkleColorAmount;
                if (colorShiftAmount > 0) {
                    this.color = shiftColorTowards(this.baseColor, '#FFFFFF', Math.abs(colorShiftAmount));
                } else {
                    this.color = shiftColorTowards(this.baseColor, '#FFE4B5', Math.abs(colorShiftAmount));
                }
            }
        }
    }

    // Star collections organized by layer
    const starsByLayer = {
        tiny: [],
        small: [],
        medium: [],
        large: []
    };
    const starsList = [];

    // Drawing functions
    const drawStarburst = (() => {
        const angles = new Float32Array(4);
        const cosValues = new Float32Array(4);
        const sinValues = new Float32Array(4);
        const angleInRadians = CONFIG.starburst.angle * Math.PI / 180;
        for (let i = 0; i < 4; i++) {
            angles[i] = (i * Math.PI / 2) + angleInRadians;
            cosValues[i] = Math.cos(angles[i]);
            sinValues[i] = Math.sin(angles[i]);
        }
        return (ctx, star, opacity) => {
            const rayLength = star.size * (6 + Math.random() * 2);
            const lineWidth = star.size * 0.2;
            const rayOpacity = opacity * 0.9;
            for (let i = 0; i < 4; i++) {
                const endX = star.x + cosValues[i] * rayLength;
                const endY = star.y + sinValues[i] * rayLength;
                const rayGradient = ctx.createLinearGradient(star.x, star.y, endX, endY);
                rayGradient.addColorStop(0, star.color);
                rayGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.globalAlpha = rayOpacity;
                ctx.strokeStyle = rayGradient;
                ctx.lineWidth = lineWidth;
                ctx.beginPath();
                ctx.moveTo(star.x, star.y);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            }
        };
    })();

    // Draw star with Chromatic Aberration
    const drawStar = (ctx, star) => {
        ctx.globalAlpha = star.opacity;
        const aberrationEnabled = CONFIG.chromaticAberration.enabled && star.caIntensity > 0;
        const caOpacity = CONFIG.chromaticAberration.opacity;

        if (star.type === "large" || star.type === "medium") {
            // Draw starburst
            if (star.hasStarburst) drawStarburst(ctx, star, star.opacity);

            // Draw glow
            const glowRadius = star.size * 2.8;
            const gradient = ctx.createRadialGradient(
                star.x, star.y, 0,
                star.x, star.y, glowRadius
            );
			gradient.addColorStop(0, `rgba(255, 255, 255, 1)`); // White
			gradient.addColorStop(0.2, `rgba(255, 255, 255, 0.9)`); // White
			gradient.addColorStop(0.5, `rgba(${hexToRgb(star.color).r}, ${hexToRgb(star.color).g}, ${hexToRgb(star.color).b}, 0.35)`);
			gradient.addColorStop(1, `rgba(${hexToRgb(star.color).r}, ${hexToRgb(star.color).g}, ${hexToRgb(star.color).b}, 0)`);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
            ctx.fill();

            // Draw core with Chromatic Aberration
            const coreSize = star.size * 0.7;
            if (aberrationEnabled) {
                const intensity = star.caIntensity;

                // Red channel
                ctx.fillStyle = `rgba(255, 0, 0, ${star.opacity * (1 - intensity) * caOpacity})`;
                ctx.beginPath();
                ctx.arc(star.x + star.caOffsetRed, star.y, coreSize, 0, Math.PI * 2);
                ctx.fill();

                // Green channel
                ctx.fillStyle = `rgba(0, 255, 0, ${star.opacity * (1 - intensity) * caOpacity})`;
                ctx.beginPath();
                ctx.arc(star.x + star.caOffsetGreen, star.y, coreSize, 0, Math.PI * 2);
                ctx.fill();

                // Blue channel
                ctx.fillStyle = `rgba(0, 0, 255, ${star.opacity * (1 - intensity) * caOpacity})`;
                ctx.beginPath();
                ctx.arc(star.x + star.caOffsetBlue, star.y, coreSize, 0, Math.PI * 2);
                ctx.fill();

                // White core - drawn on top to prevent color tint
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(star.x, star.y, coreSize * 0.8, 0, Math.PI * 2);
                ctx.fill();

            } else {
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(star.x, star.y, coreSize, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            // Draw small/tiny star
            if (aberrationEnabled) {
                const intensity = star.caIntensity;
                // Red channel
                ctx.fillStyle = `rgba(255, 0, 0, ${star.opacity * (1 - intensity) * caOpacity})`;
                ctx.beginPath();
                ctx.arc(star.x + star.caOffsetRed, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();

                // Green channel
                ctx.fillStyle = `rgba(0, 255, 0, ${star.opacity * (1 - intensity) * caOpacity})`;
                ctx.beginPath();
                ctx.arc(star.x + star.caOffsetGreen, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();

                // Blue channel
                ctx.fillStyle = `rgba(0, 0, 255, ${star.opacity * (1 - intensity) * caOpacity})`;
                ctx.beginPath();
                ctx.arc(star.x + star.caOffsetBlue, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = star.color;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    };

    // Animation management
    let lastFrameTime = 0;
    let slowFrameCount = 0;
    let adaptiveRendering = false;
    const minFrameInterval = 1000 / 30;
    let frameSkipCounter = 0;
    const skipFrameThreshold = 3;
    let animationFrameId;

    // Animation frame
    const animateFrame = (timestamp) => {
        const time = timestamp * 0.001;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Draw stars in layer order
        for (let i = 0; i < starsByLayer.tiny.length; i++) {
            const star = starsByLayer.tiny[i];
            star.update(time);
            drawStar(ctx, star);
        }
        for (let i = 0; i < starsByLayer.small.length; i++) {
            const star = starsByLayer.small[i];
            star.update(time);
            drawStar(ctx, star);
        }
        for (let i = 0; i < starsByLayer.medium.length; i++) {
            const star = starsByLayer.medium[i];
            star.update(time);
            drawStar(ctx, star);
        }
        for (let i = 0; i < starsByLayer.large.length; i++) {
            const star = starsByLayer.large[i];
            star.update(time);
            drawStar(ctx, star);
        }

        ctx.globalAlpha = 1.0;
        frameSkipCounter = (frameSkipCounter + 1) % skipFrameThreshold;
    };

    const animate = (timestamp) => {
        if (document.hidden) {
            animationFrameId = requestAnimationFrame(animate);
            return;
        }

        const frameInterval = timestamp - lastFrameTime;
        const frameTime = performance.now();

        if (frameInterval >= minFrameInterval) {
            animateFrame(timestamp);
            lastFrameTime = timestamp;

            const renderTime = performance.now() - frameTime;
            if (renderTime > 16) {
                slowFrameCount = Math.min(10, slowFrameCount + 1);
                if (slowFrameCount >= 5 && !adaptiveRendering) {
                    adaptiveRendering = true;
                }
            } else {
                slowFrameCount = Math.max(0, slowFrameCount - 1);
                if (slowFrameCount === 0 && adaptiveRendering) {
                    adaptiveRendering = false;
                }
            }
        }
        animationFrameId = requestAnimationFrame(animate);
    };

    // Star creation
    const createStars = () => {
        starsList.length = 0;
        starsByLayer.tiny.length = 0;
        starsByLayer.small.length = 0;
        starsByLayer.medium.length = 0;
        starsByLayer.large.length = 0;

        const baseArea = 1920 * 1200;
        const currentArea = canvasWidth * canvasHeight;
        const scaleFactor = Math.sqrt(currentArea / baseArea);

        const largeStarCount = Math.round(CONFIG.numLargeStars * scaleFactor);
        const mediumStarCount = Math.round(CONFIG.numMediumStars * scaleFactor);
        const smallStarCount = Math.round(CONFIG.numSmallStars * scaleFactor);
        const tinyStarCount = Math.round(CONFIG.numTinyStars * scaleFactor);

        const createStarBatch = (count, type) => {
            const batch = [];
            for (let i = 0; i < count; i++) {
                const star = new Star(type);
                batch.push(star);
                starsList.push(star);
                starsByLayer[type].push(star);
            }
            return batch;
        };

        createStarBatch(tinyStarCount, "tiny");
        createStarBatch(smallStarCount, "small");
        createStarBatch(mediumStarCount, "medium");
        createStarBatch(largeStarCount, "large");
    };

    // Update brightness of all stars
    const updateStarBrightness = () => {
        for (let i = 0; i < starsList.length; i++) {
            starsList[i].updateBrightness();
        }
    };

    // Resize handler with debouncing
    const handleResize = (() => {
        let resizeTimeout;
        let lastWidth = window.innerWidth;
        let lastHeight= window.innerHeight;
        return () => {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;
            if (newWidth !== lastWidth || newHeight !== lastHeight) {
                lastWidth = canvasWidth = newWidth;
                lastHeight = canvasHeight = newHeight;
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    updateCanvasDimensions();
                    createStars();
                }, 200);
            }
        };
    })();

    window.addEventListener('resize', handleResize, { passive: true });

    // Mobile device optimization
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        CONFIG.numLargeStars = Math.floor(CONFIG.numLargeStars * 0.7);
        CONFIG.numMediumStars = Math.floor(CONFIG.numMediumStars * 0.6);
        CONFIG.numSmallStars = Math.floor(CONFIG.numSmallStars * 0.5);
        CONFIG.numTinyStars = Math.floor(CONFIG.numTinyStars * 0.4);
        adaptiveRendering = true;
    }

    // Expose API for external configuration
    window.starfieldConfig = CONFIG;
    window.updateStarfield = function (newConfig) {
        const brightnessChanged = newConfig.brightness &&
            (newConfig.brightness.large !== CONFIG.brightness.large ||
                newConfig.brightness.medium !== CONFIG.brightness.medium ||
                newConfig.brightness.small !== CONFIG.brightness.small ||
                newConfig.brightness.tiny !== CONFIG.brightness.tiny);
        for (const key in newConfig) {
            if (typeof newConfig[key] === 'object' && newConfig[key] !== null &&
                CONFIG.hasOwnProperty(key) && typeof CONFIG[key] === 'object') {
                Object.assign(CONFIG[key], newConfig[key]);
            } else {
                CONFIG[key] = newConfig[key];
            }
        }
        if (brightnessChanged && Object.keys(newConfig).length === 1) {
            updateStarBrightness();
        } else {
            createStars();
        }
    };

    window.setAllStarBrightness = function (value) {
        value = Math.max(0, Math.min(100, value));
        CONFIG.brightness.large = value;
        CONFIG.brightness.medium = value;
        CONFIG.brightness.small = value;
        CONFIG.brightness.tiny = value;
        updateStarBrightness();
    };

    window.setStarBrightness = function (type, value) {
        value = Math.max(0, Math.min(100, value));
        if (CONFIG.brightness.hasOwnProperty(type)) {
            CONFIG.brightness[type] = value;
            updateStarBrightness();
        }
    };

    // Initialize
    createStars();
    requestAnimationFrame(animate);
});
