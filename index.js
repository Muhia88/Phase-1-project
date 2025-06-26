document.addEventListener("DOMContentLoaded", () => {
  //array to store the list of recipes currently being displayed
  let currentRecipes = [];

  //stores recipes fetched for a specific region
  //prevents re-fetching data from the API if the user selects the same region again.
  let recipesByRegionCache = {};


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

    
})

