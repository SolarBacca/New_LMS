<script setup lang="ts"></script>

<template>
    <div class="chat-window">
        <div class="input-dock">
            <input type="text" placeholder="Введите сообщение">
        </div>
    </div>
</template>

<style>
.chat-window {
    background-color: aliceblue;
    position: relative;
}

.input-dock {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 10%;
    background-color: rgb(19, 38, 74);
    display: flex;
}

.input-dock>input {
    background-color: transparent;
    outline: none;
    border: none;
    color: white;
    flex: 1;
    padding: 0 10px;
    font-size: 16px;
}

.input-dock>input::placeholder {
    color: white;
}
</style>