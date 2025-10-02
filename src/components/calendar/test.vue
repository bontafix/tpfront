<template>
  <div>
    <table>
      <tr v-for="(row, i) in table" :key="row.id">
        <td
          draggable="true"
          :key="j"
          :data-row="i"
          :data-ceil="j"
          @drag.start="drag"
          @dragover.prevent
          @drop.stop="drop"
          v-for="(item, j) in row"
        >
          <div class="item" v-if="item">
            <div class="id">{{ item.id }}</div>
            <br />{{ item.name }}
          </div>
        </td>
      </tr>
    </table>
  </div>
</template>
<script>
import _ from 'lodash'
export default {
  name: 'v-test',
  props: [],
  data() {
    return {
      size: [8, 8],
      displayed: false,
      currentTarget: [],
      nextTarget: [],
      currentPosItem: {},
      items: [
        {
          id: 4,
          name: 'Queen',
          quantity: 4,
          position_x: 3,
          position_y: 2,
        },
        {
          id: 3,
          name: 'Queen',
          quantity: 1,
          position_x: 0,
          position_y: 0,
        },
      ],
    }
  },

  computed: {
    table: function () {
      const map = []
      for (let x = 0; x < this.size[0]; x++) {
        map.push(_.fill(Array(this.size[1]), null))
      }
      _.forEach(this.items, (item) => {
        if (item.position_x !== -1 && item.position_y !== -1)
          map[item.position_x][item.position_y] = item
        this.currentPosItem = item
        if (item.position_x !== -1 && item.position_y !== -1)
          map[item.position_x][item.position_y] = this.currentPosItem
      })
      return map
    },
  },
  methods: {
    drag(event) {
      let target = event.target
      let i = target.dataset.row
      let j = target.dataset.ceil
      this.currentTarget = [j, i]
      //if (cell.tagName != 'SPAN') return;
      let td = target.textContext
      console.log(td)
    },
    drop(event) {
      let target = event.target
      // console.log(cell);
      let m = target.parentNode.rowIndex
      let n = target.cellIndex
      this.nextTarget = [m, n]
      this.currentPosItem.position_x = m
      this.currentPosItem.position_y = n
      console.log(this.currentPosItem)
    },
  },
}
</script>

<style scoped>
table {
  width: auto;
}
td {
  width: 40px;
  height: 40px;
  border: 1px solid #000;
}

.id {
  background-color: yellow;
}
</style>

<!-- <template>
  <VueDatePicker
    v-model="selectedTime"
    :enable-time="true"
    :enable-seconds="false"
    :format="formatTime"
    :auto-apply="true"
    :hide-calendar="true"
    :locale="'ru-ru'"
  />
</template>

<script>
import { ref } from 'vue'

import '@vuepic/vue-datepicker/dist/main.css'
import VueDatePicker from '@vuepic/vue-datepicker'

export default {
  components: { VueDatePicker },
  setup() {
    const selectedTime = ref(null)

    const formatTime = (date) => {
      return new Intl.DateTimeFormat('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    }

    return {
      selectedTime,
      formatTime,
    }
  },
}
</script>
 -->
