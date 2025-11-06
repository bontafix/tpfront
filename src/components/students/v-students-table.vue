<template>
  <div ref="tableWrapper" class="scrolltable" :class="{ 'scrolling': isScrolling }">
    <table class="v-students-table">
      <thead class="v-students-table__head">
        <tr>
          <th v-for="col in columns" :key="col.key">
            <div class="v-students-table__head-item">
              <div v-if="col.key === 'group_name' || col.key === 'title' || col.key === 'student_name'" class="styled-checkbox">
                <input
                  type="checkbox"
                  id="all-field"
                  v-model="allField"
                  @input="() => toggleField('all')"
                />
                <label class="white-bg" for="all-field"></label>
              </div>

              {{ col.label }}
            </div>
          </th>
          <th>
            <div class="v-students-table__head-item">
            </div>
          </th>
        </tr>
      </thead>
      <tbody class="v-students-table__body">
        <tr class="v-students-table__body-row" v-for="item in items" :key="item.id">
          <td v-for="col in columns" :key="col.key">
             <div
                class="v-students-table__body-item"
                v-if="(item['type_connect'] || item['phone_number']) && col.key == 'contact'"
              >
                <template v-if="col.key === 'contact' && !item['phone_number']"> - {{ item['phone_number'] }} </template>
                <template v-else-if="col.key === 'contact'">
                  <img v-if="item['type_connect']?.icon" :src="getIconPath(item['type_connect']) " alt="">
                  <a
                    :href="getConnectLink(item)"
                    :class="{'contact-link' : item.type_connect?.icon, 'pl-8': !item.type_connect?.icon}"
                    @click.stop="handlePhoneClick(item)"
                    target="_blank"
                    >
                    {{ item['phone_number'] }}  </a
                  >
                </template>
              </div>
            <router-link :to="getPath(item)" v-else>
              <div
                class="v-students-table__body-item"
                :class="{ comment: col.key === 'comment' }"
                @click.stop
              >
                <template v-if="col.key === 'name' || col.key === 'title' || col.key === 'student_name'">
                  <div class="styled-checkbox">
                    <input
                      type="checkbox"
                      :id="col.key + '-' + item.id"
                      v-model="selectedStudents[item.id]"
                      @change="() => toggleField(item)"
                    />
                    <label :for="col.key + '-' + item.id"></label>
                  </div>
                </template>

                <template v-if="col.key === 'students_count'">
                 {{ item.students.length }}
                </template>

                <template v-else-if="col.key === 'homework_status'">
                  <div class="status" :class="getHomeworkClass(item[col.key])">
                    <span></span>{{ item['homework_status'] || 'Не задано' }}
                  </div>
                </template>

                <template v-else-if="col.key === 'rate'">
                  <div v-if="type !== 'groups' && item.rate">
                    {{ item[col.key] }} ₽ / {{ formatTimeRate(item['time_rate']) }}
                  </div>
                  <div v-else-if="type === 'groups'">
                    {{ item['time_rate'] || 0 }} ₽ / 1 час
                  </div>
                </template>


                <template v-else-if="col.key === 'balance'">
                   <div v-if="type === 'students'" :class="{'red-text' : item[col.key] < 0}">{{ item[col.key] }} ₽ </div>
                   <div v-else>
                    <div class="status red" v-if="!item['all_balances_positive']">
                      Отрицательный
                    </div>
                    <div class="status green" v-else>
                      Положительный
                    </div>
                   </div>

                </template>

                <template v-else-if="!item[col.key] && type != 'groups'"> - </template>
                <template v-else> {{ item[col.key] }}</template>
              </div>
            </router-link>

          </td>
          <td>
            <div class="v-students-table__body-item v-students-table__body-buttons">
              <img src="/src/assets/images/trash.svg" alt="Удалить" @click="() => deleteItem(item)" />
              <img
                src="/src/assets/images/edit.svg"
                alt="Редактировать"
                @click="() => editItem(item)"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useSelectedStudentsStore } from '@/stores/selectedStudentsStore'
