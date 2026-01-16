<script setup lang="ts">

// TODO: Надо поменять 'any' на нормальный интерфейс (мне лень) 
const { data: users, refresh, error } = await useFetch<any>('/api/admin/users');

const updateUser = async (user: any) => {
    try {
        await $fetch(`/api/admin/users/${user.id}`, {
            method: 'PUT',
            body: {
                role: user.role,
                isApproved: user.isApproved
            }
        });
    } catch (e) {
        alert('Ошибка при сохранении');
        console.error(e);
        await refresh();
    }
};

const roles = {
    admin: 'Администратор',
    head: 'Зав. кафедрой',
    teacher: 'Преподаватель',
    student: 'Студент'
};
</script>

<template>
    <div class="admin-page">
        <h1>Управление пользователями</h1>

        <div v-if="error" class="error">
            У вас нет прав для просмотра этой страницы.
        </div>

        <div v-else class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Имя</th>
                        <th>Email</th>
                        <th>Группа</th>
                        <th>Роль</th>
                        <th>Доступ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="u in users" :key="u.id" :class="{ 'not-approved': !u.isApproved }">
                        <td>
                            <div class="user-name">{{ u.name }}</div>
                            <small class="date">Рег: {{ new Date(u.createdAt).toLocaleDateString() }}</small>
                        </td>
                        <td>{{ u.email }}</td>
                        <td>
                            <span v-if="u.group" class="badge-group">{{ u.group.name }}</span>
                            <span v-else class="text-muted">-</span>
                        </td>
                        <td>
                            <select v-model="u.role" @change="updateUser(u)">
                                <option v-for="(label, key) in roles" :key="key" :value="key">
                                    {{ label }}
                                </option>
                            </select>
                        </td>
                        <td>
                            <label class="switch">
                                <input type="checkbox" v-model="u.isApproved" @change="updateUser(u)">
                                <span class="slider round"></span>
                            </label>
                            <span class="status-label">
                                {{ u.isApproved ? 'Одобрен' : 'Ждет' }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
.admin-page {
    padding: 2rem;
    height: 100%;
    overflow-y: auto;
}

h1 {
    margin-bottom: 20px;
}

.table-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
}

th {
    background: #f8f9fa;
    font-weight: 600;
    color: #444;
}

tr:hover {
    background: #f1f5f9;
}

tr.not-approved {
    background: #fff5f5;
}

.user-name {
    font-weight: 500;
}

.date {
    color: #888;
    font-size: 0.8rem;
}

.text-muted {
    color: #ccc;
}

.badge-group {
    background: #e0f2fe;
    color: #0369a1;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.85rem;
}

select {
    padding: 6px;
    border-radius: 4px;
    border: 1px solid #ddd;
}

.switch {
    position: relative;
    display: inline-block;
    width: 34px;
    height: 20px;
    vertical-align: middle;
    margin-right: 10px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 34px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 14px;
    width: 14px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
}

input:checked+.slider {
    background-color: #22c55e;
}

input:checked+.slider:before {
    transform: translateX(14px);
}

.status-label {
    font-size: 0.85rem;
    color: #666;
}
</style>