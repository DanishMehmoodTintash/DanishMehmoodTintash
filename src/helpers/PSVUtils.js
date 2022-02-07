import { store } from "App";

import MarkersPlugin from "@moiz.imran/photo-sphere-viewer/dist/plugins/markers";

import { goToCollection, setCurrentCategory } from "actions/collection";
import {
  setMarkerDropdownOpen,
  setDropdownPosition,
  setMarkerDropdownCategories,
  setMarkerSelected,
  setSidebarOpen,
  setSidebarComponent,
} from "actions/interaction";

import config from "config";

const isMobile = () => window.innerWidth <= 600;
let isResizing = false;

const PSV_CONFIG = {
  container: "photosphere",
  plugins: [MarkersPlugin],
  autorotateSpeed: "1rpm",
  mousewheel: false,
  navbar: [{ hidden: true }],
  loadingImg: "",
  loadingTxt: "",
};

export const getPSVConfig = () => {
  const { collection } = store.getState();
  const roomAngle = collection.getIn(["currentConfig", "roomAngle"]).toJS();
  return {
    ...PSV_CONFIG,
    defaultLong: roomAngle.longitude,
    defaultLat: roomAngle.latitude,
    defaultZoomLvl: roomAngle.zoom,
  };
};

export const handleClusterMarkerState = (markerId, flag) => {
  if (flag) {
    const clusterMarker = document.getElementById(`${markerId}-layer`);
    clusterMarker?.classList.add("marker-selected-state");
  } else {
    const clusterMarker = document.getElementById(`${markerId}-layer`);
    clusterMarker?.classList.remove("marker-selected-state");
  }
};

export const fillMarkers = (PSV, onCategoryClick) => {
  const { collection } = store.getState();
  const markers = collection.getIn(["currentConfig", "markers"]).toJS();
  const roomMarkers =
    collection.getIn(["currentConfig", "roomMarkers"])?.toJS() || {};
  const connectedRooms = collection.get("connectedRooms");

  const markerSize = isMobile() ? 16 : 22;

  const markersList = [];

  const markerData = (key, value) => {
    return {
      id: key,
      content: "",
      latitude: value.latitude,
      longitude: value.longitude,
      width: markerSize,
      height: markerSize,
      anchor: "bottom center",
      categories: value.categories,
      isCluster: value.isCluster,
      dependentCluster: value.dependentCluster,
    };
  };

  const handleClusterMarker = (marker) => {
    const { interaction } = store.getState();
    const { longitude } = marker.config;
    const speed = "4rpm";

    let { latitude } = marker.config;
    latitude += 0.4;

    PSV.animate({ longitude, latitude, speed }).then(() => {
      store.dispatch(setSidebarComponent(null));

      const isMarkerDropdownOpen = interaction.get("isMarkerDropdownOpen");
      if (!isMarkerDropdownOpen) {
        setTimeout(() => {
          handleClusterMarkerState(marker.id, true);
          store.dispatch(setMarkerDropdownOpen(true));
          store.dispatch(setMarkerSelected(marker.id));
          store.dispatch(
            setDropdownPosition(
              PSV.plugins.markers.getMarker(marker.id)?.props.position2D
            )
          );
        }, 200);
      } else {
        store.dispatch(setMarkerDropdownOpen(false));
        handleClusterMarkerState(marker.id, false);
      }
    });
  };

  Object.entries(markers).forEach(([k, v]) => {
    let data;
    if (v.isCluster) {
      store.dispatch(setMarkerDropdownCategories(v.categories));
      store.dispatch(setMarkerSelected(k));
    }

    if (v.dependentCluster) {
      data = {
        ...markerData(k, v),
        hidden: true,
        html: `
          <div class="marker-container hidden">
            <div id="${k}-marker-box" class="marker-box"></div>
            <div id="${k}-layer" class="back-layer"></div>
          </div>
        `,
      };
    } else {
      data = {
        ...markerData(k, v),
        tooltip: {
          content: k,
          position: "bottom right",
        },
        hidden: true,
        html: `
          <div class="marker-container">
            <div id="${k}-marker-box" class="marker-box"></div>
            <div id="${k}-layer" class="back-layer"></div>
          </div>
        `,
      };
    }

    markersList.push(data);
  });

  Object.entries(roomMarkers).forEach(([k, v]) => {
    const data = {
      ...markerData(k, v),
      html: `
        <div class="room-marker">
          <div class="room-marker-container">
            <img src="${config.s3BucketUrl}/utils/room-change.svg"/>
          </div>
          <div class="room-marker-text">
            <span>${k}</span>
          </div>
        </div>
      `,
    };
    markersList.push(data);
  });

  const markersPlugin = PSV.getPlugin(MarkersPlugin);
  markersList.forEach((marker) => markersPlugin?.addMarker(marker, true));

  markersPlugin.on("select-marker", (e, marker, { dblclick }) => {
    if (!dblclick) {
      if (marker.id in markers) {
        if (marker.config.isCluster) {
          store.dispatch(setSidebarOpen(false));
          store.dispatch(setCurrentCategory(null));
          handleClusterMarker(marker);
        } else if (marker.config.dependentCluster) {
          console.log("clustered marker detected");
        } else {
          onCategoryClick(marker.id, "Swap/Add Button");
        }
      } else {
        const id = connectedRooms.get(marker.id)?.get("room_type_id");
        store.dispatch(goToCollection(id));
      }
    }
  });
};

