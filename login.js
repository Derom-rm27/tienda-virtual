const SUPABASE_URL = 'https://gsyncqjiktclkzytjrll.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzeW5jcWppa3RjbGt6eXRqcmxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNTkyMzEsImV4cCI6MjA4NTgzNTIzMX0.1t8xr5SKTPvMH9dOZCrQBxMkMPLqxcturwdwjetnJXU';

const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginMessage = document.getElementById('loginMessage');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginMessage.textContent = 'Iniciando sesión...';
    loginMessage.style.color = 'blue';

    const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.value,
        password: loginPassword.value
    });

    if (error) {
        loginMessage.textContent = `Error al iniciar sesión: ${error.message}`;
        loginMessage.style.color = 'red';
        return;
    }

    if (data?.user) {
        loginMessage.textContent = 'Inicio de sesión exitoso. Redirigiendo...';
        loginMessage.style.color = 'green';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 800);
    }
});
