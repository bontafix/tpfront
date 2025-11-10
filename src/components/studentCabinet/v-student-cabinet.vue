<!-- v-student-cabinet.vue -->
<template>
  <div class="v-student-cabinet gray-page">
    <v-header-top/>
    <v-student-header
      :subjects="subjects"
      :maxSubjects="3"
      @subject-selected="onSubjectSelected"
      @new-subject-selected="onNewSubjectSelected"
    />

    <!-- Контент для существующих предметов -->
    <div class="v-student-cabinet__container container" v-if="currentView === 'subject' && subjects.length">
      <div class="v-student-cabinet__row">
        <v-teacher-info :info="currentSubject"/>
        <v-student-cabinet-swiper
          ref="studentCabinetSwiper"
          :student-id="studentId"
          :profile="currentSubject"
          @toggleModal="toggleModal"
          @current-homework-changed="onCurrentHomeworkChanged"
          :answer="filesAnswer"
          :current-homework-id="homeworkId"
        />
      </div>
      <v-student-charts :profile="currentSubject" @show-result="showResult"/>
      <v-studnet-calendar :current-subject="currentSubject" :subjects="subjects"/>
    </div>

    <div class="v-student-cabinet__container container" v-else>
      <h1 class="text-title">
        Отправьте эту ссылку вашему педагогу для регистрации и сопряжения аккаунтов
      </h1>
      <div class="v-student-cabinet__copy-link" @click="copyLink">
        <input type="text" class="custom-input" :value="link" readonly>
        <img src="/src/assets/images/copy.svg" alt="copy">
        <transition name="fade">
          <div class="copy-window" v-show="copyWindowOpen">Ссылка скопирована в буфер обмена</div>
        </transition>
      </div>
    </div>
  </div>

  <transition name="fade">
    <v-add-result-modal
      v-if="modals.resultModal"
      :readonly="true"
      :data="currentResultData"
      @close="toggleModal('resultModal')"
    />
  </transition>
  <transition name="fade">
    <v-answer-homework-modal
      v-if="modals.answerHomework"
      @close="toggleModal('answerHomework')"
      @submit-files="submitAnswer"
    />
  </transition>
  <transition name="fade">
    <v-edit-homework
      v-if="modals.editHomework"
      @close="toggleModal('editHomework')"
      :files="filesAnswer"
      @edit-files="updateFilesAnswer"
    />
  </transition>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import vTeacherInfo from './v-teacher-info.vue';
import vStudentHeader from './v-student-header.vue';
import vStudentCharts from './v-student-charts.vue';
import vStudnetCalendar from './v-studnet-calendar.vue';
import vHeaderTop from '../generalComponents/v-header-top.vue';
import vStudentCabinetSwiper from './v-student-cabinet-swiper.vue';
import vAddResultModal from '../modals/students/v-add-result-modal.vue';
import vEditHomework from '../modals/studentCabinet/v-edit-homework.vue';
import vAnswerHomeworkModal from '../modals/studentCabinet/v-answer-homework-modal.vue';

import { getStudentSubjects, getStudentSchedule, setStudentHomework } from '@/api/requests';
import { useMyStore } from '@/stores/myStore';

// Данные
const subjects = ref([]);

const modals = ref({
  answerHomework: false,
  editHomework: false,
  resultModal: false
});

const currentResultData = ref({})
const currentView = ref('subject');
const selectedSubject = ref(null);
const newSubjectName = ref('');
const copyWindowOpen = ref(false);
const link = ref('https://www.primeradress.ru');
const homeworkId = ref(null);
const filesAnswer = ref([]);
const studentCabinetSwiper = ref(null);

const debugMode = ref(true);

const currentSubject = computed(() => {
  return selectedSubject.value || subjects.value[0];
});

const store = useMyStore();
const studentId = computed(() => store.userInfo?.student_id);

// Обработчик смены текущего домашнего задания
const onCurrentHomeworkChanged = (newHomeworkId, lessonData = null) => {
  // Очищаем ответы только если действительно изменилось ДЗ
  if (homeworkId.value !== newHomeworkId) {
    const oldHomeworkId = homeworkId.value;
    homeworkId.value = newHomeworkId;

    // Если передан lessonData, пытаемся найти существующие ответы для нового ДЗ
    if (lessonData && newHomeworkId) {
      const homework = lessonData.homeworks?.find(hw => hw.id == newHomeworkId);
      if (homework && homework.student_answers && homework.student_answers.length > 0) {
        // Заполняем filesAnswer данными из API
        filesAnswer.value = transformAnswersForFilesAnswer(homework.student_answers);
        console.log('Загружены существующие ответы для ДЗ:', newHomeworkId, filesAnswer.value);
      } else {
        filesAnswer.value = []; // Очищаем если нет ответов
      }
    } else {
      filesAnswer.value = []; // Очищаем если нет данных
    }

    console.log('Текущее ДЗ изменилось с', oldHomeworkId, 'на', newHomeworkId);
  }
};

