document.addEventListener("DOMContentLoaded", () => {
  //array to store the list of recipes currently being displayed
  let currentRecipes = [];

  //stores recipes fetched for a specific region
  //prevents re-fetching data from the API if the user selects the same region again.
  let recipesByRegionCache = {};


  // sets array to hold the user's saved favorite recipes if found or defaults to an empty array.
  //load this list from the localStorage to persist data between sessions
  let favorites = JSON.parse(localStorage.getItem('cuisineCompassFavorites')) || [];

  //get elements
  const favoritesBtn = document.getElementById('favorites-btn');
  const themeSwitcher = document.getElementById('theme-switcher');
  const themeIconLight = document.getElementById('theme-icon-light');
  const themeIconDark = document.getElementById('theme-icon-dark');
  const regionFilter = document.getElementById('region-filter');
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const recipesContainer = document.getElementById('recipes-container');
  const favoritesSection = document.getElementById('favorites-section');
  const favoritesContainer = document.getElementById('favorites-container');
  const emptyFavoritesMessage = document.getElementById('empty-favorites-message');
  const recipeView = document.getElementById('recipe-view'); 
  const cuisineModalTitle = document.getElementById('cuisine-modal-title');
  const cuisineModalContent = document.getElementById('cuisine-modal-content');
  const cuisineModalCloseBtn = document.getElementById('cuisine-modal-close-btn');
  const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
  
  //base api url for MEALDB API
  const MEALDB_API_URL = 'https://www.themealdb.com/api/json/v1/1/';

  //handles filteration by region
  async function handleFilterChange() {
    //stores selected region and checks if true
    const selectedRegion = regionFilter.value;
    if (!selectedRegion) return;

    //clears any text in the search bar to avoid confusion
    searchInput.value = '';
    //initial content displayed during loading of recipies
    recipesContainer.innerHTML = `<p class="col-span-full text-center text-gray-500 dark:text-gray-400">Loading recipes...</p>`;

    //uses the cached data if recipes for this region are already fetched  
    if (recipesByRegionCache[selectedRegion]) {
      currentRecipes = recipesByRegionCache[selectedRegion];
      renderRecipes(recipesContainer, currentRecipes);
      return;
    }

    try {
      //Fetch the list of meals for the selected region
      const response = await fetch(`${MEALDB_API_URL}filter.php?a=${selectedRegion}`);
      const data = await response.json(); //basic details
      
      if (data.meals) {
        //fetches full details of the meal and stores in an array of fetch promises
          const detailPromises = data.meals.map(meal => 
              fetch(`${MEALDB_API_URL}lookup.php?i=${meal.idMeal}`).then(res => res.json())
          );
          //executes all promises in parallel and stores detailed data
          const detailedMealsData = await Promise.all(detailPromises);
          //maps detailed data to clean recipe format
          currentRecipes = detailedMealsData.map(detail => mapMealToRecipe(detail.meals[0]));
          //stores result in cache for future use
          recipesByRegionCache[selectedRegion] = currentRecipes;
      } else {
        //sets empty array if no meals found
          currentRecipes = [];
      }
      //render recipies
      renderRecipes(recipesContainer, currentRecipes);
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
      recipesContainer.innerHTML = `<p class="col-span-full text-center text-red-500">Could not load recipes. Please check your connection and try again.</p>`;
    }
  }

  //handles searching of the meals
  async function handleSearch (event){
    // Prevent the form from reload
    event.preventDefault(); 

    const searchTerm = searchInput.value.trim();
    // Do nothing if the search term is empty.
    if (!searchTerm) return; 

    // Reset the region filter.
    regionFilter.value = ""; 

    //initial content displayed during searching of recipies
    recipesContainer.innerHTML = `<p class="col-span-full text-center text-gray-500 dark:text-gray-400">Searching for recipes...</p>`;

    try {
      const response = await fetch(`${MEALDB_API_URL}search.php?s=${searchTerm}`);
      const data = await response.json();

      //Checks if the API returned any meals and if the 'meals' array is not empty.
      if (data.meals && data.meals.length > 0) {
        //transforms each meal object into the recipe format used using the 'mapMealToRecipe' function.
          currentRecipes = data.meals.map(mapMealToRecipe);
      } else {
        //sets empty array if no meals found
          currentRecipes = [];
      }
      //render recipies
      renderRecipes(recipesContainer, currentRecipes);
    } catch (error) {
      console.error('Search failed:', error);
      recipesContainer.innerHTML = `<p class="col-span-full text-center text-red-500">Could not perform search. Please try again.</p>`;
    }
  }

  //Transforms a raw 'meal' object to a more structured 'recipe' object
  function mapMealToRecipe(meal){
    const ingredients = [];
    // The API provides up to 20 ingredient/measure pairs.
    // This loop iterates through them and combines them into a single array.
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        // Only add the ingredient if it exists and is not just whitespace.
        if (ingredient && ingredient.trim() !== '') {
            ingredients.push(`${measure} ${ingredient}`);
        }
    }
    // Return a new object with clearly named properties.
    return {
        id: meal.idMeal,
        name: meal.strMeal,
        region: meal.strArea,
        image: meal.strMealThumb,
        spiceLevel: getSpiceLevel(ingredients), // Calculate spice level from the assembled ingredients.
        // Split instructions into an array of steps, removing any empty lines.
        instructions: meal.strInstructions ? meal.strInstructions.split('\n').filter(step => step.trim() !== '') : [],
        ingredients: ingredients,
        culturalNote: `This is a classic ${meal.strCategory || ''} dish from ${meal.strArea}. Enjoy preparing and tasting this wonderful meal!`,
        youtubeUrl: meal.strYoutube,
    };
  }

  //Renders an array of recipe objects into a specified container element i.e recipesContainer, favorites container
  function renderRecipes(container, recipes){
     // Clears any existing content from the container.
        container.innerHTML = '';

        // Handles the case where there are no recipes to display.
        if (!recipes || recipes.length === 0) {
            // Avoid showing this message in the favorites section (it has its own message).
            if (container.id !== 'favorites-container') {
                container.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 col-span-full">Sorry, no recipes found. Try a different search or region.</p>`;
            }
            return;
        }

        // Iterate over each recipe and create a card for it.
        recipes.forEach(recipe => {
            // Check if the current recipe is already in the favorites list to style the heart icon.
            const isAlreadyFavorite = favorites.some(fav => fav.id === recipe.id);
            const card = document.createElement('div');
            card.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300';
            
            // sets the card's inner HTML.
            card.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.name}" class="w-full h-48 object-cover">
                <div class="p-6">
                    <h3 class="text-xl font-bold font-display mb-2">${recipe.name}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">${recipe.region}</p>
                    <div class="flex justify-between items-center mb-4">
                        ${createSpiceIndicator(recipe.spiceLevel)}
                        <button data-id="${recipe.id}" class="favorite-btn p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 ${isAlreadyFavorite ? 'text-red-500' : 'text-gray-400'}" fill="${isAlreadyFavorite ? 'currentColor' : 'none'}" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
                        </button>
                    </div>
                    <button data-id="${recipe.id}" class="details-btn w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 dark:focus:ring-offset-gray-800 transition-colors">
                        View Recipe
                    </button>
                </div>
            `;
            // Add the newly created card to the container.
            container.appendChild(card);
        });
  }

  //updates favourites section and persists favourites to localstorage
  function updateFavoritesView() {
      renderRecipes(favoritesContainer, favorites);
       //Toggles the visibility of the empty message based on whether the favorites array has items.
      emptyFavoritesMessage.classList.toggle('hidden', favorites.length > 0);
      //Saves the updated favorites array to localStorage
      localStorage.setItem('cuisineCompassFavorites', JSON.stringify(favorites));
  };



  //Determines a spice level (1, 2, or 3) for a recipe based on its ingredients.
  function getSpiceLevel(ingredients) {
    // Keywords for the highest spice level (3).
    const level3Keywords = ['hotsauce', 'red pepper', 'chilli', 'chili', 'gochujang', 'harissa', 'scotch bonnet', 'jalapeno', 'green pepper'];
    // Keywords for a medium spice level (2).
    const level2Keywords = ['paprika', 'black pepper', 'cayenne pepper', 'fajita', 'oregano', 'allspice', 'worcestershire sauce', 'mulukhiyah', 'cumin', 'garam masala', 'pepper'];

    // First, check for any high-spice ingredients.
    for (const ingredient of ingredients) {
      // Uses toLowerCase for case-insensitive matching.
      const lowercasedIngredient = ingredient.toLowerCase(); 
      for (const keyword of level3Keywords) {
          if (lowercasedIngredient.includes(keyword)) {
              return 3; // If found, immediately return the highest level.
          }
      }
    }

    // If no high-spice ingredients were found, check for medium spice ones.
    for (const ingredient of ingredients) {
      const lowercasedIngredient = ingredient.toLowerCase();
      for (const keyword of level2Keywords) {
          if (lowercasedIngredient.includes(keyword)) {
              return 2; // If found, return the medium level.
          }
      }
    }
    // If no spicy keywords are found, default to the lowest spice level.
    return 1;
    }

  //Dynamically creates the HTML for the spice level indicator 
  function createSpiceIndicator (level){
    let icons = '';
    // Loop three times to create three chili icons.
    for (let i = 1; i <= 3; i++) {
     // Conditionally set the color: orange for active, gray for inactive.
     const iconColor = i <= level ? 'text-orange-600' : 'text-gray-300 dark:text-gray-500';
     //sets the SVG icon in HTML.
    icons += `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ${iconColor}" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.17,2.17a2,2,0,0,0-2.34,0L4,10H8v4H4v4a2,2,0,0,0,2,2h8a2,2,0,0,0,2-2V18h4V14H16V10h4Z"/>
      </svg>
    `;
      }
    return `<div class="flex" title="Spice Level: ${level}/3">${icons}</div>`;
  }

    //Converts a standard YouTube watch URL into an embeddable URL for use in an iframe
    function getYoutubeEmbedUrl(url) {
        if (!url) return null;
        // This regular expression robustly extracts the video ID from various YouTube URL formats.
        const videoIdMatch = url.match(/(?:v=|\/embed\/|\.be\/)([^&\n?#]+)/);
        if (!videoIdMatch || !videoIdMatch[1]) return null;
        return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
  }

  //Displays the selected recipe details
  function showRecipeView(recipe) {
    cuisineModalTitle.textContent = recipe.name;
    //gets embeded url
    const embedUrl = getYoutubeEmbedUrl(recipe.youtubeUrl);

    // Conditionally create the video player HTML only if a valid embed URL exists.
    let videoPlayerHTML = '';
    if (embedUrl) {
        videoPlayerHTML = `
          <div class="mt-6">
            <h4 class="text-lg font-semibold mb-2 text-orange-500">Video Tutorial</h4>
            <div class="aspect-video w-full">
              <iframe class="w-full h-full rounded-lg" src="${embedUrl}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
          </div>
        `;
    }

    // Populate the modal's content with the recipe details.
    cuisineModalContent.innerHTML = `
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-2 text-orange-500">About this Dish</h4>
          <p class="text-gray-700 dark:text-gray-300">${recipe.culturalNote}</p>
        </div>
        <div>
          <h4 class="text-lg font-semibold mb-2 text-orange-500">Ingredients</h4>
          <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
              ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
          </ul>
          <h4 class="text-lg font-semibold mb-2 text-orange-500">Instructions</h4>
          <ol class="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2">
              ${recipe.instructions.map(step => `<li>${step}</li>`).join('')}
          </ol>
        </div>
        ${videoPlayerHTML}
    `;
    // Make the modal visible by toggling CSS classes.
    recipeView.classList.remove('modal-hidden');
    recipeView.classList.add('modal-visible');
  }


  //Hides the recipe details and clears its content
  function hideRecipeView() {
    //Clears content to prevent old data flashing
    cuisineModalContent.innerHTML = ''; 
    recipeView.classList.add('modal-hidden');
    recipeView.classList.remove('modal-visible');
  };

  //Handles clicks within the recipe cards
  //The single event listener on the body handles clicks for all cards
  async function handleCardClick(event)  {
    const target = event.target;
    const detailsBtn = target.closest('.details-btn');
    const favoriteBtn = target.closest('.favorite-btn');

    //Handles View Recipe Button Click 
    if (detailsBtn) {
      const recipeId = detailsBtn.dataset.id;
      // Find the full recipe object from either the current view or the favorites list.
      const fullRecipe = currentRecipes.find(r => r.id == recipeId) || favorites.find(r => r.id == recipeId);

      if (fullRecipe) {
          showRecipeView(fullRecipe);
      } else {
          //error display if the recipe can't be found (should be rare).
          cuisineModalTitle.textContent = "Error";
          cuisineModalContent.innerHTML = `<p>Sorry, the recipe details could not be found.</p>`;
          recipeView.classList.remove('modal-hidden');
          recipeView.classList.add('modal-visible');
      }
    }

    //Handles Favorite Button Click
    if (favoriteBtn) {
      const recipeId = favoriteBtn.dataset.id;
      const recipeIndexInFavorites = favorites.findIndex(fav => fav.id === recipeId);
      
      if (recipeIndexInFavorites > -1) {
          // If it's already a favorite, remove it.
          favorites.splice(recipeIndexInFavorites, 1);
      } else {
          // If it's not a favorite, find the recipe and add it to the start of the array.
          let recipeToAdd = currentRecipes.find(r => r.id === recipeId) || favorites.find(r => r.id === recipeId);
          if(recipeToAdd) {
              favorites.unshift(recipeToAdd);
          }
      }
      //Re-render the main grid to update the heart icon's color.
      renderRecipes(recipesContainer, currentRecipes); 
      //Update the favorites section and save to localStorage.
      updateFavoritesView();
    }
  }


  //handles toggling between light and dark mode.
  function handleThemeToggle(){
    // Get the <html> element.
    const html = document.documentElement; 
    // Toggle the 'dark' class (used by Tailwind CSS).
    html.classList.toggle('dark'); 
    const isDarkMode = html.classList.contains('dark');
    //Toggle the visibility of the sun and moon icons.
    themeIconLight.classList.toggle('hidden', isDarkMode);
    themeIconDark.classList.toggle('hidden', !isDarkMode);
  }

  //Shows or hides the scroll to top button based on the page scroll position.
  function handleScroll(){
    if (window.scrollY > 400) {
        scrollToTopBtn.classList.remove('hidden');
    } else {
        scrollToTopBtn.classList.add('hidden');
    }
  }

  //Smoothly scrolls the window to the top of the page.
  function handleScrollToTop(){
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
  };

  //Smoothly scrolls the page to the favorites section.
  function handleFavoritesScroll(){
    favoritesSection.scrollIntoView({ behavior: 'smooth' });
  };

  //Event listeners
  themeSwitcher.addEventListener('click', handleThemeToggle);
  favoritesBtn.addEventListener('click', handleFavoritesScroll);
  regionFilter.addEventListener('change', handleFilterChange);
  document.body.addEventListener('click', handleCardClick);
  cuisineModalCloseBtn.addEventListener('click', hideRecipeView);
  //This allows closing the modal by clicking on the dark overlay, but not on the content itself.
  recipeView.addEventListener('click', (e) => {
      if (e.target === recipeView) hideRecipeView();
  });
  searchForm.addEventListener('submit', handleSearch);
  window.addEventListener('scroll', handleScroll);
  scrollToTopBtn.addEventListener('click', handleScrollToTop);

  //initializes app
  function main(){
    recipesContainer.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 col-span-full">Please select a region or search to showcase cuisines.</p>`;
    updateFavoritesView();
  }
  main();
})

