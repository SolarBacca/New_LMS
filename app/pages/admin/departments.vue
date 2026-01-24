<script setup lang="ts">
const { data: departments, refresh, error } = await useFetch<any>('/api/admin/departments');

const { data: users } = await useFetch('/api/admin/users');


const form = reactive({
    name: '',
    headId: '' as string | number
});

const isSubmitting = ref(false);

const createDept = async () => {
    if (!form.name) return;
    isSubmitting.value = true;

    try {
        await $fetch('/api/admin/departments', {
            method: 'POST',
            body: {
                name: form.name,
                headId: form.headId ? Number(form.headId) : null
            }
        });

        form.name = '';
        form.headId = '';
        await refresh();
        alert('Кафедра создана!');
    } catch (e) {
        alert('Ошибка при создании');
    } finally {
        isSubmitting.value = false;
    }
};

const potentialHeads = computed(() => {
    return users.value?.filter(u => ['teacher', 'head'].includes(u.role)) || [];
});
</script>

<template>
    <div class="page-container">
        <h1>Структура ВУЗа (Кафедры)</h1>

        <div v-if="error" class="error">
            У вас нет прав для просмотра этой страницы.
        </div>

        <div v-else>

            <div class="card create-form">
                <h3>Новая кафедра</h3>
                <form @submit.prevent="createDept" class="form-row">
                    <input v-model="form.name" placeholder="Название (например, Кафедра ПИ)" required />

                    <select v-model="form.headId">
                        <option value="">-- Без заведующего --</option>
                        <option v-for="u in potentialHeads" :key="u.id" :value="u.id">
                            {{ u.name }} ({{ u.role }})
                        </option>
                    </select>

                    <button type="submit" :disabled="isSubmitting">
                        {{ isSubmitting ? 'Создаем...' : 'Добавить' }}
                    </button>
                </form>
            </div>

            <div class="card">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название кафедры</th>
                            <th>Заведующий</th>
                            <th>Групп</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="dept in departments" :key="dept.id">
                            <td>#{{ dept.id }}</td>
                            <td class="dept-name">{{ dept.name }}</td>
                            <td>
                                <div v-if="dept.head" class="head-info">
                                    <strong>{{ dept.head.name }}</strong>
                                    <small>{{ dept.head.email }}</small>
                                </div>
                                <span v-else class="text-muted">Вакансия</span>
                            </td>
                            <td>
                                <span class="badge">{{ dept.groups.length }}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    </div>
</template>

<style scoped>
.page-container {
    padding: 2rem;
}

h1 {
    margin-bottom: 20px;
}

.card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
}

.form-row {
    display: flex;
    gap: 10px;
    align-items: center;
}

input,
select {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
}

input {
    flex: 2;
}

select {
    flex: 1;
}

button {
    padding: 10px 20px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

button:disabled {
    background: #ccc;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #eee;
}

th {
    color: #666;
    font-size: 0.9rem;
}

.dept-name {
    font-weight: 600;
    font-size: 1.1rem;
}

.head-info {
    display: flex;
    flex-direction: column;
}

.head-info small {
    color: #888;
}

.text-muted {
    color: #ccc;
    font-style: italic;
}

.badge {
    background: #f3f4f6;
    padding: 4px 8px;
    border-radius: 10px;
    font-weight: bold;
    font-size: 0.8rem;
}
</style>