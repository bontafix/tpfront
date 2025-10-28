<template>
  <router-link :to="getPath(item)">
    <div class="student-card">
      <div class="student-card__header">
        <div class="flex gap-4" @click.stop>
          <div class="styled-checkbox" v-if="!isRepair">
            <input
              v-model="isSelected"
              type="checkbox"
              :id="'student' + item.id"
              @change="$emit('selected', isSelected)"
            />
            <label :for="'student' + item.id"></label>
          </div>
          <p class="subtitle">{{ item.student_name || item.name}}</p>
        </div>
        <div class="flex gap-4" v-if="!isRepair">
          <button
            class="student-card__header-button"
            @click.prevent.stop="$emit('edit', item)"
          >
            <img src="/src/assets/images/edit.svg" alt="Редактировать" />
          </button>
          <button
            class="student-card__header-button"
            @click.prevent.stop="deleteStudent(item)"
          >
            <img src="/src/assets/images/trash.svg" alt="Удалить" />
          </button>
        </div>
      </div>
      <div class="student-card__info">
        <slot name="info-items">
          <!-- Слот по умолчанию для info-items -->
          <div v-for="(item, key) in studentInfoItems" :key="key">
            <div class="student-card__info-item" v-if="item.title == 'Дз'">
              <p class="student-card__info-title">{{ item.title }}</p>
              <div class="status" :class="getHomeworkClass(item.value)">
                <span></span>{{ item.value }}
              </div>
            </div>
             <div class="student-card__info-item" v-else-if="item.title == 'Средств на счёте'">
              <p class="student-card__info-title">{{ item.title }}</p>
              <p class="student-card__info-text" :class="{ 'flex gap-2 items-center': item.icon }">
                <img v-if="item.icon" :src="item.icon" :alt="item.title" />
                <span :class="{'red-text': item.value < 0}">{{ item.value }}</span>
              </p>
            </div>
            <div class="student-card__info-item" v-else-if="item.title == 'Способ связи'">
               <p class="student-card__info-title">{{ item.title }}</p>
               <p class="student-card__info-text" v-if="!item?.icon?.icon">
                 <a
                    v-if="item.phone_number"
                    :href="getConnectLink(item)"
                    class="contact-link"
                    @click.stop="handlePhoneClick(item)"
                    target="_blank"
                    >
                    {{ item.phone_number }}  </a>
                    <template v-else>
                      -
                    </template>
               </p>
                <p class="student-card__info-title" v-else>
                  <img v-if="item.icon" :src="getIconPath(item.icon)" :alt="item.title" />
                  <a
                    :href="getConnectLink(item)"
                    class="contact-link"
                    @click.stop="handlePhoneClick(item)"
                    target="_blank"
                    >
                    {{ item.phone_number}}  </a
                  >
                </p>
            </div>
            <div class="student-card__info-item" v-else-if="item.title == 'Ставка'">
              <p class="student-card__info-title">{{ item.title }}</p>
               <p class="student-card__info-text" :class="{ 'flex gap-2 items-center': item.icon }" v-if="item.value || item.value === 0">
                <span> {{ item.value }} ₽ / {{ formatTimeRate(item.time_rate) }}</span>
              </p>
              <p v-else>
                -
              </p>
            </div>

            <div class="student-card__info-item" v-else-if="item.title == 'Баланс'">
              <p class="student-card__info-title">{{ item.title }}</p>
              <div class="status red" v-if="!item.value || item.value < 0">Отрицательный</div>
              <div class="status green" v-else>Положительный</div>
            </div>

             <div class="student-card__info-item" v-else-if="!item.value">
              <p class="student-card__info-title">{{ item.title }}</p>
              <p class="student-card__info-text" :class="{ 'flex gap-2 items-center': item.icon }">
                <span>-</span>
              </p>
            </div>
            <div class="student-card__info-item" v-else>
              <p class="student-card__info-title">{{ item.title }}</p>
              <p class="student-card__info-text" :class="{ 'flex gap-2 items-center': item.icon }">
                <!-- <img v-if="item.icon" :src="getIconPath(item.icon)" :alt="item.title" /> -->
                <span>{{ item.value }}</span>
              </p>
            </div>

          </div>
        </slot>
      </div>

      <div class="student-card__button">
        <button class="custom-btn light-blue mt-10" v-if="isRepair" @click.prevent="emit('repair', item.id)">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_9241_10005)">
              <path
                d="M13.3333 13.3332L9.99997 9.9999M9.99997 9.9999L6.66663 13.3332M9.99997 9.9999V17.4999M16.9916 15.3249C17.8044 14.8818 18.4465 14.1806 18.8165 13.3321C19.1866 12.4835 19.2635 11.5359 19.0351 10.6388C18.8068 9.7417 18.2862 8.94616 17.5555 8.37778C16.8248 7.80939 15.9257 7.50052 15 7.4999H13.95C13.6977 6.52427 13.2276 5.61852 12.5749 4.85073C11.9222 4.08295 11.104 3.47311 10.1817 3.06708C9.25943 2.66104 8.25709 2.46937 7.25006 2.50647C6.24304 2.54358 5.25752 2.80849 4.36761 3.28129C3.47771 3.7541 2.70656 4.42249 2.11215 5.23622C1.51774 6.04996 1.11554 6.98785 0.935783 7.9794C0.756025 8.97095 0.803388 9.99035 1.07431 10.961C1.34523 11.9316 1.83267 12.8281 2.49997 13.5832"
                stroke="#545F72"
                stroke-width="1.67"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_9241_10005">
                <rect width="20" height="20" fill="white" />
              </clipPath>
            </defs>
          </svg>

          Восстановить
        </button>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getHomeworkClass } from '@/utils'
import { formatTimeRate, domain } from '@/utils'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  infoItems: {
    type: Array,
    default: () => [],
  },
  isRepair: {
    type: Boolean,
    default: () => false,
  },
})


const getPath = (item) => {
  const routeName = item.student_count ? 'group' : 'student'
  return { name: routeName, params: { id: item.id } }
}

const emit = defineEmits(['selected', 'edit', 'delete', 'repair'])

const isSelected = ref(false)

const studentInfoItems = computed(() => {
  if (props.infoItems.length > 0) {
    return props.infoItems
  }

  return [
    {
      title: 'Способ связи',
      value: props.item.contact,
      phone_number: props.item.phone_number,
      type_connect: props.item.type_connect,
      icon: props.item.type_connect
    },
    {
      title: 'Ставка',
      value: props.item.rate,
      time_rate: props.item.time_rate,
    },
    {
      title: 'Средств на счёте',
      value: props.item.balance,
    },
    {
      title: 'Дз',
      value: props.item.homework_status,
    },
    {
      title: 'Комментарий',
      value: props.item.comment,
    },
  ]
})

const selectStudent = (value) => {
  isSelected.value = value
}

const deleteStudent = (item) => {
  if(!isSelected.value) {
    emit('delete', item)
  }
}

const getIconPath = (type_connect) => {
  if(type_connect && type_connect.icon)
    return `${domain}/${type_connect.icon}`
  return null
}

const getConnectLink = (item) =>{
  if(item && item.type_connect) {
      if(item['type_connect'].type_connect == 'Telegram') {
        return `https://t.me/${item['phone_number'].replace('@', '')}`
      }
      return `https://wa.me/${item['phone_number']}`
  } else {
    return `tel:${item['phone_number']}`
  }
}

const handlePhoneClick = () => {
  // Начинаем звонок по номеру
  window.location.href = getConnectLink()
}

defineExpose({
  selectStudent,
})
</script>
