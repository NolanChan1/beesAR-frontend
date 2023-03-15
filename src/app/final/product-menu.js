$(document).ready(function () {
  $(".open-pm-button").on("click", function () {
    $(".pm-container").animate({ top: 192 });
    $(".background-blur").animate({ opacity: 0.5 });
    $(".background-blur").css("display", "block");
  });

  $(".close-pm-button-container").on("click", function () {
    $(".pm-container").animate({ top: "100vh" });
    $(".background-blur").animate({ opacity: 0 });
    $(".background-blur").css("display", "none");
  });

  // Product menu dropdown
  let menuTypes = [
    { id: 1, name: "Default product menu", icon: "mdi:book-open" },
    {
      id: 2,
      name: "Search for products by category",
      icon: "material-symbols:category-outline-rounded",
    },
    {
      id: 3,
      name: "Search for products by name",
      icon: "material-symbols:search-rounded",
    },
  ];

  let selectedMenuType = menuTypes[0];
  let menuDropdownOpen = true;

  $(".pm-dropdown-button-icon").attr("icon", selectedMenuType.icon);
  $(".pm-dropdown-button-text").html(selectedMenuType.name);
  if (menuDropdownOpen) {
    $(".pm-dropdown-button-icon").removeAttr("flip");
    $(".pm-dropdown-list").css("display", "block");
  } else {
    $(".pm-dropdown-button-icon").attr("flip", "vertical");
    $(".pm-dropdown-list").css("display", "none");
  }

  $.each(menuTypes, function (i, type) {
    let dupeItem = $(".pm-dropdown-option-container").clone();
    if (i != 0) {
      $(".pm-dropdown-list").append(dupeItem);
    }
  });

  $.each(menuTypes, function (i, type) {
    $(".pm-dropdown-list li:nth-child(" + (i + 1) + ") iconify-icon").attr(
      "icon",
      type.icon
    );
    $(".pm-dropdown-list li:nth-child(" + (i + 1) + ") p").html(type.name);
  });

  $.each(menuTypes, function (i, type) {
    if (selectedMenuType.id === type.id) {
      $(".pm-dropdown-list li:nth-child(" + (i + 1) + ")").css(
        "background-color",
        "#0466c8"
      );
      $(".pm-dropdown-list li:nth-child(" + (i + 1) + ") iconify-icon").attr(
        "style",
        "color: #e9ecef"
      );
      $(".pm-dropdown-list li:nth-child(" + (i + 1) + ") p").css(
        "color",
        "#e9ecef"
      );
    } else {
      $(".pm-dropdown-list li:nth-child(" + (i + 1) + ")").css(
        "background-color",
        "#dee2e6"
      );
      $(".pm-dropdown-list li:nth-child(" + (i + 1) + ") iconify-icon").attr(
        "style",
        "color: #0353a4"
      );
      $(".pm-dropdown-list li:nth-child(" + (i + 1) + ") p").css(
        "color",
        "#0353a4"
      );
    }
  });
});
