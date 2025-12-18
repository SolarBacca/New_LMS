<template>
    <div class="container">
        <AppHeader></AppHeader>
        <slot />
        <AppFooter></AppFooter>
    </div>
</template>

<style>
.container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
</style>