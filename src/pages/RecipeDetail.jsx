import { Link, Navigate, useParams } from "react-router-dom";
import Nav from "../components/Nav.jsx";
import Footer from "../components/Footer.jsx";
import { getRecipe } from "../data/recipes.js";
import "../styles/recipe-detail.css";

export default function RecipeDetail() {
    const { slug } = useParams();
    const recipe = getRecipe(slug);

    if (!recipe) {
        return <Navigate to="/recipes" replace />;
    }

    return (
        <div className="page">
            <Nav />
            <main className="page-main page-wrap">
                <div className="detail-back">
                    <Link to="/recipes">← All recipes</Link>
                </div>

                <div className="detail-hero">
                    <div className="photo-placeholder detail-photo">
                        <span>{recipe.detailPhotoCaption}</span>
                    </div>
                    <div className="detail-hero-text">
                        <h1 className="h1-gradient detail-title">{recipe.title}</h1>
                        <p className="detail-description">{recipe.description}</p>
                        <div className="detail-meta">
                            <span>{recipe.prep}</span>
                            <span>{recipe.cook}</span>
                            <span>{recipe.serves}</span>
                        </div>
                    </div>
                </div>

                <div className="detail-body">
                    <div className="detail-ingredients">
                        <h3>Ingredients</h3>
                        <ul>
                            {recipe.ingredients.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="detail-steps">
                        <h3>Steps</h3>
                        {recipe.steps.map((step, i) => (
                            <div className="detail-step" key={i}>
                                <div className="detail-step-num">{i + 1}</div>
                                <p>{step}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
