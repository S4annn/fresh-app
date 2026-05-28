"""
Nutrition data service for ingredient information
"""
import json
from pathlib import Path
from typing import Dict, List, Optional

try:
    from settings import load_env_file
except ImportError:  # When imported as part of the AI package
    from ..settings import load_env_file


class NutritionService:
    """Service for handling nutrition data"""
    
    def __init__(self):
        self.nutrition_data = {}
        self.summary_data = {}
        self.data_loaded = False
        self._load_nutrition_data()
    
    def _load_nutrition_data(self):
        """Load nutrition data from JSON files"""
        try:
            # Paths to data files
            backend_dir = Path(__file__).parent.parent
            nutrition_file = backend_dir / "data" / "nutrition_data.json"
            summary_file = backend_dir / "data" / "nutrition_summary.json"
            
            # Load nutrition data
            if nutrition_file.exists():
                with open(nutrition_file, 'r', encoding='utf-8') as f:
                    self.nutrition_data = json.load(f)
                print(f"Loaded nutrition data: {len(self.nutrition_data)} ingredients")
            else:
                print(f"Nutrition data file not found: {nutrition_file}")
            
            # Load summary data
            if summary_file.exists():
                with open(summary_file, 'r', encoding='utf-8') as f:
                    self.summary_data = json.load(f)
                print(f"Loaded nutrition summary")
            
            self.data_loaded = True
            
        except Exception as e:
            print(f"Error loading nutrition data: {e}")
            self.data_loaded = False
    
    def get_nutrition_info(self, ingredient_name: str) -> Optional[Dict]:
        """
        Get nutrition information for a specific ingredient
        
        Args:
            ingredient_name: Name of the ingredient
            
        Returns:
            Dictionary with nutrition info or None if not found
        """
        if not self.data_loaded:
            return None
        
        # Normalize ingredient name for lookup
        normalized_name = ingredient_name.lower().strip()
        
        # Direct lookup
        if normalized_name in self.nutrition_data:
            return self.nutrition_data[normalized_name]
        
        # Fuzzy matching for common variations
        for key in self.nutrition_data.keys():
            if normalized_name in key or key in normalized_name:
                return self.nutrition_data[key]
        
        return None
    
    def get_multiple_nutrition_info(self, ingredient_names: List[str]) -> Dict[str, Dict]:
        """
        Get nutrition information for multiple ingredients
        
        Args:
            ingredient_names: List of ingredient names
            
        Returns:
            Dictionary mapping ingredient names to nutrition info
        """
        results = {}
        
        for ingredient in ingredient_names:
            nutrition_info = self.get_nutrition_info(ingredient)
            if nutrition_info:
                results[ingredient] = nutrition_info
            else:
                results[ingredient] = {
                    'error': 'Nutrition data not found',
                    'nama': ingredient,
                    'available': False
                }
        
        return results
    
    def search_ingredients(self, query: str, limit: int = 10) -> List[Dict]:
        """
        Search ingredients by name
        
        Args:
            query: Search query
            limit: Maximum number of results
            
        Returns:
            List of matching ingredients with nutrition info
        """
        if not self.data_loaded:
            return []
        
        query_lower = query.lower().strip()
        results = []
        
        for key, nutrition_info in self.nutrition_data.items():
            if query_lower in key or query_lower in nutrition_info['nama'].lower():
                results.append({
                    'key': key,
                    **nutrition_info
                })
                
                if len(results) >= limit:
                    break
        
        return results
    
    def get_nutrition_summary(self) -> Dict:
        """Get nutrition data summary statistics"""
        return self.summary_data if self.data_loaded else {}
    
    def get_all_ingredients(self) -> List[str]:
        """Get list of all available ingredients"""
        if not self.data_loaded:
            return []
        
        return [info['nama'] for info in self.nutrition_data.values()]
    
    def calculate_recipe_nutrition(self, ingredients: List[Dict]) -> Dict:
        """
        Calculate total nutrition for a recipe
        
        Args:
            ingredients: List of dicts with 'name' and 'amount_g' keys
            
        Returns:
            Dictionary with total nutrition values
        """
        if not self.data_loaded:
            return {'error': 'Nutrition data not available'}
        
        total_nutrition = {
            'total_kalori': 0,
            'total_protein': 0,
            'total_lemak': 0,
            'total_karbohidrat': 0,
            'total_serat': 0,
            'total_kalsium': 0,
            'ingredients_found': [],
            'ingredients_missing': []
        }
        
        for ingredient in ingredients:
            name = ingredient.get('name', '')
            amount_g = ingredient.get('amount_g', 100)  # Default 100g
            
            nutrition_info = self.get_nutrition_info(name)
            
            if nutrition_info:
                # Calculate proportional nutrition (data is per 100g)
                factor = amount_g / 100.0
                
                total_nutrition['total_kalori'] += nutrition_info['kalori_kcal'] * factor
                total_nutrition['total_protein'] += nutrition_info['protein_g'] * factor
                total_nutrition['total_lemak'] += nutrition_info['lemak_g'] * factor
                total_nutrition['total_karbohidrat'] += nutrition_info['karbohidrat_g'] * factor
                total_nutrition['total_serat'] += nutrition_info['serat_g'] * factor
                total_nutrition['total_kalsium'] += nutrition_info['kalsium_mg'] * factor
                
                total_nutrition['ingredients_found'].append({
                    'name': name,
                    'amount_g': amount_g,
                    'nutrition': nutrition_info
                })
            else:
                total_nutrition['ingredients_missing'].append(name)
        
        # Round values
        for key in ['total_kalori', 'total_protein', 'total_lemak', 'total_karbohidrat', 'total_serat', 'total_kalsium']:
            total_nutrition[key] = round(total_nutrition[key], 2)
        
        return total_nutrition


# Global instance
nutrition_service = NutritionService()