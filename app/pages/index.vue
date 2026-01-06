<script setup lang="ts">

const { data: topics, status } = await useFetch('/api/topics');

const selectedTopicId = ref<number | null>(null);

function selectTopic(id: number) {
    selectedTopicId.value = id;
}

</script>

<template>
    <main>
        <div class="list">
            <div v-if="status === 'pending'">Загрузка тем...</div>
            <div v-else class="topics-container">
                <div v-for="topic in topics" :key="topic.id" class="topic-item"
                    :class="{ active: selectedTopicId === topic.id }" @click="selectTopic(topic.id)">
                    <h3>{{ topic.title }}</h3>
                    <p class="topic-meta">{{ topic.subject.name }}</p>
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
</style>