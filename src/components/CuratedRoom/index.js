import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Loader from "react-loader-spinner";
import { connect } from "react-redux";
import { List, Map } from "immutable";

import { imageXhr } from "helpers/imageUtils";
import { track, trackingProps } from "helpers/analyticsService";

import { setChangeRoomOpen } from "actions/interaction";
import { setCurrentCuratedRoomId } from "actions/collection";

import Actions from "components/common/Actions";

import config from "config";

const CuratedRoom = ({
  styles,
  closeSidebar,
  setChangeRoomOpen,
  curatedRooms,
  setCurrentCuratedRoomId,
  currentCollection,
}) => {
  const [isLoading, setLoading] = useState(true);
  const [thumbnailsMap, setThumbnailMap] = useState({});

  const curatedClicked = (collection) => {
    setChangeRoomOpen(true);
    setCurrentCuratedRoomId(collection.get("curated_room_id"));
    track("Curated Room Add CTA", {
      [trackingProps.ROOM_NAME]: currentCollection?.get("type_name"),
      [trackingProps.CURATED_ROOM_NAME]: collection.get("curated_room_name"),
    });
  };

  useEffect(() => {
    if (Object.keys(thumbnailsMap).length) {
      setLoading(false);
    }
  }, [thumbnailsMap]);

  useEffect(() => {
    let hashMap = {};

    const fetchImages = async () => {
      hashMap = (
        await Promise.all(
          Object.keys(hashMap).map(async (k) => ({ [k]: await hashMap[k] }))
        )
      ).reduce((h, p) => ({ ...h, ...p }), {});
      setThumbnailMap(hashMap);
    };

    curatedRooms.forEach((room) => {
      hashMap[room.get("curated_room_id")] = imageXhr(
        null,
        `${config.s3BucketUrl}/curated_rooms/${room.get("image")}`
      );
    });

    fetchImages();
  }, []);

  return (
    <div className={styles["curated-rooms"]}>
      <div className={styles["actions-container"]}>
        <Actions styles={styles} onCloseButtonClick={closeSidebar} />
      </div>
      <div className={`${styles["curated-container"]} proxima-light`}>
        <div className={styles["prompt-container"]}>
          <h1 className={`${styles.head} proxima`}>Vibes</h1>
          <h2 className={`${styles.info} proxima-light`}>
            Select from our vibes, then customize it to create your own
            personalized dorm.
          </h2>
        </div>
      </div>
      {isLoading ? (
        <Loader
          className={styles["item-loader"]}
          type="TailSpin"
          color="#313131"
          height={70}
          width={70}
        />
      ) : (
        <div className={styles["room-container"]}>
          {curatedRooms.size ? (
            <>
              {curatedRooms.map((room) => (
                <button
                  className={` ${styles["brand-heading"]} ${styles["image-box"]} proxima`}
                  key={room.get("curated_room_id")}
                  onClick={() => curatedClicked(room)}
                >
                  <img
                    alt=""
                    src={thumbnailsMap[room.get("curated_room_id")]}
                  />
                  <span
                    className={`${styles["brand-heading"]} ${styles["curated-room"]}`}
                  >
                    {room.get("curated_room_name")}
                  </span>
                  <span
                    className={`${styles["brand-heading"]} ${styles["brand-name"]} proxima`}
                  >
                    <span className="proxima-bold">{room.get("brand")}</span>
                  </span>
                </button>
              ))}
            </>
          ) : (
            <span>No Data Found</span>
          )}
        </div>
      )}
    </div>
  );
};

CuratedRoom.propTypes = {
  styles: PropTypes.objectOf(PropTypes.string).isRequired,
  closeSidebar: PropTypes.func.isRequired,
  setChangeRoomOpen: PropTypes.func.isRequired,
  curatedRooms: PropTypes.instanceOf(List).isRequired,
  setCurrentCuratedRoomId: PropTypes.func.isRequired,
  currentCollection: PropTypes.instanceOf(Map),
};

CuratedRoom.defaultProps = {
  currentCollection: null,
};

const mapStateToProps = (state) => {
  return {
    isChangeRoomOpen: state.interaction.get("isChangeRoomOpen"),
    curatedRooms: state.collection.get("curatedRooms"),
    currentCollection: state.collection.get("currentCollection"),
  };
};

const mapDispatchToProps = { setChangeRoomOpen, setCurrentCuratedRoomId };

export default connect(mapStateToProps, mapDispatchToProps)(CuratedRoom);
