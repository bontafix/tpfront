<template>
  <div class="v-styled-select" ref="selectContainer" v-click-outside="closeDropdown">
    <div
      class="v-styled-select__field"
      :class="{ readonly: isReadonly }"
      @click="toggleDropdownMenu"
    >
      <div class="v-styled-select__value">
        <img
          src="/src/assets/images/studentIcon.svg"
          alt=""
          class="mr-2"
          v-if="props.studentIcon"
        />
        <div v-if="hasImage">
          <img :src="imageContent" alt="">
        </div>
        <div v-else-if="hasHtmlContent" v-html="displayValue"></div>
        <input
          v-if="!displayValue && !hasImage"
          class="dsd"
          type="text"
          readonly
          value="-"
        />
        <input
          v-if="displayValue"
          class=""
          type="text"
          :value="displayValue"
          readonly
        />
      </div>
      <div class="v-styled-select__image" :class="imageClass" v-show="!isReadonly">
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="#717680"
            stroke-width="1.66667"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>
    <transition name="fade">
      <ul
        class="v-styled-select__list"
        v-show="isDropdownMenu"
        ref="listRef"
        :style="dropdownStyle"
      >
        <li
          class="v-styled-select__list-item"
          v-for="(item, index) in items"
          :key="index"
          :class="{
            selected: !isMultiselect ? isSelected(item) : false,
          }"
          @click="!isMultiselect ? selectSingle(item) : null"
        >
          <template v-if="isMultiselect">
            <label class="checkbox-label" :for="'item-' + (item.id || index)">
              <div class="styled-checkbox">
                <input
                  type="checkbox"
                  :id="'item-' + (item.id || index)"
                  :checked="isSelected(item)"
                  @change="() => toggleItem(item)"
                />
                <label :for="'item-' + (item.id || index)"> </label>
              </div>
              <div v-if="item.icon" class="flex items-center gap-2">
                <img :src="getImageIcon(item.icon)" alt="" class="select-item-icon">
              </div>
              <span v-else-if="containsHtml(getItemDisplayText(item))" v-html="getItemDisplayText(item)"></span>
              <span v-else>
                {{ getItemDisplayText(item) }}
              </span>
            </label>
          </template>
          <template v-else>
            <div v-if="item.icon" class="flex items-center gap-2">
              <img :src="getImageIcon(item.icon)" alt="" class="select-item-icon">
              <span v-html="getItemDisplayText(item)"></span>
            </div>
            <span v-else-if="containsHtml(getItemDisplayText(item))" v-html="getItemDisplayText(item)"></span>
            <span v-else-if="getItemDisplayText(item)">
              {{ getItemDisplayText(item) }}
            </span>
            <span v-else>
              -
            </span>
          </template>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  value: {
    type: [Array, Object, String, Number],
    default: () => [],
  },
  isReadonly: {
    type: Boolean,
    default: false,
  },
  studentIcon: {
    type: Boolean,
    default: false,
  },
  isMultiselect: {
    type: Boolean,
    default: false,
  },
  defaultValue: {
    type: [Array, Object, String, Number],
    default: null,
  },
  position: {
    type: String,
    default: '',
    validator: val => ['', 'top'].includes(val)
  },
})

const domain = import.meta.env.VITE_API_URL
const emit = defineEmits(['update:modelValue'])
const isDropdownMenu = ref(false)
const selectContainer = ref(null)
const listRef = ref(null)
const shouldOpenUp = ref(false)
const selectedValues = ref([])

const getItemDisplayText = (item) => {
  if (item === null || item === undefined) return ''
  if (typeof item === 'string' || typeof item === 'number') return item
  if (item.name) return item.name
  if (item.student_name) return item.student_name
  if (item.text) return item.text
  return ''
}

const getItemId = (item) => {
  if (item === null || item === undefined) return null
  if (typeof item === 'object' && item.id !== undefined) return item.id
  return item
}

const containsHtml = (str) => {
  if (typeof str !== 'string') return false
  return /<[^>]*>/.test(str)
}

const getImageIcon = (icon) => {
  return `${domain}${icon}`
}

const hasImage = computed(() => {
  if (selectedValues.value.length === 0) {
    return props.items?.length > 0 && props.items[0].icon ? true : false
  }
  return selectedValues.value.some((item) => item && item.icon)
})

const imageContent = computed(() => {
  if (selectedValues.value.length === 0) {
    return props.items?.length > 0 && props.items[0].icon ? props.items[0].icon : ''
  }
  const imageItem = selectedValues.value.find((item) => item && item.icon)
  if (imageItem) return `${domain}${imageItem.icon}`
  return ''
})

