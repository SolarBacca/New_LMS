<script setup lang="ts">

interface Message {
    id: number;
    content: string;
    createdAt: string;
    user: {
        name: string;
        role: string;
    };
}

interface TopicDetail {
    id: number;
    title: string;
    content: string | null;
    createdAt: string;
    author: {
        name: string;
        role: string;
    } | null;
    messages: Message[];
}

const props = defineProps<{
    topicId: number | null
}>();

const url = computed(() => props.topicId ? `/api/topics/${props.topicId}` : '');

const { data: topicData, status, error } = await useFetch<TopicDetail>(url, {
    immediate: !!props.topicId,
    watch: [url]
})

</script>

<template>
    <div class="chat-window">

        <div v-if="!topicId" class="empty-state">
            <p>Выберите тему слева, чтобы начать обсуждение</p>
        </div>

        <div v-else-if="error" class="error-state">
            <p style="color: red;">Ошибка загрузки: {{ error.message }}</p>
        </div>

        <div v-else-if="status === 'pending'" class="loading">
            <p>Загрузка сообщений...</p>
        </div>

        <div v-else-if="topicData">
            <div class="header">
                <h2>{{ topicData.title }}</h2>
                <p>Преподаватель: {{ topicData.author?.name }}</p>
            </div>

            <div class="messages-list">
                <div class="message system-message">
                    <strong>Материал:</strong> {{ topicData.content }}
                </div>

                <div v-for="msg in topicData.messages" :key="msg.id" class="message" :class="{ 'my-message': false }">
                    <div class="msg-author">{{ msg.user.name }}</div>
                    <div class="msg-content">{{ msg.content }}</div>
                    <div class="msg-time">
                        {{ new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                    </div>
                </div>

            </div>

        </div>

        <div class="input-dock" v-if="topicData">
            <input type="text" placeholder="Введите сообщение...">
        </div>
    </div>
</template>

<style>
.chat-window {
    background-color: aliceblue;
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.messages-container {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 60px;
}

.messages-list {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.header {
    background: white;
    padding: 15px;
    border-bottom: 1px solid #eee;
}

.empty-state,
.loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #888;
}

.message {
    background: white;
    padding: 10px 15px;
    border-radius: 12px;
    max-width: 70%;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.system-message {
    background: #fff3cd;
    align-self: center;
    max-width: 90%;
}

.msg-author {
    font-size: 0.8rem;
    font-weight: bold;
    color: #555;
    margin-bottom: 4px;
}

.msg-time {
    font-size: 0.7rem;
    color: #aaa;
    text-align: right;
    margin-top: 5px;
}

.input-dock {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 60px;
    background-color: rgb(19, 38, 74);
    display: flex;
}

.input-dock>input {
    background-color: transparent;
    outline: none;
    border: none;
    color: white;
    flex: 1;
    padding: 0 15px;
    font-size: 16px;
}

.input-dock>input::placeholder {
    color: rgba(255, 255, 255, 0.7);
}
</style>