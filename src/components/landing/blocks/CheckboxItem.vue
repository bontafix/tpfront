<script setup lang="ts">
const props = defineProps<{
    description: string;
}>();
</script>

<template>
    <div class="checkbox">
        <div class="rounded-as-icon">
            <img class="ci" src="../../../assets/icons/checkbox.svg" alt="x">
        </div>
        <p class="func-desc inter-400">{{ description }}</p>
    </div>
</template>

<style lang="scss" scoped>
.checkbox {
    display: flex;
    flex-direction: row;
    margin-bottom: 10px;
}

.rounded-as-icon {
    height: 28px;
    width: 28px;
    margin-right: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;

    @media (max-width: 768px) {
        display: flex;
    }
}

.ci {
    width: 14px;
    height: 12.26px;
    display: block;
}

.func-desc {
    margin: 0;
    line-height: 1.5;
}
</style>