const displayValue = computed(() => {
  if (selectedValues.value.length === 0) {
    return ''
  }
  return selectedValues.value
    .map((item) => getItemDisplayText(item))
    .join(', ')
})

const hasHtmlContent = computed(() => {
  if (selectedValues.value.length === 0) {
    const firstItem = props.items[0]
    if (!firstItem) return false
    return containsHtml(getItemDisplayText(firstItem))
  }
  return selectedValues.value.some((item) => containsHtml(getItemDisplayText(item)))
})

const dropdownStyle = computed(() => ({
  top: shouldOpenUp.value ? 'auto' : '100%',
  bottom: shouldOpenUp.value ? '100%' : 'auto',
  position: 'absolute',
  zIndex: 1000,
}))


const imageClass = computed(() => ({
  openUp: shouldOpenUp.value,
  open: isDropdownMenu.value,
}))

const isSelected = (item) => {
  const itemId = getItemId(item)
  return selectedValues.value.some((selectedItem) => {
    const selectedId = getItemId(selectedItem)
    if (itemId !== null && selectedId !== null) {
      return selectedId === itemId
    }
    return selectedItem === item
  })
}

const toggleItem = (item) => {
  const itemId = getItemId(item)
  const index = selectedValues.value.findIndex(
    (selectedItem) => getItemId(selectedItem) === itemId,
  )

  if (index >= 0) {
    selectedValues.value.splice(index, 1)
  } else {
    selectedValues.value.push(item)
  }

  emit('update:modelValue', [...selectedValues.value])
}

const selectSingle = (item) => {
  selectedValues.value = [item]
  emit('update:modelValue', item)
  isDropdownMenu.value = false
}

const initializeSelectedValues = () => {
  if (props.isMultiselect) {
    if (Array.isArray(props.defaultValue) && props.defaultValue.length > 0) {
      selectedValues.value = [...props.defaultValue]
      emit('update:modelValue', [...selectedValues.value])
    } else {
      selectedValues.value = []
    }
  } else {
    if (props.defaultValue !== null) {
      selectedValues.value = [props.defaultValue]
      emit('update:modelValue', props.defaultValue)
    } else if (props.items?.length > 0) {
      selectedValues.value = [props.items[0]]
      emit('update:modelValue', props.items[0])
    } else {
      selectedValues.value = []
    }
  }
}

const updateSelection = (newSelection) => {
  const currentSelection = props.isMultiselect ? selectedValues.value : selectedValues.value[0]
  if (JSON.stringify(currentSelection) === JSON.stringify(newSelection)) {
    return
  }

  if (props.isMultiselect) {
    selectedValues.value = Array.isArray(newSelection) ? [...newSelection] : []
  } else {
    selectedValues.value = newSelection ? [newSelection] : []
  }
}

const toggleDropdownMenu = async (event) => {
  event.stopPropagation()

  if (props.isReadonly) return
  isDropdownMenu.value = !isDropdownMenu.value
  if (isDropdownMenu.value) {
    await nextTick()
    updateDropdownPosition()
  }
}


const closeDropdown = () => {
  isDropdownMenu.value = false
}

const updateDropdownPosition = () => {
  if (props.position === 'top') {
    shouldOpenUp.value = true
    return
  }

  if (selectContainer.value && listRef.value) {
    const rect = selectContainer.value.getBoundingClientRect()
    const listHeight = listRef.value.scrollHeight

    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    shouldOpenUp.value = listHeight > spaceBelow && spaceAbove > spaceBelow
  }
}


onMounted(() => {
  window.addEventListener('resize', updateDropdownPosition)
  initializeSelectedValues()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDropdownPosition)
})

watch(
  () => props.items,
  (newItems) => {
    if (newItems && !props.isMultiselect) {
      if (props.defaultValue === null && selectedValues.value.length === 0 && newItems.length > 0) {
        selectedValues.value = [newItems[0]]
        emit('update:modelValue', newItems[0])
      }
    }
  },
  { immediate: true },
)

watch(
  () => props.defaultValue,
  (newVal, oldVal) => {
    if (JSON.stringify(newVal) === JSON.stringify(oldVal)) {
      return
    }

    if (props.isMultiselect) {
      if (Array.isArray(newVal)) {
        selectedValues.value = [...newVal]
      } else {
        selectedValues.value = []
      }
    } else {
      if (newVal !== null) {
        selectedValues.value = [newVal]
      } else if (selectedValues.value.length === 0 && props.items?.length > 0) {
        selectedValues.value = [props.items[0]]
        emit('update:modelValue', props.items[0])
      }
    }
  },
  { deep: true, immediate: true },
)

watch(
  () => props.isMultiselect,
  () => {
    initializeSelectedValues()
  },
)

defineExpose({
  selectSingle,
  updateSelection,
})
</script>

