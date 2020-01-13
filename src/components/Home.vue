<template>
  <div>
    <el-button type="info" @click="tuichu">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    tuichu() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>
</style>
