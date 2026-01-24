<script setup lang="ts">
import { useUser } from '~/composables/useUser';

definePageMeta({
    layout: false,
});

const user = useUser();
const router = useRouter();

const form = reactive({
    email: '',
    password: ''
});

const errorMsg = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
    isLoading.value = true;
    errorMsg.value = '';

    try {
        const response = await $fetch<{
            id: number,
            name: string,
            role: string,
            email: string,
        }>('/api/auth/login', {
            method: 'POST',
            body: form
        });

        user.value = response;

        await router.push('/');

    } catch (e: any) {
        errorMsg.value = e.response?._data?.message || 'Ошибка входа';
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="login-container">
        <div class="login-card">
            <h1>Вход в систему</h1>
            <p class="subtitle">Информационный портал</p>

            <form @submit.prevent="handleLogin">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" v-model="form.email" placeholder="student@dvfu.ru" required>
                </div>

                <div class="form-group">
                    <label>Пароль</label>
                    <input type="password" v-model="form.password" placeholder="••••••" required>
                </div>

                <div v-if="errorMsg" class="error-message">
                    {{ errorMsg }}
                </div>

                <button type="submit" :disabled="isLoading">
                    {{ isLoading ? 'Входим...' : 'Войти' }}
                </button>
            </form>

            <div class="footer-link">
                Нет аккаунта? <NuxtLink to="/register">Подать заявку</NuxtLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.login-container {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f2f5;
    font-family: 'Open Sans', sans-serif;
}

.login-card {
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
    margin-bottom: 1.5rem;
    text-align: left;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: #333;
    font-weight: 600;
}

input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s;
}

input:focus {
    outline: none;
    border-color: #3b82f6;
}

button {
    width: 100%;
    padding: 12px;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

button:hover {
    background-color: #2563eb;
}

button:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
}

.error-message {
    color: #dc2626;
    background: #fef2f2;
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
}

.hint {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
    color: #888;
    font-size: 0.85rem;
}

.footer-link {
    margin-top: 15px;
    font-size: 0.9rem;
}

.footer-link a {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 600;
}

.footer-link a:hover {
    text-decoration: underline;
}
</style>