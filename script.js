// Database Sederhana di LocalStorage
let users = JSON.parse(localStorage.getItem('xr_users')) || [];
let activeUser = localStorage.getItem('xr_active_user') || null;

// Inisialisasi Aplikasi saat Load
document.addEventListener('DOMContentLoaded', () => {
    renderNav();
    updateMainContent();
    checkRememberedUser();
});

// Render Navigasi Sesuai Status Login
function renderNav() {
    const navRight = document.getElementById('navRight');
    
    if (activeUser) {
        navRight.innerHTML = `
            <div class="profile-menu-container">
                <button type="button" class="profile-btn" onclick="toggleDropdown()">
                    <i class="fa-solid fa-circle-user"></i>
                    <span>${activeUser}</span>
                    <i class="fa-solid fa-chevron-down"></i>
                </button>
                <div id="profileDropdown" class="dropdown-menu">
                    <button type="button" class="dropdown-item" onclick="openSwitchAccountModal()">
                        <i class="fa-solid fa-users"></i> Switch / Tambah Akun
                    </button>
                    <button type="button" class="dropdown-item" onclick="confirmAction('logout')">
                        <i class="fa-solid fa-right-from-bracket"></i> Logout
                    </button>
                    <button type="button" class="dropdown-item danger-text" onclick="confirmAction('delete')">
                        <i class="fa-solid fa-user-xmark"></i> Hapus Akun
                    </button>
                </div>
            </div>
        `;
    } else {
        navRight.innerHTML = `
            <button type="button" class="btn btn-primary" onclick="openAuthModal('login')">
                <i class="fa-solid fa-right-to-bracket"></i> Login / Daftar
            </button>
        `;
    }
}

// Toggle Dropdown Menu
function toggleDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) dropdown.classList.toggle('show');
}

// Tutup dropdown jika klik di luar
window.onclick = function(e) {
    if (!e.target.closest('.profile-menu-container')) {
        const dropdown = document.getElementById('profileDropdown');
        if (dropdown && dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    }
}

// Modal Handler
function openAuthModal(type) {
    document.getElementById('authModal').style.display = 'flex';
    switchTab(type);
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const regForm = document.getElementById('registerForm');
    const tabLoginBtn = document.getElementById('tabLoginBtn');
    const tabRegBtn = document.getElementById('tabRegisterBtn');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        regForm.classList.add('hidden');
        tabLoginBtn.classList.add('active');
        tabRegBtn.classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        regForm.classList.remove('hidden');
        tabLoginBtn.classList.remove('active');
        tabRegBtn.classList.add('active');
    }
}

// Lihat / Sembunyikan Password
function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Handle Register
function handleRegister(e) {
    e.preventDefault();
    const user = document.getElementById('regUsername').value.trim();
    const pass = document.getElementById('regPassword').value;
    const confirmPass = document.getElementById('regConfirmPassword').value;

    if (pass !== confirmPass) {
        alert('Konfirmasi password tidak cocok!');
        return;
    }

    const exist = users.find(u => u.username === user);
    if (exist) {
        alert('Username sudah terdaftar! Gunakan username lain.');
        return;
    }

    users.push({ username: user, password: pass });
    localStorage.setItem('xr_users', JSON.stringify(users));
    
    alert('Pendaftaran berhasil! Silakan login.');
    switchTab('login');
    document.getElementById('loginUsername').value = user;
    document.getElementById('loginPassword').value = pass;
}

// Handle Login
function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('loginUsername').value.trim();
    const pass = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    const found = users.find(u => u.username === user && u.password === pass);

    if (found) {
        activeUser = user;
        localStorage.setItem('xr_active_user', activeUser);

        if (rememberMe) {
            localStorage.setItem('xr_saved_user', user);
            localStorage.setItem('xr_saved_pass', pass);
        } else {
            localStorage.removeItem('xr_saved_user');
            localStorage.removeItem('xr_saved_pass');
        }

        closeModal('authModal');
        renderNav();
        updateMainContent();
    } else {
        alert('Username atau password salah!');
    }
}

// Isi otomatis jika pengguna mencentang "Ingat Saya"
function checkRememberedUser() {
    const savedUser = localStorage.getItem('xr_saved_user');
    const savedPass = localStorage.getItem('xr_saved_pass');
    
    if (savedUser && savedPass) {
        const uInput = document.getElementById('loginUsername');
        const pInput = document.getElementById('loginPassword');
        const remCB = document.getElementById('rememberMe');
        
        if (uInput && pInput && remCB) {
            uInput.value = savedUser;
            pInput.value = savedPass;
            remCB.checked = true;
        }
    }
}

// Fitur Konfirmasi Logout & Hapus Akun
function confirmAction(type) {
    const modal = document.getElementById('confirmModal');
    const title = document.getElementById('confirmTitle');
    const msg = document.getElementById('confirmMessage');
    const execBtn = document.getElementById('confirmExecuteBtn');

    modal.style.display = 'flex';

    if (type === 'logout') {
        title.innerText = 'Konfirmasi Logout';
        msg.innerText = 'Apakah Anda yakin ingin keluar dari akun ini?';
        execBtn.onclick = function() {
            activeUser = null;
            localStorage.removeItem('xr_active_user');
            closeModal('confirmModal');
            renderNav();
            updateMainContent();
        };
    } else if (type === 'delete') {
        title.innerText = 'Konfirmasi Hapus Akun';
        msg.innerText = `PERINGATAN: Akun "${activeUser}" akan dihapus permanen!`;
        execBtn.onclick = function() {
            users = users.filter(u => u.username !== activeUser);
            localStorage.setItem('xr_users', JSON.stringify(users));
            activeUser = null;
            localStorage.removeItem('xr_active_user');
            closeModal('confirmModal');
            renderNav();
            updateMainContent();
        };
    }
}

// Popup Switch / Tambah Akun
function openSwitchAccountModal() {
    const modal = document.getElementById('switchAccountModal');
    const listContainer = document.getElementById('accountList');
    listContainer.innerHTML = '';

    users.forEach(u => {
        const isCurrent = u.username === activeUser;
        const item = document.createElement('div');
        item.className = `account-item ${isCurrent ? 'active-acc' : ''}`;
        item.innerHTML = `
            <div>
                <strong>${u.username}</strong>
                ${isCurrent ? '<small style="color:var(--primary-pink);"> (Aktif)</small>' : ''}
            </div>
            ${!isCurrent ? `<button type="button" class="btn btn-small" onclick="switchAccountTo('${u.username}')">Ganti</button>` : ''}
        `;
        listContainer.appendChild(item);
    });

    modal.style.display = 'flex';
}

function switchAccountTo(username) {
    activeUser = username;
    localStorage.setItem('xr_active_user', activeUser);
    closeModal('switchAccountModal');
    renderNav();
    updateMainContent();
}

function openAddAccount() {
    closeModal('switchAccountModal');
    openAuthModal('register');
}

// Update Pesan Utama Sesuai Akun Aktif
function updateMainContent() {
    const welcomeBox = document.getElementById('welcomeMessage');
    if (activeUser) {
        welcomeBox.innerHTML = `Halo <strong style="color:var(--primary-pink);">${activeUser}</strong>, akun Anda aktif dan siap digunakan!`;
    } else {
        welcomeBox.innerHTML = 'Anda belum login. Silakan daftar atau login untuk mengakses fitur lengkap.';
    }
}
