<template>
  <product-detail :is-edit="false" />
</template>
<script>
import ProductDetail from './components/ProductDetail'
export default {
  name: 'AddProduct',
  components: { ProductDetail }
}
</script>
<style>
</style>
