// Supabase Configuration
const SUPABASE_URL = 'https://gsyncqjiktclkzytjrll.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzeW5jcWppa3RjbGt6eXRqcmxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNTkyMzEsImV4cCI6MjA4NTgzNTIzMX0.1t8xr5SKTPvMH9dOZCrQBxMkMPLqxcturwdwjetnJXU';

const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const registerForm = document.getElementById('registerForm');
const registerNameInput = document.getElementById('registerName');
const registerEmailInput = document.getElementById('registerEmail');
const registerPasswordInput = document.getElementById('registerPassword');
const registerMessage = document.getElementById('registerMessage');

// --- Registration Handling ---
async function handleRegistration(e) {
    e.preventDefault();
    registerMessage.textContent = 'Creando tu cuenta...';
    registerMessage.style.color = 'blue';

    const name = registerNameInput.value;
    const email = registerEmailInput.value;
    const password = registerPasswordInput.value;

    // Step 1: Sign up the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            // Store the user's full name in the metadata
            data: { 
                full_name: name 
            }
        }
    });

    if (authError) {
        registerMessage.textContent = `Error en el registro: ${authError.message}`;
        registerMessage.style.color = 'red';
        return;
    }

    if (authData.user) {
        // Step 2: Insert the user details into the 'usuarios' public table
        const { error: insertError } = await supabase
            .from('usuarios')
            .insert([
                { 
                    id: authData.user.id, // Use the same ID from auth.users
                    nombre_completo: name,
                    email: email
                }
            ]);

        if (insertError) {
            // This is a tricky situation. The user is created in Auth but not in our public table.
            // For now, we'll just show an error. A more robust solution might involve cleanup.
            registerMessage.textContent = `Error al guardar datos: ${insertError.message}`;
            registerMessage.style.color = 'red';
            console.error('Error inserting into public.usuarios:', insertError);
            return;
        }

        registerMessage.textContent = '¡Registro exitoso! Revisa tu correo para verificar tu cuenta. Serás redirigido en 5 segundos...';
        registerMessage.style.color = 'green';
        registerForm.reset();

        // Redirect the user to the main page after a delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 5000);
    }
}

// Add event listener to the form
registerForm.addEventListener('submit', handleRegistration);