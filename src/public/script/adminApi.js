/* eslint-disable no-unused-vars */
window.onload = async function() {
    const response = await fetch('/admin/users');
    const data = await response.json();
    const users = data.usernames;

    const table = document.getElementById('data-table');
    const tbody = table.createTBody();

    users.forEach(user => {
        const row = tbody.insertRow();
        const nameCell = row.insertCell(0);
        const deleteCell = row.insertCell(1);
    
        nameCell.innerHTML = `<a href="" class="user-link">${user}</a>`;
        deleteCell.innerHTML = `<button type="button" class="controllers delete-btn">Delete</button>`;
    
        // Add event listener to delete button
        deleteCell.querySelector('.delete-btn').addEventListener('click', () => {
            // Get username from the corresponding row
            const username = nameCell.querySelector('.user-link').innerText;
            console.log(username);
            // Send DELETE request using Fetch API
            fetch(`/admin/deleteUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: username })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Handle success response
                console.log(data); // Log success message or do something else
                // Remove the row from the table upon successful deletion
                row.remove();
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
                // Handle error, e.g., show error message to user
            });
        });
    });
    

    // Add event listener to all anchor tags with class "user-link"
    document.querySelectorAll('.user-link').forEach(anchor => {
        anchor.addEventListener('click', async function(event) {
            event.preventDefault(); // Prevent default behavior of anchor tag
            
            const username = event.target.textContent; // Get the username from the clicked anchor tag
            sessionStorage.setItem('user',JSON.stringify(username));
            const userResponse = await fetch(`/admin/users/${username}`);
            const userData = await userResponse.json();

            sessionStorage.setItem('userInfo', JSON.stringify(userData)); // Store user info in sessionStorage
            sessionStorage.setItem('redirectURL', '/adminDashboard');
            // window.location.reload();
            fetchResource('/adminDashboard');
        });
    });
}

//*************************************************************************************************** */
//*************************************************************************************************** */
async function parseErrorMessage(message) {
    try {
        const jsonMessage = JSON.parse(message);
        if (jsonMessage && jsonMessage.errors && Array.isArray(jsonMessage.errors)) {
            return jsonMessage.errors[0];
        }
    } catch (error) {
        return message;
    }
}

async function createUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try {
        // Reset error messages
        document.getElementById('username-error').innerText = '';
        document.getElementById('password-error').innerText = '';

        const response = await fetch('/admin/addUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            const parsedErrorMessage = await parseErrorMessage(errorMessage);
            throw new Error(parsedErrorMessage);
        }

        // After successfully creating the user, fetch the updated list of users
        const getUsersResponse = await fetch('/admin/users');
        const userData = await getUsersResponse.json();
        const users = userData.usernames;

        // Clear existing table rows
        const table = document.getElementById('data-table');
        table.innerHTML = '<table id="data-table"><tr><th>Name</th><th>Delete</th></tr></table>';

        // Add new users to the table
        const tbody = table.createTBody();
        users.forEach(user => {
            const row = tbody.insertRow();
            const nameCell = row.insertCell(0);
            const deleteCell = row.insertCell(1);

            nameCell.innerHTML = `<a href="" class="user-link">${user}</a>`;
            deleteCell.innerHTML = `<button type="button" class="controllers delete-btn">Delete</button>`;

            // Add event listener to delete button
            deleteCell.querySelector('.delete-btn').addEventListener('click', () => {
                // Get username from the corresponding row
                const username = nameCell.querySelector('.user-link').innerText;

                // Send DELETE request using Fetch API
                fetch(`/admin/deleteUser`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username: username })
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        // Handle success response
                        console.log(data); // Log success message or do something else
                        // Remove the row from the table upon successful deletion
                        row.remove();
                    })
                    .catch(error => {
                        console.error('There was a problem with the fetch operation:', error);
                        // Handle error, e.g., show error message to user
                    });
            });
        });

        console.log('User created successfully');
    } catch (error) {
        console.error('Error:', error);
        // Handle error
        if (error.message.includes('Username')) {
            document.getElementById('username-error').innerText = error.message;
        } else if (error.message.includes('Password')) {
            document.getElementById('password-error').innerText = error.message;
        } else {
            // Handle other types of errors
            document.getElementById('username-error').innerText = 'An error occurred. Please try again.';
        }
    }
}


   // Add event listener to all anchor tags with class "user-link"
   document.querySelectorAll('.user-link').forEach(anchor => {
    anchor.addEventListener('click', async function(event) {
        event.preventDefault(); // Prevent default behavior of anchor tag
        
        const username = event.target.textContent; // Get the username from the clicked anchor tag
        const userResponse = await fetch(`/admin/users/${username}`);
        const userData = await userResponse.json();

        sessionStorage.setItem('userInfo', JSON.stringify(userData)); // Store user info in sessionStorage
        const redirectURL = sessionStorage.setItem('redirectURL', '/adminDashboard');
        // window.location.reload();
        fetchResource('/adminDashboard');
    })});

//uploading template *******************************************------------------------------------
function fetchResource(url) {
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
        return response.text(); // Parse response body as text
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

function toggleChangedPassword() {
    const modalOverlay = document.getElementById('modalOverlay');
    modalOverlay.classList.toggle('active');
}

async function changePassword() {
    const username = document.getElementById('Username').value;
    const newPassword = document.getElementById('newPassword').value;

    try {
        const response = await fetch('/admin/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                newPassword: newPassword,
            }),
        });

        if (response.ok) {
            console.log('Password changed successfully');
            // Optionally, you can close the modal after successful password change
            toggleChangedPassword();
        } else {
            console.error('Failed to change password');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Prevent default form submission and call changePassword function instead
document.getElementById('changePassword').addEventListener('click', function(event) {
    event.preventDefault();
    changePassword();
});

     // Function to handle logout
     function logout() {
        // Clear session storage
        sessionStorage.clear();
        // Redirect to the login page and clear history
        window.location.replace('/'); // Update with your login page URL
    }
    function toggleChangPassword() {
        var modalOverlay = document.getElementById("modalOverlay");
        if (modalOverlay.style.display === "none" || modalOverlay.style.display === "") {
            modalOverlay.style.display = "block";
        } else {
            modalOverlay.style.display = "none";
        }
    }
   
   