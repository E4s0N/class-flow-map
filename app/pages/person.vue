<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
    <UPageCard
      v-for="person in allPeople"
      :key="person.name"
      :title="person.name"
      orientation="vertical"
      class="text-center"
    >
      <img :src="person.avatar" :alt="person.name" class="w-24 h-24 mx-auto rounded-full object-cover" />
    </UPageCard>
  </div>
</template>

<script setup>
import peopleData from '@/assets/json/provincePeopleData.json'

const allPeople = peopleData.flatMap(province => province.people)
</script>
