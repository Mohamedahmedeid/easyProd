/* eslint-disable no-unused-vars */
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageInput = document.getElementById('imageInput');
const titleText = document.getElementById('titleInput');
const descriptionText = document.getElementById('descriptionInput');
const templatePreview1 = document.getElementById('templatePreview1');
const templatePreview2 = document.getElementById('templatePreview2');
var selectedTemplate ;
window.addEventListener('load', function() {
    // Set the default template here
    templatePreview1.click();
});
const image = {
    x: 0,
    y: 0,
    width: canvas.width, // Set image width to canvas width
    height: canvas.height, // Set image height to canvas height
    img: null
};

// Function to handle image upload
imageInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        image.img = new Image();
        image.img.onload = function() {
            applyTemplate(selectedTemplate);
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Draw image onto canvas
            ctx.drawImage(image.img, image.x, image.y, image.width, image.height);

            // Call function to draw text
            drawText();
        };
        image.img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

// Event listener for template preview 1
templatePreview1.addEventListener('click', function() {
    applyTemplate(templatePreview1.src);
    selectedTemplate = templatePreview1.src;
});

// Event listener for template preview 2
templatePreview2.addEventListener('click', function() {
    applyTemplate(templatePreview2.src);
    selectedTemplate = templatePreview2.src;
});

// Function to apply selected template// Function to apply selected template
function applyTemplate(templateSrc) {
    const templateImg = new Image();
    templateImg.onload = function() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw image onto canvas if uploaded
        if (image.img) {
            ctx.drawImage(image.img, image.x, image.y, image.width, image.height);
        }
        // Draw template onto canvas
        ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
        drawText(); // Redraw text
    };
    templateImg.src = templateSrc;
}
 
  // Initialize titleX at the center of the canvas
let titleX = canvas.width / 2;

function moveTitle(direction) {
    const titleWidth = ctx.measureText(titleText.value).width / 2;
    
    if (direction === 'left') {
        titleX -= 10;
        if (titleX - titleWidth < 0) {
            titleX  = titleWidth;
        }
    } else if (direction === 'right') {
        titleX += 10;
        if (titleX + titleWidth > canvas.width) {
            titleX = canvas.width - titleWidth;
        }
    }

    redrawCanvas();
}
function drawText() {
    const property = JSON.parse(sessionStorage.getItem('userTemplatesMeta'));
    const template = JSON.parse(sessionStorage.getItem('templates'));
    // Loop through each template's metadata
    for (let i = 0; i < property.property.length; i++) {
        if (selectedTemplate === template[i]) {
            const templateProperties = property.property[i];

            // Set font properties for title text
            ctx.font = `${templateProperties.titleMeta.fontSize}px 'Cairo', sans-serif`;
            ctx.fillStyle = templateProperties.titleMeta.textColor;
            ctx.fontWeight = 'bold'; // Set title font-weight to bold
            const titleWidth = ctx.measureText(titleText.value).width;


            titleX = canvas.width - templateProperties.titleMeta.x_position - titleWidth;
            // if (titleX - titleWidth > 0) {
            // Draw title text with floating effect
            ctx.fillText(
                titleText.value,
                titleX ,
                templateProperties.titleMeta.y_position
            );
            // }
            // Set font properties for description text
            ctx.font = `${templateProperties.descriptionMeta.fontSize}px 'Cairo', sans-serif`;
            ctx.fillStyle = templateProperties.descriptionMeta.textColor;
            ctx.fontWeight = 'normal'; // Set description font-weight to normal

            // Set the maximum width for the description text
            const maxDescriptionWidth = Math.min(image.width - templateProperties.descriptionMeta.x_position, 850); // Maximum width for description text

            // Splitting description text into multiple lines
            const descriptionLines = splitTextIntoLines(descriptionText.value, maxDescriptionWidth);

            // Calculate the y position for the first line of description text
            let yPosition = templateProperties.descriptionMeta.y_position;

            // Draw each line of description text within the image bounds
            for (let j = 0; j < descriptionLines.length; j++) {
                // Calculate the width of the description line
                const lineTextWidth = ctx.measureText(descriptionLines[j]).width;
                // Right align the description text
                const lineX = canvas.width - templateProperties.descriptionMeta.x_position - lineTextWidth;
                ctx.fillText(descriptionLines[j], lineX, yPosition);

                // Adjust y position for the next line
                yPosition += templateProperties.descriptionMeta.fontSize + 5; // Adjust line spacing
            }

            // You can use yPosition for other elements if needed
        }
    }
}

