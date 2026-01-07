<template>
    <div class="layout-container">
        <AppHeader></AppHeader>
        <slot />
        <AppFooter></AppFooter>
    </div>
</template>

<style scoped>
.layout-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    overflow: hidden;
}
</style>