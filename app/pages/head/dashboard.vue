<script setup lang="ts">

const { data: myGroups, refresh: refreshGroups, error } = await useFetch<any>('/api/head/groups');
const { data: allSubjects, refresh: refreshSubjects } = await useFetch<any>('/api/head/subjects');

const { data: teachers } = await useFetch('/api/teachers');

const assignTeacherForm = reactive({
    teacherId: null as number | null,
    subjectId: null as number | null
});

const assignTeacher = async () => {
    if (!assignTeacherForm.teacherId || !assignTeacherForm.subjectId) return;

    try {
        await $fetch('/api/head/teachers', {
            method: 'POST',
            body: assignTeacherForm
        });
        alert('Преподаватель назначен!');
        assignTeacherForm.teacherId = null;
        assignTeacherForm.subjectId = null;
    } catch (e) {
        alert('Ошибка назначения');
    }
};

const newGroup = ref('');
const newSubject = ref('');


const selectedGroupId = ref<number | null>(null);
const selectedSubjectId = ref<number | null>(null);

const createGroup = async () => {
    if (!newGroup.value) return;
    await $fetch('/api/head/groups', {
        method: 'POST',
        body: { name: newGroup.value }
    });
    newGroup.value = '';
    refreshGroups();
};

const createSubject = async () => {
    if (!newSubject.value) return;
    await $fetch('/api/head/subjects', {
        method: 'POST',
        body: { name: newSubject.value }
    });
    newSubject.value = '';
    refreshSubjects();
};

const assignSubject = async () => {
    if (!selectedGroupId.value || !selectedSubjectId.value) return;

    const response = await $fetch<any>('/api/head/curriculum', {
        method: 'POST',
        body: {
            groupId: selectedGroupId.value,
            subjectId: selectedSubjectId.value
        }
    });

    if (response.success) alert('Предмет назначен!');
    else alert(response.message);

    selectedGroupId.value = null;
    selectedSubjectId.value = null;
};
</script>

<template>
    <div class="head-dashboard">
        <h1>Панель кафедры</h1>

        <div v-if="error" class="error">
            У вас нет прав для просмотра этой страницы.
        </div>

        <div v-else class="grid-layout">
            <div class="card">
                <h3>👥 Мои Группы</h3>
                <div class="add-box">
                    <input v-model="newGroup" placeholder="Новая группа (напр. Б9121)" @keydown.enter="createGroup">
                    <button @click="createGroup">+</button>
                </div>
                <ul>
                    <li v-for="g in myGroups" :key="g.id">
                        {{ g.name }}
                        <small class="count">({{ g.users.length }} студ.)</small>
                    </li>
                </ul>
            </div>

            <div class="card">
                <h3>📚 Дисциплины</h3>
                <div class="add-box">
                    <input v-model="newSubject" placeholder="Новый предмет" @keydown.enter="createSubject">
                    <button @click="createSubject">+</button>
                </div>
                <ul>
                    <li v-for="s in allSubjects" :key="s.id">{{ s.name }}</li>
                </ul>
            </div>

            <div class="card highlight-teacher">
                <h3>🎓 Нагрузка преподавателей</h3>
                <p class="hint">Кто какой предмет ведет</p>

                <div class="assign-form">
                    <label>Преподаватель:</label>
                    <select v-model="assignTeacherForm.teacherId">
                        <option :value="null">-- Выберите --</option>
                        <option v-for="t in teachers" :key="t.id" :value="t.id">{{ t.name }}</option>
                    </select>

                    <label>Предмет:</label>
                    <select v-model="assignTeacherForm.subjectId">
                        <option :value="null">-- Выберите --</option>
                        <option v-for="s in allSubjects" :key="s.id" :value="s.id">{{ s.name }}</option>
                    </select>

                    <button @click="assignTeacher" :disabled="!assignTeacherForm.teacherId">
                        Назначить
                    </button>
                </div>
            </div>

            <div class="card highlight">
                <h3>🔗 Назначить обучение</h3>
                <p class="hint">Выберите группу и предмет, который они будут изучать.</p>

                <div class="assign-form">
                    <label>Группа:</label>
                    <select v-model="selectedGroupId">
                        <option :value="null">-- Выберите --</option>
                        <option v-for="g in myGroups" :key="g.id" :value="g.id">{{ g.name }}</option>
                    </select>

                    <label>Предмет:</label>
                    <select v-model="selectedSubjectId">
                        <option :value="null">-- Выберите --</option>
                        <option v-for="s in allSubjects" :key="s.id" :value="s.id">{{ s.name }}</option>
                    </select>

                    <button @click="assignSubject" :disabled="!selectedGroupId || !selectedSubjectId">
                        Назначить
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.head-dashboard {
    padding: 2rem;
}

h1 {
    margin-bottom: 2rem;
}

.grid-layout {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}

.card {
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.highlight {
    border: 2px solid #dbeafe;
}

h3 {
    margin-bottom: 15px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
}

.add-box {
    display: flex;
    gap: 5px;
    margin-bottom: 15px;
}

.add-box input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 6px;
}

.add-box button {
    width: 32px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

ul {
    list-style: none;
    padding: 0;
    max-height: 300px;
    overflow-y: auto;
}

li {
    padding: 8px 0;
    border-bottom: 1px solid #f9f9f9;
}

.count {
    color: #888;
    font-size: 0.8rem;
}

.hint {
    font-size: 0.85rem;
    color: #666;
    margin-bottom: 15px;
}

.assign-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

select {
    padding: 10px;
    border-radius: 6px;
    border: 1px solid #ddd;
}

.assign-form button {
    margin-top: 10px;
    padding: 10px;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
}

.assign-form button:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.highlight-teacher {
    border: 2px solid #fcd34d;
}

.btn-teacher {
    background: #d97706 !important;
}
</style>