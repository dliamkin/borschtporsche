// Recipe content driving /recipes and /recipes/:slug.
// Photos are striped placeholders until real photography arrives —
// `photoCaption` / `detailPhotoCaption` label the placeholder areas.
export const recipes = [
    {
        slug: "moms-borscht",
        title: "Mom's Borscht",
        summary:
            "The namesake. Deep-red beet soup, slow-simmered, served with a spoon of smetana and total silence at the table.",
        description:
            "The soup the band is named after. Beets, cabbage, and patience. Tastes better the next day — like most things.",
        photoCaption: "photo: mom's borscht",
        detailPhotoCaption: "photo: finished borscht, overhead",
        prep: "Prep 30 min",
        cook: "Cook 1.5 hr",
        serves: "Serves 8",
        ingredients: [
            "3 medium beets, grated",
            "½ head green cabbage, shredded",
            "2 carrots, grated",
            "3 potatoes, cubed",
            "1 onion, diced",
            "2 tbsp tomato paste",
            "8 cups beef or veggie broth",
            "2 bay leaves · salt · pepper",
            "Fresh dill + smetana to serve",
        ],
        steps: [
            "Sauté onion and carrot in a large pot until soft. Add grated beets and tomato paste; cook 8–10 minutes until deep red.",
            "Pour in broth, add potatoes and bay leaves. Simmer 20 minutes until potatoes are nearly tender.",
            "Add cabbage and simmer another 15 minutes. Season with salt and pepper. Taste. Adjust. Taste again.",
            "Rest off the heat 20 minutes (or overnight — correct answer). Serve with dill and a spoon of smetana.",
        ],
    },
    {
        slug: "pelmeni",
        title: "Pelmeni",
        summary:
            "Hand-pinched meat dumplings. Make two hundred, freeze most of them, eat more than planned.",
        description:
            "Little dumplings, big commitment. Clear an afternoon, cover the table in flour, and put the album on repeat.",
        photoCaption: "photo: pelmeni",
        detailPhotoCaption: "photo: pelmeni, mid-pinch",
        prep: "Prep 1.5 hr",
        cook: "Cook 10 min",
        serves: "Serves 6",
        ingredients: [
            "3 cups flour + more for dusting",
            "1 egg",
            "¾ cup warm water · 1 tsp salt",
            "½ lb ground beef",
            "½ lb ground pork",
            "1 small onion, grated",
            "Salt · pepper · splash of cold water",
            "Butter, black pepper + smetana to serve",
        ],
        steps: [
            "Knead flour, egg, water, and salt into a smooth dough. Rest under a towel 30 minutes.",
            "Mix beef, pork, onion, salt, pepper, and a splash of cold water for the filling.",
            "Roll the dough thin, cut circles, and pinch a teaspoon of filling into each. Repeat roughly two hundred times.",
            "Boil in salted water until they float, then 3 more minutes. Freeze the rest on a floured tray.",
            "Serve with butter, black pepper, and smetana. Count how many you actually eat. Tell no one.",
        ],
    },
    {
        slug: "sirniki",
        title: "Sirniki",
        summary: "Golden farmer's-cheese pancakes. Breakfast, dessert, and an apology all at once.",
        description:
            "Farmer's-cheese pancakes, crisp outside, cloud inside. The only argument at the table is jam versus smetana.",
        photoCaption: "photo: sirniki",
        detailPhotoCaption: "photo: sirniki stack, close-up",
        prep: "Prep 15 min",
        cook: "Cook 20 min",
        serves: "Serves 4",
        ingredients: [
            "1 lb farmer’s cheese (tvorog)",
            "2 eggs",
            "3 tbsp sugar",
            "4 tbsp flour + more for shaping",
            "Pinch of salt · splash of vanilla",
            "Neutral oil or butter for frying",
            "Smetana + jam to serve",
        ],
        steps: [
            "Mash the cheese with eggs, sugar, salt, and vanilla until mostly smooth. Fold in the flour.",
            "With floured hands, shape into thick little pucks. Dust each side lightly with flour.",
            "Fry in a medium-hot pan, 3–4 minutes per side, until deeply golden. Do not rush the flip.",
            "Serve warm with smetana and jam. Accept the apology.",
        ],
    },
    {
        slug: "olivyea",
        title: "Olivyea",
        summary:
            "The New Year's salad. Potatoes, peas, pickles, mayonnaise — precision knife work required.",
        description:
            "The New Year's table centerpiece. Everything diced to the same tiny cube — the knife work is the recipe.",
        photoCaption: "photo: olivyea",
        detailPhotoCaption: "photo: olivyea, serving bowl",
        prep: "Prep 45 min",
        cook: "Cook 25 min",
        serves: "Serves 10",
        ingredients: [
            "4 potatoes, boiled in their skins",
            "3 carrots, boiled",
            "6 eggs, hard-boiled",
            "4 dill pickles",
            "1 can sweet peas, drained",
            "½ lb bologna or ham",
            "1 small onion, finely diced (optional)",
            "Mayonnaise · salt · pepper · dill",
        ],
        steps: [
            "Boil the potatoes and carrots until just tender; cool completely. Hard-boil the eggs.",
            "Peel everything. Dice potatoes, carrots, eggs, pickles, and bologna into identical small cubes. Identical.",
            "Fold in the peas and onion, then dress with mayonnaise until just bound — not drowned.",
            "Season, chill at least an hour, and top with dill. Serve at midnight or whenever it is midnight somewhere.",
        ],
    },
];

export function getRecipe(slug) {
    return recipes.find((r) => r.slug === slug);
}
