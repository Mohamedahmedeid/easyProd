function drawText() {
    const titleText = document.getElementById('titleText');
    const descriptionText = document.getElementById('descriptionText');
    
    // Set font properties for title text
    ctx.font = `bold ${parseInt(document.getElementById('titleFontSize').value)}px Cairo`;
    ctx.fillStyle = document.getElementById('titleColor').value;

    // Calculate the width of the title text
    const titleWidth = ctx.measureText(titleText.value).width;
    const titleX = (canvas.width - titleWidth) / 2;

    // Draw title text at specified position, adjusting for right-to-left rendering
    ctx.fillText(
        titleText.value,
        titleX,
        parseInt(document.getElementById('titleY').value)
    );

    // Set font properties for description text
    ctx.font = `normal ${parseInt(document.getElementById('descriptionFontSize').value)}px Cairo`;
    ctx.fillStyle = document.getElementById('descriptionColor').value;

    const descriptionX = parseInt(document.getElementById('descriptionX').value);
    const descriptionY = parseInt(document.getElementById('descriptionY').value);
    const descriptionFontSize = parseInt(document.getElementById('descriptionFontSize').value);
    const maxLineWidth = 850; // Maximum width for description text

    // Split description into multiple lines based on maximum width
    const descriptionLines = splitTextIntoLines(descriptionText.value, maxLineWidth);

    // Draw each line of description text from right to left
    descriptionLines.forEach((line, index) => {
        // Calculate the width of the current line
        const lineWidth = ctx.measureText(line).width;
        // Calculate the x-coordinate for right-to-left rendering
        const lineX = canvas.width - (descriptionX + lineWidth);
        ctx.fillText(line, lineX, descriptionY + index * descriptionFontSize);
    });
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

async function displayTemplates () {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));   
    const userId = userInfo.user._id;
    const response = await fetch(`/admin/geTemplates/${userId}`);
    const data = await response.json();
    
    const tempalteOne = document.getElementById('templatePreview1');
    const templateTwo = document.getElementById('templatePreview2');
    if(data.templateUrls[0]){    tempalteOne.src = data.templateUrls[0];
    }
    if(data.templateUrls[1]){    templateTwo.src = data.templateUrls[1];
    }
   }
    // Your entire script goes here
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var imageInput = document.getElementById('imageInput');

var img = new Image();

// Function to handle image upload
imageInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        img.onload = function() {
            if (img.width !== 1080 || img.height !== 1080) {
                alert("Please upload an image with dimensions 1080x1080.");
                return; // Exit the function without further processing
            }
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Draw image onto canvas
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            // Call function to draw text
            drawText();
        }
        img.src = e.target.result;
    }
    reader.readAsDataURL(file);
});



// Add event listeners to form inputs and textarea
document.querySelectorAll('.text-input input, .text-input select, textarea').forEach(input => {
    input.addEventListener('input', () => {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Call function to draw text
        drawText();
    });
});

// Initial draw when page loads
drawText();


//********************************************************************** */




displayTemplates();

// Assuming you have two buttons with IDs deleteTemplate1Btn and deleteTemplate2Btn

var deleteTemplate = async (index) => {
    try {
      const username = JSON.parse(sessionStorage.getItem('user')); // Provide the username here
      const user = JSON.parse(sessionStorage.getItem('userInfo')); // Provide the template name here
      const templateId = user.user.templates.property[index];
      const template = user.user.templates.property[index];
      if (template) {
          const imageUrl = template.imageUrl;
      
        const response = await fetch(`/admin/deleteTemplate/${imageUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, templateId })
      });      const data = await response.json();
       console.log(data.json());
    } else {
        console.error('Template at index', index, 'is undefined.');
    }
    }
     catch (error) {
      console.error('Error:', error);
    }
  };
  
  document.getElementById('deleteTemplate1Btn').addEventListener('click', () => {
    deleteTemplate(0);
    const template = document.getElementById('templatePreview1');
    template.alt =   "Template Deleted";
    template.removeAttribute('src');

  });
  
  document.getElementById('deleteTemplate2Btn').addEventListener('click', () => {
    deleteTemplate(1);  
    const template = document.getElementById('templatePreview2');
    template.alt =   "Template Deleted";
    template.removeAttribute('src');
  });


  var saveTemplateButton = document.getElementById('saveTemplateButton');
    saveTemplateButton.addEventListener('click' ,async () => {
      // Gather data from HTML elements
      const titleX = document.getElementById('titleX').value;
      const titleY = document.getElementById('titleY').value;
      const titleColor = document.getElementById('titleColor').value;
      const titleFontSize = document.getElementById('titleFontSize').value;
    
      const descriptionX = document.getElementById('descriptionX').value;
      const descriptionY = document.getElementById('descriptionY').value;
      const descriptionColor = document.getElementById('descriptionColor').value;
      const descriptionFontSize = document.getElementById('descriptionFontSize').value;
      // Get userId from userInfo
      // Retrieve user information from sessionStorage
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      // Accessing userId from the nested user object
      const userId = userInfo.user._id;



      const imageInput = document.getElementById('imageInput');
    
      const imageFile = imageInput.files[0];
    
      // Create FormData object to send files and other data
      const formData = new FormData();
      formData.append('username', userInfo.user.username); // Implement this function similarly to getUserId()
      formData.append('titleMeta', JSON.stringify({ x_position: titleX, y_position: titleY, textColor: titleColor, fontSize: titleFontSize }));
      formData.append('descriptionMeta', JSON.stringify({  x_position: descriptionX, y_position: descriptionY, textColor: descriptionColor, fontSize: descriptionFontSize}));
      formData.append('template', imageFile);
      try {
        const response = await fetch(`/admin/${userId}/uploadTemplate`, {
          method: 'POST',
          body: formData,
        });
    
        const data = await response.json();
    
        if (response.ok) {
          console.log('Template uploaded successfully:', data.message);
          // Perform any additional actions if needed
          window.location.reload();
         } else {
          console.error('Failed to upload template:', data.error);
          // Handle error response
        }
      } catch (error) {
        console.error('Error uploading template:', error);
        // Handle network or other errors
      }  
    }
);

document.getElementById("backButton").addEventListener("click", function() {
    const token = sessionStorage.getItem('token');
    if (!token) {
        // Handle case when token is not available (user not logged in)
        return Promise.reject('No token available');
    }
     sessionStorage.setItem('redirectURL','/admin');
    return fetch('/admin', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}` // Include the token in the Authorization header
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text(); // Parse response body as JSON
    })
    .then(html => {
        // Erase current document content and replace with HTML response
        document.open();
        document.write(html);
        document.close();
    })
    .catch(error => {
        console.error('Error:', error);})
    });
    document.getElementById('titleText').addEventListener('input', function() {
        if (this.value.length > 30) {
            this.value = this.value.substring(0, 30);
            this.classList.add('exceed-limit');
            document.getElementById('titleError').innerText = 'Title text exceeds 30 characters.';
        } else {
            this.classList.remove('exceed-limit');
            document.getElementById('titleError').innerText = '';
        }
    });

    document.getElementById('descriptionText').addEventListener('input', function() {
        if (this.value.length > 250) {
            this.value = this.value.substring(0, 250);
            this.classList.add('exceed-limit');
            document.getElementById('descriptionError').innerText = 'Description text exceeds 250 characters.';
        } else {
            this.classList.remove('exceed-limit');
            document.getElementById('descriptionError').innerText = '';
        }
    });