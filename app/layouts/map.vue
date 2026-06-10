<template>
  <div class="grid-cols-[1fr_440px] grid h-screen gap-0">
    <div class="relative bg-black">
      <slot name="map" />
    </div>

    <div class="drop-shadow-md">
      <div class="overflow-scroll h-screen">
        <slot name="aside" />
      </div>
    </div>
  </div>
</template>
