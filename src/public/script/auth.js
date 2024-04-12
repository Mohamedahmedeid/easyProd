/* eslint-disable no-unused-vars */
function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('passwordError');

    if (username === '') {
        usernameError.textContent = 'Please enter your username';
        if (password === '') {
            passwordError.textContent = 'Please enter your password';
        } else {
            passwordError.textContent = ''; // Clear any existing error message
        }
        return;
    } else {
        usernameError.textContent = ''; // Clear any existing error message
    }

    if (password === '') {
        passwordError.textContent = 'Please enter your password';
        return; // Don't send the request
    } else {
        passwordError.textContent = ''; // Clear any existing error message
    }

    fetch('/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json(); // Parse response body as JSON
    })
    .then(data => {
        // Save the token in sessionStorage or localStorage
        sessionStorage.setItem('userTemplatesMeta', JSON.stringify(data.templatesMeta));
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('templates', JSON.stringify(data.templates));
        sessionStorage.setItem('username', JSON.stringify(data.username));

        // Redirect to the home page
        if (data.isAdmin) {
            sessionStorage.setItem('redirectURL', '/admin');
            fetchProtectedResource('/admin');
        } else {
            sessionStorage.setItem('redirectURL', '/home');
            fetchProtectedResource('/home');
        }
        window.location.reload(); // Reload the page
    })
    .catch(error => {
        console.error('Error:', error);
        if (error instanceof TypeError) {
            // This is a network error, show a generic error message
            showError('Error during login. Please try again.');
        } else if (error instanceof Response) {
            // This is an error response from the server
            error.json().then(errorMessage => {
                // Check if the error message is "Templates aren't uploaded"
                    showError(errorMessage);
                } ).catch(parseError => {
                // If there's an error parsing the error message, show a generic error
                console.error('Error parsing error response:', parseError);
                showError('An error occurred. Please try again.');
            });
        } else {
            // Handle other types of errors
            showError('An error occurred. Please try again.');
        }
    });
}    
function showError(message) {
    // Display error message in the error message container
    document.getElementById('errorMessageContainer').innerHTML = `<span class="error">${message}</span>`;
}
    


// Check if a redirect URL is stored in sessionStorage and redirect if present
window.onload = function() {
    const redirectURL = sessionStorage.getItem('redirectURL');
    if (redirectURL) {
    fetchProtectedResource(redirectURL);
    }
};

// Function to fetch protected resource (e.g., "home" page)
function fetchProtectedResource(url) {
    const token = sessionStorage.getItem('token');
    if (!token) {
        // Handle case when token is not available (user not logged in)
        return Promise.reject('No token available');
    }

    return fetch(url, {
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

            document.open();

            document.write(html);

            document.close();

    })

    .catch(error => {
        console.error('Error:', error);
        // Handle error
    });
}
