import { mapRawCocktailData } from "./utilities.js";

const navbar = document.querySelector(".navbar");
const startPage = document.querySelector("#start-page");
const detailsPage = document.querySelector("#details-page");
const searchPage = document.querySelector("#search-page");

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//NAVIGERING FÖR DE OLIKA SIDORNA

function handleOnLinkClick(id) {
  //Här anges vilken "sida" som ska öppnas och stängas beroende på vad man klickar på. Klasserna är definierade som öppnade eller stängda.
  if (id === "start-link") {
    startPage.classList.add("open");
    detailsPage.classList.remove("open");
    searchPage.classList.remove("open");
  }

  if (id === "details-link") {
    startPage.classList.remove("open");
    detailsPage.classList.add("open");
    searchPage.classList.remove("open");
  }

  if (id === "search-link") {
    startPage.classList.remove("open");
    detailsPage.classList.remove("open");
    searchPage.classList.add("open");
  }
}

function handleOnNavbarClick(event) {
  //Funktion för klick på navbarens länkar
  const classList = event.target.classList;
  if (classList.contains("link")) return handleOnLinkClick(event.target.id); //Om där man klickar har klassen "link" så...
}
navbar.addEventListener("click", handleOnNavbarClick);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//STARTSIDAN

export async function generateRandomCocktail() {
  //Denna funktion hämtar data från API för att visa en slumpmässig cocktail på startsidan. Används även till knappen för att generera en ny random cocktail.

  try {
    const response = await fetch(
      "https://www.thecocktaildb.com/api/json/v1/1/random.php"
    );
    const data = await response.json();
    const cocktail = data.drinks[0]; //Lagrar data.drinks[0] i variabeln cocktail

    startPage.innerHTML = `                              
      <!--Vad ska läggas till för HTML på startsidan varje gång den laddas om-->
  
        <h1>Encyklopedia Mixologica</h1>
        <p>Go make this cocktail or generate a new one by pressing the button</p>
      <div class="button-container">
        <button class="cocktail-button" id="generate-Cocktail-Button" type="button">Generate a random cocktail</button> <!--Generera slumpad cocktail-knapp-->
        <button class="link" data-id="${cocktail.idDrink}" id="details-link" type="button">See details of cocktail</button> <!--Detalj-knapp-->
      </div>
      <div class="img-container">   
          <img src="${cocktail.strDrinkThumb}">
      </div>
        <div class="text-container">
          <h4>${cocktail.strDrink}</h4>
        </div>
    `;

    const randomButton = document.querySelector("#generate-Cocktail-Button"); //Targeta generate cocktail knappen
    randomButton.addEventListener("click", () => {
      //Eventlistener för att lyssna på generate a cocktail-knappen. Genererar då en ny random cocktail.

      generateRandomCocktail();
    });

    const detailsButton = document.querySelector("#details-link"); //Targeta detalj-knappen
    detailsButton.addEventListener("click", (event) => {
      //Eventlistener för att lyssna på click på detalj-knappen på startsidan

      const id = event.target.dataset.id;
      detailsOfCocktailFunction(id);
      handleOnLinkClick("details-link");
    });

    console.log(cocktail);
  } catch (error) {
    console.log(error);
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//DETALJSIDAN

export async function detailsOfCocktailFunction(id) {
  // Funktion för att detaljsidan ska fungera. Hämtar data från API. OBS att använda rätt länk.

  try {
    const response = await fetch(
      `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`
    ); // Url för att få detalj-info
    const data = await response.json();
    const rawCocktail = data.drinks[0]; //lagrar värde av data.drinks[0] i variabeln rawCocktail, detta är alltså "den råa" datan från API innan den gjorts om av mapRawCocktailData-funktionen

    const cocktail = mapRawCocktailData(rawCocktail); //funktionen mapRawCocktailData gör om datan och lagrar den i variabeln "cocktail".

    detailsPage.innerHTML = ` <!-- Detaljsidans dynamiska HTML -->
      <h1>Details of ${cocktail.name}</h1>
      <img src="${cocktail.thumbnail}">
      ${cocktail.ingredients
        .map(
          (
            ingredient
          ) => ` <!--Callback i .map som returnerar dynamisk html för varje ingredient i cocktail.ingredients och measure -->

        <p><b>Ingredients:</b> ${ingredient.ingredient} ${ingredient.measure}</p>

      `
        )
        .join(
          ""
        )} <!--kombinerar ihop arrayen av strängar som .map returnerar. Kombineras alltså till EN sträng. -->
      
      <p><b>Instructions:</b> ${cocktail.instructions}</p>
      <p><b>Glass:</b> ${cocktail.glass}</p>
      <p><b>Category:</b> ${cocktail.category}</p>
      <p><b>Tags:</b> ${cocktail.tags}</p>
    `;
  } catch (error) {
    console.error("Error fetching cocktail details:", error);
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//SÖKSIDAN

export async function searchPageFunction(searchValue) {
  //Funktion för att söksidan ska fungera. OBS att använda rätt länk!

  try {
    const response = await fetch(
      `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${searchValue}`
    );
    const data = await response.json();
    const searchResult = document.querySelector("#search-result-container");

    if (!searchValue) {
      alert("Please type the name of a cocktail!");
    } else if (data.drinks) {
      searchResult.innerHTML = data.drinks
        .map((drink) => {
          //map skapar en ny array av de objekt i original-array som har userInput i sig

          return ` <!--Returnerar varje drink som mappats nedan med injicerade värden från API-->
      <div id="search-result-container">
        <img src = "${drink.strDrinkThumb}"> <!--Bild på drinken -->
        <p>${drink.strDrink}</p> <!--Namn på drinken -->
        <button class="link details-button" data-id="${drink.idDrink}" type="button">See details of cocktail</button> 
      </div>

    `;
        })
        .join(""); //Arrayen av strängar sätts samman till EN sträng.
      searchValue = ""; //Töm input-fältet efter sökningen
    } else {
      searchResult.innerHTML = "<p><b>No results found</b></p>";
    }

    const clearInputField = document.querySelector("#search-input"); //Targetar input-fältet
    clearInputField.value = ""; //Anger att input-fältet ska vara tomt. Man anger detta som en "tom sträng"
  } catch (error) {
    console.log(error);
  }
}

const searchCocktail = document.querySelector(".form"); //Formuläret targetas eftersom det är det som ska submitas
searchCocktail.addEventListener("submit", (event) => {
  //Eventlistener för att lyssna efter submit av formuläret.
  event.preventDefault();
  const userInput = document.querySelector("#search-input").value; //Eventlistener behöver userInput-värdet från funktionen!
  searchPageFunction(userInput);
});

document
  .querySelector("#search-result-container")
  .addEventListener("click", (event) => {
    //Eventlistener läggs till på detaljknappens parent element eftersom sökknappen genereras med dynamisk HTML och då inte ska targetas direkt.

    if (event.target.classList.contains("details-button")) {
      //Kollar om där man klickar innehåller klassen "details-button"
      const id = event.target.getAttribute("data-id"); //Variabel av typen const skapas. Den tilldelas värdet av attributet på target-elementet som klickas på. Så när detalj-knappen klickas så hämtas "data-id":s värde vilket är id på cocktailen.
      detailsOfCocktailFunction(id);
      handleOnLinkClick("details-link");
    }
  });

///////////////////////////////////////////////////////////////////////////////////////////////////////////
