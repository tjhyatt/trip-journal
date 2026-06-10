<script setup>
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
// import * as turf from "@turf/turf";
// import { pointsWithinPolygon } from "@turf/turf";
// import geojson from "@/assets/LGA_GDA2020_filtered.json";

// import { useMapStore } from "@/stores/map";

// const mapStore = useMapStore();
// const route = useRoute();
// const router = useRouter();

let map = null;

onMounted(async () => {
  map = new maplibregl.Map({
    container: "map",
    // style: "https://tiles.openfreemap.org/styles/liberty",
    style: "../style.json",
    center: [138.59863, -34.92866],
    zoom: 14,
    maxZoom: 18,
    minZoom: 5,
    // maxBounds: [
    //   [138.2, -35.5], // west, south
    //   [139, -34.4], // east, north
    // ],
  });

  map.on("load", () => {
    console.info("map loaded");
  });
});
</script>

<template>
  <div id="map" class="h-screen"></div>
</template>
