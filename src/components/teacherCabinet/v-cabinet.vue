<template>
  <v-base>
    <div class="v-cabinet">
      <div class="container">
        <div class="v-cabinet__container layout">
          <h1 class="v-cabinet__title text-title">
            Личный кабинет ученика
          </h1>
          <nav class="v-cabinet__nav flex gap-12 my-7">
            <div class="styled-nav" :class="{active: activeSection === 'info'}" @click="() => setActiveSection('info')">
              Информация о профиле
            </div>
            <!-- <div class="styled-nav" :class="{active: activeSection === 'subscribe'}" @click="() => setActiveSection('subscribe')">
              Подписка
            </div> -->
          </nav>
          <div class="v-cabinet__block" v-show="activeSection === 'info'">
            <v-profile-info :subjects="subjects" :student-info="userInfo"/>
            <v-profile-info-right :email="userInfo?.email" @toggle-modal="toggleModal"/>
          </div>
          <div class="v-cabinet__block" v-show="activeSection === 'subscribe'">
            <v-subscription />
          </div>
        </div>
      </div>
    </div>
  </v-base>
  <transition name="fade">
    <v-delete-cabinet v-show="modals.deleteCabinet" @close="toggleModal('deleteCabinet')" :class="{'modal-open': modals.deleteCabinet}"/>
  </transition>
  <!-- <transition name="fade">
    <v-change-password v-if="modals.changePassword" @close="toggleModal('changePassword')" @toggle-modal="toggleModal"/>
  </transition> -->
  <transition name="fade">
    <v-change-password v-show="modals.changePassword" @close="toggleModal('changePassword')" @toggle-modal="toggleModal" :secondary-mode="true" :class="{'modal-open': modals.changePassword}"/>
  </transition>

  <transition name="fade">
    <v-repair-password v-show="modals.repairPassword" @close="toggleModal('repairPassword')" @toggle-modal="toggleModal" :class="{'modal-open': modals.repairPassword}"/>
  </transition>
  <transition name="fade">
    <v-change-email v-show="modals.changeEmail" @close="toggleModal('changeEmail')" :class="{'modal-open': modals.changeEmail}" @toggle-modal="toggleModal"/>
  </transition>
   <transition name="fade">
    <v-password-saved v-show="modals.passwordSaved" @close="toggleModal('passwordSaved')" :class="{'modal-open': modals.passwordSaved}" />
  </transition>
</template>
<script setup>
import { onMounted, ref, computed } from 'vue';

import { useMyStore } from '@/stores/myStore';

import vBase from '../v-base.vue';
import vProfileInfo from './v-profile-info.vue';
import vSubscription from './v-subscription.vue';
import vProfileInfoRight from './v-profile-info-right.vue';

import vChangeEmail from '../modals/teacherCabinet/v-change-email.vue';
import vDeleteCabinet from '../modals/teacherCabinet/v-delete-cabinet.vue';
import vPasswordSaved from '../modals/teacherCabinet/v-password-saved.vue';
import vChangePassword from '../modals/teacherCabinet/v-change-password.vue';
import vRepairPassword from '../modals/teacherCabinet/v-repair-password.vue';

const activeSection = ref('info')

const store = useMyStore()

const modals = ref({
  deleteCabinet: false,
  changePassword: false,
  passwordSaved: false,
  repairPassword: false,
  changeEmail: false,
})

const userInfo = computed(()=>{
  return store.info
})

const subjects = computed(()=>{
  return store.subjects
})

const setActiveSection = (section) => {
  activeSection.value = section
}

const toggleModal = (modal) =>{
  modals.value[modal] = !modals.value[modal]
}

const loadData = async () => {
  await store.setMyInfo()
  console.log(userInfo.value)
}

onMounted(()=>{
  loadData()
})
</script>

