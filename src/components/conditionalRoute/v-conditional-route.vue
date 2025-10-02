<template>
  <div class="v-conditional-route">

  </div>
</template>
<script setup>
import { onMounted } from 'vue';


import emitter from '@/eventBus';
import { useRouter, useRoute } from 'vue-router';
import { useMyStore } from '@/stores/myStore';
import { linkProfileForApi } from '@/api/requests';

const router = useRouter()
const route = useRoute()

const store = useMyStore()

const loadData = async () => {
  await store.setUserAuthenticated()
  const authenticated = store.isAuth
  const ref = route.query.ref_code
  if(authenticated) {
    const data = {teacher_ref_code: ref}
    const response = await linkProfileForApi(data)
    if(response.data && !response.data.success) {
    console.log(response.data)

      emitter.emit({
        type: 'error',
        message: response.data.message
      })
    }
    router.push({name:'student_cabinet'})
  } else {
    router.push({name: 'register', query: {ref_code: ref}})
  }
}

onMounted(()=>{
  loadData()
})
</script>
