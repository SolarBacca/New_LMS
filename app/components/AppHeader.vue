<script setup lang="ts">
import { useUser } from '~/composables/useUser';


const user = useUser();
const router = useRouter();

const handleLogout = async () => {
    try {
        await $fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
        console.error('Ошибка при выходе:', e);
    } finally {
        user.value = null;
        await router.push('/login');
    }
};

</script>

<template>
    <header>
        <div class="main-name">
            <img src="/logo.svg" alt="logo">
            <h1>
                <RouterLink style="text-decoration: none; color: inherit;" to="/">Платформа</RouterLink>
            </h1>
        </div>
        <nav v-if="user">
            <ul>
                <li class="admin-link" v-if="user.role === 'admin'">
                    <RouterLink to="/admin/users">Пользователи</RouterLink>
                </li>
                <li class="admin-link" v-if="user.role === 'admin'">
                    <RouterLink to="/admin/departments">Кафедры</RouterLink>
                </li>
                <li class="user-info">
                    {{ user.name }} <span class="role">({{ user.role }})</span>
                </li>
                <li><a @click="handleLogout" class="logout-btn">Выход</a></li>
            </ul>
        </nav>
    </header>
</template>

<style scoped>
header {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 10%;
    background: #fff;
    border-bottom: 1px solid #eee;
    color: #212b43;
}

.main-name {
    display: flex;
    align-items: center;
    gap: 15px;
}

.main-name h1 {
    font-weight: 600;
    font-size: 28px;
}

nav ul {
    display: flex;
    align-items: center;
    list-style-type: none;
    gap: 20px;
}

.user-info {
    font-size: 16px;
    font-weight: 500;
}

.role {
    font-size: 12px;
    color: #666;
    background: #eee;
    padding: 2px 6px;
    border-radius: 4px;
    vertical-align: middle;
}

.logout-btn {
    cursor: pointer;
    color: #dc2626;
    font-weight: 600;
    transition: color 0.2s;
}

.logout-btn:hover {
    color: #b91c1c;
    text-decoration: underline;
}

.admin-link * {
    font-weight: 500;
    color: rgb(175, 144, 29);
    text-decoration: none;
}
</style>