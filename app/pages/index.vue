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

const chatRefreshTrigger = ref(0);

let eventSource: EventSource | null = null;

onMounted(() => {
    eventSource = new EventSource('/api/stream');

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'new_message') {
            if (selectedTopicId.value === data.topicId) {
                chatRefreshTrigger.value++;
            }
            refresh();
        }
    };

    eventSource.onerror = () => {
        // Maybe do something here..
    };
});

onUnmounted(() => {
    if (eventSource) {
        eventSource.close();
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
            <div v-if="status === 'pending' && !data">Загрузка тем...</div>
            <div v-else class="topics-container" :class="{ 'refreshing': status === 'pending' }">

                <div class="actions-bar" v-if="user && ['teacher', 'head', 'admin'].includes(user.role)">
                    <button @click="showCreateModal = true" class="create-btn">
                        + Новая тема
                    </button>
                </div>

                <Transition name="modal">
                    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
                        <div class="modal-card">
                            <div class="modal-header">
                                <h3>Создание лекции</h3>
                                <button class="close-icon" @click="showCreateModal = false">×</button>
                            </div>

                            <form @submit.prevent="createTopic">
                                <div class="form-group">
                                    <label>Предмет</label>
                                    <div class="select-wrapper">
                                        <select v-model="newTopic.subjectId" required>
                                            <option :value="null" disabled>Выберите предмет...</option>
                                            <option v-for="s in availableSubjects" :key="s.id" :value="s.id">
                                                {{ s.name }}
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label>Название темы</label>
                                    <input v-model="newTopic.title" placeholder="Например: Введение в алгоритмы"
                                        required class="input-field">
                                </div>

                                <div class="form-group">
                                    <label>Краткое содержание</label>
                                    <textarea v-model="newTopic.content" placeholder="Опишите, что будет на лекции..."
                                        rows="4" class="input-field"></textarea>
                                </div>

                                <div class="modal-actions">
                                    <button type="button" class="btn-secondary" @click="showCreateModal = false">
                                        Отмена
                                    </button>
                                    <button type="submit" class="btn-primary">
                                        Создать тему
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Transition>

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

        <AppChat :refresh-signal="chatRefreshTrigger" :topic-id="selectedTopicId" :key="selectedTopicId || 'empty'">
        </AppChat>

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

.topics-container.refreshing {
    opacity: 0.7;
    pointer-events: none;
    transition: opacity 0.2s;
}

.loading-state,
.empty-list {
    padding: 20px;
    text-align: center;
    color: #888;
}

.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
    transition: transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

.modal-enter-from .modal-card,
.modal-leave-to .modal-card {
    transform: scale(0.9) translateY(10px);
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.modal-card {
    background: white;
    width: 100%;
    max-width: 480px;
    border-radius: 16px;
    padding: 24px 32px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: #111827;
}

.close-icon {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #9ca3af;
    padding: 0;
    line-height: 1;
}

.close-icon:hover {
    color: #374151;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
}

.input-field,
select {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.95rem;
    color: #1f2937;
    background-color: #fff;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.input-field:focus,
select:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    /* Сияние при фокусе */
}

textarea.input-field {
    resize: vertical;
    min-height: 80px;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 10px;
}

.btn-primary,
.btn-secondary {
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    font-size: 0.9rem;
    border: none;
    transition: background-color 0.2s;
}

.btn-primary {
    background-color: #2563eb;
    color: white;
}

.btn-primary:hover {
    background-color: #1d4ed8;
}

.btn-secondary {
    background-color: transparent;
    color: #4b5563;
}

.btn-secondary:hover {
    background-color: #f3f4f6;
}
</style>