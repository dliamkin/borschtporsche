import { Link } from "react-router-dom";
import Nav from "../components/Nav.jsx";
import Footer from "../components/Footer.jsx";
import { recipes } from "../data/recipes.js";
import "../styles/recipes.css";

export default function Recipes() {
    return (
        <div className="page">
            <Nav />
            <main className="page-main page-wrap">
                <div className="recipes-header">
                    <h1 className="h1-gradient">Recipes</h1>
                    <p className="page-intro">
                        Mom's home cooking, released one dish at a time. The album pairs well with
                        soup.
                    </p>
                </div>
                <div className="recipes-grid">
                    {recipes.map((recipe) => (
                        <article className="recipe-card" key={recipe.slug}>
                            <div className="photo-placeholder recipe-card-photo">
                                <span>{recipe.photoCaption}</span>
                            </div>
                            <div className="recipe-card-body">
                                <h3 className="recipe-card-title">{recipe.title}</h3>
                                <p className="recipe-card-summary">{recipe.summary}</p>
                                <Link className="recipe-card-link" to={`/recipes/${recipe.slug}`}>
                                    View recipe →
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}
