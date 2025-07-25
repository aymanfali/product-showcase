async function getProducts() {
  try {
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

    // Assemble the slider (without dots container)
    sliderContainer.append(sliderTrack, prevBtn, nextBtn);

    // Clear existing content
    const productsList = document.querySelector(".products-grid");
    productsList.innerHTML = "";
    productsList.appendChild(sliderContainer);

    // Initialize variables
    let currentIndex = 0;
    let slidesCount = 0;
    let intervalId = null;

    // Function to calculate items per slide based on screen width
    function getItemsPerSlide() {
      const width = window.innerWidth;
      if (width >= 1024) return 3; // Large screens
      if (width >= 768) return 2; // Medium screens
      return 1; // Small screens
    }

    // Update slider position
    function updateSlider() {
      sliderTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    // Create slides based on current screen size
    function createSlides() {
      const itemsPerSlide = getItemsPerSlide();
      const slideGroups = [];

      // Group products into slides with appropriate number of items
      for (let i = 0; i < data.products.length; i += itemsPerSlide) {
        slideGroups.push(data.products.slice(i, i + itemsPerSlide));
      }

      // Create slides HTML
      const slides = slideGroups.map((group) => {
        return `
          <div class="slider-slide min-w-full p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              ${group
                .map(
                  (product) => `
                <div class="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col">
                  <img src="${product.thumbnail}" alt="${product.title}" 
                       class="w-full h-48 object-contain p-4">
                  <div class="p-6 flex-grow">
                    <h3 class="font-bold text-lg mb-2 truncate">${
                      product.title
                    }</h3>
                    <div class="flex items-center mb-2">
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

      // Clear any existing interval
      if (intervalId) clearInterval(intervalId);

      // Start auto-play
      intervalId = setInterval(() => {
        currentIndex = (currentIndex + 1) % slidesCount;
        updateSlider();
      }, 5000);
    }

    // Initialize slider for the first time
    initSlider();

    // Handle window resize
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        initSlider();
      }, 250);
    });

    // Event listeners for navigation buttons
    nextBtn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % slidesCount;
      updateSlider();
    });

    prevBtn.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + slidesCount) % slidesCount;
      updateSlider();
    });

    // Pause on hover
    sliderContainer.addEventListener("mouseenter", () => {
      if (intervalId) clearInterval(intervalId);
    });

    sliderContainer.addEventListener("mouseleave", () => {
      intervalId = setInterval(() => {
        currentIndex = (currentIndex + 1) % slidesCount;
        updateSlider();
      }, 5000);
    });
  } catch (error) {
    console.log(error.message);
    const productsList = document.querySelector(".products-grid");
    productsList.innerHTML = `<div class="text-red-500 text-center p-4">Error loading products: ${error.message}</div>`;
  } finally {
    console.log("Loading complete");
  }
}

getProducts();
