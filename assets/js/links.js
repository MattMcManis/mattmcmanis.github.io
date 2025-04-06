window.addEventListener("DOMContentLoaded", function () {
	// Get the canvas element
	const canvas = document.getElementById('cursorCanvas');
	
	// Example canvas drawing
	const ctx = canvas.getContext('2d');

	// Get the links
	const links = document.querySelectorAll('a');
	
	// Function to check if a click is within any link's bounds
	function isClickInsideLink(event) {
		const mouseX = event.clientX;
		const mouseY = event.clientY;
		
		for (let link of links) {
			const rect = link.getBoundingClientRect();
			
			if (
				mouseX >= rect.left &&
				mouseX <= rect.right &&
				mouseY >= rect.top &&
				mouseY <= rect.bottom
			) {
				link.click(); // Trigger the link click
				return true; // Stop checking after the first match
			}
		}
		return false;
	}

	// Update the cursor when hovering over links
	function updateCursor(event) {
		const mouseX = event.clientX;
		const mouseY = event.clientY;
		let isOverLink = false;

		for (let link of links) {
			const rect = link.getBoundingClientRect();
			
			if (
				mouseX >= rect.left &&
				mouseX <= rect.right &&
				mouseY >= rect.top &&
				mouseY <= rect.bottom
			) {
				isOverLink = true;
				break;
			}
		}

		if (isOverLink) {
			// If over a link, change cursor to hand (pointer)
			canvas.style.cursor = 'pointer';
		} else {
			// Otherwise, reset to default cursor
			canvas.style.cursor = 'default';
		}
	}

	// Add click event listener to the canvas
	canvas.addEventListener('click', function(event) {
		if (isClickInsideLink(event)) {
			event.preventDefault(); // Prevent default canvas click behavior
		}
	});

	// Add mousemove event listener to update cursor
	canvas.addEventListener('mousemove', updateCursor);
});