export const updateMarkersState = () => {
  const { collection, interaction } = store.getState();
  const markers = collection.getIn(["currentConfig", "markers"]).toJS();
  const currentCategory = collection.get("currentCategory");
  const sidebarComponent = interaction.get("sidebarComponent");
  const isSidebarOpen = interaction.get("isSidebarOpen");
  const categories = interaction.get("markerDropdownCategories");
  const markerSelected = interaction.get("markerSelected");

  Object.keys(markers).forEach((markerId) => {
    const marker = document.getElementById(`${markerId}-layer`);
    if (marker) {
      if (marker.classList.contains("marker-selected-state")) {
        marker.classList.remove("marker-selected-state");
      }
    }
  });

  if (
    currentCategory &&
    isSidebarOpen &&
    sidebarComponent !== "CuratedRoom" &&
    sidebarComponent !== "ShoppingList" &&
    sidebarComponent !== "CategoriesList"
  ) {
    if (categories.indexOf(currentCategory) === -1) {
      handleClusterMarkerState(currentCategory, true);
    } else {
      handleClusterMarkerState(markerSelected, true);
    }
  }
};

export const adjustView = (PSV) => {
  if (isMobile() || isResizing) return;

  const { collection, interaction } = store.getState();
  const currentCategory = collection.get("currentCategory");
  const markers = collection.getIn([
    "currentConfig",
    "markers",
    currentCategory,
  ]);
  const markerDropdownCategoryList = interaction.get(
    "markerDropdownCategories"
  );
  const speed = "4rpm";

  if (
    currentCategory &&
    markerDropdownCategoryList.indexOf(currentCategory) === -1
  ) {
    const longitude = markers?.get("longitude");
    const latitude = markers?.get("latitude");
    PSV.animate({ longitude, latitude, speed });
  }
};

export const resize360View = (PSV) => {
  isResizing = true;

  if (isMobile()) {
    const { collection } = store.getState();
    const markers = collection.getIn(["currentConfig", "markers"]);
    const roomMarkers = collection.getIn(["currentConfig", "roomMarkers"]);

    setTimeout(() => {
      PSV.resizeView("33.5%");
    }, 250);

    const markersPlugin = PSV.getPlugin(MarkersPlugin);
    markers?.mapKeys((marker) => markersPlugin?.hideMarker(marker));
    roomMarkers?.mapKeys((marker) => markersPlugin?.hideMarker(marker));
  } else {
    setTimeout(() => {
      PSV.resizeView("100%", "74%");
      isResizing = false;
      adjustView(PSV);
    }, 250);
  }
};

export const reset360View = (PSV) => {
  PSV.resetView();
  if (isMobile()) {
    const { collection } = store.getState();
    const markers = collection.getIn(["currentConfig", "markers"]);
    const roomMarkers = collection.getIn(["currentConfig", "roomMarkers"]);

    const markersPlugin = PSV.getPlugin(MarkersPlugin);
    markers?.mapKeys((marker) => markersPlugin?.showMarker(marker));
    roomMarkers?.mapKeys((marker) => markersPlugin?.showMarker(marker));
  }
};

export const showAutoRotation = () => {
  const { interaction } = store.getState();
  const PSV = interaction.get("PSV");

  PSV.startAutorotate();

  const stopAutorotate = () => {
    PSV.stopAutorotate();
    window.removeEventListener("mousemove", stopAutorotate);
  };

  window.addEventListener("mousemove", stopAutorotate);
};

export const animateClusterMarker = (category) => {
  const { interaction } = store.getState();
  const PSV = interaction.get("PSV");
  const speed = "4rpm";
  const marker = PSV.plugins.markers.getMarker(category);
  const { longitude, latitude } = marker.props.position;
  return PSV.animate({ longitude, latitude, speed });
};
