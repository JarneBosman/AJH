export type Language = "en" | "nl";

export const languageCookieName = "atelier-lang";
export const languageStorageKey = "atelier.lang";
export const defaultLanguage: Language = "en";

export interface Translations {
  navShop: string;
  navConfigurator: string;
  navCart: string;
  languageEn: string;
  languageNl: string;
  footerEyebrow: string;
  footerDescription: string;
  footerShop: string;
  footerConfigurator: string;
  footerCart: string;
  homeHeroEyebrow: string;
  homeHeroTitle: string;
  homeHeroDescription: string;
  homeHeroPrimaryCta: string;
  homeHeroSecondaryCta: string;
  homeFeaturedEyebrow: string;
  homeFeaturedTitle: string;
  homeFeaturedDescription: string;
  homeCategoriesEyebrow: string;
  homeCategoriesTitle: string;
  homeCategoriesDescription: string;
  homeStoryEyebrow: string;
  homeStoryTitle: string;
  homeStoryDescription: string;
  homeStoryPointOne: string;
  homeStoryPointTwo: string;
  homeStoryPointThree: string;
  shopEyebrow: string;
  shopTitle: string;
  shopDescription: string;
  categoryDescription: string;
  categoryCustomizations: string;
  productCardFrom: string;
  productBackToCategory: string;
  productDynamicPrice: string;
  productPriceMeta: string;
  productAddNote: string;
  productNotePlaceholder: string;
  productLivePreview: string;
  productPreviewDescription: string;
  productAddToCart: string;
  productResetOptions: string;
  productAddedToCart: string;
  cartEyebrow: string;
  cartEmptyTitle: string;
  cartEmptyDescription: string;
  cartShopCta: string;
  cartConfigCta: string;
  cartReviewTitle: string;
  cartClear: string;
  cartDimensions: string;
  cartYourNote: string;
  cartRemove: string;
  cartCheckoutSummary: string;
  cartSubtotal: string;
  cartShipping: string;
  cartTotal: string;
  cartCheckoutCta: string;
  cartCheckoutHint: string;
  configEyebrow: string;
  configTitle: string;
  configDescription: string;
  configStepBaseType: string;
  configStepDimensions: string;
  configStepMaterials: string;
  configStepReview: string;
  configLiveEstimate: string;
  configBaseModel: string;
  configBaseTypeAdjustment: string;
  configOptionsAdjustment: string;
  configVisualPreview: string;
  configSelectBaseType: string;
  configAdjustDimensions: string;
  configSelectMaterials: string;
  configReviewConfiguration: string;
  configAddNote: string;
  configNotePlaceholder: string;
  configAddCustomToCart: string;
  configAddedToCart: string;
  configPrevious: string;
  configNext: string;
}

