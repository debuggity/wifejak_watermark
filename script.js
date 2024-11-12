// Get references to HTML elements
const imageLoader = document.getElementById('imageLoader');
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');
const scaleSlider = document.getElementById('scaleSlider');
const rotationSlider = document.getElementById('rotationSlider');
const downloadBtn = document.getElementById('downloadBtn');
const watermarkOptions = document.querySelectorAll('.watermark-options img');

// Initial watermark image setup
let uploadedImage = new Image();
let watermarkImage = new Image();
watermarkImage.src = 'wifejak_ticker.png';  // Default watermark

// Variables for position, scale, rotation, and dragging
let baseScale = 1; // Base scale multiplier
let scale = 1; // Current scale multiplier
let rotation = 0; // Current rotation in degrees
let watermarkX = 0; // Watermark X position
let watermarkY = 0; // Watermark Y position
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

// Event Listeners
imageLoader.addEventListener('change', handleImageUpload, false);
scaleSlider.addEventListener('input', updateScale, false);
rotationSlider.addEventListener('input', updateRotation, false);
downloadBtn.addEventListener('click', downloadImage, false);

watermarkOptions.forEach(function(img) {
    img.addEventListener('click', selectWatermark, false);
});

// Canvas event listeners for dragging functionality
canvas.addEventListener('mousedown', handleMouseDown, false);
canvas.addEventListener('mousemove', handleMouseMove, false);
canvas.addEventListener('mouseup', handleMouseUp, false);
canvas.addEventListener('mouseout', handleMouseUp, false);

// Add touch event listeners for mobile support
canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchmove', handleTouchMove, false);
canvas.addEventListener('touchend', handleTouchEnd, false);

// Convert touch events to mouse-like events
function handleTouchStart(e) {
    if (!uploadedImage.src) return;
    e.preventDefault();
    const touch = e.touches[0];
    const mousePos = getMousePos(canvas, touch);
    const wmWidth = watermarkImage.width * baseScale * scale;
    const wmHeight = watermarkImage.height * baseScale * scale;

    ctx.save();
    ctx.translate(watermarkX, watermarkY);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.beginPath();
    ctx.rect(-wmWidth / 2, -wmHeight / 2, wmWidth, wmHeight);
    ctx.restore();

    if (ctx.isPointInPath(mousePos.x, mousePos.y)) {
        isDragging = true;
        offsetX = mousePos.x - watermarkX;
        offsetY = mousePos.y - watermarkY;
    }
}

function handleTouchMove(e) {
    if (isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        const mousePos = getMousePos(canvas, touch);
        watermarkX = mousePos.x - offsetX;
        watermarkY = mousePos.y - offsetY;
        drawCanvas();
    }
}

function handleTouchEnd(e) {
    if (isDragging) {
        isDragging = false;
    }
}

// Functions
function handleImageUpload(e) {
    const reader = new FileReader();
    reader.onload = function(event) {
        uploadedImage = new Image();
        uploadedImage.onload = function() {
            adjustCanvasSize();
            initWatermarkPosition();
            drawCanvas();
        };
        uploadedImage.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
}

function adjustCanvasSize() {
    const maxWidth = 800;
    const maxHeight = 600; // Optional: set a max height
    let ratio = 1;

    if (uploadedImage.width > maxWidth) {
        ratio = maxWidth / uploadedImage.width;
    }
    if (uploadedImage.height * ratio > maxHeight) {
        ratio = maxHeight / uploadedImage.height;
    }

    canvas.width = uploadedImage.width * ratio;
    canvas.height = uploadedImage.height * ratio;
}

function initWatermarkPosition() {
    watermarkX = canvas.width / 2;
    watermarkY = canvas.height / 2;

    // Set baseScale so that scale=1 represents the watermark being 1/4 of the canvas width
    baseScale = (canvas.width / 4) / watermarkImage.width;
    scale = 1; // Initialize scale multiplier

    scaleSlider.value = scale;
    scaleSlider.min = 0.5;
    scaleSlider.max = 1.5;
    scaleSlider.step = 0.1;

    rotation = 0;
    rotationSlider.value = rotation;
}

function updateScale() {
    scale = parseFloat(scaleSlider.value);
    drawCanvas();
}

function updateRotation() {
    rotation = parseFloat(rotationSlider.value);
    drawCanvas();
}

// Switches the watermark image based on the user's selection
function selectWatermark(e) {
    watermarkOptions.forEach(img => img.classList.remove('selected'));
    e.target.classList.add('selected');

    // Update the watermark image source based on the clicked option
    watermarkImage.src = e.target.src;
    watermarkImage.onload = function() {
        initWatermarkPosition();  // Reinitialize position and scaling
        drawCanvas();
    };
}

function drawCanvas() {
    if (!uploadedImage.src) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);

    const wmWidth = watermarkImage.width * baseScale * scale;
    const wmHeight = watermarkImage.height * baseScale * scale;

    ctx.save();
    ctx.translate(watermarkX, watermarkY);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.drawImage(watermarkImage, -wmWidth / 2, -wmHeight / 2, wmWidth, wmHeight);
    ctx.restore();
}

// Dragging functions for moving the watermark
function handleMouseDown(e) {
    if (!uploadedImage.src) return;
    e.preventDefault();
    const mousePos = getMousePos(canvas, e);
    const wmWidth = watermarkImage.width * baseScale * scale;
    const wmHeight = watermarkImage.height * baseScale * scale;

    ctx.save();
    ctx.translate(watermarkX, watermarkY);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.beginPath();
    ctx.rect(-wmWidth / 2, -wmHeight / 2, wmWidth, wmHeight);
    ctx.restore();

    if (ctx.isPointInPath(mousePos.x, mousePos.y)) {
        isDragging = true;
        offsetX = mousePos.x - watermarkX;
        offsetY = mousePos.y - watermarkY;
    }
}

function handleMouseMove(e) {
    if (isDragging) {
        e.preventDefault();
        const mousePos = getMousePos(canvas, e);
        watermarkX = mousePos.x - offsetX;
        watermarkY = mousePos.y - offsetY;
        drawCanvas();
    }
}

function handleMouseUp(e) {
    if (isDragging) {
        isDragging = false;
    }
}

function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) * (canvas.width / rect.width),
        y: (evt.clientY - rect.top) * (canvas.height / rect.height)
    };
}

function downloadImage() {
    const link = document.createElement('a');
    link.download = 'watermarked_image.png';
    link.href = canvas.toDataURL();
    link.click();
}
