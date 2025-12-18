<script setup lang="ts">

</script>

<template>
    <header>
        <div class="main-name">
            <img src="/logo.svg" alt="logo">
            <h1>Платформа</h1>
        </div>
        <nav>
            <ul>
                <li><a>Выход</a></li>
            </ul>
        </nav>
    </header>
</template>

<style>
header {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 10%;
    cursor: pointer;
    user-select: none;
    color: #212b43;
}

.main-name {
    display: flex;
    gap: 10px;
}

.main-name img {
    width: 4rem;
}

.main-name h1 {
    font-weight: 600;
    font-size: 40px;
}

nav ul {
    display: flex;
    align-items: center;
    list-style-type: none;
    overflow: hidden;
}

nav ul li {
    margin: 0 10px;
    font-size: 22px;
}

nav ul li a:hover {
    color: red;
}
</style>