// Функция для преобразования ответов API в формат filesAnswer
const transformAnswersForFilesAnswer = (studentAnswers) => {
  console.log(studentAnswers)
  if (!studentAnswers) return [];
  return studentAnswers.map(file => ({
    id: file.id,
    name: file.file_name,
    size: file.file_size,
    file: file.file_path // или file.file_url в зависимости от API
  }));
};

// Обработчик обновления файлов из модального окна редактирования
const updateFilesAnswer =  async (updatedFiles) => {
  try {
    filesAnswer.value = updatedFiles;
    const formData = new FormData();
    
    // Фильтруем только новые файлы (объекты File), исключая существующие (строки URL)
    const newFiles = updatedFiles.filter(f => f.file instanceof File);
    
    if(updatedFiles.length === 0) {
      // Если пользователь удалил все файлы, отправляем пустую строку
      formData.append('files', '');
    } else if(newFiles.length > 0) {
      // Отправляем только новые файлы (объекты File)
      newFiles.forEach(f => {
        formData.append('files', f.file);
      });
    }
    // Если newFiles.length === 0, но updatedFiles.length > 0,
    // значит остались только существующие файлы (строки URL),
    // и мы не отправляем ничего, так как они уже на сервере
    
    await setStudentHomework(homeworkId.value, currentSubject.value.id, formData);
    console.log('Файлы успешно обновлены для ДЗ:', homeworkId.value);
    
    // Обновляем данные урока в swiper после успешного сохранения
    if (studentCabinetSwiper.value && studentCabinetSwiper.value.updateLessonHomeworkAnswers) {
      await studentCabinetSwiper.value.updateLessonHomeworkAnswers(homeworkId.value, updatedFiles);
    }
  } catch (error) {
    console.error('Ошибка обновления файлов:', error);
    // Показываем пользователю понятное сообщение об ошибке
    alert('Произошла ошибка при обновлении файлов. Попробуйте еще раз.');
    throw error; // Пробрасываем ошибку дальше
  }
};

const showResult = (resultData) => {
  toggleModal('resultModal')
  currentResultData.value = resultData
  console.log('Зашли в функцию', resultData)
}

const submitAnswer = async (files) => {
  if (!homeworkId.value) {
    console.error('Нет выбранного домашнего задания');
    return;
  }

  try {
    // Создаем FormData
    const formData = new FormData();

    console.log('Отправляемые файлы:', files);

    files.forEach(f => {
      formData.append('files', f.file);
    });

    await setStudentHomework(homeworkId.value, currentSubject.value.id, formData);

    filesAnswer.value = files;
    console.log('Ответ успешно отправлен для ДЗ:', homeworkId.value);

    // Закрываем модальное окно
    toggleModal('answerHomework');

  } catch (error) {
    console.error('Ошибка отправки ответа:', error);
  }
};

// Переключение модальных окон
const toggleModal = (modalName) => {
  modals.value[modalName] = !modals.value[modalName];
};

// Выбор предмета
const onSubjectSelected = (subject) => {
  selectedSubject.value = subject;
  currentView.value = 'subject';

  // Сбрасываем homeworkId при смене предмета
  homeworkId.value = null;
  filesAnswer.value = [];
};

// Выбор нового предмета
const onNewSubjectSelected = () => {
  currentView.value = 'new-subject';
  newSubjectName.value = '';
  homeworkId.value = null;
  filesAnswer.value = [];
};

// Копирование ссылки
const copyLink = async () => {
  await navigator.clipboard.writeText(link.value);
  copyWindowOpen.value = true;
  setTimeout(() => {
    copyWindowOpen.value = false;
  }, 3000);
};

// Загрузка данных
const loadData = async () => {
  try {
    await store.setUserInfo();
    let response = await getStudentSubjects();

    response = Array.from(
      new Map(response.map(item => [item.teacher_name, item])).values()
    );

    subjects.value = response;

    if (subjects.value.length > 0) {
      selectedSubject.value = subjects.value[0];
    }
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
</style>
