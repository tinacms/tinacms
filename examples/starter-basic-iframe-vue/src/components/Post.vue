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

import { closeTinaConnection, getTinaUpdates } from 'tinacms/dist/tinaUpdate'

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
  name: 'Post',
  data() {
    return {
      loading: false,
      data: null as unknown as Data,
      error: null,
    }
  },
  created() {
    // watch the params of the route to fetch the data again
    this.$watch(
      () => this.$route.params,
      () => {
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
      // fetch the data when the view is created and the data is
      // already being observed
      { immediate: true }
    )
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
      this.data = await client.queries.post({
        relativePath: this.$route.params.id + '.md',
      })
    },
  },
})
</script>
