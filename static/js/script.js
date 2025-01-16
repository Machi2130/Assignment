document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.querySelector('.toggle-btn');
    const sidebar = document.querySelector('.sidebar');
    const container = document.querySelector('.container');
    const messageInput = document.querySelector('.message-input');
    const messagesContainer = document.getElementById('messagesContainer');
    let currentChatUser = null;
    let loadingOlderMessages = false;
    const currentUserElement = document.getElementById('currentUserName');
    const currentUser = currentUserElement ? currentUserElement.textContent : '';

    // Ensure sidebar is open by default
    sidebar.classList.add('active');
    container.classList.remove('sidebar-closed');

    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        container.classList.toggle('sidebar-closed');
    });

    function updateChatHeader(userData) {
        const chatHeader = document.querySelector('.chat-header');
        if (window.innerWidth <= 768) {
            chatHeader.innerHTML = `
                <div class="chat-header-info">
                    <div class="user-avatar">👤</div>
                    <div class="user-details-mobile">
                        <h4>${userData.username}</h4>
                        <p class="user-status ${userData.status}">${userData.status}</p>
                        <span>${userData.email}</span>
                    </div>
                </div>
            `;
        }
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
            container.classList.remove('sidebar-closed');
            if (currentChatUser) {
                loadChat(currentChatUser);
            }
        }
        adjustPageScale(); // Call the new function on resize
    });

    function closeSidebarMobile() {
        sidebar.classList.remove('active');
        container.classList.remove('sidebar-closed');
    }

    function loadUsers() {
        fetch('/get-users/')
            .then(response => response.json())
            .then(data => {
                const usersList = document.getElementById('usersList');
                usersList.innerHTML = data.users.map(user => `
                    <div class="user-item" onclick="loadChat(${user.id})">
                        <div class="user-avatar">👤</div>
                        <div class="user-info">
                            <h4>${user.username}</h4>
                            <p class="user-status ${user.status}">${user.status}</p>
                        </div>
                    </div>
                `).join('');
                document.querySelectorAll('.user-item').forEach(item => {
                    item.addEventListener('click', closeSidebarMobile);
                });
            });
    }

    function loadChat(userId) {
        currentChatUser = userId;
        fetch(`/get-messages/${userId}/`)
            .then(response => response.json())
            .then(data => {
                messagesContainer.innerHTML = data.messages.map(msg => `
                    <div class="message ${msg.sender === currentUser ? 'sent' : 'received'}">
                        <p>${msg.content}</p>
                        <span class="timestamp">${formatTimestamp(msg.timestamp)}</span>
                    </div>
                `).join('');
                
                messagesContainer.scrollTop = messagesContainer.scrollHeight;

                if (window.innerWidth <= 768) {
                    updateChatHeader(data.user);
                } else {
                    const chatUserName = document.getElementById('chatUserName');
                    const selectedUserName = document.getElementById('selected-user-name');
                    const selectedUserEmail = document.getElementById('selected-user-email');
                    const selectedUserStatus = document.getElementById('selected-user-status');
                    const chatSessionTime = document.getElementById('chat-session-time');

                    if (chatUserName) chatUserName.textContent = data.user.username;
                    if (selectedUserName) selectedUserName.textContent = data.user.username;
                    if (selectedUserEmail) selectedUserEmail.textContent = data.user.email;
                    if (selectedUserStatus) selectedUserStatus.textContent = data.user.status;
                    if (chatSessionTime) chatSessionTime.textContent = new Date().toLocaleTimeString();
                }
            });
    }

    function loadOlderMessages(userId, lastMessageId) {
        if (loadingOlderMessages) return;
        loadingOlderMessages = true;
        fetch(`/get-older-messages/${userId}/?last_message_id=${lastMessageId}`)
            .then(response => response.json())
            .then(data => {
                const currentScrollHeight = messagesContainer.scrollHeight;
                const olderMessages = data.messages.map(msg => `
                    <div class="message ${msg.sender === currentUser ? 'sent' : 'received'}">
                        <p>${msg.content}</p>
                        <span class="timestamp">${formatTimestamp(msg.timestamp)}</span>
                    </div>
                `).join('');
                messagesContainer.innerHTML = olderMessages + messagesContainer.innerHTML;
                messagesContainer.scrollTop = messagesContainer.scrollHeight - currentScrollHeight;
                loadingOlderMessages = false;
            });
    }

    messagesContainer.addEventListener('scroll', () => {
        if (messagesContainer.scrollTop === 0 && currentChatUser) {
            const firstMessage = messagesContainer.querySelector('.message');
            const lastMessageId = firstMessage ? firstMessage.dataset.messageId : null;
            if (lastMessageId) {
                loadOlderMessages(currentChatUser, lastMessageId);
            }
        }
    });

    function sendMessage() {
        const content = messageInput.querySelector('input').value.trim();
        if (content && currentChatUser) {
            fetch('/send-message/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken()
                },
                body: JSON.stringify({
                    receiver_id: currentChatUser,
                    content: content
                })
            }).then(() => {
                messageInput.querySelector('input').value = '';
                loadChat(currentChatUser);
            });
        }
    }

    function handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        fetch('/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/chat/';
            } else {
                document.getElementById('login-error').textContent = data.error;
                document.getElementById('login-error').style.display = 'block';
            }
        });
    }

    function handleSignup() {
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password1 = document.getElementById('signup-password1').value;
        const password2 = document.getElementById('signup-password2').value;

        fetch('/signup/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password1: password1,
                password2: password2
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = data.redirect;
            } else {
                document.getElementById('signup-error').textContent = data.error;
                document.getElementById('signup-error').style.display = 'block';
            }
        });
    }

    function logout() {
        fetch('/logout/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCsrfToken()
            }
        }).then(() => {
            window.location.href = '/';
        });
    }

    function formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    function getCsrfToken() {
        const name = 'csrftoken';
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    messageInput.querySelector('input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    loadUsers();
    setInterval(loadUsers, 30000);

    window.loadChat = loadChat;
    window.sendMessage = sendMessage;
    window.logout = logout;
    window.handleLogin = handleLogin;
    window.handleSignup = handleSignup;

    // New function to adjust page scale based on screen width
    function adjustPageScale() {
        const width = window.innerWidth;
        if (width >= 992 && width <= 1600) {
            document.body.style.transform = 'scale(0.9)';
            document.body.style.transformOrigin = 'top left';
        } else if (width >= 700 && width <= 767) {
            document.body.style.transform = 'scale(0.8)';
            document.body.style.transformOrigin = 'top left';
        } else if (width >= 600 && width <= 700) {
            document.body.style.transform = 'scale(0.75)';
            document.body.style.transformOrigin = 'top left';
        } else if (width <= 600) {
            document.body.style.transform = 'scale(0.5)';
            document.body.style.transformOrigin = 'top left';
        } else {
            document.body.style.transform = 'scale(1)';
            document.body.style.transformOrigin = 'top left';
        }
    }

    // Initial call to set the correct scale
    adjustPageScale();
});