import { useStudentsStore } from '@/stores/studentsStore'
import { getHomeworkClass, formatTimeRate, domain } from '@/utils'


const emit = defineEmits(['student-selected', 'toggle-modal', 'edit-item'])
const store = useSelectedStudentsStore()
const studentStore = useStudentsStore()

const allField = ref(false)
const editMode = ref(false)

const tableWrapper = ref(null)
const isScrolling = ref(false)

const props = defineProps({
  items: Array,
  type: String,
})

const selectedStudents = ref({})

// Определяем колонки в зависимости от типа
const columns = computed(() => {
  if (props.type === 'students') {
    return [
      { key: 'student_name', label: 'Имя' },
      { key: 'contact', label: 'Способ связи' },
      { key: 'rate', label: 'Ставка' },
      { key: 'balance', label: 'Средств на счёте' },
      { key: 'homework_status', label: 'Дз' },
      { key: 'comment', label: 'Комментарий', wrap: true },
    ]
  } else if (props.type === 'groups') {
    return [
      { key: 'name', label: 'Название' },
      { key: 'students_count', label: 'Количество учеников' },
      { key: 'rate', label: 'Ставка' },
      { key: 'balance', label: 'Баланс' },
      { key: 'homework_status', label: 'Дз' },
      { key: 'comment', label: 'Комментарий', wrap: true },
    ]
  }
  return []
})


const toggleField = (field) => {
  if (field === 'all') {
    for (const studentId in selectedStudents.value) {
      if(selectedStudents.value[studentId]) {
        selectedStudents.value[studentId] = !allField.value
      } else {
        selectedStudents.value[studentId] = true

      }
    }

    if (Object.values(selectedStudents.value)[0]) {
      store.setDeletedStudetns(props.items)
    } else {
      store.student = []
    }
  } else {
    if (!selectedStudents[field.id]) {
      selectedStudents[field.id] = true
      store.pushDeletedStudent(field)
    } else {
      store.removeDeletedStudent(field.id)
      selectedStudents[field.id] = !selectedStudents[field.id]
    }
  }
  editMode.value = Object.values(selectedStudents.value).some((value) => value)
  let student = field
  if (field === 'all') {
    student = props.items
  }
  emit('student-selected', editMode.value, student)
}

const handlePhoneClick = () => {
  // Начинаем звонок по номеру
  window.location.href = getConnectLink()
}

const getPath = (item) => {
  const routeName = props.type === 'groups' ? 'group' : 'student'
  return { name: routeName, params: { id: item.id } }
}

const deleteItem = (item) => {
  store.setDeletedStudent(item)
  emit('toggle-modal', 'deleteModal')
}

const getIconPath = (type_connect) => {
  if(type_connect && type_connect.icon)
    return `${domain}/${type_connect.icon}`
  return null
}

const getConnectLink = (item) =>{
  if(item['type_connect']) {
    console.log(item)
      if(item['type_connect'].type_connect == 'Telegram') {
        return `https://t.me/${item['phone_number'].replace('@', '')}`
      }
      return `https://wa.me/${item['phone_number']}`
  } else {
    return `tel:${item['phone_number']}`
  }
}

const editItem = (item) => {
  emit('edit-item', item)
}



const checkScroll = () => {
  if (!tableWrapper.value) return
  isScrolling.value = tableWrapper.value.scrollLeft > 0
}


const loadData = async () => {
  await studentStore.setTypeConnects()
}


onBeforeUnmount(() => {
  if (tableWrapper.value) {
    tableWrapper.value.removeEventListener('scroll', checkScroll)
  }
  loadData()
})

watch(
  () => props.items,
  (newItems, oldItems) => {
    if(Array.isArray(newItems)) {
      console.log(newItems)
      for (const student of newItems) {
        selectedStudents.value[student.id] = false
      }
    }

  }
)


onMounted(() => {
  if (tableWrapper.value) {
    tableWrapper.value.addEventListener('scroll', checkScroll)
  }
})

</script>
