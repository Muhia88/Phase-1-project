# Cuisine Compass

A dynamic, single-page web application for exploring international cuisines. This project fetches data from the public TheMealDB API to provide users with a rich, interactive experience for discovering and saving recipes.

## Detailed Description

This application provides a modern and intuitive interface for exploring recipes from around the world. It interacts with a live, external API from MEALDB to fetch recipe data, ensuring that users have access to a vast and diverse collection of culinary delights. All user preferences, such as favorite recipes and the selected theme, are saved locally in the browser using `localStorage`.

The project is styled with **Tailwind CSS**, imported via a CDN, and features a sleek, responsive design that includes a dark mode theme.

[Here is a video explaining the website in depth](https://www.loom.com/share/6f3fa485b41c41e5b7228bfb8764e10b?sid=868eaa17-03a5-4c96-ab43-566163e85481)


**Key Features:**

* **Explore by Region:** Users can select a region from a dropdown list to view a variety of meals from that area.
* **Search Functionality:** A search bar allows users to find specific recipes by name.
* **Detailed Recipe View:** Clicking on a recipe opens a modal with comprehensive details, including ingredients, step-by-step instructions, and a cultural note about the dish.
* **Video Tutorials:** Where available, an embedded YouTube video player provides a visual cooking tutorial.
* **Favorites System:** Users can save their favorite recipes by clicking a heart icon. These favorites are displayed in a dedicated section and persist between sessions.
* **Spice Level Indicator:** A visual indicator on each recipe card gives users an at-a-glance idea of the dish's spiciness.
* **Dark/Light Mode:** A theme switcher allows users to toggle between a light and dark interface, with their preference saved for future visits.
* **Persistent Data:** Favorite recipes and the theme setting are stored in the `localStorage`, ensuring a personalized experience every time.

## File Structure

* `src/index.js`
* `index.html`
* `style.css`

## Project Setup

This project is built with HTML, CSS, and JavaScript and requires no complex setup or local server. Simply follow these steps:

1.  **Download the files:**
    Clone or download this repository to your local machine.

2.  **Open in Browser:**
    Open the `index.html` file in any modern web browser (like Chrome, Firefox, or Edge). You can do this by double-clicking the file or by using a tool like VS Code's Live Server. The application will be fully functional immediately.

## Usage

Once the application is open in your browser, you can perform the following actions:

1.  **Finding a Recipe:**
    * Use the **"Explore by Region"** dropdown to see recipes from a specific country.
    * Alternatively, type the name of a dish into the **search bar** and submit the form.

2.  **Viewing Recipe Details:**
    * In the results grid, click the **"View Recipe"** button on any card.
    * A modal window will appear, displaying the ingredients, instructions, and a video tutorial if one exists.

3.  **Managing Favorites:**
    * Click the **heart icon** on any recipe card to add it to your favorites. The icon will turn red to indicate it has been saved.
    * Your saved recipes will appear in the **"My Favorite Cuisines"** section.
    * To view your favorites, you can scroll down or click the heart icon in the main header to be taken directly to the favorites section.

4.  **Changing the Theme:**
    * Click the **sun/moon icon** in the header to toggle between light and dark mode. Your choice will be remembered the next time you visit.

## Author

* **Daniel Muhia**

## License

This project is licensed under the MIT License.

---

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.