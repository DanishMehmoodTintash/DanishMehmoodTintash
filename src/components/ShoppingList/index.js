import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import ClampLines from "react-clamp-lines";
import { Map } from "immutable";
import Loader from "react-loader-spinner";

import { track, trackingProps } from "helpers/analyticsService";

import Actions from "components/common/Actions";

import config from "config";

import { animateClusterMarker } from "helpers/PSVUtils";

const ShoppingList = ({
  styles,
  selectedItemsMap,
  onCategoryClick,
  closeSidebar,
  currentCollection,
  markerDropdownCategories,
  markerSelected,
}) => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [...categories] = selectedItemsMap.keys();
  const sortedCategories = [
    ...categories.filter((category) => !!selectedItemsMap.get(category)),
    ...categories.filter((category) => !selectedItemsMap.get(category)),
  ];

  const isMobile = () => window.innerWidth <= 600;

  useEffect(() => {
    const promiseArray = [];
    const imageArray = [];

    sortedCategories.forEach((category) => {
      const item = selectedItemsMap.get(category);
      if (item) {
        promiseArray.push(
          new Promise((resolve) => {
            const img = new Image();
            img.onload = function () {
              resolve();
            };
            img.src = `${config.baseUrl}/${item.get("thumbnail")}`;
            imageArray.push(img);
          })
        );
      }
    });
    Promise.all(promiseArray).then(function () {
      setImagesLoaded(true);
    });
  }, []);

  const trackItem = (item) => {
    track("Shop It CTA", {
      [trackingProps.ROOM_NAME]: currentCollection.get("type_name"),
      [trackingProps.NAV_CATEGORY]: item.get("category"),
      [trackingProps.PRODUCT_NAME]: item.get("name"),
      [trackingProps.BRAND_NAME]: item.get("brand"),
    });
  };

  const categoryBtnClicked = (category) => {
    if (markerDropdownCategories.indexOf(category) !== -1 && !isMobile())
      animateClusterMarker(markerSelected).then(
        onCategoryClick(category, "Category Add CTA")
      );
    else onCategoryClick(category, "Category Add CTA");
  };

  const trackShopMore = () => {
    track("Shop More CTA", {
      [trackingProps.ROOM_NAME]: currentCollection.get("type_name"),
    });
  };

  return (
    <div className={styles["shopping-list-container"]}>
      <div className={styles["actions-container"]}>
        <Actions styles={styles} onCloseButtonClick={closeSidebar} />
      </div>
      <h1 className={`${styles.heading} proxima`}>Your Selections</h1>
      <h2 className={styles.sub}>Items In Your Room</h2>
      {!imagesLoaded ? (
        <Loader
          className={styles["item-loader"]}
          type="TailSpin"
          color="#313131"
          visible={!imagesLoaded}
          height={70}
          width={70}
        />
      ) : (
        <div className={styles["item-list-container"]}>
          <ul className={styles["item-list"]} role="listbox">
            {sortedCategories.map((category) => {
              const item = selectedItemsMap.get(category);

              return item ? (
                <li className={styles["product-container"]} key={category}>
                  <a
                    className={styles["container-link"]}
                    href={item.get("shop_it_url")}
                    target="_blank"
                    role="button"
                    rel="noreferrer"
                  >
                    <span
                      className={styles["product-image"]}
                      id={item.get("item_id")}
                    >
                      <img
                        alt={item.get("name")}
                        src={`${config.baseUrl}/${item.get("thumbnail")}`}
                      />
                    </span>

                    <span className={styles["product-detail-container"]}>
                      <span className={`${styles["brand-name"]} proxima`}>
                        {item.get("brand")}
                      </span>
                      <ClampLines
                        className={styles["product-description"]}
                        text={item.get("name")}
                        buttons={false}
                        lines={3}
                        ellipsis="..."
                        innerElement="p"
                      />
                      <span className={styles["product-price"]}>
                        $
                        {item.get("is_sale") === "true" ? (
                          <>
                            {item.get("price_sale")}
                            <span>${item.get("price")}</span>
                          </>
                        ) : (
                          item.get("price")
                        )}
                      </span>
                    </span>
                  </a>
                  <a
                    className={styles["product-view-detail"]}
                    href={item.get("shop_it_url")}
                    target="_blank"
                    role="button"
                    rel="noreferrer"
                  >
                    <button
                      aria-label={`Shop ${item.get("name")}`}
                      onClick={() => trackItem(item)}
                    >
                      shop it
                      <img
                        src={`${config.s3BucketUrl}/utils/arrow-right.svg`}
                        alt=""
                        className={styles["right-arrow-img"]}
                      />
                    </button>
                  </a>
                </li>
              ) : (
                <li key={category}>
                  <button
                    className={styles["add-item-container"]}
                    onClick={() => categoryBtnClicked(category)}
                  >
                    <span className={styles["add-item-btn"]}>
                      <img
                        alt=""
                        src={`${config.s3BucketUrl}/utils/add-item-shopping-list.svg`}
                        data-pin-nopin="true"
                      />
                    </span>
                    <span className={styles["add-item-category"]}>
                      add {category}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className={styles["complete-look-container"]}>
            <h1 className="proxima-bold">Complete Your Look</h1>
            <p>
              Shop additional essentials to take your space to the next level:
            </p>
            <a
              className={`${styles["shop-more"]} proxima-semibold`}
              href="https://www.bedbathandbeyond.com/store/page/college/"
              target="_blank"
              role="button"
              onClick={trackShopMore}
              rel="noreferrer"
            >
              Shop More...
              <img
                alt=""
                src={`${config.s3BucketUrl}/utils/external-link.svg`}
                data-pin-nopin="true"
              />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

ShoppingList.propTypes = {
  styles: PropTypes.objectOf(PropTypes.string).isRequired,
  selectedItemsMap: PropTypes.instanceOf(Map).isRequired,
  closeSidebar: PropTypes.func.isRequired,
  onCategoryClick: PropTypes.func.isRequired,
  currentCollection: PropTypes.instanceOf(Map).isRequired,
  markerDropdownCategories: PropTypes.instanceOf(Array).isRequired,
  markerSelected: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
  return {
    selectedItemsMap: state.collection.get("selectedItemsMap"),
    currentCollection: state.collection.get("currentCollection"),
    markerDropdownCategories: state.interaction.get("markerDropdownCategories"),
    currentCategory: state.collection.get("currentCategory"),
    markerSelected: state.interaction.get("markerSelected"),
  };
};

export default connect(mapStateToProps)(ShoppingList);
