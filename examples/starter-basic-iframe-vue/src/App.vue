<template>
  <main>{{ JSON.stringify({ post: this.data }) }}</main>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      data: null,
      error: null,
    }
  },
  mounted() {
    this.fetchPost()
  },
  methods: {
    fetchPost() {
      this.error = this.data = null
      this.loading = true
      setTimeout(() => {
        this.data = { foo: 'bar' }
        this.loading = false
      }, 1000)
    },
  },
}
</script>
