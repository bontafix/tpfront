<template>
   <div class="v-notifications notifications-page">
    <div class="notifications-page__container container mb-2">
        <div class="notifications-page-header">
          <img src="/src/assets/images/arrow-long-left.svg" alt="" @click="goBack">
          <h2 class="notifications-page-title">Уведомления</h2>
          <div class="notifications" v-show="notifications.length > 0">
            {{ notifications.length}}
          </div>
        </div>
        <ul class="notifications-page-list">
          <li class="notifications-page-list-item" v-for="notification in notifications" :key="notification.id">
            <div class="notification">
              <p class="notification__title">
                <strong>{{ notification.teacher_name || notification.student_name }} : </strong>
                {{ notification.message }}
              </p>
              <p class="notification__date">
              {{ formatDate(notification.created_at) }}
              </p>
            </div>

            <div class="notification__delete" @click="deleteNotification(notification.id)">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 4.99984H4.16667M4.16667 4.99984H17.5M4.16667 4.99984V16.6665C4.16667 17.1085 4.34226 17.5325 4.65482 17.845C4.96738 18.1576 5.39131 18.3332 5.83333 18.3332H14.1667C14.6087 18.3332 15.0326 18.1576 15.3452 17.845C15.6577 17.5325 15.8333 17.1085 15.8333 16.6665V4.99984H4.16667ZM6.66667 4.99984V3.33317C6.66667 2.89114 6.84226 2.46722 7.15482 2.15466C7.46738 1.8421 7.89131 1.6665 8.33333 1.6665H11.6667C12.1087 1.6665 12.5326 1.8421 12.8452 2.15466C13.1577 2.46722 13.3333 2.89114 13.3333 3.33317V4.99984M8.33333 9.1665V14.1665M11.6667 9.1665V14.1665" stroke="#717680" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </li>
        </ul>
        <div class="custom-btn light-blue" @click="submitNotifications">
          <img src="/src/assets/images/telegram.svg" alt="">
          Подключить уведомления
        </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';

import { useRouter } from 'vue-router';

import { formatDate } from '@/utils.js'
import { useMyStore } from '@/stores/myStore';
import { getTeacherNotifications, getStudentNotifications, deleteTeacherNotifications } from '@/api/requests';

const store = useMyStore()

const notifications = ref([])

const userInfoByAPI = computed(()=>{
  return store.userInfo
})

const router = useRouter()

const goBack = () => {
  window.history.back()
}

const loadData = async () => {
  await store.setNotifications()
  await store.setUserInfo()
  await store.setMyInfo()
  notifications.value = store.notifications
}

const submitNotifications = () => {
  const link = 'http://t.me/teacherplanner_bot?start='
  const teacherId = store.info.teacher_id
  const studentId = store.userInfo.student_id
  if(!teacherId) {
    window.open(`${link}student_${studentId}`)
  } else {
    window.open(`${link}teacher_${teacherId}`)
  }
}

const deleteNotification = async (notification_id) => {
  await deleteTeacherNotifications(notification_id)

  notifications.value = notifications.value.filter((notification)=> notification.id != notification_id)
  console.log(notification_id, notifications.value)
}


onMounted(()=> [
  loadData()
])
</script>
