<script setup lang="ts">
definePageMeta({
    layout: false,
});

const form = reactive({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
});

const errorMsg = ref('');
const isLoading = ref(false);
const router = useRouter();

const handleRegister = async () => {
    if (form.password !== form.confirmPassword) {
        errorMsg.value = 'Пароли не совпадают';
        return;
    }

    isLoading.value = true;
    errorMsg.value = '';

    try {
        await $fetch('/api/auth/register', {
            method: 'POST',
            body: {
                name: form.name,
                email: form.email,
                password: form.password
            }
        });

        alert('Регистрация успешна! Теперь дождитесь одобрения администратором.');
        router.push('/login');

    } catch (e: any) {
        errorMsg.value = e.response?._data?.message || 'Ошибка регистрации';
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="auth-container">
        <div class="auth-card">
            <h1>Регистрация</h1>
            <p class="subtitle">Подача заявки на доступ</p>

            <form @submit.prevent="handleRegister">
                <div class="form-group">
                    <label>ФИО</label>
                    <input v-model="form.name" type="text" placeholder="Иванов Иван Иванович" required>
                </div>

                <div class="form-group">
                    <label>Email</label>
                    <input v-model="form.email" type="email" placeholder="student@dvfu.ru" required>
                </div>

                <div class="form-group">
                    <label>Пароль</label>
                    <input v-model="form.password" type="password" placeholder="••••••" required minlength="5">
                </div>

                <div class="form-group">
                    <label>Повторите пароль</label>
                    <input v-model="form.confirmPassword" type="password" placeholder="••••••" required>
                </div>

                <div v-if="errorMsg" class="error-message">
                    {{ errorMsg }}
                </div>

                <button type="submit" :disabled="isLoading">
                    {{ isLoading ? 'Отправка...' : 'Зарегистрироваться' }}
                </button>
            </form>

            <div class="footer-link">
                Уже есть аккаунт? <NuxtLink to="/login">Войти</NuxtLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.auth-container {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f2f5;
    font-family: 'Open Sans', sans-serif;
}

.auth-card {
    background: white;
    padding: 2.5rem;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    width: 100%;
    max-width: 400px;
    text-align: center;
}

h1 {
    margin-bottom: 0.5rem;
    color: #1a1a1a;
}

.subtitle {
    color: #666;
    margin-bottom: 2rem;
}

.form-group {
    margin-bottom: 1rem;
    text-align: left;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    font-weight: 600;
}

input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
}

button {
    width: 100%;
    padding: 12px;
    background-color: #10b981;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 10px;
}

button:hover {
    background-color: #059669;
}

button:disabled {
    background-color: #a7f3d0;
    cursor: not-allowed;
}

.error-message {
    color: #dc2626;
    background: #fef2f2;
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 1rem;
}

.footer-link {
    margin-top: 20px;
    font-size: 0.9rem;
}

.footer-link a {
    color: #3b82f6;
    text-decoration: none;
    font-weight: bold;
}
</style>