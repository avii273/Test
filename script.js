// Replace with your Google Apps Script Web App URL
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwxS4wYRAkl7r-BctohYdx3EXsTvXLvv0OF4Rw3QZdOLhjkMICN-YK2OesKf99U8QOy/exec';
        
        let userIP = '';
        let deviceID = '';

        // Check if user is already logged in
        window.onload = function() {
            try {
                const isGranted = localStorage.getItem('accessGranted') === 'true' || 
                                sessionStorage.getItem('accessGranted') === 'true';
                if (isGranted) {
                    showSuccessPage();
                }
            } catch (error) {
                console.warn('Storage access restricted');
            }
            getUserIP();
            generateDeviceID();
        };

        // Get user IP address
        async function getUserIP() {
            try {
                // Try multiple IP services for better browser compatibility
                let response;
                try {
                    response = await fetch('https://api.ipify.org?format=json', {
                        method: 'GET',
                        mode: 'cors'
                    });
                } catch (e) {
                    // Fallback to another service
                    response = await fetch('https://ipapi.co/json/', {
                        method: 'GET',
                        mode: 'cors'
                    });
                }
                
                const data = await response.json();
                userIP = data.ip || data.query || 'Browser Security Restricted';
                document.getElementById('userIP').textContent = userIP;
            } catch (error) {
                console.error('Error getting IP:', error);
                // Fallback: Generate a mock IP for demo purposes
                userIP = '192.168.1.' + Math.floor(Math.random() * 255);
                document.getElementById('userIP').textContent = userIP + ' (Local)';
            }
        }

        // Generate device ID
        function generateDeviceID() {
            let deviceId;
            try {
                deviceId = localStorage.getItem('deviceID') || sessionStorage.getItem('deviceID');
                if (!deviceId) {
                    deviceId = 'DEV_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    try {
                        localStorage.setItem('deviceID', deviceId);
                    } catch (e) {
                        sessionStorage.setItem('deviceID', deviceId);
                    }
                }
            } catch (error) {
                // Fallback if storage is not available
                deviceId = 'DEV_TEMP_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            }
            deviceID = deviceId;
            document.getElementById('deviceID').textContent = deviceID;
        }

        // Verify access key
        async function verifyAccessKey() {
            const accessKey = document.getElementById('accessKey').value.trim();
            
            if (!accessKey) {
                showError('Please enter an access key');
                return;
            }

            showLoading(true);
            clearMessages();

            try {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'verifyKey',
                        accessKey: accessKey,
                        userIP: userIP,
                        deviceID: deviceID
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                
                if (result.success) {
                    try {
                        localStorage.setItem('accessGranted', 'true');
                        localStorage.setItem('accessKey', accessKey);
                    } catch (storageError) {
                        console.warn('LocalStorage not available, using session storage');
                        sessionStorage.setItem('accessGranted', 'true');
                        sessionStorage.setItem('accessKey', accessKey);
                    }
                    showSuccessPage();
                } else {
                    showError(result.message || 'Access key is invalid');
                }
            } catch (error) {
                console.error('Error:', error);
                if (error.name === 'TypeError' && error.message.includes('CORS')) {
                    showError('Browser security restrictions detected. Please serve this page from a web server or enable CORS in your browser.');
                } else if (error.message.includes('Failed to fetch')) {
                    showError('Network error: Please check your internet connection and try again.');
                } else {
                    showError('Connection error: ' + error.message);
                }
            } finally {
                showLoading(false);
            }
        }

        // Show success page
        function showSuccessPage() {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('successPage').style.display = 'block';
            document.getElementById('accessTime').textContent = new Date().toLocaleString();
        }

        // Logout function
        function logout() {
            try {
                localStorage.removeItem('accessGranted');
                localStorage.removeItem('accessKey');
            } catch (e) {
                console.warn('LocalStorage not accessible');
            }
            try {
                sessionStorage.removeItem('accessGranted');
                sessionStorage.removeItem('accessKey');
            } catch (e) {
                console.warn('SessionStorage not accessible');
            }
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('successPage').style.display = 'none';
            document.getElementById('accessKey').value = '';
            clearMessages();
        }

        // Show loading state
        function showLoading(show) {
            document.getElementById('loading').style.display = show ? 'block' : 'none';
            document.getElementById('verifyBtn').disabled = show;
        }

        // Show error message
        function showError(message) {
            document.getElementById('errorMessage').textContent = message;
        }

        // Clear messages
        function clearMessages() {
            document.getElementById('errorMessage').textContent = '';
        }

        // Handle Enter key press
        document.getElementById('accessKey').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                verifyAccessKey();
            }
        });
