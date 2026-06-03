const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const MEALDB_API = 'https://www.themealdb.com/api/json/v1/1';

// random recept sa sastojcima (http://localhost:3000/api/random)
app.get('/api/random', async (req, res) => {
    try {
        const response = await axios.get(`${MEALDB_API}/random.php`);
        const meal = response.data.meals?.[0];
        
        if (!meal) {
            return res.status(404).json({ error: 'Nema recepta' });
        }
        
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
                ingredients.push(`${measure} ${ingredient}`.trim());
            }
        }
        
        res.json({
            id: meal.idMeal,
            name: meal.strMeal,
            category: meal.strCategory,
            instructions: meal.strInstructions,
            thumbnail: meal.strMealThumb,
            ingredients: ingredients
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// pretraga po imenu (GET sa vise recepata odvojeni zarezom (jako kul very fora :thumbsup:)) (http://localhost:3000/api/search?names=egg,rice,tomato itd.)
app.get('/api/search', async (req, res) => {
    const { names } = req.query;
    
    if (!names) {
        return res.status(400).json({ error: 'primjer: /api/search?names=pasta,chicken,rice' });
    }
    
    const nameList = names.split(',');
    const sviRecepti = [];
    
    try {
        for (const name of nameList) {
            const response = await axios.get(`${MEALDB_API}/search.php?s=${encodeURIComponent(name)}`);
            const meals = response.data.meals || [];
            
            for (const meal of meals) {
                const ingredients = [];
                for (let i = 1; i <= 20; i++) {
                    const ingredient = meal[`strIngredient${i}`];
                    const measure = meal[`strMeasure${i}`];
                    if (ingredient && ingredient.trim()) {
                        ingredients.push(`${measure} ${ingredient}`.trim());
                    }
                }
                
                sviRecepti.push({
                    id: meal.idMeal,
                    name: meal.strMeal,
                    category: meal.strCategory,
                    instructions: meal.strInstructions,
                    thumbnail: meal.strMealThumb,
                    ingredients: ingredients
                });
            }
            
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        res.json(sviRecepti);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server na http://localhost:${PORT}`);
});