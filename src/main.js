// Create and configure loading screen
const loadingScreen = document.createElement("div");
loadingScreen.id = "loading-screen";
loadingScreen.className =
  "fixed inset-0 bg-white/90 flex items-center justify-center z-50";
loadingScreen.innerHTML = `
  <div class="text-center">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
    <p class="mt-4 text-lg font-medium text-gray-700">Loading products...</p>
  </div>
`;

// Create and configure modal elements
const overlay = document.createElement("div");
overlay.id = "product-modal-overlay";
overlay.className = "hidden fixed inset-0 bg-black/60 z-40";

const modal = document.createElement("div");
modal.id = "product-modal";
modal.className =
  "hidden fixed inset-0 flex items-center justify-center p-4 z-50";

// Append elements to body
document.body.appendChild(loadingScreen);
document.body.appendChild(overlay);
document.body.appendChild(modal);

// Close modal function
function closeModal() {
  overlay.classList.add("hidden");
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

// Updates the product card's rating display
function updateProductCardRating(productId, newRating) {
  const productCards = document.querySelectorAll(
    `.product-card[data-id="${productId}"]`
  );

  productCards.forEach((card) => {
    const ratingContainer = card.querySelector(".rating-stars");
    if (ratingContainer) {
      ratingContainer.innerHTML = Array(5)
        .fill()
        .map(
          (_, i) => `
          <span class="material-symbols-rounded text-sm ${
            i < Math.round(newRating) ? "text-yellow-400" : "text-gray-300"
          }">
            star
          </span>
        `
        )
        .join("");
    }
  });
}

async function getProducts() {
  try {
    // Show loading screen
    loadingScreen.classList.remove("hidden");

    const res = await fetch(
      "https://dummyjson.com/products/category/smartphones"
    );
    if (!res.ok) throw new Error("Cannot get products");
    const data = await res.json();

    // Create slider container
    const sliderContainer = document.createElement("div");
    sliderContainer.className =
      "slider-container relative max-w-6xl mx-auto my-8 overflow-hidden rounded-xl";

    // Create slider track
    const sliderTrack = document.createElement("div");
    sliderTrack.className =
      "slider-track flex transition-transform duration-300 ease-in-out";

    // Create navigation buttons
    const prevBtn = document.createElement("button");
    prevBtn.className =
      "slider-prev absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 text-gray-800 rounded-full p-2 shadow-md z-10 hover:bg-blue-600 hover:text-white";
    prevBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    `;

    const nextBtn = document.createElement("button");
    nextBtn.className =
      "slider-next absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-blue-600 hover:text-white text-gray-800 rounded-full p-2 shadow-md z-10";
    nextBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    `;

    // Assemble the slider
    sliderContainer.append(sliderTrack, prevBtn, nextBtn);

    // Clear existing content
    const productsList = document.querySelector(".products-grid");
    productsList.innerHTML = "";
    productsList.appendChild(sliderContainer);

    // Initialize variables
    let currentIndex = 0;
    let slidesCount = 0;
    let intervalId = null;

    function getItemsPerSlide() {
      const width = window.innerWidth;
      if (width >= 1024) return 3;
      if (width >= 768) return 2;
      return 1;
    }

    function updateSlider() {
      sliderTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    function createSlides() {
      const itemsPerSlide = getItemsPerSlide();
      const slideGroups = [];

      for (let i = 0; i < data.products.length; i += itemsPerSlide) {
        slideGroups.push(data.products.slice(i, i + itemsPerSlide));
      }

      const slides = slideGroups.map((group) => {
        return `
          <div class="slider-slide min-w-full p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              ${group
                .map(
                  (product) => `
                <div data-id="${
                  product.id
                }" class="product-card bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col cursor-pointer hover:shadow-lg transition-shadow">
                  <img src="${product.thumbnail}" alt="${product.title}" 
                       class="w-full h-48 object-contain p-4">
                  <div class="p-6 flex-grow">
                    <h3 class="font-bold text-lg mb-2 truncate">${
                      product.title
                    }</h3>
                    <div class="rating-stars flex items-center mb-2">
                      ${Array(5)
                        .fill()
                        .map(
                          (_, i) => `
                        <span class="material-symbols-rounded text-sm ${
                          i < Math.round(product.rating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }">
                          star
                        </span>
                      `
                        )
                        .join("")}
                    </div>
                    <div class="flex justify-between items-center mt-auto">
                      <span class="font-bold text-lg">$${product.price}</span>
                      ${
                        product.discountPercentage
                          ? `
                        <span class="text-sm font-semibold text-green-600">
                          SAVE ${product.discountPercentage}%
                        </span>
                      `
                          : ""
                      }
                    </div>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `;
      });

      sliderTrack.innerHTML = slides.join("");
      return slideGroups.length;
    }

    // Initialize slider
    function initSlider() {
      slidesCount = createSlides();
      currentIndex = 0;
      updateSlider();

      if (intervalId) clearInterval(intervalId);

      intervalId = setInterval(() => {
        currentIndex = (currentIndex + 1) % slidesCount;
        updateSlider();
      }, 5000);
    }

    initSlider();

    // Handle window resize
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        initSlider();
      }, 250);
    });

    // Navigation controls
    nextBtn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % slidesCount;
      updateSlider();
    });

    prevBtn.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + slidesCount) % slidesCount;
      updateSlider();
    });

    // Pause auto-slide on hover
    sliderContainer.addEventListener("mouseenter", () => {
      if (intervalId) clearInterval(intervalId);
    });

    sliderContainer.addEventListener("mouseleave", () => {
      intervalId = setInterval(() => {
        currentIndex = (currentIndex + 1) % slidesCount;
        updateSlider();
      }, 5000);
    });

    // Product card click handler
    function handleProductCardClick(e) {
      const card = e.currentTarget;
      const productId = card.dataset.id;
      const productIndex = data.products.findIndex((p) => p.id == productId);
      const product = data.products[productIndex];

      if (!product) return;

      let userRating = product.rating || 0;
      let isRatingChanged = false;

      modal.innerHTML = `
        <div class="w-full max-w-md md:max-w-xl lg:max-w-2xl bg-white rounded-xl overflow-hidden shadow-lg relative">
          <div class="flex flex-col md:flex-row">
            <div class="md:w-1/2 bg-gray-50 flex items-center justify-center p-8">
              <img src="${product.thumbnail}" alt="${product.title}" 
                   class="w-full h-auto max-h-96 object-contain">
            </div>
            <div class="md:w-1/2 p-6">
              <h2 class="mt-1 text-2xl font-bold text-gray-900">${
                product.title
              }</h2>
              <p class="text-sm font-medium my-2 text-gray-500">${
                product.brand
              }</p>
              <div class="flex items-center mb-2" id="rating-stars">
                ${Array(5)
                  .fill()
                  .map(
                    (_, i) => `
                  <span class="material-symbols-rounded text-lg cursor-pointer ${
                    i < Math.round(userRating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }" data-rating-value="${i + 1}">
                    star
                  </span>
                `
                  )
                  .join("")}
                <span class="ml-2 text-sm text-gray-500" id="rating-text">
                  ${
                    userRating
                      ? `Your rating: ${userRating}/5`
                      : "Rate this product"
                  }
                </span>
              </div>
              <p class="mt-2 text-gray-600">${product.description}</p>
              
              <div class="mt-6 pt-4 border-t border-gray-200">
                <div class="flex items-baseline">
                  <span class="text-3xl font-bold text-gray-900">$${
                    product.price
                  }</span>
                  ${
                    product.discountPercentage
                      ? `
                    <span class="ml-2 text-sm text-gray-500 line-through">
                      $${(
                        product.price /
                        (1 - product.discountPercentage / 100)
                      ).toFixed(2)}
                    </span>
                    <span class="ml-2 text-sm font-semibold text-green-600">
                      SAVE ${product.discountPercentage}%
                    </span>
                  `
                      : ""
                  }
                </div>
              </div>
            </div>
          </div>
          <button class="absolute top-4 right-4 p-2 rounded-full bg-white shadow hover:bg-gray-100 transition-colors" id="close-modal">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      `;

      // Star rating functionality
      const stars = modal.querySelectorAll(
        "#rating-stars span[data-rating-value]"
      );
      const ratingText = modal.querySelector("#rating-text");

      function highlightStars(count) {
        stars.forEach((star, index) => {
          star.classList.toggle("text-yellow-400", index < count);
          star.classList.toggle("text-gray-300", index >= count);
        });
      }

      stars.forEach((star) => {
        star.addEventListener("mouseover", (e) => {
          const ratingValue = parseInt(e.target.dataset.ratingValue);
          highlightStars(ratingValue);
        });

        star.addEventListener("click", (e) => {
          userRating = parseInt(e.target.dataset.ratingValue);
          isRatingChanged = true;
          highlightStars(userRating);
          ratingText.textContent = `Your rating: ${userRating}/5`;

          // Update the original product's rating
          data.products[productIndex].rating = userRating;

          // Update matching product
          updateProductCardRating(productId, userRating);
        });
      });

      modal
        .querySelector("#rating-stars")
        .addEventListener("mouseleave", () => {
          if (!isRatingChanged) {
            highlightStars(userRating);
          }
        });

      // Close modal
      modal.querySelector("#close-modal").addEventListener("click", closeModal);

      // Show modal
      overlay.classList.remove("hidden");
      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }

    // Add event listeners to all product cards
    document.querySelectorAll(".product-card").forEach((card) => {
      card.addEventListener("click", handleProductCardClick);
    });

    // Close modal when clicking overlay
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });

    // Close when pressing Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.classList.contains("hidden")) {
        closeModal();
      }
    });

    // Hide loading screen after content is loaded
    loadingScreen.classList.add("hidden");
  } catch (error) {
    console.error("Error loading products:", error);
    const productsList = document.querySelector(".products-grid");
    productsList.innerHTML = `
      <div class="text-red-500 text-center p-4">
        Error loading products: ${error.message}
      </div>
    `;
    loadingScreen.classList.add("hidden");
  }
}

// Initialize the application
getProducts();
