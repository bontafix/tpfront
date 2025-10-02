<template>
  <div class="v-student-header" :class="headerColor">
    <div class="container">
      <h1 class="v-student-header__title text-title">Ваши предметы</h1>
      <ul class="v-student-header__subjects">
        <li
          class="v-student-header__subject"
          :class="{ active: selectedSubject === subject.id, ...getSubjectColor(index) }"
          v-for="(subject, index) in subjects"
          :key="subject.id"
          @click="selectSubject(subject.id)"
        >
          <div class="subject">
            <div class="subject__title">{{ subject.subject }}</div>
          </div>
        </li>

        <transition name="slide-in" mode="out-in">
          <li
            class="v-student-header__subject"
            :class="{ active: selectedSubject === 'new' }"
            v-if="selectedSubject === 'new'"
            @click="selectSubject('new')"
            key="new-subject"
          >
            <div class="subject">
              <div class="subject__title">Новый предмет</div>
            </div>
          </li>
        </transition>

        <!-- Кнопка добавления предмета -->
        <transition name="slide-in" mode="out-in">
          <li
            class="v-student-header__subject"
            v-if="selectedSubject !== 'new' && subjects.length < maxSubjects"
            @click="selectSubject('new')"
            key="add-button"
          >
            <img src="/src/assets/images/add-subject.svg" alt="">
          </li>
        </transition>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  subjects: {
    type: Array,
    default: () => []
  },
  maxSubjects: {
    type: Number,
    default: 3
  }
});

const emit = defineEmits(['subject-selected', 'new-subject-selected']);

const selectedSubject = ref(null);

const setSelected = (subjectId) => {
  selectedSubject.value = subjectId;

  if (subjectId === 'new') {
    emit('new-subject-selected');
  } else {
    const subject = props.subjects.find(s => s.id === subjectId);
    if (subject) {
      emit('subject-selected', subject);
    }
  }
};

// При первом рендере выбрать первый предмет
if (props.subjects.length > 0) {
  setSelected(props.subjects[0].id);
}

watch(
  () => props.subjects,
  (newSubjects) => {
    if (!newSubjects.some(s => s.id === selectedSubject.value)) {
      if (newSubjects.length > 0) {
        setSelected(newSubjects[0].id);
      } else {
        selectedSubject.value = null;
      }
    }
  },
  { deep: true }
);

const selectSubject = (subjectId) => {
  setSelected(subjectId);
};

const getSubjectColor = (index) => {
  const colors = ['blue', 'green', 'orange'];
  const colorClass = colors[index % colors.length];
  return { [colorClass]: true };
}

const headerColor = computed(() => {
  return {
    blue: selectedSubject.value === props.subjects[0]?.id,
    green: selectedSubject.value === props.subjects[1]?.id,
    orange: selectedSubject.value === props.subjects[2]?.id,
  }
});

</script>
