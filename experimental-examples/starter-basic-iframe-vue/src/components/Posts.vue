<template>
  <main>
    <ul>
      <li v-for="post in data?.data?.postConnection?.edges || []">
        <router-link :to="`/posts/${post?.node?._sys.filename}`">
          {{ post?.node?.title }}
        </router-link>
      </li>
    </ul>
  </main>
</template>

<script lang="ts">
import type { Exact, PostConnectionQuery } from '.tina/__generated__/types'
import { client } from '../../.tina/__generated__/client'
import { defineComponent } from 'vue'
interface Data {
  data: PostConnectionQuery
  variables: {}
  query: string
}
export default defineComponent({
  name: 'Posts',
  mounted() {
    client.queries.postConnection().then((newData) => {
      this.$data.data = newData
    })
  },
  data() {
    return {
      loading: false,
      data: null as unknown as Data,
      error: null,
    }
  },
})
</script>