// Function to split text into lines based on maximum width
function splitTextIntoLines(text,maxWidth) {
    const words = text.split('');
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
        // If encounter a newline character, start a new line
        if (words[i] === '\n') {
            lines.push(currentLine);
            currentLine = '';
            continue;
        }

        const testLine = currentLine.length === 0 ? words[i] : `${currentLine}${words[i]}`; // Join words without space
        const testWidth = ctx.measureText(testLine).width;

        if (testWidth <= maxWidth) {
            currentLine = testLine; // Add the word to the current line
        } else {
            lines.push(currentLine); // Push the current line to the lines array
            currentLine = words[i]; // Start a new line with the current word
        }
    }

    lines.push(currentLine); // Push the last line to the lines array
    console.log(lines);
    return lines;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
// Assuming there's a button with id "deleteButton" in your HTML
const deleteButton = document.getElementById('deleteButton');

// Event listener for delete button
deleteButton.addEventListener('click', function() {
    clearCanvas(); // Clear the canvas
});

// Redraw only the text
function redrawText() {
    drawText(); // Draw text
}

// Redraw the canvas with both image, template, and text
function redrawCanvas() {
    applyTemplate(selectedTemplate); // Redraw template
    drawText(); // Redraw text
}

titleText.addEventListener('input', function() {
   redrawCanvas(); // Redraw only the text
});

descriptionText.addEventListener('input', function() {
    redrawCanvas(); // Redraw only the text
});

document.querySelector('.arrow-up').addEventListener('click', function() {
    image.y -= 20;
    redrawCanvas(); // Redraw canvas with image and text
});

document.querySelector('.arrow-down').addEventListener('click', function() {
    image.y += 20;
    redrawCanvas(); // Redraw canvas with image and text
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
document.addEventListener("DOMContentLoaded", function() {
    var titleInput = document.getElementById("titleInput");
    var descriptionInput = document.getElementById("descriptionInput");
    var titleMsg = document.getElementById("titleMsg");
    var descriptionMsg = document.getElementById("descriptionMsg");

    titleInput.addEventListener("input", function() {
        if (this.value.length > 30) {
            this.value = this.value.slice(0, 30);
            titleMsg.textContent = "العنوان يتجاوز الحد المسموح به من 30 حرفًا";
        } else {
            titleMsg.textContent = "";
        }
    });

    descriptionInput.addEventListener("input", function() {
        if (this.value.length > 250) {
            this.value = this.value.slice(0, 250);
            descriptionMsg.textContent = "الوصف يتجاوز الحد المسموح به من 250 حرفًا";
        } else {
            descriptionMsg.textContent = "";
        }
    });
});
  
  // Function to handle logout
  function logout() {
    // Clear session storage
    sessionStorage.clear();
    // Redirect to the login page and clear history
    window.location.replace('/'); // Update with your login page URL
  }
  function displayTemplates ()  { 
    const data = JSON.parse(sessionStorage.getItem('templates'));
    const templatePreview1 = document.getElementById('templatePreview1');
    const templatePreview2 = document.getElementById('templatePreview2');
    if(data[0]) templatePreview1.src =  data[0];
    if(data[1]) templatePreview2.src =  data[1];
  }
displayTemplates();

// const saveButton = document.getElementById('saveButton');

// saveButton.addEventListener('click', function() {
//     const dataUrl = canvas.toDataURL('image/png');

//     // Check if Safari
//     if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
//         // For Safari, we need to use a different method due to security restrictions
//         const byteString = atob(dataUrl.split(',')[1]);
//         const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
//         const arrayBuffer = new ArrayBuffer(byteString.length);
//         const uint8Array = new Uint8Array(arrayBuffer);
//         for (let i = 0; i < byteString.length; i++) {
//             uint8Array[i] = byteString.charCodeAt(i);
//         }
//         const blob = new Blob([arrayBuffer], { type: mimeString });
//         const url = window.URL.createObjectURL(blob);

//         // Open the image in a new tab
//         window.open(url);
//     } else {
//         // For other browsers, proceed with the original approach
//         const link = document.createElement('a');
//         link.href = dataUrl;
//         link.download = 'Easy.png';

//         // Simulate a click on the link
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//     }
// });
const saveButton = document.getElementById('saveButton');

saveButton.addEventListener('click', function() {
  html2canvas(canvas).then(canvas => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'Easy.png';
    link.click();
  });
});
