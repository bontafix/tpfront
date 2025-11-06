<template>
  <v-custom-modal @submit="submitForm">
    <template #modal>
      <div class="v-add-students-modal">
        <h2 class="modal-title mb-4">Добавление ученика</h2>

        <form @submit.prevent="submitForm" class="modal-form" method="POST">
          <div class="modal-field col">
            <div class="modal-field__title">Имя ученика</div>
            <input class="custom-input" type="text" placeholder="Имя ученика" v-model="formData.student_name" />
          </div>
          <div class="modal-field col">
            <div class="modal-field__title">Источник</div>
            <input class="custom-input" type="text" placeholder="Источник" v-model="formData.source" />
          </div>
          <div class="modal-field col">
            <div class="modal-field__title">Цель занятий</div>
            <input class="custom-input" type="text" placeholder="Цель занятий" v-model="formData.goal" />
          </div>
          <div class="modal-field col">
            <div class="modal-field__title">Способ связи</div>
            <div class="modal-field__block connection-type">
              <input class="custom-input" type="text" placeholder="Номер телефона" v-model="formData.phone_number" />
              <v-styled-select :items="typeConnect" v-model="formData.type_connect"/>
            </div>
          </div>
          <div class="modal-field col">
            <div class="modal-field__title">Ставка</div>
            <div class="modal-field__block">
              <input class="custom-input" type="number" placeholder="сумма" v-model.number="formData.rate" />
              <v-styled-select :items="rateItems" v-model="formData.time_rate" />
              <v-styled-select :items="currencyItems" />
            </div>
          </div>
          <div class="modal-field col">
            <div class="modal-field__title">Комиссия, ₽</div>
            <input class="custom-input" type="number" placeholder="10" v-model.number="formData.commission" />
          </div>
          <div class="modal-field col">
            <div class="modal-field__title">Часовой пояс</div>
            <v-styled-select :items="timeZoneItems" v-model="formData.timezone_id" />
          </div>
        </form>
      </div>
    </template>
    <template #button>
      <button class="custom-btn blue" :class="{unactive: !formValid}"  @click="submitForm">Сохранить</button>
    </template>
  </v-custom-modal>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useStudentsStore } from '@/stores/studentsStore'

import vCustomModal from '@/components/generalComponents/v-custom-modal.vue'
import vStyledSelect from '@/components/generalComponents/v-styled-select.vue'
import { setStudentProfile } from '@/api/requests'

const store = useStudentsStore()

const typeConnect = computed(()=>{
  return store.typeConnect
})
const rateItems = store.rate
const currencyItems = store.currency
const timeZoneItems = computed(()=>{
  return store.timeZone
})

const formData = ref({
  type_connect_id: 0,
  type_connect: null,
  student_name: null,
  phone_number: null,
  parent_name: '',
  parent_phone_number: '',
  source: null,
  currency_id: 1,
  rate: null,
  timezone_id: 1,
  commission: 0,
  goal: '',
  balance: 0,
  subscription_lessons: 0,
  subscription_discount: 0,
  subscription_price: 0,
  is_subscription: false,
  trial: false,
  cost_lesson: 0,
  cost_lesson_one_time: 0,
  time_rate: 0
})

const requiredFields = [
  'student_name',
  'phone_number',
  'type_connect_id',
  'currency_id',
  'rate',
  'timezone_id'
]

const formValid = computed(() => {
  const isValid = requiredFields.every(field => {
    const value = formData.value[field];

    // Для ID-полей 0 - валидное значение
    if (field.endsWith('_id')) {
      return value !== null && value !== undefined;
    }

    // Для остальных - не null/undefined и не пустая строка
    return value !== null && value !== undefined && value !== '';
  });

  console.log('Form validation result:', isValid);
  return isValid;
});



const submitForm = async () => {
  const filtered = {...formData.value}
  console.log(filtered['timezone_id'])
  filtered['type_connect_id'] = filtered['type_connect'].id
  delete filtered.type_connect
  filtered['time_rate'] = filtered.time_rate.value
  filtered['timezone_id'] = filtered.timezone_id.id
  console.log('Submitted data:',filtered)
  await setStudentProfile(filtered)
}


const loadData = async () => {
  await store.setTypeConnects()
  await store.setTimezone()
}

onMounted(()=>{
  loadData()
})
</script>
