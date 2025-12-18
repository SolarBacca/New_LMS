<script setup lang="ts">

</script>

<template>
    <div class="container">
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </div>
</template>

<style>
@font-face {
    font-family: "Open Sans";
    src: url("assets/fonts/OpenSans-VariableFont_wdth,wght.ttf");
}

*,
*::before,
*::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.container {
    width: 100vw;
    height: 100vh;
    font-family: 'Open Sans', sans-serif;
}
</style>