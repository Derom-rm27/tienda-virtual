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
        // Step 2: Insert details in public table. Supports either `usuarios` or `perfil_usuario` schema.
        const userPayloads = [
            { table: 'usuarios', data: { id: authData.user.id, nombre_completo: name, email: email } },
            { table: 'perfil_usuario', data: { id_usuario: authData.user.id, nombre_completo: name } }
        ];

        let insertSuccess = false;
        let lastInsertError = null;

        for (const target of userPayloads) {
            const { error: insertError } = await supabase
                .from(target.table)
                .insert([target.data]);

            if (!insertError) {
                insertSuccess = true;
                break;
            }
            lastInsertError = insertError;
        }

        if (!insertSuccess) {
            registerMessage.textContent = `Usuario creado en Auth, pero no se pudo guardar en tabla pública: ${lastInsertError?.message || 'Error desconocido'}`;
            registerMessage.style.color = 'red';
            console.error('Error inserting public user profile:', lastInsertError);
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