const en: Translations = {
  navShop: "Shop",
  navConfigurator: "Configurator",
  navCart: "Cart",
  languageEn: "EN",
  languageNl: "NL",
  footerEyebrow: "Handmade in Utrecht",
  footerDescription:
    "Atelier Nord designs and crafts custom furniture with local timber, precision joinery, and a quiet minimalist language.",
  footerShop: "Shop collection",
  footerConfigurator: "Build custom piece",
  footerCart: "Cart & checkout",
  homeHeroEyebrow: "Custom furniture workshop",
  homeHeroTitle: "Handmade furniture with tailored craftsmanship.",
  homeHeroDescription:
    "Discover solid wood pieces crafted in small batches and configured to your exact space, finish, and style.",
  homeHeroPrimaryCta: "Browse collection",
  homeHeroSecondaryCta: "Start configurator",
  homeFeaturedEyebrow: "Featured",
  homeFeaturedTitle: "Signature pieces",
  homeFeaturedDescription:
    "Our most requested handcrafted designs, each customizable per category.",
  homeCategoriesEyebrow: "Categories",
  homeCategoriesTitle: "Shop by furniture type",
  homeCategoriesDescription:
    "Each category includes dedicated customization logic and tailored finishing options.",
  homeStoryEyebrow: "Brand story",
  homeStoryTitle: "Built slowly, made to last",
  homeStoryDescription:
    "We partner with local sawmills and shape every piece by hand. Grain, tone, and detail are treated as unique characteristics, never defects.",
  homeStoryPointOne: "Solid hardwood construction with durable natural oils.",
  homeStoryPointTwo: "Custom dimensions and finishes tailored to your interior.",
  homeStoryPointThree: "Transparent craftsmanship and made-to-order production.",
  shopEyebrow: "Collection",
  shopTitle: "Browse the webshop",
  shopDescription:
    "Explore handcrafted pieces across tables, chairs, cabinets, and shelving.",
  categoryDescription:
    "All products in this category share the customization system shown below.",
  categoryCustomizations: "Category customizations",
  productCardFrom: "From",
  productBackToCategory: "Back to category",
  productDynamicPrice: "Dynamic price",
  productPriceMeta: "Base price {basePrice}. Lead time {leadTime}.",
  productAddNote: "Add a note about your customization",
  productNotePlaceholder:
    "E.g., 'Please ensure precise measurements' or 'Preferred delivery date: April 15'",
  productLivePreview: "Live preview cues",
  productPreviewDescription: "Material and finish update in real-time while you configure.",
  productAddToCart: "Add to cart",
  productResetOptions: "Reset options",
  productAddedToCart: "Added to cart",
  cartEyebrow: "Cart",
  cartEmptyTitle: "Your cart is empty",
  cartEmptyDescription:
    "Add a handcrafted item from the shop or build one in the configurator.",
  cartShopCta: "Shop collection",
  cartConfigCta: "Open configurator",
  cartReviewTitle: "Review your items",
  cartClear: "Clear cart",
  cartDimensions: "Dimensions",
  cartYourNote: "Your note",
  cartRemove: "Remove",
  cartCheckoutSummary: "Checkout summary",
  cartSubtotal: "Subtotal",
  cartShipping: "Shipping (mocked)",
  cartTotal: "Total",
  cartCheckoutCta: "Proceed to checkout",
  cartCheckoutHint:
    "Checkout flow is intentionally basic and ready to be connected to a real payment/backend service.",
  configEyebrow: "Bespoke configurator",
  configTitle: "Design your custom furniture piece",
  configDescription:
    "Build your ideal table in a guided flow inspired by premium furniture configurators. Every selection updates pricing and preview cues in real time.",
  configStepBaseType: "Base type",
  configStepDimensions: "Dimensions",
  configStepMaterials: "Materials",
  configStepReview: "Review & add",
  configLiveEstimate: "Live estimate",
  configBaseModel: "Base model",
  configBaseTypeAdjustment: "Base type adjustment",
  configOptionsAdjustment: "Options adjustment",
  configVisualPreview: "Visual preview",
  configSelectBaseType: "Select base type",
  configAdjustDimensions: "Adjust dimensions",
  configSelectMaterials: "Select materials & finish",
  configReviewConfiguration: "Review configuration",
  configAddNote: "Add a note about your customization",
  configNotePlaceholder:
    "E.g., 'Please ensure precise measurements' or 'Preferred delivery date: April 15'",
  configAddCustomToCart: "Add custom piece to cart",
  configAddedToCart: "Custom piece added to cart",
  configPrevious: "Previous",
  configNext: "Next step",
};

