<template>
  <nav class="navbar small-content-block place-content-center bg-base-200">
    <!-- Navigation bar items -->
    <ul class="menu menu-horizontal place-content-center px-1 flex-grow">
      <component v-for="item in nodes" :is="item.component" v-bind="item.props" /> 
    </ul>

    <!-- Search bar -->
    <SiteSearchBar />

    <!-- Login button -->
    <!-- At the moment unnecessary here; re-add once user accounts can do more than just post comments -->
    <!-- <SiteGoogleLoginButton /> -->
  </nav>
</template>

<script setup lang="ts">
const navigationNodeComponentGetter = useNavigationNodeComponents()
const navigation = useNavigationBar()

const nodes = computed(() => {
  const nodes = []
  for (const item of navigation.value.root_nodes) {
    nodes.push(navigationNodeComponentGetter(item))
  }
  return nodes
})

</script>