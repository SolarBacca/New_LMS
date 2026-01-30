<script setup lang="ts">

const { data, refresh, status } = await useFetch('/api/topics', {
    transform: (response) => {
        const readsMap = new Map();
        response.reads.forEach(r => readsMap.set(r.topicId, new Date(r.lastReadAt)));

        return response.topics.map(topic => {
            const lastRead = readsMap.get(topic.id);
            const lastUpdate = new Date(topic.updatedAt);

            const isUnread = !lastRead || lastUpdate > lastRead;

            return {
                ...topic,
                isUnread
            };
        });
    }
});

const selectTopic = async (topicId: number) => {
    selectedTopicId.value = topicId;

    if (data.value) {
        const t = data.value.find(t => t.id === topicId);
        if (t) t.isUnread = false;
    }

    await $fetch<any>('/api/topics/read', {
        method: 'POST',
        body: { topicId }
    });
};

const selectedTopicId = ref<number | null>(null);

const user = useUser();

const { data: mySubjects } = await useFetch<any>('/api/teacher/my-subjects', {
    lazy: true,
    server: false
});

const showCreateModal = ref(false);
const newTopic = reactive({
    title: '',
    content: '',
    subjectId: null as number | null
});


const availableSubjects = computed(() => mySubjects.value || []);

async function createTopic() {
    if (!newTopic.title || !newTopic.subjectId) return;

    try {
        const created = await $fetch<any>('/api/topics', {
            method: 'POST',
            body: newTopic
        });

        showCreateModal.value = false;
        newTopic.title = '';
        newTopic.content = '';

        await refresh();

        selectTopic(created.id);
    } catch (e: any) {
        alert(e.response?._data?.message || 'Ошибка создания');
    }
}

</script>

<template>
    <main>
        <div class="list">
            <div v-if="status === 'pending'">Загрузка тем...</div>
            <div v-else class="topics-container">

                <div class="actions-bar" v-if="user && ['teacher', 'head', 'admin'].includes(user.role)">
                    <button @click="showCreateModal = true" class="create-btn">
                        + Новая тема
                    </button>
                </div>

                <div v-if="showCreateModal" class="modal-overlay">
                    <div class="modal">
                        <h3>Создание темы</h3>
                        <form @submit.prevent="createTopic">
                            <label>Предмет:</label>
                            <select v-model="newTopic.subjectId" required>
                                <option :value="null">-- Выберите предмет --</option>
                                <option v-for="s in availableSubjects" :key="s.id" :value="s.id">
                                    {{ s.name }}
                                </option>
                            </select>

                            <label>Название:</label>
                            <input v-model="newTopic.title" placeholder="Лекция №..." required>

                            <label>Материал (описание):</label>
                            <textarea v-model="newTopic.content" placeholder="Краткое содержание..."
                                rows="3"></textarea>

                            <div class="modal-actions">
                                <button type="button" @click="showCreateModal = false">Отмена</button>
                                <button type="submit" class="primary">Создать</button>
                            </div>
                        </form>
                    </div>
                </div>

                <div v-for="topic in data" :key="topic.id" class="topic-item"
                    :class="{ 'active': selectedTopicId === topic.id, 'unread': topic.isUnread }"
                    @click="selectTopic(topic.id)">
                    <div class="topic-header">
                        <span class="topic-subject">{{ topic.subject.name }}</span>
                        <span v-if="topic.isUnread" class="unread-dot">●</span>
                    </div>
                    <div class="topic-title">{{ topic.title }}</div>
                </div>
            </div>
        </div>

        <AppChat :topic-id="selectedTopicId" :key="selectedTopicId || 'empty'"></AppChat>

    </main>
</template>

<style>
main {
    flex: 1;
    display: grid;
    grid-template-columns: 30% 1fr;
    height: 100%;
    overflow: hidden;
}

.list {
    border-right: 1px solid #ddd;
    overflow-y: auto;
    background: #f8f9fa;
}

.topic-item {
    padding: 15px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: background 0.2s;
}

.topic-item:hover {
    background-color: #e9ecef;
}

.topic-item.active {
    background-color: #dbeafe;
    border-left: 4px solid #3b82f6;
}

.topic-meta {
    font-size: 0.85rem;
    color: #666;
    margin-top: 5px;
}

.actions-bar {
    padding: 10px;
    border-bottom: 1px solid #eee;
    text-align: center;
}

.create-btn {
    width: 100%;
    padding: 8px;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

.create-btn:hover {
    background-color: #2563eb;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    background: white;
    padding: 20px;
    border-radius: 12px;
    width: 400px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.modal textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 6px;
    resize: vertical;
}

.modal-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
}

.primary {
    background-color: #3b82f6;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 6px;
    cursor: pointer;
}

.topic-item.unread .topic-title {
    font-weight: bold;
    color: #000;
}

.unread-dot {
    color: #ef4444;
    font-size: 1.2rem;
    line-height: 0.5;
}

.topic-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>