const nl: Translations = {
  navShop: "Winkel",
  navConfigurator: "Configurator",
  navCart: "Winkelwagen",
  languageEn: "EN",
  languageNl: "NL",
  footerEyebrow: "Handgemaakt in Utrecht",
  footerDescription:
    "Atelier Nord ontwerpt en maakt maatwerk meubels met lokaal hout, precisieverbindingen en een rustige minimalistische stijl.",
  footerShop: "Bekijk collectie",
  footerConfigurator: "Stel maatwerk samen",
  footerCart: "Winkelwagen & afrekenen",
  homeHeroEyebrow: "Maatwerk meubelatelier",
  homeHeroTitle: "Handgemaakte meubels met vakwerk op maat.",
  homeHeroDescription:
    "Ontdek massiefhouten stukken in kleine oplages, afgestemd op jouw ruimte, afwerking en stijl.",
  homeHeroPrimaryCta: "Bekijk collectie",
  homeHeroSecondaryCta: "Start configurator",
  homeFeaturedEyebrow: "Uitgelicht",
  homeFeaturedTitle: "Kenmerkende stukken",
  homeFeaturedDescription:
    "Onze meest gevraagde handgemaakte ontwerpen, elk per categorie aanpasbaar.",
  homeCategoriesEyebrow: "Categorieen",
  homeCategoriesTitle: "Shop op meubeltype",
  homeCategoriesDescription:
    "Elke categorie heeft eigen configuratielogica en passende afwerkingsopties.",
  homeStoryEyebrow: "Merkverhaal",
  homeStoryTitle: "Rustig gebouwd, gemaakt voor lang",
  homeStoryDescription:
    "We werken samen met lokale zagerijen en maken elk stuk met de hand. Nerf, toon en detail zien we als unieke eigenschappen, nooit als fout.",
  homeStoryPointOne: "Constructie van massief hardhout met duurzame natuurlijke olie.",
  homeStoryPointTwo: "Maatwerk afmetingen en afwerkingen voor jouw interieur.",
  homeStoryPointThree: "Transparant vakmanschap en productie op bestelling.",
  shopEyebrow: "Collectie",
  shopTitle: "Bekijk de webshop",
  shopDescription:
    "Ontdek handgemaakte stukken: tafels, stoelen, kasten en wandrekken.",
  categoryDescription:
    "Alle producten in deze categorie gebruiken het onderstaande configuratiesysteem.",
  categoryCustomizations: "Categorie-opties",
  productCardFrom: "Vanaf",
  productBackToCategory: "Terug naar categorie",
  productDynamicPrice: "Dynamische prijs",
  productPriceMeta: "Basisprijs {basePrice}. Levertijd {leadTime}.",
  productAddNote: "Voeg een notitie toe over je configuratie",
  productNotePlaceholder:
    "Bijv. 'Graag exact op maat' of 'Gewenste leverdatum: 15 april'",
  productLivePreview: "Live voorbeeld",
  productPreviewDescription:
    "Materiaal en afwerking worden direct bijgewerkt tijdens het configureren.",
  productAddToCart: "In winkelwagen",
  productResetOptions: "Opties resetten",
  productAddedToCart: "Toegevoegd aan winkelwagen",
  cartEyebrow: "Winkelwagen",
  cartEmptyTitle: "Je winkelwagen is leeg",
  cartEmptyDescription:
    "Voeg een handgemaakt item toe uit de shop of stel er een samen in de configurator.",
  cartShopCta: "Bekijk collectie",
  cartConfigCta: "Open configurator",
  cartReviewTitle: "Controleer je items",
  cartClear: "Leegmaken",
  cartDimensions: "Afmetingen",
  cartYourNote: "Jouw notitie",
  cartRemove: "Verwijderen",
  cartCheckoutSummary: "Afrekenoverzicht",
  cartSubtotal: "Subtotaal",
  cartShipping: "Verzending (demo)",
  cartTotal: "Totaal",
  cartCheckoutCta: "Doorgaan naar afrekenen",
  cartCheckoutHint:
    "De checkout is bewust eenvoudig en klaar om te koppelen aan een echte betaal/backendservice.",
  configEyebrow: "Maatwerk configurator",
  configTitle: "Ontwerp je meubel op maat",
  configDescription:
    "Stel je ideale tafel samen in een begeleide flow, geinspireerd op premium configurators. Elke keuze werkt prijs en voorbeeld direct bij.",
  configStepBaseType: "Basistype",
  configStepDimensions: "Afmetingen",
  configStepMaterials: "Materialen",
  configStepReview: "Controleren & toevoegen",
  configLiveEstimate: "Live indicatie",
  configBaseModel: "Basismodel",
  configBaseTypeAdjustment: "Aanpassing basistype",
  configOptionsAdjustment: "Aanpassing opties",
  configVisualPreview: "Visueel voorbeeld",
  configSelectBaseType: "Kies basistype",
  configAdjustDimensions: "Pas afmetingen aan",
  configSelectMaterials: "Kies materiaal & afwerking",
  configReviewConfiguration: "Controleer configuratie",
  configAddNote: "Voeg een notitie toe over je configuratie",
  configNotePlaceholder: "Bijv. 'Graag exact op maat' of 'Gewenste leverdatum: 15 april'",
  configAddCustomToCart: "Voeg maatwerk toe aan winkelwagen",
  configAddedToCart: "Maatwerk toegevoegd aan winkelwagen",
  configPrevious: "Vorige",
  configNext: "Volgende stap",
};

const dictionaries: Record<Language, Translations> = { en, nl };

export const normalizeLanguage = (value: string | null | undefined): Language =>
  value === "nl" ? "nl" : defaultLanguage;

export const getTranslations = (language: Language): Translations => dictionaries[language];

export const withPlaceholders = (
  template: string,
  placeholders: Record<string, string>,
): string => {
  let result = template;
  for (const [key, value] of Object.entries(placeholders)) {
    result = result.replaceAll(`{${key}}`, value);
  }
  return result;
};
