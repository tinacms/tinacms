<template>
  <main>
    <h1>{{ data?.data?.post.title }}</h1>
    <pre>
        <!-- @ts-ignore -->
        {{ JSON.stringify(data?.data?.post?.body, null, 2) }}
      </pre>
  </main>
</template>

<script lang="ts">
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
  { fetchPost: () => Promise<void>; setUpWatchData: () => void },
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
  mounted() {
    this.fetchPost().then(() => {
      this.setUpWatchData()
    })
  },
  methods: {
    async fetchPost() {
      this.loading = true
      this.data = await client.queries.post({
        relativePath: this.$route.params.id + '.md',
      })
    },
    setUpWatchData() {
      const id = btoa(JSON.stringify({ query: this.data.query }))
      parent.postMessage(
        JSON.parse(
          JSON.stringify({
            type: 'open',
            id,
            data: this.data.data,
            query: this.data.query,
            variables: this.data.variables,
          })
        ),
        window.location.origin
      )
      window.addEventListener('message', (event) => {
        console.log('child received message', event)
        if (event.data.id === id) {
          console.log('child: event received')
          this.data = { ...this.data, ...event.data }
        }
      })
    },
  },
})
</script>
