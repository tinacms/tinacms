<template>
  <main>
    <h1>{{ this.data?.data?.post?.title }}</h1>
    <pre>
        <!-- @ts-ignore -->
        {{ JSON.stringify(this.data, null, 2) }}
      </pre>
  </main>
</template>

<script lang="ts">
import { closeTinaConnection, getTinaUpdates } from 'tinacms/dist/tinaUpdate'
import { defineComponent } from 'vue'
import { client } from '../../.tina/__generated__/client'
import type { PostQuery, Exact } from '../../.tina/__generated__/types'

interface Data {
  data: PostQuery
  variables: Exact<{
    relativePath: string
  }>
  query: string
}

export default defineComponent<
  {},
  { fetchPost: () => Promise<void> },
  { data: Data; loading: boolean }
>({
  name: 'Home',
  data() {
    return {
      loading: false,
      data: null as unknown as Data,
      error: null,
    }
  },
  unmounted() {
    closeTinaConnection({ query: this.data.query })
  },
  mounted() {
    this.fetchPost().then(() => {
      getTinaUpdates({
        cb: (newData) => {
          this.$data.data = {
            ...this.$data.data,
            data: newData,
          }
        },
        data: this.data.data,
        query: this.data.query,
        variables: this.data.variables,
      })
    })
  },
  methods: {
    async fetchPost() {
      this.loading = true
      this.data = await client.queries.post({ relativePath: 'hello-world.md' })
    },
  },
})
</script>
